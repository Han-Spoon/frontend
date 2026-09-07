import { useState } from 'react';
import { ArrowLeft, MessageSquareText, Volume2, X } from 'lucide-react';
import type { Language } from '../App';
import {
  formatOwnerCommunicationContent,
  type OwnerCommunicationContentType,
} from '../i18n';
import { createTranslator, translateText, type LocalizedText } from '../locales';
import {
  localizeMenuText,
  type ProfileCommunicationItem,
} from '../results/resultViewModel';
import { speak, ttsSupported } from '../utils/speech';
import { CommunicationActions } from './results/CommunicationActions';

interface ProfileCommunicationSheetProps {
  items: ProfileCommunicationItem[];
  language: Language;
  onClose: () => void;
}

interface ProfileActionSpec {
  id: string;
  type: OwnerCommunicationContentType;
  label: string;
}

const emptyText: LocalizedText = { ko: '', en: '', ar: '' };

export function ProfileCommunicationSheet({ items, language, onClose }: ProfileCommunicationSheetProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ProfileActionSpec | null>(null);
  const t = createTranslator(language);
  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  const getActions = (item: ProfileCommunicationItem): ProfileActionSpec[] => {
    if (item.kind === 'spicy') {
      return [
        { id: 'spicy-check', type: 'spicyCheck', label: t('매운지 확인하기', 'Ask if it is spicy', 'اسأل إن كان حارًا') },
        { id: 'less-spicy', type: 'lessSpicy', label: t('덜 맵게 요청', 'Ask for less spicy', 'اطلبه أقل حدة') },
      ];
    }
    if (item.kind === 'alcohol') {
      return [
        { id: 'alcohol-check', type: 'ingredient', label: t('알코올이 들어가는지 확인하기', 'Ask if it contains alcohol', 'اسأل إن كان يحتوي على الكحول') },
        { id: 'alcohol-exclude', type: 'exclude', label: t('알코올 빼고 요청', 'Ask for no alcohol', 'اطلبه بدون كحول') },
      ];
    }
    if (item.kind === 'diet') {
      return [{ id: 'diet-share', type: 'diet', label: t('식단 기준 전달하기', 'Share dietary needs', 'شارك احتياجاتك الغذائية') }];
    }
    return [
      { id: 'ingredient-check', type: 'ingredient', label: t('재료 확인하기', 'Check ingredient', 'تحقق من المكوّن') },
      { id: 'allergy-request', type: 'request', label: t('빼고 요청', 'Ask to leave it out', 'اطلب إزالته') },
    ];
  };

  const actions = selectedItem ? getActions(selectedItem) : [];
  const content = selectedItem && activeAction
    ? formatOwnerCommunicationContent(activeAction.type, {
      menuName: emptyText,
      ingredient: selectedItem.label,
      allergen: selectedItem.label,
    })
    : null;

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 bg-soy-ink/45" onClick={onClose} aria-label={t('닫기', 'Close', 'إغلاق')} />
      <section
        className="fixed bottom-0 left-1/2 z-50 max-h-[88dvh] w-full max-w-[430px] -translate-x-1/2 overflow-y-auto rounded-t-[1.5rem] border border-border-warm bg-surface-raised shadow-[var(--shadow-float)] animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-communication-title"
      >
        <div className="flex items-center gap-2 border-b border-border-warm px-4 py-3">
          {activeAction ? (
            <button type="button" onClick={() => setActiveAction(null)} className="touch-target inline-flex items-center justify-center rounded-full hover:bg-surface-subtle" aria-label={t('다른 항목 선택', 'Choose another item', 'اختر عنصرًا آخر')}>
              <ArrowLeft className="size-5 rtl:rotate-180" />
            </button>
          ) : <span className="size-11" aria-hidden="true" />}
          <h2 id="profile-communication-title" className="min-w-0 flex-1 text-center text-base font-extrabold">
            {t('내 식단 전달하기', 'Share my dietary needs', 'شارك احتياجاتي الغذائية')}
          </h2>
          <button type="button" onClick={onClose} className="touch-target inline-flex items-center justify-center rounded-full hover:bg-surface-subtle" aria-label={t('닫기', 'Close', 'إغلاق')}>
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 pb-8 pt-5">
          {content && selectedItem && activeAction ? (
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-text-secondary">
                <MessageSquareText className="size-4 text-brand-primary" aria-hidden="true" />
                {localizeMenuText(selectedItem.label, language)} · {activeAction.label}
              </div>
              <div className="rounded-[var(--radius-card)] border border-border-warm bg-surface-subtle p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-xl font-extrabold leading-8 text-text-primary">{translateText(language, content.localized)}</p>
                    {language !== 'ko' && <p className="mt-3 border-t border-border-warm pt-3 text-sm font-semibold leading-6 text-text-secondary" lang="ko">{content.korean}</p>}
                    {language === 'ko' && <p className="mt-3 border-t border-border-warm pt-3 text-sm leading-6 text-text-secondary" lang="en">{content.english}</p>}
                  </div>
                  {ttsSupported && (
                    <button type="button" onClick={() => speak(content.korean, 'ko-KR')} className="touch-target inline-flex shrink-0 items-center justify-center rounded-full bg-brand-primary text-white hover:bg-brand-primary-hover" aria-label={t('음성 듣기', 'Play audio', 'تشغيل الصوت')}>
                      <Volume2 className="size-5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-center text-xs leading-5 text-text-tertiary">{t('직원에게 이 화면을 보여주세요.', 'Show this screen to a staff member.', 'اعرض هذه الشاشة على أحد الموظفين.')}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm leading-6 text-text-secondary">{t('전달할 식단 항목을 선택해 주세요.', 'Choose the dietary need you want to share.', 'اختر الاحتياج الغذائي الذي تريد مشاركته.')}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((item) => {
                  const selected = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setSelectedId(item.id); setActiveAction(null); }}
                      aria-pressed={selected}
                      className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold ${selected ? 'border-brand-primary bg-brand-primary-soft text-brand-primary' : 'border-border-warm bg-surface-raised text-text-primary hover:bg-surface-subtle'}`}
                    >
                      {localizeMenuText(item.label, language)}
                    </button>
                  );
                })}
              </div>

              {selectedItem && (
                <div className="mt-5 border-t border-border-warm pt-4">
                  <p className="mb-3 text-xs font-bold text-text-secondary">{t('어떻게 전달할까요?', 'What would you like to say?', 'ماذا تريد أن تقول؟')}</p>
                  <CommunicationActions
                    primaryAction={{ ...actions[0], onClick: () => setActiveAction(actions[0]) }}
                    requestActions={actions.slice(1).map((action) => ({ ...action, onClick: () => setActiveAction(action) }))}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
