# optimized-translator (Chrome MV3 extension)

GitHub(`https://github.com/*`)에서 **Chrome 내장 Translator API**만 사용해 전체 페이지·선택·호버·고정밀(컨텍스트 메뉴) 번역과 용어집을 제공합니다. 서드파티 번역 HTTP API는 사용하지 않습니다.

## 사전 요건

- **Google Chrome** 최신 안정 버전(Chrome 내장 AI / Translator API가 켜진 프로필)
- `chrome://flags` 또는 설정에서 **기기 내 번역/언어 모델** 관련 기능이 허용되어 있어야 할 수 있습니다. 자세한 점검은 [Chrome Translator API 문서](https://developer.chrome.com/docs/ai/translator-api)와 저장소의 `specs/002-github-translation-extension/quickstart.md`를 참고하세요.

## 빌드

저장소 루트에서:

```bash
npm install
npm run build --workspace=extension
```

산출물은 `extension/dist/` 입니다.

## 로드 (언팩)

1. Chrome에서 `chrome://extensions` → **개발자 모드** 켜기  
2. **압축해제된 확장 프로그램을 로드합니다**  
3. `extension/dist` 폴더 선택  

## 개발 스크립트 (extension 패키지)

```bash
npm run test --workspace=extension
npm run lint --workspace=extension
```

루트에서는 `npm test`, `npm run lint`로 동일하게 실행할 수 있습니다.

## 동작 요약

- **팝업**: 대상 언어(BCP-47), 전체 페이지 / 선택 / 호버 토글  
- **옵션**: 용어집 CRUD, 엄격 일치(strict) 플래그  
- **백그라운드**: `chrome.storage.local`에 설정·용어집 저장, `translate/request`를 Translator API로 처리  
- **콘텐츠**: GitHub 읽기 영역 위주로 DOM을 건드리며, 작성 중인 `textarea` / `contenteditable` 등은 변형하지 않도록 가드합니다.

## 제한 사항

- Translator / Language Detector 가 없거나 정책상 차단되면 UI에 오류 메시지를 표시하고 원격 번역으로 대체하지 않습니다.  
- 전체 페이지 번역은 노드 수에 비례해 API 호출이 많아질 수 있으니, 긴 이슈 스레에서는 시간이 걸릴 수 있습니다.
