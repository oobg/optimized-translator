import { detectLanguageTag } from "../lib/chrome/language-detector.js";
import { translateTextChunked } from "../lib/chrome/translator.js";
import type {
  ExtensionMessage,
  TranslateError,
  TranslateRequest,
  TranslateResult,
} from "../lib/types/messages.js";

export async function handleTranslateRequest(
  requestId: string,
  payload: TranslateRequest
): Promise<ExtensionMessage> {
  const { text, targetLanguage, pathKind } = payload;
  let sourceLanguage = payload.sourceLanguage;

  if (!sourceLanguage) {
    const detected = await detectLanguageTag(text);
    if (detected) sourceLanguage = detected;
  }

  const result = await translateTextChunked(text, sourceLanguage, targetLanguage);
  if (result.ok) {
    const out: TranslateResult = {
      translatedText: result.text,
      pathKind,
    };
    return { type: "translate/result", requestId, payload: out };
  }

  const err: TranslateError = result.error;
  return { type: "translate/error", requestId, payload: err };
}
