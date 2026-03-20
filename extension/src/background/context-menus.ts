const MENU_ID = "ot-enhanced-translate";

export function registerContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "고정밀 번역 (Enhanced)",
      contexts: ["selection"],
      documentUrlPatterns: ["https://github.com/*"],
    });
  });
}

export function attachContextMenuListeners(
  onEnhanced: (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => void
): void {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId !== MENU_ID) return;
    onEnhanced(info, tab);
  });
}
