# 프론트엔드 아키텍처

React 18 + TypeScript + React Router + Vite 6 + Tailwind 4. pnpm 10.12.1. 이 저장소에는 서버 구현이 없다. `pnpm build`는 Vite 번들 빌드이며 별도의 TypeScript 전체 타입 검사 명령은 아직 없다.

## 책임

| 위치 | 역할 |
| --- | --- |
| `src/app/App.tsx` | 라우팅, 사용자/분석 상태, 서버 이력과 로컬 기록 통합 |
| `src/api/` | 기존 인증·프로필·업로드·스캔·카드 어댑터 |
| `src/app/components/HomeScreen.tsx` | 식당 발견, 지역과 랭킹, 식당 상세 |
| `src/app/components/ScanScreen.tsx` | 이전 홈의 촬영·파일 검증·업로드 |
| `src/app/components/discovery/` | 지도, 접근 가능한 바텀시트, 식당 선택 |
| `src/app/components/results/` | 근거, 의사소통 행동, 기록 저장 |
| `src/app/results/` | ViewModel, 확률 표시 필터, 고정 결과 fixture |
| `src/app/demo/` | 가상 식당, 고정 환율, 로컬 저장소, 방문 레코드 |
| `src/app/constants/curationExtra.ts` | 새 큐레이션 12편 |

## 실데이터 경로

파일 → 기존 업로드 API → S3 key → 스캔 생성 → 기존 폴링 → `mapMenuResult` → `MenuAnalysis` → `buildMenuResultViewModel` → 결과 화면.

백엔드가 이미 보내는 메뉴 이름, 가격, riskLevel, hits, message, ownerCard는 그대로 활용한다. 확률을 기존 high/medium/low 값에서 임의 환산하지 않는다. 미래 agent 구조는 ViewModel 아래의 서버 문제이며 화면은 에이전트 수에 의존하지 않는다.

## 데모 경로

홈 데이터는 `restaurants.ts`의 12개 가상 식당이다. 지도는 SVG 개략도이며 핀 위치를 위도·경도 차이에서 구한다. 내 주변의 기준은 성수 고정이다. 외부 지도/위치 호출은 하지 않는다.

`VITE_DEMO_MODE=true` 또는 개발 서버 첫 진입 `?demo=1`에서 샘플 프로필을 제공한다. 데모 촬영은 업로드를 생략하고 fixture 결과로 이동한다. 일반 모드 스캔 API는 유지한다.

`han-spoon-demo:` 접두어의 localStorage 키: records, liked-menus, saved-restaurants, selected-restaurant. `useSyncExternalStore`로 같은 탭의 변경 및 다른 탭의 storage 이벤트를 반영한다. 저장 차단 시 메모리 fallback을 사용하므로 그 경우 새로고침 영속성은 없다.

기록에는 당시 프로필 스냅샷을 보관한다. 메뉴 라이킷 키는 임시로 정규화한 한국어 메뉴 이름이다. 서버 연동 시 restaurantId+canonicalMenuId 또는 scanMenuId로 바꿔야 다른 식당의 동명 메뉴가 합쳐지지 않는다.

## 경계와 후속 개선

로컬 저장은 로그인 계정별 서버 데이터가 아니다. 공용 브라우저 사용·로그아웃 시 정리·보관 기간·용량 제한을 출시 전에 정한다. 실데이터와 연결하려면 사용자 범위를 가진 저장 API가 필요하다. 현재 local visit 삭제는 서버 원본 scan을 삭제하지 않는다. 원본은 통합 목록에 다시 나타날 수 있다.

환경변수: `.env.example`. 개발 `/api` 프록시 대상은 `http://localhost:8080`. 새로운 비밀 키는 `VITE_` 환경변수에 넣지 않는다.
