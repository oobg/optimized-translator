import type { ExtensionMessage, UserTranslationPreferences } from "../lib/types/messages.js";

const targetLang = document.querySelector<HTMLInputElement>("#targetLang")!;
const fullPage = document.querySelector<HTMLInputElement>("#fullPage")!;
const selection = document.querySelector<HTMLInputElement>("#selection")!;
const hover = document.querySelector<HTMLInputElement>("#hover")!;
const openOptions = document.querySelector<HTMLButtonElement>("#openOptions")!;

let cachedPrefs: UserTranslationPreferences | null = null;

async function send(msg: ExtensionMessage): Promise<ExtensionMessage | undefined> {
  return (await chrome.runtime.sendMessage(msg)) as ExtensionMessage | undefined;
}

async function loadPrefs(): Promise<UserTranslationPreferences> {
  const requestId = crypto.randomUUID();
  const reply = await send({ type: "preferences/get", requestId });
  if (reply && reply.type === "preferences/result") {
    cachedPrefs = reply.payload;
    return reply.payload;
  }
  throw new Error("preferences load failed");
}

async function savePrefs(payload: UserTranslationPreferences): Promise<void> {
  const requestId = crypto.randomUUID();
  await send({ type: "preferences/set", requestId, payload });
}

async function notifyActiveTab(payload: UserTranslationPreferences): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id === undefined) return;
  try {
    await chrome.tabs.sendMessage(tab.id, { type: "ot/prefs-updated", payload });
  } catch {
    /* tab may not host content script */
  }
}

function wireForm(p: UserTranslationPreferences): void {
  targetLang.value = p.targetLanguage;
  fullPage.checked = p.fullPageEnabled;
  selection.checked = p.selectionEnabled;
  hover.checked = p.hoverEnabled;
}

async function persistFromForm(): Promise<void> {
  const payload: UserTranslationPreferences = {
    targetLanguage: targetLang.value.trim() || "ko",
    fullPageEnabled: fullPage.checked,
    selectionEnabled: selection.checked,
    hoverEnabled: hover.checked,
    preferEnhancedWhenAvailable:
      cachedPrefs?.preferEnhancedWhenAvailable ?? false,
  };
  await savePrefs(payload);
  await notifyActiveTab(payload);
}

void loadPrefs()
  .then((p) => {
    wireForm(p);
  })
  .catch(() => {
    /* ignore */
  });

for (const el of [targetLang, fullPage, selection, hover]) {
  el.addEventListener("change", () => {
    void persistFromForm();
  });
}

openOptions.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

const style = document.createElement("style");
style.textContent = `
  body { margin:0; font:13px/1.45 system-ui,sans-serif; color:#24292f; background:#fff; }
  .wrap { width:300px; padding:12px 14px 14px; box-sizing:border-box; }
  h1 { font-size:15px; margin:0 0 10px; }
  .row { display:flex; flex-direction:column; gap:4px; margin-bottom:10px; }
  .row.check { flex-direction:row; align-items:center; gap:8px; }
  input[type="text"] { padding:6px 8px; border:1px solid #d0d7de; border-radius:6px; }
  .hint { color:#57606a; font-size:12px; margin:8px 0 10px; }
  button { width:100%; padding:8px; border-radius:6px; border:1px solid #d0d7de; background:#f6f8fa; cursor:pointer; }
`;
document.head.appendChild(style);
