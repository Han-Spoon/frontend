import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { MyPageScreen } from './components/MyPageScreen';
import { ApiError, createProfile, getMe, getProfile, updateMe, updateProfile } from '../api/user';
import type { CurrentUser, UserProfilePayload } from '../api/user';

export type Language = 'ko' | 'en' | 'ar';

export interface UserAllergy {
  allergy_name_ko: string;
  allergy_name_en?: string;
  allergy_name_ar?: string;
  allergy_name?: string;
}

export interface UserProfile {
  /** ISO 3166-1 alpha-2 (대문자, 예: "SA") */
  nationality: string;
  languageCode: Language;
  isFirstTime: boolean;
  isVegan: boolean;
  /** VegetarianType 코드값 (vegan|lacto|ovo|lacto_ovo|pesco) */
  veganType?: string | null;
  hasReligion: boolean;
  /** ReligionType 코드값 (halal|kosher|hindu) */
  religionType?: string | null;
  hasAllergies: boolean;
  /** AllergyCode 코드값 배열 (egg, milk, ...) */
  allergies: string[];
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
      // ProfileResponse에는 languageCode가 없으므로 현재 앱 언어를 사용한다.
      setUserProfile({
        nationality: profile.nationality ?? '',
        languageCode: (profile.languageCode as Language) ?? language,
        isFirstTime: Boolean(profile.isFirstTime),
        isVegan: Boolean(profile.isVegan),
        veganType: profile.veganType ?? null,
        hasReligion: Boolean(profile.hasReligion),
        religionType: profile.religionType ?? null,
        hasAllergies: Boolean(profile.hasAllergies),
        allergies: profile.allergies ?? [],
        noSpicy: Boolean(profile.noSpicy),
        noAlcohol: Boolean(profile.noAlcohol),
      });
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
    const payload: UserProfilePayload = {
      nationality: profile.nationality.toUpperCase(),
      languageCode: profile.languageCode,
      isFirstTime: profile.isFirstTime,
      isVegan: profile.isVegan,
      veganType: profile.isVegan ? profile.veganType ?? null : null,
      hasReligion: profile.hasReligion,
      religionType: profile.hasReligion ? profile.religionType ?? null : null,
      hasAllergies: profile.hasAllergies,
      allergies: profile.hasAllergies ? profile.allergies : [],
      noSpicy: profile.noSpicy,
      noAlcohol: profile.noAlcohol,
    };

    // 신규는 POST, 기존 프로필이 있으면 PATCH.
    // 신규인데 이미 서버에 프로필이 있으면(409) PATCH로 폴백한다.
    if (userProfile) {
      await updateProfile(payload);
    } else {
      try {
        await createProfile(payload);
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          await updateProfile(payload);
        } else {
          throw error;
        }
      }
    }

    setUserProfile(profile);
    setLanguage(profile.languageCode);
    await loadCurrentUser();
    navigate('/home');
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
                setLanguage={setLanguage}
                initialProfile={userProfile ?? undefined}
                onComplete={handleProfileSave}
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
