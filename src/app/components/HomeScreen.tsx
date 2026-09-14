import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronRight,
  Map,
  User,
} from 'lucide-react';
import type { Language, UserProfile } from '../App';
import logo from '../../assets/brand/han-spoon-logo.svg';
import { createTranslator, translateText } from '../locales';
import {
  AREAS,
  RESTAURANTS,
  restaurantsInArea,
  type AreaId,
  type Restaurant,
} from '../demo/restaurants';
import { useDemoValue } from '../demo/storage';
import { localizeMenuText } from '../results/resultViewModel';
import { CURATION_ARTICLES } from '../constants/curation';
import { StoreMap } from './discovery/StoreMap';
import { PartnershipBadge } from './discovery/PartnershipBadge';
import { RestaurantPicker } from './discovery/RestaurantPicker';
import { BottomNav } from './BottomNav';
import { CommunityRanking } from './discovery/CommunityRanking';
import { menuPrice } from '../demo/currency';
import type { StoreCandidate } from '../../api/store';
import { LiveHomeDiscovery } from './discovery/LiveHomeDiscovery';

export function HomeScreen({
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
  const t = createTranslator(language);
  const navigate = useNavigate();
  const [area, setArea] = useState<AreaId>('seongsu');
  const [selectedId, setSelectedId] = useState(
    restaurantsInArea('nearby')[0].id,
  );
  const [picker, setPicker] = useState(false);
  const [carouselPosition, setCarouselPosition] = useState(0);
  const [animateCarousel, setAnimateCarousel] = useState(true);
  const carouselPositionRef = useRef(0);
  const [, setSelectedRestaurant] = useDemoValue<string | null>(
    'selected-restaurant',
    null,
  );
  const restaurants = useMemo(() => restaurantsInArea(area), [area]);
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
    restaurants.find((restaurant) => restaurant.id === selectedId) ??
    restaurants[0];

  const heroArticles = [...(demoMode ? [{
      id: 'restaurant-spotlight',
      image: RESTAURANTS.find(r => r.area === 'seongsu')!.image,
      title: {
        ko: '성수에서 만난\n초록빛 한 끼',
        en: 'A greener kind of lunch\nin Seongsu',
        ar: 'وجبة خضراء\nفي سونغسو',
      },
      excerpt: {
        ko: '초록식탁 · 레시피를 투명하게 확인한 파트너',
        en: 'Green Table · a recipe-verified partner',
        ar: 'غرين تيبل · شريك بوصفات موثقة',
      },
    }] : []), ...CURATION_ARTICLES.slice(0, demoMode ? 4 : 5)];
  const heroCount = heroArticles.length;

  const resetCarousel = useCallback(() => {
    carouselPositionRef.current = 0;
    setAnimateCarousel(false);
    setCarouselPosition(0);
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => setAnimateCarousel(true)),
    );
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setCarouselPosition((current) => {
        const next = Math.min(current + 1, heroCount);
        carouselPositionRef.current = next;
        return next;
      });
    }, 5000);

    const handleVisibilityChange = () => {
      if (!document.hidden && carouselPositionRef.current >= heroCount) {
        resetCarousel();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [heroCount, resetCarousel]);

  const visibleSlide = carouselPosition % heroCount;
  const carouselItems = [...heroArticles, heroArticles[0]];

  const openMap = (restaurant?: Restaurant) => {
    const params = new URLSearchParams({ area: restaurant?.area ?? area });
    if (restaurant) params.set('restaurant', restaurant.id);
    navigate(`/map?${params.toString()}`);
  };

  const chooseForScan = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant?.id ?? null);
    setPicker(false);
    navigate(restaurant?.partnership === 'recipe-verified' ? `/restaurants/${restaurant.id}/menu` : '/scan');
  };

  const selectArea = (nextArea: AreaId) => {
    setArea(nextArea);
    setSelectedId(restaurantsInArea(nextArea)[0].id);
  };

  return (
    <div className="flex h-dvh flex-col bg-rice-cream text-soy-ink">
      <header className="flex h-16 shrink-0 items-center justify-between bg-rice-cream px-5">
        <img src={logo} alt="Han Spoon" className="w-[108px]" />
        <button
          onClick={() => navigate('/mypage')}
          aria-label={t('마이페이지', 'My page', 'صفحتي')}
          className="flex size-11 items-center justify-center rounded-full border border-border-warm bg-rice-white text-brand-primary shadow-sm"
        >
          <User className="size-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-9">
        <section className="px-5 pb-5 pt-4">
          <p className="eyebrow">YOUR TASTE, YOUR KOREA</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-[1.22] tracking-[-0.035em]">
            {t(
              '나에게 맞는 한 끼,\n새로운 한국의 발견.',
              'Your kind of food.\nYour side of Korea.',
              'طعام يناسبك.\nاكتشف كوريا بطريقتك.',
            )
              .split('\n')
              .map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
          </h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {t(
              '동네를 고르고, 내 식단을 이해하는 식당을 만나보세요.',
              'Pick a neighborhood and find places that understand your needs.',
              'اختر حياً واعثر على مطاعم تفهم احتياجاتك.',
            )}
          </p>
        </section>

        <section
          aria-label={t('추천 이야기', 'Featured stories', 'قصص مختارة')}
          className="relative mb-7"
        >
          <div className="overflow-hidden" dir="ltr">
            <div
              className={`flex ${animateCarousel ? 'transition-transform duration-500 ease-out' : ''}`}
              style={{ transform: `translateX(-${carouselPosition * 100}%)` }}
              onTransitionEnd={(event) => {
                if (event.currentTarget !== event.target || carouselPosition < heroCount) return;
                resetCarousel();
              }}
            >
            {carouselItems.map((article, index) => {
              const contentIndex = index % heroArticles.length;
              const spotlight =
                RESTAURANTS.find(
                  (restaurant) =>
                    restaurant.area === 'seongsu' &&
                    restaurant.partnership === 'recipe-verified',
                ) ?? RESTAURANTS[0];
              return (
                <div
                  key={`${article.id}-${index}`}
                  className="w-full shrink-0 px-5"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <button
                    onClick={() =>
                      article.id === 'restaurant-spotlight'
                        ? openMap(spotlight)
                        : navigate(`/curation/${article.id}`)
                    }
                    className="group relative h-[244px] w-full overflow-hidden rounded-[30px] bg-brand-green-900 text-start text-white shadow-[0_18px_44px_rgba(24,61,45,.18)]"
                  >
                    <img
                      src={article.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-gradient-to-t from-[#082b1f]/95 via-[#0b3828]/30 to-transparent" />
                    <span className="relative flex h-full flex-col justify-end p-5">
                      <span className="mb-2 text-[10px] font-extrabold tracking-[.17em] text-white/80">
                        {contentIndex === 0
                          ? 'NEIGHBORHOOD SPOTLIGHT'
                          : 'HAN SPOON JOURNAL'}{' '}
                        · 0{contentIndex + 1}
                      </span>
                      <span className="max-w-[86%] whitespace-pre-line text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em]">
                        {translateText(language, article.title)}
                      </span>
                      <span className="mt-2 max-w-[84%] text-xs leading-5 text-white/85">
                        {translateText(language, article.excerpt)}
                      </span>
                      <span className="absolute bottom-5 end-5 flex size-11 items-center justify-center rounded-full bg-white text-brand-primary">
                        <ArrowUpRight className="size-5 rtl:-rotate-90" />
                      </span>
                    </span>
                  </button>
                </div>
              );
            })}
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-1">
            {heroArticles.map((article, index) => (
              <button
                key={article.id}
                aria-label={t('이야기', 'Story', 'قصة') + ' ' + (index + 1)}
                aria-pressed={visibleSlide === index}
                onClick={() => {
                  carouselPositionRef.current = index;
                  setAnimateCarousel(true);
                  setCarouselPosition(index);
                }}
                className="flex h-7 items-center px-1"
              >
                <span
                  className={
                    'h-1.5 rounded-full transition-all ' +
                    (visibleSlide === index
                      ? 'w-7 bg-brand-primary'
                      : 'w-1.5 bg-border-warm')
                  }
                />
              </button>
            ))}
          </div>
        </section>

        <div className="px-5">
          <button
            onClick={() => setPicker(true)}
            className="mb-9 flex w-full items-center gap-3 rounded-[22px] bg-brand-primary px-4 py-4 text-start text-white shadow-[0_10px_26px_rgba(23,100,73,.18)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Camera className="size-6" />
            </span>
            <span className="flex-1">
              <span className="block font-extrabold">
                {t(
                  '이미 식당에 도착했나요?',
                  'Already at the table?',
                  'هل وصلت إلى المطعم؟',
                )}
              </span>
              <span className="mt-1 block text-xs text-white/80">
                {t(
                  '메뉴판 한 장으로 내 식단 확인하기',
                  'Scan the menu for your dietary needs',
                  'امسح القائمة حسب احتياجاتك الغذائية',
                )}
              </span>
            </span>
            <ChevronRight className="size-5 rtl:rotate-180" />
          </button>

          {demoMode ? <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="eyebrow">EXPLORE THE MAP</p>
                <h2 className="mt-1 text-[22px] font-extrabold tracking-tight">
                  {t('오늘은 어느 동네를 살펴볼까요?', 'Choose a neighborhood', 'اختر حياً')}
                </h2>
              </div>
            </div>

            <div className="-mx-5 mb-4 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
              {AREAS.filter(item => item.id !== 'nearby').map((item) => (
                <button
                  key={item.id}
                  aria-pressed={area === item.id}
                  onClick={() => selectArea(item.id)}
                  className={
                    'inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-bold ' +
                    (item.id === area
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
                stores={mapStores}
                selectedId={selected.id}
                onSelect={(store) => setSelectedId(store.id)}
                className="h-[270px] w-full bg-[#e9eee5]"
              />
              <button
                onClick={() => openMap()}
                className="absolute end-3 top-3 flex min-h-10 items-center gap-1.5 rounded-full bg-soy-ink px-3.5 text-xs font-bold text-white shadow-md"
              >
                <Map className="size-4" />
                {t('전체 지도', 'Full map', 'الخريطة كاملة')}
              </button>
              <button
                onClick={() => openMap(selected)}
                className="absolute inset-x-3 bottom-3 flex min-h-[86px] items-center gap-3 rounded-[22px] border border-white/70 bg-rice-white/95 p-3 text-start shadow-[0_14px_38px_rgba(35,42,37,.16)] backdrop-blur"
              >
                <img
                  src={selected.image}
                  alt=""
                  className="size-16 shrink-0 rounded-2xl object-cover"
                />
                <span className="min-w-0 flex-1">
                  <PartnershipBadge
                    restaurant={selected}
                    language={language}
                    compact
                  />
                  <span className="mt-1.5 block truncate text-sm font-extrabold">
                    {localizeMenuText(selected.name, language)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-text-secondary">
                    {localizeMenuText(selected.category, language)} ·{' '}
                    {menuPrice(String(selected.price), language)?.original}
                  </span>
                </span>
                <ArrowRight className="size-5 shrink-0 rtl:rotate-180" />
              </button>
            </div>
          </section> : (
            <LiveHomeDiscovery
              language={language}
              selectedStore={selectedStore}
              onSelectStore={onSelectStore}
            />
          )}

          <CommunityRanking
            language={language}
            userProfile={userProfile}
            onSelect={(restaurant) =>
              demoMode ? openMap(restaurant) : navigate('/map')
            }
          />
        </div>
      </main>

      <BottomNav language={language} />
      {picker && (
        <RestaurantPicker
          language={language}
          demoMode={demoMode}
          selectedStore={selectedStore}
          onSelectDemo={chooseForScan}
          onSelectStore={(store) => {
            onSelectStore(store);
            setPicker(false);
            navigate('/scan');
          }}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}
