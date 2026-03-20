type DetectorCtor = {
  create: () => Promise<{
    detect: (text: string) => Promise<{ detectedLanguage?: string } | string | undefined>;
    destroy?: () => Promise<void>;
  }>;
};

function getLanguageDetectorCtor(): DetectorCtor | undefined {
  return (globalThis as unknown as { LanguageDetector?: DetectorCtor }).LanguageDetector;
}

/** Returns BCP-47 tag or undefined when detection is unavailable or inconclusive. */
export async function detectLanguageTag(text: string): Promise<string | undefined> {
  const sample = text.trim().slice(0, 1000);
  if (!sample) return undefined;

  const Ctor = getLanguageDetectorCtor();
  if (!Ctor) return undefined;

  try {
    const detector = await Ctor.create();
    const result = await detector.detect(sample);
    await detector.destroy?.();

    if (typeof result === "string") return result;
    if (result && typeof result === "object" && "detectedLanguage" in result) {
      const tag = result.detectedLanguage;
      return typeof tag === "string" ? tag : undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
