<!--
Sync Impact Report
Version change: TEMPLATE (uninitialized) -> 0.1.0
Modified principles:
1) (template placeholder) -> I. Chrome Native AI Translation Only
2) (template placeholder) -> II. User Consent & Network Transparency for AI Downloads
3) (template placeholder) -> III. Download Progress & Clear State Feedback
4) (template placeholder) -> IV. Non-Destructive, Compose-Safe Translation
5) (template placeholder) -> V. Spec-First Engineering, Verifiable Quality Gates
Added sections:
- Implementation Constraints
- Development Workflow
Removed sections: none
Templates requiring updates:
- ⚠ pending: .specify/templates/commands/*.md (directory not found in repo)
Follow-up TODOs: none
Modified files:
- .specify/memory/constitution.md
- specs/002-github-translation-extension/plan.md
-->

# optimized-translator Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Chrome Native AI Translation Only
[비협상 규칙] 번역은 Chrome이 제공하는 내장 API만 사용한다.
- 기본 번역 경로는 Chrome 내장 `Translator` API를 MUST 통해서만 수행한다.
- “향상된 정확도(enhanced)” 경로는 브라우저가 제공하는 Chrome 내장 AI 번역 기능을 MUST 통해서만 수행한다.
- 확장(서드파티) 원격 번역 서비스나, 확장이 별도의 번역 백엔드를 붙여 처리하는 방식은 MUST 금지한다.
- `Translator.availability()` 등 기능 가용성 체크 실패 시, MUST 사용자에게 명확한 메시지로 안내하고 안전하게 degrade 한다.

### II. User Consent & Network Transparency for AI Downloads
[비협상 규칙] AI 모델(LLM) 다운로드/설치가 필요해질 때는 사전 고지와 동의 흐름이 필수다.
- 다운로드가 필요할 때는 MUST 먼저 사용자에게 “AI 다운로드 전 Wi-Fi를 권장”하는 사전 팝업/안내를 표시한다.
- 다운로드 트리거 이전에 MUST 사용자의 명시적 동의를 요구한다.
- 사용자가 동의하지 않으면 MUST 다운로드를 시도하지 않고, 가능한 경우 기본(기본 번역) 경로로 안전하게 fallback 한다.

### III. Download Progress & Clear State Feedback
[비협상 규칙] AI 모델 다운로드는 진행률과 상태를 보여줘야 한다.
- 다운로드/설치가 진행되는 동안 MUST 진행률표시(예: percent/단계/바이트 기준)를 UI에 제공한다.
- 완료/실패/취소/차단 같은 상태를 MUST 사용자에게 명확히 전달한다.
- 실패 시 MUST “다음 행동”이 가능한 사용자 메시지를 제공하며, 페이지/오버레이 상태를 깨뜨리지 않는다.

### IV. Non-Destructive, Compose-Safe Translation
[비협상 규칙] 사용자의 편집 경험을 망치지 않는다.
- 번역 기능은 MUST 사용자가 입력/작성 중인 compose 영역을 절대 변조하지 않도록 설계한다.
- 전체 번역(full-page)은 MUST 레이아웃을 깨지 않게 비파괴 방식으로 렌더링하고, 주요 GitHub 제어 접근성을 보장한다.
- selection/hover 번역은 MUST dismiss 가능하고, 포커스/접근성 동작이 정상이어야 한다.

### V. Spec-First Engineering, Verifiable Quality Gates
[비협상 규칙] “관찰 가능하고 검증 가능한” 방식으로 구현한다.
- 각 번역 동작은 MUST feature spec의 요구사항/성공기준(FR/SC)에 직접 연결되도록 구현한다.
- 오류/가용성 문제는 MUST 코드/메시지 형태로 사용자에게 표현되며, 비정상 상태에서 UI가 고장나지 않게 한다.
- progressive/대용량 번역은 MUST 취소에 안전하고 비동기 처리에 의해 기본 사용 흐름을 막지 않는다.
- 구현 변경은 MUST 최소한의 검증 절차(유닛 테스트 또는 재현 가능한 QA 체크)로 품질을 확인한다.

## Implementation Constraints
이 프로젝트의 구현 제약을 명시한다.

- 대상은 MV3 Chrome 확장이며, 번역/AI는 Chrome 내장 API 범위에서만 동작한다.
- 전체/선택/호버 번역은 각 경로의 DOM 정책(제외 compose 영역 등)을 준수한다.
- 대용량 페이지는 progressive/chunking 처리로 UI 블로킹을 피한다.
- AI 가용성/다운로드 필요 여부는 기능 탐지 및 사용자 고지/진행률로 처리한다.

## Development Workflow
개발/리뷰 흐름의 품질 게이트를 명시한다.

- 모든 변경은 먼저 constitution의 비협상 규칙과 feature spec의 FR/SC를 대조해 위반 여부를 확인한다.
- AI 다운로드/진행률/Wi-Fi 권장 고지/Chrome 네이티브 사용 정책은 MUST 리뷰 체크리스트 항목으로 포함한다.
- 설계/스펙이 바뀌면 관련 실행 문서(플랜/태스크/QA 체크)도 함께 동기화한다.
- 최소 검증: 번역 경로(기본/enhanced 가능 시), 대용량 progressive 시나리오, compose 안전 시나리오를 재현한다.

## Governance
헌법은 프로젝트의 최우선 규칙이며, 위반 시 해당 스펙/플랜/태스크 조정이 필요하다.

### Amendment Procedure
- 헌법 수정은 명시적 문서 변경(PR/커밋)으로만 허용한다.
- 변경 이유(“왜 필요한가”)와 영향 범위(어떤 원칙/요구사항이 바뀌는가)를 반드시 문서화한다.
- 번역/AI UX(사전 고지/동의/진행률)는 비협상 규칙이므로, 변경 시 사용자 영향과 리스크를 함께 기술한다.

### Versioning Policy
- `CONSTITUTION_VERSION`은 semantic versioning을 따른다.
  - MAJOR: 비협상 원칙의 삭제/재정의 또는 거버넌스 변경의 근본적 방향 전환.
  - MINOR: 원칙/섹션의 추가 또는 가이드의 실질적 확장.
  - PATCH: 문구/명확화/오탈자/비의미적 정리.
- 이 문서는 처음으로 “템플릿 → 비준(수립)”되었으므로 `0.1.0`부터 시작한다.

### Compliance Review Expectations
- 모든 리뷰는 constitution의 비협상 규칙이 feature spec/구현에 반영됐는지 확인해야 한다.
- 변경이 생긴 경우, 관련 문서/템플릿/플랜이 함께 업데이트됐는지 확인한다.

**Version**: 0.1.0 | **Ratified**: 2026-03-20 | **Last Amended**: 2026-03-20
