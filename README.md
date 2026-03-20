# 🚀 optimized-translator

A Chrome extension optimized for translating GitHub content with a developer-friendly experience.

---

## ✨ Features

### 1. Full Translation

- Translates entire content while preserving DOM structure
- Inserts translated content under original elements without breaking UI

### 2. Selection Translation

- Translate selected text via user interaction
- Displays result in a tooltip-style overlay

### 3. Right-Click Enhanced Translation

- Select text → right-click → use **Enhanced Translation**
- Uses Chrome Native AI Translation API for better contextual accuracy

### 4. Hover Translation

- Hover over a paragraph to instantly see translation below it
- Maintains reading flow without interruptions

### 5. Glossary System

- Define custom translation rules
- Ensures consistent and domain-specific terminology

### 6. Glossary Strict Mode

- Exact-match terms can be excluded from translation
- Prevents mistranslation of keywords or proper nouns

### 7. Code-Aware Translation

- Detects code blocks and translates **only comments**
- Preserves code readability and integrity

### 8. Input Field Handling

- Ignores input fields (textarea, input)
- For GitHub PRs:
  - Translation works only in **View mode**
  - Disabled in **Write mode**

---

## ⚙️ Translation Architecture

### Default Translation

- Powered by Chrome Translation API
- Used for:
  - Full translation
  - Selection translation
  - Hover translation

### Enhanced Translation

- Powered by Chrome Native AI Translation API
- Triggered via right-click context menu
- Provides improved contextual understanding

---

## 🎯 Design Goals

- Preserve original UI/UX while translating
- Provide multiple interaction-based translation flows
- Be fully optimized for developer environments (especially GitHub)
- Allow users to control translation accuracy via glossary

---

## 🧠 Why optimized-translator?

- Unlike generic translators, this extension:
  - Understands code vs text context
  - Avoids breaking layouts
  - Supports developer workflows (PRs, code reviews)
  - Provides both fast and high-accuracy translation options

---

## 🔥 Summary

> Fast by default, precise when needed — built for developers reading GitHub.

---

## 🛠 Future Improvements

- Support for more platforms beyond GitHub
- Team-shared glossary system
- Translation result caching for performance optimization
- Side-by-side comparison between default and enhanced translation

---

## 📦 Installation (Planned)

- Chrome Web Store (TBD)

---

## 📄 License

MIT
