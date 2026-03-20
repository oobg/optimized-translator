import { attachContextMenuListeners, registerContextMenus } from "./context-menus.js";
import { routeInboundMessage } from "./messages.js";
import { loadPreferences } from "./storage.js";
import type { ContentRuntimeMessage, ExtensionMessage } from "../lib/types/messages.js";

chrome.runtime.onInstalled.addListener(() => {
  registerContextMenus();
  void loadPreferences();
});

registerContextMenus();

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (r: unknown) => void) => {
    void routeInboundMessage(message).then((reply) => {
      sendResponse(reply ?? null);
    });
    return true;
  }
);

attachContextMenuListeners((info, tab) => {
  const text = info.selectionText?.trim();
  if (!text || tab?.id === undefined) return;
  const requestId = crypto.randomUUID();
  const msg: ContentRuntimeMessage = {
    type: "ot/run-enhanced-translate",
    requestId,
    text,
  };
  void chrome.tabs.sendMessage(tab.id, msg);
});
