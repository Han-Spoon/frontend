import { useState } from 'react';
import { AlertTriangle, Check, XCircle } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
import {
  formatOwnerCommunicationContent,
  getAllergyName,
  ownerCommunicationI18n,
  translate,
  type LocalizedText,
  type OwnerContent,
} from '../i18n';

export type OwnerCommunicationType =
  | 'order'
  | 'ingredient'
  | 'request'
  | 'spicy'
  | 'lessSpicy'
  | 'moreSpicy';
export type OwnerResponseId = 'ok' | 'yes' | 'no' | 'possible' | 'difficult';
export type OwnerResponseTone = 'success' | 'caution' | 'danger';

export interface OwnerResponseOption {
  id: OwnerResponseId;
  label: LocalizedText;
  tone: OwnerResponseTone;
}

export const getOwnerResponseOptions = (type: OwnerCommunicationType): OwnerResponseOption[] => {
  return ownerCommunicationI18n.responseOptions[type] as OwnerResponseOption[];
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

  const getContent = (): OwnerContent => {
    const menuName = {
      ko: menu.menuName,
      en: menu.menuNameEn,
      ar: menu.menuNameAr ?? menu.menuNameEn,
    };
    const emptyText = { ko: '', en: '', ar: '' };

    switch (type) {
      case 'order':
        return formatOwnerCommunicationContent(type, {
          menuName,
          ingredient: emptyText,
          allergen: emptyText,
        });
      case 'ingredient': {
        const ingredient = menu.riskReasons[0]?.includes('갑각류')
          ? ownerCommunicationI18n.ingredients.shellfish
          : ownerCommunicationI18n.ingredients.generic;

        return formatOwnerCommunicationContent(type, {
          menuName,
          ingredient,
          allergen: emptyText,
        });
      }
      case 'request': {
        const allergy = userProfile?.allergies[0];
        const allergen = {
          ko: getAllergyName(allergy, 'ko'),
          en: getAllergyName(allergy, 'en'),
          ar: getAllergyName(allergy, 'ar'),
        };

        return formatOwnerCommunicationContent(type, {
          menuName,
          ingredient: emptyText,
          allergen,
        });
      }
      case 'spicy':
      case 'lessSpicy':
      case 'moreSpicy':
        return formatOwnerCommunicationContent(type, {
          menuName,
          ingredient: emptyText,
          allergen: emptyText,
        });
      default:
        return { korean: '', english: '', arabic: '' };
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
              {language === 'ko' ? content.korean : language === 'ar' ? content.arabic : content.english}
            </div>
            <div className="text-sm text-neutral-500">
              {language === 'ko' ? content.english : content.korean}
            </div>
          </div>

          <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
            <div className="text-xs text-neutral-500 mb-1">{translate(language, ownerCommunicationI18n.labels.selectedMenu)}</div>
            <div className="font-medium text-neutral-900">{language === 'ko' ? menu.menuName : language === 'ar' ? menu.menuNameAr ?? menu.menuNameEn : menu.menuNameEn}</div>
            <div className="text-xs text-neutral-500 mt-1">{language === 'ko' ? menu.menuNameEn : menu.menuName}</div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-xs text-neutral-600 mb-3">{translate(language, ownerCommunicationI18n.labels.ownerResponse)}</div>
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
                    <span className="block">{translate(language, btn.label)}</span>
                    <span className={`block text-xs mt-0.5 ${selected ? 'opacity-75' : 'text-neutral-500'}`}>
                      {language === 'ko' ? btn.label.en : btn.label.ko}
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
                {translate(language, ownerCommunicationI18n.labels.saved)}
              </span>
            ) : (
              translate(language, ownerCommunicationI18n.labels.saveFavorite)
            )}
          </button>
        </div>
      </div>
    </>
  );
}
