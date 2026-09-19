# Third-party components

- [Swiss Ephemeris](https://www.astro.com/swisseph/) 2.10.03 — Astrodienst AG; AGPL / professional dual-license. This project uses the AGPL route. DE431 planetary/lunar data are bundled inside `swisseph.data`.
- [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm/tree/v0.1.0) 0.1.0 — wrapper and compiled assets; upstream LICENSE preserved in `public/vendor/swisseph/LICENSE`. The wrapper's older description of Swiss licensing does not override [Astrodienst's current license terms](https://www.astro.com/swisseph/swephprg.htm).
- [Luxon](https://github.com/moment/luxon) 3.7.2 — MIT.
- [Vite](https://github.com/vitejs/vite), [Playwright](https://github.com/microsoft/playwright), [fflate](https://github.com/101arrowz/fflate) — dependency licenses retained by npm; versions pinned in the lockfile.
- [Open-Meteo geocoding](https://open-meteo.com/en/docs/geocoding-api) and [GeoNames](https://www.geonames.org/) — city coordinates and IANA timezone identifiers. See provider terms for deployment usage.
- [NASA/JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) — independent reference ephemeris responses retained in tests. The software is not endorsed by NASA, JPL or Astrodienst.

Reference sources for calculation conventions: [Swiss programming manual](https://www.astro.com/swisseph/swephprg.htm), [Swiss sidereal documentation](https://www.astro.com/swisseph/swisseph.htm), and [Natal horoscope/significator worksheets](https://astrocounselor.com/pdf/15.pdf). Astrological school-specific interpretations are identified in the README rather than represented as universal rules.
