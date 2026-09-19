# AstraLoom Predictions V1

Predictions is a deterministic, explainable quarterly interpretation layer over AstraLoom's birth chart, significations, cusps, and Vimshottari periods. It makes no network or LLM calls.

## What it shows

Choose Education, Career, Relationships, Wealth, Health & Wellbeing, and Litigation. Predictions open on the exact current Mahadasha. The selector lists Mahadashas from the adjacent 120-year cycles so earlier and later periods can be inspected directly.

Each quarter reports:

- **Direction**: a bounded −100 to +100 balance of supportive and challenging themes.
- **Intensity**: a 0–100 activation magnitude.
- **Confidence**: a 0–100 measure of agreement between natal promise and the MD/AD/PD/Sookshma signals. It is not an event probability.

## Method

Each timing lord uses its full Planet/Nakshatra/Sub house chain:

`Planet vector = .20 × Planet + .40 × Nakshatra + .40 × Sub`

The period chain is weighted as `.35 × MD + .30 × AD + .22 × PD + .13 × Sookshma`. Direction combines natal cusp promise, dasha activation, configured house combinations, and repetition:

`Direction = clamp(.30 × Natal + .45 × Dasha + .15 × Combination + .10 × Repetition, −100, +100)`

Multi-anchor domains average their relevant cusp-sub-lord promises. Domain rules identify combinations; repetition considers recurring relevant houses across the period chain and within Planet/Nakshatra/Sub, with a soft cap. Houses 8 and 12 are contextual rather than universally favourable or adverse.

Every calendar quarter is split at MD, AD, PD, and Sookshma boundaries. Each half-open timing interval is calculated separately and combined by elapsed milliseconds, preserving DST shifts, leap days, and transitions within a quarter.

## Limits

These are configurable astrological interpretations, not scientifically validated forecasts or medical, legal, or financial advice. Confidence measures only agreement within this model; it does not establish likelihood, accuracy, or birth-time certainty.
