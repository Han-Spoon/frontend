# Han Spoon 작업 규칙

- 작업 전에 `git status`로 수동 변경을 확인하고 보존한다. 사용자와 같은 파일을 동시에 수정하지 않는다.
- 제품 범위는 `docs/product-brief.md`, 동선은 `docs/user-flows.md`, API는 `docs/api-contracts.md`를 읽는다.
- 디자인 토큰과 기존 로고를 재사용한다. 의미 있는 변경은 관련 문서와 함께 갱신한다.
- 확률은 caution + 적용 프로필의 회피 재료 + 유한한 0–100 숫자일 때만 보여준다. 안전 확률로 부르지 않는다.
- 큐레이션은 메뉴 사이에 삽입하지 않는다. 결과 목록 뒤에 한 섹션으로 둔다.
- 미구현 데이터는 `src/app/demo/` 또는 명시적인 fixture에 둔다. 기존 실제 API 판정을 덮어쓰지 않는다.
- 스캔 전 식당 연결은 선택 사항이다. 일반 스캔과 식당 연결 기록 모두 유지한다.
- 7개 언어 fallback과 아랍어 RTL을 보존한다. 번역 상태를 문서에 남긴다.
- 변경 후 `pnpm build`, `node scripts/check-demo.mjs`, `git diff --check`를 확인한다. UI 변경은 브라우저도 검증한다.
- `.pnpm-store/`, node_modules, dist, 비밀 환경파일은 커밋하지 않는다.
- 커밋/push/PR/병합은 해당 사용자 요청의 범위에 따른다.
