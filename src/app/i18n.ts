import type { Language, UserAllergy } from './App';

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
  names: {
    갑각류: { ko: '갑각류', en: 'shellfish', ar: 'محار وقشريات' },
    견과류: { ko: '견과류', en: 'nuts', ar: 'مكسرات' },
    유제품: { ko: '유제품', en: 'dairy', ar: 'منتجات الألبان' },
    계란: { ko: '계란', en: 'eggs', ar: 'بيض' },
    글루텐: { ko: '글루텐', en: 'gluten', ar: 'غلوتين' },
    대두: { ko: '대두', en: 'soy', ar: 'صويا' },
  } satisfies Record<string, LocalizedText>,
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
