# Contract: Enhanced 요청 런타임 메시지

## Purpose

`extension/src/content/main.ts`가 수신하는 `ot/run-enhanced-translate` 메시지와, 해당 메시지에 의해 `extension/src/content/enhanced-translate.ts`가 실행되는 Enhanced 번역 흐름의 기대 동작을 문서화한다.

## Message

### Incoming (ContentRuntimeMessage)

- `type`: `"ot/run-enhanced-translate"`
- `requestId`: `string`
- `text`: `string`  
  - 컨텍스트 메뉴 Enhanced에서 넘겨주는 selection text

### Receiver

- `extension/src/content/main.ts`
  - `if (message.type === "ot/run-enhanced-translate")` 분기에서 `runEnhancedTranslation(message.text, prefs, glossary)`를 호출한다.

## Expected Behavior (after changes for this feature)

Enhanced 다운로드 동의/진행 UX는 Enhanced 흐름 내부에서 처리되며, UI 단계는 다음을 만족해야 한다.

1. `Translator.availability()` 결과가 다운로드가 필요한 상태(`downloadable`)면 Translator 다운로드 시작 전에 Wi‑Fi 권장 고지/동의 UI를 먼저 표시한다.
2. 사용자가 동의하면 `Translator.create({ monitor })`에서 `downloadprogress`를 구독해 진행률 UI를 업데이트한다.
3. 사용자가 취소하면 enhanced 번역은 취소로 처리되고, 자동 전환(기본 번역으로 자동 실행)은 하지 않는다.
4. 다운로드 실패/차단이면 사용자에게 오류 메시지를 제공하고, 명시적 “기본 번역으로 계속” 버튼을 통해 selection 기반 기본 번역을 재시도한다.

