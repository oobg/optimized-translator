export type DownloadState = "idle" | "consent-needed" | "downloading" | "ready" | "cancelled" | "failed";

export type UIState = "hidden" | "wifi-consent-open" | "progress-open" | "error-open" | "result-open";

export type DownloadProgress = {
  loadedBytes?: number;
  totalBytes?: number;
  percent?: number;
  indeterminate?: boolean;
  phaseText?: string;
};

export type EnhancedTranslationFlow = {
  id: string;
  pathKind: "enhanced";
  text: string;
  targetLanguage: string;

  downloadState: DownloadState;
  progress?: DownloadProgress;
  uiState: UIState;

  startedAt: number;
  cancelled: boolean;

  /** Stale 요청(새 requestId가 들어온 경우) 무시용 빠른 체크 */
  isStale: () => boolean;
};

type FlowCleanup = {
  dismissUi?: () => void;
  destroyNative?: () => Promise<void> | void;
};

let activeRequestId: string | null = null;
const cleanupByRequestId = new Map<string, FlowCleanup>();

export function beginEnhancedTranslationFlow(
  requestId: string,
  text: string,
  targetLanguage: string
): EnhancedTranslationFlow {
  // 새 요청이 들어오면 이전 요청을 "stale"로 간주하고, 가능하면 리소스를 해제한다.
  if (activeRequestId && activeRequestId !== requestId) {
    const prevCleanup = cleanupByRequestId.get(activeRequestId);
    prevCleanup?.destroyNative?.();
    prevCleanup?.dismissUi?.();
  }

  activeRequestId = requestId;

  return {
    id: requestId,
    pathKind: "enhanced",
    text,
    targetLanguage,

    downloadState: "idle",
    progress: undefined,
    uiState: "hidden",

    startedAt: Date.now(),
    cancelled: false,
    isStale: () => activeRequestId !== requestId,
  };
}

export function registerEnhancedFlowCleanup(
  requestId: string,
  cleanup: FlowCleanup
): void {
  cleanupByRequestId.set(requestId, cleanup);
}

export function cancelFlow(flow: EnhancedTranslationFlow): void {
  flow.cancelled = true;
  flow.downloadState = "cancelled";
}

export function isCancelledOrStale(flow: EnhancedTranslationFlow): boolean {
  return flow.cancelled || flow.isStale();
}

export function shouldContinue(flow: EnhancedTranslationFlow): boolean {
  return !isCancelledOrStale(flow);
}

