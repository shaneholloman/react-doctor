---
"react-doctor": patch
---

fix(react-doctor): filter React Compiler rules to those the loaded `eslint-plugin-react-hooks` actually exports

Follow-up to the #141 fix in 0.0.46. The peer range `^6 || ^7` allows
v6.x of `eslint-plugin-react-hooks`, which doesn't expose the
`void-use-memo` rule (added in v7). When a v6 user had React
Compiler detected, oxlint failed with
`Rule 'void-use-memo' not found in plugin 'react-hooks-js'`. The
config now introspects the loaded plugin's `rules` map and only
enables `react-hooks-js/*` entries that the installed version
actually exports — so future rule additions or removals can no
longer crash a scan.
