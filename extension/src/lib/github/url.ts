const GITHUB_HOST = "github.com";

export function isAllowedGithubUrl(href: string): boolean {
  try {
    const u = new URL(href);
    return u.hostname === GITHUB_HOST && u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isIssueOrPrDiscussionPath(pathname: string): boolean {
  return /\/[^/]+\/[^/]+\/(issues|pull)\/\d+(\/|$)/.test(pathname);
}

export function isPullRequestPath(pathname: string): boolean {
  return /\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/.test(pathname);
}

export function isRepoRootOrTreePath(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < 2) return false;
  if (parts.length === 2) return true;
  return parts[2] === "tree" || parts[2] === "blob" || parts[2] === "wiki";
}
