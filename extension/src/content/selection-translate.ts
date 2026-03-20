import type { GlossaryEntry, UserTranslationPreferences } from "../lib/types/messages.js";
import { showOverlay } from "./overlay.js";
import { translateWithGlossary } from "./translate-pipeline.js";

export function attachSelectionTranslation(
  prefs: () => UserTranslationPreferences,
  glossary: () => GlossaryEntry[],
  enabled: () => boolean
): () => void {
  const onMouseUp = async () => {
    if (!enabled()) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (text.length < 2 || text.length > 8000) return;

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const p = prefs();
    const g = glossary();

    const res = await translateWithGlossary(text, p, g, "selection");
    if (!res.ok) {
      showOverlay({
        x: rect.left,
        y: rect.bottom + 6,
        title: "번역할 수 없습니다",
        body: res.error.message,
      });
      return;
    }

    showOverlay({
      x: rect.left,
      y: rect.bottom + 6,
      title: "선택 영역",
      body: res.translatedText,
    });
  };

  document.addEventListener("mouseup", onMouseUp);
  return () => document.removeEventListener("mouseup", onMouseUp);
}
