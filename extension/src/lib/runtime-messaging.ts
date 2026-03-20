import type {
  ExtensionMessage,
  TranslateError,
  TranslateRequest,
} from "./types/messages.js";

export async function requestTranslate(
  payload: TranslateRequest
): Promise<
  | { ok: true; translatedText: string; pathKind: TranslateRequest["pathKind"] }
  | { ok: false; error: TranslateError }
> {
  const requestId = crypto.randomUUID();
  const message: ExtensionMessage = {
    type: "translate/request",
    requestId,
    payload,
  };

  const reply = (await chrome.runtime.sendMessage(message)) as
    | ExtensionMessage
    | undefined;

  if (!reply || reply.requestId !== requestId) {
    return {
      ok: false,
      error: { code: "unknown", message: "번역 응답을 받지 못했습니다." },
    };
  }
  if (reply.type === "translate/result") {
    return {
      ok: true,
      translatedText: reply.payload.translatedText,
      pathKind: reply.payload.pathKind,
    };
  }
  if (reply.type === "translate/error") {
    return { ok: false, error: reply.payload };
  }
  return {
    ok: false,
    error: { code: "unknown", message: "알 수 없는 응답 형식입니다." },
  };
}
