export function observeDomThrottled(
  root: HTMLElement,
  onFlush: () => void,
  delayMs = 400
): MutationObserver {
  let timer: number | null = null;
  const observer = new MutationObserver(() => {
    if (timer !== null) window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      timer = null;
      onFlush();
    }, delayMs);
  });
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}
