---
description: "Task list for GitHub-focused developer translation extension (MV3)"
---

# Tasks: GitHub-focused developer translation experience

**Input**: Design documents from `/specs/002-github-translation-extension/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Automated tests appear only in the Polish phase as optional unit coverage for parsers/glossary/URL helpers per `plan.md`. The feature spec does not mandate TDD; no per-story test sections.

**Organization**: Phases follow user story priorities P1–P6 from `spec.md`. Paths follow `plan.md` (`extension/` package).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label ([US1]–[US6])
- Every task includes an exact file or directory path

## Path Conventions

- Extension package: `extension/` at repository root (`manifest.json`, `src/`, `public/`, `tests/`)
- Build output: `dist/` (or value set in Vite config), load unpacked in Chrome

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the MV3 extension package, toolchain, and entrypoints.

- [ ] T001 Create directory layout `extension/src/{background,content,options,popup,lib}`, `extension/public`, `extension/tests/{unit,fixtures}` per `specs/002-github-translation-extension/plan.md`
- [ ] T002 Add `extension/package.json` with scripts for `build`, `test`, and `lint`; add dependencies TypeScript (≥5), Vite, Vitest, `@types/chrome`, `@types/dom-chromium-ai`
- [ ] T003 [P] Add `extension/manifest.json` (MV3) with `service_worker`, `content_scripts` for `https://github.com/*`, and permissions `storage`, `contextMenus` per `specs/002-github-translation-extension/research.md`
- [ ] T004 [P] Add `extension/tsconfig.json` targeting ES2022+ and strict settings aligned with repo conventions
- [ ] T005 [P] Add `extension/vite.config.ts` multi-entry build for background, content, popup, and options pages
- [ ] T006 [P] Extend repository root `eslint.config.mjs` (create if missing) so `extension/src/**/*.ts` is linted consistently with `npm run lint`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, storage, messaging, Chrome Translator wiring, and GitHub/compose primitives. **No user story phase should start until this phase is complete.**

**⚠️ CRITICAL**: User stories depend on messaging and translation delegation matching `specs/002-github-translation-extension/contracts/extension-messages.md` and compose rules in `specs/002-github-translation-extension/contracts/github-surface.md`.

- [ ] T007 Define `UserTranslationPreferences`, `GlossaryEntry`, and `ExtensionMessage` union types matching `specs/002-github-translation-extension/contracts/extension-messages.md` in `extension/src/lib/types/messages.ts`
- [ ] T008 Implement load/save for preferences and glossary in `chrome.storage.local` in `extension/src/background/storage.ts` using fields from `specs/002-github-translation-extension/data-model.md`
- [ ] T009 Implement inbound message router for `preferences/*` and `glossary/*` with correlated `requestId` in `extension/src/background/messages.ts`
- [ ] T010 [P] Implement Chrome `Translator` wrapper (`availability`, `create`, chunk-friendly translate) mapping errors to `TranslateError` codes in `extension/src/lib/chrome/translator.ts`
- [ ] T011 [P] Implement optional source-language detection helper using built-in Language Detector API in `extension/src/lib/chrome/language-detector.ts`
- [ ] T012 Implement `translate/request` handling in the service worker delegating only to Chrome built-in APIs and replying with `translate/result` or `translate/error` in `extension/src/background/translate-coordinator.ts`
- [ ] T013 [P] Implement GitHub URL/path helpers and host allowlist checks in `extension/src/lib/github/url.ts`
- [ ] T014 [P] Implement compose-surface detection helpers (`textarea`, `input`, `contenteditable`) per `specs/002-github-translation-extension/contracts/github-surface.md` in `extension/src/lib/github/compose.ts`
- [ ] T015 Add content script bootstrap that registers listeners and defers to future pipelines in `extension/src/content/main.ts`
- [ ] T016 Wire service worker entry: storage init, message router, and translator coordinator registration in `extension/src/background/service-worker.ts`
- [ ] T017 [P] Add popup HTML/TS entry and minimal UI shell reading/writing `preferences/get` and `preferences/set` in `extension/src/popup/popup.html` and `extension/src/popup/popup.ts`
- [ ] T018 [P] Add options page HTML/TS shell for future glossary UI in `extension/src/options/options.html` and `extension/src/options/options.ts`

**Checkpoint**: Messaging, storage, and Chrome-only translation path work end-to-end from a trivial content-script ping.

---

## Phase 3: User Story 1 — Full-page translation on GitHub reading surfaces (Priority: P1) 🎯 MVP

**Goal**: Non-destructive full-page translation on supported `github.com` reading views with progressive coverage for long threads.

**Independent Test**: On a sample issue/PR read view, enable full-page mode; verify layout, reactions, links, and reply focus still work; scroll/load more and confirm behavior or visible partial-coverage indication per `spec.md` acceptance scenarios.

### Implementation for User Story 1

- [ ] T019 [US1] Implement initial PR read vs write / tab-state detection stubs and exports in `extension/src/lib/github/pr-mode.ts`
- [ ] T020 [US1] Implement non-destructive full-page text-node walker that skips excluded compose regions in `extension/src/content/full-page-walker.ts`
- [ ] T021 [US1] Add throttled `MutationObserver` integration for lazily loaded thread content in `extension/src/content/full-page-observer.ts`
- [ ] T022 [US1] Implement chunking/batching and `pathKind: "full"` translate requests in `extension/src/content/full-page-translate.ts`
- [ ] T023 [US1] Wire `fullPageEnabled` toggle from popup to active tab content script in `extension/src/popup/popup.ts` and `extension/src/content/main.ts`
- [ ] T024 [US1] Add user-visible loading/partial-coverage affordance without breaking layout in `extension/src/content/full-page-ui.ts`

**Checkpoint**: User Story 1 demonstrable on a long GitHub thread without blocking primary interactions.

---

## Phase 4: User Story 2 — Selection and hover translation (Priority: P2)

**Goal**: Dismissible overlay for selection translation; hover translation near paragraphs without forcing full-page mode.

**Independent Test**: Select paragraph text and invoke selection flow; hover another region; dismiss overlay without navigation; confirm focus is not permanently trapped per `spec.md`.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Implement dismissible overlay DOM/CSS and lifecycle in `extension/src/content/overlay.ts`
- [ ] T026 [US2] Implement selection capture, `pathKind: "selection"`, and overlay display in `extension/src/content/selection-translate.ts`
- [ ] T027 [US2] Implement hover targets for eligible static text and `pathKind: "hover"` in `extension/src/content/hover-translate.ts`
- [ ] T028 [US2] Expose `selectionEnabled` and `hoverEnabled` toggles in `extension/src/popup/popup.ts` and honor them in `extension/src/content/main.ts`

**Checkpoint**: User Story 2 works independently of glossary and code-aware logic (plain prose first).

---

## Phase 5: User Story 3 — Personal glossary with strict exact-match (Priority: P3)

**Goal**: User-managed glossary in storage; preferred rendering; strict entries not generically translated across flows.

**Independent Test**: Add entries with and without `strictExactMatch`; verify behavior on pages where phrases repeat per `spec.md` and SC-003 intent.

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implement glossary mask/restore or equivalent pre/post translation pipeline in `extension/src/lib/glossary/mask.ts`
- [ ] T030 [US3] Integrate glossary pipeline into full-page, selection, and hover code paths in `extension/src/content/translate-pipeline.ts`
- [ ] T031 [US3] Build glossary list/editor UI (CRUD, strict flag, user notes) in `extension/src/options/glossary-ui.ts` with `extension/src/options/options.html` importing the options bundle
- [ ] T032 [US3] Connect options UI to `glossary/list`, `glossary/upsert`, `glossary/delete` messages in `extension/src/options/glossary-store.ts`

**Checkpoint**: Glossary changes persist and affect all active translation modes.

---

## Phase 6: User Story 4 — Code blocks: translate comments only (Priority: P4)

**Goal**: Within code regions, translate comment spans only; leave tokens and structure stable per FR-006 / SC-004.

**Independent Test**: Use fixtures with fenced blocks; verify comments translate and identifiers/strings/keywords are unchanged in review checklist cases.

### Implementation for User Story 4

- [ ] T033 [P] [US4] Implement conservative comment-span lexer (`//`, `#`, `/* */`, etc.) in `extension/src/lib/code/comment-spans.ts`
- [ ] T034 [US4] Integrate code-region handling into full-page (and shared) pipelines in `extension/src/content/code-regions.ts`

**Checkpoint**: Code blocks behave distinctly from prose in translation pipelines.

---

## Phase 7: User Story 5 — Explicit higher-accuracy translation (Priority: P5)

**Goal**: Context menu action for enhanced selection translation, distinct from default path; clear errors when unavailable (FR-009, FR-010, FR-011).

**Independent Test**: Compare default selection vs enhanced action labeling; simulate unavailable translator and verify user-presentable error without DOM corruption.

### Implementation for User Story 5

- [ ] T035 [US5] Register and handle context menu click for enhanced translation in `extension/src/background/context-menus.ts`
- [ ] T036 [US5] Implement `pathKind: "enhanced"` flow with distinct UI labeling and optional wider local context in `extension/src/content/enhanced-translate.ts`
- [ ] T037 [US5] Map `translate/error` to overlay or toast messaging for enhanced path in `extension/src/content/enhanced-ui.ts`

**Checkpoint**: Enhanced path is opt-in, labeled, and degrades safely.

---

## Phase 8: User Story 6 — Compose safety and PR write scoping (Priority: P6)

**Goal**: No mutation of editable fields; full-page constrained on PR write/compose per FR-007, FR-008.

**Independent Test**: Focus comment/description editors; confirm no bulk mutation; switch PR Write vs read tabs; confirm matrix behavior per `spec.md`.

### Implementation for User Story 6

- [ ] T038 [US6] Complete PR Write-tab and compose-surface gating for full-page mode in `extension/src/lib/github/pr-mode.ts`
- [ ] T039 [US6] Centralize guards so bulk pipelines skip when focus is in excluded fields in `extension/src/content/compose-guards.ts`
- [ ] T040 [US6] Maintain capability matrix `{ fullPage, hover, selection, enhanced }` vs GitHub UI state as documented constants in `extension/src/lib/github/surface-capabilities.ts`

**Checkpoint**: Compose surfaces remain untouched; read views match Story 1 expectations.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, fixtures, and targeted unit tests from `plan.md` / `quickstart.md`.

- [ ] T041 [P] Document local build, load-unpacked path, and Chrome/Translator prerequisites in `extension/README.md`
- [ ] T042 [P] Add sanitized HTML snippets and URL checklist under `extension/tests/fixtures/` per `specs/002-github-translation-extension/contracts/github-surface.md`
- [ ] T043 [P] Add Vitest unit tests for glossary masking in `extension/tests/unit/glossary-mask.test.ts`
- [ ] T044 [P] Add Vitest unit tests for comment lexer in `extension/tests/unit/comment-spans.test.ts`
- [ ] T045 [P] Add Vitest unit tests for GitHub URL/helpers in `extension/tests/unit/github-url.test.ts`
- [ ] T046 Validate steps in `specs/002-github-translation-extension/quickstart.md` against the built extension and capture minimum Chrome notes in `extension/README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1 — **blocks all user stories**.
- **Phases 3–8 (US1–US6)**: All depend on Phase 2 completion. Recommended sequence: US1 → US2 → US3 → US4 → US5 → US6 by priority; US4/US5 can start after US2 if pipelines are modular enough, but US4 should integrate after US1 walker exists; US5 requires selection overlay infrastructure (US2).
- **Phase 9 (Polish)**: Depends on desired user stories being complete (minimum US1 for meaningful QA).

### User Story Dependencies

| Story | Depends on |
|--------|------------|
| **US1 (P1)** | Foundational only |
| **US2 (P2)** | Foundational; integrates with same translate coordinator |
| **US3 (P3)** | Foundational + translation pipelines from US1/US2 |
| **US4 (P4)** | Foundational + US1 DOM/pipeline integration points |
| **US5 (P5)** | Foundational + US2 selection/overlay |
| **US6 (P6)** | Foundational; tightens US1/US2 behavior (complete after those surfaces exist) |

### Within Each User Story

- Lib/helpers before content integration.
- Content integration before popup/options wiring for that story’s toggles.
- US3 glossary: mask module before pipeline hook.

### Parallel Opportunities

- Phase 1: T003–T006 can proceed in parallel after T001–T002.
- Phase 2: T010–T011, T013–T014, T017–T018 in parallel once T007–T009 and T012 are scoped (T012 after T010).
- Within US2: T025 parallel to prep work; T026–T027 parallelizable after overlay exists.
- Phase 9: T041–T045 highly parallel; T046 after build works.

---

## Parallel Example: User Story 2

```bash
# After T025 overlay exists, implement selection and hover in parallel files:
# extension/src/content/selection-translate.ts
# extension/src/content/hover-translate.ts
```

---

## Parallel Example: User Story 3

```bash
# Parallel implementation:
# extension/src/lib/glossary/mask.ts
# extension/src/options/glossary-ui.ts (UI separate from mask logic)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. **STOP and VALIDATE** using `quickstart.md` full-page checks on issues/PRs.
4. Demo or ship MVP.

### Incremental Delivery

1. Setup + Foundational → stable message/translate spine.
2. Add US1 → validate reading surfaces.
3. Add US2 → selection/hover without glossary.
4. Add US3 → glossary across modes.
5. Add US4 → code-aware behavior.
6. Add US5 → enhanced context menu path.
7. Add US6 → harden compose/PR write behavior.
8. Polish → docs, fixtures, unit tests.

### Parallel Team Strategy

After Phase 2: one developer on US1 pipeline, another on overlay/hover groundwork for US2 (shared contract: overlay API in `extension/src/content/overlay.ts`). Merge US1 before full integration tests for long threads.

---

## Notes

- All translation MUST stay on Chrome built-in Translator / built-in AI paths per FR-011/FR-012; no third-party HTTP translators in any task.
- `[P]` = safe parallel work on different files; re-check merge order for shared modules.
- Prefer small PRs per phase checkpoint.
