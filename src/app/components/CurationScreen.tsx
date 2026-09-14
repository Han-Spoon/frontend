import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search, User, Clock3 } from 'lucide-react';
import type { Language } from '../App';
import { BottomNav } from './BottomNav';
import { createTranslator, translateText } from '../locales';
import { CURATION_TAGS, CURATION_ARTICLES, tagLabel, type CurationTag } from '../constants/curation';
import { StoryImage } from './curation/StoryImage';

export function CurationScreen({ language, onMyPage }: { language: Language; onMyPage: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<CurationTag | 'all'>('all');
  const t = createTranslator(language);
  const filtered = useMemo(() => CURATION_ARTICLES.filter(a => (tag === 'all' || a.tag === tag) && (translateText(language, a.title) + ' ' + translateText(language, a.excerpt)).toLowerCase().includes(query.trim().toLowerCase())), [query, tag, language]);
  return <div className="flex h-dvh flex-col bg-[#13231c] text-rice-white">
    <header className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5"><div><p className="text-[10px] font-bold tracking-[.23em] text-[#afd1bf]">HAN SPOON JOURNAL</p><h1 className="mt-2 text-[30px] font-extrabold tracking-tight">{t('한 입 더, 한국', 'A taste of Korea', 'مذاق كوريا')}</h1></div><button onClick={onMyPage} aria-label={t('마이페이지', 'My page', 'صفحتي')} className="flex size-11 items-center justify-center rounded-full border border-white/15 bg-white/5"><User className="size-5" /></button></header>
    <main className="flex-1 overflow-y-auto px-5 pb-8">
      <p className="mb-5 max-w-[290px] text-sm leading-6 text-white/65">{t('식탁의 이야기부터 여행의 작은 요령까지.', 'Stories from the table. Little discoveries for the journey.', 'قصص من المائدة واكتشافات صغيرة للرحلة.')}</p>
      <label className="flex h-12 items-center gap-3 rounded-full border border-white/10 bg-white/[.07] px-4"><Search className="size-4 shrink-0 text-white/60" /><input aria-label={t('큐레이션 검색', 'Search stories', 'البحث في المقالات')} value={query} onChange={e => setQuery(e.target.value)} placeholder={t('어떤 이야기가 궁금하세요?', 'What would you like to discover?', 'ماذا تود أن تكتشف؟')} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/45" /></label>
      <div className="-mx-5 my-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">{[{ key: 'all', label: t('전체', 'All', 'الكل') }, ...CURATION_TAGS.map(item => ({ key: item.key, label: translateText(language, item.label) }))].map(item => <button key={item.key} aria-pressed={tag === item.key} onClick={() => setTag(item.key as CurationTag | 'all')} className={'min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ' + (tag === item.key ? 'bg-rice-white text-soy-ink' : 'border border-white/10 bg-white/5 text-white/70')}>{item.label}</button>)}</div>
      <div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-[.15em] text-white/50"><span>{query || tag !== 'all' ? t('찾은 이야기', 'Your selection', 'اختياراتك') : 'THE EDITOR’S COLLECTION'}</span><span>{filtered.length} {t('편', 'stories', 'مقالة')}</span></div>
      <div className="space-y-5">{filtered.map((article, index) => <button key={article.id} onClick={() => navigate('/curation/' + article.id)} className="group relative block w-full overflow-hidden rounded-[28px] bg-[#26382d] text-start shadow-[0_14px_36px_rgba(0,0,0,.16)]">
        <div className={'relative ' + (index === 0 ? 'h-[400px]' : 'h-[350px]')}><StoryImage article={article} language={language} className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" /><div className="absolute inset-0 bg-gradient-to-t from-[#0d1c14] via-[#0d1c14]/15 to-black/5" />
          <span className="absolute start-4 top-4 rounded-full border border-white/20 bg-black/25 px-3 py-2 text-[10px] font-bold backdrop-blur-md">{tagLabel(article.tag, language)}</span>
          <span className="absolute end-4 top-4 flex size-9 items-center justify-center rounded-full bg-rice-white text-soy-ink"><ArrowUpRight className="size-4 rtl:-rotate-90" /></span>
          <div className="absolute inset-x-0 bottom-0 p-5"><p className="mb-2 text-[9px] tracking-[.18em] text-[#c4d8bc]">HAN SPOON · {String(index + 1).padStart(2, '0')}</p><h2 className="text-[27px] font-extrabold leading-[1.2] tracking-[-.035em] text-white">{translateText(language, article.title)}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-white/75">{translateText(language, article.excerpt)}</p><p className="mt-4 flex items-center gap-1.5 text-[10px] text-white/55"><Clock3 className="size-3" />{t('잠깐의 읽을거리', 'A short read', 'قراءة قصيرة')}</p></div>
        </div>
      </button>)}</div>
      {filtered.length === 0 && <div className="py-16 text-center"><p className="text-sm text-white/70">{t('검색 결과가 없어요', 'No results', 'لا توجد نتائج')}</p><button onClick={() => { setQuery(''); setTag('all'); }} className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-bold text-soy-ink">{t('전체 보기', 'See all', 'عرض الكل')}</button></div>}
    </main><BottomNav language={language} />
  </div>;
}
