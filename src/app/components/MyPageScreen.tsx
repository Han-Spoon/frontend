import { useState } from 'react';
import { ArrowLeft, User, LogOut, ChevronRight } from 'lucide-react';
import { logout } from '../../api/auth';
import { deleteMe } from '../../api/user';
import type { CurrentUser } from '../../api/user';
import type { Language, UserAllergy, UserProfile } from '../App';
import { getAllergyName } from '../i18n';
import {
  RELIGION_OPTIONS,
  VEGETARIAN_OPTIONS,
  getCountryFlag,
  getCountryName,
} from '../constants/onboarding';

type ProfileSection = 'language' | 'country' | 'diet';

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
  arabic: string;
}

interface MyPageScreenProps {
  language: Language;
  setLanguage: (language: Language) => void;
  currentUser: CurrentUser | null;
  userProfile: UserProfile | null;
  history: HistoryItem[];
  onBack: () => void;
  /** section 미지정 시 전체 온보딩(신규 생성), 지정 시 해당 단위만 수정 */
  onEditProfile: (section?: ProfileSection) => void;
  onHistoryClick: (item: HistoryItem) => void;
  onEditHistoryTitle: (id: string, title: string) => void;
  onLogout: () => void;
}

type TabType = 'profile' | 'history' | 'saved';

export function MyPageScreen({
  language,
  currentUser,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [editingHistoryTitle, setEditingHistoryTitle] = useState('');
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string | null>(null);

  const savedCards: SavedCard[] = [
    {
      id: 'saved-1',
      korean: '비빔밥 하나 주세요',
      english: 'One Bibimbap, please',
      arabic: 'واحد بيبيمباب من فضلك',
    },
    {
      id: 'saved-2',
      korean: '저는 갑각류 알레르기가 있어요. 갑각류 빼고 만들어 주실 수 있나요?',
      english: "I'm allergic to shellfish. Can you make it without shellfish?",
      arabic: 'لدي حساسية من المحار والقشريات. هل يمكن تحضيره بدونها؟',
    },
  ];

  const selectedSavedCard = savedCards.find((card) => card.id === selectedSavedCardId);

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );
  const getSavedCardText = (card: SavedCard) => (
    language === 'ko' ? card.korean : language === 'ar' ? card.arabic : card.english
  );
  const getSavedCardSubText = (card: SavedCard) => (
    language === 'ko' ? card.english : card.korean
  );
  const getAllergyDisplayName = (allergy: string | UserAllergy) =>
    getAllergyName(allergy, language);

  const getVeganLabel = (code?: string | null) =>
    VEGETARIAN_OPTIONS.find((option) => option.value === code)?.label[language] ?? code ?? '';

  const getReligionLabel = (code?: string | null) =>
    RELIGION_OPTIONS.find((option) => option.value === code)?.label[language] ?? code ?? '';
  const languageOptions: { value: Language; label: string }[] = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' },
  ];
  const currentLanguageLabel = languageOptions.find((o) => o.value === language)?.label ?? language;

  const sectionHeader = (title: string, section: ProfileSection) => (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
      <button
        onClick={() => onEditProfile(section)}
        className="flex items-center gap-0.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        {t('수정', 'Edit', 'تعديل')}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  // 해당되면 흰색 배경, 아니면 회색 배경으로 표시.
  const dietRow = (active: boolean, emoji: string, label: string, detail?: string) => (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
        active ? 'bg-white border-neutral-200' : 'bg-neutral-50 border-transparent'
      }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className={`text-sm ${active ? 'text-neutral-900' : 'text-neutral-400'}`}>
        {label}
        {active && detail ? ` · ${detail}` : ''}
      </span>
    </div>
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      onLogout();
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMe();
      onLogout();
    } catch (error) {
      console.error('Delete account failed:', error);
      setDeleteError(
        typeof error === 'string'
          ? error
          : error instanceof Error
          ? error.message
          : 'Account deletion failed.'
      );
    }
  };

  // console.log(currentUser, 'Current user should be available in MyPageScreen');

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center px-5 relative flex-shrink-0">
        <button onClick={onBack} className="absolute left-5">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="font-semibold text-neutral-900 mx-auto">{t('마이페이지', 'My Page', 'صفحتي')}</h1>
      </div>

      <div className="px-5 py-6 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="font-semibold text-neutral-900 mb-1">
              {currentUser?.nickname ?? 'User'}
            </div>
            <div className="text-sm text-neutral-600">
              {currentUser?.email ?? 'user@example.com'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-neutral-200">
        {[
          { value: 'profile', label: t('프로필', 'Profile', 'الملف') },
          { value: 'history', label: t('기록', 'History', 'السجل') },
          { value: 'saved', label: t('저장한 카드', 'Saved Cards', 'البطاقات المحفوظة') },
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
          <div className="px-5 py-6 space-y-6">
            {userProfile ? (
              <>
                {/* 언어 */}
                <section>
                  {sectionHeader(t('언어', 'Language', 'اللغة'), 'language')}
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-white border-neutral-200">
                    <span className="text-sm text-neutral-900">{currentLanguageLabel}</span>
                  </div>
                </section>

                {/* 나라 */}
                <section>
                  {sectionHeader(t('나라', 'Country', 'البلد'), 'country')}
                  <div className="flex items-center gap-3 rounded-xl px-4 py-3 border bg-white border-neutral-200">
                    {userProfile.nationality ? (
                      <>
                        <span className="text-lg leading-none">{getCountryFlag(userProfile.nationality)}</span>
                        <span className="text-sm text-neutral-900">
                          {getCountryName(userProfile.nationality, language)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-neutral-400">{t('없음', 'None', 'لا شيء')}</span>
                    )}
                  </div>
                </section>

                {/* 식단 */}
                <section>
                  {sectionHeader(t('식단', 'Diet', 'النظام الغذائي'), 'diet')}
                  <div className="space-y-2">
                    {dietRow(!!userProfile.noSpicy, '🌶️', t('매운 음식 비선호', 'Avoid spicy food', 'تجنب الطعام الحار'))}
                    {dietRow(
                      !!userProfile.isVegan,
                      '🥗',
                      t('채식·비건', 'Vegetarian/Vegan', 'نباتي/نباتي صارم'),
                      getVeganLabel(userProfile.veganType),
                    )}
                    {dietRow(
                      !!userProfile.hasReligion,
                      '🙏',
                      t('종교 식단', 'Religious diet', 'نظام غذائي ديني'),
                      getReligionLabel(userProfile.religionType),
                    )}
                    {dietRow(!!userProfile.noAlcohol, '🍺', t('금주', 'No alcohol', 'بدون كحول'))}

                    {/* 알레르기 */}
                    <div
                      className={`rounded-xl px-4 py-3 border ${
                        userProfile.hasAllergies && userProfile.allergies.length > 0
                          ? 'bg-white border-neutral-200'
                          : 'bg-neutral-50 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg leading-none">🥜</span>
                        <span
                          className={`text-sm ${
                            userProfile.hasAllergies && userProfile.allergies.length > 0
                              ? 'text-neutral-900'
                              : 'text-neutral-400'
                          }`}
                        >
                          {t('음식 알레르기', 'Food allergies', 'حساسية الطعام')}
                        </span>
                      </div>
                      {userProfile.hasAllergies && userProfile.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pl-8">
                          {userProfile.allergies.map((allergy) => (
                            <span
                              key={getAllergyDisplayName(allergy)}
                              className="px-2 py-1 bg-neutral-100 border border-neutral-200 rounded-md text-xs text-neutral-700"
                            >
                              {getAllergyDisplayName(allergy)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400 pl-8">{t('없음', 'None', 'لا شيء')}</span>
                      )}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <p className="text-sm text-neutral-600">
                  {t('설정된 프로필이 없습니다', 'No profile set', 'لا يوجد ملف محدد')}
                </p>
                <button
                  onClick={() => onEditProfile()}
                  className="h-12 px-6 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors"
                >
                  {t('프로필 설정하기', 'Set up profile', 'إعداد الملف')}
                </button>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center px-4">
                <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-lg">
                  <div className="text-base font-semibold text-neutral-900 mb-4">
                    {t('정말 계정을 삭제하시겠습니까?', 'Delete your account?', 'هل تريد حذف حسابك؟')}
                  </div>
                  {deleteError && (
                    <p className="text-sm text-red-500 mb-3">{deleteError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 h-11 bg-white border border-neutral-300 rounded-xl text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                    >
                      {t('취소', 'Cancel', 'إلغاء')}
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="flex-1 h-11 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      {t('삭제', 'Delete', 'حذف')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="px-5 py-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">{t('스캔 이력', 'Scan history', 'سجل المسح')}</h3>

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
                            {t('저장', 'Save', 'حفظ')}
                          </button>
                          <button
                            onClick={() => setEditingHistoryId(null)}
                            className="flex-1 h-11 bg-white border border-neutral-300 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
                          >
                            {t('취소', 'Cancel', 'إلغاء')}
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
                              : language === 'ar'
                                ? `تم تحليل ${item.menuCount} عناصر • ${item.dangerCount} خطرة`
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
                          {t('수정', 'Edit', 'تعديل')}
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
                  {t('아직 스캔 기록이 없습니다', 'No scan history yet', 'لا يوجد سجل مسح بعد')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="px-5 py-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-4">{t('저장한 요청 카드', 'Saved request cards', 'بطاقات الطلب المحفوظة')}</h3>

            <div className="space-y-2">
              {savedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedSavedCardId(card.id)}
                  className="w-full p-4 bg-neutral-50 rounded-xl text-left hover:bg-neutral-100 transition-colors"
                >
                  <div className="text-sm text-neutral-900 mb-2">
                    {getSavedCardText(card)}
                  </div>
                  <div className="text-xs text-neutral-600">
                    {getSavedCardSubText(card)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 px-5 py-4 bg-white flex-shrink-0">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full h-12 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          {t('로그아웃', 'Log out', 'تسجيل الخروج')}
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
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{t('로그아웃', 'Log out', 'تسجيل الخروج')}</h3>
              <p className="text-sm text-neutral-600 mb-6">
                {t('정말 로그아웃하시겠습니까?', 'Are you sure you want to log out?', 'هل أنت متأكد أنك تريد تسجيل الخروج؟')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-11 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors"
                >
                  {t('취소', 'Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-11 bg-neutral-900 text-white rounded-xl text-sm font-medium hover:bg-neutral-800 transition-colors"
                >
                  {t('로그아웃', 'Log out', 'تسجيل الخروج')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedSavedCard && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedSavedCardId(null)} />
          <div
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up"
            style={{
              left: 'calc(50% - 195px)',
              width: '390px',
            }}
          >
            <div className="pt-3 pb-2 flex justify-center">
              <div className="w-12 h-1 bg-neutral-300 rounded-full" />
            </div>

            <div className="px-6 pb-8 pt-6 relative">
              <div className="mb-4">
                <div className="text-2xl font-bold text-neutral-900 leading-tight mb-2">
                  {getSavedCardText(selectedSavedCard)}
                </div>
                <div className="text-sm text-neutral-500">
                  {getSavedCardSubText(selectedSavedCard)}
                </div>
              </div>

              <div className="mb-6 p-4 bg-neutral-50 rounded-xl">
                <div className="text-xs text-neutral-500 mb-1">
                  {t('저장한 카드', 'Saved card', 'بطاقة محفوظة')}
                </div>
                <div className="font-medium text-neutral-900">{getSavedCardText(selectedSavedCard)}</div>
                <div className="text-xs text-neutral-500 mt-1">{getSavedCardSubText(selectedSavedCard)}</div>
              </div>

              <button
                onClick={() => setSelectedSavedCardId(null)}
                className="w-full h-12 rounded-xl text-sm font-medium transition-colors bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              >
                {t('닫기', 'Close', 'إغلاق')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
