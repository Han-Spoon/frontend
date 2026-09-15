import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import type { Language } from '../App';
import { CURATION_ARTICLES, tagLabel } from '../constants/curation';
import { createTranslator, LANGUAGE_LOCALES, translateText } from '../locales';
import { StoryImage } from './curation/StoryImage';
import { CURATION_BODY_DRAFTS } from '../constants/curationBodyDrafts';

interface CurationDetailScreenProps {
  language: Language;
}

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
    <div className="flex h-dvh flex-col bg-[#13231c] text-rice-white">
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="relative h-[440px]">
          <StoryImage article={article} language={language} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13231c] via-transparent to-black/15" />
          <button onClick={() => navigate('/curation')} className="absolute start-5 top-5 flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md" aria-label={t('뒤로', 'Back', 'رجوع')}><ArrowLeft className="size-5 rtl:rotate-180" /></button>
          <div className="absolute inset-x-0 bottom-0 px-6 pb-4">
            <span className="mb-4 inline-block rounded-full bg-rice-white px-3 py-2 text-[10px] font-bold text-soy-ink">{tagLabel(article.tag, language)}</span>
            <h1 className="text-[34px] font-extrabold leading-[1.15] tracking-[-.04em]">{translateText(language, article.title)}</h1>
          </div>
        </div>
        <div className="px-6">
          <p className="mt-2 text-base leading-7 text-white/70">{translateText(language, article.excerpt)}</p>
          <p className="mt-5 border-b border-white/10 pb-5 text-[10px] tracking-wide text-[#afd1bf]">{t('HAN SPOON 에디토리얼', 'HAN SPOON EDITORIAL', 'افتتاحية HAN SPOON')} · {formatDate(article.date, language)}</p>
          <article className="space-y-6 py-7">{paragraphs.map((para, i) => <p key={i} className="text-[15px] leading-[1.95] text-white/85">{para}</p>)}</article>
          <p className="mb-6 text-[10px] leading-5 text-white/40">{t('사진은 글의 이해를 돕는 참고 이미지입니다.', 'Images illustrate the story.', 'الصور توضيحية للمقال.')}</p>
        </div>
        <section className="border-t border-white/10 px-5 pb-8 pt-6">
          <p className="text-[10px] tracking-[.2em] text-[#afd1bf]">{t('계속 둘러보기', 'Keep exploring', 'واصل الاستكشاف')}</p>
          <h2 className="mb-5 mt-2 text-xl font-bold">{t('다음 한 입의 이야기', 'Your next discovery', 'اكتشافك التالي')}</h2>
          <div className="space-y-3">{recommended.map(rec => <button key={rec.id} onClick={() => navigate('/curation/' + rec.id)} className="flex w-full items-center gap-4 rounded-[22px] bg-white/5 p-3 text-start">
            <StoryImage article={rec} language={language} className="size-20 shrink-0 rounded-2xl object-cover" />
            <span className="min-w-0 flex-1"><span className="text-[10px] text-[#afd1bf]">{tagLabel(rec.tag, language)}</span><span className="mt-1 block text-sm font-bold leading-6">{translateText(language, rec.title)}</span></span><ArrowUpRight className="size-4 shrink-0 rtl:-rotate-90" />
          </button>)}</div>
        </section>
      </div>
    </div>
  );
}
