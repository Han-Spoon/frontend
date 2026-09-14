# 큐레이션 사진 감사

2026-09-14. 전체 22편의 제목·요약·본문 주제와 실제 사진을 비교하고, 목록 썸네일과 상세 히어로에서 피사체를 확인했다. 22편 모두 브라우저 이미지 로딩을 확인했다.

## 글별 선택

| 글 ID | 사진의 핵심 피사체 | 처리 |
| --- | --- | --- |
| sauce-on-side | 비빔밥 옆에 별도로 내는 고추장 그릇 | 생성 사진으로 교체 |
| market-small-plates | 시장 노점 위 조리된 음식과 주문하는 사람 | 내용에 맞아 유지 |
| solo-table | 창가 카운터의 1인 국수 식사 | 생성 사진으로 교체 |
| broth-question | 국물과 재료가 드러나는 순두부찌개 | 내용에 맞아 유지 |
| seongsu-walk | 성수 거리와 보행자 | 지역 산책 글에 맞아 유지 |
| busan-seaside | 부산 해운대 해변 | 바다 곁 식사 여행 글에 맞아 유지 |
| spice-conversation | 붉은 양념의 떡볶이 | 맵기 조절 주제에 맞아 유지 |
| banchan-questions | 나물·김치 등 여러 반찬 그릇 | 생성 사진으로 교체 |
| cafe-pause | 카페의 차·커피·빵 | 내용에 맞아 유지 |
| halal-conversation | 식당 직원에게 휴대전화의 식단 카드를 보여주는 손님 | 종교 시설 팻말 대신 생성 사진 |
| menu-memory | 식당에서 한식 한 끼를 휴대전화로 촬영 | 집의 샐러드 대신 생성 사진 |
| ordering-rhythm | 직원과 소통하며 메뉴를 확인하는 손님 | 생성 사진으로 교체 |
| korean-table | 밥·국·반찬이 차려진 한국 식탁 | 생성 사진으로 교체 |
| fermentation | 옹기 된장·고추장·김치·콩 | 생성 사진으로 교체 |
| chimaek | 프라이드 치킨과 맥주 | 두 요소가 모두 있는 생성 사진 |
| bunsik | 떡볶이 접시 | 분식 글에 맞아 유지 |
| banchan-free | 여러 작은 반찬 그릇 | 시장 풍경 대신 생성 사진 |
| grill-cut | 식당 직원의 집게와 가위로 고기를 자르는 장면 | 생성 사진으로 교체 |
| kimchi-200 | 무김치 그릇 | 배추 외 김치의 다양성에 맞아 유지 |
| shared-stew | 함께 먹는 뚝배기 찌개 | 내용에 맞아 유지 |
| haejangguk | 해장국 그릇 | 내용에 맞아 유지 |
| metal-chopsticks | 한국식 금속 수저 | 내용에 맞아 유지 |

동일한 핵심 주제를 가진 글은 같은 장면을 공유한다. 홈 캐러셀·목록·상세·추천도 하나의 article.image를 사용한다. 생성 사진은 특정 실제 식당이나 인증을 증명하는 사진이 아니다.

## 저장 위치와 제작 방식

내장 image_gen 도구의 기본 모드로 8장 각각 생성했다. CLI/API fallback은 사용하지 않았다. 최종 JPEG는 `public/images/curation/`에 저장하며 원본 생성 PNG는 별도로 보존했다. 1536×1024, JPEG 품질 82로 제공한다.

| 최종 파일 | 장면 |
| --- | --- |
| `public/images/curation/sauce-on-side.jpg` | 소스 별도 요청 |
| `public/images/curation/solo.jpg` | 식당에서의 혼밥 |
| `public/images/curation/banchan-table.jpg` | 한국 밥상·반찬 |
| `public/images/curation/diet-conversation.jpg` | 식단 의사소통 |
| `public/images/curation/meal-memory.jpg` | 식사 사진 기록 |
| `public/images/curation/fermentation.jpg` | 발효 식품 |
| `public/images/curation/chimaek.jpg` | 치킨과 맥주 |
| `public/images/curation/grill.jpg` | 고기 자르기 |

## 최종 프롬프트 세트 — 재사용용 정리

공통 의도: photorealistic-natural, Korean dining editorial photograph, landscape composition suitable for a mobile story thumbnail, natural food textures, warm light, clear central subject, no text/logo/watermark, no collage or UI mockup. 하단 텍스트 오버레이를 고려하며 음식·손·도구가 부자연스럽게 합쳐지지 않도록 검토한다.

- **sauce-on-side:** A hand setting a separate small ceramic bowl of red gochujang beside an unseasoned vegetable bibimbap in a Korean restaurant. The separate sauce bowl is prominent near the upper center; warm natural light, appetizing textures.
- **diet-conversation:** A diner showing a dietary card on a smartphone to a Korean restaurant server, comfortably discussing their meal across a table. Natural warm daylight, subtle green interior, genuine human interaction; not a religious building or sign.
- **meal-memory:** A diner photographing a Korean restaurant meal with a smartphone, with bibimbap and small banchan plates visible on the table and in the phone view. Candid over-the-shoulder composition, warm restaurant atmosphere; not a salad at home.
- **banchan-table:** Overhead editorial photograph of a Korean table with several small ceramic bowls of namul, kimchi and vegetables, rice and soup, metal spoon and chopsticks, and a separate gochujang bowl. Natural daylight and warm wood, distinct and readable side dishes.
- **solo:** A single-person Korean restaurant counter seat by a sunlit window, one beautifully arranged tray with a bowl of clear knife-cut noodle soup, a small dish of kimchi, rice, steel chopsticks and spoon; empty adjacent counter giving a peaceful solo-dining feeling. Only one meal setting. Gentle daylight, dark wood, sage green walls.
- **fermentation:** A Korean fermentation still life: an open brown onggi jar with fermented soybean paste, a small ceramic bowl of red gochujang, a white ceramic plate of folded napa cabbage kimchi, whole soybeans near a wooden spoon. Beautiful natural textures, dark warm tabletop, golden side light. No supermarket packaging or labels.
- **chimaek:** Fresh crispy golden Korean fried chicken on a ceramic platter with a small side of cubed pickled radish, and one tall cold golden beer with a clean white foamy head. Modern Korean chicken restaurant at night with soft amber bokeh. Chicken and beer both clearly visible within the central frame.
- **grill:** Close candid view of a Korean restaurant server's hands, one hand holding stainless tongs and the other safe kitchen scissors, cutting cooked golden pork belly above a tabletop Korean barbecue grill. Side dishes softly blurred, warm appetizing evening light. Show the cutting action clearly with anatomically natural hands and tools.

## 외부 이미지

유지한 Commons 사진의 정확한 파일명과 URL은 `constants/curation.ts`와 `constants/curationExtra.ts`에 있다. 제목·피사체 적합성 확인과 저작권 라이선스 준수는 별개다. 공개 운영 전 각 파일의 크레딧·라이선스 표시 의무를 최종 확인한다. 이미지 로딩 실패 시 무관한 대체 사진을 보여주지 않는다.
