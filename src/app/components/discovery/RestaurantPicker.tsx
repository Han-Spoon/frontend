import { useState } from 'react';
import { Check, MapPin, Search } from 'lucide-react';
import type { Language } from '../../App';
import {
  AREAS,
  RESTAURANTS,
  restaurantsInArea,
  type AreaId,
  type Restaurant,
} from '../../demo/restaurants';
import { localizeMenuText } from '../../results/resultViewModel';
import { createTranslator } from '../../locales';
import { BottomSheet } from './BottomSheet';

export function RestaurantPicker({
  language,
  selectedId,
  onSelect,
  onClose,
  allowSkip = true,
}: {
  language: Language;
  selectedId?: string | null;
  onSelect: (restaurant: Restaurant | null) => void;
  onClose: () => void;
  allowSkip?: boolean;
}) {
  const t = createTranslator(language);
  const [area, setArea] = useState<AreaId>('nearby');
  const [query, setQuery] = useState('');
  const candidates = query.trim()
    ? RESTAURANTS.filter((r) =>
        `${Object.values(r.name).join(' ')} ${r.address} ${r.area}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      )
    : restaurantsInArea(area);
  return (
    <BottomSheet
      language={language}
      onClose={onClose}
      title={t(
        '어느 식당에 계세요?',
        'Where are you dining?',
        'أين تتناول الطعام؟',
      )}
      description={t(
        '식당을 연결하면 오늘의 메뉴를 방문 기록으로 모을 수 있어요.',
        'Connect a restaurant to keep today’s menu in your food journal.',
        'اربط المطعم للاحتفاظ بقائمة اليوم في سجل زياراتك.',
      )}
    >
      <label className="mb-4 flex items-center gap-2 rounded-xl border border-border-warm bg-surface-subtle px-3">
        <Search className="size-4 shrink-0 text-text-secondary" />
        <input
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          placeholder={t(
            '식당 이름 · 영문 이름 · 지역',
            'Name · English name · area',
            'الاسم · الاسم الإنجليزي · المنطقة',
          )}
          aria-label={t('식당 검색', 'Search restaurants', 'ابحث عن مطعم')}
        />
      </label>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {AREAS.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setArea(a.id);
              setQuery('');
            }}
            aria-pressed={area === a.id}
            className={`shrink-0 rounded-full px-4 py-3 text-xs font-bold ${area === a.id ? 'bg-brand-primary text-white' : 'bg-surface-subtle text-text-secondary'}`}
          >
            {localizeMenuText(a, language)}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {candidates.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="flex min-h-20 w-full items-center gap-3 rounded-2xl border border-border-warm p-3 text-start hover:bg-brand-primary-soft"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
              <MapPin className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">
                {localizeMenuText(r.name, language)}
              </span>
              <span className="text-xs text-text-secondary">
                {r.name.ko} ·{' '}
                {localizeMenuText(
                  AREAS.find((a) => a.id === r.area)!,
                  language,
                )}
              </span>
            </span>
            {selectedId === r.id && (
              <Check className="size-5 text-brand-primary" />
            )}
          </button>
        ))}
      </div>
      {candidates.length === 0 && (
        <p className="py-6 text-center text-sm text-text-secondary">
          {t(
            '검색 결과가 없어요. 지역을 선택해 찾아보세요.',
            'No matches. Try browsing by area.',
            'لا توجد نتائج. جرب البحث حسب المنطقة.',
          )}
        </p>
      )}
      {allowSkip && (
        <button
          onClick={() => onSelect(null)}
          className="mt-4 min-h-12 w-full rounded-xl border border-border-warm text-sm font-bold"
        >
          {t(
            '식당 없이 계속하기',
            'Continue without a restaurant',
            'متابعة بدون مطعم',
          )}
        </button>
      )}
    </BottomSheet>
  );
}
