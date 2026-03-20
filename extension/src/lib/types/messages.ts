export type GlossaryEntry = {
  id: string;
  sourcePhrase: string;
  preferredOutcome: string;
  strictExactMatch: boolean;
  userNote: string | null;
  sortIndex?: number;
};

export type UserTranslationPreferences = {
  targetLanguage: string;
  fullPageEnabled: boolean;
  selectionEnabled: boolean;
  hoverEnabled: boolean;
  preferEnhancedWhenAvailable?: boolean;
};

export type TranslateRequest = {
  text: string;
  sourceLanguage?: string;
  targetLanguage: string;
  pathKind: "full" | "selection" | "hover" | "enhanced";
};

export type TranslateResult = {
  translatedText: string;
  pathKind: TranslateRequest["pathKind"];
};

export type TranslateError = {
  code:
    | "translator-unavailable"
    | "model-download-required"
    | "policy-blocked"
    | "invalid-language-pair"
    | "empty-input"
    | "unknown";
  message: string;
};

export type ExtensionMessage =
  | { type: "preferences/get"; requestId: string }
  | { type: "preferences/set"; requestId: string; payload: UserTranslationPreferences }
  | {
      type: "preferences/result";
      requestId: string;
      payload: UserTranslationPreferences;
    }
  | { type: "glossary/list"; requestId: string }
  | { type: "glossary/upsert"; requestId: string; payload: GlossaryEntry }
  | { type: "glossary/delete"; requestId: string; payload: { id: string } }
  | { type: "glossary/result"; requestId: string; payload: GlossaryEntry[] }
  | { type: "translate/request"; requestId: string; payload: TranslateRequest }
  | { type: "translate/result"; requestId: string; payload: TranslateResult }
  | { type: "translate/error"; requestId: string; payload: TranslateError };

export type ContentRuntimeMessage =
  | {
      type: "ot/prefs-updated";
      payload: UserTranslationPreferences;
    }
  | {
      type: "ot/run-enhanced-translate";
      requestId: string;
      text: string;
    };
