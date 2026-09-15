# 홈 식당 추천

2026-09-15. 홈의 조건별 랭킹을 사진 중심의 `HAN SPOON PICKS` 섹션으로 교체했다.

## 데이터와 동선

초기 선택 지역은 일반/데모 모두 청담(37.524, 127.047)이다.

- 운영 모드: `LiveHomeDiscovery`가 지도용으로 조회한 `POST /api/v1/stores/candidates` 응답을 재사용한다. 추가 요청이나 추천 전용 API는 만들지 않는다.
- 선택 지역 반경 1km, 최대 20개 후보 중 서버 응답 순서의 첫 6곳을 소개한다. 개인화·인기 순위·안전 추천 알고리즘이 아니며 같은 후보 응답에는 누구에게나 같은 카드가 보인다.
- 상호·지점·업종·도로명 주소를 그대로 사용한다. 후기·평점·영업 상태·레시피 인증을 추정하지 않는다. 누락된 주소는 숨기고 업종은 일반적인 소개 문구로 대체한다.
- 클릭하면 원본 `StoreCandidate`를 선택하고 검색 중심을 전달해 `/map`으로 이동한다. 이후 기존 식당 연결/스캔 계약을 유지한다.
- 지역 변경 시 추천 카드 스크롤은 처음으로 돌아간다. 로딩 스켈레톤, 빈 지역 안내, 실패 안내와 재조회 버튼을 제공한다. 운영 API 실패를 가상 식당으로 덮지 않는다.
- 개발 데모(`/home?demo=1`)에서만 기존 `demo/restaurants.ts`의 가상 식당 3곳을 사용한다.

## 사진 정책과 출처

현재 `StoreCandidate`에는 사진 필드가 없다. 아래 사진은 생성 이미지가 아닌 Unsplash 실사이며 실제 해당 가게의 사진은 아니다. 카드마다 ‘참고 사진’을 표시하고 섹션 하단에서도 안내한다. 키워드는 상호가 아닌 업종만 확인한다. 비빔밥/초밥은 해당 음식 사진, 한식은 한식 식탁, 불명확한 업종은 중립적인 식당 공간 사진을 사용한다. 모르는 업종에 임의의 음식 사진을 붙이지 않는다.

| 용도 | 사진 / 작가 | 원본 페이지 |
| --- | --- | --- |
| 한식 식탁 | Anbinh Pho | [한국 식당의 식사 장면](https://unsplash.com/photos/a-table-laden-with-korean-dishes-and-people-dining-wfa4EHNM_1k) |
| 비빔밥 | Dmitry Pavlovsky | [비빔밥과 반찬](https://unsplash.com/photos/korean-bibimbap-with-side-dishes-is-served-SbHulgzS_eo) |
| 초밥 | Ice Tea | [초밥 플래터](https://unsplash.com/photos/sushi-platter-d7UnylM3Xwc) |
| 식당 공간 | Toa Heftiba | [자연광이 있는 식당](https://unsplash.com/photos/restaurant-interior-during-daytime-doZQmog8A5w) |

원본 페이지의 Unsplash License 표기를 확인했다. `restaurantPhotos.ts`에 원본 CDN 주소를 관리하며 가로 1000px, 품질 85, 자동 포맷으로 요청한다. 로딩 실패 시 다른 무관한 사진을 넣지 않고 브랜드 배경과 식당 아이콘으로 대체한다. 이미지 생성·새 라이브러리·사진 파일 다운로드는 하지 않았다.

같은 업종/미상 업종이 반복되더라도 추천 6곳의 사진은 모두 다르게 배정한다. 업종별 사진을 우선하고 이미 사용한 경우 아래 실사 공간 사진 풀에서 미사용 이미지를 순서대로 선택한다. 같은 목록의 순서가 유지되면 사진도 유지된다. 음식 종류를 모르는 가게에 임의의 다른 음식 사진을 붙이지 않는다.

- [나무 소재 다이닝 공간](https://unsplash.com/photos/uUoVKLLDsGI) — Martin Baron
- [다크 우드 다이닝 룸](https://unsplash.com/photos/4OcwZ7SwsJI) — Joseph Sung
- [붉은 커튼과 테이블 세팅](https://unsplash.com/photos/0VIu_SAetn4) — Joseph Sung
- [초록빛 레스토랑 공간](https://unsplash.com/photos/qm6Ddb2qu7A) — Jason Leung
- [따뜻한 조명의 식당](https://unsplash.com/photos/Pgu0wF6EOOE) — Robert / Visual Diary

모두 Unsplash License의 참고 사진이다. 기존 Toa Heftiba 공간 사진과 합쳐 일반 공간 사진 6개를 확보했다.

백엔드에서 실제 사진을 제공하려면 `photoUrl`, 사진 권리/출처, 대체 텍스트, 썸네일 크롭 위치 계약을 먼저 합의한다. 실제 매장 사진과 참고 사진은 분리해야 하며 계약 전 존재하지 않는 필드를 사용하지 않는다.

## UI / 접근성

- 기존 쌀빛 바탕과 초록 브랜드를 유지한다. 24px 모서리, 360px 높이의 세로 사진 카드, 하단 그라디언트와 흰색 상호를 사용한다.
- 모바일에서는 다음 카드 일부가 보인다. 터치 스크롤, 스냅, 44px 이전/다음 버튼, 키보드 초점으로 이동할 수 있다. 끝에서는 버튼이 비활성화된다.
- 자동 재생하지 않는다. 모션 감소 설정에서는 버튼 스크롤도 즉시 이동한다. RTL의 진행 방향과 아이콘 방향을 반전한다.
- 신규 문구는 ko/en/ar를 제공하며 나머지 4개 언어는 기존 번역기의 영어 fallback을 사용한다. 식당명·주소는 API 원문을 유지한다.

## 검증 범위

`pnpm build`, `node scripts/check-demo.mjs`, `git diff --check`와 브라우저 렌더링을 확인한다. 사진 매핑 회귀 검사는 `check-demo.mjs`에 포함한다. 브라우저의 모의 API 응답 검증은 실제 인증/운영 서버의 성공을 뜻하지 않는다.

2026-09-15 검증 결과:

- 빌드·회귀 스크립트·공백 검사 통과. 기존 500kB 초과 번들 경고는 남아 있다.
- 한국어 430px, 아랍어 320px, 영어 1200px에서 가로 화면 넘침 없음. 추천의 네 실사 이미지 디코딩 성공.
- 모의 API로 지도/추천의 후보 요청 공유(최초 1회), 부산 좌표 전환, 스크롤 초기화, 선택 식당의 지도 전달, 실패→재조회→빈 결과, 사진 실패 대체 UI 확인. 브라우저 런타임 예외 없음.
- 로컬 Naver 지도는 SDK 로딩 실패 안내 상태였다. 실서버 인증과 실제 지도 렌더링 성공까지 검증한 것은 아니다. 지도 SDK/인증 코드는 이번 범위에서 변경하지 않았다.
