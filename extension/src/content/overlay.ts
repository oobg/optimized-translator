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
