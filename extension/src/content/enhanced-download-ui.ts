import { showDialog, type DialogHandle, type DialogProgress } from "./overlay.js";
import type { DownloadProgress } from "./enhanced-flow.js";

function bytesToHuman(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx += 1;
  }
  const rounded = idx === 0 ? Math.round(val) : Math.round(val * 10) / 10;
  return `${rounded}${units[idx]}`;
}

export function showWifiConsentDialog(params: {
  x: number;
  y: number;
  onAccept: () => void;
  onCancel: () => void;
}): DialogHandle {
  return showDialog({
    x: params.x,
    y: params.y,
    variant: "wifi-consent",
    title: "Wi-Fi 권장",
    body: "모델 다운로드가 필요할 수 있습니다. Wi-Fi 환경에서 동의 시 다운로드를 시작합니다.",
    buttons: [
      { label: "동의하고 다운로드", variant: "primary", onClick: params.onAccept },
      { label: "취소", variant: "secondary", onClick: params.onCancel },
    ],
  });
}

export function showDownloadProgressDialog(params: {
  x: number;
  y: number;
  onCancel: () => void;
}): {
  handle: DialogHandle;
  renderProgress: (progress: DownloadProgress) => void;
} {
  const handle = showDialog({
    x: params.x,
    y: params.y,
    variant: "progress",
    title: "모델 다운로드 중…",
    body: "다운로드/설치를 진행하는 동안 잠시 기다려 주세요.",
    progress: { indeterminate: true, phaseText: "다운로드/설치 중…" },
    buttons: [{ label: "취소", variant: "secondary", onClick: params.onCancel }],
  });

  // 다운로드가 100%에 도달한 뒤에는 추출/메모리 로딩 같은 단계로 넘어갈 수 있어, 이를 표시한다.
  let reached100 = false;
  const renderProgress = (p: DownloadProgress): void => {
    const totalBytes = p.totalBytes;
    const loadedBytes = p.loadedBytes;

    const derivedPercent =
      typeof p.percent === "number"
        ? p.percent
        : typeof loadedBytes === "number" &&
            typeof totalBytes === "number" &&
            Number.isFinite(loadedBytes) &&
            Number.isFinite(totalBytes) &&
            totalBytes > 0
          ? (loadedBytes / totalBytes) * 100
          : undefined;

    const percent = typeof derivedPercent === "number" ? Math.round(derivedPercent) : undefined;

    // total/loaded 기반으로 100%를 먼저 관측하면 이후 인디테르미네이트 전환을 "로딩 단계"로 취급한다.
    if (typeof percent === "number" && percent >= 100 && totalBytes && loadedBytes) {
      reached100 = true;
    }

    const human = (() => {
      if (typeof loadedBytes === "number" && typeof totalBytes === "number" && totalBytes > 0) {
        const l = bytesToHuman(loadedBytes);
        const t = bytesToHuman(totalBytes);
        if (l && t) return `${l}/${t}`;
      }
      return "";
    })();

    const indeterminate = !!p.indeterminate || typeof percent !== "number";
    const phaseText =
      p.phaseText ??
      (reached100 && indeterminate
        ? "추출/메모리 로딩 중…"
        : indeterminate
          ? "다운로드/설치 중…"
          : undefined);

    const dialogProgress: DialogProgress = {
      loadedBytes: p.loadedBytes,
      totalBytes: p.totalBytes,
      percent: !indeterminate && typeof percent === "number" ? Math.max(0, Math.min(100, percent)) : undefined,
      indeterminate,
      phaseText: phaseText
        ? human
          ? `${phaseText} (${human})`
          : phaseText
        : human
          ? `${percent}% (${human})`
          : undefined,
    };

    handle.setProgress(dialogProgress);
  };

  return { handle, renderProgress };
}

export function showCancelledDialog(params: {
  x: number;
  y: number;
  onFallback: () => void;
}): DialogHandle {
  return showDialog({
    x: params.x,
    y: params.y,
    variant: "cancelled",
    title: "취소됨",
    body: "다운로드가 취소되었습니다. 기본 번역으로 계속할 수 있습니다.",
    buttons: [{ label: "기본 번역으로 계속", variant: "primary", onClick: params.onFallback }],
  });
}

export function showDownloadErrorDialog(params: {
  x: number;
  y: number;
  message: string;
  onFallback: () => void;
}): DialogHandle {
  return showDialog({
    x: params.x,
    y: params.y,
    variant: "error",
    title: "고정밀 번역 오류",
    body: params.message,
    buttons: [{ label: "기본 번역으로 계속", variant: "primary", onClick: params.onFallback }],
  });
}

