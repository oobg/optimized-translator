# Quickstart: 002-github-translation-extension

**Audience**: Developers building or testing the Chrome extension locally.

## Prerequisites

- Google Chrome (version aligned with [Built-in AI Translator API](https://developer.chrome.com/docs/ai/translator-api) support—verify current minimum in Chrome release notes).
- Node.js LTS (for TypeScript build once the scaffold exists).
- Translator / language model availability as per Chrome settings (policy may block on managed devices).

## Clone and install (after scaffold lands)

```bash
cd /Users/woong/home/01_woong/optimized-translator
npm install
npm run build
```

> Until `package.json` exists, treat this as the intended workflow; adjust script names to match the chosen template.

## Load unpacked

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. **Load unpacked** → select the build output directory (e.g. `dist/`).

## Verify on GitHub

1. Open a public issue or PR on `github.com` in a **read** view.
2. Enable full-page translation from the extension popup (or toolbar flow as implemented).
3. Confirm: reactions, links, and reply focus still work (SC-001).
4. Switch a PR to **Write** tab: whole-page translation should be constrained or off (FR-008).
5. Select text → default translation vs context-menu **enhanced** path (Story 5).

## Run tests (intended)

```bash
npm test
```

Integration checks against live GitHub may be manual or Playwright-based per `plan.md`.

## Spec artifacts

- Plan: `specs/002-github-translation-extension/plan.md`
- Contracts: `specs/002-github-translation-extension/contracts/`
