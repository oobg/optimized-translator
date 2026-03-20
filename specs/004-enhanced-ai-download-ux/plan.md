# Implementation Plan: Enhanced AI 다운로드 및 고지 UX

**Branch**: `004-enhanced-ai-download-ux` | **Date**: 2026-03-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-enhanced-ai-download-ux/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Chrome 내장 Translator API 기반의 **향상된 번역(Enhanced)** 실행 시, 모델 다운로드가 필요한 경우 `Translator.availability()`로 감지한 뒤 **Wi‑Fi 권장 고지/명시적 동의**를 먼저 보여주고, `Translator.create({ monitor })`의 `downloadprogress`를 통해 **진행 상태를 사용자에게 투명하게 표시**한다. 또한 다운로드/설치가 취소되거나 실패한 경우 자동 전환하지 않고 **“기본 번역으로 계속” 같은 명시적 다음 행동**을 제공한다.

## Technical Context

**Language/Version**: TypeScript (>=5.x), ES2022+ target for MV3  
**Primary Dependencies**: Chrome Extensions Manifest V3; built-in AI **Translator** / **LanguageDetector** APIs  
**Storage**: N/A (다운로드 동의/진행 UI는 세션 단위 상태로 처리, 영속 저장은 선택)  
**Testing**: Vitest (가능한 경우 상태/도메인 로직 단위 테스트), 수동 QA (Chrome에서 모델 미다운로드/다운로드/취소 시나리오)  
**Target Platform**: Google Chrome Desktop (기본 번역/Enhanced API 가용성에 따라 degrade)  
**Project Type**: browser-extension (single package)  
**Performance Goals**: Enhanced 요청 후 Wi‑Fi 고지 표시까지 평균 1초 이내 (SC-001), 다운로드 진행 표시 최소 2회 갱신 (SC-002)  
**Constraints**: 번역은 반드시 Chrome 내장 API만 사용 (원격 제3자 백엔드 금지), compose 영역을 비파괴로 유지  
**Scale/Scope**: github.com 콘텐츠에서 context menu selection 기반 Enhanced만 해당

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**비협상 규칙 준수 요약**

1. Chrome Native AI Translation Only: Enhanced 경로에서도 **Translator API만 사용**.  
2. User Consent & Network Transparency: 모델 다운로드가 필요한 경우 **다운로드 시작 이전 동의 UI** 표시.  
3. Download Progress & Clear State Feedback: `create({ monitor })`의 `downloadprogress`로 **진행률/단계** 제공 및 완료/실패/취소를 명확히 전달.  
4. Non-Destructive, Compose-Safe Translation: Enhanced는 오버레이 렌더링만 수행하고 compose 입력을 변조하지 않음.  
5. Spec-First Engineering: FR/SC에 직접 매핑되는 UX 상태 머신(대기/동의필요/다운로드중/취소됨/실패/성공)을 구현.

## Project Structure

### Documentation (this feature)

```text
specs/004-enhanced-ai-download-ux/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
extension/
├── manifest.json
├── src/
│   ├── background/
│   ├── content/
│   ├── lib/
│   ├── options/
│   └── popup/
└── tests/
```

**Structure Decision**: 기본 번역(selection/hover/full-page)은 기존 background 중심 구조를 유지하고, Enhanced 다운로드 동의/진행 UX는 **content 스크립트에서 Translator.create+monitor로 직접 제어**한다.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations recorded.
