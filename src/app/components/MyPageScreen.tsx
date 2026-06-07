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
import { ScanHistoryList } from './ScanHistoryList';

type ProfileSection = 'language' | 'country' | 'diet';

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  menuCount: number;
  dangerCount: number;
  menus: any[];
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
  onDeleteHistory: (id: string) => void;
  onLogout: () => void;
}

type TabType = 'profile' | 'scan' | 'setting';

export function MyPageScreen({
  language,
  currentUser,
  userProfile,
  history,
  onBack,
  onEditProfile,
  onHistoryClick,
  onEditHistoryTitle,
  onDeleteHistory,
  onLogout,
}: MyPageScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  const getAllergyDisplayName = (allergy: string | UserAllergy) => getAllergyName(allergy, language);

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
            : 'Account deletion failed.',
      );
    }
  };

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
            <div className="font-semibold text-neutral-900 mb-1">{currentUser?.nickname ?? 'User'}</div>
            <div className="text-sm text-neutral-600">{currentUser?.email ?? 'user@example.com'}</div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-neutral-200">
        {[
          { value: 'profile', label: t('프로필', 'Profile', 'الملف') },
          { value: 'scan', label: t('스캔 기록', 'Scans', 'عمليات المسح') },
          { value: 'setting', label: t('설정', 'Setting', 'الإعدادات') },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value as TabType)}
            className={`flex-1 h-12 text-sm font-medium transition-colors relative ${
              activeTab === value ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'
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
          </div>
        )}

        {activeTab === 'scan' && (
          <div className="px-5 py-6">
            {history.length > 0 ? (
              <ScanHistoryList
                language={language}
                history={history}
                onOpen={onHistoryClick}
                onDelete={onDeleteHistory}
                onRename={onEditHistoryTitle}
              />
            ) : (
              <div className="py-16 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-sm text-neutral-600">
                  {t('스캔 기록이 없어요', 'No scan history yet', 'لا يوجد سجل مسح بعد')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'setting' && (
          <div className="px-5 py-6 space-y-3">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full h-12 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('로그아웃', 'Log out', 'تسجيل الخروج')}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-12 border border-red-500 text-red-500 text-sm font-medium rounded-xl hover:bg-red-50 transition-colors"
            >
              {t('회원 탈퇴', 'Delete account', 'حذف الحساب')}
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50" style={{ margin: '0 auto', width: '350px' }}>
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

      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-x-0 top-1/2 -translate-y-1/2 z-50" style={{ margin: '0 auto', width: '350px' }}>
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {t('회원 탈퇴', 'Delete account', 'حذف الحساب')}
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                {t(
                  '정말 계정을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.',
                  'Delete your account? All data will be removed.',
                  'هل تريد حذف حسابك؟ سيتم حذف جميع البيانات.',
                )}
              </p>
              {deleteError && <p className="text-sm text-red-500 mb-3">{deleteError}</p>}
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
        </>
      )}
    </div>
  );
}
