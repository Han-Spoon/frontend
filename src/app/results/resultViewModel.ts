import type {
  EvidenceConfidence,
  EvidenceSourceType,
  Language,
  LocalizedMenuText,
  MenuAnalysis,
  MenuIngredientEvidence,
  UserProfile,
} from '../App';
import { getAllergyName, getHitTagLabel } from '../i18n';
import { getCurationIdForMenu } from '../constants/menuCuration';

export const CONFIDENCE_LABELS: Record<EvidenceConfidence, LocalizedMenuText> = {
  high: { ko: '높음', en: 'High', ar: 'مرتفع', 'zh-CN': '高', ja: '高い', 'zh-TW': '高', es: 'Alta' },
  medium: { ko: '보통', en: 'Moderate', ar: 'متوسط', 'zh-CN': '中等', ja: '標準', 'zh-TW': '中等', es: 'Media' },
  limited: { ko: '제한적', en: 'Limited', ar: 'محدود', 'zh-CN': '有限', ja: '限定的', 'zh-TW': '有限', es: 'Limitada' },
};

export const SOURCE_LABELS: Record<EvidenceSourceType, LocalizedMenuText> = {
  'menu-description': { ko: '메뉴판 설명', en: 'Menu description', ar: 'وصف القائمة', 'zh-CN': '菜单说明', ja: 'メニュー説明', 'zh-TW': '菜單說明', es: 'Descripción del menú' },
  'menu-context': { ko: '주변 메뉴 문맥', en: 'Nearby menu context', ar: 'سياق القائمة', 'zh-CN': '周边菜单语境', ja: '周辺メニューの文脈', 'zh-TW': '周邊菜單語境', es: 'Contexto del menú' },
  'trusted-cooking': { ko: '신뢰할 수 있는 조리 정보', en: 'Trusted cooking reference', ar: 'مرجع طهي موثوق', 'zh-CN': '可信烹饪资料', ja: '信頼できる調理情報', 'zh-TW': '可信烹飪資料', es: 'Referencia culinaria fiable' },
  web: { ko: '웹 정보', en: 'Web information', ar: 'معلومات الويب', 'zh-CN': '网络信息', ja: 'ウェブ情報', 'zh-TW': '網路資訊', es: 'Información web' },
  staff: { ko: '직원 확인 기록', en: 'Staff confirmations', ar: 'تأكيدات الموظفين', 'zh-CN': '员工确认记录', ja: 'スタッフ確認記録', 'zh-TW': '員工確認記錄', es: 'Confirmaciones del personal' },
};

export const LIKELIHOOD_LABELS: Record<'high' | 'medium' | 'low', LocalizedMenuText> = {
  high: { ko: '높음', en: 'High', ar: 'مرتفع', 'zh-CN': '高', ja: '高い', 'zh-TW': '高', es: 'Alta' },
  medium: { ko: '보통', en: 'Moderate', ar: 'متوسط', 'zh-CN': '中等', ja: '中程度', 'zh-TW': '中等', es: 'Media' },
  low: { ko: '낮음', en: 'Low', ar: 'منخفض', 'zh-CN': '低', ja: '低い', 'zh-TW': '低', es: 'Baja' },
};

export interface IngredientViewModel extends MenuIngredientEvidence {
  localizedName: string;
}

export interface MenuResultViewModel {
  primaryReason: string;
  profileRelatedItems: string[];
  ingredients: IngredientViewModel[];
  hiddenIngredientPaths: string[][];
  sources: Array<{ type: EvidenceSourceType; label: string; confidence?: EvidenceConfidence }>;
  uncertainties: string[];
  curationId?: string;
}

export function localizeMenuText(text: LocalizedMenuText, language: Language): string {
  return text[language] ?? text.en ?? text.ko;
}

const hiddenTags = new Set(['unknown menu', 'unknown remain', 'hidden animal']);

export function buildMenuResultViewModel(menu: MenuAnalysis, language: Language): MenuResultViewModel {
  const explainability = menu.explainability;
  const fallbackIngredients = Array.from(new Set(menu.riskReasons ?? []))
    .map((code) => getHitTagLabel(code, language))
    .filter((label): label is string => Boolean(label))
    .filter((label) => !hiddenTags.has(label.trim().toLowerCase()))
    .map((label) => ({ name: { ko: label, en: label } }));
  const ingredients = explainability?.ingredients ?? fallbackIngredients;

  const localizedIngredients = ingredients.map((ingredient) => ({
    ...ingredient,
    localizedName: localizeMenuText(ingredient.name, language),
  }));

  const localizedReasons = language === 'ko'
    ? menu.riskReasons
    : language === 'ar'
      ? menu.riskReasonsAr ?? menu.riskReasonsEn ?? menu.riskReasons
      : menu.riskReasonsEn ?? menu.riskReasons;
  const firstReason = (localizedReasons ?? [])
    .map((reason) => getHitTagLabel(reason, language) ?? reason)
    .find((reason) => !hiddenTags.has(reason.trim().toLowerCase()));
  const description = language === 'ko'
    ? menu.description
    : language === 'ar'
      ? menu.descriptionAr ?? menu.descriptionEn ?? menu.description
      : menu.descriptionEn ?? menu.description;

  return {
    primaryReason: explainability?.decisionReason
      ? localizeMenuText(explainability.decisionReason, language)
      : firstReason ?? description,
    profileRelatedItems: (explainability?.profileRelatedItems ?? []).map((item) => localizeMenuText(item, language)),
    ingredients: localizedIngredients,
    hiddenIngredientPaths: (explainability?.hiddenIngredientPaths ?? []).map((path) =>
      path.map((item) => localizeMenuText(item, language)),
    ),
    sources: (explainability?.sources ?? []).map((source) => ({
      type: source.type,
      label: source.title
        ? localizeMenuText(source.title, language)
        : localizeMenuText(SOURCE_LABELS[source.type], language),
      confidence: source.confidence,
    })),
    uncertainties: (explainability?.uncertainties ?? []).map((item) => localizeMenuText(item, language)),
    curationId: explainability?.curationId ?? getCurationIdForMenu(menu.menuName),
  };
}

const veganLabels: Record<string, LocalizedMenuText> = {
  vegan: { ko: '비건', en: 'Vegan', ar: 'نباتي صرف' },
  lacto: { ko: '락토 채식', en: 'Lacto vegetarian', ar: 'نباتي مع الألبان' },
  ovo: { ko: '오보 채식', en: 'Ovo vegetarian', ar: 'نباتي مع البيض' },
  lacto_ovo: { ko: '락토 오보 채식', en: 'Lacto-ovo vegetarian', ar: 'نباتي مع الألبان والبيض' },
  pesco: { ko: '페스코 채식', en: 'Pescatarian', ar: 'نباتي مع الأسماك' },
};

const religionLabels: Record<string, LocalizedMenuText> = {
  halal: { ko: '할랄', en: 'Halal', ar: 'حلال' },
  kosher: { ko: '코셔', en: 'Kosher', ar: 'كوشير' },
  hindu: { ko: '힌두 식단', en: 'Hindu diet', ar: 'نظام غذائي هندوسي' },
};

const noSpicyLabel: LocalizedMenuText = {
  ko: '매운 음식 제외', en: 'No spicy food', ar: 'بدون طعام حار',
  'zh-CN': '不吃辣', ja: '辛い料理を除外', 'zh-TW': '不吃辣', es: 'Sin comida picante',
};

const noAlcoholLabel: LocalizedMenuText = {
  ko: '알코올 제외', en: 'No alcohol', ar: 'بدون كحول',
  'zh-CN': '不含酒精', ja: 'アルコールを除外', 'zh-TW': '不含酒精', es: 'Sin alcohol',
};

export function getProfileSummary(profile: UserProfile | null, language: Language): string[] {
  if (!profile) return [];
  const items: string[] = [];
  if (profile.isVegan && profile.veganType) {
    const key = profile.veganType.toLowerCase().replace(/-/g, '_');
    items.push(localizeMenuText(veganLabels[key] ?? { ko: profile.veganType, en: profile.veganType }, language));
  }
  if (profile.hasReligion && profile.religionType) {
    const key = profile.religionType.toLowerCase();
    items.push(localizeMenuText(religionLabels[key] ?? { ko: profile.religionType, en: profile.religionType }, language));
  }
  if (profile.hasAllergies) {
    items.push(...profile.allergies.map((code) => getAllergyName(code, language)).filter(Boolean));
  }
  if (profile.noSpicy) {
    items.push(localizeMenuText(noSpicyLabel, language));
  }
  if (profile.noAlcohol) {
    items.push(localizeMenuText(noAlcoholLabel, language));
  }
  return Array.from(new Set(items));
}
