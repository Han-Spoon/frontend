import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Language } from '../App';
import { isLanguage } from '../locales';
import { RESULT_PREVIEW_MENUS, RESULT_PREVIEW_PROFILE } from '../results/resultFixtures';
import { ResultsScreen } from './ResultsScreen';

interface DevResultsPreviewProps {
  fallbackLanguage: Language;
}

export function DevResultsPreview({ fallbackLanguage }: DevResultsPreviewProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedLanguage = searchParams.get('lang');
  const language = isLanguage(requestedLanguage) ? requestedLanguage : fallbackLanguage;

  useEffect(() => {
    const previousLanguage = document.documentElement.lang;
    const previousDirection = document.documentElement.dir;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    return () => {
      document.documentElement.lang = previousLanguage;
      document.documentElement.dir = previousDirection;
    };
  }, [language]);

  return (
    <ResultsScreen
      language={language}
      menus={RESULT_PREVIEW_MENUS}
      userProfile={{ ...RESULT_PREVIEW_PROFILE, languageCode: language }}
      onBack={() => navigate('/home')}
      onRescan={() => navigate('/home')}
    />
  );
}
