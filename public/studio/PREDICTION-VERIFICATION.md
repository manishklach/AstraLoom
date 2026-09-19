# Prediction verification

Predictions V1 is a deterministic interpretation layer over AstraLoom's verified chart, signification, cusp, and Vimshottari modules. This report verifies software behavior and timing arithmetic; it does not claim statistical validation of astrological outcomes.

## Checks completed

- Planet/Nakshatra/Sub (20/40/40) and MD/AD/PD/Sookshma (35/30/22/13) weights are covered by regression tests.
- Every domain returns bounded Direction (−100 to +100), Intensity (0 to 100), and Confidence (0 to 100) values.
- Regression coverage includes domain combinations, multi-anchor promise, subcategory lenses, domain-relevant repetition soft-capping, and deterministic replay.
- Exact dasha subdivision is time-weighted across quarter boundaries, so a period contributes only for its actual duration.
- Core astronomy, dasha, timezone, DST, node-agency, and cusp tests continue to pass.

## Limits

Direction, Intensity, and Confidence are internal model values. Confidence does not establish likelihood, empirical accuracy, birth-time certainty, or the occurrence of an event. Health and litigation themes are for reflection only and do not replace qualified medical or legal advice.
