import { useState } from 'react';
import { AlertTriangle, Check, XCircle } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
import { saveCard, type CardType } from '../../api/card';
import {
  formatOwnerCommunicationContent,
  getAllergyName,
  getHitTagLabel,
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

const HIDDEN_OWNER_CONTENT_LABELS = new Set([
  'hidden animal',
  'unknown remain',
]);

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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // 시트 카드 종류 → 백엔드 CardType (order/ingredient_check/exclude)
  const toCardType = (sheetType: OwnerCommunicationType): CardType => {
    if (sheetType === 'order') return 'order';
    if (sheetType === 'ingredient') return 'ingredient_check';
    return 'exclude';
  };

  // 이 메뉴의 플래그된 재료(코드)를 언어별로 라벨화 후 쉼표 나열.
  const flaggedFor = (lang: Language) =>
    Array.from(
      new Set((menu.riskReasons ?? [])
        .map((code) => getHitTagLabel(code, lang))
        .filter(Boolean)
        .filter((label) => !HIDDEN_OWNER_CONTENT_LABELS.has(label.trim().toLowerCase()))),
    ).join(', ');
  const flaggedLabels = { ko: flaggedFor('ko'), en: flaggedFor('en'), ar: flaggedFor('ar') };

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
        // 이 메뉴의 플래그된 재료(hits + ownerCard.flag)를 언어별로 나열.
        const ingredient = flaggedLabels.ko
          ? { ko: flaggedLabels.ko, en: flaggedLabels.en, ar: flaggedLabels.ar }
          : ownerCommunicationI18n.ingredients.generic;

        return formatOwnerCommunicationContent(type, {
          menuName,
          ingredient,
          allergen: emptyText,
        });
      }
      case 'request': {
        // 플래그된 재료가 있으면 그걸, 없으면 사용자 알레르기 첫 항목으로 폴백.
        const fallbackAllergy = userProfile?.allergies[0];
        const allergen = flaggedLabels.ko
          ? { ko: flaggedLabels.ko, en: flaggedLabels.en, ar: flaggedLabels.ar }
          : {
              ko: getAllergyName(fallbackAllergy, 'ko'),
              en: getAllergyName(fallbackAllergy, 'en'),
              ar: getAllergyName(fallbackAllergy, 'ar'),
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

  const handleSave = async () => {
    if (saving || saved) return;
    try {
      setSaving(true);
      setSaveError('');
      await saveCard({
        type: toCardType(type),
        menuNameKo: menu.menuName,
        text: { ko: content.korean, en: content.english, ar: content.arabic },
      });
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Card save failed:', error);
      setSaveError(
        language === 'ko'
          ? '저장에 실패했어요. 다시 시도해 주세요.'
          : language === 'ar'
            ? 'فشل الحفظ. يرجى المحاولة مرة أخرى.'
            : 'Failed to save. Please try again.',
      );
    } finally {
      setSaving(false);
    }
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

          {saveError && <p className="text-xs text-red-500 text-center mb-2">{saveError}</p>}
          <button
            onClick={handleSave}
            disabled={saved || saving}
            className={`w-full h-12 rounded-xl text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 disabled:opacity-60'
            }`}
          >
            {saved ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                {translate(language, ownerCommunicationI18n.labels.saved)}
              </span>
            ) : saving ? (
              language === 'ko' ? '저장 중...' : language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'
            ) : (
              translate(language, ownerCommunicationI18n.labels.saveFavorite)
            )}
          </button>
        </div>
      </div>
    </>
  );
}
