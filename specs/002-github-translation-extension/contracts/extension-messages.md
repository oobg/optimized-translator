# Contract: Extension messages (internal)

**Version**: 0.1.0  
**Scope**: MV3 messaging between **service worker**, **popup/options**, and **content scripts** on `github.com`.

## Transport

- `chrome.runtime.sendMessage` / `onMessage` with JSON-serializable payloads.
- Optional `chrome.tabs.sendMessage` from service worker to a specific tab id.

## Message envelope

```ts
type ExtensionMessage =
  | { type: "preferences/get"; requestId: string }
  | { type: "preferences/set"; requestId: string; payload: UserTranslationPreferences }
  | { type: "glossary/list"; requestId: string }
  | { type: "glossary/upsert"; requestId: string; payload: GlossaryEntry }
  | { type: "glossary/delete"; requestId: string; payload: { id: string } }
  | { type: "translate/request"; requestId: string; payload: TranslateRequest }
  | { type: "translate/result"; requestId: string; payload: TranslateResult }
  | { type: "translate/error"; requestId: string; payload: TranslateError };

type TranslateRequest = {
  text: string;
  sourceLanguage?: string; // omit = detect
  targetLanguage: string;
  pathKind: "full" | "selection" | "hover" | "enhanced";
};

type TranslateResult = {
  translatedText: string;
  pathKind: TranslateRequest["pathKind"];
};

type TranslateError = {
  code:
    | "translator-unavailable"
    | "model-download-required"
    | "policy-blocked"
    | "invalid-language-pair"
    | "empty-input"
    | "unknown";
  message: string; // user-presentable
};
```

## Invariants

1. **No remote translation**: Service worker and content scripts MUST NOT attach third-party HTTP translators to satisfy `translate/*` (FR-012). Implementation delegates to Chrome built-in APIs only.
2. **Request correlation**: `requestId` MUST be echoed on result/error for async UI.
3. **Size**: Single message text SHOULD stay under ~100KB; larger bodies SHOULD be chunked by the caller (full-page pipeline).

## Versioning

Breaking changes increment the version in this document and require simultaneous updates to all senders.
