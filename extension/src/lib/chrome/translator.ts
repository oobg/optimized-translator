import type { TranslateError } from "../types/messages.js";

const CHUNK_SIZE = 8000;

type TranslatorInstance = {
  translate: (text: string) => Promise<string>;
  destroy?: () => Promise<void>;
};

type TranslatorCtor = {
  availability: (options: Record<string, string>) => Promise<string>;
  create: (
    options: Record<string, string> & {
      monitor?: (monitor: unknown) => void;
    }
  ) => Promise<TranslatorInstance>;
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

export type NativeDownloadProgress = {
  loadedBytes?: number;
  totalBytes?: number;
  percent?: number;
  indeterminate?: boolean;
  /** 다운로드 막바지 이후 단계 표시(가능한 경우) */
  phaseText?: string;
};

export type NativeTranslationController = {
  promise: Promise<{ ok: true; text: string } | { ok: false; error: TranslateError }>;
  cancel: () => Promise<void> | void;
};

class NativeEnhancedCancelledError extends Error {
  name = "NativeEnhancedCancelledError";
}

function toNativeDownloadProgress(e: unknown): NativeDownloadProgress | undefined {
  if (!e || typeof e !== "object") return undefined;
  const ev = e as { loaded?: number; total?: number };

  const loaded = typeof ev.loaded === "number" ? ev.loaded : undefined;
  const total = typeof ev.total === "number" ? ev.total : undefined;

  if (typeof loaded !== "number" && typeof total !== "number") return undefined;

  const percent =
    typeof loaded === "number" && typeof total === "number" && total > 0
      ? (loaded / total) * 100
      : undefined;

  const reached100 =
    typeof percent === "number" && Number.isFinite(percent) ? percent >= 100 : false;

  return {
    loadedBytes: loaded,
    totalBytes: total,
    percent: typeof percent === "number" && Number.isFinite(percent) ? percent : undefined,
    indeterminate: reached100 ? false : typeof percent !== "number",
    phaseText: reached100 ? "추출/메모리 로딩 중…" : undefined,
  };
}

export function translateTextNativeChunkedWithProgressCancelable(params: {
  text: string;
  sourceLanguage: string | undefined;
  targetLanguage: string;
  onProgress: (progress: NativeDownloadProgress) => void;
}): NativeTranslationController {
  const { text, sourceLanguage, targetLanguage, onProgress } = params;
  const trimmed = text.trim();
  const fallbackError: TranslateError = { code: "unknown", message: "취소됨" };

  if (!trimmed) {
    return {
      promise: Promise.resolve({
        ok: false,
        error: { code: "empty-input", message: "번역할 텍스트가 없습니다." },
      }),
      cancel: () => undefined,
    };
  }

  const Ctor = getTranslatorCtor();
  if (!Ctor) {
    return {
      promise: Promise.resolve({
        ok: false,
        error: {
          code: "translator-unavailable",
          message: "Chrome Translator API를 사용할 수 없습니다.",
        },
      }),
      cancel: () => undefined,
    };
  }

  let cancelled = false;
  let translator: TranslatorInstance | undefined;
  let createResolved = false;
  let lastLogAt = 0;
  let lastLoggedPercent: number | undefined;

  const cancel = async () => {
    cancelled = true;
    console.debug("[ot/native-enhanced]", { event: "cancelled", targetLanguage });
    try {
      if (createResolved) await translator?.destroy?.();
    } catch {
      // ignore
    }
  };

  const monitor = (m: unknown) => {
    if (!m || typeof m !== "object") return;
    const mon = m as Record<string, unknown> & {
      addEventListener?: (type: string, cb: (ev: unknown) => void) => void;
    };

    const attach = (cb: (ev: unknown) => void): void => {
      if (typeof mon.addEventListener === "function") {
        mon.addEventListener("downloadprogress", cb);
        return;
      }

      const anyMon = m as unknown as { ondownloadprogress?: (ev: unknown) => void };
      if ("ondownloadprogress" in anyMon) {
        anyMon.ondownloadprogress = cb;
      }
    };

    attach((ev) => {
      if (cancelled) return;
      const progress = toNativeDownloadProgress(ev);
      if (!progress) return;
      onProgress(progress);

      const now = Date.now();
      const percent = typeof progress.percent === "number" ? Math.round(progress.percent) : undefined;
      const shouldLog = now - lastLogAt > 700 || percent !== lastLoggedPercent || progress.phaseText;
      if (shouldLog) {
        lastLogAt = now;
        lastLoggedPercent = percent;
        console.debug("[ot/native-enhanced]", {
          event: "download-progress",
          targetLanguage,
          percent,
          loadedBytes: progress.loadedBytes,
          totalBytes: progress.totalBytes,
          phaseText: progress.phaseText,
        });
      }
    });
  };

  const createOpts =
    sourceLanguage === undefined || sourceLanguage === ""
      ? ({ targetLanguage } as Record<string, string>)
      : ({ sourceLanguage, targetLanguage } as Record<string, string>);

  const createPromise = Ctor.create({
    ...createOpts,
    monitor,
  });

  const promise = createPromise
    .then(async (t) => {
      createResolved = true;
      translator = t;

      if (cancelled) {
        await translator?.destroy?.();
        throw new NativeEnhancedCancelledError();
      }

      const parts: string[] = [];
      for (let i = 0; i < trimmed.length; i += CHUNK_SIZE) {
        if (cancelled) throw new NativeEnhancedCancelledError();
        const slice = trimmed.slice(i, i + CHUNK_SIZE);
        parts.push(await translator.translate(slice));
      }

      await translator.destroy?.();
      console.debug("[ot/native-enhanced]", { event: "completed", targetLanguage });
      return { ok: true as const, text: parts.join("") };
    })
    .catch((e: unknown) => {
      if (e instanceof NativeEnhancedCancelledError || cancelled) {
        return {
          ok: false as const,
          error: fallbackError,
        };
      }
      const mapped = toTranslateError(e, "번역 중 오류가 발생했습니다.");
      console.debug("[ot/native-enhanced]", {
        event: "failed",
        targetLanguage,
        error: mapped,
      });
      return { ok: false as const, error: mapped };
    });

  return { promise, cancel };
}
