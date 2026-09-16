# AstraLoom

AstraLoom is a private astrology workspace for precise sidereal birth charts, Placidus cusps, KP stellar divisions, and Vimshottari periods through Pran dasha.

## What it does

- Calculates chart positions locally with Swiss Ephemeris and Krishnamurti ayanamsa.
- Shows North and South Indian charts, full cusp chains, significations, and MD → AD → PD → Sookshma → Pran navigation.
- Resolves IANA timezones and DST edge cases for birth details.
- Uses ChatGPT sign-in for a private **My profile** area.
- Saves named birth profiles to account-owned encrypted platform storage. A profile can be opened directly in the chart workspace.

## Privacy

Birth-profile records are associated with the signed-in ChatGPT user ID. The application checks that identity on every profile read and write, so one account cannot retrieve another account’s data. Astronomy calculations run in the browser. Place-search text is sent to Open-Meteo only when search is used.

## Development

Requires Node.js 22.13+.

```sh
npm ci
npm run db:generate
npm run build
npm run start
```

The chart client is under `studio/`; the account pages and profile API are under `app/`. The D1 schema and generated migrations are in `db/` and `drizzle/`.

## Calculation conventions

Sidereal Krishnamurti mode 5, Placidus houses, geocentric apparent positions, mean/true node selection, and deterministic integer-grid nakshatra/sub/sub-sub division. The default Vimshottari year is 365.25 days. See the [verification report](studio/public/VERIFICATION.md) for the Mumbai sample and reference checks.

## License

AGPL-3.0-or-later. Swiss Ephemeris and other third-party notices remain in [THIRD_PARTY.md](THIRD_PARTY.md).
