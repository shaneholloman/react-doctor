---
"oxlint-plugin-react-doctor": patch
"eslint-plugin-react-doctor": patch
"react-doctor": patch
---

Detection robustness against verdict-preserving source rewrites: rules no longer go silent when the same defect is spelled with a slightly different shape. `Date.now()` / `Math.random()` / `performance.now()` / `crypto.randomUUID()` and namespace-import calls like `React.forwardRef` now match through TS cast wrappers (`(Date as any).now()`, `(React!).forwardRef`); `prefer-use-sync-external-store` recognizes resync handlers written as block-bodied returns (`() => { return setX(read()); }`); and effect-body analyses (`no-derived-state-effect`, `rendering-hydration-no-flicker`, and everything on `getCallbackStatements`) skip no-op statements (`void 0;`, stray directives) instead of letting them flip a "body contains only setState" check.
