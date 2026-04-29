---
"react-doctor": patch
---

Fix knip step ignoring workspace-local config in monorepos (#136). When a workspace owns its own knip config (`knip.json`, `knip.jsonc`, `knip.ts`, etc.), `runKnip` now runs knip with `cwd = workspaceDirectory` so the config is discovered, instead of running from the monorepo root with `--workspace` and silently falling back to knip's defaults — which mass-flagged every file as `Unused file` for setups like TanStack Start whose entry layout doesn't match the defaults. Behavior for monorepos with a root-level `knip.json` containing a `workspaces` mapping is unchanged.
