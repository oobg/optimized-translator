import type { ExtensionMessage, GlossaryEntry } from "../lib/types/messages.js";

async function send(msg: ExtensionMessage): Promise<ExtensionMessage | undefined> {
  return (await chrome.runtime.sendMessage(msg)) as ExtensionMessage | undefined;
}

export async function listGlossary(): Promise<GlossaryEntry[]> {
  const requestId = crypto.randomUUID();
  const reply = await send({ type: "glossary/list", requestId });
  if (reply && reply.type === "glossary/result") return reply.payload;
  return [];
}

export async function upsertEntry(entry: GlossaryEntry): Promise<GlossaryEntry[]> {
  const requestId = crypto.randomUUID();
  const reply = await send({ type: "glossary/upsert", requestId, payload: entry });
  if (reply && reply.type === "glossary/result") return reply.payload;
  return [];
}

export async function deleteEntry(id: string): Promise<GlossaryEntry[]> {
  const requestId = crypto.randomUUID();
  const reply = await send({
    type: "glossary/delete",
    requestId,
    payload: { id },
  });
  if (reply && reply.type === "glossary/result") return reply.payload;
  return [];
}
