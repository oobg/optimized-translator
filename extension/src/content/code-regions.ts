import { extractCommentSpans } from "../lib/code/comment-spans.js";

export function isInsideCodeBlock(el: Node | null): boolean {
  if (!el) return false;
  const host = el.nodeType === Node.TEXT_NODE ? el.parentElement : (el as Element);
  return Boolean(host?.closest("pre, code"));
}

/** 코드 블록 텍스트에서 주석 구간만 잘라 번역 단위 문자열로 반환합니다. */
export function sliceCommentOnlySegments(blockText: string): string[] {
  const spans = extractCommentSpans(blockText);
  return spans.map((s) => blockText.slice(s.start, s.end).trim()).filter(Boolean);
}
