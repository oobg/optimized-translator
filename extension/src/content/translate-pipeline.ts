import { applyStrictGlossaryMask, restoreGlossaryMask } from "../lib/glossary/mask.js";
import { requestTranslate } from "../lib/runtime-messaging.js";
import type { GlossaryEntry, TranslateRequest } from "../lib/types/messages.js";
import type { UserTranslationPreferences } from "../lib/types/messages.js";

export async function translateWithGlossary(
  text: string,
  prefs: UserTranslationPreferences,
  glossary: GlossaryEntry[],
  pathKind: TranslateRequest["pathKind"]
): ReturnType<typeof requestTranslate> {
  const { maskedText, replacements } = applyStrictGlossaryMask(text, glossary);
  const res = await requestTranslate({
    text: maskedText,
    targetLanguage: prefs.targetLanguage,
    pathKind,
  });
  if (!res.ok) return res;
  const restored = restoreGlossaryMask(res.translatedText, replacements);
  return { ok: true, translatedText: restored, pathKind: res.pathKind };
}
