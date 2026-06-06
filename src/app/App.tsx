import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { MyPageScreen } from './components/MyPageScreen';
import { createProfile, getMe, getProfile, updateMe, updateProfile } from '../api/user';
import type { CurrentUser } from '../api/user';

export type Language = 'ko' | 'en' | 'ar';

export interface UserAllergy {
  allergy_name_ko: string;
  allergy_name_en?: string;
  allergy_name_ar?: string;
  allergy_name?: string;
}

export interface UserProfile {
  isFirstTime: boolean;
  isVegan: boolean;
  veganType?: string;
  hasReligion: boolean;
  religionType?: string;
  hasAllergies: boolean;
  allergies: Array<string | UserAllergy>;
  noSpicy: boolean;
  noAlcohol: boolean;
}

export interface MenuAnalysis {
  id: string;
  image?: string;
  menuName: string;
  menuNameEn: string;
  menuNameAr?: string;
  description: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price?: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  riskReasons: string[];
  riskReasonsEn?: string[];
  riskReasonsAr?: string[];
  isSpicy: boolean;
  is_spicy?: boolean;
  isAlcohol?: boolean;
  is_alcohol?: boolean;
}

export interface PendingMenuImage {
  file: File | null;
  previewUrl: string;
  source: 'camera' | 'upload';
  storage?: {
    provider: 'postgresql' | 'blob';
    key?: string;
    url?: string;
  };
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  menuCount: number;
  dangerCount: number;
  menus: MenuAnalysis[];
}

const formatHistoryTitle = (language: Language, date: Date) => {
  const locale = language === 'ko' ? 'ko-KR' : language === 'ar' ? 'ar' : 'en-US';

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function App() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>('ko');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MenuAnalysis[]>([]);
  const [analysisImage, setAnalysisImage] = useState<PendingMenuImage | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<HistoryItem[]>([]);

  const loadCurrentUser = async () => {
    try {
      const user = await getMe();
      setCurrentUser(user);
    } catch (error) {
      console.warn('Unable to fetch current user:', error);
      setCurrentUser(null);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await getProfile();
      setUserProfile(profile);
    } catch (error) {
      console.warn('Unable to fetch profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    loadUserProfile();

    return () => {
      if (analysisImage?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(analysisImage.previewUrl);
      }
    };
  }, []);

  const handleLanguageChange = async (languageValue: Language) => {
    setLanguage(languageValue);

    try {
      await updateMe({ languageCode: languageValue });
      setCurrentUser((prev) => (prev ? { ...prev, languageCode: languageValue } : prev));
    } catch (error) {
      console.error('Language update failed:', error);
    }
  };

  const handleProfileSave = async (profile: UserProfile) => {
    try {
      if (userProfile) {
        await updateProfile(profile);
      } else {
        await createProfile(profile);
      }
      setUserProfile(profile);
      await loadCurrentUser();
      navigate('/home');
    } catch (error) {
      console.error('Profile save failed:', error);
      navigate('/home');
    }
  };

  const handleLogin = async (hasProfile: boolean) => {
    await loadCurrentUser();

    if (hasProfile) {
      await loadUserProfile();
      navigate('/home');
      return;
    }

    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="mobile-container w-[390px] min-h-screen bg-white shadow-xl relative overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <LoginScreen
                language={language}
                setLanguage={setLanguage}
                onLogin={handleLogin}
              />
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingScreen
                language={language}
                initialProfile={userProfile ?? undefined}
                onComplete={handleProfileSave}
                onSkip={() => navigate('/home')}
              />
            }
          />
          <Route
            path="/home"
            element={
              <HomeScreen
                language={language}
                onScan={(image) => {
                  setAnalysisImage(image);
                  navigate('/analyzing');
                }}
                onHistory={(item) => {
                  setCurrentAnalysis(item.menus);
                  setAnalysisImage(null);
                  navigate('/results');
                }}
                onMyPage={() => navigate('/mypage')}
                history={analysisHistory}
              />
            }
          />
          <Route
            path="/analyzing"
            element={
              <AnalyzingScreen
                language={language}
                image={analysisImage}
                onComplete={(menus) => {
                  setCurrentAnalysis(menus);
                  setAnalysisImage(null);
                  setAnalysisHistory((prev) => [
                    {
                      id: String(Date.now()),
                      title: formatHistoryTitle(language, new Date()),
                      date: new Date().toISOString(),
                      menuCount: menus.length,
                      dangerCount: menus.filter((menu) => menu.riskLevel !== 'safe').length,
                      menus,
                    },
                    ...prev,
                  ]);
                  navigate('/results');
                }}
                onCancel={() => {
                  setAnalysisImage(null);
                  navigate('/home');
                }}
              />
            }
          />
          <Route
            path="/results"
            element={
              <ResultsScreen
                language={language}
                menus={currentAnalysis}
                userProfile={userProfile}
                onBack={() => navigate('/home')}
                onRescan={() => navigate('/home')}
              />
            }
          />
          <Route
            path="/mypage"
            element={
              <MyPageScreen
                language={language}
                setLanguage={handleLanguageChange}
                currentUser={currentUser}
                userProfile={userProfile}
                history={analysisHistory}
                onBack={() => navigate('/home')}
                onEditProfile={() => navigate('/onboarding')}
                onHistoryClick={(item) => {
                  setCurrentAnalysis(item.menus);
                  navigate('/results');
                }}
                onEditHistoryTitle={(id, title) => {
                  setAnalysisHistory((prev) =>
                    prev.map((item) => (item.id === id ? { ...item, title } : item))
                  );
                }}
                onLogout={() => {
                  setUserProfile(null);
                  setCurrentUser(null);
                  navigate('/login');
                }}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}
