import { describe, expect, it } from "vite-plus/test";
import { computeJsxIncludePaths } from "@react-doctor/core";

describe("computeJsxIncludePaths", () => {
  it("returns undefined for empty include paths", () => {
    expect(computeJsxIncludePaths([])).toBeUndefined();
  });

  it("filters to only JSX/TSX files", () => {
    const paths = ["src/app.tsx", "src/utils.ts", "src/Button.jsx", "src/config.js"];
    const result = computeJsxIncludePaths(paths);
    expect(result).toEqual(["src/app.tsx", "src/Button.jsx"]);
  });

  it("returns empty array when no JSX/TSX files exist", () => {
    const paths = ["src/utils.ts", "src/config.js"];
    const result = computeJsxIncludePaths(paths);
    expect(result).toEqual([]);
  });
});
