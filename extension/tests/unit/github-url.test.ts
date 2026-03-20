import { describe, expect, it } from "vitest";
import {
  isAllowedGithubUrl,
  isIssueOrPrDiscussionPath,
  isPullRequestPath,
} from "../../src/lib/github/url.js";

describe("github url helpers", () => {
  it("allows only https github.com", () => {
    expect(isAllowedGithubUrl("https://github.com/foo/bar")).toBe(true);
    expect(isAllowedGithubUrl("http://github.com/foo/bar")).toBe(false);
    expect(isAllowedGithubUrl("https://evil.com/github.com")).toBe(false);
  });

  it("detects issue and pull paths", () => {
    expect(isIssueOrPrDiscussionPath("/acme/repo/issues/12")).toBe(true);
    expect(isIssueOrPrDiscussionPath("/acme/repo/pull/99")).toBe(true);
    expect(isIssueOrPrDiscussionPath("/acme/repo/discussions/1")).toBe(false);
  });

  it("detects pull request paths", () => {
    expect(isPullRequestPath("/acme/repo/pull/3")).toBe(true);
    expect(isPullRequestPath("/acme/repo/issues/3")).toBe(false);
  });
});
