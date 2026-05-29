/**
 * Latent / inferred campaign clustering.
 *
 * Algorithmic complement to the editorial `campaign_id` field. Where
 * the editorial tag captures campaigns that public reporting explicitly
 * links, this module discovers softer clusters via temporal proximity
 * + named-target overlap + malware-family / lineage overlap + TTP
 * overlap. The discovered cluster id is exposed as a feature so the
 * engines can propagate actor/doctrine/pillar labels across
 * structurally-similar but editorially-untagged events.
 *
 * Important: actor labels are *not* used in clustering. Doctrine and
 * pillar labels are also not used. Otherwise the LOO eval would leak.
 *
 * Events with an explicit `campaign_id` are skipped — they're already
 * served by the editorial `campaigns` feature family.
 */
import type { Atlas } from './atlas-core';
import { inferEventTTPs, parentTechnique } from './ttp-extract';
import { inferEventMalware } from './malware-extract';

const WINDOW_DAYS = 180;
const MIN_CLUSTER_SIZE = 3;
/** Any malware or TTP appearing in more than this fraction of corpus
 *  events is treated as commodity (public domain / red-team / shared
 *  ecosystem) and excluded from edge-formation. Tuned tight (8%) so
 *  that broadly-used techniques like T1003/T1021/T1078/T1059/T1190
 *  don't end up bridging unrelated actors via the "destructive ops"
 *  or "credential-dump-and-pivot" TTP shape that crosses clusters. */
const COMMODITY_DF_THRESHOLD = 0.08;
/** Hardcoded blocklist of well-known commodity tools that should
 *  never form an inferred-campaign edge regardless of their corpus
 *  frequency. Public-domain red-team utilities, living-off-the-land
 *  binaries, and broadly-licensed C2 frameworks. Lowercase, matched
 *  against canonical malware/tool names. */
const COMMODITY_TOOLS = new Set<string>([
  'mimikatz',
  'cobalt strike',
  'cobaltstrike',
  'metasploit',
  'meterpreter',
  'bloodhound',
  'sharphound',
  'psexec',
  'procdump',
  'netcat',
  'nbtscan',
  'rclone',
  'anydesk',
  'teamviewer',
  'ngrok',
  'chisel',
  'sliver',
  'brute ratel',
  'havoc',
  'mythic',
  'powershell empire',
  'empire',
  'powersploit',
  'impacket',
  'plink',
  'putty',
  'rdpwrap',
  'advanced ip scanner',
  'advanced port scanner',
  'softperfect network scanner',
  '7zip',
  'winrar',
  'lazagne',
  'masscan',
]);

interface EventSig {
  id: string;
  ms: number;
  targets: Set<string>;
  malware: Set<string>;
  lineages: Set<string>;
  ttps: Set<string>;
}

class UnionFind {
  parent = new Map<string, string>();
  find(x: string): string {
    let r = this.parent.get(x) ?? x;
    if (r === x) return x;
    r = this.find(r);
    this.parent.set(x, r);
    return r;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra, rb);
  }
}

export function inferCampaigns(atlas: Atlas): Map<string, string> {
  const out = new Map<string, string>();

  // First pass — extract signals + compute document frequency for
  // malware and TTPs over the FULL corpus (including events with
  // editorial campaign_id, since we want the DF of common tools to be
  // accurate regardless of which events end up clusterable).
  const allSigs: EventSig[] = [];
  const malwareDF = new Map<string, number>();
  const ttpDF = new Map<string, number>();
  for (const ev of atlas.events.values()) {
    const dateStr = ev.start_date ?? ev.disclosure_date;
    if (!dateStr) continue;
    const ms = Date.parse(dateStr);
    if (!Number.isFinite(ms)) continue;
    const targets = new Set<string>();
    for (const t of ev.targets ?? []) {
      if (!t.target_id) continue;
      if (t.target_id.startsWith('orgs/') || t.target_id.startsWith('infra/')) targets.add(t.target_id);
    }
    const malware = new Set<string>();
    const lineages = new Set<string>();
    for (const m of inferEventMalware(ev, atlas)) {
      const ml = m.toLowerCase();
      malware.add(ml);
      const lg = atlas.malwareLineageGroup.get(ml);
      if (lg) lineages.add(lg);
    }
    const ttps = new Set<string>();
    for (const t of inferEventTTPs(ev)) ttps.add(parentTechnique(t));
    for (const m of malware) malwareDF.set(m, (malwareDF.get(m) ?? 0) + 1);
    for (const t of ttps) ttpDF.set(t, (ttpDF.get(t) ?? 0) + 1);
    allSigs.push({ id: ev.id, ms, targets, malware, lineages, ttps });
  }

  // Build commodity-tool sets from DF threshold + hardcoded blocklist.
  const N = allSigs.length;
  const dfCutoff = COMMODITY_DF_THRESHOLD * N;
  const commodityMalware = new Set<string>(COMMODITY_TOOLS);
  for (const [m, df] of malwareDF) if (df > dfCutoff) commodityMalware.add(m);
  const commodityTTPs = new Set<string>();
  for (const [t, df] of ttpDF) if (df > dfCutoff) commodityTTPs.add(t);

  // Strip commodity signals from each event's signature, AND drop
  // events with explicit editorial campaign_id from the clustering
  // pool (they're already served by the editorial feature family).
  const editorialIds = new Set<string>();
  for (const ev of atlas.events.values()) if (ev.campaign_id) editorialIds.add(ev.id);
  const sigs: EventSig[] = [];
  for (const s of allSigs) {
    if (editorialIds.has(s.id)) continue;
    const malware = new Set<string>();
    for (const m of s.malware) if (!commodityMalware.has(m)) malware.add(m);
    const ttps = new Set<string>();
    for (const t of s.ttps) if (!commodityTTPs.has(t)) ttps.add(t);
    sigs.push({ ...s, malware, ttps });
  }

  // Sort by date, sweep with a sliding window. O(N * window-density)
  // instead of O(N²). With WINDOW_DAYS=180 and ~600 events spread over
  // 20 years, typical window holds ~15 events.
  sigs.sort((a, b) => a.ms - b.ms);
  const uf = new UnionFind();
  const windowMs = WINDOW_DAYS * 86400000;
  for (let i = 0; i < sigs.length; i++) {
    const a = sigs[i];
    for (let j = i + 1; j < sigs.length; j++) {
      const b = sigs[j];
      if (b.ms - a.ms > windowMs) break;
      if (!edge(a, b)) continue;
      uf.union(a.id, b.id);
    }
  }

  // Collect cluster sizes
  const clusters = new Map<string, string[]>();
  for (const s of sigs) {
    const root = uf.find(s.id);
    let list = clusters.get(root);
    if (!list) { list = []; clusters.set(root, list); }
    list.push(s.id);
  }
  let n = 0;
  for (const list of clusters.values()) {
    if (list.length < MIN_CLUSTER_SIZE) continue;
    n++;
    const cid = `inferred-c${n}`;
    for (const id of list) out.set(id, cid);
  }
  return out;
}

function edge(a: EventSig, b: EventSig): boolean {
  // Shared named target — strongest non-actor signal.
  for (const t of a.targets) if (b.targets.has(t)) return true;
  // Shared rare malware family (commodity tools already stripped).
  for (const m of a.malware) if (b.malware.has(m)) return true;
  // Same malware lineage group (Trickbot↔Conti, IcedID↔Latrodectus, etc.).
  for (const lg of a.lineages) if (b.lineages.has(lg)) return true;
  // TTP-only edges are not used — even after commodity-stripping, TTP
  // overlap tracks operational *style* (destructive ops, credential
  // pivot) rather than *attribution*, so it bridges unrelated actors.
  return false;
}
