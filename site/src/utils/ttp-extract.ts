/**
 * Heuristic TTP extraction. Maps event metadata + free-text summaries
 * into a Set of MITRE ATT&CK T-codes. Used by the attribution engine
 * as one feature family.
 *
 * The mapping is intentionally conservative — most events emit 1–4
 * TTPs. The actor-side TTP profile (from MITRE ATT&CK Groups) is
 * the precision side; this is the recall side that lets event features
 * meet actor profiles in TTP space.
 */
import type { AuspexEvent } from './atlas';

/** initial_vector field → MITRE technique ids. */
const VECTOR_TTPS: Record<string, string[]> = {
  phishing: ['T1566'],
  'spear-phishing': ['T1566.001'],
  'n-day': ['T1190'],          // Exploit Public-Facing Application
  '0-day': ['T1190', 'T1203'], // 0-day + client exec
  'supply-chain': ['T1195'],
  'valid-creds': ['T1078'],
  insider: ['T1078'],
  physical: ['T1200'],
};

/** incident_type tags → MITRE technique ids. */
const INCIDENT_TTPS: Record<string, string[]> = {
  ransomware: ['T1486'],
  wiper: ['T1485', 'T1561'],
  destructive: ['T1485', 'T1561'],
  'pre-positioning': ['T1133', 'T1505'],
  'data-theft': ['T1567'],
  'financial-theft': ['T1486'],
  'influence-operation': ['T1583', 'T1585'],
  'supply-chain': ['T1195'],
  disruption: ['T1499'],
};

/**
 * Free-text keyword regexes → MITRE technique ids. Run against
 * event.summary + event.outcome_summary lowercased.
 */
const KEYWORD_TTPS: Array<{ rx: RegExp; ttps: string[] }> = [
  // Living-off-the-land + Windows-built-in abuse
  { rx: /\bliving[- ]off[- ]the[- ]land\b/i, ttps: ['T1218', 'T1059.001', 'T1059.003'] },
  { rx: /\bpowershell\b/i, ttps: ['T1059.001'] },
  { rx: /\bcmd\.exe\b/i, ttps: ['T1059.003'] },
  { rx: /\bwmi\b/i, ttps: ['T1047'] },
  { rx: /\bschtasks?\b|\bscheduled task\b/i, ttps: ['T1053.005'] },
  // C2 frameworks
  { rx: /\bcobalt strike\b/i, ttps: ['T1059', 'T1071'] },
  { rx: /\bsliver\b/i, ttps: ['T1071'] },
  { rx: /\bmetasploit\b/i, ttps: ['T1059'] },
  // Malware families that strongly signal a cluster
  { rx: /\bplugx\b/i, ttps: ['T1071', 'T1574.002'] },
  { rx: /\bshadowpad\b/i, ttps: ['T1574'] },
  { rx: /\bhikit\b/i, ttps: ['T1014'] },
  { rx: /\bmimikatz\b/i, ttps: ['T1003.001'] },
  { rx: /\bmagicrat\b/i, ttps: ['T1071'] },
  { rx: /\bappleseed\b/i, ttps: ['T1059'] },
  { rx: /\bbeagleboyz\b/i, ttps: ['T1486'] },
  { rx: /\bapplejeus\b/i, ttps: ['T1195', 'T1059'] },
  { rx: /\bgootloader\b/i, ttps: ['T1189'] },
  { rx: /\bicedid\b/i, ttps: ['T1566'] },
  { rx: /\bqakbot\b|\bqbot\b/i, ttps: ['T1566'] },
  { rx: /\bemotet\b/i, ttps: ['T1566'] },
  { rx: /\btricbot\b|\btrickbot\b/i, ttps: ['T1566'] },
  { rx: /\bsnake malware\b|\bsnake implant\b|\b\bturla snake\b/i, ttps: ['T1014'] },
  // Initial access / kill chain
  { rx: /\bspear[- ]phish/i, ttps: ['T1566.001'] },
  { rx: /\bwatering hole\b/i, ttps: ['T1189'] },
  { rx: /\bdrive[- ]by\b/i, ttps: ['T1189'] },
  { rx: /\bweb shell\b/i, ttps: ['T1505.003'] },
  { rx: /\bdll side[- ]load(ing)?\b/i, ttps: ['T1574.002'] },
  { rx: /\bproxyshell\b|\bproxylogon\b/i, ttps: ['T1190'] },
  { rx: /\beternalblue\b/i, ttps: ['T1210'] },
  { rx: /\blog4shell\b|\blog4j\b/i, ttps: ['T1190'] },
  { rx: /\bzero[- ]day\b/i, ttps: ['T1190', 'T1203'] },
  { rx: /\bvalid credentials?\b|\bvalid creds?\b/i, ttps: ['T1078'] },
  { rx: /\bcredential dumping\b|\blsass dump/i, ttps: ['T1003'] },
  { rx: /\bpass[- ]the[- ]hash\b/i, ttps: ['T1550.002'] },
  // Persistence / lateral
  { rx: /\blateral movement\b/i, ttps: ['T1021'] },
  { rx: /\bremote desktop\b|\brdp\b/i, ttps: ['T1021.001'] },
  { rx: /\bsmb\b/i, ttps: ['T1021.002'] },
  { rx: /\bbloodhound\b/i, ttps: ['T1087'] },
  // Exfil / staging
  { rx: /\bdata exfil\b|\bexfiltration\b/i, ttps: ['T1041', 'T1567'] },
  { rx: /\brclone\b/i, ttps: ['T1567.002'] },
  { rx: /\bmega\.nz\b/i, ttps: ['T1567.002'] },
  // ICS / OT
  { rx: /\bplc\b|\bsiemens s7\b|\bmodbus\b/i, ttps: ['T0883'] },
  // Defense evasion
  { rx: /\bobfuscat/i, ttps: ['T1027'] },
  { rx: /\bsigned (binary|driver)\b/i, ttps: ['T1553.002'] },
  { rx: /\bbring your own (vulnerable )?driver\b/i, ttps: ['T1014'] },
  // Crypto
  { rx: /\bbridge drain\b|\bbridge exploit\b/i, ttps: ['T1485', 'T1559'] },
  { rx: /\bsmart contract\b/i, ttps: ['T1059'] },
];

/** Build the inferred TTP set for an event. */
export function inferEventTTPs(event: AuspexEvent): Set<string> {
  const out = new Set<string>();
  if (event.initial_vector && VECTOR_TTPS[event.initial_vector]) {
    for (const t of VECTOR_TTPS[event.initial_vector]) out.add(t);
  }
  for (const it of event.incident_type ?? []) {
    const ts = INCIDENT_TTPS[it];
    if (ts) for (const t of ts) out.add(t);
  }
  const text = `${event.summary ?? ''}\n${event.outcome_summary ?? ''}`;
  for (const { rx, ttps } of KEYWORD_TTPS) {
    if (rx.test(text)) for (const t of ttps) out.add(t);
  }
  return out;
}

/**
 * Strip a technique id to its parent T-code (e.g., T1566.001 → T1566).
 * Useful when matching loose event-side extractions against MITRE
 * groups whose actor profiles include sub-technique ids.
 */
export function parentTechnique(t: string): string {
  const i = t.indexOf('.');
  return i < 0 ? t : t.slice(0, i);
}
