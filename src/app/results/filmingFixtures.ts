import type { LocalizedMenuText, MenuAnalysis, MenuIngredientEvidence, UserProfile } from '../App';

/** Fixed filming scenario only. No OCR, model inference, recipe verification or staff records. */
// Current presentation release: every new scan uses the fixed scenario.
export const FIXED_SCAN_RESULTS_ENABLED = true;

export const FILMING_PROFILE: UserProfile = {
  nationality: 'ES', languageCode: 'ko', isFirstTime: false,
  isVegan: true, veganType: 'vegan', hasReligion: false, religionType: null,
  hasAllergies: true, allergies: ['shrimp'], noSpicy: false, noAlcohol: false,
};
const L = (ko: string, en: string): LocalizedMenuText => ({ ko, en });
const V = ['vegan:vegan'];
const S = ['vegan:vegan', 'allergy:shrimp'];
const ingredient = (ko: string, en: string, profileIds: string[], probability?: number): MenuIngredientEvidence => ({
  name: L(ko, en), profileIds, inclusionProbability: probability,
  confidence: probability === undefined ? 'high' : 'limited',
  sourceTypes: [probability === undefined ? 'menu-description' : 'demo-recipe'],
});
const photo = (file: string, author: string, license: string, imageScale = 1.15, imagePosition = '50% 50%') => ({
  image: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=960`,
  imageScale,
  imagePosition,
  imageCredit: { author, license, url: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}` },
});
interface Dish {
  id: string; ko: string; en: string; price: number; level: MenuAnalysis['riskLevel']; spicy?: boolean;
  description: [string, string]; reason: [string, string]; recipe: [string, string];
  question: [string, string]; kitchen: [string, string]; ingredients: MenuIngredientEvidence[];
  path?: [string, string][]; picture: ReturnType<typeof photo>;
}

const dishes: Dish[] = [
  {
    id: 'vegetable-gimbap', ko: '야채김밥', en: 'Vegetable gimbap', price: 4000, level: 'caution',
    description: ['밥과 아삭한 채소를 김으로 말아 한입 크기로 썬 김밥이에요.', 'Seaweed rice rolls with crunchy vegetables, sliced into bite-sized pieces.'],
    reason: ['이름은 야채김밥이지만 달걀 지단이나 어묵이 함께 들어갈 수 있어요. 비건 김밥인지 확인해 주세요.', 'Vegetable gimbap can still include egg or fish cake. Ask whether this version is vegan.'],
    recipe: ['기본 김밥의 지단·어묵은 매장마다 달라요.', 'Egg and fish-cake fillings vary by shop.'],
    question: ['달걀·어묵·햄 없이, 채소만 넣어 새로 말아주실 수 있나요?', 'Can you make a fresh roll with vegetables only, without egg, fish cake or ham?'],
    kitchen: ['새우를 다룬 칼·도마·김밥 발을 함께 쓰는지 확인해요.', 'Check whether knives, boards or rolling mats also touch shrimp.'],
    ingredients: [ingredient('달걀 지단', 'Egg strips', V, 78), ingredient('어묵', 'Fish cake', V, 46)],
    path: [['김밥 속재료', 'Roll fillings'], ['달걀 지단·어묵 가능', 'Possible egg / fish cake'], ['비건 기준 확인', 'Check vegan suitability']],
    picture: photo('Vegetable gimbap.jpg', 'cutekirin', 'CC0'),
  },
  {
    id: 'tuna-gimbap', ko: '참치김밥', en: 'Tuna gimbap', price: 5000, level: 'danger',
    description: ['참치를 중심으로 밥과 채소를 김에 말아낸 고소한 김밥이에요.', 'Savory seaweed rice rolls filled with tuna and vegetables.'],
    reason: ['주재료가 생선인 참치여서 비건 기준에 맞지 않아요. 마요네즈에도 달걀이 들어갈 수 있어요.', 'Tuna is fish, so this dish is not vegan. Mayonnaise may also contain egg.'],
    recipe: ['참치 속에 마요네즈를 섞는 조리법이 흔해요.', 'Tuna filling is often mixed with mayonnaise.'],
    question: ['참치가 들어간 김밥 대신 동물성 재료 없는 야채김밥을 새로 만들 수 있나요?', 'Could you make a fresh vegetable-only roll instead of removing tuna from this one?'],
    kitchen: ['참치는 새우와 다른 재료예요. 새우 교차접촉 여부는 별도로 확인해요.', 'Tuna is not shrimp; shrimp cross-contact must be checked separately.'],
    ingredients: [ingredient('참치', 'Tuna', V)],
    picture: photo('Chamchigimbap at Hana Restaurant, Milan, 2023.jpg', 'Chiyako92', 'CC BY-SA 4.0', 1.75),
  },
  {
    id: 'spam-gimbap', ko: '스팸김밥', en: 'Spam gimbap', price: 5500, level: 'danger',
    description: ['구운 스팸의 짭조름한 맛에 밥과 채소가 어우러진 김밥이에요.', 'Seaweed rice rolls with salty grilled Spam, rice and vegetables.'],
    reason: ['스팸은 육류 가공품이므로 비건 기준에 맞지 않아요. 스팸을 뺀 새 김밥을 주문해야 해요.', 'Spam is a meat product and is not vegan. A fresh meat-free roll would be needed.'],
    recipe: ['스팸을 구워 김밥 속에 넣어요.', 'Grilled Spam is used as a filling.'],
    question: ['스팸·달걀·어묵 없이 채소만 넣은 김밥으로 바꿀 수 있나요?', 'Can I order a vegetable-only roll without Spam, egg or fish cake?'],
    kitchen: ['고기를 굽는 팬과 새우 조리도구의 공유 여부를 확인해요.', 'Ask about shared meat pans and shrimp utensils.'],
    ingredients: [ingredient('스팸(육류)', 'Spam (meat)', V)],
    picture: photo('Kimbap by strikeael.jpg', 'strikeael', 'CC BY 2.0', 1.25),
  },
  {
    id: 'tteokbokki', ko: '매운 떡볶이', en: 'Spicy tteokbokki', price: 5000, level: 'caution', spicy: true,
    description: ['쫄깃한 떡을 매콤달콤한 고추장 양념에 졸인 분식이에요.', 'Chewy rice cakes simmered in a sweet, spicy gochujang sauce.'],
    reason: ['떡 자체보다 어묵과 멸치 육수가 비건 기준에 걸릴 수 있어요. 새우 분말이 든 복합 양념도 확인해 주세요.', 'Fish cake or anchovy stock may make the dish non-vegan. Check seasoning blends for shrimp powder too.'],
    recipe: ['어묵과 멸치 육수를 함께 넣는 조리법이 있어요.', 'Some recipes add fish cake and anchovy stock.'],
    question: ['채소 육수를 쓰나요? 어묵과 새우 분말 없이 따로 조리할 수 있나요?', 'Is the stock vegetable-based? Can it be prepared separately without fish cake or shrimp powder?'],
    kitchen: ['새우튀김을 떡볶이 소스에 담그거나 집게를 공유하는지 확인해요.', 'Check whether shrimp fritters are dipped in the sauce or share tongs.'],
    ingredients: [ingredient('어묵', 'Fish cake', V, 76), ingredient('멸치 육수', 'Anchovy stock', V, 64), ingredient('새우 분말', 'Shrimp powder', S, 24)],
    path: [['떡볶이 양념·육수', 'Sauce / stock'], ['어묵·멸치·새우 분말 가능', 'Possible fish cake / anchovy / shrimp'], ['비건·새우 기준 확인', 'Check vegan / shrimp needs']],
    picture: photo('Korean.snacks-Tteokbokki-08.jpg', 'jetalone', 'CC BY 2.0', 1.2),
  },
  {
    id: 'jjolmyeon', ko: '쫄면', en: 'Jjolmyeon', price: 7000, level: 'caution', spicy: true,
    description: ['탄력 있는 면과 채소를 새콤매콤한 양념에 비벼 먹는 음식이에요.', 'Springy cold noodles and vegetables tossed in a tangy, spicy sauce.'],
    reason: ['삶은 달걀 고명이 올라갈 수 있고 양념에 액젓이 쓰일 수 있어요. 둘 다 비건 기준 확인이 필요해요.', 'A boiled egg garnish or fish sauce in the dressing would not suit a vegan diet.'],
    recipe: ['면·채소 외에 달걀 고명과 양념 배합이 달라져요.', 'Egg garnish and dressing recipes vary.'],
    question: ['달걀 고명 없이 가능할까요? 양념에 액젓이나 새우 성분이 들어가나요?', 'Can you omit the egg? Does the dressing contain fish sauce or shrimp ingredients?'],
    kitchen: ['양념 용기와 집게가 해산물 메뉴와 공유되는지 확인해요.', 'Ask whether sauce containers and tongs are shared with seafood.'],
    ingredients: [ingredient('달걀 고명', 'Egg garnish', V, 72), ingredient('액젓', 'Fish sauce', V, 28)],
    path: [['쫄면 고명·양념', 'Garnish / dressing'], ['달걀·액젓 가능', 'Possible egg / fish sauce'], ['비건 기준 확인', 'Check vegan suitability']],
    picture: photo('Jjolmyeon.jpg', '국립국어원', 'CC BY-SA 2.0 KR', 1.2),
  },
  {
    id: 'ramyeon', ko: '라면', en: 'Ramyeon', price: 4500, level: 'caution', spicy: true,
    description: ['꼬불꼬불한 면을 얼큰한 국물에 끓여낸 따뜻한 면 요리예요.', 'Curly noodles served hot in a spicy, savory broth.'],
    reason: ['사용하는 라면 제품을 알 수 없어요. 스프의 육류 추출물과 새우 성분을 성분표로 확인해야 해요.', 'The noodle brand is unknown. Check the soup-powder label for meat extracts and shrimp.'],
    recipe: ['면보다 스프 제품과 추가 달걀이 핵심 확인 대상이에요.', 'Soup-powder ingredients and added egg need checking.'],
    question: ['라면 포장지의 성분표를 볼 수 있나요? 육류·새우·달걀 없이 가능한가요?', 'May I see the package ingredients? Is a version without meat, shrimp and egg available?'],
    kitchen: ['냄비·국자를 해물라면과 같이 쓰는지 확인해요.', 'Ask whether pots and ladles are shared with seafood ramyeon.'],
    ingredients: [ingredient('육류 추출물', 'Meat extract', V, 70), ingredient('새우 성분', 'Shrimp ingredients', S, 35)],
    path: [['라면 스프', 'Soup powder'], ['육류 추출물·새우 성분 가능', 'Possible meat extract / shrimp'], ['제품 성분표 확인', 'Check the product label']],
    picture: photo('Ramyeon 2.jpg', '대경라이프', 'CC BY-SA 4.0', 1.4),
  },
  {
    id: 'eomuk', ko: '어묵탕', en: 'Fish cake soup', price: 6000, level: 'danger',
    description: ['생선살로 만든 어묵을 따뜻한 국물에 끓여낸 탕이에요.', 'Fish cakes simmered in a warming savory broth.'],
    reason: ['어묵은 생선살로 만드는 음식이라 비건 기준에 맞지 않아요. 어묵 제품의 새우 성분은 별도 확인이 필요해요.', 'Fish cake contains fish and is not vegan. Shrimp in the specific fish-cake product requires a separate check.'],
    recipe: ['어묵을 빼도 생선 성분이 국물에 남을 수 있어요.', 'Removing fish cakes does not remove fish ingredients already in the broth.'],
    question: ['생선·새우 성분이 없는 별도의 채소 국물이 있나요?', 'Do you have a separately prepared vegetable broth without fish or shrimp?'],
    kitchen: ['어묵 제품의 성분표와 공용 국자를 확인해요.', 'Check the fish-cake label and shared ladles.'],
    ingredients: [ingredient('생선살(어묵)', 'Fish (fish cake)', V)],
    picture: photo('Eomuk-tang 2.jpg', 'bigtorica', 'CC0', 1.15),
  },
  {
    id: 'sundae', ko: '순대', en: 'Sundae (blood sausage)', price: 4000, level: 'danger',
    description: ['당면 등을 속에 채워 쪄낸 한국식 순대를 먹기 좋게 썬 메뉴예요.', 'Sliced Korean blood sausage, steamed with a glass-noodle filling.'],
    reason: ['일반적인 순대는 돼지 창자와 선지를 사용해 비건 기준에 맞지 않아요. 새우젓 곁들임도 피해야 해요.', 'Traditional sundae uses pork casing and blood, so it is not vegan. Salted shrimp dip would also conflict with your shrimp allergy.'],
    recipe: ['속의 당면만 보고 식물성 음식으로 판단할 수 없어요.', 'Glass noodles inside do not make the sausage plant-based.'],
    question: ['순대 대신 동물성 재료 없는 메뉴가 있나요? 새우젓은 함께 내지 말아주세요.', 'Is there a plant-based alternative? Please do not serve salted shrimp alongside it.'],
    kitchen: ['새우젓을 담는 종지·집게의 공유 여부를 확인해요.', 'Check bowls and tongs used for salted shrimp.'],
    ingredients: [ingredient('돼지 창자·선지', 'Pork casing / blood', V)],
    picture: photo('Korean food-Sundae-01.jpg', 's nak', 'CC BY 2.0', 1.15),
  },
  {
    id: 'shrimp-fry', ko: '새우튀김', en: 'Fried shrimp', price: 5000, level: 'danger',
    description: ['새우에 튀김옷을 입혀 바삭하게 튀긴 메뉴예요.', 'Shrimp coated in batter and fried until crisp.'],
    reason: ['새우가 주재료여서 새우 알레르기와 직접 충돌하고 비건 기준에도 맞지 않아요.', 'Shrimp is the main ingredient: a direct conflict with your shrimp allergy and vegan diet.'],
    recipe: ['튀김옷을 벗겨도 새우 알레르기 위험이 사라지지 않아요.', 'Removing the batter does not remove the shrimp allergen.'],
    question: ['새우 알레르기가 있어요. 새우와 접촉하지 않게 따로 조리한 다른 메뉴가 있나요?', 'I have a shrimp allergy. Is there another dish prepared separately without shrimp contact?'],
    kitchen: ['다른 튀김도 새우와 같은 기름·튀김망을 쓸 수 있어요.', 'Other fritters may share oil and baskets with shrimp.'],
    ingredients: [ingredient('새우', 'Shrimp', S)],
    picture: photo('Saeu-twigim.jpg', 'doomoak', 'CC0', 1.15),
  },
  {
    id: 'squid-fry', ko: '오징어튀김', en: 'Fried squid', price: 5000, level: 'danger',
    description: ['오징어에 튀김옷을 입혀 겉은 바삭하고 속은 쫄깃하게 튀겼어요.', 'Battered squid fried crisp outside with a chewy center.'],
    reason: ['오징어는 동물성 재료여서 비건 기준에 맞지 않아요. 새우와는 다른 재료지만 조리 기름 공유는 확인해야 해요.', 'Squid is not vegan. It is not shrimp, but shared frying oil still needs checking.'],
    recipe: ['오징어를 길게 썰어 반죽을 입혀 튀겨요.', 'Squid strips are coated in batter and deep-fried.'],
    question: ['새우튀김과 같은 기름·튀김망을 쓰나요? 별도 조리한 식물성 메뉴가 있나요?', 'Is the fryer shared with shrimp? Is a separately prepared plant-based option available?'],
    kitchen: ['메뉴판에 새우튀김도 있어 기름 공유 여부는 미확인이에요.', 'Shrimp fritters are also listed; whether the fryer is shared is unknown.'],
    ingredients: [ingredient('오징어', 'Squid', V)],
    picture: photo('Ojingeo-twigim.jpg', 'stu_spivack', 'CC BY-SA 2.0', 1.25),
  },
  {
    id: 'vegetable-fry', ko: '야채튀김', en: 'Vegetable fritters', price: 4000, level: 'caution',
    description: ['여러 채소에 가벼운 튀김옷을 입혀 바삭하게 튀겨낸 메뉴예요.', 'A selection of vegetables in a light, crisp fried batter.'],
    reason: ['채소 튀김이라도 반죽에 달걀이 들어갈 수 있어요. 새우튀김과 같은 기름을 쓰는지도 꼭 확인해 주세요.', 'The batter may contain egg. Also check whether the fryer is shared with shrimp.'],
    recipe: ['채소는 식물성이지만 반죽의 배합은 알 수 없어요.', 'Vegetables are plant-based, but the batter recipe is unknown.'],
    question: ['반죽에 달걀·우유가 있나요? 새우와 다른 기름과 도구로 튀길 수 있나요?', 'Does the batter contain egg or milk? Can you use separate oil and utensils from shrimp?'],
    kitchen: ['공용 튀김기 여부는 미확인 · 교차접촉 확률은 계산하지 않아요.', 'Shared fryer: unverified. No numeric cross-contact estimate is made.'],
    ingredients: [ingredient('달걀(튀김 반죽)', 'Egg in batter', V, 42)],
    path: [['튀김 반죽', 'Fritter batter'], ['달걀 사용 가능', 'Possible egg'], ['비건 기준 확인', 'Check vegan suitability']],
    picture: photo('Vegetable tempura .jpg', 'RightCowLeftCoast', 'CC BY-SA 4.0', 1.5),
  },
  {
    id: 'sikhye', ko: '식혜', en: 'Sikhye (sweet rice drink)', price: 2500, level: 'safe',
    description: ['엿기름으로 밥을 삭혀 은은하게 단맛을 낸 전통 쌀 음료예요.', 'A traditional sweet rice drink made by steeping cooked rice with malt.'],
    reason: ['쌀·엿기름·설탕으로 만드는 식혜는 비건 기준에 맞는 음료예요. 실제 제품의 성분표는 확인해 주세요.', 'Sikhye made with rice, malt and sugar suits a vegan diet. Check the actual product label.'],
    recipe: ['일반적인 재료: 쌀, 엿기름, 설탕, 물.', 'Typical ingredients: rice, malt, sugar and water.'],
    question: ['실제 식혜의 성분표를 볼 수 있나요? 꿀 등 다른 첨가 재료가 있나요?', 'May I check the actual ingredients? Is honey or any other ingredient added?'],
    kitchen: ['제조·소분 과정의 새우 교차접촉 정보는 확인되지 않았어요.', 'Shrimp cross-contact during production or serving is not verified.'],
    ingredients: [], picture: photo('Sikhye.jpg', '뚱표아빠의 세상사는 이야기', 'CC BY 4.0', 1.6, '100% 85%'),
  },
  {
    id: 'sujeonggwa', ko: '수정과', en: 'Sujeonggwa (cinnamon punch)', price: 2500, level: 'safe',
    description: ['계피와 생강을 달여 달콤하게 식힌 향긋한 전통 음료예요.', 'A fragrant, sweet traditional punch brewed with cinnamon and ginger.'],
    reason: ['계피·생강·곶감·설탕으로 만드는 수정과는 비건 기준에 맞아요. 꿀을 사용하는지는 확인해 주세요.', 'Sujeonggwa made with cinnamon, ginger, dried persimmon and sugar suits a vegan diet. Ask whether honey is used.'],
    recipe: ['설탕 또는 꿀로 단맛을 내므로 감미료 확인이 필요해요.', 'Sweetened with sugar or honey; check the sweetener.'],
    question: ['설탕 대신 꿀을 사용하나요? 실제 원재료를 확인할 수 있나요?', 'Is honey used instead of sugar? May I check the actual ingredients?'],
    kitchen: ['곁들이는 고명과 제조·보관 환경은 별도 확인이 필요해요.', 'Garnishes and production or storage conditions need a separate check.'],
    ingredients: [], picture: photo('Sujeonggwa.jpg', 'lazy fri13th', 'CC BY 2.0', 1.15),
  },
];

export const FILMING_MENUS: MenuAnalysis[] = dishes.map(d => ({
  id: `filming-${d.id}`, demoScenario: 'bunsik-vegan-shrimp',
  menuName: d.ko, menuNameEn: d.en, price: String(d.price),
  description: d.description[0], descriptionEn: d.description[1],
  riskLevel: d.level, riskReasons: [], isSpicy: !!d.spicy, ...d.picture,
  explainability: {
    decisionReason: L(...d.reason),
    profileRelatedItems: [L('비건', 'Vegan'), L('새우 알레르기', 'Shrimp allergy')],
    ingredients: d.ingredients,
    hiddenIngredientPaths: d.path ? [d.path.map(pair => L(...pair))] : [],
    uncertainties: [L(...d.question), L(...d.kitchen)],
    checks: [
      { kind: 'menu', status: 'observed', finding: L(`메뉴판: ${d.ko} · ${d.price.toLocaleString('ko-KR')}원`, `Menu: ${d.en} · KRW ${d.price}`) },
      { kind: 'recipe', status: 'inferred', finding: L(...d.recipe) },
      { kind: 'profile', status: 'inferred', finding: L(...d.reason) },
      { kind: 'cross-contact', status: 'unverified', finding: L(...d.kitchen) },
    ],
  },
}));
