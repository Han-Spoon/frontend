# 한스푼 제품·프론트엔드 문서

최종 갱신: 2026-09-10. 코드 기준: `feat/contest-ui-refresh`의 식당 발견·결과 기록 개편.

## 읽는 순서

1. [제품 목적과 범위](product-brief.md)
2. [사용자 흐름](user-flows.md), [라우트](routes.md)
3. [디자인 시스템](design-system.md), [기존 브랜드 가이드](BRAND_GUIDE.md)
4. [아키텍처](architecture.md), [현재 API와 제안 계약](api-contracts.md)
5. [다국어·접근성](i18n-accessibility.md), [검증](testing.md)

## 작업별 참고

| 작업 | 함께 갱신할 문서 |
| --- | --- |
| 기능·화면 추가 | product-brief, user-flows, routes |
| 공통 UI 변경 | design-system, BRAND_GUIDE |
| 서버·AI 연결 | api-contracts, architecture, ERD |
| 데모 데이터 변경 | demo-guide, testing |
| 중요한 선택 | decisions/에 ADR 추가 |
| 출시·수정 | changelog, testing |

- [시연 방법과 가짜 데이터 목록](demo-guide.md)
- [제품의 여섯 가지 고민과 결정](decisions/0001-discovery-and-scan.md)
- [사업 제휴와 후속 작업](roadmap.md)
- [큐레이션 편집 원칙](content-guide.md)
- [변경 기록](changelog.md)
- [기존 논리 ERD](ERD.md): 실제 DB 스키마를 의미하지 않음.

## 문서 유지 규칙

현재 구현, 제안, 미구현을 명확하게 구분한다. 동작하지 않는 API나 인증을 구현된 것으로 쓰지 않는다. 코드와 문서가 충돌하면 실제 코드를 점검하여 둘을 함께 갱신한다. API 키·개인정보·실사용자 스캔 이미지를 문서에 넣지 않는다. 새 AI 작업은 관련 문서와 변경 파일을 먼저 읽고 시작한다.

`docs/`는 모든 문서를 매번 통째로 읽는 용도가 아니다. 작업에 관련된 항목을 이 목차에서 찾아 읽는다. 반복되는 개발 규칙은 루트 `AGENTS.md`에서 관리한다.
