import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { serverAfterNonblocking } from "./server-after-nonblocking.js";

describe("server/server-after-nonblocking — regressions", () => {
  it("flags an analytics call inside a server action", () => {
    const result = runRule(
      serverAfterNonblocking,
      `"use server";
export async function save(data) {
  analytics.track("saved", data);
}`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });

  it("still flags when the `analytics` receiver is wrapped in `as any`", () => {
    const result = runRule(
      serverAfterNonblocking,
      `"use server";
export async function save(data) {
  (analytics as any).track("saved", data);
}`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });
});
