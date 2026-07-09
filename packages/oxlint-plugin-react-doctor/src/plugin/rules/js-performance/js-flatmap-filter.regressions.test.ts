import { describe, expect, it } from "vite-plus/test";
import { runRule } from "../../../test-utils/run-rule.js";
import { jsFlatmapFilter } from "./js-flatmap-filter.js";

describe("js-performance/js-flatmap-filter — regressions", () => {
  it("still flags `.map().filter(Boolean)` when the inner call is wrapped in `as any`", () => {
    const result = runRule(
      jsFlatmapFilter,
      `const ids = (items.map((item) => item.id) as any).filter(Boolean);`,
    );
    expect(result.parseErrors).toEqual([]);
    expect(result.diagnostics).toHaveLength(1);
  });
});
