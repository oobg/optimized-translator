# Contract: Enhanced 모델 다운로드 동의/진행 UI

## Purpose

Enhanced 경로에서 모델 다운로드 필요성이 감지되었을 때, 사용자 동의/취소 및 진행률 표시를 수행하는 UI 레이어의 기대 동작을 문서화한다.

## UI Responsibilities

### 1) Wi‑Fi 권장 고지/동의 UI (`wifi-consent-open`)

- 트리거: `Translator.availability()`가 `"downloadable"`(또는 `"downloading"`에 준하는 상태)일 때
- 사용자에게 다음을 제공해야 한다.
  - 명확한 문구: Wi‑Fi 권장 및 “동의 시 다운로드 시작”
  - 버튼 2개
    - `"동의하고 다운로드"`: 다운로드/진행 단계로 전이
    - `"취소"`: enhanced 요청을 취소하고 이후 번역/진행을 중단

### 2) 다운로드 진행 UI (`progress-open`)

- 트리거: 사용자가 동의한 뒤 `Translator.create({ monitor })`가 실행되면 표시한다.
- `monitor(m)`에서 받은 `downloadprogress` 이벤트로 진행률을 갱신한다.
  - 최소 2회 이상 UI가 업데이트되어야 한다(SC-002).
- 총량이 확정되지 않거나 “추출/로드 단계”로 전환되는 경우 indeterminate 상태 표시가 가능해야 한다.

### 3) 취소/실패 안내 UI (`error-open`)

- 취소 시:
  - 다운로드는 중단되어야 하며
  - 자동으로 기본 번역으로 전환하지 않는다
  - `"취소됨"` 상태 메시지와 함께 명시적 다음 행동을 제공해야 한다.
- 실패/차단 시:
  - 사용자에게 오류 메시지를 제공
  - 자동 전환하지 않고 명시적 `"기본 번역으로 계속"` 버튼을 제공해야 한다.

## Fallback Action Contract

### “기본 번역으로 계속” 버튼

- 동작: 방금 요청한 동일한 입력(text/selection/context)으로 **selection 기반 기본 번역**을 즉시 재시도한다.
- 구현 측면에서, Enhanced 흐름에서 확보한 selection context(text)를 유지하고 기본 번역 호출 파라미터를 동일하게 구성해야 한다.

