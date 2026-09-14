import { useNavigate, useParams } from 'react-router-dom';
import type { Language, UserProfile } from '../App';
import { RESTAURANTS } from '../demo/restaurants';
import { buildPartnerMenus } from '../demo/partnerMenus';
import { ResultsScreen } from './ResultsScreen';
import { createTranslator } from '../locales';

export function PartnerMenuScreen({ language, userProfile }: { language: Language; userProfile: UserProfile | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const t = createTranslator(language);
  const restaurant = RESTAURANTS.find(item => item.id === id && item.partnership === 'recipe-verified');
  if (!restaurant) return <div className="flex h-dvh flex-col items-center justify-center gap-5 px-6 text-center"><h1 className="text-xl font-bold">{t('등록된 메뉴가 없는 식당이에요.', 'No partner menu is available.', 'لا توجد قائمة شريك متاحة.')}</h1><button onClick={() => navigate('/map')} className="rounded-full bg-brand-primary px-6 py-3 text-white">{t('지도로 돌아가기', 'Back to map', 'العودة إلى الخريطة')}</button></div>;
  return <ResultsScreen key={`${id}-${JSON.stringify(userProfile)}`} language={language} menus={buildPartnerMenus(restaurant, userProfile)} userProfile={userProfile} partnerRestaurantId={restaurant.id} onBack={() => navigate(`/map?area=${restaurant.area}&restaurant=${restaurant.id}`)} onRescan={() => navigate('/onboarding')} />;
}
