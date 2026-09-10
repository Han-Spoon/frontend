import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HistoryItem, Language } from '../App';
import { createTranslator } from '../locales';
import { ScanHistoryList } from './ScanHistoryList';
import { BottomNav } from './BottomNav';

export function ScanHistoryScreen({
  language,
  history,
  onOpen,
  onDelete,
  onRename,
}: {
  language: Language;
  history: HistoryItem[];
  onOpen: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const t = createTranslator(language);
  const navigate = useNavigate();
  return (
    <div className="flex h-dvh flex-col bg-rice-cream">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-warm bg-rice-white px-3">
        <button
          onClick={() => navigate('/home')}
          aria-label={t('뒤로', 'Back', 'رجوع')}
          className="flex size-11 items-center justify-center"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <h1 className="font-extrabold">
          {t('스캔 기록', 'Scan journal', 'سجل المسح')}
        </h1>
      </header>
      <main className="flex-1 overflow-y-auto p-5">
        <p className="mb-5 text-sm leading-6 text-text-secondary">
          {t(
            '여행의 맛을 모아두세요. 식당을 연결한 기록과 메뉴 스캔을 모두 볼 수 있어요.',
            'Keep the flavors of your trip. Restaurant visits and menu scans, together.',
            'احتفظ بنكهات رحلتك. زيارات المطاعم ومسح القوائم في مكان واحد.',
          )}
        </p>
        <ScanHistoryList
          language={language}
          history={history}
          onOpen={onOpen}
          onDelete={onDelete}
          onRename={onRename}
        />
        {history.length === 0 && (
          <div className="py-14 text-center">
            <BookOpen className="mx-auto mb-4 size-10 text-brand-primary" />
            <p className="text-sm text-text-secondary">
              {t(
                '첫 번째 메뉴를 기록해 보세요.',
                'Save your first menu.',
                'احفظ قائمتك الأولى.',
              )}
            </p>
            <button
              onClick={() => navigate('/scan')}
              className="mt-5 rounded-xl bg-brand-primary px-5 py-3 font-bold text-white"
            >
              {t('메뉴 스캔하기', 'Scan a menu', 'امسح قائمة')}
            </button>
          </div>
        )}
      </main>
      <BottomNav language={language} />
    </div>
  );
}
