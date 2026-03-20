const COMPOSE_SELECTORS = [
  "textarea",
  'input[type="text"]',
  'input[type="search"]',
  '[contenteditable="true"]',
].join(",");

export function isComposeElement(el: Element | null): boolean {
  if (!el) return false;
  return Boolean(el.closest(COMPOSE_SELECTORS));
}

export function isComposeSurfaceActive(doc: Document = document): boolean {
  const active = doc.activeElement;
  if (!active || !(active instanceof Element)) return false;
  return isComposeElement(active);
}

export function findComposeRoots(doc: Document = document): Element[] {
  return Array.from(doc.querySelectorAll(COMPOSE_SELECTORS));
}
