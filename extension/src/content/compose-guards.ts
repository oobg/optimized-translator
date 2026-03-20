import { isComposeSurfaceActive } from "../lib/github/compose.js";
import { shouldRestrictFullPageOnPullRequest } from "../lib/github/pr-mode.js";
import { CAPABILITIES } from "../lib/github/surface-capabilities.js";

export function allowFullPageTranslation(): boolean {
  if (isComposeSurfaceActive()) return CAPABILITIES.composeFocused.fullPage;
  if (shouldRestrictFullPageOnPullRequest()) {
    return CAPABILITIES.githubPullRequestWrite.fullPage;
  }
  return CAPABILITIES.githubReadDiscussion.fullPage;
}

export function allowHoverTranslation(): boolean {
  if (isComposeSurfaceActive()) return CAPABILITIES.composeFocused.hover;
  if (shouldRestrictFullPageOnPullRequest()) {
    return CAPABILITIES.githubPullRequestWrite.hover;
  }
  return CAPABILITIES.githubReadDiscussion.hover;
}
