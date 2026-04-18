import type { Diagnostic, ReactDoctorConfig, ScoreResult } from "../types.js";
import { calculateScore as calculateScoreNode } from "../utils/calculate-score-node.js";
import { mergeAndFilterDiagnostics } from "../utils/merge-and-filter-diagnostics.js";

export interface BuildDiagnoseResultInput {
  mergedDiagnostics: Diagnostic[];
  rootDirectory: string;
  userConfig: ReactDoctorConfig | null;
  readFileLinesSync: (filePath: string) => string[] | null;
  startTime: number;
  score?: ScoreResult | null;
  calculateDiagnosticsScore?: (diagnostics: Diagnostic[]) => Promise<ScoreResult | null>;
}

export interface BuildDiagnoseTimedResult {
  diagnostics: Diagnostic[];
  score: ScoreResult | null;
  elapsedMilliseconds: number;
}

export const buildDiagnoseTimedResult = async (
  input: BuildDiagnoseResultInput,
): Promise<BuildDiagnoseTimedResult> => {
  const diagnostics = mergeAndFilterDiagnostics(
    input.mergedDiagnostics,
    input.rootDirectory,
    input.userConfig,
    input.readFileLinesSync,
  );
  const elapsedMilliseconds = globalThis.performance.now() - input.startTime;
  const scoreCalculator = input.calculateDiagnosticsScore ?? calculateScoreNode;
  const score = input.score !== undefined ? input.score : await scoreCalculator(diagnostics);
  return { diagnostics, score, elapsedMilliseconds };
};
