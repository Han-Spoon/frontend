import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, User } from 'lucide-react';
import type { Language } from '../App';
import { BottomNav } from './BottomNav';
import { createTranslator, translateText } from '../locales';
import {
  CURATION_TAGS,
  FEED_ARTICLES,
  HERO_ARTICLES,
  tagLabel,
  type CurationTag,
} from '../constants/curation';

interface CurationScreenProps {
  language: Language;
  onMyPage: () => void;
}

const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
};

export function CurationScreen({ language, onMyPage }: CurationScreenProps) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<CurationTag | 'all'>('all');

  const t = createTranslator(language);

  // 읽을 시간을 충분히 주고, 모션 감소 설정에서는 자동 전환하지 않는다.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % HERO_ARTICLES.length), 6000);
    return () => clearTimeout(id);
  }, [index]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FEED_ARTICLES.filter(
      (a) =>
        (tag === 'all' || a.tag === tag) &&
        (q === '' || translateText(language, a.title).toLowerCase().includes(q)),
    );
  }, [query, tag, language]);

  return (
    <div className="h-dvh flex flex-col bg-rice-cream">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center justify-between px-5 flex-shrink-0">
        <span className="font-bold text-soy-ink">{t('큐레이션', 'Curation', 'مقالات')}</span>
        <button
          onClick={onMyPage}
          className="size-11 rounded-full bg-brand-green-50 flex items-center justify-center text-brand-green-700 hover:bg-brand-green-100 transition-colors"
          aria-label={t('마이페이지', 'My page', 'صفحتي')}
        >
          <User className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 히어로 캐러셀 (배경 사진, 3초 자동전환, 클릭 시 상세) */}
        <div className="px-5 pt-5">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border-warm shadow-[0_12px_32px_rgba(23,107,77,0.12)]" dir="ltr">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {HERO_ARTICLES.map((slide) => (
                <button
                  key={slide.id}
                  onClick={() => navigate(`/curation/${slide.id}`)}
                  className="w-full flex-shrink-0 text-left"
                >
                  <div className={`relative h-56 bg-gradient-to-br ${slide.gradient}`}>
                    <img
                      src={slide.image}
                      alt=""
                      loading="lazy"
                      onError={hideOnError}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/10" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-end pb-11 text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <span className="text-3xl mb-2 drop-shadow">{slide.emoji}</span>
                      <h2 className="text-white text-xl font-bold leading-snug mb-1 drop-shadow-sm">{translateText(language, slide.title)}</h2>
                      <p className="text-white/90 text-sm leading-snug drop-shadow-sm">{slide.subtitle ? translateText(language, slide.subtitle) : ''}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
              {HERO_ARTICLES.map((slide, i) => (
                <button
                  key={slide.id}
                  onClick={() => setIndex(i)}
                  className="flex size-8 items-center justify-center rounded-full"
                  aria-label={t(`슬라이드 ${i + 1}`, `Slide ${i + 1}`, `الشريحة ${i + 1}`)}
                  aria-current={i === index ? 'true' : undefined}
                >
                  <span className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="size-5 text-sesame-gray absolute start-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('제목으로 검색', 'Search by title', 'ابحث بالعنوان')}
              className="w-full h-13 ps-12 pe-4 rounded-2xl border border-border-warm bg-rice-white text-sm text-soy-ink shadow-sm focus:outline-none focus:border-brand-green-500 focus:ring-4 focus:ring-brand-green-500/10"
            />
          </div>
        </div>

        {/* 태그 필터 (줄바꿈, 가로 스크롤 없음) */}
        <div className="px-5 pt-3 pb-1 flex flex-wrap gap-1.5">
          {([{ key: 'all' as const, label: t('전체', 'All', 'الكل') }, ...CURATION_TAGS.map((x) => ({ key: x.key, label: translateText(language, x.label) }))]).map(
            (chip) => (
              <button
                key={chip.key}
                onClick={() => setTag(chip.key as CurationTag | 'all')}
                className={`min-h-9 px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  tag === chip.key
                    ? 'bg-brand-green-700 text-white border-brand-green-700'
                    : 'bg-rice-white text-sesame-gray border-border-warm hover:border-brand-green-500'
                }`}
              >
                {chip.label}
              </button>
            ),
          )}
        </div>

        {/* 피드 */}
        <div className="px-5 py-4">
          <div className="space-y-4">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/curation/${item.id}`)}
                className="block w-full text-start bg-rice-white rounded-[1.5rem] border border-border-warm overflow-hidden shadow-[0_8px_28px_rgba(54,61,57,0.06)] hover:border-brand-green-500 transition-colors"
              >
                <div className={`relative h-40 ${item.accent} flex items-center justify-center`}>
                  <span className="text-5xl opacity-60">{item.emoji}</span>
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    onError={hideOnError}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <span className="inline-block mb-2 px-2.5 py-1 rounded-full bg-brand-orange-100 text-[11px] font-bold text-accent-foreground">
                    {tagLabel(item.tag, language)}
                  </span>
                  <h4 className="text-base font-bold text-soy-ink leading-snug mb-1">{translateText(language, item.title)}</h4>
                  <p className="text-sm text-sesame-gray leading-relaxed">{translateText(language, item.excerpt)}</p>
                  <span className="mt-3 inline-flex items-center gap-0.5 text-xs font-bold text-brand-green-700">
                    {t('자세히 보기', 'Read more', 'اقرأ المزيد')}
                    <ChevronRight className="size-3.5 rtl:rotate-180" />
                  </span>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-sm text-sesame-gray py-10">
                {t('검색 결과가 없어요', 'No results', 'لا توجد نتائج')}
              </p>
            )}
          </div>
        </div>
      </div>

      <BottomNav language={language} />
    </div>
  );
}
