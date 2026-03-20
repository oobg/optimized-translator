import type { GlossaryEntry, UserTranslationPreferences } from "../lib/types/messages.js";
import { translateWithGlossary } from "./translate-pipeline.js";
import { showEnhancedResult, showEnhancedError } from "./enhanced-ui.js";

function buildWiderContext(core: string): string {
  const article =
    document.querySelector(".markdown-body, .comment-body, [data-testid='comment-body']") ??
    document.querySelector("main");
  const ctx = article?.textContent?.trim() ?? "";
  if (!ctx) return core;
  const idx = ctx.indexOf(core.slice(0, Math.min(80, core.length)));
  if (idx < 0) return core;
  const start = Math.max(0, idx - 400);
  const end = Math.min(ctx.length, idx + core.length + 400);
  return ctx.slice(start, end);
}

export async function runEnhancedTranslation(
  text: string,
  prefs: UserTranslationPreferences,
  glossary: GlossaryEntry[]
): Promise<void> {
  const payloadText = buildWiderContext(text);
  const res = await translateWithGlossary(payloadText, prefs, glossary, "enhanced");
  if (!res.ok) {
    showEnhancedError(res.error.message);
    return;
  }
  showEnhancedResult(res.translatedText);
}
