# 라우트와 화면 책임

| 경로 | 화면 | 진입과 이탈 |
| --- | --- | --- |
| `/` | 브랜드 랜딩·언어 선택 | `/login` |
| `/login` | Google 전용 로그인·언어 선택 | 기존 사용자 home, 신규 onboarding, 뒤로 landing |
| `/onboarding` | 식단 프로필 설정/수정 | home 또는 mypage |
| `/home` | 동네 발견·지도 미리보기·조건별 랭킹·자동 캐러셀 | map, scan, curation |
| `/map` | 현재 위치 주변 지도·목록·검색 | 지역 선택, 식당 상세 시트 |
| `/map?area=seongsu&restaurant=:id` | 지역 지도·식당 상세 시트 | 파트너 메뉴 또는 scan |
| `/restaurants/map`, `/restaurant/map` | 이전 링크 호환 | 쿼리를 보존해 `/map`으로 replace 리다이렉트 |
| `/restaurants/:id/menu` | 파트너 등록 레시피의 프로필별 메뉴 결과 | map, onboarding, 기록 저장 |
| `/scan` | 기존 촬영/업로드 화면 + 식당 선택 | analyzing 또는 데모 results |
| `/analyzing` | 기존 업로드 이미지 분석 상태 | results 또는 home |
| `/results` | 메뉴 판정·환산 가격·라이킷·저장 | scan, home, history, curation 상세 |
| `/history` | 서버 스캔과 로컬 방문 기록 통합 | 마이페이지에서 진입, results 상세 |
| `/curation` | 문화 콘텐츠 목록·검색·태그 | `/curation/:id` |
| `/curation/:id` | 글 상세와 추천 | 뒤로가기/다른 글 |
| `/cards` | 의사소통 카드 | 기존 카드 흐름 |
| `/mypage` | 프로필·언어·기록 관리 | onboarding, results, login |
| `/dev/results-preview?lang=en` | 고정 결과 시연 | 개발 서버 전용 |

`/home?demo=1&lang=en`은 개발 서버에서 API 없는 데모 세션을 시작한다. 동일 SPA 내 이동에는 유지되지만 쿼리가 없는 URL을 새로 열거나 새로고침하면 일반 모드로 시작한다. 배포용 촬영 빌드는 `VITE_DEMO_MODE=true`를 명시한다.

현재 `/results`의 실제 분석은 React 메모리에 있으므로 새로고침 시 빈 결과가 될 수 있다. 로컬 저장 기록은 `/history`에서 다시 열 수 있다. 향후 `/scans/:id` 형태의 서버 기반 상세 라우트를 도입할 수 있다.

이전 `/home`의 촬영 책임을 `/scan`으로 옮겼다. 외부에서 `/home`을 촬영 진입점으로 사용했다면 링크를 갱신한다.
