# Research: GitHub-focused developer translation extension

**Branch**: `002-github-translation-extension`  
**Date**: 2026-03-20

## 1. Translation engines (FR-011, FR-012)

**Decision**: Use Chrome’s **built-in AI Translator API** (`Translator` in the global scope, feature-detected in extension contexts) as the sole translation mechanism for text that leaves the “raw DOM string” boundary, with **no custom HTTP translation backends**. Use **Language Detector API** where source language is unknown, per [Chrome Translator API](https://developer.chrome.com/docs/ai/translator-api) guidance.

**Rationale**: The feature spec forbids third-party or extension-operated remote translators. The Translator API runs with browser-managed models and availability/download semantics, matching the clarification session (Chrome-only, no separate product backend). Official docs recommend `@types/dom-chromium-ai` for TypeScript and `Translator.availability()` / `Translator.create()` for lifecycle.

**Alternatives considered**:

- **Third-party REST translators** — Rejected (violates FR-012).
- **Relying on Chrome’s page-level “Translate” UI** — Rejected: not controllable from an extension for per-region, glossary, or code-aware behavior; does not meet UX stories.
- **Separate “fast” non-AI Chrome extension API** — Deferred: no stable, documented extension-only “light translation API” was assumed for MVP; if Chromium exposes a distinct non-AI API later, the default path can be split without changing glossary/DOM strategy.

**Default vs higher-accuracy (Story 5)**: Implement two **user-visible** flows: (1) default selection/hover/full-page uses standard chunking and shared `Translator` instances where practical; (2) explicit context-menu “enhanced” action uses the same API but **clear labeling**, optional **wider source context** (e.g. surrounding paragraph/thread slice) within Chrome limits, and stricter error surfacing when `availability()` is not `available`. If future Chrome versions expose a distinct higher-tier translator, wire the enhanced action to that capability only.

## 2. Extension platform & permissions

**Decision**: **Manifest V3** service worker + **content scripts** on `https://github.com/*`, with `storage` for glossary/preferences, `contextMenus` for enhanced translation, and `activeTab` only if later needed for narrow activation (prefer host permission on github.com for predictable behavior).

**Rationale**: MV3 is required for new Chrome extensions; content scripts match DOM observation and injection for GitHub’s dynamic UI.

**Alternatives considered**: MV2 — deprecated for new store listings.

## 3. DOM strategy (Stories 1–4, 6)

**Decision**: **Non-destructive** presentation: prefer inserting sibling nodes or annotated wrappers for full-page mode; **overlays** for selection/hover; **MutationObserver** (throttled) for lazy-loaded thread segments; **exclude** `textarea`, `input`, `contenteditable`, and GitHub compose surfaces from mutation.

**Rationale**: Preserves layout and satisfies FR-001, FR-007, FR-008; aligns with edge cases (large threads, partial translation).

**Alternatives considered**: Replacing `innerText` globally — Rejected (breaks controls and violates compose safety).

## 4. Code blocks (Story 4)

**Decision**: Treat `pre`, `code`, and GitHub-rendered fenced blocks as **code regions**; run translation only on **comment spans** identified by a **language-aware or heuristic comment lexer** (line comments `//`, `#`, `/* */`, etc.) with conservative fallback (skip block if uncertain).

**Rationale**: Meets SC-004 and FR-006; avoids translating identifiers and string literals when heuristics hold.

**Alternatives considered**: Full-block translation — Rejected; sending code to translator wholesale risks token corruption.

## 5. Glossary (Story 3)

**Decision**: Store entries in `chrome.storage.local` (or `sync` optional later); apply **pre-pass** replacement or **post-pass** enforcement: for strict entries, **mask** exact phrases before translation and **restore** after, or inject preferred rendering in UI layer—exact algorithm to be validated against FR-004/FR-005 in implementation.

**Rationale**: Keeps data on-device; works with any translator output.

**Alternatives considered**: Server-synced glossary — Out of scope per spec.

## 6. Build & test stack

**Decision**: **TypeScript** + **Vite** (or equivalent bundler) producing MV3 artifacts; **Vitest** for unit tests (parsers, glossary masking, GitHub URL/view detection); **Playwright** or manual QA checklist for GitHub DOM integration (SC-001, SC-005).

**Rationale**: Matches extension ecosystem norms; repo currently has no app code—greenfield choice.

**Alternatives considered**: Plain JS without bundler — Possible but weaker ergonomics for Chrome types and multi-entry builds.

## 7. Browser / capability degradation

**Decision**: When `Translator` is missing or `availability()` is not `available`, show **explicit** UI messages (FR-010, FR-012); never silently call a remote translator. Progressive translation for large pages with **cancel-safe** batching.

**Rationale**: Matches edge-case section and clarification on policy-blocked AI.

---

## Open points for implementation (non-blocking for plan)

- Minimum Chrome version and optional **origin trial** / flags documentation for Translator API should be mirrored in user-facing docs (`quickstart.md`).
- Exact GitHub selectors for “read vs write” on PRs should live in a maintainable allow/deny list with regression fixtures.
