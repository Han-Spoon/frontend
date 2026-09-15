import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Utensils } from 'lucide-react';
import type { Language } from '../../App';
import { createTranslator } from '../../locales';

export interface RestaurantPick {
  id: string;
  name: string;
  category: string;
  address: string;
  image: string;
}

export function RestaurantRecommendations({ language, areaName, items, loading = false, error = false, demo = false, onSelect, onRetry }: {
  language: Language;
  areaName: string;
  items: RestaurantPick[];
  loading?: boolean;
  error?: boolean;
  demo?: boolean;
  onSelect: (id: string) => void;
  onRetry?: () => void;
}) {
  const t = createTranslator(language);
  const headingId = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const itemKey = items.map(item => item.id).join(',');

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    element.scrollTo({ left: 0, behavior: 'instant' });
    const update = () => {
      const position = Math.abs(element.scrollLeft);
      setCanPrev(position > 2);
      setCanNext(position < element.scrollWidth - element.clientWidth - 2);
    };
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => { element.removeEventListener('scroll', update); observer.disconnect(); };
  }, [areaName, itemKey, language, loading, error]);

  const scroll = (direction: 'prev' | 'next') => {
    const element = viewport.current;
    if (!element) return;
    const width = element.firstElementChild?.getBoundingClientRect().width ?? element.clientWidth;
    element.scrollBy({
      left: (width + 12) * (direction === 'next' ? 1 : -1) * (language === 'ar' ? -1 : 1),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return (
    <section className="mt-11 pb-2" aria-labelledby={headingId} data-restaurant-picks="">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-brand-primary">HAN SPOON PICKS</p>
          <h2 id={headingId} className="mt-2 text-[26px] font-extrabold leading-tight tracking-[-0.04em]">
            {t('한 끼가 여행이 되는 곳', 'A table worth discovering', 'مائدة تستحق الاكتشاف')}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
            {areaName} · {t('다음 한 끼를 위한 식당 발견', 'Find your next place to eat', 'اكتشف مكان وجبتك القادمة')}
          </p>
        </div>
      </div>

      {loading ? (
        <div role="status" className="flex gap-3 overflow-hidden">
          <span className="sr-only">{t('식당을 찾고 있어요.', 'Finding restaurants…', 'جارٍ البحث عن المطاعم…')}</span>
          {[0, 1].map(id => <div key={id} className="h-[350px] w-[82%] shrink-0 animate-pulse rounded-[24px] bg-surface-subtle motion-reduce:animate-none" />)}
        </div>
      ) : error || !items.length ? (
        <div role={error ? 'alert' : 'status'} className="rounded-[24px] border border-border-warm bg-rice-white px-6 py-9 text-center">
          <Utensils className="mx-auto mb-3 size-6 text-brand-primary" aria-hidden="true" />
          <p className="text-sm font-bold">{error
            ? t('식당 목록을 불러오지 못했어요.', 'Could not load restaurants.', 'تعذر تحميل المطاعم.')
            : t('아직 이 동네의 식당을 준비 중이에요.', 'No restaurants in this neighborhood yet.', 'لا توجد مطاعم في هذا الحي بعد.')}</p>
          <p className="mt-2 text-xs text-text-secondary">{t('위에서 다른 동네도 살펴보세요.', 'Try another neighborhood above.', 'جرّب حياً آخر في الأعلى.')}</p>
          {error && onRetry && <button type="button" onClick={onRetry} className="mt-4 min-h-11 rounded-full bg-brand-primary px-5 text-sm font-bold text-white">{t('다시 불러오기', 'Try again', 'حاول مجدداً')}</button>}
        </div>
      ) : (
        <>
          <div ref={viewport} role="group" aria-label={t('식당 추천', 'Restaurant picks', 'مطاعم مقترحة')} className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-[24px] [scrollbar-width:none]" aria-roledescription={t('캐러셀', 'carousel', 'عارض شرائح')}>
              {items.map(item => <div key={item.id} className="min-w-0 flex-[0_0_84%] snap-start min-[480px]:flex-[0_0_72%]">
                <RestaurantPickCard item={item} language={language} areaName={areaName} onSelect={() => onSelect(item.id)} />
              </div>)}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <p className="max-w-[240px] text-[10px] leading-relaxed text-text-muted">
              {demo
                ? t('시연용 식당 · 사진은 메뉴·공간 참고 이미지입니다.', 'Demo restaurants · illustrative food and interior photos.', 'مطاعم تجريبية · صور توضيحية للطعام والأماكن.')
                : t('선택한 동네의 식당을 소개해요. 사진은 메뉴·공간 참고 이미지입니다.', 'Places in your chosen neighborhood. Photos illustrate food and interiors.', 'مطاعم في الحي المختار. الصور توضيحية للطعام والأماكن.')}
            </p>
            {items.length > 1 && <div className="flex shrink-0 gap-2">
              <button type="button" aria-label={t('이전 식당', 'Previous restaurant', 'المطعم السابق')} disabled={!canPrev} onClick={() => scroll('prev')} className="flex size-11 items-center justify-center rounded-full border border-border-warm bg-rice-white shadow-sm disabled:opacity-30"><ChevronLeft className="size-5 rtl:rotate-180" /></button>
              <button type="button" aria-label={t('다음 식당', 'Next restaurant', 'المطعم التالي')} disabled={!canNext} onClick={() => scroll('next')} className="flex size-11 items-center justify-center rounded-full border border-border-warm bg-rice-white shadow-sm disabled:opacity-30"><ChevronRight className="size-5 rtl:rotate-180" /></button>
            </div>}
          </div>
        </>
      )}
    </section>
  );
}

function RestaurantPickCard({ item, language, areaName, onSelect }: { item: RestaurantPick; language: Language; areaName: string; onSelect: () => void }) {
  const t = createTranslator(language);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.image]);
  return (
    <button type="button" onClick={onSelect} className="group relative block h-[360px] w-full overflow-hidden rounded-[24px] bg-soy-ink text-start text-white focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-brand-primary" aria-label={`${item.name} · ${t('지도에서 보기', 'View on map', 'عرض على الخريطة')}`}>
      {!failed && <img src={item.image} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />}
      {failed && <div className="absolute inset-0 flex items-center justify-center bg-brand-primary"><Utensils className="size-14 opacity-30" aria-hidden="true" /></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/10" />
      <span className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-sm"><MapPin className="size-3 shrink-0" aria-hidden="true" /><span className="truncate">{areaName}</span></span>
        <span className="shrink-0 text-[10px] text-white/85 [text-shadow:0_1px_4px_black]">{t('참고 사진', 'Illustrative photo', 'صورة توضيحية')}</span>
      </span>
      <span className="absolute inset-x-5 bottom-5">
        <span className="mb-2 block text-xs font-medium text-white/85">{item.category || t('동네에서 만나는 한 끼', 'A meal in the neighborhood', 'وجبة في الحي')}</span>
        <span className="line-clamp-3 break-words text-[25px] font-extrabold leading-[1.25] tracking-tight">{item.name}</span>
        {item.address && <span className="mt-2 block line-clamp-2 text-[11px] leading-relaxed text-white/75">{item.address}</span>}
        <span className="mt-5 flex items-center justify-between border-t border-white/25 pt-3 text-xs font-semibold">{t('지도에서 만나보기', 'Explore on the map', 'اكتشف على الخريطة')}<ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" /></span>
      </span>
    </button>
  );
}
