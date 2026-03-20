# Contract: GitHub surface & compose safety

**Version**: 0.1.0  
**Scope**: When the extension may mutate or overlay DOM on `https://github.com/*`.

## Host match

- **In scope**: `https://github.com/*` paths used for reading/reviewing (issues, PRs, repo file browser, wiki-style reading as covered by QA fixtures).
- **Out of scope**: Non-GitHub origins; enterprise hosts unless explicitly added later.

## Compose / edit exclusion (FR-007, FR-008)

Translation features MUST NOT alter text inside:

| Selector / signal | Treatment |
|-------------------|-----------|
| `textarea, input[type="text"], input[type="search"]` | Never mutate value; skip full-page replacement inside |
| `[contenteditable="true"]` | Skip |
| GitHub PR **Write** tab active | Disable or scope whole-page translation so compose areas are untouched |
| Focus within excluded fields | Do not run bulk translation that could touch the field |

**Read vs Write (PR)**: Implementation MUST maintain a small **capability matrix** (documented in code) mapping GitHub UI states to `{ fullPage, hover, selection, enhanced }` allowed booleans.

## Content eligibility

| Region | Rule |
|--------|------|
| Prose (issues, comments, descriptions in read view) | Eligible for full/selection/hover |
| `pre code` / highlighted code blocks | Comments-only subspans only (FR-006) |
| File blobs / diffs | Read-only surfaces eligible; avoid breaking syntax highlighting wrappers |

## Observable behavior

- If translation cannot run for a region, UI SHOULD indicate **partial coverage** rather than leaving the page in a broken layout (spec edge cases).

## Regression artifacts

Maintain a checklist of **≥5** canonical URLs (SC-001) and DOM snapshots (sanitized) under repo `tests/fixtures/` when the codebase exists.
