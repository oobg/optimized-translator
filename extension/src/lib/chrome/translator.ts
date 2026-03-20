import type { TranslateError } from "../types/messages.js";

const CHUNK_SIZE = 8000;

type TranslatorInstance = {
  translate: (text: string) => Promise<string>;
  destroy?: () => Promise<void>;
};

type TranslatorCtor = {
  availability: (options: Record<string, string>) => Promise<string>;
  create: (options: Record<string, string>) => Promise<TranslatorInstance>;
};

function getTranslatorCtor(): TranslatorCtor | undefined {
  return (globalThis as unknown as { Translator?: TranslatorCtor }).Translator;
}

function toTranslateError(err: unknown, fallback: string): TranslateError {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (lower.includes("download") || lower.includes("model")) {
    return { code: "model-download-required", message: msg || fallback };
  }
  if (lower.includes("policy") || lower.includes("blocked") || lower.includes("permission")) {
    return { code: "policy-blocked", message: msg || fallback };
  }
  if (lower.includes("language") || lower.includes("pair")) {
    return { code: "invalid-language-pair", message: msg || fallback };
  }
  return { code: "unknown", message: msg || fallback };
}

export async function checkTranslatorAvailability(
  sourceLanguage: string | undefined,
  targetLanguage: string
): Promise<string> {
  const Ctor = getTranslatorCtor();
  if (!Ctor) {
    return "unavailable";
  }
  try {
    const opts =
      sourceLanguage === undefined || sourceLanguage === ""
        ? { targetLanguage }
        : { sourceLanguage, targetLanguage };
    return await Ctor.availability(opts);
  } catch {
    return "unavailable";
  }
}

export async function translateTextChunked(
  text: string,
  sourceLanguage: string | undefined,
  targetLanguage: string
): Promise<{ ok: true; text: string } | { ok: false; error: TranslateError }> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, error: { code: "empty-input", message: "번역할 텍스트가 없습니다." } };
  }

  const Ctor = getTranslatorCtor();
  if (!Ctor) {
    return {
      ok: false,
      error: {
        code: "translator-unavailable",
        message: "Chrome Translator API를 사용할 수 없습니다.",
      },
    };
  }

  const availability = await checkTranslatorAvailability(sourceLanguage, targetLanguage);
  if (availability !== "available" && availability !== "downloadable") {
    return {
      ok: false,
      error: {
        code: "translator-unavailable",
        message: "번역기를 사용할 수 없습니다. Chrome 설정에서 AI 기능을 확인하세요.",
      },
    };
  }

  try {
    const createOpts =
      sourceLanguage === undefined || sourceLanguage === ""
        ? { targetLanguage }
        : { sourceLanguage, targetLanguage };
    const translator = await Ctor.create(createOpts);

    const parts: string[] = [];
    for (let i = 0; i < trimmed.length; i += CHUNK_SIZE) {
      const slice = trimmed.slice(i, i + CHUNK_SIZE);
      parts.push(await translator.translate(slice));
    }
    await translator.destroy?.();
    return { ok: true, text: parts.join("") };
  } catch (e) {
    return { ok: false, error: toTranslateError(e, "번역 중 오류가 발생했습니다.") };
  }
}
