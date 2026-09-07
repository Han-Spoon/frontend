import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { LoginScreen } from './components/LoginScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { MyPageScreen } from './components/MyPageScreen';
import { CurationScreen } from './components/CurationScreen';
import { CurationDetailScreen } from './components/CurationDetailScreen';
import { CardsScreen } from './components/CardsScreen';
import { ApiError, createProfile, getMe, getProfile, updateMe, updateProfile } from '../api/user';
import type { CurrentUser, UserProfilePayload } from '../api/user';
import { deleteScan, getScanHistory, getScanResult, mapMenuResult, updateScanTitle } from '../api/scan';
import { isBackendLanguage, isLanguage, LANGUAGE_LOCALES, toBackendLanguage, type Language } from './locales';
import { DevResultsPreview } from './components/DevResultsPreview';

export type { Language } from './locales';

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

export interface LocalizedMenuText {
  ko: string;
  en?: string;
  ar?: string;
  'zh-CN'?: string;
  ja?: string;
  'zh-TW'?: string;
  es?: string;
}

export type EvidenceConfidence = 'high' | 'medium' | 'limited';
export type EvidenceSourceType =
  | 'menu-description'
  | 'menu-context'
  | 'trusted-cooking'
  | 'web'
  | 'staff';

export interface MenuIngredientEvidence {
  name: LocalizedMenuText;
  /** 백엔드가 제공할 때만 노출한다. 프런트에서는 확률을 계산하지 않는다. */
  inclusionLikelihood?: 'high' | 'medium' | 'low';
  confidence?: EvidenceConfidence;
  /** 이 재료와 직접 연결된 출처만 전달한다. 메뉴 전체 출처를 임의로 재료에 배분하지 않는다. */
  sourceTypes?: EvidenceSourceType[];
  staffEvidence?: {
    usedCount?: number;
    checkedCount?: number;
    sampleSufficient?: boolean;
  };
  sourcesConflict?: boolean;
}

export interface MenuEvidenceSource {
  type: EvidenceSourceType;
  title?: LocalizedMenuText;
  confidence?: EvidenceConfidence;
}

/**
 * 향후 백엔드 XAI 응답을 화면에 연결하기 위한 optional ViewModel 입력이다.
 * 현재 API 필드는 그대로 유지하며, 값이 없으면 결과 화면이 자연스럽게 축약된다.
 */
export interface MenuExplainability {
  decisionReason?: LocalizedMenuText;
  profileRelatedItems?: LocalizedMenuText[];
  ingredients?: MenuIngredientEvidence[];
  hiddenIngredientPaths?: LocalizedMenuText[][];
  sources?: MenuEvidenceSource[];
  uncertainties?: LocalizedMenuText[];
  curationId?: string;
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
  explainability?: MenuExplainability;
}

export interface PendingMenuImage {
  file: File | null;
  previewUrl: string;
  source: 'camera' | 'upload';
  storage?: {
    provider: 's3';
    key?: string;
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
  return new Intl.DateTimeFormat(LANGUAGE_LOCALES[language], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export default function App() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('han-spoon-language');
    return isLanguage(saved) ? saved : 'ko';
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<MenuAnalysis[]>([]);
  const [analysisImage, setAnalysisImage] = useState<PendingMenuImage | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('han-spoon-language', language);
  }, [language]);

  const loadCurrentUser = async () => {
    try {
      const user = await getMe();
      setCurrentUser(user);
      // 신규 언어는 백엔드 enum 확장 전까지 로컬 선택을 우선 보존한다.
      const locallySelected = localStorage.getItem('han-spoon-language');
      if (isLanguage(locallySelected) && !isBackendLanguage(locallySelected)) {
        setLanguage(locallySelected);
      } else if (isLanguage(user.languageCode)) {
        setLanguage(user.languageCode);
      }
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

  const loadHistory = async () => {
    try {
      const items = await getScanHistory();
      setAnalysisHistory(
        items.map((item) => ({
          id: item.scanId,
          title:
            item.title ??
            formatHistoryTitle(language, item.scannedAt ? new Date(item.scannedAt) : new Date()),
          date: item.scannedAt ?? new Date().toISOString(),
          menuCount: item.menuCount ?? 0,
          dangerCount: item.riskyMenuCount ?? 0,
          menus: [],
        })),
      );
    } catch (error) {
      console.warn('Unable to fetch scan history:', error);
    }
  };

  // 기록 열기: 상세를 백엔드에서 가져와 결과화면으로.
  const openHistory = async (item: HistoryItem) => {
    try {
      const result = await getScanResult(item.id);
      setCurrentAnalysis((result.menus ?? []).map(mapMenuResult));
      setAnalysisImage(null);
      navigate('/results');
    } catch (error) {
      console.error('Unable to open scan:', error);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteScan(id);
      setAnalysisHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Delete scan failed:', error);
    }
  };

  const handleRenameHistory = async (id: string, title: string) => {
    setAnalysisHistory((prev) => prev.map((item) => (item.id === id ? { ...item, title } : item)));
    try {
      await updateScanTitle(id, title);
    } catch (error) {
      console.error('Rename scan failed:', error);
      loadHistory();
    }
  };

  useEffect(() => {
    loadCurrentUser();
    loadUserProfile();
    loadHistory();

    return () => {
      if (analysisImage?.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(analysisImage.previewUrl);
      }
    };
  }, []);

  const handleLanguageChange = async (languageValue: Language) => {
    setLanguage(languageValue);
    localStorage.setItem('han-spoon-language', languageValue);

    try {
      const backendLanguage = toBackendLanguage(languageValue);
      await updateMe({ languageCode: backendLanguage });
      setCurrentUser((prev) => (prev ? { ...prev, languageCode: backendLanguage } : prev));
    } catch (error) {
      console.error('Language update failed:', error);
    }
  };

  const handleProfileSave = async (profile: UserProfile) => {
    const payload: UserProfilePayload = {
      nationality: profile.nationality.toUpperCase(),
      languageCode: toBackendLanguage(profile.languageCode),
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

    const wasEdit = Boolean(userProfile);
    setUserProfile(profile);
    setLanguage(profile.languageCode);
    localStorage.setItem('han-spoon-language', profile.languageCode);
    await loadCurrentUser();
    // 편집(기존 프로필)이면 마이페이지로, 신규 온보딩이면 홈으로.
    navigate(wasEdit ? '/mypage' : '/home');
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
    <div className="min-h-dvh bg-[var(--shell-background)] flex items-center justify-center sm:px-6">
      <div className="mobile-container w-full max-w-[430px] min-h-dvh bg-rice-cream shadow-[0_24px_80px_rgba(41,54,46,0.16)] relative overflow-hidden sm:border-x sm:border-border-warm">
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
                onHistory={openHistory}
                onMyPage={() => navigate('/mypage')}
                history={analysisHistory}
                onDeleteHistory={handleDeleteHistory}
                onRenameHistory={handleRenameHistory}
              />
            }
          />
          <Route
            path="/curation"
            element={<CurationScreen language={language} onMyPage={() => navigate('/mypage')} />}
          />
          <Route path="/curation/:id" element={<CurationDetailScreen language={language} />} />
          <Route
            path="/cards"
            element={<CardsScreen language={language} onMyPage={() => navigate('/mypage')} />}
          />
          <Route
            path="/analyzing"
            element={
              <AnalyzingScreen
                language={language}
                image={analysisImage}
                onComplete={(_scanId, menus) => {
                  setCurrentAnalysis(menus);
                  setAnalysisImage(null);
                  navigate('/results');
                  // 백엔드에 영속된 최신 기록으로 목록 갱신.
                  loadHistory();
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
          {import.meta.env.DEV && (
            <Route
              path="/dev/results-preview"
              element={<DevResultsPreview fallbackLanguage={language} />}
            />
          )}
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
                onEditProfile={(section) =>
                  navigate('/onboarding', section ? { state: { editSection: section } } : undefined)
                }
                onHistoryClick={openHistory}
                onEditHistoryTitle={handleRenameHistory}
                onDeleteHistory={handleDeleteHistory}
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
