---
"oxlint-plugin-react-doctor": patch
"eslint-plugin-react-doctor": patch
"react-doctor": patch
---

New rule `no-locale-format-in-render` (warn, SSR-capable projects only): flags locale/timezone-dependent formatting evaluated during render — `toLocaleString` / `toLocaleDateString` / `toLocaleTimeString` on date-shaped receivers, `Intl.DateTimeFormat(...).format(...)`, and `Date` default stringification — because the server's locale and timezone differ from the browser's, causing hydration mismatches. Number formatting (`Intl.NumberFormat`, bare `toLocaleString()` on numbers) is deliberately out of scope: its only environment input is the ICU locale, a far weaker mismatch signal that was almost always client-fetched dashboard data in corpus validation. Formatting with an explicit locale and timeZone, inside event handlers or effects, behind client-only guards, or under `suppressHydrationWarning` stays unflagged. `rendering-hydration-no-flicker` gained a matching escape so the recommended post-mount `useEffect` + state fix is never flagged as a flicker.
