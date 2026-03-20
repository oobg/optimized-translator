import type { GlossaryEntry } from "../types/messages.js";

const TOKEN_PREFIX = "\uE000OT_GLOSS_";
const TOKEN_SUFFIX = "\uE001";

export type MaskState = {
  maskedText: string;
  replacements: Map<string, string>;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** strictExactMatch 항목만 마스킹합니다. */
export function applyStrictGlossaryMask(
  text: string,
  entries: GlossaryEntry[]
): MaskState {
  const strict = entries.filter((e) => e.strictExactMatch && e.sourcePhrase.trim());
  const sorted = [...strict].sort(
    (a, b) => b.sourcePhrase.length - a.sourcePhrase.length
  );

  const replacements = new Map<string, string>();
  let maskedText = text;
  let i = 0;

  for (const entry of sorted) {
    const phrase = entry.sourcePhrase;
    const re = new RegExp(escapeRegExp(phrase), "g");
    maskedText = maskedText.replace(re, () => {
      const token = `${TOKEN_PREFIX}${i++}${TOKEN_SUFFIX}`;
      replacements.set(token, entry.preferredOutcome);
      return token;
    });
  }

  return { maskedText, replacements };
}

export function restoreGlossaryMask(
  translated: string,
  replacements: Map<string, string>
): string {
  let out = translated;
  for (const [token, preferred] of replacements) {
    out = out.split(token).join(preferred);
  }
  return out;
}
