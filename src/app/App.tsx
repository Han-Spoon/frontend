import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { MyPageScreen } from './components/MyPageScreen';

export type Language = 'ko' | 'en';

export interface UserProfile {
  isFirstTime: boolean;
  isVegan: boolean;
  veganType?: string;
  hasReligion: boolean;
  religionType?: string;
  hasAllergies: boolean;
  allergies: string[];
  noSpicy: boolean;
  noAlcohol: boolean;
}

export interface MenuAnalysis {
  id: string;
  image?: string;
  menuName: string;
  menuNameEn: string;
  description: string;
  descriptionEn?: string;
  price?: string;
  riskLevel: 'safe' | 'caution' | 'danger';
  riskReasons: string[];
  riskReasonsEn?: string[];
  isSpicy: boolean;
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
  return new Intl.DateTimeFormat(language === 'ko' ? 'ko-KR' : 'en-US', {
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
  const [currentAnalysis, setCurrentAnalysis] = useState<MenuAnalysis[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<HistoryItem[]>([]);

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
                onLogin={(hasProfile) => {
                  if (hasProfile) {
                    navigate('/home');
                  } else {
                    navigate('/onboarding');
                  }
                }}
              />
            }
          />
          <Route
            path="/onboarding"
            element={
              <OnboardingScreen
                language={language}
                onComplete={(profile) => {
                  setUserProfile(profile);
                  navigate('/home');
                }}
                onSkip={() => navigate('/home')}
              />
            }
          />
          <Route
            path="/home"
            element={
              <HomeScreen
                language={language}
                onScan={() => navigate('/analyzing')}
                onHistory={(item) => {
                  setCurrentAnalysis(item.menus);
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
                onComplete={(menus) => {
                  setCurrentAnalysis(menus);
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
                onCancel={() => navigate('/home')}
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
                setLanguage={setLanguage}
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
                onLogout={() => navigate('/login')}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  );
}
