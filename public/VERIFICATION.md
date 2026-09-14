# Verification report

## Scope

This report records the checks completed for KP Atlas version 1.0.0, using the built-in sample:

| Input | Value |
| --- | --- |
| Birth date | 19 October 1975 |
| Birth time | 05:55:00 AM, Asia/Kolkata (UTC+05:30) |
| Place | Mumbai, India — 19.07600 N, 72.87770 E |
| Settings | Krishnamurti ayanamsa mode 5, sidereal Placidus, mean node, 365.25-day Vimshottari year |

## Sample results

| Check | Result |
| --- | --- |
| Ascendant | Virgo 21°41′48″ |
| 10th cusp / MC | Gemini 21°18′26″ (81.30711202°) |
| 10th cusp chain | Jupiter star · **Jupiter sub** · Moon sub-sub |
| Moon chain | Revati · Mercury star · Mercury sub · Saturn sub-sub |
| Dasha at 2026-09-13 12:00 UTC | Moon MD → Jupiter AD → Saturn PD → Moon Sookshma |

The requested Virgo ascendant and Jupiter 10th-cusp sub-lord are both confirmed.

## Independent checks

- The in-browser Swiss Ephemeris calculation was compared against PySwissEph 2.10.03 with the same packaged DE431 ephemeris data. All planetary and cusp longitudes, stellar chains, true-node result and four current dasha boundaries match within the test tolerance.
- Seven classical-body tropical longitudes were compared with retained NASA/JPL Horizons DE441 responses for the sample UTC instant. Each application difference is under 0.1 arcsecond; the largest is 0.0488 arcsecond for Mars. This is a separate astronomical reference, although it uses a different DE release.
- The 2,187 star/sub/sub-sub intervals tile the zodiac exactly. Tests exercise the exact boundary and both adjacent sides of every interval.
- Tests cover longitude wraparound, exact cusp allocation, moon-at-nakshatra start/end dasha balance, all nested dasha gaps, and earlier/later 120-year navigation cycles.
- Time tests cover IST, noon/midnight conversion, historical Indian offset changes, invalid dates, DST spring gaps, repeated autumn times, 30-minute Lord Howe folds and Samoa’s skipped civil date.
- Browser checks cover North/South Indian chart switching, all twelve North Indian chart houses, numbered A–D significations, full dasha navigation, place autocomplete, true/mean nodes, phone width, 200% text size and uncaught browser errors.

## Remaining assumptions

- Place search returns city-centre coordinates. Users should replace these with a more exact birthplace where the recorded time or location is near a cusp/sub boundary.
- Timezone history comes from the browser’s IANA data. Historical local records can be incomplete or differ by jurisdiction.
- Different KP schools may apply additional node representation, aspects, conjunctions, or significator strength rules. Those are deliberately not inferred by the program.
- Period dates depend on the selected dasha-year convention. The default is 365.25 fixed days and should be matched when comparing an external report.
