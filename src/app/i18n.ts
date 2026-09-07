import type { Language, UserAllergy } from './App';
import { ALLERGY_OPTIONS } from './constants/onboarding';
import { translateText, type LocalizedText } from './locales';

export type { LocalizedText } from './locales';
export type OwnerCommunicationContentType =
  | 'order'
  | 'ingredient'
  | 'request'
  | 'spicy'
  | 'lessSpicy'
  | 'moreSpicy';

export interface OwnerContent {
  korean: string;
  english: string;
  arabic: string;
  localized: LocalizedText;
}

interface OwnerContentParams {
  menuName: LocalizedText;
  ingredient: LocalizedText;
  allergen: LocalizedText;
}

export const translate = (language: Language, text: LocalizedText) => translateText(language, text);

const ownerContent = (localized: LocalizedText): OwnerContent => ({
  korean: localized.ko,
  english: localized.en,
  arabic: localized.ar,
  localized,
});

export const allergyI18n = {
  fallback: {
    ko: '특정 재료',
    en: 'specific ingredient',
    ar: 'مكون معين',
  },
  // 백엔드 AllergyCode 코드값(egg, milk, ...)을 키로 하는 다국어 라벨 맵.
  // 식약처 19종 정의는 constants/onboarding.ts(ALLERGY_OPTIONS)를 단일 출처로 사용한다.
  names: Object.fromEntries(
    ALLERGY_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<string, LocalizedText>,
};

// 알레르기 19종 외에 hit_tags에 나오는 추가 라벨(알코올, 애매함 플래그).
export const HIT_TAG_LABELS: Record<string, LocalizedText> = {
  alcohol: { ko: '알코올', en: 'Alcohol', ar: 'كحول' },
  unclear_broth: { ko: '육수', en: 'Broth', ar: 'مرق' },
  unclear_jeotgal: { ko: '젓갈', en: 'Salted seafood', ar: 'مأكولات بحرية مملحة' },
  unclear: { ko: '확인 필요 재료', en: 'Ingredient to confirm', ar: 'مكوّن للتأكد' },
};

const prettifyTag = (raw: string) => raw.replace(/^(is_|has_)/, '').replace(/_/g, ' ').trim();

/**
 * 백엔드 hit_tags(is_egg, has_unclear_jeotgal 등)를 사용자 언어 라벨로 변환.
 * 알레르기 19종은 allergyI18n(=ALLERGY_OPTIONS) 단일 출처를 재사용한다.
 */
export const getHitTagLabel = (tag: string, language: Language): string => {
  if (!tag) return '';
  const lower = tag.toLowerCase();

  if (lower.startsWith('is_')) {
    const code = lower.slice(3);
    const label = allergyI18n.names[code] ?? HIT_TAG_LABELS[code];
    return label ? translate(language, label) : prettifyTag(tag);
  }

  if (lower.startsWith('has_')) {
    const code = lower.slice(4); // 예: unclear_broth
    return (
      (HIT_TAG_LABELS[code] ? translate(language, HIT_TAG_LABELS[code]) : undefined) ??
      (code.startsWith('unclear') ? translate(language, HIT_TAG_LABELS.unclear) : undefined) ??
      prettifyTag(tag)
    );
  }

  const label = allergyI18n.names[lower] ?? HIT_TAG_LABELS[lower];
  return label ? translate(language, label) : prettifyTag(tag);
};

export const ownerCommunicationI18n = {
  labels: {
    selectedMenu: {
      ko: '선택된 메뉴',
      en: 'Selected menu',
      ar: 'الطبق المحدد',
    },
    ownerResponse: {
      ko: '직원 응답',
      en: 'Owner response',
      ar: 'رد العاملين',
    },
    saved: {
      ko: '저장되었습니다',
      en: 'Saved',
      ar: 'تم الحفظ',
    },
    saveFavorite: {
      ko: '자주 쓰는 카드로 저장',
      en: 'Save as favorite card',
      ar: 'حفظ كبطاقة مفضلة',
    },
  },
  responseOptions: {
    order: [
      {
        id: 'ok',
        label: {
          ko: '네, 주문 받았습니다',
          en: 'Yes, your order is placed',
          ar: 'نعم، تم استلام طلبك',
        },
        tone: 'success',
      },
    ],
    ingredient: [
      {
        id: 'yes',
        label: {
          ko: '네, 들어 있어요',
          en: 'Yes, it contains that',
          ar: 'نعم، يحتوي على ذلك',
        },
        tone: 'caution',
      },
      {
        id: 'no',
        label: {
          ko: '아니요, 안 들어 있어요',
          en: 'No, it does not contain that',
          ar: 'لا، لا يحتوي على ذلك',
        },
        tone: 'success',
      },
      {
        id: 'unknown',
        label: {
          ko: '잘 모르겠어요',
          en: "I'm not sure",
          ar: 'لست متأكدًا',
        },
        tone: 'caution',
      },
    ],
    request: [
      {
        id: 'possible',
        label: {
          ko: '네, 가능해요',
          en: 'Yes, that is possible',
          ar: 'نعم، هذا ممكن',
        },
        tone: 'success',
      },
      {
        id: 'difficult',
        label: {
          ko: '죄송해요, 어려워요',
          en: 'Sorry, that is difficult',
          ar: 'آسف، هذا صعب',
        },
        tone: 'danger',
      },
    ],
    spicy: [
      {
        id: 'possible',
        label: {
          ko: '네, 가능해요',
          en: 'Yes, that is possible',
          ar: 'نعم، هذا ممكن',
        },
        tone: 'success',
      },
      {
        id: 'difficult',
        label: {
          ko: '죄송해요, 어려워요',
          en: 'Sorry, that is difficult',
          ar: 'آسف، هذا صعب',
        },
        tone: 'danger',
      },
    ],
    lessSpicy: [
      {
        id: 'possible',
        label: {
          ko: '네, 덜 맵게 가능해요',
          en: 'Yes, less spicy is possible',
          ar: 'نعم، يمكن جعله أقل حدة',
        },
        tone: 'success',
      },
      {
        id: 'difficult',
        label: {
          ko: '죄송해요, 조절이 어려워요',
          en: 'Sorry, adjusting spice is difficult',
          ar: 'آسف، من الصعب تعديل الحدة',
        },
        tone: 'danger',
      },
    ],
    moreSpicy: [
      {
        id: 'possible',
        label: {
          ko: '네, 더 맵게 가능해요',
          en: 'Yes, more spicy is possible',
          ar: 'نعم، يمكن جعله أكثر حدة',
        },
        tone: 'success',
      },
      {
        id: 'difficult',
        label: {
          ko: '죄송해요, 조절이 어려워요',
          en: 'Sorry, adjusting spice is difficult',
          ar: 'آسف، من الصعب تعديل الحدة',
        },
        tone: 'danger',
      },
    ],
  },
  ingredients: {
    shellfish: {
      ko: '갑각류',
      en: 'shellfish',
      ar: 'محار وقشريات',
    },
    generic: {
      ko: '재료',
      en: 'this ingredient',
      ar: 'هذا المكون',
    },
  },
  content: {
    order: ({ menuName }: OwnerContentParams): OwnerContent => ownerContent({
      ko: `${menuName.ko} 하나 주세요`,
      en: `One ${menuName.en}, please`,
      ar: `واحد ${menuName.ar} من فضلك`,
      'zh-CN': `请给我一份${translate('zh-CN', menuName)}`,
      ja: `${translate('ja', menuName)}を一つください`,
      'zh-TW': `請給我一份${translate('zh-TW', menuName)}`,
      es: `Un ${translate('es', menuName)}, por favor`,
    }),
    ingredient: ({ ingredient }: OwnerContentParams): OwnerContent => ownerContent({
      ko: `여기에 ${ingredient.ko}가 들어가 있나요?`,
      en: `Does this contain ${ingredient.en}?`,
      ar: `هل يحتوي هذا على ${ingredient.ar}؟`,
      'zh-CN': `这里面含有${translate('zh-CN', ingredient)}吗？`,
      ja: `これには${translate('ja', ingredient)}が入っていますか？`,
      'zh-TW': `這裡面含有${translate('zh-TW', ingredient)}嗎？`,
      es: `¿Esto contiene ${translate('es', ingredient)}?`,
    }),
    request: ({ allergen }: OwnerContentParams): OwnerContent => ownerContent({
      ko: `저는 ${allergen.ko} 알레르기가 있어요. ${allergen.ko} 빼고 만들어 주실 수 있나요?`,
      en: `I'm allergic to ${allergen.en}. Can you make it without ${allergen.en}?`,
      ar: `لدي حساسية من ${allergen.ar}. هل يمكن تحضيره بدون ${allergen.ar}؟`,
      'zh-CN': `我对${translate('zh-CN', allergen)}过敏。可以不放${translate('zh-CN', allergen)}吗？`,
      ja: `${translate('ja', allergen)}のアレルギーがあります。${translate('ja', allergen)}抜きで作れますか？`,
      'zh-TW': `我對${translate('zh-TW', allergen)}過敏。可以不放${translate('zh-TW', allergen)}嗎？`,
      es: `Soy alérgico/a a ${translate('es', allergen)}. ¿Puede prepararlo sin ${translate('es', allergen)}?`,
    }),
    spicy: (): OwnerContent => ownerContent({
      ko: '안 맵게 만들어 주실 수 있나요?',
      en: 'Can you make it not spicy?',
      ar: 'هل يمكن جعله غير حار؟',
      'zh-CN': '可以做成不辣的吗？',
      ja: '辛くしないで作れますか？',
      'zh-TW': '可以做成不辣的嗎？',
      es: '¿Puede prepararlo sin picante?',
    }),
    lessSpicy: (): OwnerContent => ownerContent({
      ko: '덜 맵게 만들어 주실 수 있나요?',
      en: 'Can you make it less spicy?',
      ar: 'هل يمكن جعله أقل حدة؟',
      'zh-CN': '可以少放一点辣吗？',
      ja: '辛さを控えめにできますか？',
      'zh-TW': '可以少放一點辣嗎？',
      es: '¿Puede prepararlo menos picante?',
    }),
    moreSpicy: (): OwnerContent => ownerContent({
      ko: '더 맵게 만들어 주실 수 있나요?',
      en: 'Can you make it more spicy?',
      ar: 'هل يمكن جعله أكثر حدة؟',
      'zh-CN': '可以做得更辣一点吗？',
      ja: 'もっと辛くできますか？',
      'zh-TW': '可以做得更辣一點嗎？',
      es: '¿Puede prepararlo más picante?',
    }),
  },
};

export const formatOwnerCommunicationContent = (
  type: OwnerCommunicationContentType,
  params: OwnerContentParams,
) => ownerCommunicationI18n.content[type](params);

export const getAllergyName = (
  allergy: string | UserAllergy | undefined,
  targetLanguage: Language,
) => {
  if (!allergy) {
    return translate(targetLanguage, allergyI18n.fallback);
  }

  if (typeof allergy === 'string') {
    return allergyI18n.names[allergy] ? translate(targetLanguage, allergyI18n.names[allergy]) : allergy;
  }

  if (targetLanguage === 'ko') {
    return allergy.allergy_name_ko;
  }

  if (targetLanguage === 'ar') {
    return allergy.allergy_name_ar ?? allergy.allergy_name_ko;
  }

  return allergy.allergy_name_en ?? allergy.allergy_name ?? allergy.allergy_name_ko;
};
