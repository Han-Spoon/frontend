import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import type { Language, UserProfile } from '../App';
import {
  ALLERGY_OPTIONS,
  COUNTRY_CODES,
  RELIGION_OPTIONS,
  VEGETARIAN_OPTIONS,
  getCountryFlag,
  getCountryName,
} from '../constants/onboarding';

interface OnboardingScreenProps {
  language: Language;
  setLanguage: (language: Language) => void;
  initialProfile?: UserProfile;
  onComplete: (profile: UserProfile) => Promise<void> | void;
}

const TOTAL_STEPS = 3;

type EditSection = 'language' | 'country' | 'diet';
const SECTION_TO_STEP: Record<EditSection, number> = { language: 1, country: 2, diet: 3 };

export function OnboardingScreen({ language, setLanguage, initialProfile, onComplete }: OnboardingScreenProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // 마이페이지에서 단위 수정으로 진입하면 해당 섹션만 노출한다.
  const editSection = (location.state as { editSection?: EditSection } | null)?.editSection;
  const editMode = !!editSection;

  const [step, setStep] = useState(editMode ? SECTION_TO_STEP[editSection!] : 1);

  const [nationality, setNationality] = useState(initialProfile?.nationality ?? '');
  const [countrySearch, setCountrySearch] = useState('');

  const [isFirstTime, setIsFirstTime] = useState(initialProfile?.isFirstTime ?? false);
  const [noSpicy, setNoSpicy] = useState(initialProfile?.noSpicy ?? false);
  const [isVegan, setIsVegan] = useState(initialProfile?.isVegan ?? false);
  const [veganType, setVeganType] = useState(initialProfile?.veganType ?? '');
  const [hasReligion, setHasReligion] = useState(initialProfile?.hasReligion ?? false);
  const [religionType, setReligionType] = useState(initialProfile?.religionType ?? '');
  const [hasAllergies, setHasAllergies] = useState(initialProfile?.hasAllergies ?? false);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(initialProfile?.allergies ?? []);
  const [noAlcohol, setNoAlcohol] = useState(initialProfile?.noAlcohol ?? false);

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const languageOptions: { value: Language; label: string; sub: string }[] = [
    { value: 'ko', label: '한국어', sub: 'Korean' },
    { value: 'en', label: 'English', sub: 'English' },
    { value: 'ar', label: 'العربية', sub: 'Arabic' },
  ];

  const countries = useMemo(() => {
    const list = COUNTRY_CODES.map((code) => ({
      code,
      name: getCountryName(code, language),
      flag: getCountryFlag(code),
    })).sort((a, b) => a.name.localeCompare(b.name, language));

    const query = countrySearch.trim().toLowerCase();
    if (!query) return list;

    return list.filter(
      (country) =>
        country.name.toLowerCase().includes(query) || country.code.toLowerCase().includes(query),
    );
  }, [language, countrySearch]);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy],
    );
  };

  const step3Valid =
    (!isVegan || !!veganType) &&
    (!hasReligion || !!religionType) &&
    (!hasAllergies || selectedAllergies.length > 0);

  const canGoNext = step === 2 ? !!nationality : true;

  const handleSave = async () => {
    if (!step3Valid || saving) return;

    const profile: UserProfile = {
      nationality,
      languageCode: language,
      isFirstTime,
      isVegan,
      veganType: isVegan ? veganType : null,
      hasReligion,
      religionType: hasReligion ? religionType : null,
      hasAllergies,
      allergies: hasAllergies ? selectedAllergies : [],
      noSpicy,
      noAlcohol,
    };

    try {
      setSaving(true);
      setErrorMessage('');
      await onComplete(profile);
    } catch (error) {
      console.error('Profile save failed:', error);
      setErrorMessage(
        t(
          '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
          'Failed to save. Please try again.',
          'فشل الحفظ. يرجى المحاولة مرة أخرى.',
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const stepTitle = t(
    step === 1 ? '어떤 언어를 사용하시나요?' : step === 2 ? '어느 나라에서 오셨나요?' : '식단 프로필을 알려주세요',
    step === 1 ? 'Which language do you use?' : step === 2 ? 'Where are you from?' : 'Tell us about your diet',
    step === 1 ? 'ما اللغة التي تستخدمها؟' : step === 2 ? 'من أي بلد أنت؟' : 'أخبرنا عن نظامك الغذائي',
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 헤더 + 진행 표시 */}
      <div className="h-14 border-b border-neutral-200 flex items-center justify-center px-5 relative flex-shrink-0">
        {(editMode || step > 1) && (
          <button
            onClick={() => (editMode ? navigate(-1) : setStep((s) => s - 1))}
            className="absolute left-5"
            aria-label={t('이전', 'Back', 'رجوع')}
          >
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
        )}
        <h1 className="font-semibold text-neutral-900">
          {editMode
            ? t('프로필 수정', 'Edit profile', 'تعديل الملف')
            : t('프로필 설정', 'Profile setup', 'إعداد الملف')}
        </h1>
        {!editMode && (
          <span className="absolute right-5 text-xs text-neutral-500">{step}/{TOTAL_STEPS}</span>
        )}
      </div>

      {!editMode && (
        <div className="h-1 bg-neutral-100 flex-shrink-0">
          <div
            className="h-full bg-neutral-900 transition-all"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col">
        <h2 className="text-lg font-semibold mb-6">{stepTitle}</h2>

        {/* Step 2 — 나라 설정 */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder={t('나라 검색', 'Search country', 'ابحث عن بلد')}
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setNationality(country.code)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                    nationality === country.code
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-white text-neutral-800 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="text-sm">{country.name}</span>
                </button>
              ))}
              {countries.length === 0 && (
                <p className="text-sm text-neutral-400 text-center py-8">
                  {t('검색 결과가 없습니다', 'No results', 'لا توجد نتائج')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — 언어 설정 */}
        {step === 1 && (
          <div className="space-y-3">
            {languageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLanguage(option.value)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  language === option.value
                    ? 'bg-neutral-900 text-white border-neutral-900'
                    : 'bg-white text-neutral-900 border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                <span className="text-base font-medium">{option.label}</span>
                <span
                  className={`text-xs ${language === option.value ? 'text-neutral-300' : 'text-neutral-400'}`}
                >
                  {option.sub}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — 식단 프로필 */}
        {step === 3 && (
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
                {VEGETARIAN_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="veganType"
                      checked={veganType === option.value}
                      onChange={() => setVeganType(option.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-neutral-700">{option.label[language]}</span>
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
                {RELIGION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="religionType"
                      checked={religionType === option.value}
                      onChange={() => setReligionType(option.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-neutral-700">{option.label[language]}</span>
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
                {ALLERGY_OPTIONS.map((allergy) => (
                  <button
                    key={allergy.value}
                    onClick={() => toggleAllergy(allergy.value)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedAllergies.includes(allergy.value)
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                    }`}
                  >
                    {allergy.label[language]}
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
        )}
      </div>

      {/* 하단 액션 */}
      <div className="border-t border-neutral-200 px-5 py-4 space-y-2 flex-shrink-0">
        {errorMessage && <p className="text-xs text-red-500 text-center">{errorMessage}</p>}
        {!editMode && step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext}
            className="w-full h-14 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('다음', 'Next', 'التالي')}
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!step3Valid || saving}
            className="w-full h-14 bg-neutral-900 text-white rounded-xl font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving
              ? t('저장 중...', 'Saving...', 'جارٍ الحفظ...')
              : editMode
                ? t('저장', 'Save', 'حفظ')
                : t('저장하고 시작하기', 'Save and start', 'حفظ والبدء')}
          </button>
        )}
      </div>
    </div>
  );
}
