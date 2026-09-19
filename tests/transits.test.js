import test from 'node:test';
import assert from 'node:assert/strict';
import { LORDS } from '../src/kp.js';
import { scoreInstant, predictQuarter, predictRange, applyGate } from '../src/predictions.js';
import { transitHouseVector, dashaTransitBonus, scoreQuarterTransit, TRANSIT_PLANETS } from '../src/transits.js';

function row(name, planet, starHouses, subHouses, star = 'X', sub = 'Y') {
  const all = [...new Set([...planet, ...starHouses, ...subHouses])].sort((a, b) => a - b);
  return { name, planet, starHouses, subHouses, star, sub, allHouses: all };
}
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

test('V1 parity: no transit T leaves direction identical', () => {
  const c = chart();
  const lords = ['Moon', 'Jupiter', 'Mercury', 'Venus'];
  const a = scoreInstant({ significations: c.significations, cusps: c.cusps, lords, domainKey: 'career' });
  const b = scoreInstant({ significations: c.significations, cusps: c.cusps, lords, domainKey: 'career', transitT: null });
  assert.equal(a.direction, b.direction);
  assert.equal(b.T, 0);
  assert.equal(b.gate, 1);
});

test('applyGate never reverses sign and caps change at 15', () => {
  for (const base of [60, -60, 25, -25, 100, -100]) {
    for (const T of [100, -100, 0, 40, -40]) {
      const { direction } = applyGate(base, T);
      assert.ok(Math.abs(direction) <= 100);
      if (base !== 0 && T !== 0) {
        assert.ok(Math.sign(direction) === Math.sign(base) || direction === 0,
          `base ${base} T ${T} -> ${direction} must not flip`);
        assert.ok(Math.abs(direction - base) <= 16, `bounded change base ${base} T ${T}`);
      }
    }
  }
  const zero = applyGate(0, 100);
  assert.ok(Math.abs(zero.direction) <= 15);
});

test('transit vector uses slow planets only and normalises weights', () => {
  const c = chart();
  const byName = Object.fromEntries(c.significations.map((r) => [r.name, r]));
  const vec = transitHouseVector([
    { name: 'Jupiter', star: 'Venus', sub: 'Sun' },
    { name: 'Sun', star: 'Venus', sub: 'Sun' },
    { name: 'Moon', star: 'Venus', sub: 'Sun' },
  ], byName);
  // Venus.planet=[2,9,11] (0.5) + Sun.planet=[1,12] (0.5), Jupiter weight 1.0
  assert.ok(Math.abs(vec[2] - 0.5) < 1e-9);
  assert.ok(Math.abs(vec[1] - 0.5) < 1e-9);
  assert.ok(!('Sun' in TRANSIT_PLANETS) && !('Moon' in TRANSIT_PLANETS));
});

test('dasha-lord bonus rewards supportive transit, bounded ±20', () => {
  const c = chart();
  const byName = Object.fromEntries(c.significations.map((r) => [r.name, r]));
  // Career primary includes 2,6,10,11. Venus.planet=[2,9,11] is supportive.
  const { bonus, notes } = dashaTransitBonus(
    [{ name: 'Jupiter', star: 'Venus', sub: 'Sun' }], byName,
    ['Jupiter', 'Saturn', 'Moon', 'Venus'], 'career'
  );
  assert.ok(bonus > 0 && bonus <= 20);
  assert.ok(notes.length > 0);
});

test('scoreQuarterTransit is bounded and explainable', () => {
  const c = chart();
  const s = scoreQuarterTransit(
    [{ name: 'Jupiter', star: 'Venus', sub: 'Sun' }, { name: 'Saturn', star: 'Sun', sub: 'Venus' }],
    c.significations, ['Jupiter', 'Saturn', 'Moon', 'Venus'], 'career'
  );
  assert.ok(s.T >= -100 && s.T <= 100);
  assert.ok(s.reasons.length >= 1);
});

test('predictQuarter gates once at quarter level; provider errors fall back', () => {
  const c = chart();
  const base = predictQuarter(c, Date.UTC(2026, 9, 1), Date.UTC(2027, 0, 1), 'career');
  const gated = predictQuarter(c, Date.UTC(2026, 9, 1), Date.UTC(2027, 0, 1), 'career', null, 100);
  assert.ok(Math.abs(gated.direction - base.direction) <= 16);
  assert.equal(gated.detail.T, 100);
  const rows = predictRange(c, Date.UTC(2026, 9, 1), Date.UTC(2027, 0, 1), ['career'], () => { throw new Error('ephemeris down'); });
  assert.equal(rows[0].scores.career.detail.T, 0);
  assert.equal(rows[0].scores.career.direction, base.direction);
});
