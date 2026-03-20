# Research: Enhanced AI 다운로드 및 고지 UX

## Scope

Enhanced 경로(컨텍스트 메뉴의 “고정밀 번역 (Enhanced)”)에서 Chrome 내장 **Translator API** 모델 다운로드가 필요할 때 사용자에게:
- 다운로드 전 Wi‑Fi 권장 고지 및 명시적 동의
- 다운로드/설치 진행률 표시
- 취소/실패 시 명확한 상태 메시지와 “기본 번역으로 계속” 같은 명시적 다음 행동

을 제공하기 위한 기술 결정을 정리한다.

## Translator API 모델 다운로드 감지/진행 보고

### 모델 준비 상태 확인: `Translator.availability()`

- Translator API는 모델 다운로드 필요 여부를 `Translator.availability()`로 확인할 수 있다.
- 대표 상태는 다음과 같다.
  - `available`: 즉시 사용 가능 (동의/진행 UI 불필요)
  - `downloadable`: 모델/커스터마이제이션 다운로드가 필요 (진행 UI 권장)
  - `unavailable`: 해당 디바이스에서 사용 불가

근거:
- [Inform users of model download](https://developer.chrome.com/docs/ai/inform-users-of-model-download)
- [Translation with built-in AI / Translator API 모델 다운로드](https://developer.chrome.com/docs/ai/translator-api#model-download)

### 다운로드 진행률 모니터링: `Translator.create({ monitor })` + `downloadprogress`

- `Translator.create()`는 `monitor` 옵션을 받을 수 있으며, `monitor(m)` 내부에서 `downloadprogress` 이벤트를 구독하여 다운로드 진행률을 UI에 반영할 수 있다.
- 진행률 UI는 `e.loaded`와 `e.total`(또는 문서 예제에서 `e.loaded * 100%`)를 이용해 percent로 표현한다.

근거:
- [Inform users of model download - Monitor and share download progress](https://developer.chrome.com/docs/ai/inform-users-of-model-download#monitor-and-share-download-progress)
- [Translator API - Listen for model download progress with `downloadprogress`](https://developer.chrome.com/docs/ai/translator-api#model-download)

### 사용자 동작(activation)과 동의 UX

- Translator `create()`는 사용자 활성화(user activation) 하에서 호출되어야 한다.
- 따라서 “동의 버튼 클릭” 같은 사용자 제스처 이후에 `create({ monitor })`를 호출하도록 UX 흐름을 설계한다.

근거:
- [Translator API - Check user activation before `create()`](https://developer.chrome.com/docs/ai/translator-api#user-activation)

## 구현 결정(Decision) 및 이유(Rationale)

### Decision 1: Enhanced 다운로드/동의/진행 UI는 content 스크립트에서 직접 제어

**선택 이유**
- Wi‑Fi 고지/동의/취소/진행률은 페이지 내 overlay/UI가 필요하다.
- 현재 코드에서는 Enhanced 경로가 오버레이를 content에서 렌더링하고 있고, `extension/src/content/enhanced-translate.ts`는 단순히 translate 결과/에러만 보여준다.
- Translator 모델 다운로드 진행 이벤트(`downloadprogress`)를 사용자와 즉시 상호작용시키려면 content에서 `monitor`를 직접 구독하는 편이 안전하고 구현 난이도가 낮다.

**관련 현재 구조(관찰)**
- `extension/src/content/enhanced-translate.ts`: `translateWithGlossary(..., "enhanced")` 호출 후 결과/에러 오버레이 표시
- `extension/src/content/enhanced-ui.ts`: 성공/실패 시 텍스트 오버레이만 표시
- `extension/src/content/overlay.ts`: 버튼/진행 UI 확장 필요
- `extension/src/lib/chrome/translator.ts`: 현재는 `availability()`/`create()` 사용하지만 진행률 모니터링 UI를 제공하지 않음

### Decision 2: `availability()` 상태가 `downloadable`/`downloading`일 때만 “Wi‑Fi 권장 고지 + 동의”를 표시

**선택 이유**
- feature spec FR-002/FR-003: “실제로 필요할 때에만” 다운로드 전 동의 단계가 있어야 한다.
- Chrome 문서도 `downloadable`인 경우 사용자에게 다운로드 진행 UI를 제공하라고 권장한다.

### Decision 3: 취소/실패 시 자동 전환 금지 + 명시적 “기본 번역으로 계속”

**선택 이유**
- feature spec FR-003/FR-005/FR-007: 취소 및 실패 시 enhanced 요청을 취소/실패로 처리하고, 자동으로 기본 번역으로 전환하지 않는다.
- “기본 번역으로 계속” 버튼을 통해 사용자가 명시적으로 다음 행동을 선택한다.

**기본 번역 경로**
- 컨텍스트 메뉴 Enhanced는 “selection 기반” 사용자 행동이므로, 버튼 동작은 selection 경로 번역으로 재시도한다(동일 입력/대상).

### Decision 4: 취소는 Translator 세션에 대해 중단(destroy) + 추가 UI 업데이트 무시

**선택 이유**
- 취소 시 “다운로드/설치가 안전하게 중단”되어야 한다.
- `Translator.create()`가 반환하는 translator 인스턴스에 `destroy()`가 존재(현재 코드에서 `TranslatorInstance.destroy?: () => Promise<void>`로 취급)하므로, 가능하면 이를 호출해 세션을 종료한다.
- 취소 플래그를 두고, `downloadprogress` 이벤트 및 이후 완료/번역 분기에서 UI 업데이트와 translate 수행이 발생하지 않도록 한다.

## Alternatives considered

### Alternative A: background(서비스 워커)가 다운로드/번역을 수행하고, content에 진행률을 메시징으로 전달

**단점**
- 진행률 이벤트 스트리밍(`downloadprogress`)을 위해 메시지 프로토콜 확장 및 탭 타겟팅/동시성 처리 로직이 커진다.
- 취소 처리(다운로드 abort)까지 포함하면 background->content 양방향 제어가 복잡해진다.

### Alternative B: Enhanced는 content에서 download만 수행하고, 번역은 background에서 수행

**단점**
- “다운로드 완료 후 번역 실행”의 session 수명/translator 인스턴스 공유 문제가 생긴다.
- 같은 translator 인스턴스를 재사용하지 못하면 결국 추가 복잡도가 발생한다.

## Open questions (if any)

- `TranslatorInstance.destroy()`가 “다운로드 중”인 상태를 실제로 즉시 중단시키는지(브라우저 구현 차이) 여부.
  - 이 부분은 실제 Chrome에서 동작 확인 후, 필요 시 취소 UX를 “create 호출 전 취소” 중심으로 더 보수적으로 조정한다.

