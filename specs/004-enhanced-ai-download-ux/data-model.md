# Data Model: Enhanced AI 다운로드 및 고지 UX

## Entities

### 1) `EnhancedTranslationFlow` (런타임 단위 상태 머신)

**Purpose**: “Enhanced 요청 1회”를 기준으로 다운로드/동의/진행/취소/성공/실패 상태를 일관되게 관리한다.

**Fields**

- `id: string`  
  - Enhanced 요청 1회에 대응하는 request id
- `pathKind: "enhanced"`  
  - Enhanced 전용 흐름임을 명시
- `text: string`  
  - 번역 대상(이미 마스킹/맥락 확장은 별도 단계에서 처리될 수 있음)
- `sourceLanguage?: string`  
  - LanguageDetector 결과 또는 payload 제공값
- `targetLanguage: string`
- `downloadState: DownloadState`
- `progress: DownloadProgress`  
  - 다운로드 진행률(가능한 경우 bytes 기준, 불가능하면 percent 기반)
- `uiState: UIState`
- `startedAt: number`

### 2) `DownloadState` (다운로드/세션 상태)

- `idle`: 아직 enhanced 번역이 시작되지 않음
- `consent-needed`: Translator `availability()`가 모델 다운로드가 필요함(`downloadable`)을 반환하여 동의 UI 대기
- `downloading`: `Translator.create({ monitor })` 호출 이후 `downloadprogress` 이벤트 수신 중
- `ready`: 다운로드/로드 완료(이후 translate() 실행 단계로 전이)
- `cancelled`: 사용자가 취소했거나, 취소 플래그에 의해 번역/진행이 무시됨
- `failed`: 다운로드/생성 실패(차단/오프라인/정책 등 포함)

### 3) `DownloadProgress`

- `loadedBytes?: number`
- `totalBytes?: number`
- `percent?: number`  
  - `totalBytes`가 있으면 `loadedBytes/totalBytes`로 계산
- `indeterminate?: boolean`  
  - 다운로드 막바지(또는 총량 불명확)에서 `e.loaded === e.total` 이후 “추출/메모리 로딩” 같은 단계로 전환 시 사용

### 4) `UIState`

- `hidden`: overlay/UI 미표시
- `wifi-consent-open`: Wi‑Fi 권장 고지/동의 모달 표시
- `progress-open`: 진행률 표시 UI 표시
- `error-open`: 실패/차단/취소됨 안내 UI 표시
- `result-open`: Enhanced 결과 오버레이 표시

## State Transitions

아래는 “Enhanced 요청 1회” 단위로 기대되는 전이 규칙이다.

1. `idle` -> `consent-needed`
   - 트리거: `Translator.availability()`가 `downloadable` 반환
2. `consent-needed` -> `downloading`
   - 트리거: 사용자가 “동의하고 다운로드” 버튼 클릭
   - 액션: `Translator.create({ monitor })` 호출 및 `downloadprogress` 구독 시작
3. `consent-needed` -> `cancelled`
   - 트리거: 사용자가 “취소” 버튼 클릭
   - 액션: (가능하면) create 호출 자체를 하지 않거나, 이미 생성됐더라도 `destroy()`로 종료 시도
4. `downloading` -> `ready`
   - 트리거: 다운로드 진행이 완료되었고 translate 가능한 상태가 되었을 때
   - 액션: translator.translate() 수행
5. `downloading` -> `cancelled`
   - 트리거: 사용자가 “취소” 버튼 클릭
   - 액션: `destroy()` 및 취소 플래그로 UI 업데이트/translate 수행 무시
6. `downloading` -> `failed`
   - 트리거: create/ready 과정에서 오류 발생
7. `cancelled`/`failed` -> `error-open` (UX)
   - 액션: 사용자가 “기본 번역으로 계속” 버튼을 선택하면 selection 기반 기본 번역 실행

## Non-Goals (이 기능에서 다루지 않는 것)

- 다운로드 진행 상태를 `chrome.storage`에 영속 저장하지 않는다(UX 세션 단위로 충분).
- 성공/실패/취소가 발생해도 “자동으로” enhanced -> 기본으로 전환하지 않는다. 항상 사용자 확인을 요구한다.

