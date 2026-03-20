import type { UserTranslationPreferences } from "./types/messages.js";

export const DEFAULT_PREFERENCES: UserTranslationPreferences = {
  targetLanguage: "ko",
  fullPageEnabled: false,
  selectionEnabled: true,
  hoverEnabled: false,
  preferEnhancedWhenAvailable: false,
};
