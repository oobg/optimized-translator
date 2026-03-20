import { describe, expect, it } from "vitest";
import {
  applyStrictGlossaryMask,
  restoreGlossaryMask,
} from "../../src/lib/glossary/mask.js";
import type { GlossaryEntry } from "../../src/lib/types/messages.js";

function entry(partial: Partial<GlossaryEntry> & Pick<GlossaryEntry, "sourcePhrase" | "preferredOutcome">): GlossaryEntry {
  return {
    id: partial.id ?? "1",
    sourcePhrase: partial.sourcePhrase,
    preferredOutcome: partial.preferredOutcome,
    strictExactMatch: partial.strictExactMatch ?? true,
    userNote: partial.userNote ?? null,
  };
}

describe("glossary mask", () => {
  it("masks longer strict phrases first", () => {
    const entries = [
      entry({ id: "a", sourcePhrase: "foo", preferredOutcome: "F", strictExactMatch: true }),
      entry({ id: "b", sourcePhrase: "foo bar", preferredOutcome: "FB", strictExactMatch: true }),
    ];
    const { maskedText, replacements } = applyStrictGlossaryMask("say foo bar end", entries);
    expect(maskedText).toContain("\uE000OT_GLOSS_");
    expect(replacements.size).toBeGreaterThan(0);
  });

  it("restores preferred outcomes after translation", () => {
    const entries = [entry({ sourcePhrase: "API", preferredOutcome: "API", strictExactMatch: true })];
    const { maskedText, replacements } = applyStrictGlossaryMask("Use API", entries);
    const fakeTranslated = maskedText;
    const restored = restoreGlossaryMask(fakeTranslated, replacements);
    expect(restored).toContain("API");
  });

  it("ignores non-strict entries", () => {
    const entries = [
      entry({ sourcePhrase: "beta", preferredOutcome: "B", strictExactMatch: false }),
    ];
    const { maskedText, replacements } = applyStrictGlossaryMask("beta test", entries);
    expect(maskedText).toBe("beta test");
    expect(replacements.size).toBe(0);
  });
});
