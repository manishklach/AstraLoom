import test from 'node:test';
import assert from 'node:assert/strict';
import { LORDS } from '../src/kp.js';
import { chainAt } from '../src/dasha.js';
import { headlineFor, findPeaks, quarterDelta, concordance, dashaShiftLabels, gocharaBadges } from '../src/highlights.js';

const score = (direction, detail = {}, confidence = 60, reasons = []) => ({
  direction, intensity: 50, confidence, detail: { P: 0, D: 0, C: 0, R: 0, T: 0, ...detail }, reasons,
});

test('headlines use domain nouns and surface transit backing', () => {
  const h = headlineFor('career', score(72, { D: 50, C: 25, T: 40 }, 80));
  assert.match(h.title, /Career \+72/);
  assert.match(h.title, /career surge/);
  assert.match(h.title, /transit-backed/);
  assert.equal(h.tone, 'peak');
  const low = headlineFor('wealth', score(-70, { D: -50 }, 80));
  assert.match(low.title, /outflow pressure/);
  assert.equal(low.tone, 'trough');
});

test('headlines stay neutral on mixed quarters', () => {
  const h = headlineFor('health', score(5, {}, 30));
  assert.equal(h.tone, 'mixed');
  assert.match(h.title, /mixed window/);
});

test('findPeaks returns best and worst quarter refs', () => {
  const rows = [
    { label: '2026 Q1', start: 1, end: 2, scores: { career: score(10) } },
    { label: '2026 Q2', start: 2, end: 3, scores: { career: score(78) } },
    { label: '2026 Q3', start: 3, end: 4, scores: { career: score(-44) } },
  ];
  const { best, worst } = findPeaks(rows, 'career');
  assert.equal(best.label, '2026 Q2');
  assert.equal(worst.label, '2026 Q3');
});

test('quarterDelta measures momentum vs previous quarter', () => {
  const rows = [
    { label: '2026 Q1', scores: { career: score(40) } },
    { label: '2026 Q2', scores: { career: score(58) } },
  ];
  assert.equal(quarterDelta(rows, 1, 'career'), 18);
  assert.equal(quarterDelta(rows, 0, 'career'), 0);
});

test('concordance rewards dasha + transit + confidence agreement', () => {
  const full = concordance(score(60, { D: 50, T: 40 }, 80));
  assert.equal(full.stars, 3);
  const none = concordance(score(60, { D: -50, T: -40 }, 30));
  assert.equal(none.stars, 0);
  const zero = concordance(score(0, { D: 50, T: 50 }, 90));
  assert.ok(zero.stars <= 1);
});

test('dashaShiftLabels flags quarters containing MD/AD changes', () => {
  const seed = { start: Date.UTC(2000, 0, 1), index: LORDS.indexOf('Moon'), yearDays: 365.25 };
  // Scan for a real AD boundary to build a straddling quarter.
  let boundary = null;
  for (let ms = Date.UTC(2000, 6, 1); ms < Date.UTC(2003, 0, 1); ms += 86400000) {
    const a = chainAt(seed, ms).chain.slice(0, 2).map((p) => p.lord).join('/');
    const b = chainAt(seed, ms + 86400000).chain.slice(0, 2).map((p) => p.lord).join('/');
    if (a !== b) { boundary = ms + 43200000; break; }
  }
  assert.ok(boundary, 'fixture has a dasha boundary in range');
  const rows = [{ label: 'X Q1', start: boundary - 86400000 * 40, end: boundary + 86400000 * 40 }];
  const shifts = dashaShiftLabels(seed, rows, chainAt);
  assert.ok(shifts.has('X Q1'));
});

test('gocharaBadges names Sade Sati phases from the Moon', () => {
  // Natal Moon in Aries (0); Saturn in Aries = 1st from Moon = peak phase.
  const badges = gocharaBadges(0, [{ name: 'Saturn', signIndex: 0 }, { name: 'Jupiter', signIndex: 10 }]);
  assert.ok(badges.some((b) => b.startsWith('Sade Sati (peak')));
  assert.ok(badges.some((b) => b.startsWith('Jupiter supportive (11th from Moon)')));
});

test('gocharaBadges is empty without a valid Moon sign', () => {
  assert.deepEqual(gocharaBadges(null, [{ name: 'Saturn', signIndex: 0 }]), []);
});
