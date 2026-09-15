# 데모 데이터와 시연 안내

데모 모드의 식당과 후기 집계는 가상 데이터다. 운영 모드의 홈·지도·추천은 실제 식당 후보 API를 사용하며 홈 랭킹은 제거했다. 추천의 실사 사진은 실제 매장 사진이 아닌 참고 이미지다([출처와 정책](restaurant-recommendations.md)). 라이킷·기록은 브라우저 로컬에 보관된다. 데모 데이터를 현재 서버/AI 구현의 실적이나 실제 이용자의 피드백으로 해석하면 안 된다.

## 실행

```bash
pnpm install
pnpm dev --host 127.0.0.1 --port 5173
```

- `/home?demo=1&lang=ko`: 개발 서버의 API 없는 데모 시작. 프로필을 자동 제공.
- `/home?demo=1&lang=en`: 영어 홈 → USD 시연.
- `/home?demo=1&lang=ar`: 아랍어 홈 → RTL/SAR 시연.
- `/dev/results-preview?lang=en`: 고정 결과만 바로 확인.
- `/map?demo=1&lang=ko`: 내 주변 지도. 위치 권한 거부 시 성수 fallback.
- `/restaurants/demo-restaurant-40/menu?demo=1&lang=ko`: 초록식탁의 촬영 없는 등록 메뉴 결과.
- `/curation?demo=1&lang=ko`: 사진 중심 큐레이션 22편.
- `/history`: 저장한 기록 확인. 마이페이지에서 접근.

홈/지도 전체를 가상 데이터로 실행할 때만 `VITE_DEMO_MODE=true`를 사용한다. 현재 새 스캔은 `FIXED_SCAN_RESULTS_ENABLED=true`로 일반 빌드에서도 고정 결과를 제공한다. 개발 전용 results-preview 라우트는 프로덕션 빌드에 등록되지 않는다. 데모 URL의 demo=1은 개발 서버에서만 지원한다.

## 추천 시연 순서

스캔 결과 촬영은 [고정 분식 메뉴판 시나리오](scan-result-filming.md)를 따른다. 현재 모든 새 스캔 결과는 비건+새우 프로필과 13개 분식 메뉴로 고정된다. 아래의 우유 82% 예시는 이전 회귀 fixture 설명이며 현재 촬영 화면이 아니다.

1. 영어 홈에서 5개 자동 캐러셀을 보고 성수→부산을 전환한다.
2. 전체 지도에서 핀을 누르고, 입점/레시피 인증 배지와 같은 프로필 피드백 및 찜을 확인한다.
3. 입점 식당은 ‘내 프로필로 메뉴 보기’로 촬영 없이 6개 메뉴 결과를 확인한다. 일반 식당은 메뉴 스캔으로 진입하여 사진 선택/촬영 후 데모 분석 결과를 확인한다.
4. ₩15,000 ≈ $10.87과 주의 우유 82%를 보여준다.
5. 라이킷을 누르고 판정 근거·직원 전달 카드를 펼친다.
6. 기록하기 → 식당 연결 확인 → 프로필 관련 선택형 후기 → 저장.
7. 스캔 기록에서 다시 열어 당시 프로필과 메뉴를 확인한다.
8. 식당 연결을 해제한 일반 기록도 저장해 두 흐름을 비교한다.

## 가짜 데이터 위치

| 대상 | 파일/동작 |
| --- | --- |
| 18개 지역·식당 54곳·후기·입점 상태 | demo/restaurants.ts |
| 위치/지도 | `/map`: 일회성 실제 위치 조회 + 반경 10km의 임시 식당 좌표. 거부 시 성수 fallback |
| 환율 | demo/currency.ts의 고정값; 매일 00시 실제 갱신 없음 |
| 스캔 결과 메뉴/82%·68%·36% | results/resultFixtures.ts |
| 입점 식당의 등록 메뉴 | demo/partnerMenus.ts: 가상 레시피 6종, 현재 프로필로 재계산. 포함 확률 없음 |
| 라이킷/식당 찜 | han-spoon-demo:liked-menus / saved-restaurants |
| 장소 선택 | han-spoon-demo:selected-restaurant |
| 기록·피드백 | han-spoon-demo:records |
| 큐레이션 | constants/curation.ts + curationExtra.ts 총 22편; public/images/curation/의 생성 사진 8장 + 기존 Commons 사진 |

사진은 참조용 이미지다. 레스토랑의 실제 음식 사진이나 인증 증거가 아니다. `전체 레시피 인증`도 시연용 상태이며 실제 계약/검증 데이터가 아니다. 외부 이미지 네트워크가 차단되면 브랜드 색상/대체 화면으로 표시한다. 본격 배포 전 이미지 사용 조건과 최종 에셋을 검토한다.

지도 렌더링에는 `VITE_NAVER_MAP_KEY_ID`와 Naver Cloud의 Web 서비스 URL 등록이 필요하다. 식당 좌표는 현재 `demo/restaurants.ts`의 fixture이며 실제 DB 좌표가 준비되면 `StoreMap`의 `stores` 입력만 서버 데이터로 교체한다. 키가 없거나 인증에 실패하면 식당 목록을 이용하도록 폴백 안내를 표시한다.

큐레이션 사진 22편 전체를 재검토했다. 부적절한 사진은 내장 이미지 생성 도구로 제작한 8개 장면으로 교체하고, 주제에 맞는 Wikimedia Commons 사진은 유지했다. [전체 사진 감사와 프롬프트](curation-image-audit.md)에 글별 선택 근거를 기록했다. Commons 유지 파일은 실제 배포 시 저작자·라이선스 조건에 맞춰 크레딧 화면을 제공해야 한다.

랜딩 화면은 Unsplash의 [Bibimbap with fried egg](https://unsplash.com/photos/-UUkXJIXgy4)(Deepthi Clicks, Unsplash License) 실사 URL을 사용한다. 정돈된 플레이팅·입체적인 조명·짙은 배경으로 음식 전문 촬영의 분위기를 표현한다. 로그인 화면은 Wikimedia Commons의 `Samgyeopsal table.jpg`(이동원, CC0)를 사용한다. 공개 전 이미지 크레딧과 각 라이선스 조건을 다시 확인한다.

## 유지보수

스캔 fixture의 고정 판정은 샘플 프로필 시연용이며 임의의 실제 이용자에게 맞춘 AI 분석이 아니다. 별도의 스캔 테스트 프로필에서는 확률 표시 필터만 검증한다. 파트너 메뉴는 별도 가상 레시피 규칙으로 현재 프로필에 맞춰 판정하나 운영 AI·실제 식당 레시피가 아니다. 실제 음식 판단에 쓰지 않는다. 촬영용 UI에는 개발 중 문구를 넣지 않지만 데이터 출처는 이 문서와 코드에 계속 남긴다.

브라우저 저장 차단/용량 초과 시 세션 메모리로만 저장되며 새로고침하면 유지되지 않을 수 있다. 로컬 기록은 기기/브라우저 간 동기화되지 않는다. 계정별 저장은 향후 서버 구현 범위다.
