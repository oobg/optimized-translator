# Data model: GitHub-focused developer translation extension

**Branch**: `002-github-translation-extension`  
**Date**: 2026-03-20  
**Source**: `spec.md` Key Entities + functional requirements

## Storage overview

| Store | Mechanism | Purpose |
|--------|-----------|---------|
| Glossary | `chrome.storage.local` (array/object keyed by id) | User-defined terms and strict rules |
| Preferences | `chrome.storage.local` | Target language, toggles, UI mode flags |
| Session (optional) | in-memory in content script | Overlay positions, batch tokens—not a product persistence requirement |

---

## Entity: GlossaryEntry

Represents one user-configured term and how translation should treat it.

| Field | Type | Required | Validation / notes |
|--------|------|----------|---------------------|
| `id` | string (UUID or nanoid) | yes | Stable key for updates/deletes |
| `sourcePhrase` | string | yes | Non-empty; max length TBD in implementation (suggest ≤500 chars) |
| `preferredOutcome` | string | yes | Rendered text or policy label agreed in UI (e.g. fixed display string) |
| `strictExactMatch` | boolean | yes | When true, FR-005: phrase must not be generically translated (masking or equivalent) |
| `userNote` | string \| null | no | Shown only in options UI, not on GitHub |

**Relationships**: None to other entities (flat list). Ordering: optional `sortIndex` for UI.

**State**: Active only; “deleted” = removal from storage.

---

## Entity: UserTranslationPreferences

Global settings driving all flows.

| Field | Type | Required | Notes |
|--------|------|----------|-------|
| `targetLanguage` | string (BCP 47) | yes | e.g. `ko`, `en-US` |
| `fullPageEnabled` | boolean | yes | Story 1 mode toggle |
| `selectionEnabled` | boolean | yes | Story 2 |
| `hoverEnabled` | boolean | yes | Story 3 |
| `preferEnhancedWhenAvailable` | boolean | optional | Hint for UI defaults; explicit action still required for P5 |

**Relationships**: Applies to all GitHub tabs where the extension runs.

---

## Entity: TranslationOverlay (transient)

Not persisted; describes runtime UI for selection/hover.

| Field | Type | Notes |
|--------|------|-------|
| `anchor` | DOM reference / selector + rect | Positioning for dismissible layer |
| `sourceText` | string | Snippet translated |
| `translatedText` | string | Result |
| `pathKind` | enum: `selection` \| `hover` \| `enhanced` | Distinct labeling for Story 5 |
| `dismissed` | boolean | User cleared overlay |

**State transitions**: `hidden` → `visible` → `dismissed` → (removed from DOM).

---

## Derived / view-state (PR read vs write)

Not stored as user data; detected at runtime:

| Concept | Detection hint (illustrative) |
|---------|-------------------------------|
| `ComposeSurfaceActive` | Focus in `textarea` / `contenteditable`; GitHub tab “Write” selected |
| `PullRequestWriteMode` | GitHub PR UI tab state + compose selectors per contracts |

Used to enforce FR-007 and FR-008 without persisting.

---

## Validation rules summary

- Glossary `sourcePhrase` uniqueness: recommended UX warning on duplicate exact strings.
- `targetLanguage` must be supported by `Translator.availability()` when possible; otherwise surface error (FR-010).
