import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { CurationArticle } from '../../constants/curation';
import type { Language } from '../../App';
import { createTranslator } from '../../locales';

export function StoryImage({ article, language, className }: { article: CurationArticle; language: Language; className: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [article.image]);
  const t = createTranslator(language);
  if (failed) return <div className={className + ' flex flex-col items-center justify-center gap-2 bg-[#355141] text-white/70'}><ImageOff className="size-6" /><span className="text-xs">{t('사진을 불러오지 못했어요', 'Image unavailable', 'الصورة غير متاحة')}</span></div>;
  return <img src={article.image} alt="" loading="lazy" onError={() => setFailed(true)} style={{ objectPosition: article.imagePosition ?? 'center' }} className={className} />;
}
