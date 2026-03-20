# GitHub URL / surface QA checklist (sanitized)

회귀 및 수동 QA 시 아래 경로를 최소 1회씩 확인합니다 (SC-001).

1. `https://github.com/{org}/{repo}/issues/{n}` — 이슈 본문·댓글 읽기
2. `https://github.com/{org}/{repo}/pull/{n}` — PR Conversation 읽기
3. `https://github.com/{org}/{repo}/pull/{n}/files` — 변경 파일 diff 읽기
4. `https://github.com/{org}/{repo}/blob/{ref}/{path}` — 단일 파일 blob 보기
5. `https://github.com/{org}/{repo}/wiki/{page}` — 위키 읽기(해당 시)

`{org}`, `{repo}`, `{n}`, `{ref}`, `{path}`, `{page}` 는 실제 저장소 값으로 치환합니다.
