import { useState } from 'react';
import { BookOpenText, LogIn, MessageSquareHeart, TriangleAlert } from 'lucide-react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import logo from '../../icons/logo.png';
import type { Language } from '../App';
import { googleLogin } from '../../api/auth';

interface LoginScreenProps {
  onLogin: (hasProfile: boolean) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

export function LoginScreen({ onLogin, language, setLanguage }: LoginScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ];

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
    <div className="h-screen flex flex-col bg-white relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {languageOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setLanguage(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              language === option.value
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-600 border-neutral-300 hover:bg-neutral-50'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="mb-2">
          <div className="w-20 h-20 bg-neutral-900 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <img src={logo} alt="한스푼 로고" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">{t('한 스푼', 'Han Spoon', 'هان سبون')}</h1>
        </div>

        <p className="text-lg text-neutral-600 text-center mb-20">
          {t('한국 메뉴판, 더 쉽게 이해하기', 'Understand Korean menus more easily', 'افهم قوائم الطعام الكورية بسهولة أكبر')}
        </p>

        <div className="space-y-4 mb-16 w-full max-w-xs">
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <BookOpenText className="w-4 h-4" />
            </div>
            <span className="text-sm">{t('메뉴 번역', 'Menu translation', 'ترجمة القائمة')}</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <TriangleAlert className="w-4 h-4" />
            </div>
            <span className="text-sm">{t('알레르기 경고', 'Allergy warnings', 'تنبيهات الحساسية')}</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <MessageSquareHeart className="w-4 h-4" />
            </div>
            <span className="text-sm">{t('사장님 소통', 'Communicate with staff', 'التواصل مع العاملين')}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8">
        <div className="w-full flex justify-center mb-4">
          {isLoading ? (
            <button
              disabled
              className="w-full h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center gap-3 opacity-70"
            >
              <LogIn className="w-5 h-5" />
              <span className="font-medium">
                {t('로그인 중...', 'Signing in...', 'جارٍ تسجيل الدخول...')}
              </span>
            </button>
          ) : (
            <div>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                size="large"
                shape="rectangular"
                text="signin_with"
                width="320"
              />
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-red-500 text-center mb-3">
            {errorMessage}
          </p>
        )}

        <p className="text-xs text-neutral-500 text-center px-4">
          {t(
            '개인정보와 식단 정보가 안전하게 저장됩니다',
            'Your personal and diet information is stored securely',
            'يتم حفظ معلوماتك الشخصية والغذائية بأمان'
          )}
        </p>
      </div>
    </div>
  );
}
