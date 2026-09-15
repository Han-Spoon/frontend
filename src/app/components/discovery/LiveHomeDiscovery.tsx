import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Loader2, Map } from 'lucide-react';
import type { StoreCandidate } from '../../../api/store';
import type { Language } from '../../App';
import {
  AREA_CENTERS,
  AREAS,
  type DiscoverAreaId,
} from '../../demo/restaurants';
import { useStoreCandidates } from '../../hooks/useStoreCandidates';
import { createTranslator } from '../../locales';
import { localizeMenuText } from '../../results/resultViewModel';
import { StoreMap } from './StoreMap';
import { RestaurantRecommendations } from './RestaurantRecommendations';
import { restaurantReferencePhoto, restaurantRecommendationPhotos } from './restaurantPhotos';

const DEFAULT_AREA: DiscoverAreaId = 'cheongdam';
const [DEFAULT_LATITUDE, DEFAULT_LONGITUDE] = AREA_CENTERS[DEFAULT_AREA];
const DEFAULT_SEARCH_LOCATION = {
  latitude: DEFAULT_LATITUDE,
  longitude: DEFAULT_LONGITUDE,
};

export function LiveHomeDiscovery({
  language,
  onSelectStore,
}: {
  language: Language;
  selectedStore: StoreCandidate | null;
  onSelectStore: (store: StoreCandidate | null) => void;
}) {
  const t = createTranslator(language);
  const navigate = useNavigate();
  const [area, setArea] = useState<DiscoverAreaId>(DEFAULT_AREA);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const {
    candidates,
    error,
    isLoading,
    searchAt,
    searchLocation,
  } = useStoreCandidates('', {
    initialSearchLocation: DEFAULT_SEARCH_LOCATION,
    locateUser: false,
  });
  const selected =
    candidates.find((store) => store.storeId === selectedId) ??
    candidates[0] ??
    null;
  const recommended = candidates.slice(0, 6);
  const photos = restaurantRecommendationPhotos(recommended.map(store => store.categoryName));

  const selectArea = (nextArea: DiscoverAreaId) => {
    const [latitude, longitude] = AREA_CENTERS[nextArea];
    setArea(nextArea);
    setSelectedId(null);
    searchAt({ latitude, longitude });
  };

  const openMap = (store?: StoreCandidate) => {
    if (store) onSelectStore(store);
    navigate('/map', {
      state: searchLocation ? { searchCenter: searchLocation } : undefined,
    });
  };

  return (
    <>
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{t('EXPLORE THE MAP', 'EXPLORE THE MAP', 'استكشف الخريطة')}</p>
          <h2 className="mt-1 text-[22px] font-extrabold tracking-tight">
            {t(
              '오늘은 어느 동네를 살펴볼까요?',
              'Choose a neighborhood',
              'اختر حياً',
            )}
          </h2>
        </div>
      </div>

      <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
        {AREAS.filter((item) => item.id !== 'nearby').map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={area === item.id}
            onClick={() => selectArea(item.id)}
            className={
              'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-bold ' +
              (area === item.id
                ? 'border-brand-primary bg-brand-primary text-white'
                : 'border-border-warm bg-rice-white text-text-secondary')
            }
          >
            {localizeMenuText(item, language)}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-border-warm bg-rice-white shadow-[var(--shadow-card)]">
        <StoreMap
          language={language}
          stores={candidates.map((store) => ({
            id: String(store.storeId),
            name: storeName(store),
            lat: store.latitude,
            lng: store.longitude,
          }))}
          center={searchLocation ? {
            lat: searchLocation.latitude,
            lng: searchLocation.longitude,
          } : undefined}
          selectedId={selected ? String(selected.storeId) : null}
          onSelect={(store) => setSelectedId(Number(store.id))}
          className="h-[270px] w-full bg-[#e9eee5]"
        />
        <button
          type="button"
          onClick={() => openMap()}
          className="absolute end-3 top-3 flex min-h-10 items-center gap-1.5 rounded-full bg-soy-ink px-3.5 text-xs font-bold text-white shadow-md"
        >
          <Map className="size-4" />
          {t('전체 지도', 'Full map', 'الخريطة كاملة')}
        </button>

        {selected ? (
          <button
            type="button"
            onClick={() => openMap(selected)}
            className="absolute inset-x-3 bottom-3 flex min-h-[86px] items-center gap-3 rounded-[22px] border border-white/70 bg-rice-white/95 p-3 text-start shadow-[0_14px_38px_rgba(35,42,37,.16)] backdrop-blur"
          >
            <img
              src={photos[recommended.findIndex(store => store.storeId === selected.storeId)] ?? restaurantReferencePhoto(selected.categoryName)}
              alt=""
              className="size-16 shrink-0 rounded-2xl object-cover"
            />
            <span className="min-w-0 flex-1">
              {selected.verified && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-primary px-2 py-1 text-[10px] font-extrabold text-white">
                  <BadgeCheck className="size-3.5" aria-hidden="true" />
                  {t('서비스 등록 확인', 'Listing verified', 'تم التحقق من التسجيل')}
                </span>
              )}
              <span className="mt-1.5 block truncate text-sm font-extrabold">
                {storeName(selected)}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-text-secondary">
                {selected.categoryName || selected.roadAddress || t('등록된 식당', 'Registered restaurant', 'مطعم مسجل')}{' · '}
                {formatDistance(selected.distanceMeters)}
              </span>
            </span>
            <ArrowRight className="size-5 shrink-0 rtl:rotate-180" />
          </button>
        ) : (
          <div
            role={error ? 'alert' : 'status'}
            className="absolute inset-x-3 bottom-3 flex min-h-[86px] items-center justify-center rounded-[22px] border border-white/70 bg-rice-white/95 p-3 text-center text-xs font-semibold text-text-secondary shadow-[0_14px_38px_rgba(35,42,37,.16)] backdrop-blur"
          >
            {isLoading ? (
              <>
                <Loader2 className="me-2 size-4 animate-spin" />
                {t('식당을 찾고 있어요.', 'Finding restaurants…', 'جارٍ البحث عن المطاعم…')}
              </>
            ) : error ? (
              t('식당 목록을 불러오지 못했어요.', 'Could not load restaurants.', 'تعذر تحميل المطاعم.')
            ) : (
              t('이 지역에 등록된 식당이 없어요.', 'No registered restaurants in this area.', 'لا توجد مطاعم مسجلة في هذه المنطقة.')
            )}
          </div>
        )}
      </div>
    </section>
    <RestaurantRecommendations
      language={language}
      areaName={localizeMenuText(AREAS.find(item => item.id === area)!, language)}
      items={recommended.map((store, index) => ({
        id: String(store.storeId),
        name: storeName(store),
        category: store.categoryName ?? '',
        address: store.roadAddress ?? '',
        image: photos[index],
      }))}
      loading={isLoading}
      error={error}
      onRetry={() => selectArea(area)}
      onSelect={id => {
        const store = candidates.find(candidate => String(candidate.storeId) === id);
        if (store) openMap(store);
      }}
    />
    </>
  );
}

function storeName(store: StoreCandidate) {
  return store.branchName ? `${store.name} ${store.branchName}` : store.name;
}

function formatDistance(meters: number) {
  return meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;
}
