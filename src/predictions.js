// AstraLoom Predictions V1.1 — deterministic, explainable quarterly engine.
// Math-first: consumes kp.js significations + dasha.js chains. No AI here.
// V1 base is frozen; V1.1 adds an optional KP trigger gate (transits).
// When no transit T is supplied every number is bit-identical to V1.
//
// Hierarchy (from locked spec):
//   planetVector  = 0.20*Planet + 0.40*Nak + 0.40*Sub        (per dasha lord)
//   dashaVector   = 0.35*MD + 0.30*AD + 0.22*PD + 0.13*SD     (per house h=1..12)
//   RawDirection  = 0.30*P + 0.45*D + 0.15*(C*2) + 0.10*R     (C is -50..50, x2 normalises to -100..100)
//   R             = 100*raw/(raw+30) soft-cap over domain-relevant houses only,
//                   so repetition discriminates instead of saturating at 100.
//   Direction     = clamp(RawDirection, -100, +100)
//   Intensity     = 0..100 (activation magnitude, direction-agnostic)
//   Confidence    = agreement among N,MD,AD,PD,SD
//
// House polarity is domain-relative (6 good for Litigation, adverse for Health, etc).
// 8/12 are never scored in isolation — combinations decide polarity.

import { chainAt } from './dasha.js';

export const WEIGHTS = {
  planet: 0.20, nak: 0.40, sub: 0.40,
  md: 0.35, ad: 0.30, pd: 0.22, sd: 0.13,
  natal: 0.30, dasha: 0.45, combo: 0.15, repetition: 0.10,
  transitGate: 0.15,
};

// Anchor cusp(s) per domain + house sets. Secondary counts half.
// Dual anchors (spec section 5) average their CSL promise vectors.
export const DOMAINS = {
  education: {
    label: 'Education', anchor: [4, 9],
    primary: [4, 5, 9, 11], secondary: [2, 3], challenging: [8, 12],
    combos: [
      { houses: [4, 9, 11], score: 25, label: 'strong study/fortune combination' },
      { houses: [4, 5, 11], score: 20, label: 'admission/performance pattern' },
      { houses: [8, 12], score: -20, label: 'interruption pattern without 4/9/11' },
    ],
  },
  career: {
    label: 'Career', anchor: [10],
    primary: [2, 6, 10, 11], secondary: [1, 7], challenging: [8, 12],
    combos: [
      { houses: [2, 6, 10, 11], score: 30, label: 'strong career success' },
      { houses: [6, 10, 11], score: 25, label: 'employment/professional advancement' },
      { houses: [2, 7, 10, 11], score: 25, label: 'business success pattern' },
      { houses: [5, 10, 11], score: 18, label: 'creative/investment/strategic profession' },
      { houses: [10, 12], score: 0, label: 'career separation/foreign/private context', context: true },
      { houses: [8, 10, 12], score: -25, label: 'career disruption pattern' },
    ],
  },
  relationships: {
    label: 'Relationships', anchor: [7],
    primary: [2, 5, 7, 11], secondary: [4], challenging: [1, 6, 10, 12],
    combos: [
      { houses: [2, 7, 11], score: 28, label: 'union/marriage pattern' },
      { houses: [5, 7, 11], score: 20, label: 'romance/partnership harmony' },
      { houses: [1, 6, 10], score: -22, label: 'separation pressure' },
      { houses: [6, 8, 12], score: -28, label: 'severe conflict/separation pattern' },
    ],
  },
  wealth: {
    label: 'Wealth', anchor: [2, 11],
    primary: [2, 5, 9, 11], secondary: [7, 10], challenging: [6, 8, 12],
    combos: [
      { houses: [2, 5, 11], score: 25, label: 'investment/speculative gains' },
      { houses: [2, 9, 11], score: 25, label: 'wealth/fortune accumulation' },
      { houses: [2, 8, 12], score: -25, label: 'erosion/forced outflow pattern' },
    ],
  },
  health: {
    label: 'Health & Wellbeing', anchor: [1, 6],
    primary: [1, 5, 11], secondary: [3], challenging: [6, 8, 12],
    combos: [
      { houses: [1, 5, 11], score: 22, label: 'vitality/support pattern' },
      { houses: [6, 8, 12], score: -28, label: 'medical pressure pattern' },
      { houses: [6, 11], score: 0, label: 'recovery-through-treatment context', context: true },
    ],
  },
  litigation: {
    label: 'Litigation', anchor: [6],
    primary: [6, 11], secondary: [3, 7], challenging: [8, 12],
    combos: [
      { houses: [6, 11], score: 28, label: 'competitive victory pattern' },
      { houses: [3, 6, 11], score: 22, label: 'favourable documents/proceedings' },
      { houses: [6, 8, 12], score: -25, label: 'adverse legal consequences' },
    ],
  },
};

export const DOMAIN_KEYS = Object.keys(DOMAINS);

// Subcategory overrides: same engine, narrower house focus (spec section 7).
// Secondary/challenging houses stay domain-level; only the primary lens narrows.
export const SUBCATEGORIES = {
  education: {
    admission: { primary: [4, 9, 11] },
    performance: { primary: [4, 5, 11] },
    higher: { primary: [5, 9, 11] },
    research: { primary: [5, 8, 9] },
    completion: { primary: [4, 11] },
    interruption: { primary: [4, 8, 12] },
  },
  career: {
    employment: { primary: [6, 10, 11] },
    promotion: { primary: [2, 6, 10, 11] },
    entrepreneurship: { primary: [2, 7, 10, 11] },
    opportunity: { primary: [6, 10, 11] },
    jobloss: { primary: [8, 10, 12] },
    foreign: { primary: [10, 11, 12] },
  },
  relationships: {
    new: { primary: [5, 7, 11] },
    marriage: { primary: [2, 7, 11] },
    harmony: { primary: [2, 5, 7, 11] },
    separation: { primary: [1, 6, 10] },
    divorce: { primary: [6, 8, 12] },
  },
  wealth: {
    income: { primary: [2, 6, 11] },
    accumulation: { primary: [2, 9, 11] },
    investments: { primary: [2, 5, 11] },
    speculation: { primary: [5, 6, 11] },
    property: { primary: [2, 4, 11] },
    debtloss: { primary: [6, 8, 12] },
  },
  health: {
    vitality: { primary: [1, 5, 11] },
    illness: { primary: [6, 11] },
    hospitalization: { primary: [6, 12] },
    injury: { primary: [8, 12] },
    emotional: { primary: [1, 8, 12] },
  },
  litigation: {
    disputes: { primary: [6, 7] },
    initiation: { primary: [3, 6] },
    favorable: { primary: [6, 11] },
    adverse: { primary: [8, 12] },
    confinement: { primary: [12] },
    settlement: { primary: [2, 7, 11] },
  },
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// KP trigger gate: transits amplify or dampen but never reverse the base.
// |change| <= k*100 (15 by default). DirBase==0 allows a small ±15 lean.
export function applyGate(dirBase, T, k = WEIGHTS.transitGate) {
  if (T == null || !Number.isFinite(T)) return { direction: clamp(Math.round(dirBase), -100, 100), gateFactor: 1 };
  const t = clamp(T, -100, 100);
  if (dirBase === 0) return { direction: clamp(Math.round(0.15 * t), -15, 15), gateFactor: 1 };
  if (t === 0) return { direction: clamp(Math.round(dirBase), -100, 100), gateFactor: 1 };
  const same = Math.sign(t) === Math.sign(dirBase);
  const factor = same ? 1 + k * Math.abs(t) / 100 : 1 - k * Math.abs(t) / 100;
  return { direction: clamp(Math.round(dirBase * factor), -100, 100), gateFactor: factor };
}

export function sigMap(significations) {
  return Object.fromEntries(significations.map((r) => [r.name, r]));
}

// Weighted house vector for one planet: 0.20 planet + 0.40 star + 0.40 sub.
// Each of planet/starHouses/subHouses is occupation+ownership (basic set).
export function planetHouseVector(row) {
  const vec = {};
  const add = (houses, w) => {
    for (const h of houses || []) vec[h] = (vec[h] || 0) + w;
  };
  add(row.planet, WEIGHTS.planet);
  add(row.starHouses, WEIGHTS.nak);
  add(row.subHouses, WEIGHTS.sub);
  return vec;
}

// Score a house vector against a domain: support vs challenge, normalised.
export function scoreVectorAgainstDomain(vec, domainKey, subcategory) {
  const d = DOMAINS[domainKey];
  if (!d) throw new Error(`Unknown domain: ${domainKey}`);
  const sub = subcategory && SUBCATEGORIES[domainKey]?.[subcategory];
  const primary = sub?.primary || d.primary;
  const maxSupport = primary.length + 0.5 * d.secondary.length;
  const maxChallenge = d.challenging.length || 1;
  let support = 0, challenge = 0;
  for (const h of primary) support += vec[h] || 0;
  for (const h of d.secondary) support += 0.5 * (vec[h] || 0);
  for (const h of d.challenging) challenge += vec[h] || 0;
  const supportNorm = maxSupport ? support / maxSupport : 0;
  const challengeNorm = challenge / maxChallenge;
  return { direction: 100 * (supportNorm - challengeNorm), support, challenge, supportNorm, challengeNorm };
}

export function dashaActivationVector(lords, byName) {
  const parts = [
    [lords[0], WEIGHTS.md], [lords[1], WEIGHTS.ad], [lords[2], WEIGHTS.pd], [lords[3], WEIGHTS.sd],
  ];
  const vec = {};
  for (const [lord, w] of parts) {
    const row = byName[lord];
    if (!row) throw new Error(`Unknown dasha lord: ${lord}`);
    const pv = planetHouseVector(row);
    for (const [h, v] of Object.entries(pv)) vec[h] = (vec[h] || 0) + w * v;
  }
  return vec;
}

export function natalPromiseVector(cslRow) {
  return planetHouseVector(cslRow);
}

function cuspByNumber(cusps, n) {
  return cusps.find((c) => c.house === n);
}

// Combination detection on an activation vector (threshold 0.15).
export function combinationScore(activation, domainKey) {
  const d = DOMAINS[domainKey];
  let total = 0;
  const hits = [];
  for (const c of d.combos) {
    if (c.context) continue;
    const active = c.houses.every((h) => (activation[h] || 0) >= 0.15);
    // Negative disruption combos require absence of rescue houses where noted.
    if (active) {
      total += c.score;
      hits.push(c);
    }
  }
  // Contextual 10+12 / 6+11 style combos: reported, not scored.
  const contexts = d.combos.filter((c) => c.context && c.houses.every((h) => (activation[h] || 0) >= 0.15));
  return { total: clamp(total, -50, 50), hits, contexts };
}

// Repetition: cross-dasha presence + intra-planet Planet/Nak/Sub repeats.
// Counts only domain-relevant houses (primary + secondary + challenging),
// otherwise every chart saturates and repetition stops discriminating.
// Soft-cap R = 100*raw/(raw+30): bounded, no hard-cap cliff.
export function repetitionBonus(lords, byName, domainKey, subcategory) {
  const d = DOMAINS[domainKey];
  if (!d) throw new Error(`Unknown domain: ${domainKey}`);
  const sub = subcategory && SUBCATEGORIES[domainKey]?.[subcategory];
  const relevant = new Set([...(sub?.primary || d.primary), ...d.secondary, ...d.challenging]);
  const present = (lord, h) => {
    const pv = planetHouseVector(byName[lord]);
    return (pv[h] || 0) > 0.05;
  };
  let raw = 0;
  const notes = [];
  for (const h of relevant) {
    const count = lords.filter((l) => present(l, h)).length;
    if (count >= 4) { raw += 20; notes.push(`house ${h} in MD+AD+PD+SD +20`); }
    else if (count === 3) { raw += 12; notes.push(`house ${h} in three dasha levels +12`); }
    else if (count === 2 && lords.slice(0, 2).every((l) => present(l, h))) { raw += 5; notes.push(`house ${h} in MD+AD +5`); }
  }
  for (const lord of lords) {
    const row = byName[lord];
    const inPlanet = new Set((row.planet || []).filter((h) => relevant.has(h)));
    const inStar = new Set((row.starHouses || []).filter((h) => relevant.has(h)));
    const inSub = new Set((row.subHouses || []).filter((h) => relevant.has(h)));
    const all = new Set([...inPlanet, ...inStar, ...inSub]);
    for (const h of all) {
      const n = (inPlanet.has(h) ? 1 : 0) + (inStar.has(h) ? 1 : 0) + (inSub.has(h) ? 1 : 0);
      if (n === 3) { raw += 10; notes.push(`${lord}: house ${h} in Planet+Nak+Sub +10`); }
      else if (n === 2) { raw += 5; notes.push(`${lord}: house ${h} repeated twice +5`); }
    }
  }
  return { raw, scaled: (100 * raw) / (raw + 30), notes };
}

// Cusp activation: running lords tied to the domain's primary anchor CSL.
export function cuspBonus(lords, cusps, byName, domainKey) {
  const d = DOMAINS[domainKey];
  const primaryAnchor = d.anchor[0];
  const cusp = cuspByNumber(cusps, primaryAnchor);
  if (!cusp) return { bonus: 0, notes: [] };
  const cslName = cusp.sub;
  const cslRow = byName[cslName];
  let bonus = 0;
  const notes = [];
  const levels = ['MD', 'AD', 'PD', 'SD'];
  lords.forEach((lord, i) => {
    if (lord === cslName) { bonus += 15; notes.push(`${lord} ${levels[i]} is the ${primaryAnchor}th CSL +15`); }
    else if (cslRow && lord === cslRow.star) { bonus += 10; notes.push(`${lord} ${levels[i]} is star lord of ${primaryAnchor}th CSL +10`); }
    else if (cslRow && lord === cslRow.sub) { bonus += 10; notes.push(`${lord} ${levels[i]} is sub lord of ${primaryAnchor}th CSL +10`); }
    else if (byName[lord] && (byName[lord].allHouses || byName[lord].carrierHouses || []).includes(primaryAnchor)) {
      bonus += 5; notes.push(`${lord} ${levels[i]} signifies cusp ${primaryAnchor} +5`);
    }
  });
  return { bonus: Math.min(30, bonus), notes, cslName };
}

// Score one instant (one MD/AD/PD/SD chain) for one domain.
// P averages the promise vectors of all anchor CSLs (linear: mean of vectors,
// then scored — identical to the mean of per-anchor scores).
export function scoreInstant({ significations, cusps, lords, domainKey, subcategory, transitT = null, transitReasons = [] }) {
  const byName = sigMap(significations);
  const d = DOMAINS[domainKey];
  const cslNames = d.anchor.map((n) => cuspByNumber(cusps, n)?.sub);
  if (cslNames.some((n) => !byName[n])) throw new Error(`Anchor CSL planet missing for cusp ${d.anchor.join('/')}`);
  const natalVec = {};
  for (const n of cslNames) {
    const pv = natalPromiseVector(byName[n]);
    for (const [h, v] of Object.entries(pv)) natalVec[h] = (natalVec[h] || 0) + v / cslNames.length;
  }
  const activation = dashaActivationVector(lords, byName);
  const P = scoreVectorAgainstDomain(natalVec, domainKey, subcategory).direction;
  const D = scoreVectorAgainstDomain(activation, domainKey, subcategory).direction;
  const { total: comboRaw, hits, contexts } = combinationScore(activation, domainKey);
  const { raw: repRaw, scaled: R, notes: repNotes } = repetitionBonus(lords, byName, domainKey, subcategory);
  const { bonus: cuspB, notes: cuspNotes } = cuspBonus(lords, cusps, byName, domainKey);
  const C = clamp(comboRaw + cuspB, -50, 50);
  const rawDirection = WEIGHTS.natal * P + WEIGHTS.dasha * D + WEIGHTS.combo * (C * 2) + WEIGHTS.repetition * R;
  const dirBase = clamp(Math.round(rawDirection), -100, 100);
  const gated = applyGate(dirBase, transitT);
  const direction = gated.direction;

  // Intensity: magnitude of activation regardless of polarity.
  const scored = scoreVectorAgainstDomain(activation, domainKey, subcategory);
  const mag = clamp((scored.supportNorm + scored.challengeNorm) / 2, 0, 1);
  const comboNorm = Math.min(1, Math.abs(C) / 40);
  const repNorm = clamp(repRaw / 60, 0, 1);
  const intensity = Math.round(clamp(100 * (0.55 * mag + 0.25 * repNorm + 0.20 * comboNorm), 0, 100));

  // Confidence: agreement among N, MD, AD, PD, SD polarities.
  const levelDirs = [
    P,
    ...lords.map((l) => scoreVectorAgainstDomain(planetHouseVector(byName[l]), domainKey, subcategory).direction),
  ];
  const pos = levelDirs.filter((v) => v > 10).length;
  const neg = levelDirs.filter((v) => v < -10).length;
  const confidence = Math.round(20 + 80 * (Math.max(pos, neg) / levelDirs.length));

  const reasons = [
    `Natal promise (${d.anchor.map((n, i) => `${n}th CSL ${cslNames[i]}`).join(' + ')}) scores ${Math.round(P)}`,
    `${lords[0]} MD / ${lords[1]} AD / ${lords[2]} PD / ${lords[3]} SD → dasha direction ${Math.round(D)}`,
    ...hits.map((c) => `Combination ${c.houses.join('+')} (${c.label}) ${c.score > 0 ? '+' : ''}${c.score}`),
    ...contexts.map((c) => `Context: ${c.houses.join('+')} (${c.label})`),
    ...cuspNotes,
    ...repNotes.slice(0, 6),
    ...(scored.challengeNorm > 0.25 ? [`Houses ${d.challenging.join('/')} active (challenge ${(scored.challengeNorm * 100).toFixed(0)}%)`] : []),
    ...(transitT != null ? [`Transit gate T=${Math.round(transitT)} → ×${gated.gateFactor.toFixed(2)}`, ...transitReasons.slice(0, 2)] : []),
  ];
  return { direction, intensity, confidence, P: Math.round(P), D: Math.round(D), C, R: Math.round(R), T: transitT == null ? 0 : Math.round(transitT), gate: +gated.gateFactor.toFixed(3), reasons, activation };
}

export function quarterStart(year, q) {
  return Date.UTC(year, (q - 1) * 3, 1, 0, 0, 0);
}
export function quarterEnd(year, q) {
  return Date.UTC(year, q * 3, 1, 0, 0, 0);
}
export function quarterLabel(year, q) {
  return `${year} Q${q}`;
}
export function eachQuarter(startMs, endMs) {
  const out = [];
  let d = new Date(startMs);
  let y = d.getUTCFullYear(), q = Math.floor(d.getUTCMonth() / 3) + 1;
  for (;;) {
    const s = Math.max(quarterStart(y, q), startMs);
    const e = quarterEnd(y, q);
    if (s >= endMs) break;
    out.push({ year: y, q, start: s, end: Math.min(e, endMs) });
    if (e >= endMs) break;
    q += 1;
    if (q > 4) { q = 1; y += 1; }
  }
  return out;
}

// Score a quarter by splitting on real Sookshma-level dasha boundaries, then time-weighting.
// Optional quarterT (KP transit trigger, -100..100, typically evaluated at the
// quarter midpoint) gates the time-weighted base once at the end.
export function predictQuarter(chart, qStartMs, qEndMs, domainKey, subcategory = null, quarterT = null) {
  if (typeof subcategory === 'number' && quarterT === null) { quarterT = subcategory; subcategory = null; }
  const byName = sigMap(chart.significations);
  void byName;
  let cursor = qStartMs;
  let acc = { direction: 0, intensity: 0, confidence: 0 };
  let accDetail = { P: 0, D: 0, C: 0, R: 0 };
  const reasonVotes = new Map();
  let guard = 0;
  while (cursor < qEndMs && guard < 64) {
    guard += 1;
    const { chain } = chainAt(chart.seed, cursor);
    const segEnd = Math.min(qEndMs, chain[0].end, chain[1].end, chain[2].end, chain[3].end);
    const end = Math.max(segEnd, cursor + 1);
    const lords = [chain[0].lord, chain[1].lord, chain[2].lord, chain[3].lord];
    const s = scoreInstant({ significations: chart.significations, cusps: chart.cusps, lords, domainKey, subcategory });
    const w = (end - cursor) / (qEndMs - qStartMs);
    acc.direction += w * s.direction;
    acc.intensity += w * s.intensity;
    acc.confidence += w * s.confidence;
    accDetail.P += w * s.P; accDetail.D += w * s.D; accDetail.C += w * s.C; accDetail.R += w * s.R;
    for (const r of s.reasons) reasonVotes.set(r, (reasonVotes.get(r) || 0) + w);
    cursor = end;
  }
  const reasons = [...reasonVotes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([r]) => r);
  const gated = applyGate(acc.direction, quarterT);
  if (quarterT != null) {
    reasons.push(`Transit gate quarterly T=${Math.round(quarterT)} → ×${gated.gateFactor.toFixed(2)}`);
  }
  return {
    direction: gated.direction,
    intensity: Math.round(acc.intensity),
    confidence: Math.round(acc.confidence),
    detail: { P: Math.round(accDetail.P), D: Math.round(accDetail.D), C: Math.round(accDetail.C), R: Math.round(accDetail.R), T: quarterT == null ? 0 : Math.round(quarterT), gate: +gated.gateFactor.toFixed(3) },
    reasons,
  };
}

export function predictRange(chart, startMs, endMs, domainKeys = DOMAIN_KEYS, transitProvider = null) {
  return eachQuarter(startMs, endMs).map(({ year, q, start, end }) => {
    const scores = {};
    for (const k of domainKeys) {
      let quarterT = null;
      if (typeof transitProvider === 'function') {
        try {
          const v = transitProvider({ mid: Math.floor((start + end) / 2), start, end, year, q }, k);
          if (Number.isFinite(v)) quarterT = v;
        } catch { quarterT = null; }
      }
      scores[k] = predictQuarter(chart, start, end, k, null, quarterT);
    }
    return { year, q, label: quarterLabel(year, q), start, end, scores };
  });
}

export function describeDirection(v) {
  if (v >= 60) return 'Strongly favourable';
  if (v >= 25) return 'Favourable';
  if (v > -25) return 'Mixed / neutral';
  if (v > -60) return 'Challenging';
  return 'Strongly challenging';
}

export function describeIntensity(v) {
  if (v >= 75) return 'High activity';
  if (v >= 40) return 'Moderate activity';
  return 'Low activity';
}
