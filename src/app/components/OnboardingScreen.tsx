import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Search, Sparkles } from 'lucide-react';
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
    <div className="flex h-dvh flex-col bg-soy-ink text-white">
      <header className="relative flex h-[82px] shrink-0 items-end px-5 pb-4 pt-[env(safe-area-inset-top)]">
        {(editMode || step > 1) && (
          <button
            onClick={() => (editMode ? navigate(-1) : setStep((s) => s - 1))}
            className="absolute start-3 top-3 inline-flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            aria-label={t('이전', 'Back', 'رجوع')}
          >
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </button>
        )}
        {editMode ? (
          <h1 className="mx-auto text-sm font-bold text-white">
            {t('프로필 수정', 'Edit profile', 'تعديل الملف')}
          </h1>
        ) : (
          <div
          className="flex w-full gap-2"
          role="progressbar"
          aria-label={t('프로필 설정 진행률', 'Profile setup progress', 'تقدم إعداد الملف')}
          aria-valuemin={1}
          aria-valuemax={TOTAL_STEPS}
          aria-valuenow={step}
        >
            {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${index < step ? 'bg-white' : 'bg-white/20'}`}
              />
            ))}
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-8 pt-7">
        <div className="mb-8 text-center">
          {!editMode && (
            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-[28px] bg-brand-primary text-white shadow-[0_16px_50px_rgba(23,100,73,.35)]">
              <Sparkles className="size-8" />
            </div>
          )}
          {!editMode && (
            <p className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-white/45">
              {t(`STEP ${step}`, `STEP ${step}`, `الخطوة ${step}`)}
            </p>
          )}
          <h2 className="mx-auto max-w-[330px] text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-white">{stepTitle}</h2>
          <p className="mx-auto mt-3 max-w-[320px] text-sm leading-6 text-white/55">
            {t(
              step === 1 ? '앱에서 사용할 언어를 선택해주세요.' : step === 2 ? '지역에 맞는 언어와 화폐 안내에 활용해요.' : '필요한 항목만 골라도 충분해요.',
              step === 1 ? 'Choose the language you want to use.' : step === 2 ? 'We use this for local language and currency guidance.' : 'Select only what matters to you.',
              step === 1 ? 'اختر اللغة التي تريد استخدامها.' : step === 2 ? 'نستخدمها لإرشادات اللغة والعملة.' : 'اختر فقط ما يهمك.',
            )}
          </p>
        </div>

        {/* Step 2 — 나라 설정 */}
        {step === 2 && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="relative mb-4">
              <Search className="absolute start-4 top-1/2 size-5 -translate-y-1/2 text-white/45" />
              <input
                type="text"
                aria-label={t('나라 검색', 'Search country', 'ابحث عن بلد')}
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder={t('나라 검색', 'Search country', 'ابحث عن بلد')}
                className="h-14 w-full rounded-full border border-white/10 bg-white/10 ps-12 pe-4 text-sm text-white placeholder:text-white/40 focus:border-brand-green-500 focus:outline-none focus:ring-4 focus:ring-brand-green-500/15"
              />
            </div>

            <div className="-mx-1 grid flex-1 grid-cols-2 gap-2 overflow-y-auto px-1">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => setNationality(country.code)}
                  aria-pressed={nationality === country.code}
                  className={`flex min-h-14 w-full items-center gap-2 rounded-[20px] border px-3 py-3 text-start transition-colors ${
                    nationality === country.code
                      ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                      : 'border-white/10 bg-white/10 text-white hover:border-white/25'
                  }`}
                >
                  <span className="text-xl leading-none">{country.flag}</span>
                  <span className="min-w-0 flex-1 text-sm font-semibold">{country.name}</span>
                  {nationality === country.code && <Check className="size-5 shrink-0" aria-hidden="true" />}
                </button>
              ))}
              {countries.length === 0 && (
                <p className="col-span-2 py-8 text-center text-sm text-white/50">
                  {t('검색 결과가 없습니다', 'No results', 'لا توجد نتائج')}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 1 — 언어 설정 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setLanguage(option.value)}
                aria-pressed={language === option.value}
                className={`flex min-h-[76px] w-full items-center gap-3 rounded-[24px] border p-4 text-start transition-colors ${
                  language === option.value
                    ? 'border-brand-primary bg-brand-primary text-white shadow-[0_12px_32px_rgba(23,100,73,.3)]'
                    : 'border-white/10 bg-white/10 text-white hover:border-white/25'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold">{option.label}</span>
                  <span className={`mt-0.5 block text-[11px] ${language === option.value ? 'text-white/75' : 'text-white/45'}`}>
                    {translateText(language, option.sub)}
                  </span>
                </span>
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full border ${language === option.value ? 'border-white/40 bg-white/15' : 'border-white/20'}`}>
                  {language === option.value && <Check className="size-4" aria-hidden="true" />}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3 — 식단 프로필 */}
        {step === 3 && (
          <div className="space-y-3">
            <label className={`flex min-h-15 cursor-pointer items-center gap-3 rounded-[22px] border p-4 transition-colors ${isFirstTime ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/10 bg-white/10 text-white hover:border-white/25'}`}>
              <input
                type="checkbox"
                checked={isFirstTime}
                onChange={(e) => setIsFirstTime(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-white">{t('한국 음식 처음', 'New to Korean food', 'أول مرة مع الطعام الكوري')}</span>
            </label>

            <label className={`flex min-h-15 cursor-pointer items-center gap-3 rounded-[22px] border p-4 transition-colors ${noSpicy ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/10 bg-white/10 text-white hover:border-white/25'}`}>
              <input
                type="checkbox"
                checked={noSpicy}
                onChange={(e) => setNoSpicy(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-white">{t('매운 음식 비선호', 'Avoid spicy food', 'تجنب الطعام الحار')}</span>
            </label>

            <label className={`flex min-h-15 cursor-pointer items-center gap-3 rounded-[22px] border p-4 transition-colors ${isVegan ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/10 bg-white/10 text-white hover:border-white/25'}`}>
              <input
                type="checkbox"
                checked={isVegan}
                onChange={(e) => setIsVegan(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-white">{t('채식·비건', 'Vegetarian/Vegan', 'نباتي/نباتي صارم')}</span>
            </label>

            {isVegan && (
              <div className="space-y-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
                {VEGETARIAN_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="veganType"
                      checked={veganType === option.value}
                      onChange={() => setVeganType(option.value)}
                      className="mt-0.5 size-4 shrink-0 accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
                    />
                    <span className="text-sm text-white/85">{translateText(language, option.label)}</span>
                  </label>
                ))}
              </div>
            )}

            <label className={`flex min-h-15 cursor-pointer items-center gap-3 rounded-[22px] border p-4 transition-colors ${hasReligion ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/10 bg-white/10 text-white hover:border-white/25'}`}>
              <input
                type="checkbox"
                checked={hasReligion}
                onChange={(e) => setHasReligion(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-white">{t('종교 식단', 'Religious diet', 'نظام غذائي ديني')}</span>
            </label>

            {hasReligion && (
              <div className="space-y-3 rounded-[22px] border border-white/10 bg-white/5 p-4">
                {RELIGION_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="religionType"
                      checked={religionType === option.value}
                      onChange={() => setReligionType(option.value)}
                      className="mt-0.5 size-4 shrink-0 accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
                    />
                    <span className="text-sm text-white/85">{translateText(language, option.label)}</span>
                  </label>
                ))}
              </div>
            )}

            <label className={`flex min-h-15 cursor-pointer items-center gap-3 rounded-[22px] border p-4 transition-colors ${hasAllergies ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/10 bg-white/10 text-white hover:border-white/25'}`}>
              <input
                type="checkbox"
                checked={hasAllergies}
                onChange={(e) => setHasAllergies(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-white">{t('음식 알레르기', 'Food allergies', 'حساسية الطعام')}</span>
            </label>

            {hasAllergies && (
              <div className="flex flex-wrap gap-2 rounded-[22px] border border-white/10 bg-white/5 p-4">
                {ALLERGY_OPTIONS.map((allergy) => (
                  <button
                    key={allergy.value}
                    onClick={() => toggleAllergy(allergy.value)}
                    aria-pressed={selectedAllergies.includes(allergy.value)}
                    className={`min-h-9 px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selectedAllergies.includes(allergy.value)
                        ? 'bg-brand-green-700 text-white border-brand-green-700'
                        : 'border-white/15 bg-white/10 text-white hover:border-white/30'
                    }`}
                  >
                    {translateText(language, allergy.label)}
                  </button>
                ))}
              </div>
            )}

            <label className={`flex min-h-15 cursor-pointer items-center gap-3 rounded-[22px] border p-4 transition-colors ${noAlcohol ? 'border-brand-primary bg-brand-primary text-white' : 'border-white/10 bg-white/10 text-white hover:border-white/25'}`}>
              <input
                type="checkbox"
                checked={noAlcohol}
                onChange={(e) => setNoAlcohol(e.target.checked)}
                className="mt-0.5 size-5 shrink-0 rounded border-border-warm accent-brand-green-700 focus:ring-2 focus:ring-brand-green-500/20"
              />
              <span className="text-sm font-semibold text-white">{t('금주', 'No alcohol', 'بدون كحول')}</span>
            </label>
          </div>
        )}
      </div>

      {/* 하단 액션 */}
      <div className="shrink-0 space-y-2 bg-soy-ink px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        {errorMessage && <p className="text-xs text-red-500 text-center" role="alert">{errorMessage}</p>}
        {!editMode && step < TOTAL_STEPS ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canGoNext}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white font-bold text-soy-ink shadow-sm transition-colors hover:bg-rice-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('다음', 'Next', 'التالي')}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={!step3Valid || saving}
            aria-busy={saving}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-white font-bold text-soy-ink shadow-sm transition-colors hover:bg-rice-cream disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving
              ? t('저장 중...', 'Saving...', 'جارٍ الحفظ...')
              : editMode
                ? t('저장', 'Save', 'حفظ')
                : t('저장하고 시작하기', 'Save and start', 'حفظ والبدء')}
            {!saving && <ChevronRight className="size-4 rtl:rotate-180" />}
          </button>
        )}
      </div>
    </div>
  );
}
