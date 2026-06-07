import { useEffect, useState } from 'react';
import { Trash2, User } from 'lucide-react';
import type { Language } from '../App';
import { deleteCard, getSavedCards, type CardType, type SavedCard } from '../../api/card';
import { BottomNav } from './BottomNav';

interface CardsScreenProps {
  language: Language;
  onMyPage: () => void;
}

const CARD_TYPE_LABEL: Record<CardType, { ko: string; en: string; ar: string }> = {
  order: { ko: '주문', en: 'Order', ar: 'طلب' },
  ingredient_check: { ko: '재료 확인', en: 'Ingredient check', ar: 'فحص المكونات' },
  exclude: { ko: '요청', en: 'Request', ar: 'طلب خاص' },
};

export function CardsScreen({ language, onMyPage }: CardsScreenProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

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

  const getCardText = (card: SavedCard) => {
    const text = card.text;
    return (language === 'ko' ? text.ko : language === 'ar' ? text.ar : text.en) || text.ko;
  };
  const getCardSubText = (card: SavedCard) => (language === 'ko' ? card.text.en : card.text.ko);

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

      <div className="flex-1 overflow-y-auto px-5 py-6">
        {error && (
          <p className="text-xs text-red-500 mb-4 text-center">{error}</p>
        )}

        {loading ? (
          <p className="text-sm text-neutral-500 text-center py-12">{t('불러오는 중...', 'Loading...', 'جارٍ التحميل...')}</p>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-sm text-neutral-600">
              {t('저장된 카드가 없어요', 'No saved cards yet', 'لا توجد بطاقات محفوظة')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <div key={card.cardId} className="p-4 bg-neutral-50 rounded-xl flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-700">
                    {CARD_TYPE_LABEL[card.type][language]}
                  </span>
                  <div className="text-sm text-neutral-900 mb-1 leading-snug">{getCardText(card)}</div>
                  <div className="text-xs text-neutral-500 leading-snug">{getCardSubText(card)}</div>
                </div>
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
    </div>
  );
}
