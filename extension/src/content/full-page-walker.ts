import { isComposeElement } from "../lib/github/compose.js";
import { isInsideCodeBlock } from "./code-regions.js";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "TEXTAREA", "INPUT"]);

function shouldSkipElement(el: Element | null): boolean {
  if (!el) return true;
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.classList.contains("ot-node")) return true;
  if (isComposeElement(el)) return true;
  return false;
}

export function forEachTranslatableTextNode(
  root: HTMLElement,
  visit: (node: Text) => void
): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue ?? "";
      if (!text.trim()) return NodeFilter.FILTER_REJECT;
      let el: Element | null = (node as Text).parentElement;
      while (el) {
        if (shouldSkipElement(el)) return NodeFilter.FILTER_REJECT;
        el = el.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let n: Text | null;
  while ((n = walker.nextNode() as Text | null)) {
    if (isInsideCodeBlock(n)) continue;
    visit(n);
  }
}

export function forEachCodeBlockTextNode(
  root: HTMLElement,
  visit: (node: Text) => void
): void {
  const pres = root.querySelectorAll("pre");
  pres.forEach((pre) => {
    const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT, null);
    let t: Text | null;
    while ((t = walker.nextNode() as Text | null)) {
      const v = t.nodeValue ?? "";
      if (v.trim()) visit(t);
    }
  });
}
