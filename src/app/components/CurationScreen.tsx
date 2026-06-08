import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Search, User } from 'lucide-react';
import type { Language } from '../App';
import { BottomNav } from './BottomNav';
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

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  // 3초마다 자동 전환 (index 변경 시 타이머 리셋)
  useEffect(() => {
    const id = setTimeout(() => setIndex((i) => (i + 1) % HERO_ARTICLES.length), 3000);
    return () => clearTimeout(id);
  }, [index]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FEED_ARTICLES.filter(
      (a) =>
        (tag === 'all' || a.tag === tag) &&
        (q === '' || a.title[language].toLowerCase().includes(q)),
    );
  }, [query, tag, language]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <div className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-5 flex-shrink-0">
        <span className="font-semibold text-neutral-900">{t('큐레이션', 'Curation', 'مقالات')}</span>
        <button
          onClick={onMyPage}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <User className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 히어로 캐러셀 (배경 사진, 3초 자동전환, 클릭 시 상세) */}
        <div className="px-5 pt-5">
          <div className="relative overflow-hidden rounded-2xl">
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
                    <div className="absolute inset-0 p-5 flex flex-col justify-end pb-11">
                      <span className="text-3xl mb-2 drop-shadow">{slide.emoji}</span>
                      <h2 className="text-white text-xl font-bold leading-snug mb-1 drop-shadow-sm">{slide.title[language]}</h2>
                      <p className="text-white/90 text-sm leading-snug drop-shadow-sm">{slide.subtitle?.[language]}</p>
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
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 검색 */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('제목으로 검색', 'Search by title', 'ابحث بالعنوان')}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:border-neutral-400"
            />
          </div>
        </div>

        {/* 태그 필터 (줄바꿈, 가로 스크롤 없음) */}
        <div className="px-5 pt-3 pb-1 flex flex-wrap gap-1.5">
          {([{ key: 'all' as const, label: t('전체', 'All', 'الكل') }, ...CURATION_TAGS.map((x) => ({ key: x.key, label: x.label[language] }))]).map(
            (chip) => (
              <button
                key={chip.key}
                onClick={() => setTag(chip.key as CurationTag | 'all')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  tag === chip.key
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
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
                className="block w-full text-left bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:border-neutral-300 transition-colors"
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
                  <span className="inline-block mb-2 px-2 py-0.5 rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600">
                    {tagLabel(item.tag, language)}
                  </span>
                  <h4 className="text-base font-semibold text-neutral-900 leading-snug mb-1">{item.title[language]}</h4>
                  <p className="text-sm text-neutral-500 leading-snug">{item.excerpt[language]}</p>
                  <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-medium text-neutral-400">
                    {t('자세히 보기', 'Read more', 'اقرأ المزيد')}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <p className="text-center text-sm text-neutral-400 py-10">
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
