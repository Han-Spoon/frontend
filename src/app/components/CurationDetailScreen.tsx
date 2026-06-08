import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { Language } from '../App';
import { CURATION_ARTICLES, tagLabel } from '../constants/curation';

interface CurationDetailScreenProps {
  language: Language;
}

const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
};

const formatDate = (iso: string, language: Language) => {
  const locale = language === 'ko' ? 'ko-KR' : language === 'ar' ? 'ar' : 'en-US';
  try {
    return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
};

export function CurationDetailScreen({ language }: CurationDetailScreenProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const scrollRef = useRef<HTMLDivElement>(null);
  const article = CURATION_ARTICLES.find((a) => a.id === id);

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  // 다른 글로 이동 시 본문 상단으로 스크롤
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [id]);

  // 추천: 같은 태그 우선, 부족하면 다른 글로 채워 3개
  const recommended = useMemo(() => {
    if (!article) return [];
    const others = CURATION_ARTICLES.filter((a) => a.id !== article.id);
    const same = others.filter((a) => a.tag === article.tag);
    const rest = others.filter((a) => a.tag !== article.tag);
    return [...same, ...rest].slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!article) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="h-14 border-b border-neutral-200 flex items-center px-5 flex-shrink-0">
          <button onClick={() => navigate('/curation')} aria-label={t('뒤로', 'Back', 'رجوع')}>
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-neutral-500">{t('글을 찾을 수 없어요', 'Article not found', 'المقال غير موجود')}</p>
        </div>
      </div>
    );
  }

  const paragraphs = article.body[language].split('\n\n');

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center px-5 flex-shrink-0">
        <button onClick={() => navigate(-1)} aria-label={t('뒤로', 'Back', 'رجوع')}>
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-5 pt-6 pb-3">
          <span className="inline-block mb-3 px-2 py-0.5 rounded-full bg-neutral-100 text-[11px] font-medium text-neutral-600">
            {tagLabel(article.tag, language)}
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 leading-snug mb-2">{article.title[language]}</h1>
          <p className="text-xs text-neutral-400">{formatDate(article.date, language)}</p>
        </div>

        <div className="px-5">
          <div className={`relative h-56 rounded-xl overflow-hidden ${article.accent} flex items-center justify-center`}>
            <span className="text-6xl opacity-60">{article.emoji}</span>
            <img
              src={article.image}
              alt={article.title[language]}
              onError={hideOnError}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="px-5 py-6 space-y-4">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[15px] text-neutral-700 leading-relaxed">{para}</p>
          ))}
        </div>

        {/* 추천 큐레이션 */}
        {recommended.length > 0 && (
          <div className="px-5 pb-8 pt-2 border-t border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 mt-5 mb-3">
              {t('이런 글은 어때요?', 'You might also like', 'قد يعجبك أيضًا')}
            </h3>
            <div className="space-y-2">
              {recommended.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => navigate(`/curation/${rec.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 ${rec.accent} flex items-center justify-center`}>
                    <span className="text-2xl opacity-60">{rec.emoji}</span>
                    <img
                      src={rec.image}
                      alt=""
                      loading="lazy"
                      onError={hideOnError}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-medium text-neutral-400">{tagLabel(rec.tag, language)}</span>
                    <div className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2">{rec.title[language]}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
