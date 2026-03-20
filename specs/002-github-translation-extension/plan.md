# Implementation Plan: GitHub-focused developer translation experience

**Branch**: `002-github-translation-extension` | **Date**: 2026-03-20 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/002-github-translation-extension/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver a **Google Chrome extension (MV3)** that improves reading and review on **github.com** through **full-page**, **selection**, and **hover** translation; a **user-managed glossary** with **strict exact-match** behavior; **code-block comment-only** translation; **compose-safe** behavior (no mutation of drafts); and an **explicit higher-accuracy** translation action using **Chrome built-in AI** when available. All translation MUST stay on **Chrome-provided APIs**—no third-party or extension-operated translation backends (FR-011, FR-012, clarification session).

## Technical Context

**Language/Version**: TypeScript (≥5.x) targeting ES2022+ for MV3  
**Primary Dependencies**: Chrome Extensions Manifest V3; Built-in AI **Translator** / **Language Detector** APIs ([Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api)); Vite (or equivalent) bundler; `@types/chrome`, `@types/dom-chromium-ai`  
**Storage**: `chrome.storage.local` for glossary + user preferences (no server)  
**Testing**: Vitest (unit: parsers, glossary, URL/view detection); manual or Playwright against GitHub fixtures for integration (SC-001, SC-005)  
**Target Platform**: Google Chrome desktop (minimum version TBD from Translator API availability matrix)  
**Project Type**: browser-extension (single package)  
**Performance Goals**: Selection path median &lt;5s for ≤400 char excerpts on broadband (SC-002); non-blocking progressive full-page translation on long threads  
**Constraints**: No third-party translation HTTP APIs; no mutation of compose fields; degrade gracefully when AI/translator blocked (FR-010, edge cases)  
**Scale/Scope**: `github.com` only; single-user glossary; no cross-session caching requirement per spec

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status |
|--------|--------|
| `.specify/memory/constitution.md` | **Ratified** (2026-03-20) — AI 다운로드 UX(와이파이 권장 + 진행률) 원칙 포함. |
| Action | **PASS (provisional)** — gates enforced by **feature spec** FR/SC and Chrome platform constraints documented in `research.md` and `contracts/`. |

**Post–Phase 1 re-check**: Design artifacts (`data-model.md`, `contracts/`, `quickstart.md`) align with FR-001–FR-012 and clarification on Chrome-only translation. No additional constitution violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/002-github-translation-extension/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── extension-messages.md
│   └── github-surface.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Repository is currently **spec-first**; the following is the **target** layout for implementation.

```text
extension/
├── manifest.json
├── src/
│   ├── background/          # service worker: menus, storage, coordinator
│   ├── content/             # GitHub DOM: translate pipelines, observers, overlays
│   ├── options/             # glossary + preferences UI
│   ├── popup/               # quick toggles
│   └── lib/                 # glossary, chunking, code-comment lexer, github view detection
├── public/
└── tests/
    ├── unit/
    └── fixtures/            # sanitized HTML snippets / URL checklist

dist/                        # build output (load unpacked)
```

**Structure Decision**: Single **extension/** package with MV3 entries (`background`, `content`, `popup`, `options`) and shared **lib** for spec-heavy logic (glossary, code awareness, GitHub read/write detection). Tests colocated under **extension/tests**.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations recorded (template constitution). No entries.

---

## Phase 0 & 1 outputs (this run)

| Artifact | Path |
|----------|------|
| Research | `specs/002-github-translation-extension/research.md` |
| Data model | `specs/002-github-translation-extension/data-model.md` |
| Contracts | `specs/002-github-translation-extension/contracts/*.md` |
| Quickstart | `specs/002-github-translation-extension/quickstart.md` |

**Phase 2** (`tasks.md`) is intentionally **not** produced by `/speckit.plan`; use `/speckit.tasks` when ready.
