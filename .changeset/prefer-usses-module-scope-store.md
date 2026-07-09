---
"oxlint-plugin-react-doctor": patch
"eslint-plugin-react-doctor": patch
"react-doctor": patch
---

prefer-use-sync-external-store now detects hand-rolled module-scope stores: a mutable module binding plus a listener registry and same-file subscribe function, consumed as `useState(sharedState)` with a `useEffect(() => subscribe(setState), [])`. Publishes fired between the render-time snapshot and the effect-time subscription are lost and concurrent renders can tear — `useSyncExternalStore(subscribe, getSnapshot)` is the fix. Genuine `useSyncExternalStore` usage, imported subscribe functions, and effects with non-empty dependencies stay unflagged.
