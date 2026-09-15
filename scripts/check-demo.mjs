import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createServer } from 'vite';

// Exercise actual source modules with Vite's existing TS loader; no test dependencies needed.
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: 'custom',
});
try {
  const { restaurantReferencePhoto, restaurantRecommendationPhotos, RESTAURANT_PHOTOS } = await server.ssrLoadModule('/src/app/components/discovery/restaurantPhotos.ts');
  for (const categories of [Array(6).fill('한식'), Array(6).fill(null), ['한식', '초밥', '한식', null, '비빔밥', '한식']]) {
    const photos = restaurantRecommendationPhotos(categories);
    assert.equal(new Set(photos).size, 6, 'Recommendations must not repeat photos');
    assert.deepEqual(restaurantRecommendationPhotos(categories), photos, 'Photos remain stable for the same list');
  }
  assert.equal(restaurantReferencePhoto('한식 > 비빔밥'), RESTAURANT_PHOTOS.bibimbap);
  assert.equal(restaurantReferencePhoto('일식 > 초밥'), RESTAURANT_PHOTOS.sushi);
  assert.equal(restaurantReferencePhoto('한식'), RESTAURANT_PHOTOS.korean);
  for (const category of [null, undefined, '', '일식', '중식', '카페'])
    assert.equal(restaurantReferencePhoto(category), RESTAURANT_PHOTOS.dining);
  const { menuPrice, parseKrw, DEMO_CURRENCIES } = await server.ssrLoadModule(
    '/src/app/demo/currency.ts',
  );
  assert.equal(parseKrw('₩15,000'), 15000);
  assert.equal(parseKrw('9,000원'), 9000);
  assert.equal(parseKrw('KRW 12,000'), 12000);
  for (const value of ['10,000~15,000', '12000 / 2인', '-100', '', undefined])
    assert.equal(parseKrw(value), null);
  assert.equal(parseKrw('0'), 0);
  for (const language of Object.keys(DEMO_CURRENCIES)) {
    const price = menuPrice('15000', language);
    assert.equal(price.original, '₩15,000');
    assert.equal(price.converted === null, language === 'ko');
  }
  assert.equal(menuPrice('13800', 'en').converted, '$10.00');
  const { RESULT_PREVIEW_MENUS, RESULT_PREVIEW_PROFILE } =
    await server.ssrLoadModule('/src/app/results/resultFixtures.ts');
  const { getCautionProbabilities } = await server.ssrLoadModule(
    '/src/app/results/resultViewModel.ts',
  );
  const { FILMING_MENUS, FILMING_PROFILE } = await server.ssrLoadModule('/src/app/results/filmingFixtures.ts');
  assert.deepEqual(FILMING_PROFILE.allergies, ['shrimp']);
  assert.equal(FILMING_PROFILE.veganType, 'vegan');
  assert.equal(FILMING_PROFILE.hasReligion, false);
  assert.equal(FILMING_PROFILE.noSpicy, false);
  assert.deepEqual(FILMING_MENUS.map(m => [m.menuName, Number(m.price)]), [
    ['야채김밥',4000], ['참치김밥',5000], ['스팸김밥',5500], ['매운 떡볶이',5000],
    ['쫄면',7000], ['라면',4500], ['어묵탕',6000], ['순대',4000], ['새우튀김',5000],
    ['오징어튀김',5000], ['야채튀김',4000], ['식혜',2500], ['수정과',2500],
  ]);
  for (const m of FILMING_MENUS) {
    assert.equal(m.demoScenario, 'bunsik-vegan-shrimp');
    assert.ok(m.description && m.descriptionEn && m.imageCredit.author);
    assert.notEqual(m.description, m.explainability.decisionReason.ko);
    assert.equal(m.explainability.checks.length, 4);
    assert.ok(m.explainability.uncertainties.length >= 2);
    assert.equal(getCautionProbabilities(m, null).length, 0);
    assert.ok(m.explainability.ingredients.every(i => !i.staffEvidence));
    if (m.riskLevel === 'caution') assert.ok(getCautionProbabilities(m, FILMING_PROFILE).length > 0);
    else assert.equal(getCautionProbabilities(m, FILMING_PROFILE).length, 0);
  }
  assert.equal(FILMING_MENUS.filter(m => m.riskLevel === 'safe').length, 2);
  assert.equal(FILMING_MENUS.filter(m => m.riskLevel === 'caution').length, 5);
  assert.equal(FILMING_MENUS.filter(m => m.riskLevel === 'danger').length, 6);
  const { mapMenuResult } = await server.ssrLoadModule('/src/api/scan.ts');
  const live = mapMenuResult({menuNameKo:'서버 메뉴', riskLevel:'caution', message:{ko:'서버 판정 이유'}, hits:['has_unclear_milk']}, 0);
  assert.equal(live.description, '');
  assert.equal(live.explainability.decisionReason.ko, '서버 판정 이유');
  assert.equal(live.riskLevel, 'caution');
  assert.equal(live.demoScenario, undefined);
  const { getProfileSummary } = await server.ssrLoadModule('/src/app/results/resultViewModel.ts');
  assert.ok(getProfileSummary({...FILMING_PROFILE,noSpicy:true,noAlcohol:true},'ko').every(label=>!label.includes('제외')));
  const milkMenu = RESULT_PREVIEW_MENUS.find(
    (menu) => menu.id === 'fixture-cream',
  );
  assert.equal(
    getCautionProbabilities(milkMenu, RESULT_PREVIEW_PROFILE)[0]
      .inclusionProbability,
    82,
  );
  assert.equal(getCautionProbabilities(milkMenu, null).length, 0);
  assert.equal(
    getCautionProbabilities(milkMenu, {
      ...RESULT_PREVIEW_PROFILE,
      allergies: ['egg'],
    }).length,
    0,
  );
  for (const riskLevel of ['safe', 'danger'])
    assert.equal(
      getCautionProbabilities(
        { ...milkMenu, riskLevel },
        RESULT_PREVIEW_PROFILE,
      ).length,
      0,
    );
  for (const inclusionProbability of [-1, 101, NaN, Infinity, undefined]) {
    assert.equal(
      getCautionProbabilities(
        {
          ...milkMenu,
          explainability: {
            ingredients: [
              {
                ...milkMenu.explainability.ingredients[0],
                inclusionProbability,
              },
            ],
          },
        },
        RESULT_PREVIEW_PROFILE,
      ).length,
      0,
    );
  }
  for (const inclusionProbability of [0, 100])
    assert.equal(
      getCautionProbabilities(
        {
          ...milkMenu,
          explainability: {
            ingredients: [
              {
                ...milkMenu.explainability.ingredients[0],
                inclusionProbability,
              },
            ],
          },
        },
        RESULT_PREVIEW_PROFILE,
      ).length,
      1,
    );
  const { EXTRA_CURATION_ARTICLES } = await server.ssrLoadModule(
    '/src/app/constants/curationExtra.ts',
  );
  const { CURATION_ARTICLES } = await server.ssrLoadModule(
    '/src/app/constants/curation.ts',
  );
  assert.ok(EXTRA_CURATION_ARTICLES.length >= 10);
  assert.equal(
    new Set(CURATION_ARTICLES.map((article) => article.id)).size,
    CURATION_ARTICLES.length,
  );
  for (const article of EXTRA_CURATION_ARTICLES)
    for (const language of ['ko', 'en', 'ar'])
      assert.ok(article.body[language].split('\n\n').length >= 3);
  for (const article of CURATION_ARTICLES) {
    if (article.image.startsWith('/images/curation/')) assert.ok(existsSync(new URL('../public' + article.image, import.meta.url)), article.id + ' image must exist');
    else assert.ok(article.image.startsWith('https://commons.wikimedia.org/'), article.id + ' must have an editorial image');
  }
  const { AREAS, RESTAURANTS, restaurantsInArea, profileMatches } =
    await server.ssrLoadModule('/src/app/demo/restaurants.ts');
  for (const area of AREAS) assert.equal(restaurantsInArea(area.id).length, 3);
  assert.equal(AREAS.length, 19);
  for (const areaName of ['청담', '부산', '강남·역삼', '제주', '성수', '대구', '홍대·신촌'])
    assert.ok(AREAS.some(area => area.ko === areaName));
  assert.ok(RESTAURANTS.some(restaurant => restaurant.partnership === 'recipe-verified'));
  assert.ok(RESTAURANTS.some(restaurant => restaurant.partnership === 'standard'));
  const restaurant = restaurantsInArea('nearby')[0];
  const { buildPartnerMenus } = await server.ssrLoadModule('/src/app/demo/partnerMenus.ts');
  const unrestricted = { ...RESULT_PREVIEW_PROFILE, hasReligion: false, religionType: null, hasAllergies: false, allergies: [], noSpicy: false, noAlcohol: false };
  assert.ok(buildPartnerMenus(restaurant, unrestricted).every(menu => menu.riskLevel === 'safe'));
  assert.ok(buildPartnerMenus(restaurant, null).every(menu => menu.riskLevel === 'caution'));
  assert.equal(buildPartnerMenus(RESTAURANTS.find(r => r.partnership === 'standard'), unrestricted).length, 0);
  const milkProfile = { ...unrestricted, hasAllergies: true, allergies: ['milk'] };
  assert.equal(buildPartnerMenus(restaurant, milkProfile).find(menu => menu.id.endsWith('cream-rice')).riskLevel, 'danger');
  assert.equal(buildPartnerMenus(restaurant, { ...unrestricted, isVegan: true, veganType: 'vegan' }).find(menu => menu.id.endsWith('egg-bowl')).riskLevel, 'danger');
  assert.equal(buildPartnerMenus(restaurant, { ...unrestricted, isVegan: true, veganType: 'pesco' }).find(menu => menu.id.endsWith('-fish')).riskLevel, 'safe');
  const halal = { ...unrestricted, hasReligion: true, religionType: 'halal' };
  assert.equal(buildPartnerMenus(restaurant, halal).find(menu => menu.id.endsWith('pork-stew')).riskLevel, 'danger');
  assert.ok(buildPartnerMenus(restaurant, halal).every(menu => getCautionProbabilities(menu, halal).length === 0));
  assert.equal(buildPartnerMenus(restaurant, { ...unrestricted, hasAllergies: true, allergies: ['soybean'] }).find(menu => menu.id.endsWith('-tofu')).riskLevel, 'danger');
  assert.ok(RESTAURANTS.every(r => r.feedback.every(f => f.positive >= 0 && f.total > 0 && f.positive <= f.total)));
  assert.equal(profileMatches(restaurant, null).length, 0);
  assert.ok(
    profileMatches(restaurant, RESULT_PREVIEW_PROFILE).every((item) =>
      ['allergy:milk', 'preference:no-spicy'].includes(item.profileId),
    ),
  );
  const { readDemo, writeDemo } = await server.ssrLoadModule('/src/app/demo/storage.ts');
  const { saveVisit } = await server.ssrLoadModule('/src/app/demo/records.ts');
  const store = new Map();
  globalThis.window = new EventTarget();
  globalThis.localStorage = { getItem: key => store.get(key) ?? null, setItem: (key, value) => store.set(key, value) };
  saveVisit({ id: 'a', restaurantId: null, title: 'First scan', menus: [] });
  saveVisit({ id: 'a', restaurantId: 'place-1', title: 'Updated', menus: [] });
  assert.equal(readDemo('records', []).length, 1);
  assert.equal(readDemo('records', [])[0].restaurantId, 'place-1');
  saveVisit({ id: 'b', restaurantId: null, menus: [] });
  assert.equal(readDemo('records', []).length, 2);
  store.set('han-spoon-demo:invalid', '{');
  assert.deepEqual(readDemo('invalid', []), []);
  store.set('han-spoon-demo:invalid-array', '{}');
  assert.deepEqual(readDemo('invalid-array', []), []);
  globalThis.localStorage = { getItem() { throw new Error('Storage unavailable'); }, setItem() { throw new Error('Storage unavailable'); } };
  writeDemo('memory-only', ['kept']);
  assert.deepEqual(readDemo('memory-only', []), ['kept']);
  saveVisit({ id: 'offline-a', restaurantId: null, menus: [] });
  saveVisit({ id: 'offline-b', restaurantId: null, menus: [] });
  assert.equal(readDemo('records', []).length, 2);
  delete globalThis.window;
  delete globalThis.localStorage;
  console.log(
    `PASS: currency parsing / 7 currencies / caution-only profile matching / probability boundaries / ${EXTRA_CURATION_ARTICLES.length} original articles / region and feedback filtering / save upsert / unavailable storage fallback`,
  );
} finally {
  await server.close();
}
