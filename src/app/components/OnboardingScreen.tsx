import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Search } from 'lucide-react';
import type { Language, UserProfile } from '../App';
import { ApiError } from '../../api/user';
import {
  ALLERGY_OPTIONS,
  COUNTRY_CODES,
  RELIGION_OPTIONS,
  VEGETARIAN_OPTIONS,
  getCountryFlag,
  getCountryName,
} from '../constants/onboarding';
import { createTranslator, LANGUAGE_OPTIONS, translateText } from '../locales';

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

  const t = createTranslator(language);

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
      let message = t(
        '저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        'Failed to save. Please try again.',
        'فشل الحفظ. يرجى المحاولة مرة أخرى.',
      );
      if (error instanceof ApiError) {
        if (error.status === 401) {
          message = t(
            '세션이 만료되었습니다. 다시 로그인해 주세요.',
            'Your session expired. Please log in again.',
            'انتهت الجلسة. يرجى تسجيل الدخول مرة أخرى.',
          );
        } else if (error.status === 404) {
          message = t(
            '백엔드에 프로필 API가 없습니다. 백엔드 버전을 확인하세요.',
            'Profile API not found on the server. Check the backend version.',
            'واجهة الملف غير موجودة على الخادم. تحقق من إصدار الخادم.',
          );
        } else {
          message = `${message} (${error.status})`;
        }
      }
      setErrorMessage(message);
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
    <div className="h-dvh flex flex-col bg-rice-cream">
      {/* 헤더 + 진행 표시 */}
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center justify-center px-5 relative flex-shrink-0">
        {(editMode || step > 1) && (
          <button
            onClick={() => (editMode ? navigate(-1) : setStep((s) => s - 1))}
            className="absolute start-4 inline-flex size-11 items-center justify-center rounded-full text-soy-ink transition-colors hover:bg-brand-green-50"
            aria-label={t('이전', 'Back', 'رجوع')}
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
        )}
        <h1 className="text-base font-bold text-soy-ink">
          {editMode
            ? t('프로필 수정', 'Edit profile', 'تعديل الملف')
            : t('프로필 설정', 'Profile setup', 'إعداد الملف')}
        </h1>
        {!editMode && (
          <span className="absolute end-5 rounded-full bg-brand-green-50 px-2.5 py-1 text-xs font-bold text-brand-green-700">
            {step}/{TOTAL_STEPS}
          </span>
        )}
      </div>

      {!editMode && (
        <div
          className="h-1 bg-brand-green-50 flex-shrink-0"
          role="progressbar"
          aria-label={t('프로필 설정 진행률', 'Profile setup progress', 'تقدم إعداد الملف')}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
        >
          <div
            className="h-full rounded-e-full bg-brand-orange-500 transition-all duration-300"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-7 flex flex-col">
        <div className="mb-6">
          {!editMode && (
            <p className="mb-1 text-xs font-bold tracking-[0.08em] text-brand-green-700">
              {t(`STEP ${step}`, `STEP ${step}`, `الخطوة ${step}`)}
            </p>
          )}
          <h2 className="max-w-sm text-2xl font-extrabold tracking-[-0.02em] text-soy-ink">{stepTitle}</h2>
        </div>

        {/* Step 2 — 나라 설정 */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative mb-4">
              <Search className="size-5 text-sesame-gray absolute start-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label={t('나라 검색', 'Search country', 'ابحث عن بلد')}
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder={t('나라 검색', 'Search country', 'ابحث عن بلد')}
                className="w-full h-13 ps-12 pe-4 rounded-2xl border border-border-warm bg-rice-white text-sm text-soy-ink shadow-sm placeholder:text-sesame-gray focus:border-brand-green-500 focus:outline-none focus:ring-4 focus:ring-brand-green-500/10"
              />
            </div>

            <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setNationality(country.code)}
                  aria-pressed={nationality === country.code}
                  className={`min-h-13 w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-start transition-colors ${
                    nationality === country.code
                      ? 'bg-brand-green-700 text-white border-brand-green-700 shadow-sm'
                      : 'bg-rice-white text-soy-ink border-border-warm hover:border-brand-green-500 hover:bg-brand-green-50'
                  }`}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="min-w-0 flex-1 text-sm font-semibold">{country.name}</span>
                  {nationality === country.code && <Check className="size-5 shrink-0" aria-hidden="true" />}
                </button>
              ))}
              {countries.length === 0 && (
                <p className="text-sm text-sesame-gray text-center py-8">
                  {t('검색 결과가 없습니다', 'No results', 'لا توجد نتائج')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — 언어 설정 */}
        {step === 1 && (
          <div className="space-y-3">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setLanguage(option.value)}
                aria-pressed={language === option.value}
                className={`min-h-18 w-full flex items-center gap-4 p-4 rounded-2xl border text-start transition-colors ${
                  language === option.value
                    ? 'bg-brand-green-700 text-white border-brand-green-700 shadow-sm'
                    : 'bg-rice-white text-soy-ink border-border-warm hover:border-brand-green-500 hover:bg-brand-green-50'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold">{option.label}</span>
                  <span className={`block text-xs ${language === option.value ? 'text-white/70' : 'text-sesame-gray'}`}>
                    {option.sub}
                  </span>
                </span>
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${language === option.value ? 'border-white/40 bg-white/15' : 'border-border-warm'}`}>
                  {language === option.value && <Check className="size-4" aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — 식단 프로필 */}
        {step === 3 && (
          <div className="space-y-3">
            <label className={`flex min-h-15 items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${isFirstTime ? 'border-brand-green-500 bg-brand-green-50' : 'border-border-warm bg-rice-white hover:border-brand-green-500'}`}>
              <input
                type="checkbox"
                checked={isFirstTime}
                onChange={(e) => setIsFirstTime(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-soy-ink">{t('한국 음식 처음', 'New to Korean food', 'أول مرة مع الطعام الكوري')}</span>
            </label>

            <label className={`flex min-h-15 items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${noSpicy ? 'border-brand-green-500 bg-brand-green-50' : 'border-border-warm bg-rice-white hover:border-brand-green-500'}`}>
              <input
                type="checkbox"
                checked={noSpicy}
                onChange={(e) => setNoSpicy(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-soy-ink">{t('매운 음식 비선호', 'Avoid spicy food', 'تجنب الطعام الحار')}</span>
            </label>

            <label className={`flex min-h-15 items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${isVegan ? 'border-brand-green-500 bg-brand-green-50' : 'border-border-warm bg-rice-white hover:border-brand-green-500'}`}>
              <input
                type="checkbox"
                checked={isVegan}
                onChange={(e) => setIsVegan(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-soy-ink">{t('채식·비건', 'Vegetarian/Vegan', 'نباتي/نباتي صارم')}</span>
            </label>

            {isVegan && (
              <div className="space-y-3 rounded-2xl border border-brand-green-100 bg-brand-green-50 p-4">
                {VEGETARIAN_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="veganType"
                      checked={veganType === option.value}
                      onChange={() => setVeganType(option.value)}
                      className="mt-0.5 size-4 shrink-0 accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
                    />
                    <span className="text-sm text-soy-ink">{translateText(language, option.label)}</span>
                  </label>
                ))}
              </div>
            )}

            <label className={`flex min-h-15 items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${hasReligion ? 'border-brand-green-500 bg-brand-green-50' : 'border-border-warm bg-rice-white hover:border-brand-green-500'}`}>
              <input
                type="checkbox"
                checked={hasReligion}
                onChange={(e) => setHasReligion(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-soy-ink">{t('종교 식단', 'Religious diet', 'نظام غذائي ديني')}</span>
            </label>

            {hasReligion && (
              <div className="space-y-3 rounded-2xl border border-brand-green-100 bg-brand-green-50 p-4">
                {RELIGION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="religionType"
                      checked={religionType === option.value}
                      onChange={() => setReligionType(option.value)}
                      className="mt-0.5 size-4 shrink-0 accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
                    />
                    <span className="text-sm text-soy-ink">{translateText(language, option.label)}</span>
                  </label>
                ))}
              </div>
            )}

            <label className={`flex min-h-15 items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${hasAllergies ? 'border-brand-green-500 bg-brand-green-50' : 'border-border-warm bg-rice-white hover:border-brand-green-500'}`}>
              <input
                type="checkbox"
                checked={hasAllergies}
                onChange={(e) => setHasAllergies(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-soy-ink">{t('음식 알레르기', 'Food allergies', 'حساسية الطعام')}</span>
            </label>

            {hasAllergies && (
              <div className="flex flex-wrap gap-2 rounded-2xl border border-brand-green-100 bg-brand-green-50 p-4">
                {ALLERGY_OPTIONS.map((allergy) => (
                  <button
                    key={allergy.value}
                    onClick={() => toggleAllergy(allergy.value)}
                    aria-pressed={selectedAllergies.includes(allergy.value)}
                    className={`min-h-9 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedAllergies.includes(allergy.value)
                        ? 'bg-brand-green-700 text-white border-brand-green-700'
                        : 'bg-rice-white text-soy-ink border-border-warm hover:border-brand-green-500'
                    }`}
                  >
                    {translateText(language, allergy.label)}
                  </button>
                ))}
              </div>
            )}

            <label className={`flex min-h-15 items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${noAlcohol ? 'border-brand-green-500 bg-brand-green-50' : 'border-border-warm bg-rice-white hover:border-brand-green-500'}`}>
              <input
                type="checkbox"
                checked={noAlcohol}
                onChange={(e) => setNoAlcohol(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-soy-ink">{t('금주', 'No alcohol', 'بدون كحول')}</span>
            </label>
          </div>
        )}
      </div>

      {/* 하단 액션 */}
      <div className="border-t border-border-warm bg-rice-white/95 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2 flex-shrink-0">
        {errorMessage && <p className="text-xs text-red-500 text-center" role="alert">{errorMessage}</p>}
        {!editMode && step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext}
            className="w-full h-14 bg-brand-green-700 text-white rounded-2xl font-bold shadow-sm transition-colors hover:bg-brand-green-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('다음', 'Next', 'التالي')}
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!step3Valid || saving}
            aria-busy={saving}
            className="w-full h-14 bg-brand-green-700 text-white rounded-2xl font-bold shadow-sm transition-colors hover:bg-brand-green-900 disabled:opacity-40 disabled:cursor-not-allowed"
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
