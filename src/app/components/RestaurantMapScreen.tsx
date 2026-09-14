import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Utensils,
  ChevronRight,
  Heart,
  MapPin,
  Navigation,
  Search,
  Loader2,
  Users,
  X,
} from 'lucide-react';
import type { StoreCandidate } from '../../api/store';
import type { Language, UserProfile } from '../App';
import {
  AREAS,
  RESTAURANTS,
  profileMatches,
  restaurantsInArea,
  type AreaId,
  type Restaurant,
} from '../demo/restaurants';
import { useDemoValue } from '../demo/storage';
import { createTranslator } from '../locales';
import {
  getProfileCommunicationItems,
  localizeMenuText,
} from '../results/resultViewModel';
import { menuPrice } from '../demo/currency';
import { StoreMap } from './discovery/StoreMap';
import { BottomSheet } from './discovery/BottomSheet';
import { PartnershipBadge } from './discovery/PartnershipBadge';
import { BottomNav } from './BottomNav';
import { useStoreCandidates } from '../hooks/useStoreCandidates';

function isAreaId(value: string | null): value is AreaId {
  return AREAS.some((area) => area.id === value);
}

export function RestaurantMapScreen({
  language,
  userProfile,
  demoMode,
  selectedStore,
  onSelectStore,
}: {
  language: Language;
  userProfile: UserProfile | null;
  demoMode: boolean;
  selectedStore: StoreCandidate | null;
  onSelectStore: (store: StoreCandidate | null) => void;
}) {
  if (!demoMode) {
    return <LiveRestaurantMapScreen language={language} selectedStore={selectedStore} onSelectStore={onSelectStore} />;
  }

  return <DemoRestaurantMapScreen language={language} userProfile={userProfile} />;
}

function DemoRestaurantMapScreen({
  language,
  userProfile,
}: {
  language: Language;
  userProfile: UserProfile | null;
}) {
  const t = createTranslator(language);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedArea = searchParams.get('area');
  const initialRestaurant = RESTAURANTS.find(
    (restaurant) => restaurant.id === searchParams.get('restaurant'),
  );
  const initialArea: AreaId = initialRestaurant?.area
    ?? (isAreaId(requestedArea) ? requestedArea : 'nearby');
  const initialCandidates = restaurantsInArea(initialArea);
  const area = initialArea;
  const [selectedId, setSelectedId] = useState(
    initialRestaurant?.id ?? initialCandidates[0].id,
  );
  const detail = initialRestaurant ?? null;
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  useEffect(() => {
    if (area !== 'nearby' || location) return;
    let cancelled = false;
    if (!navigator.geolocation) { setLocationStatus('fallback'); return; }
    navigator.geolocation.getCurrentPosition(position => {
      if (cancelled) return;
      setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      setLocationStatus('ready');
    }, () => { if (!cancelled) setLocationStatus('fallback'); }, { timeout: 8000, maximumAge: 300000 });
    return () => { cancelled = true; };
  }, [area, location]);
  const [query, setQuery] = useState('');
  const [saved, setSaved] = useDemoValue<string[]>('saved-restaurants', []);
  const [, setSelectedRestaurant] = useDemoValue<string | null>(
    'selected-restaurant',
    null,
  );
  const restaurants = useMemo(() => {
    if (area !== 'nearby' || !location) return restaurantsInArea(area);
    const distance = (r: Restaurant) => Math.hypot((r.lat - location.lat) * 111, (r.lng - location.lng) * 111 * Math.cos(location.lat * Math.PI / 180));
    return RESTAURANTS.filter(r => distance(r) <= 10).sort((a, b) => distance(a) - distance(b)).slice(0, 6);
  }, [area, location]);
  const mapStores = useMemo(
    () =>
      restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: localizeMenuText(restaurant.name, language),
        lat: restaurant.lat,
        lng: restaurant.lng,
      })),
    [language, restaurants],
  );
  const selected =
    initialRestaurant ?? restaurants.find((restaurant) => restaurant.id === selectedId) ??
    restaurants[0];
  const profileItems = getProfileCommunicationItems(userProfile);
  const searchResults = query.trim()
    ? RESTAURANTS.filter((restaurant) =>
        `${Object.values(restaurant.name).join(' ')} ${Object.values(AREAS.find((item) => item.id === restaurant.area)!).join(' ')} ${restaurant.address}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      ).slice(0, 6)
    : [];

  const chooseArea = (nextArea: AreaId) => {
    const first = restaurantsInArea(nextArea)[0];
    setSelectedId(first.id);
    setSearchParams({ area: nextArea }, { replace: true });
  };

  const openRestaurant = (restaurant: Restaurant) => {
    setSelectedId(restaurant.id);
    setQuery('');
    setSearchParams(
      { area: restaurant.area, restaurant: restaurant.id },
      { replace: true },
    );
  };

  const closeDetail = () => {
    setSearchParams({ area }, { replace: true });
  };

  const scanRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant.id);
    navigate(restaurant.partnership === 'recipe-verified' ? `/restaurants/${restaurant.id}/menu` : '/scan');
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-[#e9eee5] text-soy-ink">
      <div className="absolute inset-x-0 top-0 bottom-[72px]">
        <StoreMap
          language={language}
          stores={mapStores}
          center={area === 'nearby' ? location ?? undefined : undefined}
          selectedId={selected?.id}
          onSelect={(store) => {
            const restaurant = restaurants.find((item) => item.id === store.id);
            if (restaurant) openRestaurant(restaurant);
          }}
          className="h-full min-h-[560px] w-full bg-[#e9eee5]"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-44 bg-gradient-to-b from-rice-cream via-rice-cream/90 to-transparent" />

      <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center gap-3 px-4 pt-[env(safe-area-inset-top)]">
        <button
          onClick={() => navigate('/home')}
          aria-label={t('홈으로', 'Back home', 'العودة للرئيسية')}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-warm bg-rice-white/95 shadow-sm backdrop-blur"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-border-warm bg-rice-white/95 px-4 shadow-sm backdrop-blur">
          <Search className="size-4 shrink-0 text-text-secondary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(
              '식당 또는 지역 검색',
              'Search restaurants or areas',
              'ابحث عن مطعم أو منطقة',
            )}
            aria-label={t('식당 검색', 'Search restaurants', 'ابحث عن مطعم')}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-text-tertiary"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('검색 지우기', 'Clear search', 'مسح البحث')}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </header>

      {query.trim() && (
        <div className="absolute inset-x-4 top-[60px] z-40 overflow-hidden rounded-[22px] border border-border-warm bg-rice-white p-2 shadow-[var(--shadow-float)]">
          {searchResults.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => openRestaurant(restaurant)}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-3 text-start hover:bg-brand-primary-soft"
            >
              <MapPin className="size-4 shrink-0 text-brand-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">{localizeMenuText(restaurant.name, language)}</span>
                <span className="block truncate text-xs text-text-secondary">{localizeMenuText(AREAS.find((item) => item.id === restaurant.area)!, language)} · {localizeMenuText(restaurant.category, language)}</span>
              </span>
              <PartnershipBadge restaurant={restaurant} language={language} compact />
            </button>
          ))}
          {searchResults.length === 0 && (
            <p className="px-3 py-5 text-center text-sm text-text-secondary">{t('검색 결과가 없어요.', 'No matches found.', 'لا توجد نتائج.')}</p>
          )}
        </div>
      )}

      <nav
        aria-label={t('지역 선택', 'Choose area', 'اختر المنطقة')}
        className="absolute inset-x-0 top-[68px] z-30 flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none]"
      >
        {AREAS.map((item) => (
          <button
            key={item.id}
            onClick={() => chooseArea(item.id)}
            aria-pressed={item.id === area}
            className={
              'inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-bold shadow-sm ' +
              (item.id === area
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border-warm bg-rice-white/95 text-text-secondary backdrop-blur')
            }
          >
            {item.id === 'nearby' && <Navigation className="size-3" />}
            {localizeMenuText(item, language)}
          </button>
        ))}
      </nav>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-52 bg-gradient-to-t from-rice-cream via-rice-cream/85 to-transparent" />
      <section className="absolute inset-x-0 bottom-[72px] z-30 px-3 pb-[max(14px,env(safe-area-inset-bottom))]">
        {area === 'nearby' && locationStatus !== 'ready' && <p role="status" className="mb-2 rounded-2xl bg-rice-white/95 p-3 text-xs shadow-sm">{locationStatus === 'loading' ? t('현재 위치를 확인하고 있어요.', 'Finding your location…', 'جارٍ تحديد موقعك…') : t('위치를 확인하지 못해 성수 식당을 보여드려요. 지역을 선택할 수 있어요.', 'Location unavailable. Showing Seongsu; you can choose another area.', 'تعذر تحديد الموقع. نعرض سونغسو ويمكنك اختيار منطقة أخرى.')}</p>}
        <div className="mb-2 flex items-center justify-between px-2">
          <p className="text-xs font-extrabold">
            {t('이 지역의 식당', 'Places in this area', 'مطاعم في هذه المنطقة')}{' '}
            · {restaurants.length}
          </p>
        </div>
        {selected ? <button
          onClick={() => openRestaurant(selected)}
          className="flex min-h-[106px] w-full items-center gap-3 rounded-[26px] border border-border-warm bg-rice-white/95 p-3 text-start shadow-[0_18px_50px_rgba(35,42,37,.18)] backdrop-blur"
        >
          <img
            src={selected.image}
            alt=""
            className="size-20 shrink-0 rounded-[20px] object-cover"
          />
          <span className="min-w-0 flex-1">
            <PartnershipBadge
              restaurant={selected}
              language={language}
              compact
            />
            <span className="mt-2 block truncate font-extrabold">
              {localizeMenuText(selected.name, language)}
            </span>
            <span className="mt-1 block truncate text-xs text-text-secondary">
              <MapPin className="me-1 inline size-3" />
              {localizeMenuText(AREAS.find((item) => item.id === selected.area)!, language)} · {localizeMenuText(selected.category, language)}
            </span>
            <span className="mt-1 flex flex-col gap-1 text-[11px] font-semibold text-brand-primary">
              <span>{t('1인 예상', 'Per person', 'تقدير للفرد')} <span className="whitespace-nowrap">{menuPrice(String(selected.price), language)?.original}</span></span>
              <span className="flex items-center gap-1"><Users className="size-3 shrink-0" />{selected.feedback.reduce((total, item) => total + item.total, 0)} {t('식단 경험', 'dietary experiences', 'تجربة غذائية')}</span>
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 rtl:rotate-180" />
        </button> : <div className="rounded-[24px] bg-rice-white p-5 shadow-lg"><p className="font-bold">{t('주변에 등록된 식당이 아직 없어요.', 'No listed restaurants nearby yet.', 'لا توجد مطاعم مسجلة بالقرب منك بعد.')}</p><p className="mt-2 text-xs text-text-secondary">{t('위의 지역 버튼으로 다른 동네를 둘러보세요.', 'Choose a neighborhood above to explore.', 'اختر حياً من الأعلى للاستكشاف.')}</p></div>}
      </section>
      <div className="absolute inset-x-0 bottom-0 z-30"><BottomNav language={language} /></div>

      {detail && (
        <BottomSheet
          language={language}
          onClose={closeDetail}
          title={localizeMenuText(detail.name, language)}
          description={`${localizeMenuText(AREAS.find((item) => item.id === detail.area)!, language)} · ${localizeMenuText(detail.category, language)} · ${t('1인 예상', 'Est. per person', 'تقدير للفرد')} ${menuPrice(String(detail.price), language)?.original}`}
        >
          <div className="relative mb-4 overflow-hidden rounded-[24px]">
            <img
              src={detail.image}
              alt=""
              className="h-48 w-full object-cover"
            />
            <div className="absolute start-3 top-3">
              <PartnershipBadge restaurant={detail} language={language} />
            </div>
          </div>
          {detail.partnership === 'recipe-verified' && (
            <div className="mb-5 rounded-2xl bg-brand-primary-soft p-3.5">
              <p className="text-sm font-extrabold text-brand-primary">
                {t(
                  '한스푼 파트너가 모든 레시피를 제공했어요.',
                  'This partner supplied every recipe to Han Spoon.',
                  'قدم هذا الشريك جميع الوصفات إلى Han Spoon.',
                )}
              </p>
              <p className="mt-1 text-xs leading-5 text-text-secondary">
                {t(
                  '레시피 인증은 정보 확인 범위를 뜻하며, 개인별 섭취 안전을 보장하지 않아요.',
                  'Recipe verification describes information coverage, not a guarantee of individual dietary safety.',
                  'توثيق الوصفات يصف نطاق المعلومات ولا يضمن السلامة الغذائية الفردية.',
                )}
              </p>
            </div>
          )}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => scanRestaurant(detail)}
              className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 text-sm font-bold text-white"
            >
              {detail.partnership === 'recipe-verified' ? <Utensils className="size-4" /> : <Camera className="size-4" />}
              {detail.partnership === 'recipe-verified' ? t('내 프로필로 메뉴 보기', 'View menus for my profile', 'القائمة حسب ملفي') : t(
                '이 식당 메뉴 스캔',
                'Scan this restaurant’s menu',
                'امسح قائمة هذا المطعم',
              )}
            </button>
            <button
              aria-pressed={saved.includes(detail.id)}
              aria-label={t('식당 찜하기', 'Save restaurant', 'احفظ المطعم')}
              onClick={() =>
                setSaved(
                  saved.includes(detail.id)
                    ? saved.filter((id) => id !== detail.id)
                    : [...saved, detail.id],
                )
              }
              className="flex size-13 items-center justify-center rounded-2xl border border-border-warm text-brand-accent"
            >
              <Heart
                className={
                  'size-5 ' + (saved.includes(detail.id) ? 'fill-current' : '')
                }
              />
            </button>
          </div>

          <h3 className="flex items-center gap-2 font-extrabold">
            <Users className="size-4 text-brand-primary" />
            {t(
              '나와 같은 프로필의 경험',
              'Experiences from people like you',
              'تجارب أشخاص باحتياجات مماثلة',
            )}
          </h3>
          <p className="mb-3 mt-1 text-xs leading-5 text-text-secondary">
            {t(
              '선택한 조건이 하나 이상 같은 방문자의 선택형 후기예요.',
              'Feedback from diners sharing at least one of your preferences.',
              'آراء زوار يشاركونك تفضيلاً غذائياً واحداً على الأقل.',
            )}
          </p>
          {profileMatches(detail, userProfile).map((feedback) => {
            const profileItem = profileItems.find(
              (item) => item.id === feedback.profileId,
            );
            return (
              <div
                key={feedback.profileId}
                className="mb-2 rounded-2xl bg-brand-primary-soft p-3.5"
              >
                <p className="text-xs font-extrabold text-brand-primary">
                  {profileItem
                    ? localizeMenuText(profileItem.label, language)
                    : feedback.profileId}
                </p>
                <p className="mt-1 text-sm leading-6">
                  {t(
                    `${feedback.total}명 중 ${feedback.positive}명이 요청을 전달하기 편했어요`,
                    `${feedback.positive} of ${feedback.total} diners found it easy to discuss their needs`,
                    `${feedback.positive} من ${feedback.total} زائراً وجدوا التواصل سهلاً`,
                  )}
                </p>
              </div>
            );
          })}
          {profileMatches(detail, userProfile).length === 0 && (
            <p className="rounded-2xl bg-surface-subtle p-4 text-sm leading-6">
              {userProfile
                ? t(
                    '아직 같은 프로필의 후기가 없어요.',
                    'No matching dietary feedback yet.',
                    'لا توجد آراء مطابقة لملفك بعد.',
                  )
                : t(
                    '식단 프로필을 설정하면 나와 비슷한 사람들의 경험을 볼 수 있어요.',
                    'Set your profile to see experiences from similar diners.',
                    'حدد ملفك لرؤية تجارب زوار مشابهين.',
                  )}
            </p>
          )}
        </BottomSheet>
      )}
    </div>
  );
}

function LiveRestaurantMapScreen({
  language,
  selectedStore,
  onSelectStore,
}: {
  language: Language;
  selectedStore: StoreCandidate | null;
  onSelectStore: (store: StoreCandidate | null) => void;
}) {
  const t = createTranslator(language);
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const initialCenterApplied = useRef(false);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(selectedStore?.storeId ?? null);
  const {
    candidates,
    error,
    isLoading,
    locationStatus,
    retryLocation,
    searchAt,
    searchAtCurrentLocation,
    searchLocation,
    searchOrigin,
  } = useStoreCandidates(query);
  const initialSearchCenter = (
    routeLocation.state as {
      searchCenter?: { latitude: number; longitude: number };
    } | null
  )?.searchCenter;
  const selected = candidates.find((store) => store.storeId === selectedId) ?? candidates[0] ?? null;

  useEffect(() => {
    if (
      initialCenterApplied.current ||
      locationStatus !== 'ready' ||
      !initialSearchCenter
    ) return;
    initialCenterApplied.current = true;
    searchAt(initialSearchCenter);
  }, [initialSearchCenter, locationStatus, searchAt]);

  const storeName = (store: StoreCandidate) =>
    store.branchName ? `${store.name} ${store.branchName}` : store.name;
  const mapStores = candidates.map((store) => ({
    id: String(store.storeId),
    name: storeName(store),
    lat: store.latitude,
    lng: store.longitude,
  }));

  const selectAndScan = (store: StoreCandidate) => {
    onSelectStore(store);
    navigate('/scan');
  };

  return (
    <div className="relative h-dvh overflow-hidden bg-[#e9eee5] text-soy-ink">
      <div className="absolute inset-x-0 top-0 bottom-[72px]">
        {locationStatus === 'ready' ? (
          <StoreMap
            language={language}
            stores={mapStores}
            center={searchLocation ? { lat: searchLocation.latitude, lng: searchLocation.longitude } : undefined}
            selectedId={selected ? String(selected.storeId) : null}
            onSelect={(mapStore) => setSelectedId(Number(mapStore.id))}
            onCenterChange={(center) => searchAt({ latitude: center.lat, longitude: center.lng })}
            fitStores={false}
            className="h-full min-h-[560px] w-full bg-[#e9eee5]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-surface-subtle px-8 text-center">
            {locationStatus === 'loading' ? (
              <div role="status" className="text-sm text-text-secondary">
                <Loader2 className="mx-auto mb-3 size-7 animate-spin text-brand-primary" />
                {t('현재 위치를 확인하고 있어요.', 'Finding your current location…', 'جارٍ تحديد موقعك الحالي…')}
              </div>
            ) : (
              <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                <AlertCircle className="mx-auto mb-2 size-6" />
                <p className="font-bold">{t('주변 식당을 찾으려면 위치 권한이 필요해요.', 'Location access is needed to find nearby restaurants.', 'يلزم إذن الموقع للعثور على المطاعم القريبة.')}</p>
                {locationStatus === 'denied' && <button type="button" onClick={retryLocation} className="mt-3 min-h-10 rounded-xl border border-amber-300 bg-white px-4 font-bold">{t('위치 다시 확인', 'Try location again', 'إعادة محاولة تحديد الموقع')}</button>}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-gradient-to-b from-rice-cream via-rice-cream/90 to-transparent" />

      <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center gap-3 px-4 pt-[env(safe-area-inset-top)]">
        <button
          type="button"
          onClick={() => navigate('/home')}
          aria-label={t('홈으로', 'Back home', 'العودة للرئيسية')}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-warm bg-rice-white/95 shadow-sm backdrop-blur"
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <label className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-border-warm bg-rice-white/95 px-4 shadow-sm backdrop-blur">
          <Search className="size-4 shrink-0 text-text-secondary" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={locationStatus !== 'ready'}
            placeholder={t('식당 이름 검색', 'Search by restaurant name', 'ابحث باسم المطعم')}
            aria-label={t('식당 검색', 'Search restaurants', 'ابحث عن مطعم')}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed"
          />
          {query && <button type="button" onClick={() => setQuery('')} aria-label={t('검색 지우기', 'Clear search', 'مسح البحث')} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle"><X className="size-4" /></button>}
        </label>
      </header>

      {locationStatus === 'ready' && searchOrigin === 'map-center' && (
        <button
          type="button"
          onClick={searchAtCurrentLocation}
          className="absolute end-4 top-[72px] z-30 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border-warm bg-rice-white/95 px-3.5 text-xs font-bold text-brand-primary shadow-sm backdrop-blur"
        >
          <Navigation className="size-3.5" />
          {t('내 위치', 'My location', 'موقعي')}
        </button>
      )}

      {locationStatus === 'ready' && (
        <section className="absolute inset-x-0 bottom-[72px] z-30 px-3 pb-[max(14px,env(safe-area-inset-bottom))]">
          <div className="mb-2 flex items-center justify-between rounded-full bg-rice-white/90 px-3 py-2 text-xs font-extrabold shadow-sm backdrop-blur">
            <span>{query.trim()
              ? t('이름 검색 결과', 'Name search results', 'نتائج البحث بالاسم')
              : searchOrigin === 'current-location'
                ? t('현재 위치 주변', 'Near your current location', 'بالقرب من موقعك الحالي')
                : t('지도 중심 주변', 'Around the map center', 'حول مركز الخريطة')} · {candidates.length}</span>
            {isLoading && <Loader2 className="size-4 animate-spin text-brand-primary" />}
          </div>

          {error ? (
            <div role="alert" className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-center text-sm text-red-800 shadow-lg">
              {t('식당 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not load restaurants. Please try again shortly.', 'تعذر تحميل المطاعم. يرجى المحاولة بعد قليل.')}
            </div>
          ) : selected ? (
            <div className="rounded-[26px] border border-border-warm bg-rice-white/95 p-4 shadow-[0_18px_50px_rgba(35,42,37,.18)] backdrop-blur">
              <div className="flex items-start gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary"><MapPin className="size-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-extrabold">{storeName(selected)}</p>
                  <p className="mt-1 truncate text-xs text-text-secondary">{selected.roadAddress || selected.categoryName || t('주소 정보 없음', 'Address unavailable', 'العنوان غير متوفر')}</p>
                  <p className="mt-1 text-[11px] font-semibold text-brand-primary">{selected.distanceMeters < 1000 ? `${Math.round(selected.distanceMeters)}m` : `${(selected.distanceMeters / 1000).toFixed(1)}km`}</p>
                </div>
              </div>
              <button type="button" onClick={() => selectAndScan(selected)} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-bold text-white">
                <Camera className="size-4" />
                {t('이 식당 메뉴 스캔', 'Scan this restaurant’s menu', 'امسح قائمة هذا المطعم')}
              </button>
            </div>
          ) : !isLoading ? (
            <div className="rounded-[24px] bg-rice-white p-5 text-center shadow-lg">
              <p className="font-bold">{query.trim() ? t('검색된 식당이 없어요.', 'No restaurant matched.', 'لم يتم العثور على مطعم.') : t('주변에 등록된 식당이 아직 없어요.', 'No registered restaurants nearby yet.', 'لا توجد مطاعم مسجلة بالقرب منك بعد.')}</p>
              <button type="button" onClick={() => navigate('/scan')} className="mt-3 min-h-10 text-sm font-bold text-brand-primary">{t('식당 없이 스캔하기', 'Scan without a restaurant', 'المسح بدون مطعم')}</button>
            </div>
          ) : null}
        </section>
      )}

      <div className="absolute inset-x-0 bottom-0 z-30"><BottomNav language={language} /></div>
    </div>
  );
}
