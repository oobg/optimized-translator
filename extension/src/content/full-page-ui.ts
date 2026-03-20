const PANEL_ID = "ot-fullpage-panel";

export function ensureFullPagePanel(): HTMLElement {
  let el = document.getElementById(PANEL_ID);
  if (el) return el;
  el = document.createElement("div");
  el.id = PANEL_ID;
  el.setAttribute(
    "style",
    [
      "position:fixed",
      "right:12px",
      "bottom:12px",
      "z-index:2147483646",
      "max-width:280px",
      "padding:8px 10px",
      "border-radius:8px",
      "font:12px/1.4 system-ui,sans-serif",
      "background:rgba(20,20,24,0.92)",
      "color:#f4f4f5",
      "box-shadow:0 4px 24px rgba(0,0,0,0.35)",
      "pointer-events:none",
    ].join(";")
  );
  document.body.appendChild(el);
  return el;
}

export function setFullPageStatus(message: string, variant: "info" | "warn" | "hidden"): void {
  if (variant === "hidden") {
    const el = document.getElementById(PANEL_ID);
    if (el) el.remove();
    return;
  }
  const el = ensureFullPagePanel();
  el.textContent = message;
  el.style.borderLeft =
    variant === "warn" ? "3px solid #f59e0b" : "3px solid #38bdf8";
}
