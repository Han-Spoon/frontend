# 검증 절차

## 명령

```bash
pnpm build
node scripts/check-demo.mjs
git diff --check
pnpm dev --host 127.0.0.1 --port 5173
```

`pnpm build`는 번들 검증이며 전체 TypeScript 타입 검사가 아니다. demo 체크는 Vite의 TS 로더로 실제 소스 모듈을 실행한다. 외부 테스트 패키지는 추가하지 않는다.

## 자동 확인 범위

- 원화 문자열: 쉼표, ₩, 원, KRW, 0을 처리하고 범위/인원 조건/음수를 거절한다.
- 7개 언어 통화 매핑과 원화 보존.
- 주의 + 활성 프로필 매칭 + 0–100 유한 확률일 때만 표시.
- safe/danger/프로필 없음/무관 프로필/NaN/범위 밖 확률에는 비표시.
- 새 글 10편 이상, ID 중복 없음, 3개 언어 3문단 본문.
- 지역별 식당 후보와 공통 프로필 피드백 필터.
- 같은 기록의 upsert, 식당 지정/미지정 레코드 공존, 손상된 저장값과 저장 차단 시 메모리 fallback.

## 수동 브라우저 시나리오

1. 홈: 캐러셀 이동/목적지, 5개 지역, 지도 핀과 목록 동기화, 식당 상세, 찜, 랭킹 탭.
2. 촬영: 식당 선택/건너뛰기/변경, 갤러리 파일 검증, 카메라 거부 fallback.
3. 결과: 전체/안전/주의/위험 필터, 근거 확장, 직원 카드, 확률 위치, 원화/환산 가격.
4. 라이킷: 토글, 다른 메뉴 영향 없음, 재열기/새로고침 유지.
5. 저장: 식당 없음/있음, 관련 프로필 후기만 표시, 건너뛰기, 장소 변경 시 후기 초기화, 반복 저장 중복 방지.
6. 이력: 양 종류 기록, 재열기, 이름 변경, 삭제.
7. ko/en/ar, 통화 7종, 320/390/430px, RTL, 키보드/Escape, 긴 문구.

## 통합 검증 경계

지도/환율/방문 인증/랭킹 서버는 미구현이라 실제 연동 성공으로 보고하지 않는다. 실제 인증·S3 업로드·AI 응답 검증은 실행 중인 백엔드와 테스트 계정이 필요하다. 데모 fixture 통과와 실제 API 통과를 구분한다.

## 2026-09-10 실행 결과

- `pnpm build`: 통과. 약 558kB의 JS 청크에 대한 500kB 초과 경고가 남아 있다.
- `node scripts/check-demo.mjs`: 통과.
- `git diff --check`: 통과.
- 브라우저: 지역 전환, 영문 식당 검색, 공통 프로필 후기, 라이킷 보존, 식당 연결/미연결 저장, 저장 기록 재열기, 선택형 후기 보존, 반복 저장 중복 방지를 확인했다.
- 320px 아랍어 결과에서 RTL, SAR 환산 가격, 가로 넘침 없음을 확인했다.
- 전체 타입 검사: 기존 `LoginScreen.tsx:177`의 GoogleLogin locale 속성 타입과 `ProfileCommunicationSheet.tsx:62–63`의 LocalizedMenuText/LocalizedText 불일치로 실패했다. 두 파일은 이번 작업에서 변경하지 않았다. 새 파일에 대한 진단은 없었다.

타입 검사 실행 명령:

```bash
pnpm --package=typescript@5.9.3 dlx tsc --noEmit --jsx react-jsx --moduleResolution bundler --module esnext --target es2022 --lib es2022,dom,dom.iterable --skipLibCheck --allowSyntheticDefaultImports --allowImportingTsExtensions src/main.tsx src/vite-env.d.ts
```

카메라 장치·실제 업로드·실제 AI 완료 및 Google 인증 성공을 이 검증 결과에 포함하지 않는다.
