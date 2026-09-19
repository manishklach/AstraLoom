# AstraLoom

**AstraLoom** is a private astrology workspace and public consultation site. It creates precise sidereal birth charts, supports saved profiles, and presents planetary periods and transits in a clear, navigable interface.

**Live site:** https://astraloom.abc123xyza.chatgpt.site

## Highlights

- Swiss Ephemeris WASM calculations for sidereal planetary positions, Placidus cusps, and mean or true lunar nodes.
- Simple birth entry with 12-hour time, AM/PM, IANA timezone, DST handling, place search, and editable coordinates.
- North Indian, South Indian, and Bhava Chalit birth-chart views.
- Full cusp chart with sign, nakshatra, star-lord, sub-lord, and sub-sub-lord chains.
- Deterministic Vimshottari navigation through **MD → AD → PD → Sookshma → Pran**, including exact start/end timestamps and any-date navigation.
- A color-coded dasha hierarchy: indigo MD, violet AD, teal PD, gold Sookshma, and rose Pran. Planetary glyph tokens make each period easy to identify.
- Planet significations with house numbers, stellar relationships, and expanded Rahu/Ketu agency.
- Current-transit table plus a **North Indian transit chart** laid out from the natal ascendant.
- Deterministic quarterly predictions across six life domains, with transit-gated triggers, peak/caution windows, dasha-shift markers, and classical Gochara context (Sade Sati, supportive Jupiter/Saturn).
- Light and dark themes that persist between workspace, About, Services, and profile pages.
- ChatGPT sign-in and private saved birth profiles. Saved profiles retain a chart snapshot so they reopen without needing another calculation.

## How calculations work

AstraLoom uses a precision sidereal ayanamsa with Placidus houses. The Nakshatra, sub-lord, and sub-sub-lord calculations use deterministic Vimshottari proportional divisions rather than approximated astronomical values.

Rahu and Ketu significations include their placement, sign-lord agency, received traditional aspects, and same-sign conjunctions on the node axis. Planets whose star or sub-lord is a node receive that complete node agency.

The dasha year can be selected as 365.25 days (default), 365.25636 days, or 360 days. Match the convention when comparing period dates with another report.

## Predictions (V1.1 + highlights)

Quarterly indicators combine natal promise with running-dasha activation:

| Component | Weight | Meaning |
| --- | --- | --- |
| Natal promise (P) | 0.30 | Anchor cusp sub-lord significations |
| Dasha activation (D) | 0.45 | MD 35 · AD 30 · PD 22 · Sookshma 13 |
| Combinations (C) | 0.15 | Domain house patterns plus cusp bonus |
| Repetition (R) | 0.10 | Cross-level recurrence, soft-capped |
| Transit trigger (T) | gate ±15% | Slow-planet star/sub field, never reverses |

KP rule applied throughout: transits trigger but never create. The gate amplifies an agreeing quarter up to ×1.15 and damps an opposing quarter toward zero (minimum ×0.85). With the gate off, every number is bit-identical to V1.

The presentation layer adds peak/caution windows per range, one-line verdicts, momentum vs the previous quarter, a 3-star dasha–transit concordance, ◈ dasha-shift markers, and classical Gochara context (Sade Sati phases, supportive Jupiter/Saturn/Nodes from the Moon). Scores are mathematical indicators, not advice; health and litigation views are astrological indicators only.

## Release history

- **v1.2.0** — Highlights layer: peak/caution hero cards, headline verdicts, momentum, concordance stars, dasha-shift markers, Gochara context badges.
- **v1.1.0** — KP transit trigger gate (`transitsAt`, `transits.js`, ±15% gate, quarterly midpoint sampling, slow planets only).
- **v1.0.0** — Verified baseline: sidereal Placidus charts, KP chains, Vimshottari through Pran, V1 predictions.

## Rendering and privacy

The public Home, About, Services, and Profile routes are server-rendered for quick initial loading and indexable public content. The interactive chart workspace loads Swiss Ephemeris in the browser only when a chart is calculated. This keeps birth-chart computation local to the visitor’s browser.

Saved birth profiles are associated with the authenticated ChatGPT account. The profile API checks the account identity on every read and write. Place-search text is sent to the selected geocoding provider only when a user searches for a place.

## Local development

Requires Node.js 22.13 or later.

```bash
npm ci
npm run db:generate
npm run build
npm run start
```

Common commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the framework development server. |
| `npm run build` | Build the Vite chart client and server-rendered application. |
| `npm run start` | Serve the generated Cloudflare Worker locally. |
| `npm run lint` | Run ESLint. |
| `npm run db:generate` | Generate Drizzle migrations. |

## Project structure

| Path | Purpose |
| --- | --- |
| `studio/` | Interactive chart workspace, Swiss Ephemeris integration, dasha engine, and chart renderers. |
| `app/` | Server-rendered public pages, profile page, API routes, and theme controls. |
| `db/` and `drizzle/` | D1 schema and generated migrations for saved profiles. |
| `studio/public/VERIFICATION.md` | Calculation verification report and remaining assumptions. |
| `.openai/hosting.json` | Sites hosting configuration. |

## Verification

The built-in sample is **19 October 1975, 05:55 AM, Mumbai, India**. It verifies:

- Virgo ascendant at 21°41′48″.
- Gemini 10th cusp at 21°18′26″ with Jupiter as star and sub-lord.
- Planetary longitudes, houses, nakshatra, star/sub/sub-sub chains, and both node modes against a PySwissEph reference.
- Nested Vimshottari boundaries through Pran, longitude boundaries, cusp allocation, timezone edge cases, and user-interface states.

Read the full [verification report](studio/public/VERIFICATION.md).

## License

AGPL-3.0-or-later. See [THIRD_PARTY.md](THIRD_PARTY.md) for Swiss Ephemeris and other third-party notices.