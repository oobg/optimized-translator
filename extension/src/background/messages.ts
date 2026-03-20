import type { ExtensionMessage } from "../lib/types/messages.js";
import {
  deleteGlossaryEntry,
  loadGlossary,
  loadPreferences,
  savePreferences,
  upsertGlossaryEntry,
} from "./storage.js";
import { handleTranslateRequest } from "./translate-coordinator.js";

export function routeInboundMessage(
  message: ExtensionMessage
): Promise<ExtensionMessage | void> {
  switch (message.type) {
    case "preferences/get":
      return loadPreferences().then((payload) => ({
        type: "preferences/result" as const,
        requestId: message.requestId,
        payload,
      }));
    case "preferences/set":
      return savePreferences(message.payload).then(() => ({
        type: "preferences/result" as const,
        requestId: message.requestId,
        payload: message.payload,
      }));
    case "glossary/list":
      return loadGlossary().then((payload) => ({
        type: "glossary/result" as const,
        requestId: message.requestId,
        payload,
      }));
    case "glossary/upsert":
      return upsertGlossaryEntry(message.payload).then((payload) => ({
        type: "glossary/result" as const,
        requestId: message.requestId,
        payload,
      }));
    case "glossary/delete":
      return deleteGlossaryEntry(message.payload.id).then((payload) => ({
        type: "glossary/result" as const,
        requestId: message.requestId,
        payload,
      }));
    case "translate/request":
      return handleTranslateRequest(message.requestId, message.payload);
    default:
      return Promise.resolve();
  }
}
