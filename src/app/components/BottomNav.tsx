import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Camera, MessageSquareHeart } from 'lucide-react';
import type { Language } from '../App';

interface BottomNavProps {
  language: Language;
}

export function BottomNav({ language }: BottomNavProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const active = pathname.startsWith('/curation')
    ? 'curation'
    : pathname.startsWith('/cards')
      ? 'cards'
      : 'home';

  const sideItemClass = (isActive: boolean) =>
    `flex flex-col items-center gap-1 flex-1 transition-colors ${
      isActive ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
    }`;

  return (
    <div className="relative flex-shrink-0 h-16 border-t border-neutral-200 bg-white">
      <div className="flex items-center justify-around h-full px-4">
        <button onClick={() => navigate('/curation')} className={sideItemClass(active === 'curation')}>
          <BookOpen className="w-5 h-5" />
          <span className="text-[11px] font-medium">{t('큐레이션', 'Curation', 'مقالات')}</span>
        </button>

        <button onClick={() => navigate('/home')} className="flex-1 flex justify-center" aria-label={t('촬영', 'Scan', 'مسح')}>
          <div className="-mt-8 w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center shadow-lg ring-4 ring-white hover:bg-neutral-800 transition-colors">
            <Camera className="w-7 h-7 text-white" />
          </div>
        </button>

        <button onClick={() => navigate('/cards')} className={sideItemClass(active === 'cards')}>
          <MessageSquareHeart className="w-5 h-5" />
          <span className="text-[11px] font-medium">{t('카드', 'Cards', 'بطاقات')}</span>
        </button>
      </div>
    </div>
  );
}
