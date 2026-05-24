import { useState } from 'react';
import { AlertTriangle, Check, XCircle } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';

export type OwnerCommunicationType = 'order' | 'ingredient' | 'request' | 'spicy';
export type OwnerResponseId = 'ok' | 'yes' | 'no' | 'possible' | 'difficult';
export type OwnerResponseTone = 'success' | 'caution' | 'danger';

export interface OwnerResponseOption {
  id: OwnerResponseId;
  label: {
    ko: string;
    en: string;
  };
  tone: OwnerResponseTone;
}

export const getOwnerResponseOptions = (type: OwnerCommunicationType): OwnerResponseOption[] => {
  if (type === 'order') {
    return [
      {
        id: 'ok',
        label: {
          ko: '네, 주문 받았습니다',
          en: 'Yes, your order is placed',
        },
        tone: 'success',
      },
    ];
  }

  if (type === 'ingredient') {
    return [
      {
        id: 'yes',
        label: {
          ko: '네, 들어 있어요',
          en: 'Yes, it contains that',
        },
        tone: 'caution',
      },
      {
        id: 'no',
        label: {
          ko: '아니요, 안 들어 있어요',
          en: 'No, it does not contain that',
        },
        tone: 'success',
      },
    ];
  }

  return [
    {
      id: 'possible',
      label: {
        ko: '네, 가능해요',
        en: 'Yes, that is possible',
      },
      tone: 'success',
    },
    {
      id: 'difficult',
      label: {
        ko: '죄송해요, 어려워요',
        en: 'Sorry, that is difficult',
      },
      tone: 'danger',
    },
  ];
};

export const getOwnerResponseOption = (
  type: OwnerCommunicationType,
  responseId: OwnerResponseId,
) => getOwnerResponseOptions(type).find((option) => option.id === responseId);

interface OwnerCommunicationSheetProps {
  menu: MenuAnalysis;
  type: OwnerCommunicationType;
  userProfile: UserProfile | null;
  language: Language;
  initialResponse?: OwnerResponseId | null;
  onResponseSelect?: (type: OwnerCommunicationType, responseId: OwnerResponseId) => void;
  onClose: () => void;
}

export function OwnerCommunicationSheet({
  menu,
  type,
  userProfile,
  language,
  initialResponse = null,
  onResponseSelect,
  onClose,
}: OwnerCommunicationSheetProps) {
  const [response, setResponse] = useState<OwnerResponseId | null>(initialResponse);
  const [saved, setSaved] = useState(false);

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);

  const getContent = () => {
    switch (type) {
      case 'order':
        return {
          korean: `${menu.menuName} 하나 주세요`,
          english: `One ${menu.menuNameEn}, please`,
        };
      case 'ingredient': {
        const ingredient = menu.riskReasons[0]?.includes('갑각류') ? '갑각류' : '재료';
        return {
          korean: `여기에 ${ingredient}가 들어가 있나요?`,
          english: `Does this contain ${ingredient === '갑각류' ? 'shellfish' : 'this ingredient'}?`,
        };
      }
      case 'request': {
        const allergen = userProfile?.allergies[0] || t('특정 재료', 'specific ingredient');
        return {
          korean: `저는 ${allergen} 알레르기가 있어요. ${allergen} 빼고 만들어 주실 수 있나요?`,
          english: `I'm allergic to ${allergen}. Can you make it without ${allergen}?`,
        };
      }
      case 'spicy':
        return {
          korean: '안 맵게 만들어 주실 수 있나요?',
          english: 'Can you make it not spicy?',
        };
      default:
        return { korean: '', english: '' };
    }
  };

  const content = getContent();
  const responseButtons = getOwnerResponseOptions(type);
  const selectedResponse = response ? getOwnerResponseOption(type, response) : null;

  const selectedButtonClasses: Record<OwnerResponseTone, string> = {
    success: 'border-green-500 bg-green-50 text-green-900 shadow-sm',
    caution: 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm',
    danger: 'border-red-400 bg-red-50 text-red-900 shadow-sm',
  };

  const summaryClasses: Record<OwnerResponseTone, string> = {
    success: 'bg-green-50 border-green-200 text-green-900',
    caution: 'bg-amber-50 border-amber-200 text-amber-900',
    danger: 'bg-red-50 border-red-200 text-red-900',
  };

  const getResponseIcon = (tone: OwnerResponseTone) => {
    if (tone === 'success') {
      return <Check className="w-4 h-4" />;
    }
    if (tone === 'danger') {
      return <XCircle className="w-4 h-4" />;
    }
    return <AlertTriangle className="w-4 h-4" />;
  };

  const handleResponseSelect = (option: OwnerResponseOption) => {
    setResponse(option.id);
    onResponseSelect?.(type, option.id);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
        style={{
          left: 'calc(50% - 195px)',
          width: '390px',
        }}
      >
        <div className="pt-3 pb-2 flex justify-center">
          <div className="w-12 h-1 bg-neutral-300 rounded-full" />
        </div>

        <div className="px-6 pb-8 pt-6 relative">
          <div className="mb-4">
            <div className="text-2xl font-bold text-neutral-900 leading-tight mb-2">
              {content.korean}
            </div>
            <div className="text-sm text-neutral-500">
              {content.english}
            </div>
          </div>

          <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
            <div className="text-xs text-neutral-500 mb-1">{t('선택된 메뉴', 'Selected menu')}</div>
            <div className="font-medium text-neutral-900">{menu.menuName}</div>
            <div className="text-xs text-neutral-500 mt-1">{menu.menuNameEn}</div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-xs text-neutral-600 mb-3">{t('사장님 응답', 'Owner response')}</div>
            {responseButtons.map((btn) => {
              const selected = response === btn.id;

              return (
                <button
                  key={btn.id}
                  onClick={() => handleResponseSelect(btn)}
                  className={`w-full min-h-14 border-2 rounded-xl flex items-center gap-3 px-4 py-3 transition-colors text-sm font-medium ${
                    selected
                      ? selectedButtonClasses[btn.tone]
                      : 'bg-white border-neutral-300 text-neutral-900 hover:border-neutral-900 hover:bg-neutral-50'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selected ? 'bg-white/75' : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {selected ? getResponseIcon(btn.tone) : btn.id === 'ok' || btn.id === 'possible' ? '✓' : btn.id === 'yes' ? '!' : '✗'}
                  </span>
                  <span className="min-w-0 text-left leading-tight">
                    <span className="block">{btn.label.ko}</span>
                    <span className={`block text-xs mt-0.5 ${selected ? 'opacity-75' : 'text-neutral-500'}`}>
                      {btn.label.en}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={saved}
            className={`w-full h-12 rounded-xl text-sm font-medium transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {t('저장되었습니다', 'Saved')}
              </span>
            ) : (
              t('자주 쓰는 카드로 저장', 'Save as favorite card')
            )}
          </button>
        </div>
      </div>
    </>
  );
}
