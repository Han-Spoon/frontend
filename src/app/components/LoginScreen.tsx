import { Chrome } from 'lucide-react';
import logo from '../../icons/logo.png';
import type { Language } from '../App';

interface LoginScreenProps {
  onLogin: (hasProfile: boolean) => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

export function LoginScreen({ onLogin, language, setLanguage }: LoginScreenProps) {
  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );
  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ];

  const handleGoogleLogin = () => {
    const hasProfile = Math.random() > 0.5;
    onLogin(hasProfile);
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
        <div className="mb-8">
          <div className="w-20 h-20 bg-neutral-900 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <img src={logo} alt="한스푼 로고" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-center mb-2">{t('한 스푼', 'Han Spoon', 'هان سبون')}</h1>
        </div>

        <p className="text-lg text-neutral-600 text-center mb-12">
          {t('한국 메뉴판 더 쉽게 이해하기', 'Understand Korean menus more easily', 'افهم قوائم الطعام الكورية بسهولة أكبر')}
        </p>

        <div className="space-y-4 mb-16 w-full max-w-xs">
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">📋</span>
            </div>
            <span className="text-sm">{t('메뉴 번역', 'Menu translation', 'ترجمة القائمة')}</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">⚠️</span>
            </div>
            <span className="text-sm">{t('알레르기 경고', 'Allergy warnings', 'تنبيهات الحساسية')}</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-700">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">💬</span>
            </div>
            <span className="text-sm">{t('사장님 소통', 'Communicate with staff', 'التواصل مع العاملين')}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8">
        <button
          onClick={handleGoogleLogin}
          className="w-full h-14 bg-neutral-900 text-white rounded-xl flex items-center justify-center gap-3 hover:bg-neutral-800 transition-colors mb-4"
        >
          <Chrome className="w-5 h-5" />
          <span className="font-medium">{t('Google로 로그인', 'Sign in with Google', 'تسجيل الدخول باستخدام Google')}</span>
        </button>
        <p className="text-xs text-neutral-500 text-center px-4">
          {t('개인정보와 식단 정보가 안전하게 저장됩니다', 'Your personal and diet information is stored securely', 'يتم حفظ معلوماتك الشخصية والغذائية بأمان')}
        </p>
      </div>
    </div>
  );
}
