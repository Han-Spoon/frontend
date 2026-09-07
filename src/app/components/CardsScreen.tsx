import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquareText, Trash2, User, Volume2, X } from 'lucide-react';
import type { Language } from '../App';
import { deleteCard, getSavedCards, type CardType, type SavedCard } from '../../api/card';
import { BottomNav } from './BottomNav';
import { createTranslator, translateText, type LocalizedText } from '../locales';

interface CardsScreenProps {
  language: Language;
  onMyPage: () => void;
}

type Speakable = { ko: string; en?: string | null; ar?: string | null } & Partial<LocalizedText>;

const CARD_TYPE_LABEL: Record<CardType, LocalizedText> = {
  order: { ko: '주문', en: 'Order', ar: 'طلب' },
  ingredient_check: { ko: '재료 확인', en: 'Ingredient check', ar: 'فحص المكونات' },
  exclude: { ko: '요청', en: 'Request', ar: 'طلب خاص' },
};

// 식당에서 가장 많이 쓰는 문장 (고정, 모든 사용자 공통). 음성은 항상 ko.
const COMMON_PHRASES: LocalizedText[] = [
  { ko: '숟가락과 젓가락은 어디에 있나요?', en: 'Where are the spoons and chopsticks?', ar: 'أين الملاعق والعيدان؟' },
  { ko: '반찬 리필 가능할까요?', en: 'Can I get a refill of side dishes?', ar: 'هل يمكنني إعادة ملء الأطباق الجانبية؟' },
  { ko: '화장실은 어디에 있나요?', en: 'Where is the restroom?', ar: 'أين الحمام؟' },
  { ko: '계산하고 싶어요.', en: "I'd like to pay, please.", ar: 'أريد أن أدفع.' },
  { ko: '주문하겠습니다.', en: "I'd like to order, please.", ar: 'أريد أن أطلب.' },
];

const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function speakKorean(text: string) {
  if (!ttsSupported || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function CardsScreen({ language, onMyPage }: CardsScreenProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [selected, setSelected] = useState<Speakable | null>(null);

  const t = createTranslator(language);

  const localized = (item: Speakable) => translateText(language, {
    ko: item.ko,
    en: item.en || item.ko,
    ar: item.ar || item.ko,
    'zh-CN': item['zh-CN'],
    ja: item.ja,
    'zh-TW': item['zh-TW'],
    es: item.es,
  });
  const koSub = (item: Speakable) => (language === 'ko' ? '' : item.ko);

  const loadCards = async () => {
    try {
      setLoading(true);
      setError('');
      setCards(await getSavedCards());
    } catch (e) {
      console.error('Failed to load saved cards:', e);
      setError(t('카드를 불러오지 못했어요.', 'Failed to load cards.', 'تعذر تحميل البطاقات.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
    return () => {
      if (ttsSupported) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (cardId: string) => {
    try {
      setDeletingId(cardId);
      await deleteCard(cardId);
      setCards((prev) => prev.filter((card) => card.cardId !== cardId));
    } catch (e) {
      console.error('Failed to delete card:', e);
      setError(t('삭제에 실패했어요.', 'Failed to delete.', 'فشل الحذف.'));
    } finally {
      setDeletingId(null);
    }
  };

  const closePopup = () => {
    if (ttsSupported) window.speechSynthesis.cancel();
    setSelected(null);
  };

  return (
    <div className="h-dvh flex flex-col bg-rice-cream">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center justify-between px-5 flex-shrink-0">
        <span className="font-bold text-soy-ink">
          {t('사장님 요청카드', 'Request Cards', 'بطاقات الطلب')}
        </span>
        <button
          onClick={onMyPage}
          className="size-11 rounded-full bg-brand-green-50 flex items-center justify-center text-brand-green-700 hover:bg-brand-green-100 transition-colors"
          aria-label={t('마이페이지', 'My page', 'صفحتي')}
        >
          <User className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {/* 고정: 식당에서 자주 쓰는 문장 */}
        <div className="rounded-[1.5rem] border border-border-warm bg-rice-white overflow-hidden shadow-[0_8px_28px_rgba(54,61,57,0.06)]">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="min-h-14 w-full flex items-center gap-3 px-4 py-3 bg-brand-green-700 text-white"
          >
            <MessageSquareText className="w-5 h-5" />
            <span className="flex-1 text-start text-sm font-bold">
              {t('식당에서 자주 쓰는 문장', 'Common restaurant phrases', 'عبارات المطعم الشائعة')}
            </span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          {expanded && (
            <div className="p-3 space-y-2">
              {COMMON_PHRASES.map((phrase) => (
                <button
                  key={phrase.ko}
                  onClick={() => setSelected(phrase)}
                  className="min-h-14 w-full text-start p-3 bg-brand-green-50 rounded-2xl hover:bg-brand-green-100 transition-colors"
                >
                  <div className="text-sm font-semibold text-soy-ink leading-snug">{localized(phrase)}</div>
                  {koSub(phrase) && <div className="text-xs text-sesame-gray leading-snug mt-0.5">{koSub(phrase)}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 저장 카드 */}
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        {loading ? (
          <p className="text-sm text-sesame-gray text-center py-8">{t('불러오는 중...', 'Loading...', 'جارٍ التحميل...')}</p>
        ) : cards.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-sesame-gray">
              {t('저장된 카드가 없어요', 'No saved cards yet', 'لا توجد بطاقات محفوظة')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.cardId} className="p-4 bg-rice-white border border-border-warm rounded-2xl flex items-start gap-3 shadow-sm">
                <button onClick={() => setSelected(card.text)} className="min-w-0 flex-1 text-start">
                  <span className="inline-block mb-2 px-2.5 py-1 rounded-full bg-brand-orange-100 text-[11px] font-bold text-accent-foreground">
                    {translateText(language, CARD_TYPE_LABEL[card.type])}
                  </span>
                  <div className="text-sm font-semibold text-soy-ink mb-1 leading-snug">{localized(card.text)}</div>
                  {koSub(card.text) && <div className="text-xs text-sesame-gray leading-snug">{koSub(card.text)}</div>}
                </button>
                <button
                  onClick={() => handleDelete(card.cardId)}
                  disabled={deletingId === card.cardId}
                  className="flex-shrink-0 size-11 rounded-xl flex items-center justify-center text-sesame-gray hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  aria-label={t('삭제', 'Delete', 'حذف')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav language={language} />

      {/* 카드 팝업 + 한국어 음성 */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-soy-ink/55 z-40" onClick={closePopup} />
          <div
            className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-rice-white rounded-t-[2rem] shadow-2xl animate-slide-up"
            role="dialog"
            aria-modal="true"
            aria-label={t('요청 카드', 'Request card', 'بطاقة الطلب')}
          >
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-12 h-1 bg-border-warm rounded-full" />
            </div>
            <div className="px-6 pb-8 pt-4 relative">
              <button
                onClick={closePopup}
                className="absolute end-5 top-2 size-11 rounded-xl flex items-center justify-center text-sesame-gray hover:bg-brand-green-50"
                aria-label={t('닫기', 'Close', 'إغلاق')}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-3xl font-extrabold text-soy-ink leading-snug mb-3 mt-6">{selected.ko}</div>
              {language !== 'ko' && (
                <div className="text-base text-sesame-gray mb-6">{localized(selected)}</div>
              )}

              {ttsSupported && (
                <button
                  onClick={() => speakKorean(selected.ko)}
                  className="w-full h-14 bg-brand-green-700 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-green-900 transition-colors mb-3"
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="font-medium">{t('음성 듣기', 'Play audio', 'تشغيل الصوت')}</span>
                </button>
              )}
              <button
                onClick={closePopup}
                className="w-full h-12 bg-brand-green-50 text-brand-green-700 rounded-2xl text-sm font-bold hover:bg-brand-green-100 transition-colors"
              >
                {t('닫기', 'Close', 'إغلاق')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
