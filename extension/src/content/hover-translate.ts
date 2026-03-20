import type { GlossaryEntry, UserTranslationPreferences } from "../lib/types/messages.js";
import { isComposeElement } from "../lib/github/compose.js";
import { showOverlay } from "./overlay.js";
import { translateWithGlossary } from "./translate-pipeline.js";

let hoverTimer: number | null = null;
let lastHandle: { dismiss: () => void } | null = null;

export function attachHoverTranslation(
  prefs: () => UserTranslationPreferences,
  glossary: () => GlossaryEntry[],
  enabled: () => boolean
): () => void {
  const onMove = (ev: MouseEvent) => {
    if (!enabled()) return;
    if (hoverTimer !== null) window.clearTimeout(hoverTimer);

    hoverTimer = window.setTimeout(async () => {
      hoverTimer = null;
      const el = document.elementFromPoint(ev.clientX, ev.clientY);
      if (!el || isComposeElement(el)) return;

      const block = el.closest("p, li, td, .markdown-body > *");
      if (!block || block.closest("pre, code")) return;

      const text = block.textContent?.trim() ?? "";
      if (text.length < 20 || text.length > 4000) return;

      lastHandle?.dismiss();
      const p = prefs();
      const g = glossary();
      const res = await translateWithGlossary(text, p, g, "hover");
      if (!res.ok) return;

      const rect = block.getBoundingClientRect();
      lastHandle = showOverlay({
        x: rect.left,
        y: rect.bottom + 4,
        title: "호버 번역",
        body: res.translatedText,
      });
    }, 650);
  };

  const onLeave = () => {
    if (hoverTimer !== null) window.clearTimeout(hoverTimer);
    hoverTimer = null;
  };

  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseleave", onLeave);
  return () => {
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseleave", onLeave);
    if (hoverTimer !== null) window.clearTimeout(hoverTimer);
    lastHandle?.dismiss();
  };
}
