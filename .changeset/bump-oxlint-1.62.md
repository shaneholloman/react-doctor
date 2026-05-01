---
"react-doctor": patch
---

chore(react-doctor): bump oxlint to ^1.62.0

Pulls in oxlint v1.61.0 + v1.62.0 improvements (additional Vue rules,
jest/vitest rule splits, autofix for prefer-template, no-unknown-property
support for React 19's precedence prop, jsx-a11y/anchor-is-valid attribute
settings, and various correctness fixes). The release-line breaking
changes are internal Rust API only — oxlint's CLI and config schema
are unchanged.
