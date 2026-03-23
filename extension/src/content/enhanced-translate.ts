import type {
  GlossaryEntry,
  TranslateError,
  UserTranslationPreferences,
} from "../lib/types/messages.js";
import {
  checkTranslatorAvailability,
  translateTextNativeChunkedWithProgressCancelable,
  type NativeTranslationController,
} from "../lib/chrome/translator.js";
import { translateWithGlossary } from "./translate-pipeline.js";
import { showEnhancedResult } from "./enhanced-ui.js";
import { showOverlay } from "./overlay.js";
import {
  beginEnhancedTranslationFlow,
  cancelFlow,
  registerEnhancedFlowCleanup,
  shouldContinue,
} from "./enhanced-flow.js";
import {
  showCancelledDialog,
  showDownloadErrorDialog,
  showDownloadProgressDialog,
  showWifiConsentDialog,
} from "./enhanced-download-ui.js";
import { applyStrictGlossaryMask, restoreGlossaryMask } from "../lib/glossary/mask.js";

function getSelectionAnchor(): { x: number; y: number } {
  const sel = window.getSelection();
  let x = 120;
  let y = 160;
  if (sel && sel.rangeCount > 0) {
    const r = sel.getRangeAt(0).getBoundingClientRect();
    x = r.left;
    y = r.bottom + 8;
  }
  return { x, y };
}

function errorToUserMessage(error: TranslateError): string {
  switch (error.code) {
    case "translator-unavailable":
      return "Chrome Translator API를 사용할 수 없습니다. Chrome 설정에서 AI 기능을 확인해 주세요.";
    case "model-download-required":
      return "AI 모델 다운로드가 필요하지만 완료하지 못했습니다. 네트워크 상태를 확인해 주세요.";
    case "policy-blocked":
      return "AI 번역이 정책/권한에 의해 차단되었습니다. Chrome에서 AI 관련 설정을 확인해 주세요.";
    case "invalid-language-pair":
      return "지원하지 않는 언어 조합입니다.";
    case "empty-input":
      return "번역할 텍스트가 없습니다.";
    case "unknown":
    default:
      return error.message || "고정밀 번역에 실패했습니다.";
  }
}

async function runDefaultSelectionTranslation(params: {
  anchor: { x: number; y: number };
  text: string;
  prefs: UserTranslationPreferences;
  glossary: GlossaryEntry[];
}): Promise<void> {
  const { anchor, text, prefs, glossary } = params;
  const res = await translateWithGlossary(text, prefs, glossary, "selection");
  if (!res.ok) {
    showOverlay({
      x: anchor.x,
      y: anchor.y,
      title: "번역할 수 없습니다",
      body: res.error.message,
    });
    return;
  }
  showOverlay({
    x: anchor.x,
    y: anchor.y,
    title: "선택 영역",
    body: res.translatedText,
  });
}

export async function runEnhancedTranslation(
  requestId: string,
  text: string,
  prefs: UserTranslationPreferences,
  glossary: GlossaryEntry[]
): Promise<void> {
  const flow = beginEnhancedTranslationFlow(requestId, text, prefs.targetLanguage);
  const anchor = getSelectionAnchor();
  const { maskedText, replacements } = applyStrictGlossaryMask(text, glossary);

  console.debug("[ot/enhanced]", { event: "start", requestId, targetLanguage: prefs.targetLanguage });

  const availability = await checkTranslatorAvailability(undefined, prefs.targetLanguage);
  if (!shouldContinue(flow)) return;

  const startNativeDownloadAndTranslate = async () => {
    if (!shouldContinue(flow)) return;

    flow.downloadState = "downloading";
    flow.uiState = "progress-open";
    console.debug("[ot/enhanced]", { event: "consent-accepted", requestId });

    let controller: NativeTranslationController | null = null;
    const progressDialog = showDownloadProgressDialog({
      x: anchor.x,
      y: anchor.y,
      onCancel: () => {
        if (!shouldContinue(flow)) return;
        console.debug("[ot/enhanced]", { event: "cancelled", requestId });

        cancelFlow(flow);
        flow.uiState = "error-open";
        progressDialog.handle.dismiss();

        // 네이티브 다운로드/세션 종료(가능한 범위에서) - UI 업데이트는 flow 가드로 제어
        void controller?.cancel();

        const cancelledDialog = showCancelledDialog({
          x: anchor.x,
          y: anchor.y,
          onFallback: () => {
            void runDefaultSelectionTranslation({
              anchor,
              text: flow.text,
              prefs,
              glossary,
            });
          },
        });
        registerEnhancedFlowCleanup(flow.id, { dismissUi: () => cancelledDialog.dismiss() });
      },
    });

    controller = translateTextNativeChunkedWithProgressCancelable({
      text: maskedText,
      sourceLanguage: undefined,
      targetLanguage: flow.targetLanguage,
      onProgress: (p) => {
        if (!shouldContinue(flow)) return;
        flow.progress = p;
        progressDialog.renderProgress(p);
        console.debug("[ot/enhanced]", { event: "download-progress", requestId, percent: p.percent });
      },
    });

    if (!controller) return;
    registerEnhancedFlowCleanup(flow.id, {
      dismissUi: () => progressDialog.handle.dismiss(),
      destroyNative: controller.cancel,
    });

    const res = await controller.promise;
    if (!shouldContinue(flow)) return;

    if (res.ok) {
      flow.downloadState = "ready";
      flow.uiState = "result-open";
      console.debug("[ot/enhanced]", { event: "completed", requestId });
      showEnhancedResult(restoreGlossaryMask(res.text, replacements));
      return;
    }

    flow.downloadState = "failed";
    flow.uiState = "error-open";
    console.debug("[ot/enhanced]", { event: "failed", requestId, error: res.error });

    showDownloadErrorDialog({
      x: anchor.x,
      y: anchor.y,
      message: errorToUserMessage(res.error),
      onFallback: () => {
        void runDefaultSelectionTranslation({
          anchor,
          text: flow.text,
          prefs,
          glossary,
        });
      },
    });
  };

  if (availability === "downloadable") {
    flow.downloadState = "consent-needed";
    flow.uiState = "wifi-consent-open";
    console.debug("[ot/enhanced]", { event: "consent-open", requestId });

    const consentDialog = showWifiConsentDialog({
      x: anchor.x,
      y: anchor.y,
      onAccept: () => {
        if (!shouldContinue(flow)) return;
        consentDialog.dismiss();
        void startNativeDownloadAndTranslate();
      },
      onCancel: () => {
        if (!shouldContinue(flow)) return;
        console.debug("[ot/enhanced]", { event: "cancelled", requestId });
        cancelFlow(flow);
        flow.uiState = "error-open";
        consentDialog.dismiss();

        showCancelledDialog({
          x: anchor.x,
          y: anchor.y,
          onFallback: () => {
            void runDefaultSelectionTranslation({
              anchor,
              text: flow.text,
              prefs,
              glossary,
            });
          },
        });
      },
    });

    registerEnhancedFlowCleanup(flow.id, {
      dismissUi: () => consentDialog.dismiss(),
    });
    return;
  }

  if (availability === "available") {
    // Wi-Fi 권장 동의 단계 없이 즉시 진행
    void startNativeDownloadAndTranslate();
    return;
  }

  // unavailable 등
  showDownloadErrorDialog({
    x: anchor.x,
    y: anchor.y,
    message: errorToUserMessage({
      code: "translator-unavailable",
      message: "고정밀 번역을 사용할 수 없습니다.",
    }),
    onFallback: () => {
      void runDefaultSelectionTranslation({
        anchor,
        text: flow.text,
        prefs,
        glossary,
      });
    },
  });

  console.debug("[ot/enhanced]", { event: "failed", requestId, availability });
}
