import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { Language } from '../App';
import { CURATION_ARTICLES, tagLabel } from '../constants/curation';
import { createTranslator, LANGUAGE_LOCALES, translateText } from '../locales';
import { CURATION_BODY_DRAFTS } from '../constants/curationBodyDrafts';

interface CurationDetailScreenProps {
  language: Language;
}

const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.style.display = 'none';
};

const formatDate = (iso: string, language: Language) => {
  const locale = LANGUAGE_LOCALES[language];
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

  const t = createTranslator(language);

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
      <div className="h-dvh flex flex-col bg-rice-cream">
        <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center px-4 flex-shrink-0">
          <button onClick={() => navigate('/curation')} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-brand-green-50" aria-label={t('뒤로', 'Back', 'رجوع')}>
            <ArrowLeft className="size-5 text-soy-ink rtl:rotate-180" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-sesame-gray">{t('글을 찾을 수 없어요', 'Article not found', 'المقال غير موجود')}</p>
        </div>
      </div>
    );
  }

  const body = language === 'ko' || language === 'en' || language === 'ar'
    ? translateText(language, article.body)
    : CURATION_BODY_DRAFTS[article.id]?.[language] ?? translateText(language, article.body);
  const paragraphs = body.split('\n\n');

  return (
    <div className="h-dvh flex flex-col bg-rice-cream">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center px-4 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-brand-green-50" aria-label={t('뒤로', 'Back', 'رجوع')}>
          <ArrowLeft className="size-5 text-soy-ink rtl:rotate-180" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-5 pt-6 pb-3">
          <span className="inline-block mb-3 px-2.5 py-1 rounded-full bg-brand-orange-100 text-[11px] font-bold text-accent-foreground">
            {tagLabel(article.tag, language)}
          </span>
          <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-soy-ink leading-snug mb-2">{translateText(language, article.title)}</h1>
          <p className="text-xs text-sesame-gray">{formatDate(article.date, language)}</p>
        </div>

        <div className="px-5">
          <div className={`relative h-56 rounded-[1.5rem] border border-border-warm shadow-[0_10px_30px_rgba(54,61,57,0.08)] overflow-hidden ${article.accent} flex items-center justify-center`}>
            <span className="text-6xl opacity-60">{article.emoji}</span>
            <img
              src={article.image}
              alt={translateText(language, article.title)}
              onError={hideOnError}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="px-5 py-6 space-y-4">
          {paragraphs.map((para, i) => (
            <p key={i} className="text-[15px] text-soy-ink/85 leading-[1.85]">{para}</p>
          ))}
        </div>

        {/* 추천 큐레이션 */}
        {recommended.length > 0 && (
          <div className="px-5 pb-8 pt-2 border-t border-border-warm">
            <h3 className="text-sm font-bold text-soy-ink mt-5 mb-3">
              {t('이런 글은 어때요?', 'You might also like', 'قد يعجبك أيضًا')}
            </h3>
            <div className="space-y-2">
              {recommended.map((rec) => (
                <button
                  key={rec.id}
                  onClick={() => navigate(`/curation/${rec.id}`)}
                  className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-brand-green-50 transition-colors text-start"
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
                    <span className="text-[11px] font-semibold text-brand-green-700">{tagLabel(rec.tag, language)}</span>
                    <div className="text-sm font-bold text-soy-ink leading-snug line-clamp-2">{translateText(language, rec.title)}</div>
                  </div>
                  <ChevronRight className="size-4 text-sesame-gray flex-shrink-0 rtl:rotate-180" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
