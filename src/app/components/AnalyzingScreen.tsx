import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Language, MenuAnalysis, PendingMenuImage } from '../App';

interface AnalyzingScreenProps {
  language: Language;
  image: PendingMenuImage | null;
  onComplete: (menus: MenuAnalysis[]) => void;
  onCancel: () => void;
}

export function AnalyzingScreen({ language, image, onComplete, onCancel }: AnalyzingScreenProps) {
  const [step, setStep] = useState(0);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const steps = [
    t('메뉴판 이미지를 읽고 있어요', 'Scanning menu image', 'جار قراءة صورة القائمة'),
    t('메뉴를 찾고 있어요', 'Finding menus', 'جار البحث عن الأطباق'),
    t('식단 정보를 확인하고 있어요', 'Checking diet info', 'جار التحقق من معلومات النظام الغذائي'),
    t('알레르기와 식단 조건을 비교하고 있어요', 'Comparing allergies and diet conditions', 'جار مقارنة الحساسية وشروط النظام الغذائي'),
  ];

  useEffect(() => {
    if (showManualInput) return;

    const timer = setInterval(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            const mockMenus: MenuAnalysis[] = [
              {
                id: '1',
                menuName: '비빔밥',
                menuNameEn: 'Bibimbap',
                menuNameAr: 'بيبيمباب',
                description: '밥 위에 나물, 고기, 고추장을 올린 한국 요리',
                descriptionEn: 'A Korean rice dish topped with seasoned vegetables, meat, and chili paste',
                descriptionAr: 'طبق أرز كوري يعلوه خضار متبلة ولحم ومعجون الفلفل الحار',
                price: '12,000원',
                riskLevel: 'safe',
                riskReasons: [],
                riskReasonsEn: [],
                riskReasonsAr: [],
                isSpicy: false,
                isAlcohol: false,
                image: 'https://sthanspoonprod.blob.core.windows.net/menu-images/비빔밥.png',
              },
              {
                id: '2',
                menuName: '김치찌개',
                menuNameEn: 'Kimchi Stew',
                menuNameAr: 'حساء الكيمتشي',
                description: '김치와 돼지고기를 넣고 끓인 매운 찌개',
                descriptionEn: 'A spicy stew made with kimchi and pork',
                descriptionAr: 'حساء حار مصنوع من الكيمتشي ولحم الخنزير',
                price: '10,000원',
                riskLevel: 'caution',
                riskReasons: ['매운 음식입니다', '돼지고기가 포함되어 있습니다'],
                riskReasonsEn: ['This is spicy', 'Contains pork'],
                riskReasonsAr: ['هذا الطبق حار', 'يحتوي على لحم الخنزير'],
                isSpicy: true,
                isAlcohol: false,
              },
              {
                id: '3',
                menuName: '해물파전',
                menuNameEn: 'Seafood Pancake',
                menuNameAr: 'فطيرة مأكولات بحرية',
                description: '해산물과 파를 넣어 부친 전',
                descriptionEn: 'A savory pancake with seafood and green onions',
                descriptionAr: 'فطيرة مالحة مع المأكولات البحرية والبصل الأخضر',
                price: '15,000원',
                riskLevel: 'danger',
                riskReasons: ['갑각류 알레르기 주의', '해산물이 포함되어 있습니다'],
                riskReasonsEn: ['Contains shellfish', 'Includes seafood'],
                riskReasonsAr: ['يحتوي على محار أو قشريات', 'يتضمن مأكولات بحرية'],
                isSpicy: false,
                isAlcohol: false,
              },
            ];
            onComplete(mockMenus);
          }, 500);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [showManualInput, onComplete, steps]);

  const handleManualAnalysis = () => {
    if (!manualInput.trim()) return;

    const menuNames = manualInput.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    const mockMenus: MenuAnalysis[] = menuNames.map((name, i) => ({
      id: String(i + 1),
      menuName: name,
      menuNameEn: name,
      menuNameAr: name,
      description: t('메뉴 정보를 찾고 있습니다', 'Looking up menu information', 'جار البحث عن معلومات الطبق'),
      descriptionEn: t('메뉴 정보를 찾고 있습니다', 'Looking up menu information', 'جار البحث عن معلومات الطبق'),
      descriptionAr: t('메뉴 정보를 찾고 있습니다', 'Looking up menu information', 'جار البحث عن معلومات الطبق'),
      riskLevel: 'safe',
      riskReasons: [],
      riskReasonsEn: [],
      riskReasonsAr: [],
      isSpicy: false,
      isAlcohol: false,
    }));

    onComplete(mockMenus);
  };

  if (showManualInput) {
    return (
      <div className="h-screen flex flex-col bg-white">
        <div className="h-14 border-b border-neutral-200 flex items-center justify-center px-5 relative flex-shrink-0">
          <h1 className="font-semibold text-neutral-900">{t('메뉴를 찾지 못했어요', 'Cannot find menu', 'تعذر العثور على الأطباق')}</h1>
        </div>

        <div className="flex-1 flex flex-col px-5 py-6">
          <p className="text-sm text-neutral-600 mb-4">{t('사진에서 메뉴명을 정확히 읽지 못했어요', 'Could not read the menu text from the photo', 'تعذر قراءة أسماء الأطباق من الصورة بدقة')}</p>

          <textarea
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={t(
              '메뉴명을 줄바꿈 또는 쉼표로 구분하여 입력해주세요\n예: 비빔밥, 김치찌개, 불고기',
              'Enter menu names separated by line breaks or commas\nExample: Bibimbap, Kimchi Stew, Bulgogi',
              'أدخل أسماء الأطباق مفصولة بأسطر جديدة أو فواصل\nمثال: بيبيمباب، حساء الكيمتشي، بولغوغي'
            )}
            className="w-full h-40 p-4 border border-neutral-300 rounded-xl resize-none focus:outline-none focus:border-neutral-500 text-sm"
          />

          <button
            onClick={onCancel}
            className="mt-4 w-full h-12 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {t('다시 시도하기', 'Retry', 'إعادة المحاولة')}
          </button>
        </div>

        <div className="border-t border-neutral-200 px-5 py-4 flex-shrink-0">
          <button
            onClick={handleManualAnalysis}
            className="w-full h-14 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
            disabled={!manualInput.trim()}
          >
            {t('입력한 메뉴로 분석하기', 'Analyze entered menus', 'تحليل الأطباق المدخلة')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center justify-center px-5 relative flex-shrink-0">
        <h1 className="font-semibold text-neutral-900">{t('메뉴판 분석 중', 'Analyzing menu', 'جار تحليل القائمة')}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-xs aspect-[4/3] bg-neutral-100 rounded-2xl mb-8 overflow-hidden">
          {image ? (
            <img src={image.previewUrl} alt={t('분석 중인 메뉴판', 'Menu being analyzed', 'القائمة قيد التحليل')} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <span className="text-6xl">📋</span>
            </div>
          )}
        </div>

        <div className="w-full max-w-xs">
          <div className="mb-6">
            <Loader2 className="w-10 h-10 text-neutral-900 animate-spin mx-auto mb-4" />
            <p className="text-center text-base font-medium text-neutral-900">{steps[step]}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i <= step ? 'w-8 bg-neutral-900' : 'w-1 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 px-5 py-4 flex-shrink-0">
        <button
          onClick={onCancel}
          className="w-full h-12 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          {t('취소', 'Cancel', 'إلغاء')}
        </button>
      </div>
    </div>
  );
}
