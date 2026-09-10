import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Camera,
  ChevronRight,
  Heart,
  MapPin,
  Navigation,
  SlidersHorizontal,
  User,
  Users,
} from 'lucide-react';
import type { Language, UserProfile } from '../App';
import logo from '../../assets/brand/han-spoon-logo.svg';
import { createTranslator, translateText } from '../locales';
import {
  AREAS,
  RESTAURANTS,
  profileMatches,
  restaurantsInArea,
  type AreaId,
  type Restaurant,
} from '../demo/restaurants';
import { useDemoValue } from '../demo/storage';
import {
  getProfileCommunicationItems,
  localizeMenuText,
} from '../results/resultViewModel';
import { CURATION_ARTICLES } from '../constants/curation';
import { AreaMap } from './discovery/AreaMap';
import { BottomSheet } from './discovery/BottomSheet';
import { RestaurantPicker } from './discovery/RestaurantPicker';
import { BottomNav } from './BottomNav';
import { menuPrice } from '../demo/currency';
import type { VisitRecord } from '../demo/records';

export function HomeScreen({
  language,
  userProfile,
}: {
  language: Language;
  userProfile: UserProfile | null;
}) {
  const t = createTranslator(language);
  const navigate = useNavigate();
  const [area, setArea] = useState<AreaId>('nearby');
  const [selectedId, setSelectedId] = useState(RESTAURANTS[0].id);
  const [detail, setDetail] = useState<Restaurant | null>(null);
  const [picker, setPicker] = useState(false);
  const [slide, setSlide] = useState(0);
  const [ranking, setRanking] = useState('diet');
  const [selectedRestaurant, setSelectedRestaurant] = useDemoValue<
    string | null
  >('selected-restaurant', null);
  const [saved, setSaved] = useDemoValue<string[]>('saved-restaurants', []);
  const [records] = useDemoValue<VisitRecord[]>('records', []);
  const carousel = useRef<HTMLDivElement>(null);
  const restaurants = restaurantsInArea(area);
  const profileItems = getProfileCommunicationItems(userProfile);
  const rankingPrefix =
    ranking === 'allergy'
      ? 'allergy:'
      : ranking === 'religion'
        ? 'religion:'
        : 'vegan:';
  const ranked = RESTAURANTS.filter((r) =>
    r.profileIds.some((id) => id.startsWith(rankingPrefix)),
  )
    .sort((a, b) => {
      const score = (r: Restaurant) =>
        r.feedback
          .filter((f) => f.profileId.startsWith(rankingPrefix))
          .reduce((n, f) => n + f.positive, 0);
      return score(b) - score(a);
    })
    .slice(0, 3);
  const chooseForScan = (restaurant: Restaurant | null) => {
    setSelectedRestaurant(restaurant?.id ?? null);
    setPicker(false);
    navigate('/scan');
  };
  const heroArticles = [
    {
      id: 'restaurant-spotlight',
      title: {
        ko: '성수에서 만난\n초록빛 한 끼',
        en: 'A greener kind of lunch\nin Seongsu',
        ar: 'وجبة خضراء\nفي سونغسو',
      },
      excerpt: {
        ko: '초록식탁 · 채소로 채운 오늘의 발견',
        en: 'Green Table · a fresh neighborhood find',
        ar: 'غرين تيبل · اكتشاف جديد في الحي',
      },
    },
    ...CURATION_ARTICLES.filter((a) => a.featured).slice(0, 2),
  ];
  return (
    <div className="flex h-dvh flex-col bg-rice-cream text-soy-ink">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-warm bg-rice-white px-5">
        <img src={logo} alt="Han Spoon" className="w-[108px]" />
        <button
          onClick={() => navigate('/mypage')}
          aria-label={t('마이페이지', 'My page', 'صفحتي')}
          className="flex size-11 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary"
        >
          <User className="size-5" />
        </button>
      </header>
      <main className="flex-1 overflow-y-auto pb-8">
        <section className="px-5 pb-5 pt-6">
          <p className="eyebrow">YOUR TASTE, YOUR KOREA</p>
          <h1 className="mt-2 text-[28px] font-extrabold leading-[1.3] tracking-tight">
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
              '내 식단을 이해하는 식당부터, 오늘의 메뉴까지.',
              'From places that understand you to your next favorite dish.',
              'من مطاعم تفهم احتياجاتك إلى طبقك المفضل القادم.',
            )}
          </p>
        </section>
        <section
          aria-label={t('추천 이야기', 'Featured stories', 'قصص مختارة')}
          className="relative mb-6"
        >
          <div
            ref={carousel}
            onScroll={(e) => {
              const el = e.currentTarget;
              setSlide(
                Math.min(
                  2,
                  Math.round(Math.abs(el.scrollLeft) / el.clientWidth),
                ),
              );
            }}
            className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
          >
            {heroArticles.map((article, index) => (
              <div
                key={article.id}
                className="w-full shrink-0 snap-center px-5"
              >
                <button
                  onClick={() =>
                    article.id === 'restaurant-spotlight'
                      ? setDetail(RESTAURANTS[0])
                      : navigate(`/curation/${article.id}`)
                  }
                  className="relative h-[210px] w-full overflow-hidden rounded-[24px] bg-brand-green-900 text-start text-white"
                >
                  <img
                    src={RESTAURANTS[index].image}
                    alt=""
                    className="absolute inset-0 size-full object-cover opacity-60"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-[#092d20]/95 via-[#092d20]/30 to-transparent" />
                  <span className="relative flex h-full flex-col justify-end p-5">
                    <span className="mb-2 text-[10px] font-bold tracking-[.18em] text-white/80">
                      {index === 0
                        ? 'NEIGHBORHOOD SPOTLIGHT'
                        : 'HAN SPOON JOURNAL'}{' '}
                      · 0{index + 1}
                    </span>
                    <span className="max-w-[85%] whitespace-pre-line text-[23px] font-extrabold leading-tight">
                      {translateText(language, article.title)}
                    </span>
                    <span className="mt-2 max-w-[85%] text-xs leading-5 text-white/85">
                      {translateText(language, article.excerpt)}
                    </span>
                    <ArrowUpRight className="absolute bottom-5 end-4 size-6 rtl:-rotate-90" />
                  </span>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-center gap-1.5">
            {heroArticles.map((a, i) => (
              <button
                key={a.id}
                aria-label={`${t('이야기', 'Story', 'قصة')} ${i + 1}`}
                aria-pressed={slide === i}
                onClick={() => {
                  carousel.current?.scrollTo({
                    left:
                      (language === 'ar' ? -1 : 1) *
                      i *
                      carousel.current.clientWidth,
                    behavior: 'smooth',
                  });
                  setSlide(i);
                }}
                className="flex h-6 items-center px-1"
              >
                <span
                  className={`h-1.5 rounded-full ${slide === i ? 'w-6 bg-brand-primary' : 'w-1.5 bg-border-warm'}`}
                />
              </button>
            ))}
          </div>
        </section>
        <div className="px-5">
          <button
            onClick={() => setPicker(true)}
            className="mb-7 flex w-full items-center gap-3 rounded-2xl bg-brand-primary px-4 py-4 text-start text-white shadow-[0_8px_22px_rgba(23,100,73,.16)]"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
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
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">A PLACE FOR YOU</p>
              <h2 className="mt-1 text-xl font-extrabold">
                {t('어디서 먹을까요?', 'Where shall we eat?', 'أين نأكل؟')}
              </h2>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              aria-label={t(
                '식단 프로필 설정',
                'Set dietary profile',
                'إعداد الملف الغذائي',
              )}
              className="flex size-11 items-center justify-center rounded-full border border-border-warm"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {AREAS.map((a) => (
              <button
                key={a.id}
                aria-pressed={area === a.id}
                onClick={() => {
                  setArea(a.id);
                  setSelectedId(restaurantsInArea(a.id)[0].id);
                }}
                className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-xs font-bold ${a.id === area ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-warm bg-rice-white text-text-secondary'}`}
              >
                {a.id === 'nearby' && <Navigation className="size-3" />}
                {localizeMenuText(a, language)}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-[24px] border border-border-warm bg-rice-white shadow-[var(--shadow-card)]">
            <AreaMap
              area={area}
              restaurants={restaurants}
              selectedId={selectedId}
              onSelect={setSelectedId}
              language={language}
            />
            <div className="relative -mt-3 rounded-t-[22px] bg-rice-white px-3 pb-2 pt-3">
              <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-border-warm" />
              <p className="mb-2 px-1 text-xs font-bold text-text-secondary">
                {t(
                  '이 지역에서 발견한 식당',
                  'Places in this neighborhood',
                  'مطاعم في هذا الحي',
                )}{' '}
                · {restaurants.length}
              </p>
              {[...restaurants]
                .sort(
                  (a, b) =>
                    Number(b.id === selectedId) - Number(a.id === selectedId),
                )
                .map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedId(r.id);
                      setDetail(r);
                    }}
                    className={`mb-2 flex w-full items-center gap-3 rounded-2xl border p-3 text-start ${r.id === selectedId ? 'border-brand-green-100 bg-brand-primary-soft' : 'border-transparent'}`}
                  >
                    <img
                      src={r.image}
                      alt=""
                      className="size-16 rounded-xl object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-extrabold">
                        {localizeMenuText(r.name, language)}
                      </span>
                      <span className="mt-1 block text-[11px] text-text-secondary">
                        {localizeMenuText(r.category, language)} ·{' '}
                        {menuPrice(String(r.price), language)?.original}
                      </span>
                      <span className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-brand-primary">
                        <Users className="size-3" />
                        {profileMatches(r, userProfile).length > 0
                          ? t(
                              '나와 같은 식단의 후기',
                              'Feedback from people like you',
                              'آراء أشخاص باحتياجات مماثلة',
                            )
                          : t(
                              '식단별 경험 살펴보기',
                              'Explore dietary experiences',
                              'اكتشف التجارب الغذائية',
                            )}
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 rtl:rotate-180" />
                  </button>
                ))}
            </div>
          </div>
          <section className="mt-8">
            <p className="eyebrow">THE COMMUNITY PICKS</p>
            <h2 className="mt-1 text-xl font-extrabold">
              {t(
                '같은 식단, 좋은 발견',
                'Shared needs. Great finds.',
                'احتياجات مشتركة. خيارات رائعة.',
              )}
            </h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              {t(
                '선택형 후기의 긍정 응답 수 기준 · 인증 순위가 아니에요',
                'Ranked by positive dietary feedback · not a certification',
                'حسب عدد الآراء الغذائية الإيجابية · ليست شهادة اعتماد',
              )}
            </p>
            <div className="my-4 flex gap-2">
              {[
                ['diet', t('식단별', 'Diet', 'النظام الغذائي')],
                ['allergy', t('알레르기별', 'Allergies', 'الحساسية')],
                ['religion', t('종교별', 'Religion', 'الدين')],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setRanking(id)}
                  aria-pressed={ranking === id}
                  className={`min-h-11 rounded-full px-4 text-xs font-bold ${ranking === id ? 'bg-soy-ink text-white' : 'border border-border-warm bg-rice-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border-warm bg-rice-white">
              {ranked.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setDetail(r)}
                  className="flex w-full items-center gap-3 border-b border-border-warm px-4 py-4 text-start last:border-b-0"
                >
                  <span
                    className={`w-5 font-serif text-2xl italic ${i === 0 ? 'text-brand-accent' : 'text-text-tertiary'}`}
                  >
                    {i + 1}
                  </span>
                  <img
                    src={r.image}
                    alt=""
                    className="size-12 rounded-xl object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold">
                      {localizeMenuText(r.name, language)}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {localizeMenuText(
                        AREAS.find((a) => a.id === r.area)!,
                        language,
                      )}
                    </span>
                  </span>
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </button>
              ))}
            </div>
          </section>
          <button
            onClick={() => navigate('/history')}
            className="mt-6 flex min-h-12 w-full items-center justify-between rounded-xl border border-border-warm px-4 text-sm font-bold"
          >
            {t('나의 스캔 기록', 'My scan journal', 'سجل مسوحاتي')}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </div>
      </main>
      <BottomNav language={language} />
      {picker && (
        <RestaurantPicker
          language={language}
          selectedId={selectedRestaurant}
          onSelect={chooseForScan}
          onClose={() => setPicker(false)}
        />
      )}
      {detail && (
        <BottomSheet
          language={language}
          onClose={() => setDetail(null)}
          title={localizeMenuText(detail.name, language)}
          description={`${detail.name.ko} · ${localizeMenuText(AREAS.find((a) => a.id === detail.area)!, language)}`}
        >
          <img
            src={detail.image}
            alt=""
            className="mb-4 h-40 w-full rounded-2xl object-cover"
          />
          <div className="mb-5 flex gap-2">
            <button
              onClick={() => chooseForScan(detail)}
              className="min-h-12 flex-1 rounded-xl bg-brand-primary text-sm font-bold text-white"
            >
              {t(
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
              className="flex size-12 items-center justify-center rounded-xl border border-border-warm text-brand-accent"
            >
              <Heart
                className={`size-5 ${saved.includes(detail.id) ? 'fill-current' : ''}`}
              />
            </button>
          </div>
          <h3 className="font-extrabold">
            {t(
              '나와 같은 프로필의 경험',
              'Experiences from people like you',
              'تجارب أشخاص باحتياجات مماثلة',
            )}
          </h3>
          <p className="mb-3 mt-1 text-xs leading-5 text-text-secondary">
            {t(
              '선택한 조건이 하나 이상 같은 사람들의 후기예요.',
              'Feedback from diners sharing at least one of your preferences.',
              'آراء زوار يشاركونك تفضيلاً غذائياً واحداً على الأقل.',
            )}
          </p>
          {profileMatches(detail, userProfile).map((f) => (
            <div
              key={f.profileId}
              className="mb-2 rounded-xl bg-brand-primary-soft p-3"
            >
              <p className="text-xs font-bold text-brand-primary">
                {localizeMenuText(
                  profileItems.find((p) => p.id === f.profileId)!.label,
                  language,
                )}
              </p>
              <p className="mt-1 text-sm">
                {t(
                  `${f.total}명 중 ${f.positive}명이 요청을 전달하기 편했어요`,
                  `${f.positive} of ${f.total} diners found it easy to discuss their needs`,
                  `${f.positive} من ${f.total} زائراً وجدوا من السهل توضيح احتياجاتهم`,
                )}
              </p>
            </div>
          ))}
          {records
            .filter((r) => r.restaurantId === detail.id)
            .flatMap((record) =>
              Object.entries(record.feedback)
                .filter(([id]) => profileItems.some((p) => p.id === id))
                .map(([id, answer]) => (
                  <div
                    key={`${record.id}:${id}`}
                    className="mb-2 rounded-xl border border-border-warm p-3 text-sm"
                  >
                    <span className="font-bold">
                      {localizeMenuText(
                        profileItems.find((p) => p.id === id)!.label,
                        language,
                      )}
                    </span>{' '}
                    · {t('내 후기', 'My feedback', 'رأيي')}:{' '}
                    {answer === 'yes'
                      ? t(
                          '전달하기 편했어요',
                          'Easy to communicate',
                          'سهل التواصل',
                        )
                      : answer === 'no'
                        ? t(
                            '전달하기 어려웠어요',
                            'Difficult to communicate',
                            'صعب التواصل',
                          )
                        : t('잘 모르겠어요', 'Not sure', 'لست متأكداً')}
                  </div>
                )),
            )}
          {profileMatches(detail, userProfile).length === 0 && (
            <p className="rounded-xl bg-surface-subtle p-4 text-sm leading-6">
              {userProfile
                ? t(
                    '아직 같은 프로필의 후기가 없어요.',
                    'No matching dietary feedback yet.',
                    'لا توجد آراء مطابقة لملفك بعد.',
                  )
                : t(
                    '식단 프로필을 설정하면 나와 비슷한 사람들의 경험을 볼 수 있어요.',
                    'Set your dietary profile to see experiences from people like you.',
                    'حدد ملفك الغذائي لرؤية تجارب مماثلة.',
                  )}
            </p>
          )}
        </BottomSheet>
      )}
    </div>
  );
}
