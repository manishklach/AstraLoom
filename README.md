# KP Atlas

A browser-based KP astrology workspace. Swiss Ephemeris **2.10.03** (WebAssembly with bundled **DE431 Swiss data**) computes the astronomy. No API key or calculation server is needed.

## Run locally

Requires **Node.js 22.12+** (tested on Node 24) and a modern browser with WebAssembly and Intl timezone support.

```sh
npm ci
npm run dev
```

Open the local URL printed in the terminal, normally **http://127.0.0.1:5173**. The sample chart loads automatically. Change the birth details and press **Calculate chart**. Do not open `index.html` directly from the filesystem.

```sh
npm test           # deterministic calculations, timezone and reference tests
npm run build     # production website in dist/, including downloadable source
npm run preview   # serve the production website locally
```

For browser interaction checks, keep a development or preview server running in a separate terminal:

```sh
npm run test:ui
```

The browser test defaults to installed Microsoft Edge. Set `BROWSER_CHANNEL=chrome` for installed Chrome; `TEST_URL` selects another local URL and `QA_DIR` selects screenshot output. Use your shell's environment-variable syntax. Test artifacts go to `work/qa/` by default.

## Features

- DOB; 12-hour time with seconds and AM/PM; editable IANA timezone.
- Debounced, keyboard-operable Open-Meteo/GeoNames place search, returning coordinates and timezone. Manual coordinate/timezone entry works if search is unavailable.
- Historical timezone offsets; rejected DST gaps; explicit first/second occurrence for repeated clock times. Ambiguous abbreviations such as `IST` are rejected; use `Asia/Kolkata`.
- North Indian birth chart by default, with a one-click South Indian fixed-sign alternative.
- Planetary positions include KP house occupation and a numbered **Signified houses** field, deduplicated from four-fold A/B/C/D significations.
- All 12 Placidus cusps, with sign, star, sub and sub-sub lords.
- Current Vimshottari MD / AD / PD / Sookshma; four-level navigation, date jump, previous/next 120-year cycles, local or UTC timestamps.
- Four-fold KP significations plus separate planet/star/sub house relationships and node sign-lord proxies.
- Mean/true nodes and selectable 365.25, 365.25636 or 360-day dasha year.

## Calculation contract

**Sidereal Krishnamurti mode 5**, traditional sidereal Placidus, geocentric apparent longitudes. UTC is converted to UT1/TT by Swiss Ephemeris before astronomy; UT1 is used for houses. The packaged leap-second table and Delta-T model apply. For pre-1972 dates, Swiss Ephemeris treats input under its documented historical UT convention. Future leap seconds are not known in advance.

Birth dates are supported from **1800 through 2399**, matching the packaged ephemerides. A calculation stops if Swiss data are unavailable or Placidus cannot be computed at the entered polar location. It never silently substitutes Moshier or Porphyry.

KP intervals use an exact integer grid of one-third arcsecond. Every star, sub and sub-sub interval is start-inclusive/end-exclusive. Input longitudes are not rounded before division. Floating-point values within 1e-8 grid ticks of an integer boundary are normalized to that boundary (about 3.3e-9 arcsecond).

House occupation is ecliptic longitude from cusp to next cusp, not whole-sign ownership or a latitude-based 3D house position. Sign ownership is classical; nodes own no signs. Four-fold A/B/C/D means star occupation / planet occupation / star ownership / planet ownership. Sub-lord links and node sign-lord proxies are separate; conjunction, aspect, orb-based node agency and alternate KP school strength rules are not added automatically.

Vimshottari starts with the Moon's nakshatra lord, using its unrounded fractional progress to determine the birth balance. Children divide the full parent period in Vimshottari proportions, beginning with the parent's lord. The first MD includes its pre-birth portion. The default year is **365.25 fixed days**. Timestamps include offsets and seconds; internal boundaries retain fractional milliseconds. Different year conventions yield different dates, so compare like-for-like.

## Verification

See [VERIFICATION.md](VERIFICATION.md). Reference fixtures include the full sample chart, separate native Python calculations, NASA/JPL responses and all reproducible query URLs.

To regenerate the native reference with the **same bundled DE431** data:

```sh
python -m pip install pyswisseph==2.10.3.2
node scripts/extract-ephe.mjs work/ephe431
python scripts/native_reference.py --data-dir work/ephe431
node scripts/sample.mjs
npm test
```

`scripts/native_reference.py` independently implements KP recursion using Python rational arithmetic. If the data directory is empty, it downloads the current upstream data, which are DE441 and can produce small differences; the strict same-data reference test expects DE431. The native binding uses the same Swiss C core, so this is an independent integration/KP check, not an independent astronomical theory. The separate JPL Horizons comparison supplies that additional reference.

`scripts/jpl_reference.py` reuses saved NASA responses by default. Its `--data-dir` option points to independently downloaded DE441 ephemerides. Remove only the relevant saved JPL fixture when intentionally requesting a new response; the NASA service requires internet access.

## Project layout

| File | Responsibility |
| --- | --- |
| `src/astronomy.js` | Swiss adapter, return-flag checks, chart assembly |
| `src/kp.js` | Exact stellar subdivisions, houses, significations |
| `src/time.js` | IANA timezone validation and DST resolution |
| `src/dasha.js` | Vimshottari seed, periods and navigation |
| `src/app.js`, `src/north-chart.js`, `src/style.css` | Interface, both chart layouts and responsive styling |
| `public/vendor/swisseph/` | Pinned wrapper, WASM, ephemerides and upstream license |
| `tests/` | Calculation tests and retained reference fixtures |

`npm run vendor` restores the pinned Swiss browser assets from the installed package. Keep their `src/` and `wasm/` paths together. `scripts/source-archive.mjs` packages corresponding source for the website footer; it excludes dependencies, generated output, private hosting identity and working files.

## Hosting and privacy

Upload the **contents of `dist/`** to any static host at its root URL. Serve `.wasm` as `application/wasm` and `.data` as binary; relative source and WASM paths must remain intact. A source download is included for the AGPL distribution. The app does not store birth data, use analytics or send charts to a server. City search text is sent to Open-Meteo. Google Fonts fetches the display fonts; system fonts are the fallback. All astronomy runs locally once assets load.

Timezone histories come from the browser/OS IANA database; versions may differ and early historical records are incomplete. A modern city's timezone identifier does not guarantee the correct historical jurisdiction for every coordinate/date. City centres are not hospital coordinates. Always check the selected place, historical timezone and birth-time precision.

## License and attribution

Application: **AGPL-3.0-or-later**, see [LICENSE](LICENSE). Swiss Ephemeris: Astrodienst AG; the bundled wrapper is `swisseph-wasm` 0.1.0. Its license notice is preserved, but upstream Swiss Ephemeris's AGPL conditions govern this distribution; this application is supplied as open source. See [THIRD_PARTY.md](THIRD_PARTY.md).

Place data: Open-Meteo / GeoNames. The default Open-Meteo endpoint is for non-commercial use under its service terms; commercial deployment needs a suitable plan or alternate provider. No paid services were configured.
