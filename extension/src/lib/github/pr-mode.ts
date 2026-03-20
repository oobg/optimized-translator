import { isComposeElement, isComposeSurfaceActive } from "./compose.js";
import { isPullRequestPath } from "./url.js";

export function isPullRequestPage(): boolean {
  return isPullRequestPath(location.pathname);
}

/**
 * Heuristic: PR 페이지에서 댓글/본문 작성용 표면이 활성인지(Write 탭, 포커스된 textarea 등).
 */
export function isPullRequestWriteSurfaceActive(): boolean {
  if (!isPullRequestPage()) return false;

  const writeTabSelected = Boolean(
    document.querySelector(
      '.tabnav-tabs a.tabnav-tab.selected[href*="pull"], .tabnav-tab[aria-selected="true"]'
    )
  );

  const active = document.activeElement;
  if (active instanceof HTMLTextAreaElement || active instanceof HTMLInputElement) {
    if (isComposeElement(active)) return true;
  }

  const openComposer = document.querySelector(
    'textarea.js-comment-field, textarea[name="comment[body]"], .js-previewable-comment-form textarea'
  );
  if (openComposer instanceof HTMLTextAreaElement && document.activeElement === openComposer) {
    return true;
  }

  return writeTabSelected && Boolean(document.querySelector("textarea.js-comment-field"));
}

export function shouldRestrictFullPageOnPullRequest(): boolean {
  return isPullRequestPage() && (isPullRequestWriteSurfaceActive() || isComposeSurfaceActive());
}
