import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Camera, MessageSquareHeart, Home, History } from 'lucide-react';
import type { Language } from '../App';
import { createTranslator } from '../locales';

interface BottomNavProps {
  language: Language;
}

export function BottomNav({ language }: BottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const t = createTranslator(language);

  const active = pathname.startsWith('/curation')
    ? 'curation'
    : pathname.startsWith('/cards')
      ? 'cards'
      : 'home';

  const sideItemClass = (isActive: boolean) =>
    `flex min-h-11 flex-col items-center justify-center gap-1 flex-1 transition-colors ${
      isActive ? 'text-brand-green-700' : 'text-sesame-gray hover:text-brand-green-500'
    }`;

  return (
    <div className="relative flex-shrink-0 h-[72px] border-t border-border-warm bg-rice-white">
      <div className="flex items-center justify-around h-full px-4 pb-[env(safe-area-inset-bottom)]">
        <button onClick={() => navigate('/home')} className={sideItemClass(pathname === '/home')}><Home className="size-5" /><span className="text-xs font-semibold">{t('홈', 'Home', 'الرئيسية')}</span></button>
        <button onClick={() => navigate('/curation')} className={sideItemClass(active === 'curation')}>
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold">{t('큐레이션', 'Curation', 'مقالات')}</span>
        </button>

        <button onClick={() => navigate('/scan')} className="flex flex-1 flex-col items-center justify-center gap-1 text-brand-primary" aria-label={t('촬영', 'Scan', 'مسح')}>
          <div className="flex size-10 items-center justify-center rounded-[14px] bg-brand-green-700 text-white shadow-sm"><Camera className="size-5" /></div>
          <span className="text-[10px] font-bold">{t('촬영', 'Scan', 'مسح')}</span>
        </button>
        <button onClick={() => navigate('/history')} className={sideItemClass(pathname === '/history')}><History className="size-5" /><span className="text-xs font-semibold">{t('기록', 'Journal', 'السجل')}</span></button>

        <button onClick={() => navigate('/cards')} className={sideItemClass(active === 'cards')}>
          <MessageSquareHeart className="w-5 h-5" />
          <span className="text-xs font-semibold">{t('카드', 'Cards', 'بطاقات')}</span>
        </button>
      </div>
    </div>
  );
}
