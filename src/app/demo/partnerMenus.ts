import type { LocalizedMenuText, MenuAnalysis, UserProfile } from '../App';
import { getProfileCommunicationItems } from '../results/resultViewModel';
import type { Restaurant } from './restaurants';

// Complete fictional recipes, kept separate from the real scan/API output.
const recipes = [
  { id: 'vegetable-rice', ko: '버섯 채소 솥밥', en: 'Mushroom & vegetable rice', price: 13000, ingredients: ['rice', 'mushroom', 'vegetables'], spicy: false },
  { id: 'tofu', ko: '두부 간장구이', en: 'Soy-glazed tofu', price: 12000, ingredients: ['soybean', 'wheat', 'vegetables'], spicy: false },
  { id: 'egg-bowl', ko: '달걀 비빔밥', en: 'Egg bibimbap', price: 14000, ingredients: ['rice', 'egg', 'vegetables', 'soybean'], spicy: false },
  { id: 'cream-rice', ko: '버섯 크림밥', en: 'Creamy mushroom rice', price: 15000, ingredients: ['rice', 'mushroom', 'milk'], spicy: false },
  { id: 'pork-stew', ko: '돼지고기 김치찌개', en: 'Pork kimchi stew', price: 14000, ingredients: ['pork', 'shrimp', 'soybean', 'chili'], spicy: true },
  { id: 'fish', ko: '고등어 소금구이', en: 'Salt-grilled mackerel', price: 16000, ingredients: ['mackerel', 'rice'], spicy: false },
];
const ingredientLabels: Record<string, LocalizedMenuText> = {
  rice: { ko: '쌀', en: 'Rice' }, mushroom: { ko: '버섯', en: 'Mushroom' }, vegetables: { ko: '채소', en: 'Vegetables' },
  soybean: { ko: '대두', en: 'Soybean' }, wheat: { ko: '밀', en: 'Wheat' }, egg: { ko: '달걀', en: 'Egg' }, milk: { ko: '우유', en: 'Milk' },
  pork: { ko: '돼지고기', en: 'Pork' }, shrimp: { ko: '새우', en: 'Shrimp' }, chili: { ko: '고추', en: 'Chili' }, mackerel: { ko: '고등어', en: 'Mackerel' },
};
export function buildPartnerMenus(restaurant: Restaurant, profile: UserProfile | null): MenuAnalysis[] {
  if (restaurant.partnership !== 'recipe-verified') return [];
  return recipes.map(recipe => {
    const items = getProfileCommunicationItems(profile);
    const has = (values: string[]) => values.some(value => recipe.ingredients.includes(value));
    const conflicts = items.filter(item => {
      if (item.id.startsWith('allergy:')) return recipe.ingredients.includes(item.id.slice(8));
      if (item.id.startsWith('vegan:')) {
        const style = item.id.slice(6);
        const avoided = ['pork', ...(['vegan', 'lacto', 'ovo', 'lacto_ovo'].includes(style) ? ['mackerel', 'shrimp'] : []), ...(['vegan', 'lacto'].includes(style) ? ['egg'] : []), ...(['vegan', 'ovo'].includes(style) ? ['milk'] : [])];
        return has(avoided);
      }
      if (item.id === 'religion:halal') return has(['pork']);
      if (item.id === 'religion:kosher') return has(['pork', 'shrimp']);
      if (item.id === 'preference:no-spicy') return recipe.spicy;
      return false;
    });
    const religiousCheck = items.filter(item => item.id.startsWith('religion:'));
    const riskLevel = conflicts.length ? 'danger' : (!profile || religiousCheck.length ? 'caution' : 'safe');
    const reason: LocalizedMenuText = conflicts.length
      ? { ko: `등록 레시피에 ${conflicts.map(item => item.label.ko).join(' · ')} 조건과 맞지 않는 재료 또는 양념이 있어요.`, en: `The supplied recipe conflicts with: ${conflicts.map(item => item.label.en ?? item.label.ko).join(', ')}.` }
      : !profile ? { ko: '프로필을 설정하면 등록된 레시피와 내 기준을 비교할 수 있어요.', en: 'Set your profile to compare your needs with the supplied recipe.' }
      : religiousCheck.length ? { ko: '표시 재료 외에도 종교 기준에 따른 인증과 조리 과정을 확인해 주세요.', en: 'Confirm certification and preparation required by your religious needs, in addition to the listed ingredients.' }
      : { ko: '등록된 레시피에서 내 프로필과 충돌하는 재료를 찾지 못했어요. 공용 조리도구는 직원에게 확인해 주세요.', en: 'No conflicting ingredients found in the supplied recipe. Ask staff about shared utensils.' };
    return {
      id: `${restaurant.id}-${recipe.id}`, menuName: recipe.ko, menuNameEn: recipe.en,
      description: recipe.ingredients.map(id => ingredientLabels[id].ko).join(' · '),
      descriptionEn: recipe.ingredients.map(id => ingredientLabels[id].en).join(' · '),
      price: String(recipe.price), riskLevel, riskReasons: [], isSpicy: recipe.spicy,
      explainability: {
        decisionReason: reason,
        profileRelatedItems: (conflicts.length ? conflicts : religiousCheck).map(item => item.label),
        ingredients: recipe.ingredients.map(id => ({ name: ingredientLabels[id], confidence: 'high', sourceTypes: ['menu-description'] })),
        sources: [{ type: 'menu-description', title: { ko: '식당 등록 레시피', en: 'Restaurant-supplied recipe' }, confidence: 'high' }],
      },
    } satisfies MenuAnalysis;
  });
}
