import type { GlossaryEntry } from "../lib/types/messages.js";
import { deleteEntry, listGlossary, upsertEntry } from "./glossary-store.js";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Partial<HTMLElementTagNameMap[K]> & { text?: string }
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (props) {
    const { text, ...rest } = props;
    Object.assign(node, rest);
    if (text !== undefined) node.textContent = text;
  }
  return node;
}

export async function mountGlossaryUi(root: HTMLElement): Promise<void> {
  root.replaceChildren();

  const title = el("h1", { text: "용어집" });
  title.setAttribute("style", "font-size:18px;margin:0 0 12px;");

  const form = el("form");
  form.setAttribute(
    "style",
    "display:grid;gap:8px;margin-bottom:16px;padding:12px;border:1px solid #d0d7de;border-radius:8px;"
  );

  const phrase = el("input") as HTMLInputElement;
  phrase.placeholder = "원문 구문";
  phrase.required = true;

  const preferred = el("input") as HTMLInputElement;
  preferred.placeholder = "선호 표기";
  preferred.required = true;

  const strictBox = el("input") as HTMLInputElement;
  strictBox.type = "checkbox";
  strictBox.checked = true;
  const strictLabel = el("label", {
    text: "엄격 일치 (일반 번역에서 마스킹)",
  }) as HTMLLabelElement;
  strictLabel.prepend(strictBox);

  const note = el("input") as HTMLInputElement;
  note.placeholder = "메모 (선택)";

  const saveBtn = el("button", { text: "추가 / 저장" }) as HTMLButtonElement;
  saveBtn.type = "submit";

  form.append(phrase, preferred, strictLabel, note, saveBtn);

  const list = el("div");
  list.setAttribute("style", "display:flex;flex-direction:column;gap:8px;");

  const renderList = async () => {
    list.replaceChildren();
    const entries = await listGlossary();
    if (!entries.length) {
      list.append(el("p", { text: "등록된 용어가 없습니다." }));
      return;
    }
    for (const entry of entries) {
      const card = el("div");
      card.setAttribute(
        "style",
        "padding:10px;border:1px solid #d0d7de;border-radius:8px;display:grid;gap:6px;"
      );
      const head = el("div", {
        text: `${entry.sourcePhrase} → ${entry.preferredOutcome}`,
      });
      head.setAttribute("style", "font-weight:600;");
      const meta = el("div", {
        text: `strict: ${entry.strictExactMatch ? "yes" : "no"} · id: ${entry.id}`,
      });
      meta.setAttribute("style", "font-size:12px;color:#57606a;");
      const actions = el("div");
      actions.setAttribute("style", "display:flex;gap:8px;");
      const edit = el("button", { text: "편집" }) as HTMLButtonElement;
      const del = el("button", { text: "삭제" }) as HTMLButtonElement;
      del.addEventListener("click", async () => {
        await deleteEntry(entry.id);
        await renderList();
      });
      edit.addEventListener("click", () => {
        phrase.value = entry.sourcePhrase;
        preferred.value = entry.preferredOutcome;
        note.value = entry.userNote ?? "";
        strictBox.checked = entry.strictExactMatch;
        form.dataset.editingId = entry.id;
        saveBtn.textContent = "업데이트";
      });
      actions.append(edit, del);
      card.append(head, meta, actions);
      list.append(card);
    }
  };

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const editingId = form.dataset.editingId;
    const entry: GlossaryEntry = {
      id: editingId && editingId.length ? editingId : crypto.randomUUID(),
      sourcePhrase: phrase.value.trim(),
      preferredOutcome: preferred.value.trim(),
      strictExactMatch: strictBox.checked,
      userNote: note.value.trim() || null,
    };
    await upsertEntry(entry);
    form.reset();
    strictBox.checked = true;
    delete form.dataset.editingId;
    saveBtn.textContent = "추가 / 저장";
    await renderList();
  });

  root.append(title, form, list);
  await renderList();
}
