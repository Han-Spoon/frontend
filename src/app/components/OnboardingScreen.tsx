import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Language, UserProfile } from '../App';

interface OnboardingScreenProps {
  language: Language;
  initialProfile?: UserProfile;
  onComplete: (profile: UserProfile) => void;
  onSkip: () => void;
}

export function OnboardingScreen({ language, initialProfile, onComplete, onSkip }: OnboardingScreenProps) {
  const [isFirstTime, setIsFirstTime] = useState(initialProfile?.isFirstTime ?? false);
  const [noSpicy, setNoSpicy] = useState(initialProfile?.noSpicy ?? false);
  const [isVegan, setIsVegan] = useState(initialProfile?.isVegan ?? false);
  const [veganType, setVeganType] = useState(initialProfile?.veganType ?? '');
  const [hasReligion, setHasReligion] = useState(initialProfile?.hasReligion ?? false);
  const [religionType, setReligionType] = useState(initialProfile?.religionType ?? '');
  const [hasAllergies, setHasAllergies] = useState(initialProfile?.hasAllergies ?? false);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(initialProfile?.allergies?.filter((item): item is string => typeof item === 'string') ?? []);
  const [noAlcohol, setNoAlcohol] = useState(initialProfile?.noAlcohol ?? false);

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const veganOptionLabels = [
    { value: '비건', label: t('비건', 'Vegan', 'نباتي صارم') },
    { value: '락토', label: t('락토', 'Lacto', 'لاكتو') },
    { value: '오보', label: t('오보', 'Ovo', 'أوفو') },
    { value: '락토오보', label: t('락토오보', 'Lacto-Ovo', 'لاكتو أوفو') },
    { value: '페스코', label: t('페스코', 'Pesco', 'بيسكو') },
  ];

  const religionOptionLabels = [
    { value: '할랄', label: t('할랄', 'Halal', 'حلال') },
    { value: '코셔', label: t('코셔', 'Kosher', 'كوشير') },
    { value: '힌두', label: t('힌두', 'Hindu', 'هندوسي') },
    { value: '기타', label: t('기타', 'Other', 'أخرى') },
  ];

  const allergyOptionLabels = [
    { value: '갑각류', label: t('갑각류', 'Shellfish', 'محار وقشريات') },
    { value: '견과류', label: t('견과류', 'Nuts', 'مكسرات') },
    { value: '유제품', label: t('유제품', 'Dairy', 'منتجات الألبان') },
    { value: '계란', label: t('계란', 'Eggs', 'بيض') },
    { value: '글루텐', label: t('글루텐', 'Gluten', 'غلوتين') },
    { value: '대두', label: t('대두', 'Soy', 'صويا') },
  ];

  const handleSave = () => {
    onComplete({
      isFirstTime,
      isVegan,
      veganType: isVegan ? veganType : undefined,
      hasReligion,
      religionType: hasReligion ? religionType : undefined,
      hasAllergies,
      allergies: hasAllergies ? selectedAllergies : [],
      noSpicy,
      noAlcohol,
    });
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center justify-center px-5 relative flex-shrink-0">
        <h1 className="font-semibold text-neutral-900">{t('식단 프로필 설정', 'Diet profile settings', 'إعدادات الملف الغذائي')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <h2 className="text-lg font-semibold mb-6">{t('한국 음식, 어떻게 즐기고 싶으세요?', 'How would you like to enjoy Korean food?', 'كيف ترغب في الاستمتاع بالطعام الكوري؟')}</h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={isFirstTime}
              onChange={(e) => setIsFirstTime(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-900">{t('한국 음식 처음', 'New to Korean food', 'أول مرة مع الطعام الكوري')}</span>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={noSpicy}
              onChange={(e) => setNoSpicy(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-900">{t('매운 음식 비선호', 'Avoid spicy food', 'تجنب الطعام الحار')}</span>
          </label>

          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={isVegan}
              onChange={(e) => setIsVegan(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-900">{t('채식·비건', 'Vegetarian/Vegan', 'نباتي/نباتي صارم')}</span>
          </label>

          {isVegan && (
            <div className="ml-8 space-y-2 pb-2">
              {veganOptionLabels.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="veganType"
                    checked={veganType === option.value}
                    onChange={() => setVeganType(option.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-neutral-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={hasReligion}
              onChange={(e) => setHasReligion(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-900">{t('종교 식단', 'Religious diet', 'نظام غذائي ديني')}</span>
          </label>

          {hasReligion && (
            <div className="ml-8 space-y-2 pb-2">
              {religionOptionLabels.map((option) => (
                <label key={option.value} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="religionType"
                    checked={religionType === option.value}
                    onChange={() => setReligionType(option.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-neutral-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={hasAllergies}
              onChange={(e) => setHasAllergies(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-900">{t('음식 알레르기', 'Food allergies', 'حساسية الطعام')}</span>
          </label>

          {hasAllergies && (
            <div className="ml-8 flex flex-wrap gap-2 pb-2">
              {allergyOptionLabels.map((allergy) => (
                <button
                  key={allergy.value}
                  onClick={() => toggleAllergy(allergy.value)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    selectedAllergies.includes(allergy.value)
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  {allergy.label}
                </button>
              ))}
            </div>
          )}

          <label className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-50">
            <input
              type="checkbox"
              checked={noAlcohol}
              onChange={(e) => setNoAlcohol(e.target.checked)}
              className="w-5 h-5 rounded border-neutral-300"
            />
            <span className="text-sm text-neutral-900">{t('금주', 'No alcohol', 'بدون كحول')}</span>
          </label>
        </div>
      </div>

      <div className="border-t border-neutral-200 px-5 py-4 space-y-3 flex-shrink-0">
        <button
          onClick={handleSave}
          className="w-full h-14 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors"
        >
          {t('저장하고 시작하기', 'Save and start', 'حفظ والبدء')}
        </button>
        <button
          onClick={onSkip}
          className="w-full text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          {t('건너뛰기', 'Skip', 'تخطي')}
        </button>
      </div>
    </div>
  );
}
