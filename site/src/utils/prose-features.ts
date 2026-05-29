/**
 * Semantic prose features via TF-IDF.
 *
 * The Bayesian engines currently read event prose through a keyword
 * extractor (TTPs, malware names) and throw the rest away. That
 * discards the actual analyst signal — how operations are described,
 * what's noted as significant, what's compared to what.
 *
 * This module gives each event a top-K most-distinctive-terms feature
 * set, computed by TF-IDF over the corpus of event summaries +
 * outcome summaries. Distinctive prose terms become features that
 * other events sharing those terms can match against — approximating
 * the "this event is described in the same vocabulary as that one"
 * signal that human analysts use intuitively.
 *
 * Approach:
 *  1. Tokenize event.summary + event.outcome_summary (lowercase,
 *     punctuation-strip, length >= 3, stopword + year filter)
 *  2. Build corpus document-frequency map (cached per atlas size)
 *  3. For each event, compute TF-IDF per term, return top-K
 *
 * Weight in scoring: low (~0.4) — these are noisy relative to
 * structured features but contribute orthogonal information.
 */
import type { Atlas, AuspexEvent } from './atlas-core';

// Stopwords: standard English + cybersecurity-overcommon terms that
// would otherwise dominate TF-IDF distinctiveness if not pruned.
const STOPWORDS = new Set<string>([
  // English
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'has', 'had',
  'was', 'were', 'are', 'will', 'been', 'being', 'its', 'their', 'them', 'they',
  'his', 'her', 'who', 'whom', 'which', 'what', 'when', 'where', 'how', 'why',
  'but', 'not', 'all', 'any', 'some', 'one', 'two', 'three', 'into', 'over',
  'than', 'then', 'there', 'these', 'those', 'such', 'also', 'only', 'just',
  'including', 'against', 'between', 'across', 'within', 'about', 'after',
  'before', 'during', 'while', 'through', 'around', 'under', 'above', 'because',
  'most', 'more', 'less', 'many', 'much', 'each', 'other', 'another', 'same',
  'still', 'already', 'never', 'always', 'often', 'sometimes', 'whether', 'either',
  'both', 'neither', 'nor', 'though', 'although', 'however', 'thus', 'hence',
  'therefore', 'though', 'whose', 'where', 'whether',
  // Cybersecurity-overcommon (would otherwise dominate; semantically empty)
  'attack', 'attacks', 'attacking', 'attacker', 'attackers', 'attacked',
  'malware', 'malicious', 'threat', 'threats', 'threatactor',
  'actor', 'actors', 'group', 'groups', 'cluster', 'clusters',
  'campaign', 'campaigns', 'operation', 'operations', 'operator', 'operators',
  'target', 'targets', 'targeting', 'targeted', 'victim', 'victims',
  'incident', 'incidents', 'event', 'events',
  'use', 'used', 'using', 'uses', 'usage',
  'via', 'per', 'plus', 'minus', 'also',
  'cyber', 'cybersecurity', 'security',
  'analysis', 'analyst', 'analytical', 'report', 'reported', 'reporting', 'reports',
  'access', 'accessed', 'accessing',
  'data', 'information',
  'company', 'companies', 'firm', 'firms', 'organization', 'organizations',
  // AUSPEX-meta
  'auspex', 'atlas', 'event', 'doctrine', 'pillar', 'cluster',
  // Months / time markers
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december',
  // Misc
  'note', 'notes', 'noted',
]);

function tokenize(text: string): string[] {
  if (!text) return [];
  const out: string[] = [];
  // Replace punctuation with spaces, lowercase, split
  const cleaned = text.toLowerCase().replace(/[^a-z0-9\s\-/]/g, ' ');
  for (const raw of cleaned.split(/\s+/)) {
    if (raw.length < 3) continue;
    // Strip leading/trailing hyphens
    const tok = raw.replace(/^-+|-+$/g, '');
    if (tok.length < 3) continue;
    if (STOPWORDS.has(tok)) continue;
    // Drop pure-numeric and year-like tokens (we have year feature)
    if (/^\d+$/.test(tok)) continue;
    if (/^(19|20)\d{2}$/.test(tok)) continue;
    // Drop 4-letter+ tokens that look like file paths or IDs
    if (tok.length > 30) continue;
    out.push(tok);
  }
  return out;
}

function eventProseTokens(event: AuspexEvent): string[] {
  const parts: string[] = [];
  if (event.summary) parts.push(event.summary);
  if (event.outcome_summary) parts.push(event.outcome_summary);
  if (parts.length === 0) return [];
  return tokenize(parts.join(' '));
}

// Module-level cache for corpus DF. Recomputed when atlas size changes
// (e.g., LOO eval flips through different training sets — but the
// per-iteration DF change for 1 event out of 507 is sub-percent, not
// worth invalidating the cache).
let _cachedDF: Map<string, number> | null = null;
let _cachedDFAtlasSize: number = -1;
let _cachedCorpusSize: number = 0;

function buildCorpusDF(atlas: Atlas): { df: Map<string, number>; N: number } {
  if (_cachedDF && _cachedDFAtlasSize === atlas.events.size) {
    return { df: _cachedDF, N: _cachedCorpusSize };
  }
  const df = new Map<string, number>();
  let N = 0;
  for (const ev of atlas.events.values()) {
    const toks = eventProseTokens(ev);
    if (toks.length === 0) continue;
    N++;
    const seen = new Set<string>();
    for (const t of toks) {
      if (seen.has(t)) continue;
      seen.add(t);
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }
  _cachedDF = df;
  _cachedDFAtlasSize = atlas.events.size;
  _cachedCorpusSize = N;
  return { df, N };
}

/**
 * Top-K most-distinctive terms in this event's prose by TF-IDF over
 * the corpus. Returns the term tokens (lowercase) as a Set.
 *
 * K=15 by default — captures the strongest signal without polluting
 * with low-information terms.
 */
export function extractProseTerms(event: AuspexEvent, atlas: Atlas, K = 15): Set<string> {
  const tokens = eventProseTokens(event);
  if (tokens.length === 0) return new Set();
  const { df, N } = buildCorpusDF(atlas);

  // Term frequency for this event.
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  // Compute TF-IDF and prune to terms seen in at least 2 documents
  // (so single-event hapaxes don't dominate the top-K with random words).
  const scored: Array<{ term: string; score: number }> = [];
  for (const [term, tfCount] of tf) {
    const dfCount = df.get(term) ?? 0;
    if (dfCount < 2) continue;
    if (dfCount > N * 0.5) continue; // also drop hyper-common terms (in > 50% of corpus)
    const idf = Math.log(N / dfCount);
    scored.push({ term, score: tfCount * idf });
  }
  scored.sort((a, b) => b.score - a.score);
  return new Set(scored.slice(0, K).map((x) => x.term));
}
