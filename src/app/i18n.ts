import type { Language, UserAllergy } from './App';
import { ALLERGY_OPTIONS } from './constants/onboarding';

export type LocalizedText = Record<Language, string>;
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
}

interface OwnerContentParams {
  menuName: LocalizedText;
  ingredient: LocalizedText;
  allergen: LocalizedText;
}

export const translate = (language: Language, text: LocalizedText) => text[language];

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
    return allergyI18n.names[code]?.[language] ?? HIT_TAG_LABELS[code]?.[language] ?? prettifyTag(tag);
  }

  if (lower.startsWith('has_')) {
    const code = lower.slice(4); // 예: unclear_broth
    return (
      HIT_TAG_LABELS[code]?.[language] ??
      (code.startsWith('unclear') ? HIT_TAG_LABELS.unclear[language] : undefined) ??
      prettifyTag(tag)
    );
  }

  return allergyI18n.names[lower]?.[language] ?? HIT_TAG_LABELS[lower]?.[language] ?? prettifyTag(tag);
};

export const ownerCommunicationI18n = {
  labels: {
    selectedMenu: {
      ko: '선택된 메뉴',
      en: 'Selected menu',
      ar: 'الطبق المحدد',
    },
    ownerResponse: {
      ko: '사장님 응답',
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
    order: ({ menuName }: OwnerContentParams): OwnerContent => ({
      korean: `${menuName.ko} 하나 주세요`,
      english: `One ${menuName.en}, please`,
      arabic: `واحد ${menuName.ar} من فضلك`,
    }),
    ingredient: ({ ingredient }: OwnerContentParams): OwnerContent => ({
      korean: `여기에 ${ingredient.ko}가 들어가 있나요?`,
      english: `Does this contain ${ingredient.en}?`,
      arabic: `هل يحتوي هذا على ${ingredient.ar}؟`,
    }),
    request: ({ allergen }: OwnerContentParams): OwnerContent => ({
      korean: `저는 ${allergen.ko} 알레르기가 있어요. ${allergen.ko} 빼고 만들어 주실 수 있나요?`,
      english: `I'm allergic to ${allergen.en}. Can you make it without ${allergen.en}?`,
      arabic: `لدي حساسية من ${allergen.ar}. هل يمكن تحضيره بدون ${allergen.ar}؟`,
    }),
    spicy: (): OwnerContent => ({
      korean: '안 맵게 만들어 주실 수 있나요?',
      english: 'Can you make it not spicy?',
      arabic: 'هل يمكن جعله غير حار؟',
    }),
    lessSpicy: (): OwnerContent => ({
      korean: '덜 맵게 만들어 주실 수 있나요?',
      english: 'Can you make it less spicy?',
      arabic: 'هل يمكن جعله أقل حدة؟',
    }),
    moreSpicy: (): OwnerContent => ({
      korean: '더 맵게 만들어 주실 수 있나요?',
      english: 'Can you make it more spicy?',
      arabic: 'هل يمكن جعله أكثر حدة؟',
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
    return allergyI18n.fallback[targetLanguage];
  }

  if (typeof allergy === 'string') {
    return allergyI18n.names[allergy]?.[targetLanguage] ?? allergy;
  }

  if (targetLanguage === 'ko') {
    return allergy.allergy_name_ko;
  }

  if (targetLanguage === 'ar') {
    return allergy.allergy_name_ar ?? allergy.allergy_name_ko;
  }

  return allergy.allergy_name_en ?? allergy.allergy_name ?? allergy.allergy_name_ko;
};
