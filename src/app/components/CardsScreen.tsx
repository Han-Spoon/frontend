import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquareText, Trash2, User, Volume2, X } from 'lucide-react';
import type { Language } from '../App';
import { deleteCard, getSavedCards, type CardType, type SavedCard } from '../../api/card';
import { BottomNav } from './BottomNav';

interface CardsScreenProps {
  language: Language;
  onMyPage: () => void;
}

type Speakable = { ko: string; en?: string | null; ar?: string | null };

const CARD_TYPE_LABEL: Record<CardType, { ko: string; en: string; ar: string }> = {
  order: { ko: '주문', en: 'Order', ar: 'طلب' },
  ingredient_check: { ko: '재료 확인', en: 'Ingredient check', ar: 'فحص المكونات' },
  exclude: { ko: '요청', en: 'Request', ar: 'طلب خاص' },
};

// 식당에서 가장 많이 쓰는 문장 (고정, 모든 사용자 공통). 음성은 항상 ko.
const COMMON_PHRASES: { ko: string; en: string; ar: string }[] = [
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

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const localized = (item: Speakable) =>
    (language === 'ko' ? item.ko : language === 'ar' ? item.ar : item.en) || item.ko;
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
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center justify-between px-5 flex-shrink-0">
        <span className="font-semibold text-neutral-900">
          {t('사장님 요청카드', 'Request Cards', 'بطاقات الطلب')}
        </span>
        <button
          onClick={onMyPage}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <User className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5">
        {/* 고정: 식당에서 자주 쓰는 문장 */}
        <div className="rounded-xl border border-neutral-200 overflow-hidden">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-neutral-900 text-white"
          >
            <MessageSquareText className="w-5 h-5" />
            <span className="flex-1 text-left text-sm font-semibold">
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
                  className="w-full text-left p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <div className="text-sm text-neutral-900 leading-snug">{localized(phrase)}</div>
                  {koSub(phrase) && <div className="text-xs text-neutral-500 leading-snug mt-0.5">{koSub(phrase)}</div>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 저장 카드 */}
        {error && <p className="text-xs text-red-500 text-center">{error}</p>}

        {loading ? (
          <p className="text-sm text-neutral-500 text-center py-8">{t('불러오는 중...', 'Loading...', 'جارٍ التحميل...')}</p>
        ) : cards.length === 0 ? (
          <div className="py-10 text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-neutral-600">
              {t('저장된 카드가 없어요', 'No saved cards yet', 'لا توجد بطاقات محفوظة')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.cardId} className="p-4 bg-neutral-50 rounded-xl flex items-start gap-3">
                <button onClick={() => setSelected(card.text)} className="min-w-0 flex-1 text-left">
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-700">
                    {CARD_TYPE_LABEL[card.type][language]}
                  </span>
                  <div className="text-sm text-neutral-900 mb-1 leading-snug">{localized(card.text)}</div>
                  {koSub(card.text) && <div className="text-xs text-neutral-500 leading-snug">{koSub(card.text)}</div>}
                </button>
                <button
                  onClick={() => handleDelete(card.cardId)}
                  disabled={deletingId === card.cardId}
                  className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
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
          <div className="fixed inset-0 bg-black/50 z-40" onClick={closePopup} />
          <div
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up"
            style={{ left: 'calc(50% - 195px)', width: '390px' }}
          >
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-12 h-1 bg-neutral-300 rounded-full" />
            </div>
            <div className="px-6 pb-8 pt-4 relative">
              <button
                onClick={closePopup}
                className="absolute right-5 top-2 w-9 h-9 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100"
                aria-label={t('닫기', 'Close', 'إغلاق')}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-3xl font-bold text-neutral-900 leading-snug mb-3 mt-6">{selected.ko}</div>
              {language !== 'ko' && (
                <div className="text-base text-neutral-500 mb-6">{localized(selected)}</div>
              )}

              {ttsSupported && (
                <button
                  onClick={() => speakKorean(selected.ko)}
                  className="w-full h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors mb-3"
                >
                  <Volume2 className="w-5 h-5" />
                  <span className="font-medium">{t('음성 듣기', 'Play audio', 'تشغيل الصوت')}</span>
                </button>
              )}
              <button
                onClick={closePopup}
                className="w-full h-12 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors"
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
