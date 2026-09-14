import { useState } from 'react';
import { AlertCircle, Check, Loader2, Map as MapIcon, MapPin, Navigation, Search } from 'lucide-react';
import type { StoreCandidate } from '../../../api/store';
import type { Language } from '../../App';
import {
  AREAS,
  RESTAURANTS,
  restaurantsInArea,
  type AreaId,
  type Restaurant,
} from '../../demo/restaurants';
import { localizeMenuText } from '../../results/resultViewModel';
import { createTranslator } from '../../locales';
import { useStoreCandidates } from '../../hooks/useStoreCandidates';
import { BottomSheet } from './BottomSheet';
import { PartnershipBadge } from './PartnershipBadge';
import { StoreMap } from './StoreMap';

interface RestaurantPickerProps {
  language: Language;
  demoMode: boolean;
  selectedId?: string | null;
  selectedStore?: StoreCandidate | null;
  onSelectDemo?: (restaurant: Restaurant | null) => void;
  onSelectStore?: (store: StoreCandidate | null) => void;
  onClose: () => void;
  allowSkip?: boolean;
}

export function RestaurantPicker(props: RestaurantPickerProps) {
  if (props.demoMode) {
    return (
      <DemoRestaurantPicker
        language={props.language}
        selectedId={props.selectedId}
        onSelect={props.onSelectDemo ?? (() => {})}
        onClose={props.onClose}
        allowSkip={props.allowSkip}
      />
    );
  }

  return (
    <LiveRestaurantPicker
      language={props.language}
      selectedStore={props.selectedStore}
      onSelect={props.onSelectStore ?? (() => {})}
      onClose={props.onClose}
      allowSkip={props.allowSkip}
    />
  );
}

function DemoRestaurantPicker({
  language,
  selectedId,
  onSelect,
  onClose,
  allowSkip = true,
}: {
  language: Language;
  selectedId?: string | null;
  onSelect: (restaurant: Restaurant | null) => void;
  onClose: () => void;
  allowSkip?: boolean;
}) {
  const t = createTranslator(language);
  const [area, setArea] = useState<AreaId>('nearby');
  // 지도는 기본으로 접어둔다. 후보가 대개 10개 안쪽이라 목록이 더 빠르고,
  // 펼칠 때만 네이버 SDK 를 받으므로 피커를 열 때의 네트워크 비용이 없다.
  const [showMap, setShowMap] = useState(false);
  const [query, setQuery] = useState('');
  const candidates = query.trim()
    ? RESTAURANTS.filter((r) =>
        `${Object.values(r.name).join(' ')} ${r.address} ${r.area}`
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase()),
      )
    : restaurantsInArea(area);
  return (
    <BottomSheet
      language={language}
      onClose={onClose}
      title={t(
        '어느 식당에 계세요?',
        'Where are you dining?',
        'أين تتناول الطعام؟',
      )}
      description={t(
        '식당을 연결하면 오늘의 메뉴를 방문 기록으로 모을 수 있어요.',
        'Connect a restaurant to keep today’s menu in your food journal.',
        'اربط المطعم للاحتفاظ بقائمة اليوم في سجل زياراتك.',
      )}
    >
      <label className="mb-4 flex items-center gap-2 rounded-xl border border-border-warm bg-surface-subtle px-3">
        <Search className="size-4 shrink-0 text-text-secondary" />
        <input
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none"
          placeholder={t(
            '식당 이름 · 영문 이름 · 지역',
            'Name · English name · area',
            'الاسم · الاسم الإنجليزي · المنطقة',
          )}
          aria-label={t('식당 검색', 'Search restaurants', 'ابحث عن مطعم')}
        />
      </label>
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {AREAS.map((a) => (
          <button
            key={a.id}
            onClick={() => {
              setArea(a.id);
              setQuery('');
            }}
            aria-pressed={area === a.id}
            className={`shrink-0 rounded-full px-4 py-3 text-xs font-bold ${area === a.id ? 'bg-brand-primary text-white' : 'bg-surface-subtle text-text-secondary'}`}
          >
            {localizeMenuText(a, language)}
          </button>
        ))}
      </div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowMap((value) => !value)}
          aria-pressed={showMap}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border-warm px-3 text-xs font-bold text-text-secondary hover:bg-surface-subtle"
        >
          <MapIcon className="size-3.5" />
          {showMap
            ? t('목록만 보기', 'List only', 'القائمة فقط')
            : t('지도로 보기', 'Show map', 'عرض الخريطة')}
        </button>
      </div>
      {showMap && candidates.length > 0 && (
        <div className="mb-4">
          <StoreMap
            language={language}
            stores={candidates.map((r) => ({
              id: r.id,
              name: localizeMenuText(r.name, language),
              lat: r.lat,
              lng: r.lng,
            }))}
            selectedId={selectedId}
            onSelect={(store) => {
              const picked = candidates.find((r) => r.id === store.id);
              if (picked) onSelect(picked);
            }}
          />
        </div>
      )}
      <div className="space-y-2">
        {candidates.map((r) => (
          <button
            key={r.id}
            onClick={() => onSelect(r)}
            className="flex min-h-20 w-full items-center gap-3 rounded-2xl border border-border-warm p-3 text-start hover:bg-brand-primary-soft"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
              <MapPin className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <PartnershipBadge restaurant={r} language={language} compact />
              <span className="block font-bold">
                {localizeMenuText(r.name, language)}
              </span>
              <span className="text-xs text-text-secondary">
                {r.name.ko} ·{' '}
                {localizeMenuText(
                  AREAS.find((a) => a.id === r.area)!,
                  language,
                )}
              </span>
            </span>
            {selectedId === r.id && (
              <Check className="size-5 text-brand-primary" />
            )}
          </button>
        ))}
      </div>
      {candidates.length === 0 && (
        <p className="py-6 text-center text-sm text-text-secondary">
          {t(
            '검색 결과가 없어요. 지역을 선택해 찾아보세요.',
            'No matches. Try browsing by area.',
            'لا توجد نتائج. جرب البحث حسب المنطقة.',
          )}
        </p>
      )}
      {allowSkip && (
        <button
          onClick={() => onSelect(null)}
          className="mt-4 min-h-12 w-full rounded-xl border border-border-warm text-sm font-bold"
        >
          {t(
            '식당 없이 계속하기',
            'Continue without a restaurant',
            'متابعة بدون مطعم',
          )}
        </button>
      )}
    </BottomSheet>
  );
}

function LiveRestaurantPicker({
  language,
  selectedStore,
  onSelect,
  onClose,
  allowSkip = true,
}: {
  language: Language;
  selectedStore?: StoreCandidate | null;
  onSelect: (store: StoreCandidate | null) => void;
  onClose: () => void;
  allowSkip?: boolean;
}) {
  const t = createTranslator(language);
  const [query, setQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const { candidates, error, isLoading, location, locationStatus, retryLocation } = useStoreCandidates(query);

  const storeName = (store: StoreCandidate) =>
    store.branchName ? `${store.name} ${store.branchName}` : store.name;
  const distance = (meters: number) => meters < 1000
    ? `${Math.round(meters)}m`
    : `${(meters / 1000).toFixed(1)}km`;

  return (
    <BottomSheet
      language={language}
      onClose={onClose}
      title={t('어느 식당에 계세요?', 'Where are you dining?', 'أين تتناول الطعام؟')}
      description={t(
        '현재 위치 주변의 등록된 식당을 찾아 메뉴판과 연결해요.',
        'Find a registered restaurant near your current location and connect it to the menu.',
        'ابحث عن مطعم مسجل بالقرب من موقعك الحالي واربطه بالقائمة.',
      )}
    >
      <label className="mb-3 flex items-center gap-2 rounded-xl border border-border-warm bg-surface-subtle px-3">
        <Search className="size-4 shrink-0 text-text-secondary" />
        <input
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={locationStatus !== 'ready'}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed"
          placeholder={t('식당 이름 검색', 'Search by restaurant name', 'ابحث باسم المطعم')}
          aria-label={t('식당 검색', 'Search restaurants', 'ابحث عن مطعم')}
        />
      </label>

      {locationStatus === 'loading' && (
        <div role="status" className="flex min-h-36 flex-col items-center justify-center gap-3 text-sm text-text-secondary">
          <Loader2 className="size-6 animate-spin text-brand-primary" />
          {t('현재 위치를 확인하고 있어요.', 'Finding your current location…', 'جارٍ تحديد موقعك الحالي…')}
        </div>
      )}

      {(locationStatus === 'denied' || locationStatus === 'unsupported') && (
        <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="flex items-start gap-2 font-bold">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {t(
              '주변 식당을 찾으려면 위치 권한이 필요해요.',
              'Location access is needed to find nearby restaurants.',
              'يلزم إذن الموقع للعثور على المطاعم القريبة.',
            )}
          </p>
          {locationStatus === 'denied' && (
            <button type="button" onClick={retryLocation} className="mt-3 min-h-10 w-full rounded-xl border border-amber-300 bg-white font-bold">
              {t('위치 다시 확인', 'Try location again', 'إعادة محاولة تحديد الموقع')}
            </button>
          )}
        </div>
      )}

      {locationStatus === 'ready' && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary">
              <Navigation className="size-3.5 text-brand-primary" />
              {query.trim()
                ? t('이름 검색 결과', 'Name search results', 'نتائج البحث بالاسم')
                : t('현재 위치 주변', 'Near your current location', 'بالقرب من موقعك الحالي')}
            </p>
            {candidates.length > 0 && (
              <button
                type="button"
                onClick={() => setShowMap((value) => !value)}
                aria-pressed={showMap}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border-warm px-3 text-xs font-bold text-text-secondary"
              >
                <MapIcon className="size-3.5" />
                {showMap ? t('목록만 보기', 'List only', 'القائمة فقط') : t('지도로 보기', 'Show map', 'عرض الخريطة')}
              </button>
            )}
          </div>

          {showMap && candidates.length > 0 && (
            <div className="mb-4">
              <StoreMap
                language={language}
                stores={candidates.map((store) => ({
                  id: String(store.storeId),
                  name: storeName(store),
                  lat: store.latitude,
                  lng: store.longitude,
                }))}
                center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
                selectedId={selectedStore ? String(selectedStore.storeId) : null}
                onSelect={(mapStore) => {
                  const picked = candidates.find((store) => String(store.storeId) === mapStore.id);
                  if (picked) onSelect(picked);
                }}
              />
            </div>
          )}

          {isLoading ? (
            <div role="status" className="flex min-h-28 items-center justify-center gap-2 text-sm text-text-secondary">
              <Loader2 className="size-5 animate-spin" />
              {t('식당을 찾고 있어요.', 'Finding restaurants…', 'جارٍ البحث عن المطاعم…')}
            </div>
          ) : error ? (
            <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-800">
              {t('식당 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.', 'Could not load restaurants. Please try again shortly.', 'تعذر تحميل المطاعم. يرجى المحاولة بعد قليل.')}
            </p>
          ) : candidates.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-secondary">
              {query.trim()
                ? t('검색된 식당이 없어요. 다른 이름으로 찾아보세요.', 'No restaurant matched. Try another name.', 'لم يتم العثور على مطعم. جرّب اسماً آخر.')
                : t('주변에 등록된 식당이 아직 없어요.', 'No registered restaurants nearby yet.', 'لا توجد مطاعم مسجلة بالقرب منك بعد.')}
            </p>
          ) : (
            <div className="space-y-2">
              {candidates.map((store) => (
                <button
                  key={store.storeId}
                  type="button"
                  onClick={() => onSelect(store)}
                  className="flex min-h-20 w-full items-center gap-3 rounded-2xl border border-border-warm p-3 text-start hover:bg-brand-primary-soft"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                    <MapPin className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold">{storeName(store)}</span>
                    <span className="mt-1 block truncate text-xs text-text-secondary">
                      {store.roadAddress || store.categoryName || t('주소 정보 없음', 'Address unavailable', 'العنوان غير متوفر')}
                    </span>
                    <span className="mt-1 block text-[11px] font-semibold text-brand-primary">{distance(store.distanceMeters)}</span>
                  </span>
                  {selectedStore?.storeId === store.storeId && <Check className="size-5 shrink-0 text-brand-primary" />}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {allowSkip && (
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-4 min-h-12 w-full rounded-xl border border-border-warm text-sm font-bold"
        >
          {t('식당 없이 계속하기', 'Continue without a restaurant', 'متابعة بدون مطعم')}
        </button>
      )}
    </BottomSheet>
  );
}
