import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runKnip } from "../src/utils/run-knip.js";

interface CapturedKnipOptions {
  cwd: string;
  workspace?: string;
}

const { capturedKnipCalls } = vi.hoisted(() => ({
  capturedKnipCalls: [] as CapturedKnipOptions[],
}));

vi.mock("knip", () => ({
  main: async () => ({
    issues: {
      files: new Set<string>(),
      dependencies: {},
      devDependencies: {},
      unlisted: {},
      exports: {},
      types: {},
      duplicates: {},
    },
    counters: {},
  }),
}));

vi.mock("knip/session", () => ({
  createOptions: async (options: { cwd: string; workspace?: string }) => {
    capturedKnipCalls.push({ cwd: options.cwd, workspace: options.workspace });
    return { parsedConfig: {} };
  },
}));

const writeJson = (filePath: string, contents: unknown): void => {
  fs.writeFileSync(filePath, JSON.stringify(contents));
};

const createMonorepoFixture = (
  workspaceLocalKnipConfig: boolean,
  rootKnipConfig: boolean,
): { monorepoRoot: string; workspaceDirectory: string } => {
  const monorepoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-knip-monorepo-"));
  fs.writeFileSync(path.join(monorepoRoot, "pnpm-workspace.yaml"), 'packages:\n  - "packages/*"\n');
  writeJson(path.join(monorepoRoot, "package.json"), { name: "monorepo", private: true });
  fs.mkdirSync(path.join(monorepoRoot, "node_modules"));

  if (rootKnipConfig) {
    writeJson(path.join(monorepoRoot, "knip.json"), {});
  }

  const workspaceDirectory = path.join(monorepoRoot, "packages", "foo");
  fs.mkdirSync(workspaceDirectory, { recursive: true });
  writeJson(path.join(workspaceDirectory, "package.json"), { name: "foo" });

  if (workspaceLocalKnipConfig) {
    writeJson(path.join(workspaceDirectory, "knip.json"), {});
  }

  return { monorepoRoot, workspaceDirectory };
};

describe("runKnip", () => {
  let monorepoFixtureRoot: string | null = null;

  beforeEach(() => {
    capturedKnipCalls.length = 0;
    monorepoFixtureRoot = null;
  });

  afterEach(() => {
    if (monorepoFixtureRoot) {
      fs.rmSync(monorepoFixtureRoot, { recursive: true, force: true });
    }
  });

  it("runs knip from the workspace directory when the workspace owns a knip config", async () => {
    const fixture = createMonorepoFixture(true, false);
    monorepoFixtureRoot = fixture.monorepoRoot;

    await runKnip(fixture.workspaceDirectory);

    expect(capturedKnipCalls).toHaveLength(1);
    expect(capturedKnipCalls[0].cwd).toBe(fixture.workspaceDirectory);
    expect(capturedKnipCalls[0].workspace).toBeUndefined();
  });

  it("prefers workspace-local config even when a root knip config exists", async () => {
    const fixture = createMonorepoFixture(true, true);
    monorepoFixtureRoot = fixture.monorepoRoot;

    await runKnip(fixture.workspaceDirectory);

    expect(capturedKnipCalls).toHaveLength(1);
    expect(capturedKnipCalls[0].cwd).toBe(fixture.workspaceDirectory);
  });

  it("runs knip from the monorepo root with --workspace when no workspace-local config exists", async () => {
    const fixture = createMonorepoFixture(false, true);
    monorepoFixtureRoot = fixture.monorepoRoot;

    await runKnip(fixture.workspaceDirectory);

    expect(capturedKnipCalls).toHaveLength(1);
    expect(capturedKnipCalls[0].cwd).toBe(fixture.monorepoRoot);
    expect(capturedKnipCalls[0].workspace).toBe("foo");
  });

  it("returns no diagnostics when dependencies are not installed", async () => {
    const standaloneRoot = fs.mkdtempSync(path.join(os.tmpdir(), "run-knip-standalone-"));
    try {
      writeJson(path.join(standaloneRoot, "package.json"), { name: "standalone" });

      const diagnostics = await runKnip(standaloneRoot);

      expect(diagnostics).toEqual([]);
      expect(capturedKnipCalls).toHaveLength(0);
    } finally {
      fs.rmSync(standaloneRoot, { recursive: true, force: true });
    }
  });
});
