import type {
  ContentRuntimeMessage,
  ExtensionMessage,
  GlossaryEntry,
  UserTranslationPreferences,
} from "../lib/types/messages.js";
import { DEFAULT_PREFERENCES } from "../lib/default-preferences.js";
import { allowFullPageTranslation, allowHoverTranslation } from "./compose-guards.js";
import { runEnhancedTranslation } from "./enhanced-translate.js";
import { observeDomThrottled } from "./full-page-observer.js";
import { runFullPagePass } from "./full-page-translate.js";
import { attachHoverTranslation } from "./hover-translate.js";
import { attachSelectionTranslation } from "./selection-translate.js";

let prefs: UserTranslationPreferences = { ...DEFAULT_PREFERENCES };
let glossary: GlossaryEntry[] = [];
let fullPageRunning = false;

let detachSelection: (() => void) | null = null;
let detachHover: (() => void) | null = null;

async function fetchPreferences(): Promise<UserTranslationPreferences> {
  const requestId = crypto.randomUUID();
  const reply = (await chrome.runtime.sendMessage({
    type: "preferences/get",
    requestId,
  } as ExtensionMessage)) as ExtensionMessage | undefined;
  if (reply && reply.type === "preferences/result") return reply.payload;
  return { ...DEFAULT_PREFERENCES };
}

async function fetchGlossary(): Promise<GlossaryEntry[]> {
  const requestId = crypto.randomUUID();
  const reply = (await chrome.runtime.sendMessage({
    type: "glossary/list",
    requestId,
  } as ExtensionMessage)) as ExtensionMessage | undefined;
  if (reply && reply.type === "glossary/result") return reply.payload;
  return [];
}

function wireInteraction(): void {
  detachSelection?.();
  detachHover?.();
  detachSelection = attachSelectionTranslation(
    () => prefs,
    () => glossary,
    () => prefs.selectionEnabled
  );
  detachHover = attachHoverTranslation(
    () => prefs,
    () => glossary,
    () => prefs.hoverEnabled && allowHoverTranslation()
  );
}

async function maybeFullPage(): Promise<void> {
  if (!prefs.fullPageEnabled || !allowFullPageTranslation()) return;
  if (fullPageRunning) return;
  fullPageRunning = true;
  try {
    await runFullPagePass(prefs, glossary);
  } finally {
    fullPageRunning = false;
  }
}

async function refreshFromRemote(): Promise<void> {
  const [p, g] = await Promise.all([fetchPreferences(), fetchGlossary()]);
  prefs = p;
  glossary = g;
  wireInteraction();
  if (prefs.fullPageEnabled) void maybeFullPage();
}

function onStorageChanged(
  changes: Record<string, chrome.storage.StorageChange>,
  area: string
): void {
  if (area !== "local") return;
  if ("userTranslationPreferences" in changes || "glossaryEntries" in changes) {
    void refreshFromRemote();
  }
}

chrome.runtime.onMessage.addListener(
  (message: ContentRuntimeMessage | ExtensionMessage, _sender, sendResponse) => {
    if (!message || typeof message !== "object" || !("type" in message)) return false;

    if (message.type === "ot/prefs-updated") {
      prefs = message.payload;
      wireInteraction();
      if (prefs.fullPageEnabled) void maybeFullPage();
      sendResponse({ ok: true });
      return true;
    }

    if (message.type === "ot/run-enhanced-translate") {
      void runEnhancedTranslation(message.requestId, message.text, prefs, glossary).then(() =>
        sendResponse({ ok: true })
      );
      return true;
    }

    return false;
  }
);

void (async function init() {
  await refreshFromRemote();
  chrome.storage.onChanged.addListener(onStorageChanged);
  observeDomThrottled(document.body, () => {
    void maybeFullPage();
  });
  if (prefs.fullPageEnabled) void maybeFullPage();
})();
