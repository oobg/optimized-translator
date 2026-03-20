import { describe, expect, it } from "vitest";
import { extractCommentSpans } from "../../src/lib/code/comment-spans.js";

describe("comment spans", () => {
  it("captures // line comments", () => {
    const src = "const x = 1;\n// hello\n";
    const spans = extractCommentSpans(src);
    expect(spans.length).toBeGreaterThan(0);
    expect(src.slice(spans[0]!.start, spans[0]!.end)).toContain("hello");
  });

  it("captures # shell style comments", () => {
    const src = "echo 1\n# install\n";
    const spans = extractCommentSpans(src);
    expect(spans.some((s) => src.slice(s.start, s.end).includes("install"))).toBe(true);
  });

  it("captures block comments", () => {
    const src = "a/* note */b";
    const spans = extractCommentSpans(src);
    expect(spans.some((s) => src.slice(s.start, s.end).includes("note"))).toBe(true);
  });
});
