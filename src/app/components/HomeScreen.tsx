import { Camera, ImageIcon, User } from 'lucide-react';
import type { Language } from '../App';
import logo from '../../icons/logo.png';

interface HomeScreenProps {
  language: Language;
  onScan: (image: string) => void;
  onHistory: (item: any) => void;
  onMyPage: () => void;
  history: any[];
}

export function HomeScreen({ language, onScan, onHistory, onMyPage, history }: HomeScreenProps) {
  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);

  const handleCameraClick = () => {
    onScan('camera-image');
  };

  const handleGalleryClick = () => {
    onScan('gallery-image');
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center justify-between px-5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            <img src={logo} alt="한스푼 로고" className="w-6 h-6 object-contain" />
          </span>
          <span className="font-semibold">{t('한 스푼', 'Han Spoon')}</span>
        </div>
        <button
          onClick={onMyPage}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <User className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">{t('메뉴판을 찍으면', 'Scan a menu')}</h2>
          <p className="text-sm text-neutral-600">{t('먹을 수 있는 메뉴를 알려드려요', 'We tell you what is safe to eat')}</p>
        </div>

        <button
          onClick={handleCameraClick}
          className="w-full h-48 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center gap-3 mb-4 hover:bg-neutral-100 hover:border-neutral-400 transition-colors"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Camera className="w-7 h-7 text-neutral-700" />
          </div>
          <span className="text-base font-medium text-neutral-900">{t('메뉴판 스캔하기', 'Scan the menu')}</span>
        </button>

        <button
          onClick={handleGalleryClick}
          className="w-full h-12 bg-white border border-neutral-300 rounded-xl flex items-center justify-center gap-2 mb-8 hover:bg-neutral-50 transition-colors"
        >
          <ImageIcon className="w-5 h-5 text-neutral-600" />
          <span className="text-sm text-neutral-700">{t('사진에서 선택하기', 'Choose from photos')}</span>
        </button>

        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-900 mb-3">{t('최근 분석 기록', 'Recent analysis')}</h3>
            <div className="space-y-2">
              {history.slice(0, 3).map((item, index) => (
                <button
                  key={index}
                  onClick={() => onHistory(item)}
                  className="w-full p-4 bg-neutral-50 rounded-xl flex items-center justify-between hover:bg-neutral-100 transition-colors"
                >
                  <div className="text-left">
                    <div className="text-sm font-medium text-neutral-900">{item.title}</div>
                    <div className="text-xs text-neutral-600 mt-1">
                      {language === 'ko'
                        ? `메뉴 ${item.menuCount}개 분석`
                        : `Analyzed ${item.menuCount} items`}
                    </div>
                  </div>
                  <div className="text-xs text-neutral-500">→</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-500">{t('손글씨 메뉴판은 인식이 어려울 수 있어요', 'Handwritten menus may be hard to recognize')}</p>
        </div>
      </div>
    </div>
  );
}
