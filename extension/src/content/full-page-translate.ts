import type { GlossaryEntry, UserTranslationPreferences } from "../lib/types/messages.js";
import { sliceCommentOnlySegments } from "./code-regions.js";
import { forEachTranslatableTextNode } from "./full-page-walker.js";
import { setFullPageStatus } from "./full-page-ui.js";
import { translateWithGlossary } from "./translate-pipeline.js";

function wrapTranslated(node: Text, translated: string): void {
  const span = document.createElement("span");
  span.className = "ot-node";
  const orig = document.createElement("span");
  orig.className = "ot-original";
  const tr = document.createElement("span");
  tr.className = "ot-translation";
  tr.setAttribute("lang", "");
  tr.setAttribute(
    "style",
    "display:block;opacity:0.88;margin-top:2px;font-size:0.95em;color:var(--color-fg-muted,#656d76);"
  );
  orig.textContent = node.nodeValue;
  tr.textContent = translated;
  span.append(orig, tr);
  node.parentNode?.replaceChild(span, node);
}

async function translateProseRoot(
  root: HTMLElement,
  prefs: UserTranslationPreferences,
  glossary: GlossaryEntry[]
): Promise<{ done: number; failed: number }> {
  const targets: Text[] = [];
  forEachTranslatableTextNode(root, (n) => targets.push(n));

  let done = 0;
  let failed = 0;

  for (const node of targets) {
    if (!node.isConnected) continue;
    if (node.parentElement?.closest(".ot-node")) continue;
    const piece = (node.nodeValue ?? "").trim();
    if (!piece) continue;
    const single = await translateWithGlossary(piece, prefs, glossary, "full");
    if (single.ok) {
      wrapTranslated(node, single.translatedText);
      done += 1;
    } else {
      failed += 1;
    }
  }
  return { done, failed };
}

async function translateCodePres(
  root: HTMLElement,
  prefs: UserTranslationPreferences,
  glossary: GlossaryEntry[]
): Promise<void> {
  const pres = Array.from(root.querySelectorAll("pre"));
  for (const pre of pres) {
    if (pre.closest(".ot-node")) continue;
    const text = pre.textContent ?? "";
    const segs = sliceCommentOnlySegments(text);
    if (!segs.length) continue;
    const outs: string[] = [];
    for (const seg of segs) {
      const r = await translateWithGlossary(seg, prefs, glossary, "full");
      if (r.ok) outs.push(r.translatedText);
    }
    if (!outs.length) continue;
    const box = document.createElement("div");
    box.className = "ot-code-comment-tr";
    box.setAttribute(
      "style",
      "margin:6px 0 12px;font:12px/1.45 system-ui,sans-serif;color:var(--color-fg-muted,#656d76);border-left:3px solid var(--color-accent-emphasis,#0969da);padding-left:8px;"
    );
    box.textContent = `주석 번역: ${outs.join(" · ")}`;
    pre.insertAdjacentElement("afterend", box);
  }
}

export async function runFullPagePass(
  prefs: UserTranslationPreferences,
  glossary: GlossaryEntry[]
): Promise<void> {
  const root = document.body;
  setFullPageStatus("페이지 번역 중…", "info");
  try {
    const prose = await translateProseRoot(root, prefs, glossary);
    await translateCodePres(root, prefs, glossary);
    if (prose.failed > 0) {
      setFullPageStatus("일부 영역은 번역되지 않았습니다.", "warn");
      window.setTimeout(() => setFullPageStatus("", "hidden"), 6000);
    } else {
      setFullPageStatus("", "hidden");
    }
  } catch {
    setFullPageStatus("번역 중 오류가 발생했습니다.", "warn");
    window.setTimeout(() => setFullPageStatus("", "hidden"), 6000);
  }
}
