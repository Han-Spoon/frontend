import { useState } from 'react';
import { ArrowLeft, User, LogOut, ChevronRight } from 'lucide-react';
import { logout } from '../../api/auth';
import { deleteMe } from '../../api/user';
import type { CurrentUser } from '../../api/user';
import type { Language, UserAllergy, UserProfile } from '../App';
import { getAllergyName, translate } from '../i18n';
import { createTranslator, LANGUAGE_OPTIONS } from '../locales';
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

  const t = createTranslator(language);

  const getAllergyDisplayName = (allergy: string | UserAllergy) => getAllergyName(allergy, language);

  const getVeganLabel = (code?: string | null) => {
    const option = VEGETARIAN_OPTIONS.find((item) => item.value === code);
    return option ? translate(language, option.label) : code ?? '';
  };

  const getReligionLabel = (code?: string | null) => {
    const option = RELIGION_OPTIONS.find((item) => item.value === code);
    return option ? translate(language, option.label) : code ?? '';
  };

  const currentLanguageLabel = LANGUAGE_OPTIONS.find((o) => o.value === language)?.label ?? language;

  const sectionHeader = (title: string, section: ProfileSection) => (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-sm font-bold text-soy-ink">{title}</h3>
      <button
        onClick={() => onEditProfile(section)}
        className="flex min-h-9 items-center gap-0.5 text-xs font-bold text-brand-green-700 hover:text-brand-green-900 transition-colors"
      >
        {t('수정', 'Edit', 'تعديل')}
        <ChevronRight className="size-3.5 rtl:rotate-180" />
      </button>
    </div>
  );

  // 해당되면 흰색 배경, 아니면 회색 배경으로 표시.
  const dietRow = (active: boolean, emoji: string, label: string, detail?: string) => (
    <div
      className={`flex min-h-13 items-center gap-3 rounded-2xl px-4 py-3 border ${
        active ? 'bg-rice-white border-brand-green-100' : 'bg-muted/70 border-transparent'
      }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className={`text-sm ${active ? 'font-semibold text-soy-ink' : 'text-sesame-gray/65'}`}>
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
            : t('계정 삭제에 실패했습니다.', 'Account deletion failed.', 'فشل حذف الحساب.'),
      );
    }
  };

  return (
    <div className="h-dvh flex flex-col bg-rice-cream">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center px-5 relative flex-shrink-0">
        <button onClick={onBack} className="absolute start-4 inline-flex size-11 items-center justify-center rounded-full hover:bg-brand-green-50" aria-label={t('이전', 'Back', 'رجوع')}>
          <ArrowLeft className="size-5 text-soy-ink rtl:rotate-180" />
        </button>
        <h1 className="text-base font-bold text-soy-ink mx-auto">{t('마이페이지', 'My Page', 'صفحتي')}</h1>
      </div>

      <div className="px-5 py-6 border-b border-brand-green-100 bg-brand-green-50">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-[1.5rem] bg-brand-green-700 flex items-center justify-center shadow-sm">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-soy-ink mb-1">{currentUser?.nickname ?? t('사용자', 'User', 'مستخدم')}</div>
            <div className="text-sm text-sesame-gray break-all">{currentUser?.email ?? 'user@example.com'}</div>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border-warm bg-rice-white" role="tablist" aria-label={t('마이페이지 메뉴', 'My page sections', 'أقسام صفحتي')}>
        {[
          { value: 'profile', label: t('프로필', 'Profile', 'الملف') },
          { value: 'scan', label: t('스캔 기록', 'Scans', 'عمليات المسح') },
          { value: 'setting', label: t('설정', 'Setting', 'الإعدادات') },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value as TabType)}
            role="tab"
            aria-selected={activeTab === value}
            className={`flex-1 min-h-12 px-1 text-sm font-bold transition-colors relative ${
              activeTab === value ? 'text-brand-green-700' : 'text-sesame-gray hover:text-soy-ink'
            }`}
          >
            {label}
            {activeTab === value && <div className="absolute bottom-0 inset-x-3 h-0.5 rounded-full bg-brand-orange-500" />}
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
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border bg-rice-white border-border-warm">
                    <span className="text-sm font-semibold text-soy-ink">{currentLanguageLabel}</span>
                  </div>
                </section>

                {/* 나라 */}
                <section>
                  {sectionHeader(t('나라', 'Country', 'البلد'), 'country')}
                  <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border bg-rice-white border-border-warm">
                    {userProfile.nationality ? (
                      <>
                        <span className="text-lg leading-none">{getCountryFlag(userProfile.nationality)}</span>
                        <span className="text-sm font-semibold text-soy-ink">
                          {getCountryName(userProfile.nationality, language)}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-sesame-gray">{t('없음', 'None', 'لا شيء')}</span>
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
                      className={`rounded-2xl px-4 py-3 border ${
                        userProfile.hasAllergies && userProfile.allergies.length > 0
                          ? 'bg-rice-white border-brand-green-100'
                          : 'bg-muted/70 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg leading-none">🥜</span>
                        <span
                          className={`text-sm ${
                            userProfile.hasAllergies && userProfile.allergies.length > 0
                              ? 'font-semibold text-soy-ink'
                              : 'text-sesame-gray/65'
                          }`}
                        >
                          {t('음식 알레르기', 'Food allergies', 'حساسية الطعام')}
                        </span>
                      </div>
                      {userProfile.hasAllergies && userProfile.allergies.length > 0 ? (
                        <div className="flex flex-wrap gap-2 ps-8">
                          {userProfile.allergies.map((allergy) => (
                            <span
                              key={getAllergyDisplayName(allergy)}
                              className="px-2.5 py-1 bg-brand-green-50 border border-brand-green-100 rounded-lg text-xs font-semibold text-brand-green-700"
                            >
                              {getAllergyDisplayName(allergy)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-sesame-gray ps-8">{t('없음', 'None', 'لا شيء')}</span>
                      )}
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <div className="py-12 text-center space-y-4">
                <p className="text-sm text-sesame-gray">
                  {t('설정된 프로필이 없습니다', 'No profile set', 'لا يوجد ملف محدد')}
                </p>
                <button
                  onClick={() => onEditProfile()}
                  className="h-13 px-6 bg-brand-green-700 text-white text-sm font-bold rounded-2xl hover:bg-brand-green-900 transition-colors"
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
                <p className="text-sm text-sesame-gray">
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
              className="w-full h-13 bg-rice-white border border-border-warm text-soy-ink text-sm font-bold rounded-2xl hover:bg-brand-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t('로그아웃', 'Log out', 'تسجيل الخروج')}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-13 border border-red-400 bg-rice-white text-red-600 text-sm font-bold rounded-2xl hover:bg-red-50 transition-colors"
            >
              {t('회원 탈퇴', 'Delete account', 'حذف الحساب')}
            </button>
          </div>
        )}
      </div>

      {showLogoutConfirm && (
        <>
          <div className="fixed inset-0 bg-soy-ink/55 z-40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="fixed inset-x-5 top-1/2 z-50 mx-auto max-w-[350px] -translate-y-1/2">
            <div className="bg-rice-white border border-border-warm rounded-[1.5rem] p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title" aria-describedby="logout-dialog-description">
              <h3 id="logout-dialog-title" className="text-lg font-bold text-soy-ink mb-2">{t('로그아웃', 'Log out', 'تسجيل الخروج')}</h3>
              <p id="logout-dialog-description" className="text-sm text-sesame-gray mb-6">
                {t('정말 로그아웃하시겠습니까?', 'Are you sure you want to log out?', 'هل أنت متأكد أنك تريد تسجيل الخروج؟')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 h-12 bg-brand-green-50 text-brand-green-700 rounded-2xl text-sm font-bold hover:bg-brand-green-100 transition-colors"
                >
                  {t('취소', 'Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 h-12 bg-brand-green-700 text-white rounded-2xl text-sm font-bold hover:bg-brand-green-900 transition-colors"
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
          <div className="fixed inset-0 bg-soy-ink/55 z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed inset-x-5 top-1/2 z-50 mx-auto max-w-[350px] -translate-y-1/2">
            <div className="bg-rice-white border border-border-warm rounded-[1.5rem] p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="delete-dialog-title" aria-describedby="delete-dialog-description">
              <h3 id="delete-dialog-title" className="text-lg font-bold text-soy-ink mb-2">
                {t('회원 탈퇴', 'Delete account', 'حذف الحساب')}
              </h3>
              <p id="delete-dialog-description" className="text-sm text-sesame-gray mb-4">
                {t(
                  '정말 계정을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.',
                  'Delete your account? All data will be removed.',
                  'هل تريد حذف حسابك؟ سيتم حذف جميع البيانات.',
                )}
              </p>
              {deleteError && <p className="text-sm text-red-500 mb-3" role="alert">{deleteError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-12 bg-rice-white border border-border-warm rounded-2xl text-sm font-bold text-soy-ink hover:bg-brand-green-50 transition-colors"
                >
                  {t('취소', 'Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 h-12 bg-red-600 text-white rounded-2xl text-sm font-bold hover:bg-red-700 transition-colors"
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
