import { useState } from 'react';
import { ArrowLeft, User, LogOut, ChevronRight } from 'lucide-react';
import type { Language, UserProfile } from '../App';

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  menuCount: number;
  dangerCount: number;
  menus: any[];
}

interface SavedCard {
  id: string;
  korean: string;
  english: string;
}

interface MyPageScreenProps {
  language: Language;
  setLanguage: (language: Language) => void;
  userProfile: UserProfile | null;
  history: HistoryItem[];
  onBack: () => void;
  onEditProfile: () => void;
  onHistoryClick: (item: HistoryItem) => void;
  onEditHistoryTitle: (id: string, title: string) => void;
  onLogout: () => void;
}

type TabType = 'profile' | 'history' | 'saved';

export function MyPageScreen({
  language,
  setLanguage,
  userProfile,
  history,
  onBack,
  onEditProfile,
  onHistoryClick,
  onEditHistoryTitle,
  onLogout,
}: MyPageScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryTitle, setEditingHistoryTitle] = useState('');
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);

  const savedCards: SavedCard[] = [
    {
      id: 'saved-1',
      korean: '비빔밥 하나 주세요',
      english: 'One Bibimbap, please',
    },
    {
      id: 'saved-2',
      korean: '저는 갑각류 알레르기가 있어요. 갑각류 빼고 만들어 주실 수 있나요?',
      english: "I'm allergic to shellfish. Can you make it without shellfish?",
    },
  ];

  const selectedSavedCard = savedCards.find((card) => card.id === selectedSavedCardId);

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);
  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
  ];

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center px-5 relative flex-shrink-0">
        <button onClick={onBack} className="absolute left-5">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="font-semibold text-neutral-900 mx-auto">{t('마이페이지', 'My Page')}</h1>
      </div>

      <div className="px-5 py-6 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">{t('사용자', 'User')}</div>
            <div className="text-sm text-neutral-600">user@example.com</div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-neutral-200">
        {[
          { value: 'profile', label: t('프로필', 'Profile') },
          { value: 'history', label: t('기록', 'History') },
          { value: 'saved', label: t('저장한 카드', 'Saved Cards') },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value as TabType)}
            className={`flex-1 h-12 text-sm font-medium transition-colors relative ${
              activeTab === value
                ? 'text-neutral-900'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {label}
            {activeTab === value && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && (
          <div className="px-5 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900">{t('현재 식단 설정', 'Current profile settings')}</h3>
              <div className="flex items-center gap-2">
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
            </div>

            <div className="space-y-3 mb-6">
              {userProfile?.noSpicy && (
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <span className="text-sm text-neutral-900">{t('매운 음식 비선호', 'Avoid spicy food')}</span>
                </div>
              )}
              {userProfile?.isVegan && (
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <span className="text-sm text-neutral-900">
                    {t('채식·비건', 'Vegetarian/Vegan')} ({language === 'ko' ? userProfile.veganType : userProfile.veganType})
                  </span>
                </div>
              )}
              {userProfile?.hasReligion && (
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <span className="text-sm text-neutral-900">
                    {t('종교 식단', 'Religious diet')} ({language === 'ko' ? userProfile.religionType : userProfile.religionType})
                  </span>
                </div>
              )}
              {userProfile?.hasAllergies && userProfile.allergies.length > 0 && (
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <div className="text-sm text-neutral-900 mb-2">{t('음식 알레르기', 'Food allergies')}</div>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.allergies.map((allergy) => (
                      <span
                        key={allergy}
                        className="px-2 py-1 bg-white border border-neutral-300 rounded-md text-xs text-neutral-700"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {userProfile?.noAlcohol && (
                <div className="p-4 bg-neutral-50 rounded-xl">
                  <span className="text-sm text-neutral-900">{t('금주', 'No alcohol')}</span>
                </div>
              )}
              {!userProfile && (
                <div className="p-4 bg-neutral-50 rounded-xl text-center">
                  <span className="text-sm text-neutral-600">{t('설정된 프로필이 없습니다', 'No profile set')}</span>
                </div>
              )}
            </div>

            <button
              onClick={onEditProfile}
              className="w-full h-12 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
            >
              {t('프로필 수정', 'Edit profile')}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="px-5 py-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">{t('스캔 이력', 'Scan history')}</h3>

            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="space-y-2">
                    {editingHistoryId === item.id ? (
                      <div className="p-4 bg-neutral-50 rounded-xl space-y-3">
                        <input
                          value={editingHistoryTitle}
                          onChange={(e) => setEditingHistoryTitle(e.target.value)}
                          className="w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-neutral-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              onEditHistoryTitle(item.id, editingHistoryTitle.trim() || item.title);
                              setEditingHistoryId(null);
                            }}
                            className="flex-1 h-11 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                          >
                            {t('저장', 'Save')}
                          </button>
                          <button
                            onClick={() => setEditingHistoryId(null)}
                            className="flex-1 h-11 bg-white border border-neutral-300 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
                          >
                            {t('취소', 'Cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-neutral-50 rounded-xl flex items-start justify-between gap-3">
                        <button
                          onClick={() => onHistoryClick(item)}
                          className="text-left flex-1"
                        >
                          <div className="text-sm font-medium text-neutral-900 mb-1">{item.title}</div>
                          <div className="text-xs text-neutral-600">
                            {language === 'ko'
                              ? `메뉴 ${item.menuCount}개 분석 • 위험 메뉴 ${item.dangerCount}개`
                              : `Analyzed ${item.menuCount} items • ${item.dangerCount} risky`}
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setEditingHistoryId(item.id);
                            setEditingHistoryTitle(item.title);
                          }}
                          className="h-10 rounded-xl border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
                        >
                          {t('수정', 'Edit')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-sm text-neutral-600">
                  {t('아직 스캔 기록이 없습니다', 'No scan history yet')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="px-5 py-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">{t('저장한 요청 카드', 'Saved request cards')}</h3>

            {selectedSavedCard ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedSavedCardId(null)}
                  className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                >
                  ← {t('목록으로 돌아가기', 'Back to list')}
                </button>

                <div className="p-4 bg-neutral-50 rounded-xl">
                  <div className="text-sm text-neutral-900 mb-2">
                    {language === 'ko' ? selectedSavedCard.korean : selectedSavedCard.english}
                  </div>
                  <div className="text-xs text-neutral-600">
                    {language === 'ko' ? selectedSavedCard.english : selectedSavedCard.korean}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {savedCards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => setSelectedSavedCardId(card.id)}
                    className="w-full p-4 bg-neutral-50 rounded-xl text-left hover:bg-neutral-100 transition-colors"
                  >
                    <div className="text-sm text-neutral-900 mb-2">
                      {language === 'ko' ? card.korean : card.english}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {language === 'ko' ? card.english : card.korean}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 px-5 py-4 bg-white flex-shrink-0">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full h-12 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t('로그아웃', 'Log out')}
        </button>
      </div>

      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowLogoutConfirm(false)} />
          <div
            className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50 mx-5"
            style={{
              margin: '0 auto',
              width: '350px',
            }}
          >
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('로그아웃', 'Log out')}</h3>
              <p className="text-sm text-neutral-600 mb-6">
                {t('정말 로그아웃하시겠습니까?', 'Are you sure you want to log out?')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-11 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  {t('취소', 'Cancel')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-11 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  {t('로그아웃', 'Log out')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
