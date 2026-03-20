import { DEFAULT_PREFERENCES as DEFAULT_PREFS } from "../lib/default-preferences.js";
import type { GlossaryEntry, UserTranslationPreferences } from "../lib/types/messages.js";

const PREFS_KEY = "userTranslationPreferences";
const GLOSSARY_KEY = "glossaryEntries";

export const DEFAULT_PREFERENCES = DEFAULT_PREFS;

export async function loadPreferences(): Promise<UserTranslationPreferences> {
  const raw = await chrome.storage.local.get(PREFS_KEY);
  const v = raw[PREFS_KEY] as UserTranslationPreferences | undefined;
  if (!v) return { ...DEFAULT_PREFS };
  return {
    ...DEFAULT_PREFS,
    ...v,
  };
}

export async function savePreferences(
  prefs: UserTranslationPreferences
): Promise<void> {
  await chrome.storage.local.set({ [PREFS_KEY]: prefs });
}

export async function loadGlossary(): Promise<GlossaryEntry[]> {
  const raw = await chrome.storage.local.get(GLOSSARY_KEY);
  const list = raw[GLOSSARY_KEY];
  if (!Array.isArray(list)) return [];
  return list as GlossaryEntry[];
}

export async function saveGlossary(entries: GlossaryEntry[]): Promise<void> {
  await chrome.storage.local.set({ [GLOSSARY_KEY]: entries });
}

export async function upsertGlossaryEntry(entry: GlossaryEntry): Promise<GlossaryEntry[]> {
  const list = await loadGlossary();
  const idx = list.findIndex((e) => e.id === entry.id);
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  await saveGlossary(list);
  return list;
}

export async function deleteGlossaryEntry(id: string): Promise<GlossaryEntry[]> {
  const list = (await loadGlossary()).filter((e) => e.id !== id);
  await saveGlossary(list);
  return list;
}
