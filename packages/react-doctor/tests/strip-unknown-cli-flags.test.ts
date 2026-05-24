import { describe, expect, it } from "vite-plus/test";
import { stripUnknownCliFlags } from "../src/cli/utils/strip-unknown-cli-flags.js";

const stripUserArguments = (userArguments: ReadonlyArray<string>): string[] =>
  stripUnknownCliFlags(["node", "react-doctor", ...userArguments]).slice(2);

describe("stripUnknownCliFlags", () => {
  it("drops unknown root flags before Commander can treat them as directory arguments", () => {
    expect(stripUserArguments(["--offline", "."])).toEqual(["."]);
    expect(stripUserArguments([".", "--offline"])).toEqual(["."]);
  });

  it("keeps known root flags and their values", () => {
    expect(
      stripUserArguments([
        ".",
        "--no-score",
        "--project",
        "web",
        "--diff",
        "main",
        "--fail-on=warning",
      ]),
    ).toEqual([".", "--no-score", "--project", "web", "--diff", "main", "--fail-on=warning"]);
  });

  it("drops unknown install flags while keeping install options", () => {
    expect(stripUserArguments(["install", "--offline", "--cwd", ".", "--agent-hooks"])).toEqual([
      "install",
      "--cwd",
      ".",
      "--agent-hooks",
    ]);
  });
});
