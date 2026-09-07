import { useState } from 'react';
import { Languages, LockKeyhole, LogIn, MessageCircleHeart, ScanLine, ShieldCheck } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import logo from '../../assets/brand/han-spoon-logo.svg';
import type { Language } from '../App';
import { googleLogin } from '../../api/auth';
import { createTranslator, LANGUAGE_LOCALES, LANGUAGE_OPTIONS } from '../locales';

interface LoginScreenProps {
  onLogin: (hasProfile: boolean) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

export function LoginScreen({ onLogin, language, setLanguage }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = createTranslator(language);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setIsLoading(true);
      setErrorMessage('');

      const idToken = credentialResponse.credential;

      if (!idToken) {
        throw new Error(t(
          'Google ID Token을 받지 못했습니다.',
          'Failed to receive Google ID Token.',
          'تعذر استلام رمز Google ID.'
        ));
      }

      const data = await googleLogin(idToken);

      localStorage.setItem('accessToken', data.accessToken);

      // refreshToken을 body로 받는 경우만 저장
      // 추후 HttpOnly 쿠키 방식으로 확정되면 이 부분은 제거해도 됨
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }

      localStorage.setItem('user', JSON.stringify(data.user));

      // true면 /home, false면 /onboarding으로 App 쪽에서 분기
      onLogin(Boolean(data.hasProfile));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('로그인 중 오류가 발생했습니다.', 'An error occurred during login.', 'حدث خطأ أثناء تسجيل الدخول.');

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage(t(
      'Google 로그인에 실패했습니다.',
      'Google sign-in failed.',
      'فشل تسجيل الدخول باستخدام Google.'
    ));
  };

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-rice-cream text-soy-ink" aria-busy={isLoading}>
      <header className="flex items-center justify-between px-6 pt-5">
        <img src={logo} alt={t('한스푼', 'Han Spoon', 'هان سبون')} className="h-auto w-[132px]" />

        <label className="relative flex h-10 items-center gap-2 rounded-full border border-border-warm bg-rice-white px-3 text-sm font-semibold text-brand-green-900 shadow-[0_4px_16px_rgba(54,70,60,0.06)]">
          <Languages className="h-4 w-4" aria-hidden="true" />
          <select
            aria-label={t('언어 선택', 'Choose language', 'اختر اللغة')}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            className="appearance-none bg-transparent pe-4 text-sm font-semibold outline-none"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute end-3 text-[10px] text-brand-green-700">▾</span>
        </label>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-5 pt-12">
        <section>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-accent-soft px-3 py-1.5 text-xs font-bold text-accent-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {t('나에게 맞는 한국 음식 찾기', 'Find Korean food that fits you', 'اعثر على الطعام الكوري المناسب لك')}
          </div>
          <h1 className="max-w-[330px] text-[30px] font-extrabold leading-[1.28] tracking-[-0.025em] text-soy-ink">
            {t(
              '낯선 메뉴도,\n안심하고 한 스푼.',
              'Explore unfamiliar menus,\none safe spoonful at a time.',
              'استكشف القوائم الجديدة،\nبكل طمأنينة.'
            ).split('\n').map((line, index, lines) => (
              <span key={line}>
                {line}
                {index < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="mt-4 max-w-[330px] text-[15px] leading-6 text-sesame-gray">
            {t(
              '메뉴판을 찍으면 식이 기준에 맞는 메뉴를 찾고, 필요한 말까지 준비해드려요.',
              'Scan a menu to find dishes that fit your diet and prepare the words you need.',
              'امسح القائمة للعثور على أطباق تناسب نظامك الغذائي وتجهيز العبارات التي تحتاجها.'
            )}
          </p>
        </section>

        <section className="mt-8 rounded-[28px] border border-border-warm bg-rice-white p-5 shadow-[0_12px_36px_rgba(54,70,60,0.08)]">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-green-50 text-brand-green-700">
                <ScanLine className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-soy-ink">{t('메뉴를 쉽게 이해해요', 'Understand every menu', 'افهم كل قائمة بسهولة')}</p>
                <p className="mt-0.5 text-[13px] text-sesame-gray">{t('메뉴 번역과 음식 설명', 'Translation and dish details', 'ترجمة وشرح الأطباق')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-brand-accent">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-soy-ink">{t('식이 기준을 꼼꼼히 살펴요', 'Check your dietary needs', 'تحقق من احتياجاتك الغذائية')}</p>
                <p className="mt-0.5 text-[13px] text-sesame-gray">{t('알레르기·채식·종교 기준 안내', 'Allergy, diet, and religious guidance', 'إرشادات الحساسية والنظام الغذائي والدين')}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-subtle text-brand-primary">
                <MessageCircleHeart className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-soy-ink">{t('필요한 말을 바로 전해요', 'Say what you need', 'قل ما تحتاجه بسهولة')}</p>
                <p className="mt-0.5 text-[13px] text-sesame-gray">{t('식당에서 바로 보여주는 소통 카드', 'Ready-to-show communication cards', 'بطاقات تواصل جاهزة للعرض')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border-warm bg-rice-white/95 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur">
        <div className="w-full flex justify-center mb-3">
          {isLoading ? (
            <button
              disabled
              aria-live="polite"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-brand-green-700 text-white opacity-70"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-bold">
                {t('로그인 중...', 'Signing in...', 'جارٍ تسجيل الدخول...')}
              </span>
            </button>
          ) : (
            <div className="w-full max-w-[320px] overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                shape="rectangular"
                text="signin_with"
                locale={LANGUAGE_LOCALES[language]}
                width="320"
              />
            </div>
          )}
        </div>

        {errorMessage && <p className="mb-3 text-center text-xs text-destructive" role="alert">{errorMessage}</p>}

        <p className="flex items-center justify-center gap-1.5 px-4 text-center text-xs text-sesame-gray">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t(
            '개인정보와 식단 정보는 내 프로필에서 관리할 수 있어요',
            'Manage your personal and diet information in your profile',
            'يمكنك إدارة معلوماتك الشخصية والغذائية في ملفك الشخصي'
          )}
        </p>
      </footer>
    </div>
  );
}
