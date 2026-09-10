import assert from 'node:assert/strict';
import { createServer } from 'vite';

// Exercise actual source modules with Vite's existing TS loader; no test dependencies needed.
const server = await createServer({
  server: { middlewareMode: true, hmr: false, ws: false, watch: null },
  appType: 'custom',
});
try {
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
  const { AREAS, restaurantsInArea, profileMatches } =
    await server.ssrLoadModule('/src/app/demo/restaurants.ts');
  for (const area of AREAS) assert.equal(restaurantsInArea(area.id).length, 3);
  const restaurant = restaurantsInArea('nearby')[0];
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
