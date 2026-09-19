// AstraLoom Highlights V1.2 — deterministic "banger" layer over V1.1 scores.
// Pure functions only: no ephemeris, no AI. Everything derives from
// predictRange rows + natal chart data + kp significations.
// Presentation may amplify; it never changes a score.

import { DOMAINS, describeDirection } from './predictions.js';

// Domain-specific nouns for peak / trough headlines.
const NOUNS = {
  education: { peak: 'study window', trough: 'interruption risk' },
  career: { peak: 'career surge', trough: 'career drag' },
  relationships: { peak: 'union window', trough: 'separation pressure' },
  wealth: { peak: 'accumulation window', trough: 'outflow pressure' },
  health: { peak: 'vitality window', trough: 'medical pressure' },
  litigation: { peak: 'victory pattern', trough: 'adverse pattern' },
};

function toneOf(direction) {
  if (direction >= 60) return 'peak';
  if (direction >= 25) return 'high';
  if (direction > -25) return 'mixed';
  if (direction > -60) return 'low';
  return 'trough';
}

// One-line verdict for a scored quarter. Deterministic template over
// direction band + strongest supporting component (combo / transit / CSL).
export function headlineFor(domainKey, score) {
  const d = DOMAINS[domainKey];
  if (!d) throw new Error(`Unknown domain: ${domainKey}`);
  const nouns = NOUNS[domainKey] || { peak: 'favourable window', trough: 'challenging window' };
  const tone = toneOf(score.direction);
  const det = score.detail || {};
  const bits = [];
  if ((det.C || 0) >= 20) bits.push('combination-backed');
  if ((det.T || 0) >= 30) bits.push('transit-backed');
  else if ((det.T || 0) <= -30) bits.push('against a transit headwind');
  if ((score.confidence || 0) >= 70) bits.push('high agreement');
  if ((det.D || 0) >= 40 && tone !== 'trough' && tone !== 'low') bits.push('strong dasha push');
  if ((det.D || 0) <= -40 && (tone === 'trough' || tone === 'low')) bits.push('weak dasha');
  const noun = tone === 'peak' || tone === 'high' ? nouns.peak : tone === 'mixed' ? 'mixed window' : nouns.trough;
  const verdict = describeDirection(score.direction);
  const suffix = bits.length ? ` — ${bits.slice(0, 2).join(', ')}` : '';
  return {
    title: `${d.label} ${score.direction > 0 ? '+' : ''}${score.direction}: ${noun}${suffix}`,
    tone,
    verdict,
  };
}

// Best / worst quarter refs for a domain over predictRange rows.
export function findPeaks(rows, domainKey) {
  let best = null, worst = null;
  for (const r of rows || []) {
    const s = r.scores?.[domainKey];
    if (!s) continue;
    if (!best || s.direction > best.direction) {
      best = { label: r.label, direction: s.direction, start: r.start, end: r.end };
    }
    if (!worst || s.direction < worst.direction) {
      worst = { label: r.label, direction: s.direction, start: r.start, end: r.end };
    }
  }
  return { best, worst };
}

// Momentum: current quarter direction minus previous quarter direction.
export function quarterDelta(rows, index, domainKey) {
  if (index <= 0 || !rows?.[index]?.scores?.[domainKey] || !rows?.[index - 1]?.scores?.[domainKey]) return 0;
  return rows[index].scores[domainKey].direction - rows[index - 1].scores[domainKey].direction;
}

// Concordance 0..3: dasha agrees + transit consents + confident panel.
// Orthodox signal: KSK's "wait for supporting transits" made visible.
export function concordance(score) {
  const det = score.detail || {};
  let stars = 0;
  if (Math.sign(det.D || 0) === Math.sign(score.direction) && (det.D || 0) !== 0) stars += 1;
  if ((det.T || 0) !== 0 && Math.sign(det.T) === Math.sign(score.direction)) stars += 1;
  if ((score.confidence || 0) >= 60) stars += 1;
  // A dead-zero quarter carries no signal either way.
  if (score.direction === 0) stars = Math.min(stars, 1);
  return { stars, label: '★'.repeat(stars) + '☆'.repeat(3 - stars) };
}

// Quarters containing a Vimshottari MD/AD/PD change between start and end.
// chainAtFn is injected (predictions' chainAt) to keep this module decoupled.
export function dashaShiftLabels(seed, rows, chainAtFn) {
  const out = new Map();
  for (const r of rows || []) {
    try {
      const a = chainAtFn(seed, r.start).chain.slice(0, 3).map((p) => p.lord);
      const b = chainAtFn(seed, r.end - 1).chain.slice(0, 3).map((p) => p.lord);
      if (a[0] !== b[0]) out.set(r.label, `MD shift to ${b[0]}`);
      else if (a[1] !== b[1]) out.set(r.label, `AD shift to ${b[1]}`);
      else if (a[2] !== b[2]) out.set(r.label, `PD shift to ${b[2]}`);
    } catch { /* outside dasha range: no marker */ }
  }
  return out;
}

const houseFromMoon = (sign, moon) => ((sign - moon + 12) % 12) + 1;

// Classical Gochara context badges from the Moon sign. Display context only:
// these names are famous (Sade Sati etc.) but they never change a score.
export function gocharaBadges(natalMoonSignIndex, transitPlanets) {
  const badges = [];
  if (!Number.isInteger(natalMoonSignIndex)) return badges;
  const byName = Object.fromEntries((transitPlanets || []).map((p) => [p.name, p]));
  const sat = byName.Saturn, jup = byName.Jupiter, rah = byName.Rahu;
  if (sat && Number.isInteger(sat.signIndex)) {
    const h = houseFromMoon(sat.signIndex, natalMoonSignIndex);
    if (h === 12 || h === 1 || h === 2) {
      badges.push(`Sade Sati (${h === 12 ? 'rising' : h === 1 ? 'peak' : 'setting'} phase)`);
    } else if (h === 4 || h === 8) {
      badges.push('Dhaiya (Saturn 4th/8th from Moon)');
    } else if (h === 3 || h === 6 || h === 11) {
      badges.push(`Saturn supportive (${h}th from Moon)`);
    }
  }
  if (jup && Number.isInteger(jup.signIndex)) {
    const h = houseFromMoon(jup.signIndex, natalMoonSignIndex);
    if ([2, 5, 7, 9, 11].includes(h)) badges.push(`Jupiter supportive (${h}th from Moon)`);
  }
  if (rah && Number.isInteger(rah.signIndex)) {
    const h = houseFromMoon(rah.signIndex, natalMoonSignIndex);
    if ([3, 6, 11].includes(h)) badges.push(`Nodes supportive (${h}th from Moon)`);
  }
  return badges.slice(0, 3);
}
