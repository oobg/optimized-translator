import { showDialog } from "./overlay.js";

export function showEnhancedResult(body: string): void {
  const sel = window.getSelection();
  let x = 120;
  let y = 160;
  if (sel && sel.rangeCount > 0) {
    const r = sel.getRangeAt(0).getBoundingClientRect();
    x = r.left;
    y = r.bottom + 8;
  }
  showDialog({
    x,
    y,
    title: "고정밀 번역 결과",
    body,
    variant: "result",
  });
}

export function showEnhancedError(message: string): void {
  showDialog({
    x: 120,
    y: 160,
    title: "고정밀 번역을 사용할 수 없습니다",
    body: message,
    variant: "error",
  });
}
