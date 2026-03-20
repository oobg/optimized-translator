# Feature Specification: GitHub-focused developer translation experience

**Feature Branch**: `002-github-translation-extension`  
**Created**: 2026-03-20  
**Status**: Draft  
**Input**: User description: "Browser extension optimized for translating GitHub content for developers (derived from product README): full-page translation preserving structure; selection and hover flows; optional higher-accuracy path via explicit user action; glossary with strict mode; code-aware comment-only translation; safe behavior around editable fields and PR view vs write surfaces."

## Clarifications

### Session 2026-03-20

- **Q**: May translation rely on network-based processing outside the user’s device, or must all paths avoid sending page content off-device? → **A**: All features use Chrome’s built-in Translation API only; the higher-accuracy (“enhanced”) path uses Chrome’s built-in AI translation capability. The extension does not send content to separate external translation services (no third-party or product-operated translation backends).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Translate a full GitHub reading surface without breaking the page (Priority: P1)

A developer opens an issue, pull request, or repository reading view on GitHub and turns on full-page translation. Translated text appears inline with the existing layout so they can continue reading, clicking links, and using standard GitHub controls.

**Why this priority**: This is the core value: understandable foreign-language content on GitHub without sacrificing usability of the host page.

**Independent Test**: Enable translation on a representative issue and PR thread; verify reading and primary interactions remain possible without turning translation off.

**Acceptance Scenarios**:

1. **Given** a GitHub issue or PR conversation in a supported reading view, **When** the user enables full-page translation, **Then** translated text is shown in context (e.g., adjacent to or clearly associated with originals) without collapsing or hiding essential controls such as reactions, timestamps, and permalinks.
2. **Given** a long thread, **When** the user scrolls and expands collapsed content, **Then** newly revealed content follows the same translation rules consistently or the user sees a clear, non-destructive indication that part of the page is not yet translated.

---

### User Story 2 - Translate a specific passage or paragraph on demand (Priority: P2)

The user highlights text or hovers a paragraph to see a translation quickly without committing the entire page to translated state.

**Why this priority**: Supports targeted comprehension during review without forcing a global mode.

**Independent Test**: Select arbitrary paragraph text and use selection translation; hover another paragraph for hover translation; confirm overlays do not trap focus or block underlying UI permanently.

**Acceptance Scenarios**:

1. **Given** visible paragraph text, **When** the user invokes selection translation, **Then** a lightweight overlay shows the translation and can be dismissed without reloading the page.
2. **Given** readable body text, **When** the user uses hover translation, **Then** the translation appears near the hovered region without permanently mutating the original text unless the user chooses a persistent mode.

---

### User Story 3 - Enforce consistent terminology with a personal glossary (Priority: P3)

The user maintains a list of terms (product names, internal jargon, acronyms) so translations respect domain language. Optional strict behavior prevents certain exact phrases from being translated at all.

**Why this priority**: Reduces mistranslation of identifiers and brand terms that break developer comprehension.

**Independent Test**: Configure glossary entries and strict flags; load pages where those terms appear; verify expected behavior for both translated and excluded phrases.

**Acceptance Scenarios**:

1. **Given** a configured glossary mapping from a source phrase to a preferred rendering, **When** that phrase appears in eligible content, **Then** the user sees the preferred rendering (or equivalent agreed behavior) consistently across full-page, selection, and hover flows where those flows apply.
2. **Given** a term marked for strict exact-match exclusion, **When** that exact phrase appears, **Then** it is not translated in a way that alters the phrase, while surrounding text may still translate.

---

### User Story 4 - Keep code readable: translate comments, not executable structure (Priority: P4)

On pages that show code blocks, the user expects natural-language comments to be understandable while symbols, keywords, and structure stay intact.

**Why this priority**: Developers rely on code fidelity; mistranslating code tokens is worse than leaving them alone.

**Independent Test**: Use pages with fenced code blocks containing comments and mixed text; verify comments translate while obvious code tokens do not change meaningfully.

**Acceptance Scenarios**:

1. **Given** a code block containing comments in a supported language, **When** translation runs, **Then** comments are translated and code tokens are not replaced with translated words in sampled cases defined in test materials.
2. **Given** a code block with no translatable comments, **When** translation runs, **Then** the block content is unchanged aside from allowed no-op formatting.

---

### User Story 5 - Higher accuracy only when the user explicitly asks (Priority: P5)

After selecting text, the user opens a context menu action to request a higher-accuracy translation for that selection when the default path is insufficient, implemented with Chrome’s built-in AI translation capability when the browser makes it available.

**Why this priority**: Balances speed for routine reading with precision for ambiguous passages without surprising latency or cost for every action.

**Independent Test**: Select difficult passage; run default vs explicit higher-accuracy action; confirm only the explicit path promises stronger contextual handling and surfaces outcome in an understandable way.

**Acceptance Scenarios**:

1. **Given** selected text on a supported GitHub surface, **When** the user chooses the explicit higher-accuracy action, **Then** the user receives a result labeled or presented distinctly from the default quick translation path.
2. **Given** the higher-accuracy path is unavailable (capability missing or blocked), **When** the user tries the action, **Then** the user sees a clear failure message and can still fall back to the default translation path where applicable.

---

### User Story 6 - Do not corrupt what the user is composing (Priority: P6)

The extension avoids translating text the user is editing. On pull requests, translation is available in read-oriented views and is suppressed while the user is in a compose/write experience.

**Why this priority**: Prevents accidental mutation of drafts, comments being posted, or sensitive draft text being processed unexpectedly.

**Independent Test**: Focus a comment box and a PR description editor; confirm translation does not alter field contents. Toggle PR view vs write mode where applicable.

**Acceptance Scenarios**:

1. **Given** focus in a standard text input or multiline compose field, **When** automatic or bulk translation features run, **Then** the field’s text is not modified by the extension.
2. **Given** a GitHub pull request page in write/compose mode, **When** the user attempts translation features that would affect the whole page, **Then** those features are disabled or scoped so compose surfaces are untouched; **When** the user switches to a read/view-oriented state, **Then** translation features behave according to Story 1 where supported.

---

### Edge Cases

- Very large pages or threads: translation may be partial or progressive; the user must not be left with a permanently broken layout if rendering is slow or incomplete.
- Mixed-language content: glossary rules apply where configured; otherwise behavior remains predictable (no random per-word language flipping in a single paragraph without user action).
- Dynamic content loaded after scroll (infinite comments): newly loaded regions either receive translation under the same rules or clearly indicate they are not yet covered.
- Unsupported browser or missing optional capability: features degrade gracefully with explicit messaging for the higher-accuracy path; core reading translation remains available where the platform allows extensions to operate.
- Permission or host restrictions: if translation cannot run on a given GitHub URL pattern, the user sees a concise explanation rather than silent failure.
- Chrome Translation API or built-in AI translation unavailable (disabled, unsupported build, or policy-blocked): the affected feature surfaces a clear message; the product MUST NOT substitute a third-party or extension-operated remote translator.

## Requirements *(mandatory)*

### Scope

- **In scope**: `github.com` web UI surfaces commonly used for reading and reviewing code and discussions (issues, pull requests, repository file browsing, and analogous reading views as defined in test materials).
- **Out of scope**: Non-GitHub sites; shared/team glossary sync across users; persistent cross-session translation caching as a product requirement; side-by-side comparison of two translation engines in one view; enterprise compliance certifications beyond standard browser extension expectations.

### Functional Requirements

- **FR-001**: The product MUST offer a full-page translation mode on supported GitHub reading views that preserves navigability and does not remove access to primary GitHub actions visible in baseline untranslated pages in the test checklist.
- **FR-002**: The product MUST offer selection-based translation with a dismissible overlay that does not require a full navigation to clear.
- **FR-003**: The product MUST offer hover-based paragraph translation on eligible static text regions without forcing full-page translation first.
- **FR-004**: The product MUST offer a user-managed glossary containing entries with at least: source phrase, preferred outcome (translation or fixed rendering), and a strict exact-match flag.
- **FR-005**: When strict exact-match is enabled for a glossary entry, the product MUST keep that exact phrase from being translated as generic language.
- **FR-006**: The product MUST treat code blocks distinctly from prose so that comments may be translated while code tokens remain stable per acceptance tests.
- **FR-007**: The product MUST NOT change text the user is typing or editing in composition surfaces (comment boxes, pull request description editors, and similar posting fields) as a result of translation features.
- **FR-008**: On GitHub pull request pages, the product MUST disable or constrain whole-page translation while the user is in compose/write experiences and MUST allow translation in read/view experiences where Story 1 applies.
- **FR-009**: The product MUST expose an explicit user action (e.g., context menu entry) to request a higher-accuracy translation for the current text selection, distinct from the default fast path.
- **FR-010**: The product MUST surface user-visible errors when an optional capability (such as the higher-accuracy path) is unavailable, without corrupting page content.
- **FR-011**: Full-page, selection, and hover translation MUST use Chrome’s built-in Translation API. The explicit higher-accuracy action MUST use Chrome’s built-in AI translation capability when the browser exposes it; it MUST NOT be implemented as a separate remote translation product or third-party API integrated by the extension.
- **FR-012**: The extension MUST NOT transmit page text or user selections to any translation endpoint that is not part of invoking Chrome’s built-in Translation API or built-in AI translation capability (no self-hosted or third-party translation backends added by the extension).

### Key Entities *(include if feature involves data)*

- **Glossary entry**: Domain term or phrase as entered by the user; preferred rendering or translation policy; strict exact-match flag; optional notes for the user’s own reference (not shown to readers).
- **User translation preferences**: Target language choice; enabled modes (full, selection, hover); default vs higher-accuracy path preferences where applicable.
- **Translation overlay**: Transient presentation of a translation tied to a selection or hover region, with dismissal and accessibility of underlying content.

### Assumptions

- Users install the product as a Google Chrome extension and grant the permissions needed to read and adjust GitHub pages according to Chrome’s standard prompts.
- Translation quality and availability follow Chrome’s built-in Translation API and built-in AI translation behavior (including any processing model internal to Chrome); the extension does not replace these with its own translation stack.
- “GitHub” means the public `github.com` product UI; enterprise-hosted variants are out of scope unless explicitly added later.
- Target language selection follows a simple global preference chosen by the user unless superseded by documented browser behavior the user controls.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a fixed regression set of at least five GitHub pages (issue, PR conversation, file view, wiki-style reading if applicable, and one long thread), full-page translation completes without blocking primary actions (link follow, reaction, reply entry focus) in 100% of cases in internal QA passes.
- **SC-002**: For selection translation on 20 representative excerpts (≤400 characters each), median time from invoke action to visible result is under 5 seconds on a broadband connection during internal testing.
- **SC-003**: With ten configured glossary terms appearing at least three times each across the regression set, at least 95% of occurrences match the configured policy (translated consistently or excluded per strict flag) in manual audit.
- **SC-004**: In a sample of 15 code blocks with comments, zero cases may alter identifiers, string literals, or keywords in a way that changes executable meaning, as judged by a developer review checklist.
- **SC-005**: In usability sessions with at least five participants, at least four report they can complete a foreign-language PR review task faster or with higher confidence compared to using GitHub without the product’s translation aids (pre/post subjective scale + task timing).
