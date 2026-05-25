import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import {
  Config,
  DeadCode,
  Files,
  Git,
  layerOtlp,
  Linter,
  LintPartialFailures,
  Progress,
  Project,
  Reporter,
  resolveScanTarget,
  restoreLegacyThrow,
  runInspect,
  Score,
  type InspectOutput,
} from "@react-doctor/core";
import type { DiagnoseOptions, DiagnoseResult } from "@react-doctor/core";

const buildLayerStack = () =>
  Layer.mergeAll(
    Project.layerNode,
    Config.layerNode,
    Files.layerNode,
    Git.layerNode,
    Linter.layerOxlint,
    LintPartialFailures.layerLive,
    DeadCode.layerNode,
    Progress.layerNoop,
    Score.layerHttp,
    Reporter.layerNoop,
  );

export const diagnose = async (
  directory: string,
  options: DiagnoseOptions = {},
): Promise<DiagnoseResult> => {
  const startTime = globalThis.performance.now();

  // `resolveScanTarget` is the canonical entry-point translation: it
  // loads the user config, honors `config.rootDir`, and walks into a
  // nested React subproject when the requested directory lacks a
  // package.json (raising `AmbiguousProjectError` for multiple
  // candidates, `ProjectNotFoundError` otherwise — propagated by
  // `runInspect` via `restoreLegacyThrow`).
  const scanTarget = resolveScanTarget(directory);

  const includePaths = options.includePaths ?? [];

  const program = runInspect({
    directory: scanTarget.resolvedDirectory,
    includePaths,
    customRulesOnly: scanTarget.userConfig?.customRulesOnly ?? false,
    respectInlineDisables:
      options.respectInlineDisables ?? scanTarget.userConfig?.respectInlineDisables ?? true,
    adoptExistingLintConfig: scanTarget.userConfig?.adoptExistingLintConfig ?? true,
    ignoredTags: new Set(scanTarget.userConfig?.ignore?.tags ?? []),
    runDeadCode: options.deadCode ?? scanTarget.userConfig?.deadCode ?? true,
    isCi: false,
    resolveLocalGithubViewerPermission: true,
  });

  const output: InspectOutput = await Effect.runPromise(
    restoreLegacyThrow(
      program.pipe(
        Effect.provide(buildLayerStack()),
        // Opt-in OTLP exporter. No-op unless REACT_DOCTOR_OTLP_ENDPOINT
        // + REACT_DOCTOR_OTLP_AUTH_HEADER are set in the environment;
        // see `core/observability.ts` for the env-driven config.
        Effect.provide(layerOtlp),
      ),
    ),
  );

  // HACK: preserve the legacy behavior of writing lint failures to
  // stderr. The orchestrator already folds them into didLintFail /
  // lintFailureReason; this mirror keeps long-running scripts that
  // grep stderr for "Lint failed" working unchanged.
  if (output.didLintFail && output.lintFailureReason !== null) {
    console.error("Lint failed:", output.lintFailureReason);
  }

  const skippedChecks: string[] = [];
  const skippedCheckReasons: Record<string, string> = {};
  if (output.didDeadCodeFail && output.deadCodeFailureReason !== null) {
    skippedChecks.push("dead-code");
    skippedCheckReasons["dead-code"] = output.deadCodeFailureReason;
  }

  return {
    diagnostics: [...output.diagnostics],
    score: output.score,
    skippedChecks,
    ...(Object.keys(skippedCheckReasons).length > 0 ? { skippedCheckReasons } : {}),
    project: output.project,
    elapsedMilliseconds: globalThis.performance.now() - startTime,
  };
};
