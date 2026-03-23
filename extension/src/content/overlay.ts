const OVERLAY_ID = "ot-overlay-root";

export type OverlayHandle = {
  dismiss: () => void;
};

export function showOverlay(options: {
  x: number;
  y: number;
  title: string;
  body: string;
  variant?: "default" | "enhanced";
}): OverlayHandle {
  document.getElementById(OVERLAY_ID)?.remove();

  const root = document.createElement("div");
  root.id = OVERLAY_ID;
  root.setAttribute(
    "style",
    [
      "position:fixed",
      "z-index:2147483647",
      "left:0",
      "top:0",
      "width:100%",
      "height:100%",
      "pointer-events:none",
    ].join(";")
  );

  const panel = document.createElement("div");
  panel.setAttribute(
    "style",
    [
      "position:absolute",
      "pointer-events:auto",
      "max-width:min(420px,calc(100vw - 24px))",
      "padding:10px 12px",
      "border-radius:10px",
      "background:var(--color-canvas-default,#fff)",
      "color:var(--color-fg-default,#24292f)",
      "border:1px solid var(--color-border-default,#d0d7de)",
      "box-shadow:0 12px 40px rgba(0,0,0,0.18)",
      "font:13px/1.45 system-ui,sans-serif",
    ].join(";")
  );
  panel.style.left = `${Math.min(options.x, window.innerWidth - 24)}px`;
  panel.style.top = `${Math.min(options.y, window.innerHeight - 24)}px`;

  const badge = document.createElement("div");
  badge.textContent =
    options.variant === "enhanced" ? "고정밀 번역" : "번역";
  badge.setAttribute(
    "style",
    "font-size:11px;font-weight:600;letter-spacing:0.02em;color:var(--color-accent-fg,#0969da);margin-bottom:6px;"
  );

  const title = document.createElement("div");
  title.textContent = options.title;
  title.setAttribute("style", "font-weight:600;margin-bottom:6px;");

  const body = document.createElement("div");
  body.textContent = options.body;
  body.setAttribute("style", "white-space:pre-wrap;word-break:break-word;");

  const actions = document.createElement("div");
  actions.setAttribute("style", "display:flex;justify-content:flex-end;margin-top:10px;gap:8px;");

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "닫기";
  closeBtn.setAttribute(
    "style",
    "cursor:pointer;border:1px solid var(--color-btn-border,#d0d7de);background:var(--color-btn-bg,#f6f8fa);border-radius:6px;padding:4px 10px;font:inherit;"
  );

  const dismiss = () => {
    root.remove();
  };
  closeBtn.addEventListener("click", dismiss);
  root.addEventListener("click", (e) => {
    if (e.target === root) dismiss();
  });

  actions.append(closeBtn);
  panel.append(badge, title, body, actions);
  root.append(panel);
  document.body.appendChild(root);

  return { dismiss };
}

export type DialogVariant =
  | "default"
  | "enhanced"
  | "wifi-consent"
  | "progress"
  | "error"
  | "result"
  | "cancelled";

export type DialogProgress = {
  loadedBytes?: number;
  totalBytes?: number;
  percent?: number;
  indeterminate?: boolean;
  phaseText?: string;
};

export type DialogButtonVariant = "primary" | "secondary";

export type DialogButton = {
  label: string;
  onClick: () => void;
  variant?: DialogButtonVariant;
  disabled?: boolean;
};

export type DialogHandle = {
  dismiss: () => void;
  setTitle: (title: string) => void;
  setBody: (body: string) => void;
  setProgress: (progress?: DialogProgress) => void;
  setButtons: (buttons: DialogButton[]) => void;
};

function getDialogBadgeText(variant: DialogVariant | undefined): string {
  switch (variant) {
    case "wifi-consent":
      return "Wi-Fi 권장";
    case "progress":
      return "다운로드 진행";
    case "error":
      return "오류";
    case "result":
      return "고정밀 번역";
    case "cancelled":
      return "취소됨";
    case "enhanced":
      return "고정밀 번역";
    default:
      return "번역";
  }
}

export function showDialog(options: {
  x: number;
  y: number;
  title: string;
  body?: string;
  variant?: DialogVariant;
  progress?: DialogProgress;
  buttons?: DialogButton[];
  /** overlay 밖(또는 닫기)로부터 호출될 때 흐름 취소를 유도하기 위해 사용 */
  onDismiss?: () => void;
  allowOutsideDismiss?: boolean;
}): DialogHandle {
  document.getElementById(OVERLAY_ID)?.remove();

  const root = document.createElement("div");
  root.id = OVERLAY_ID;
  root.setAttribute(
    "style",
    [
      "position:fixed",
      "z-index:2147483647",
      "left:0",
      "top:0",
      "width:100%",
      "height:100%",
      "pointer-events:none",
    ].join(";")
  );

  let dismissed = false;
  const dismiss = () => {
    if (dismissed) return;
    dismissed = true;
    root.remove();
    options.onDismiss?.();
  };

  if (options.allowOutsideDismiss ?? true) {
    root.addEventListener("click", (e) => {
      if (e.target === root) dismiss();
    });
  }

  const panel = document.createElement("div");
  panel.setAttribute(
    "style",
    [
      "position:absolute",
      "pointer-events:auto",
      "max-width:min(420px,calc(100vw - 24px))",
      "padding:10px 12px",
      "border-radius:10px",
      "background:var(--color-canvas-default,#fff)",
      "color:var(--color-fg-default,#24292f)",
      "border:1px solid var(--color-border-default,#d0d7de)",
      "box-shadow:0 12px 40px rgba(0,0,0,0.18)",
      "font:13px/1.45 system-ui,sans-serif",
    ].join(";")
  );
  panel.style.left = `${Math.min(options.x, window.innerWidth - 24)}px`;
  panel.style.top = `${Math.min(options.y, window.innerHeight - 24)}px`;

  const badge = document.createElement("div");
  badge.textContent = getDialogBadgeText(options.variant);
  badge.setAttribute(
    "style",
    "font-size:11px;font-weight:600;letter-spacing:0.02em;color:var(--color-accent-fg,#0969da);margin-bottom:6px;"
  );

  const titleEl = document.createElement("div");
  titleEl.textContent = options.title;
  titleEl.setAttribute("style", "font-weight:600;margin-bottom:6px;");

  const bodyEl = document.createElement("div");
  bodyEl.textContent = options.body ?? "";
  bodyEl.setAttribute("style", "white-space:pre-wrap;word-break:break-word;");
  if (!options.body) bodyEl.style.display = "none";

  const progressWrap = document.createElement("div");
  progressWrap.setAttribute("style", "margin-top:8px;");

  const progressText = document.createElement("div");
  progressText.setAttribute("style", "font-size:12px;color:var(--color-fg-muted,#656d76);margin-bottom:6px;");

  const progressBarOuter = document.createElement("div");
  progressBarOuter.setAttribute(
    "style",
    "height:10px;border-radius:999px;background:var(--color-border-default,#e1e4e8);overflow:hidden;"
  );

  const progressBarInner = document.createElement("div");
  progressBarInner.setAttribute(
    "style",
    [
      "height:100%",
      "width:0%",
      "background:var(--color-accent-emphasis,#0969da);",
      "transition:width 180ms ease;",
    ].join("")
  );
  progressBarOuter.appendChild(progressBarInner);

  // Minimal spinner for indeterminate mode
  const spinner = document.createElement("div");
  spinner.setAttribute(
    "style",
    [
      "display:none",
      "width:16px",
      "height:16px",
      "border-radius:50%",
      "border:2px solid rgba(9,105,218,0.25)",
      "border-top-color:rgba(9,105,218,0.9)",
      "animation:ot-rotate 0.9s linear infinite",
      "margin-right:8px",
      "vertical-align:middle",
    ].join(";")
  );
  // Keyframes injection: only once.
  if (!document.getElementById("ot-dialog-keyframes")) {
    const style = document.createElement("style");
    style.id = "ot-dialog-keyframes";
    style.textContent = "@keyframes ot-rotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}";
    document.head.appendChild(style);
  }
  const progressRow = document.createElement("div");
  progressRow.setAttribute("style", "display:flex;align-items:center;gap:0;");
  progressRow.appendChild(spinner);
  progressRow.appendChild(progressText);

  progressWrap.appendChild(progressRow);
  progressWrap.appendChild(progressBarOuter);

  const buttonsEl = document.createElement("div");
  buttonsEl.setAttribute("style", "display:flex;justify-content:flex-end;margin-top:10px;gap:8px;");

  function renderButtons(buttons: DialogButton[]): void {
    buttonsEl.replaceChildren();
    for (const b of buttons) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b.label;
      btn.disabled = !!b.disabled;
      const isPrimary = (b.variant ?? "primary") === "primary";
      btn.setAttribute(
        "style",
        [
          "cursor:pointer",
          "border:1px solid var(--color-btn-border,#d0d7de)",
          `background:${isPrimary ? "var(--color-btn-bg,#0969da)" : "var(--color-btn-bg,#f6f8fa)"}`,
          `color:${isPrimary ? "var(--color-btn-fg,#fff)" : "var(--color-fg-default,#24292f)"}`,
          "border-radius:6px",
          "padding:4px 10px",
          "font:inherit",
          "opacity:" + (btn.disabled ? "0.6" : "1"),
        ].join(";")
      );
      btn.addEventListener("click", () => b.onClick());
      buttonsEl.appendChild(btn);
    }
    buttonsEl.style.display = buttons.length ? "flex" : "none";
  }

  const initialButtons: DialogButton[] =
    options.buttons && options.buttons.length
      ? options.buttons
      : [
          {
            label: "닫기",
            variant: "secondary",
            onClick: () => dismiss(),
          },
        ];
  renderButtons(initialButtons);

  function renderProgress(progress?: DialogProgress): void {
    if (!progress) {
      progressWrap.style.display = "none";
      return;
    }

    progressWrap.style.display = "block";
    const indeterminate = !!progress.indeterminate;
    const percent =
      typeof progress.percent === "number"
        ? progress.percent
        : progress.totalBytes && progress.loadedBytes && progress.totalBytes > 0
          ? (progress.loadedBytes / progress.totalBytes) * 100
          : undefined;

    const pctText =
      typeof percent === "number" && Number.isFinite(percent) ? `${Math.round(percent)}%` : "";

    progressText.textContent =
      progress.phaseText ??
      (indeterminate ? "다운로드/설치 중…" : pctText ? `${pctText} 진행` : "진행 중…");

    spinner.style.display = indeterminate || typeof percent !== "number" ? "inline-block" : "none";
    if (typeof percent === "number" && !indeterminate) {
      const clamped = Math.max(0, Math.min(100, percent));
      progressBarInner.style.width = `${clamped}%`;
      progressBarOuter.style.display = "block";
    } else {
      progressBarOuter.style.display = "none";
    }
  }

  renderProgress(options.progress);

  panel.append(badge, titleEl, bodyEl, progressWrap, buttonsEl);
  root.append(panel);
  document.body.appendChild(root);

  return {
    dismiss,
    setTitle: (title) => {
      titleEl.textContent = title;
      badge.textContent = getDialogBadgeText(options.variant);
    },
    setBody: (body) => {
      bodyEl.textContent = body;
      bodyEl.style.display = body ? "block" : "none";
    },
    setProgress: (progress) => renderProgress(progress),
    setButtons: (buttons) => renderButtons(buttons),
  };
}
