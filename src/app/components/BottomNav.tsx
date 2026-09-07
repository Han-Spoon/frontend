import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Camera, MessageSquareHeart } from 'lucide-react';
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
        <button onClick={() => navigate('/curation')} className={sideItemClass(active === 'curation')}>
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-semibold">{t('큐레이션', 'Curation', 'مقالات')}</span>
        </button>

        <button onClick={() => navigate('/home')} className="flex-1 flex justify-center" aria-label={t('촬영', 'Scan', 'مسح')}>
          <div className="-mt-9 w-16 h-16 rounded-[22px] bg-brand-green-700 flex items-center justify-center shadow-[0_12px_26px_rgba(23,107,77,0.28)] ring-[5px] ring-rice-white hover:bg-brand-green-900 transition-colors rotate-[-3deg]">
            <Camera className="w-7 h-7 text-white rotate-[3deg]" />
          </div>
        </button>

        <button onClick={() => navigate('/cards')} className={sideItemClass(active === 'cards')}>
          <MessageSquareHeart className="w-5 h-5" />
          <span className="text-xs font-semibold">{t('카드', 'Cards', 'بطاقات')}</span>
        </button>
      </div>
    </div>
  );
}
