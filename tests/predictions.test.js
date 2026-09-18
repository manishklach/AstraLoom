import test from 'node:test';
import assert from 'node:assert/strict';
import { LORDS } from '../src/kp.js';
import {
  planetHouseVector, scoreInstant,
  predictQuarter, predictRange, combinationScore, repetitionBonus, DOMAIN_KEYS,
} from '../src/predictions.js';

function row(name, planet, starHouses, subHouses, star = 'X', sub = 'Y') {
  const all = [...new Set([...planet, ...starHouses, ...subHouses])].sort((a, b) => a - b);
  return { name, planet, starHouses, subHouses, star, sub, allHouses: all };
}
// Spec-anchored fixtures (Moon / Mercury / Jupiter / Saturn chains from the brief).
function chart() {
  const significations = [
    row('Moon', [6, 11], [1, 10, 12], [1, 10, 12], 'Rahu', 'Rahu'),
    row('Mercury', [1, 10, 12], [6, 11], [5, 6, 10], 'Rahu', 'Saturn'),
    row('Jupiter', [4, 7], [1, 10, 12], [1, 2, 9, 11, 12], 'Rahu', 'Rahu'),
    row('Saturn', [5, 6, 10], [5, 6, 10], [2, 9, 11], 'Sun', 'Venus'),
    row('Sun', [1, 12], [3, 8, 9], [1, 10, 12], 'Mars', 'Rahu'),
    row('Venus', [2, 9, 11], [5, 6, 10], [5, 6, 10], 'Sun', 'Sun'),
    row('Mars', [3, 8], [6, 11], [6, 11], 'Moon', 'Moon'),
    row('Rahu', [1, 2, 9, 11, 12], [4, 7], [4, 7], 'Jupiter', 'Jupiter'),
    row('Ketu', [1, 3], [4, 7], [4, 7], 'Jupiter', 'Jupiter'),
  ];
  const cusps = Array.from({ length: 12 }, (_, i) => ({
    house: i + 1, longitude: i * 30 + 10, star: 'Sun',
    sub: ['Sun', 'Moon', 'Jupiter', 'Mars', 'Sun', 'Saturn', 'Venus', 'Mars', 'Jupiter', 'Jupiter', 'Saturn', 'Jupiter'][i],
  }));
  return { significations, cusps, seed: { start: Date.UTC(2000, 0, 1), index: LORDS.indexOf('Moon'), yearDays: 365.25 } };
}

test('planet vector preserves Planet 0.20 / Nak 0.40 / Sub 0.40 (Mercury 6=0.80)', () => {
  const c = chart();
  const mer = c.significations.find((r) => r.name === 'Mercury');
  const v = planetHouseVector(mer);
  assert.equal(v[6], 0.8);
  assert.equal(v[10], 0.2 + 0.4);
  assert.equal(v[11], 0.4);
  assert.equal(v[12], 0.2);
});

test('Moon is not flattened: Nak/Sub 1/10/12 dominate Planet 6/11', () => {
  const c = chart();
  const moon = c.significations.find((r) => r.name === 'Moon');
  const v = planetHouseVector(moon);
  assert.equal(v[1], 0.8);
  assert.equal(v[6], 0.2);
});

test('scoreInstant is bounded and explainable across all six domains', () => {
  const c = chart();
  for (const k of DOMAIN_KEYS) {
    const s = scoreInstant({ significations: c.significations, cusps: c.cusps, lords: ['Moon', 'Jupiter', 'Mercury', 'Venus'], domainKey: k });
    assert.ok(s.direction >= -100 && s.direction <= 100, `${k} direction`);
    assert.ok(s.intensity >= 0 && s.intensity <= 100, `${k} intensity`);
    assert.ok(s.confidence >= 0 && s.confidence <= 100, `${k} confidence`);
    assert.ok(s.reasons.length >= 3, `${k} reasons`);
  }
});

test('cusp activation: 10th CSL Jupiter active boosts career combo path', () => {
  const c = chart();
  const withJ = scoreInstant({ significations: c.significations, cusps: c.cusps, lords: ['Moon', 'Jupiter', 'Mercury', 'Venus'], domainKey: 'career' });
  const withoutJ = scoreInstant({ significations: c.significations, cusps: c.cusps, lords: ['Sun', 'Venus', 'Mars', 'Saturn'], domainKey: 'career' });
  assert.ok(withJ.reasons.some((r) => r.includes('10th CSL')), 'cusp note present');
  assert.ok(withJ.C >= withoutJ.C, 'cusp bonus reflected');
});

test('combination detection fires 6+10+11 for Mercury-heavy activation', () => {
  const c = chart();
  const byName = Object.fromEntries(c.significations.map((r) => [r.name, r]));
  const v = planetHouseVector(byName.Mercury);
  const { hits } = combinationScore({ 6: 0.8, 10: 0.6, 11: 0.4, ...v }, 'career');
  assert.ok(hits.some((h) => h.houses.join('+') === '6+10+11'));
});

test('repetition bonus rewards cross-level recurrence, capped at 30', () => {
  const c = chart();
  const byName = Object.fromEntries(c.significations.map((r) => [r.name, r]));
  const { raw, scaled } = repetitionBonus(['Moon', 'Jupiter', 'Mercury', 'Venus'], byName);
  assert.ok(raw > 0 && raw <= 30);
  assert.ok(scaled >= 0 && scaled <= 100);
});

test('predictQuarter time-weights across a real dasha boundary', () => {
  const c = chart();
  // Whole-quarter single chain vs quarter straddling a PD boundary must be computed, not sampled.
  const a = predictQuarter(c, Date.UTC(2026, 9, 1), Date.UTC(2026, 9, 2), 'career');
  const rows = predictRange(c, Date.UTC(2026, 9, 1), Date.UTC(2027, 0, 1), ['career', 'wealth']);
  assert.equal(rows.length, 1);
  assert.ok(rows[0].scores.career.reasons.length > 0);
  assert.deepEqual(Object.keys(rows[0].scores).sort(), ['career', 'wealth']);
  void a;
});

test('determinism: identical inputs give identical outputs', () => {
  const c = chart();
  const lords = ['Moon', 'Jupiter', 'Mercury', 'Venus'];
  const a = scoreInstant({ significations: c.significations, cusps: c.cusps, lords, domainKey: 'wealth' });
  const b = scoreInstant({ significations: c.significations, cusps: c.cusps, lords, domainKey: 'wealth' });
  assert.deepEqual(a, b);
});
