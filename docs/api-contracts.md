# 현재 API와 제안 출력 계약

2026-09-10 기준. 아래 현재 API는 `src/api/`를 근거로 한다. 제안 구조는 서버 구현/합의가 완료되었다는 의미가 아니다.

## 현재 API

| 요청 | 용도 |
| --- | --- |
| POST `/api/v1/auth/google` | Google 로그인 |
| POST `/api/v1/auth/refresh` | 세션 갱신 |
| POST `/api/v1/auth/logout` | 로그아웃 |
| GET/PATCH `/api/v1/users/me` | 사용자 조회·변경 |
| GET/POST/PATCH `/api/v1/users/me/profile` | 식단 프로필 |
| POST `/api/v1/uploads/sas` | 업로드 URL 요청 |
| POST `/api/v1/scans` | `{ storageKey, source }`로 분석 시작 |
| GET `/api/v1/scans/:scanId` | 상태·최종 메뉴·재촬영 사유·실패 코드(`failureCode`) |
| GET `/api/v1/scans?page=0&size=20` | 스캔 이력 |
| PATCH/DELETE `/api/v1/scans/:scanId` | `{ title }` 변경/삭제 |
| GET/POST `/api/v1/cards/saved` | 카드 목록/저장 |
| DELETE `/api/v1/cards/saved/:id` | 카드 삭제 |

현재 메뉴: `menuNameKo`, `menuNameEn?`, `priceText?`, `riskLevel`, `isSpicy?`, `hits?`, `message?`, `ownerCard?`. 응답은 data 래핑이 있거나 직접 전달될 수 있다. `mapMenuResult`가 프론트 구조로 변환한다. 서버에는 식당 ID, 라이킷, 피드백을 아직 보내지 않는다.

분석 상태는 pending/processing/analyzing → processing, completed/complete/done/succeeded → completed로 정규화한다. failed, needs_retake, unknown은 별도로 다룬다.
`failed` 응답의 `failureCode`는 사용자 안내와 운영 추적에 사용한다. 동일 `storageKey`는 멱등 키이므로 terminal failed 이후 UI 재시도는 같은 요청을 반복하지 않고 새 이미지를 업로드해야 한다.
인증 토큰 저장은 `src/api/auth.ts`만 담당하며, 보호 API는 `authFetch`를 통해 401 발생 시 한 번 재발급한 뒤 원 요청을 다시 보낸다.

## AI 최종 출력 제안

오케스트레이터의 내부 에이전트 구조는 미정이다. 사용자가 필요한 최종 정보만 아래처럼 조립해서 제공한다. 기존 필드를 유지하고 optional explainability를 점진적으로 추가하는 방식을 권장한다.

```json
{
  "menuId": "canonical-menu-id",
  "menuNameKo": "버섯 크림 리조또",
  "menuNameEn": "Mushroom cream risotto",
  "priceText": "15,000원",
  "riskLevel": "caution",
  "explainability": {
    "decisionReason": { "ko": "크림 소스에 우유가 들어갈 수 있어요.", "en": "The cream sauce may contain milk." },
    "profileRelatedItems": [{ "ko": "우유 알레르기", "en": "Milk allergy" }],
    "ingredients": [{
      "name": { "ko": "우유", "en": "Milk" },
      "inclusionProbability": 82,
      "profileIds": ["allergy:milk"],
      "confidence": "medium",
      "sourceTypes": ["menu-description", "trusted-cooking"]
    }],
    "hiddenIngredientPaths": [[{ "ko": "크림 소스" }, { "ko": "우유" }]],
    "uncertainties": [{ "ko": "식물성 크림 사용 여부를 확인해 주세요." }],
    "curationId": "sauce-on-side"
  }
}
```

82는 시연용 고정값이다. 실서비스의 확률은 추정·보정 방법과 출처가 합의되어야 한다. 프론트의 현재 MenuResult API 어댑터에는 위 확장 필드가 아직 연결되지 않았다. 서버 확장 시 타입·검증·어댑터를 함께 갱신한다.

## 확률 불변 조건

1. 메뉴가 caution일 것.
2. ingredient.profileIds와 적용된 사용자 프로필 ID가 하나 이상 겹칠 것.
3. inclusionProbability가 유한한 숫자이며 0–100 사이일 것.
4. 값이 없으면 0%로 치환하지 말고 숨길 것.
5. safe/danger에 0%/100%를 추정하여 붙이지 않을 것.

`getCautionProbabilities`가 이 조건을 실행한다. ID 형식은 allergy:milk, religion:halal, vegan:vegan, preference:no-spicy 등이며 사용자 프로필 어댑터와 공유한다. 식재료 포함 확률을 식사 안전 확률로 표현하지 않는다.

## 식당·방문·선호의 향후 계약

- Restaurant: id, 한국어 원명, localizedDisplayName, aliases, 위도·경도, 지역, 메뉴 유형, 사진 출처, 영업 정보 확인 시각.
- Scan context: restaurantId nullable, selectionSource(nearby/area/search/qr), selectedAt. 위치값은 동의/필요성에 따라 별도 관리.
- Visit: id, userId, scanId, restaurantId nullable, profileSnapshot, visitedAt, verificationStatus.
- Feedback: visitId, profileItemId, questionId, answer(yes/no/unknown), createdAt. 현재 질문은 식단 의사소통의 편의성이다.
- Like: userId, canonicalMenuId 또는 scanMenuId, restaurantId nullable. idempotent upsert/delete.
- FX: base=KRW, quote, rate, asOf, timezone=Asia/Seoul. 서버 스케줄이 성공했을 때만 실제 갱신 시각 변경.

아직 확정하지 않은 엔드포인트를 가정하여 프론트에서 요청하지 않는다. 런타임 검증 실패 시 서버 원본 판정을 보존하고 선택적 확장 정보만 생략한다.
