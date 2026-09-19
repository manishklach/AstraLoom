// AstraLoom Transits V1.1 — pure KP stellar trigger scoring.
// No ephemeris here: callers pass transit planets (star/sub from kp())
// computed via transitsAt(swe, natal, ms) in astronomy.js.
// Direction: transits.js -> predictions.js only (imports scoring helpers).
// predictions.js never imports this module; the gate is applied there
// via an injected numeric T so V1 parity holds when T is absent.

import { sigMap, scoreVectorAgainstDomain, DOMAINS, SUBCATEGORIES } from './predictions.js';

// Slow planets only for quarterly scale. Fast Sun/Moon/Mercury/Venus wash
// out over a quarter and are reserved for future fine-timing views.
export const TRANSIT_PLANETS = {
  Jupiter: 1.0,
  Saturn: 1.0,
  Rahu: 1.0,
  Ketu: 1.0,
  Mars: 0.5,
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Transit stellar vector: each slow transit delivers its star-lord (0.5)
// and its sub-lord decides (0.5), mapped through natal occupation+ownership
// (row.planet sets, already node-carrier aware). Sign placement ignored.
export function transitHouseVector(transitPlanets, byName) {
  const vec = {};
  let totalW = 0;
  for (const tp of transitPlanets || []) {
    const w = TRANSIT_PLANETS[tp.name];
    if (!w) continue;
    const starRow = byName?.[tp.star];
    const subRow = byName?.[tp.sub];
    if (!starRow || !subRow) continue;
    totalW += w;
    for (const h of starRow.planet || []) vec[h] = (vec[h] || 0) + w * 0.5;
    for (const h of subRow.planet || []) vec[h] = (vec[h] || 0) + w * 0.5;
  }
  if (totalW > 0) {
    for (const h of Object.keys(vec)) vec[h] /= totalW;
  }
  return vec;
}

function primaryFor(domainKey, subcategory) {
  const d = DOMAINS[domainKey];
  if (!d) throw new Error(`Unknown domain: ${domainKey}`);
  const sub = subcategory && SUBCATEGORIES[domainKey]?.[subcategory];
  return { d, primary: new Set(sub?.primary || d.primary) };
}

// Dasha-lord transit bonus: running MD/AD/PD/SD lord transiting in a
// supportive star/sub for the domain. Bounded so the field dominates.
export function dashaTransitBonus(transitPlanets, byName, lords, domainKey, subcategory) {
  const { primary } = primaryFor(domainKey, subcategory);
  const inLords = new Set(lords || []);
  let bonus = 0;
  const notes = [];
  const challenging = new Set((DOMAINS[domainKey]?.challenging) || []);
  for (const tp of transitPlanets || []) {
    if (!(tp.name in TRANSIT_PLANETS) || !inLords.has(tp.name)) continue;
    const level = (lords || []).indexOf(tp.name);
    const step = level <= 1 ? 5 : 3;
    const starHouses = byName?.[tp.star]?.planet || [];
    const subHouses = byName?.[tp.sub]?.planet || [];
    const supportive =
      starHouses.some((h) => primary.has(h)) || subHouses.some((h) => primary.has(h));
    const onlyChallenging =
      !supportive &&
      [...starHouses, ...subHouses].length > 0 &&
      [...starHouses, ...subHouses].every((h) => challenging.has(h));
    if (supportive) {
      bonus += step;
      notes.push(`Dasha lord ${tp.name} transiting supportive ${tp.star}/${tp.sub} +${step}`);
    } else if (onlyChallenging) {
      bonus -= step;
      notes.push(`Dasha lord ${tp.name} transiting challenging ${tp.star}/${tp.sub} -${step}`);
    }
  }
  return { bonus: clamp(bonus, -20, 20), notes };
}

// Score one transit sample for one domain. Returns integer T in -100..100.
export function scoreQuarterTransit(transitPlanets, significations, lords, domainKey, subcategory) {
  const byName = sigMap(significations);
  const vec = transitHouseVector(transitPlanets, byName);
  const scored = scoreVectorAgainstDomain(vec, domainKey, subcategory);
  const T_raw = scored.direction;
  const { bonus: B, notes: bonusNotes } = dashaTransitBonus(
    transitPlanets, byName, lords, domainKey, subcategory
  );
  const T = clamp(Math.round(T_raw * 0.8 + B), -100, 100);
  const names = (transitPlanets || [])
    .filter((p) => p.name in TRANSIT_PLANETS)
    .map((p) => `${p.name} in ${p.star}/${p.sub}`)
    .join('; ');
  const reasons = [
    `Transit field (${names || 'no slow transits'}) scores ${Math.round(T_raw)}`,
    ...bonusNotes,
  ];
  return { T, T_raw: Math.round(T_raw), B, reasons, transitVec: vec };
}
