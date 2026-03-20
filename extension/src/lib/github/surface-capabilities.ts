/**
 * GitHub UI 상태별 허용 매트릭스 (FR-007, FR-008, contracts/github-surface.md).
 * 값은 런타임 가드(pr-mode, compose)와 함께 사용됩니다.
 */
export type TranslationMode = "fullPage" | "hover" | "selection" | "enhanced";

export const CAPABILITIES = {
  /** 일반 이슈/PR 읽기 화면 */
  githubReadDiscussion: {
    fullPage: true,
    hover: true,
    selection: true,
    enhanced: true,
  },
  /** PR 작성/댓글 작성 표면 근처 */
  githubPullRequestWrite: {
    fullPage: false,
    hover: true,
    selection: true,
    enhanced: true,
  },
  /** compose 필드에 포커스 */
  composeFocused: {
    fullPage: false,
    hover: false,
    selection: true,
    enhanced: true,
  },
} as const satisfies Record<string, Record<TranslationMode, boolean>>;
