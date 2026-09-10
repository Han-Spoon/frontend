import { Fragment, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Flame,
  Info,
  MessageSquareText,
  SearchX,
  ShieldCheck,
  Volume2,
  Heart,
  Bookmark,
  MapPin,
} from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
import { createTranslator, translateText } from '../locales';
import logo from '../../assets/brand/han-spoon-logo.svg';
import { findMenuImageByName } from '../../api/image';
import { getMenuPronunciation } from '../constants/menuNames';
import { CURATION_ARTICLES } from '../constants/curation';
import { speak, ttsSupported } from '../utils/speech';
import { menuPrice } from '../demo/currency';
import { useDemoValue } from '../demo/storage';
import { RESTAURANTS } from '../demo/restaurants';
import { SaveScanSheet } from './results/SaveScanSheet';
import {
  OwnerCommunicationSheet,
  type OwnerCommunicationType,
  type OwnerResponseId,
} from './OwnerCommunicationSheet';
import { ProfileCommunicationSheet } from './ProfileCommunicationSheet';
import { CommunicationActions } from './results/CommunicationActions';
import { EvidenceSection, RiskBadge, StatusGuidance } from './results/ResultEvidence';
import {
  buildMenuResultViewModel,
  CONFIDENCE_LABELS,
  getProfileCommunicationItems,
  getProfileSummary,
  getCautionProbabilities,
  localizeMenuText,
} from '../results/resultViewModel';

interface ResultsScreenProps {
  language: Language;
  menus: MenuAnalysis[];
  userProfile: UserProfile | null;
  onBack: () => void;
  onRescan: () => void;
  sourceScanId?: string;
  savedRecordId?: string;
}

interface MenuImageProps {
  menu: MenuAnalysis;
  translatedName: string;
  t: (ko: string, en: string, ar: string) => string;
}

type FilterType = 'all' | MenuAnalysis['riskLevel'];

function getTranslatedMenuName(menu: MenuAnalysis, language: Language) {
  if (language === 'ko') return menu.menuNameEn || menu.menuName;
  if (language === 'ar') return menu.menuNameAr ?? menu.menuNameEn ?? menu.menuName;
  return menu.menuNameEn || menu.menuName;
}

function getDescription(menu: MenuAnalysis, language: Language) {
  if (language === 'ko') return menu.description;
  if (language === 'ar') return menu.descriptionAr ?? menu.descriptionEn ?? menu.description;
  return menu.descriptionEn ?? menu.description;
}

function formatStaffEvidence(language: Language, usedCount: number, checkedCount: number) {
  switch (language) {
    case 'ko': return `확인된 ${checkedCount}건 중 ${usedCount}건에서 사용됐어요`;
    case 'ar': return `استُخدم في ${usedCount} من أصل ${checkedCount} سجلاً مؤكداً`;
    case 'zh-CN': return `在 ${checkedCount} 条确认记录中，有 ${usedCount} 条使用了该食材`;
    case 'ja': return `確認済み${checkedCount}件のうち${usedCount}件で使用されていました`;
    case 'zh-TW': return `在 ${checkedCount} 筆確認紀錄中，有 ${usedCount} 筆使用了此食材`;
    case 'es': return `Se utilizó en ${usedCount} de ${checkedCount} registros confirmados`;
    default: return `Used in ${usedCount} of ${checkedCount} confirmed records`;
  }
}

export function MenuImage({ menu, translatedName, t }: MenuImageProps) {
  const [resolvedImage, setResolvedImage] = useState<string | null>(menu.image ?? null);
  const [isDefaultImage, setIsDefaultImage] = useState(!menu.image);

  useEffect(() => {
    let mounted = true;
    async function resolveImage() {
      if (menu.image) {
        setResolvedImage(menu.image);
        setIsDefaultImage(false);
        return;
      }
      const referenceImageUrl = await findMenuImageByName(menu.menuName);
      if (!mounted) return;
      setResolvedImage(referenceImageUrl);
      setIsDefaultImage(!referenceImageUrl);
    }
    void resolveImage();
    return () => { mounted = false; };
  }, [menu.image, menu.menuName]);

  if (resolvedImage) return <img src={resolvedImage} alt={translatedName} className="size-full object-cover" />;

  return (
    <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-surface-subtle text-text-tertiary">
      <img src={logo} alt={isDefaultImage ? t('기본 메뉴 이미지', 'Default menu image', 'صورة قائمة افتراضية') : translatedName} className="w-20 opacity-35" />
      <span className="text-[11px] font-semibold">{t('참고 이미지 없음', 'No reference image', 'لا توجد صورة مرجعية')}</span>
    </div>
  );
}

export function ResultsScreen({ language, menus, userProfile, onBack, onRescan, sourceScanId, savedRecordId }: ResultsScreenProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedMenu, setSelectedMenu] = useState<MenuAnalysis | null>(null);
  const [sheetType, setSheetType] = useState<OwnerCommunicationType | null>(null);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const [ownerResponses, setOwnerResponses] = useState<Record<string, OwnerResponseId>>({});
  const [likedMenus, setLikedMenus] = useDemoValue<string[]>('liked-menus', []);
  const [restaurantId] = useDemoValue<string | null>('selected-restaurant', null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [saved, setSaved] = useState(Boolean(savedRecordId));
  const [recordId] = useState(() => savedRecordId ?? (sourceScanId ? `local-${sourceScanId}` : `local-${crypto.randomUUID()}`));
  const restaurant = RESTAURANTS.find(r => r.id === restaurantId);
  const t = createTranslator(language);
  const menuList = Array.isArray(menus) ? menus : [];
  const profileSummary = getProfileSummary(userProfile, language);
  const profileCommunicationItems = getProfileCommunicationItems(userProfile);

  const counts = useMemo(() => ({
    safe: menuList.filter((menu) => menu.riskLevel === 'safe').length,
    caution: menuList.filter((menu) => menu.riskLevel === 'caution').length,
    danger: menuList.filter((menu) => menu.riskLevel === 'danger').length,
  }), [menuList]);
  const filteredMenus = filter === 'all' ? menuList : menuList.filter((menu) => menu.riskLevel === filter);

  const responseKey = (menuId: string, type: OwnerCommunicationType) => `${menuId}:${type}`;
  const getStoredResponse = (menu: MenuAnalysis, type: OwnerCommunicationType) => ownerResponses[responseKey(menu.id, type)] ?? null;
  const openSheet = (menu: MenuAnalysis, type: OwnerCommunicationType) => { setSelectedMenu(menu); setSheetType(type); };
  const closeSheet = () => { setSelectedMenu(null); setSheetType(null); };
  const handleOwnerResponseSelect = (type: OwnerCommunicationType, responseId: OwnerResponseId) => {
    if (!selectedMenu) return;
    setOwnerResponses((current) => ({ ...current, [responseKey(selectedMenu.id, type)]: responseId }));
  };
  const toggleExpanded = (menuId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };
  const recommendedArticles = Array.from(new Set(menuList.map(menu => buildMenuResultViewModel(menu, language).curationId))).flatMap(id => CURATION_ARTICLES.filter(article => article.id === id)).slice(0, 3);

  return (
    <div className="relative flex h-dvh flex-col bg-surface-base text-text-primary">
      <header className="flex h-16 shrink-0 items-center border-b border-border-warm bg-surface-raised/95 px-5 backdrop-blur">
        <button onClick={onBack} className="touch-target absolute start-3 inline-flex items-center justify-center rounded-full hover:bg-surface-subtle" aria-label={t('이전', 'Back', 'رجوع')}>
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <h1 className="mx-auto text-base font-extrabold">{t('스캔 결과', 'Scan results', 'نتائج المسح')}</h1>
      </header>

      <main className="flex-1 overflow-y-auto" aria-live="polite">
        <section className="border-b border-border-warm bg-surface-raised px-5 pb-5 pt-6">
          <div className="mb-3 flex items-center justify-between"><p className="eyebrow">YOUR MENU, MADE CLEAR</p>{restaurant && <span className="flex items-center gap-1 text-[11px] text-text-secondary"><MapPin className="size-3" />{localizeMenuText(restaurant.name, language)}</span>}</div>
          <h2 className="text-[27px] font-extrabold leading-tight tracking-[-0.03em]">{t('나를 위한 메뉴 가이드', 'Your menu, understood.', 'قائمتك، بكل وضوح.')}</h2>
          <p className="mt-2 text-sm text-text-secondary">{t(`메뉴 ${menuList.length}개를 내 식단 기준으로 살펴봤어요.`, `${menuList.length} dishes, checked against your dietary needs.`, `تم فحص ${menuList.length} أطباق حسب احتياجاتك الغذائية.`)}</p>
          <div className="mt-5 grid grid-cols-3 gap-2">{([
            ['safe', counts.safe, t('안전', 'Safe', 'آمن'), 'bg-status-safe-surface text-status-safe-text'],
            ['caution', counts.caution, t('주의', 'Caution', 'تنبيه'), 'bg-status-caution-surface text-status-caution-text'],
            ['danger', counts.danger, t('위험', 'Danger', 'خطر'), 'bg-status-danger-surface text-status-danger-text'],
          ] as const).map(([level, count, label, style]) => <button key={level} onClick={() => setFilter(level)} aria-pressed={filter === level} className={`rounded-2xl px-3 py-3 text-start ${style}`}><span className="block text-[26px] font-extrabold leading-8">{count}</span><span className="mt-1 block text-xs font-bold">{label}</span></button>)}</div>

          <div className="mt-4 rounded-xl border border-border-warm bg-surface-subtle px-3.5 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-text-secondary">
              <ShieldCheck className="size-4 text-brand-primary" aria-hidden="true" />
              {t('적용된 내 식단 프로필', 'Applied dietary profile', 'الملف الغذائي المطبق')}
            </div>
            {profileSummary.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">{profileSummary.map((item) => <span key={item} className="rounded-md bg-surface-raised px-2 py-1 text-xs font-semibold text-text-primary">{item}</span>)}</div>
            ) : <p className="text-xs leading-5 text-text-secondary">{t('설정된 식단 조건이 없어요', 'No dietary conditions are set.', 'لا توجد شروط غذائية محددة.')}</p>}
            {profileCommunicationItems.length > 0 && (
              <button type="button" onClick={() => setProfileSheetOpen(true)} className="mt-3 min-h-11 w-full rounded-xl border border-brand-primary bg-surface-raised px-3 py-2 text-sm font-bold text-brand-primary hover:bg-brand-primary-soft">
                <span className="inline-flex items-center justify-center gap-2"><MessageSquareText className="size-4" />{t('내 식단 전달하기', 'Share my dietary needs', 'شارك احتياجاتي الغذائية')}</span>
              </button>
            )}
          </div>

          <div className="mt-3 flex items-start gap-2 px-0.5 text-xs leading-5 text-text-tertiary">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>{t('이 결과는 확보된 정보에 따른 안내이며 절대적인 안전을 보장하지 않아요.', 'This guidance is based on available information and is not an absolute safety guarantee.', 'تستند هذه الإرشادات إلى المعلومات المتاحة ولا تضمن السلامة بشكل مطلق.')}</p>
          </div>
        </section>

        <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-border-warm bg-surface-base/95 px-5 py-3 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t('결과 필터', 'Result filters', 'مرشحات النتائج')}>
          {([
            { value: 'all' as const, label: t('전체', 'All', 'الكل'), count: menuList.length },
            { value: 'safe' as const, label: t('안전', 'Safe', 'آمن'), count: counts.safe },
            { value: 'caution' as const, label: t('주의', 'Caution', 'تنبيه'), count: counts.caution },
            { value: 'danger' as const, label: t('위험', 'Danger', 'خطر'), count: counts.danger },
          ]).map((item) => (
            <button key={item.value} onClick={() => setFilter(item.value)} aria-pressed={filter === item.value} className={`min-h-11 shrink-0 rounded-xl border px-3.5 text-sm font-bold ${filter === item.value ? 'border-text-primary bg-text-primary text-white' : 'border-border-warm bg-surface-raised text-text-secondary hover:border-text-tertiary'}`}>
              {item.label} <span className="ms-1 opacity-70">{item.count}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-4 px-4 py-5 sm:px-5">
          {filter !== 'all' && <StatusGuidance level={filter} t={t} />}

          {filteredMenus.map((menu) => {
            const expanded = expandedIds.has(menu.id);
            const translatedName = getTranslatedMenuName(menu, language);
            const pronunciation = getMenuPronunciation(menu.menuName, language);
            const description = getDescription(menu, language);
            const viewModel = buildMenuResultViewModel(menu, language);
            const cardDetailsId = `menu-details-${menu.id}`;
            const isSpicy = Boolean(menu.isSpicy || menu.is_spicy);
            const price = menuPrice(menu.price, language);
            const likeKey = menu.menuName.trim().toLocaleLowerCase();
            const liked = likedMenus.includes(likeKey);
            const cautionIngredients = getCautionProbabilities(menu, userProfile).map(ingredient => ({ ...ingredient, localizedName: localizeMenuText(ingredient.name, language) }));
            const requestActions = [
              ...(menu.riskLevel !== 'safe' ? [{ id: 'request', label: t('빼고 요청', 'Request removal', 'طلب الإزالة'), onClick: () => openSheet(menu, 'request') }] : []),
              ...(isSpicy ? [{ id: 'less-spicy', label: t('덜 맵게 요청', 'Less spicy', 'أقل حدة'), onClick: () => openSheet(menu, 'lessSpicy') }] : []),
            ];

            return (
              <Fragment key={menu.id}>
                <article className="overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-surface-raised shadow-[var(--shadow-card)]">
                  <div className="flex gap-3 border-b border-border-warm p-3.5">
                    <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-border-warm bg-surface-subtle sm:size-28"><MenuImage menu={menu} translatedName={translatedName} t={t} /></div>
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                        <RiskBadge level={menu.riskLevel} t={t} />
                        <button aria-label={`${t('메뉴 라이킷', 'Like menu', 'أعجبني الطبق')}: ${menu.menuName}`} aria-pressed={liked} onClick={() => setLikedMenus(liked ? likedMenus.filter(key => key !== likeKey) : [...likedMenus, likeKey])} className={`-mt-1 flex size-11 shrink-0 items-center justify-center rounded-full ${liked ? 'bg-brand-accent-soft text-brand-accent' : 'bg-surface-subtle text-text-tertiary'}`}><Heart className={`size-5 ${liked ? 'fill-current' : ''}`} /></button>
                      </div>
                      <h3 className="break-words text-lg font-extrabold tracking-[-0.015em]">{menu.menuName}</h3>
                      <p className="mt-0.5 break-words text-sm font-semibold text-text-secondary">{translatedName}</p>
                      {price ? <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1"><span className="text-sm font-extrabold tabular-nums" dir="ltr">{price.original}</span>{price.converted && <span className="text-xs font-semibold text-text-secondary" dir="ltr">≈ {price.converted}</span>}</div> : <p className="mt-2 text-xs text-text-tertiary">{t('가격 확인 필요', 'Price needs checking', 'يجب التحقق من السعر')}</p>}
                      <div className="mt-1 flex min-h-8 items-center gap-1.5">
                        {pronunciation && <span className="min-w-0 text-xs text-text-tertiary">{pronunciation}</span>}
                        {ttsSupported && <button onClick={() => speak(menu.menuName, 'ko-KR')} className="touch-target inline-flex shrink-0 items-center justify-center rounded-full text-brand-primary hover:bg-brand-primary-soft" aria-label={`${t('음성 듣기', 'Listen', 'استمع')}: ${menu.menuName}`}><Volume2 className="size-4" /></button>}
                      </div>
                      {description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{description}</p>}
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    {cautionIngredients.length > 0 && <div className="space-y-3 rounded-xl border border-status-caution-border bg-status-caution-surface p-3.5"><p className="text-[11px] font-bold text-status-caution-text">{t('내가 피하는 재료 · 포함 가능성', 'Ingredients I avoid · likelihood of inclusion', 'مكونات أتجنبها · احتمال وجودها')}</p>{cautionIngredients.map(ingredient => <div key={ingredient.localizedName}><div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-bold text-status-caution-text"><span>{ingredient.localizedName}</span><span className="text-xl tabular-nums">{ingredient.inclusionProbability}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-status-caution-border/50" aria-hidden="true"><div className="h-full rounded-full bg-status-caution" style={{ width: `${ingredient.inclusionProbability}%` }} /></div></div>)}<p className="text-[11px] leading-5 text-status-caution-text">{t('재료가 들어갈 가능성이에요. 섭취 안전 확률은 아니며 직원 확인이 필요해요.', 'This estimates ingredient presence, not the probability of a safe meal. Check with staff.', 'هذا تقدير لوجود المكوّن وليس احتمال سلامة الطعام. تحقق مع الموظف.')}</p></div>}
                    {viewModel.primaryReason && <div><p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-text-tertiary">{t('가장 중요한 판정 이유', 'Key reason', 'السبب الرئيسي')}</p><p className="text-sm font-semibold leading-5.5 text-text-primary">{viewModel.primaryReason}</p></div>}
                    {(viewModel.ingredients.length > 0 || isSpicy) && (
                      <div className="flex flex-wrap gap-1.5">
                        {viewModel.ingredients.slice(0, 4).map((ingredient) => <span key={ingredient.localizedName} className="rounded-lg border border-border-warm bg-surface-subtle px-2.5 py-1.5 text-xs font-bold text-text-secondary">{ingredient.localizedName}</span>)}
                        {isSpicy && <span className="inline-flex items-center gap-1 rounded-lg border border-border-warm bg-surface-subtle px-2.5 py-1.5 text-xs font-bold text-text-secondary"><Flame className="size-3" />{t('매운 음식', 'Spicy', 'حار')}</span>}
                      </div>
                    )}

                    <CommunicationActions
                      primaryAction={menu.riskLevel !== 'safe' ? { id: 'ingredient', label: t('직원에게 재료 확인하기', 'Ask staff about ingredients', 'اسأل الموظف عن المكونات'), onClick: () => openSheet(menu, 'ingredient'), icon: <MessageSquareText className="size-4" /> } : undefined}
                      requestActions={requestActions}
                      trailingAction={{ id: 'order', label: t('주문 카드', 'Order card', 'بطاقة الطلب'), onClick: () => openSheet(menu, 'order') }}
                    />

                    <button onClick={() => toggleExpanded(menu.id)} aria-expanded={expanded} aria-controls={cardDetailsId} className="min-h-11 w-full rounded-xl px-3 py-2 text-sm font-bold text-brand-primary hover:bg-brand-primary-soft">
                      <span className="inline-flex items-center justify-center gap-1.5">{expanded ? t('근거 접기', 'Hide evidence', 'إخفاء الأدلة') : t('판정 근거 보기', 'View evidence', 'عرض الأدلة')}<ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} /></span>
                    </button>
                  </div>

                  {expanded && (
                    <div id={cardDetailsId} className="border-t border-border-warm bg-surface-subtle/60 px-4 pb-1 pt-4">
                      <EvidenceSection title={t('내 식단 프로필 관련 항목', 'Related profile items', 'عناصر الملف ذات الصلة')}>
                        {viewModel.profileRelatedItems.length > 0 ? <ul className="space-y-1.5 text-sm text-text-secondary">{viewModel.profileRelatedItems.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul> : <p className="text-sm leading-6 text-text-tertiary">{profileSummary.join(' · ') || t('설정된 식단 조건이 없어요', 'No dietary conditions are set.', 'لا توجد شروط غذائية محددة.')}</p>}
                      </EvidenceSection>

                      <EvidenceSection title={t('재료별 판정 근거', 'Evidence by ingredient', 'أدلة القرار حسب المكوّن')}>
                        {viewModel.ingredients.length > 0 ? (
                          <div className="space-y-2">
                            {viewModel.ingredients.map((ingredient) => (
                              <div key={ingredient.localizedName} className="rounded-xl border border-border-warm bg-surface-raised p-3">
                                <h5 className="text-sm font-extrabold">{ingredient.localizedName}</h5>
                                <dl className="mt-2 space-y-1.5 text-xs leading-5 text-text-secondary">
                                  {ingredient.confidence && <div className="flex gap-2"><dt className="shrink-0 text-text-tertiary">{t('근거 수준', 'Evidence level', 'مستوى الدليل')}</dt><dd className="font-bold text-text-primary">{localizeMenuText(CONFIDENCE_LABELS[ingredient.confidence], language)}</dd></div>}
                                  {ingredient.localizedSources.length > 0 && <div className="flex gap-2"><dt className="shrink-0 text-text-tertiary">{t('출처', 'Sources', 'المصادر')}</dt><dd className="font-semibold text-text-primary">{ingredient.localizedSources.join(', ')}</dd></div>}
                                  {ingredient.staffEvidence?.checkedCount !== undefined && ingredient.staffEvidence?.usedCount !== undefined && <div className="flex gap-2"><dt className="shrink-0 text-text-tertiary">{t('직원 확인 기록', 'Staff records', 'سجلات الموظفين')}</dt><dd>{formatStaffEvidence(language, ingredient.staffEvidence.usedCount, ingredient.staffEvidence.checkedCount)}</dd></div>}
                                </dl>
                                {ingredient.staffEvidence?.sampleSufficient === false && <p className="mt-2 text-xs font-semibold text-status-caution-text">{t('아직 확인 기록이 충분하지 않아요', 'There are not enough confirmation records yet.', 'لا توجد سجلات تأكيد كافية بعد.')}</p>}
                                {ingredient.sourcesConflict && <p className="mt-2 text-xs font-semibold text-status-caution-text">{t('재료 정보가 서로 달라 직원 확인이 필요해요', 'Ingredient sources conflict, so staff confirmation is needed.', 'تتعارض معلومات المكونات، لذا يلزم تأكيد الموظف.')}</p>}
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-text-tertiary">{t('표시할 재료 정보가 없어요.', 'No ingredient details are available.', 'لا تتوفر تفاصيل عن المكونات.')}</p>}
                      </EvidenceSection>

                      {viewModel.hiddenIngredientPaths.length > 0 && <EvidenceSection title={t('숨은 재료 추론 경로', 'Hidden ingredient path', 'مسار المكونات المخفية')}><div className="space-y-2">{viewModel.hiddenIngredientPaths.map((path) => <div key={path.join('-')} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border-warm bg-surface-raised p-3 text-sm font-semibold">{path.map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5"><span>{item}</span>{index < path.length - 1 && <ChevronRight className="size-4 text-text-tertiary rtl:rotate-180" />}</span>)}</div>)}</div></EvidenceSection>}

                      {viewModel.uncertainties.length > 0 && <EvidenceSection title={t('추가 확인이 필요한 정보', 'Information to verify', 'معلومات تحتاج إلى تحقق')} icon={<CircleHelp className="size-4 text-status-caution" />}><ul className="space-y-1.5 text-sm text-text-secondary">{viewModel.uncertainties.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul></EvidenceSection>}
                    </div>
                  )}
                </article>

              </Fragment>
            );
          })}

          {menuList.length > 0 && <p className="px-1 text-center text-[10px] leading-5 text-text-tertiary">{t('환율은 매일 00:00 (한국 시간)에 업데이트돼요. 환산 가격은 참고용이에요.', 'Exchange rates update daily at 00:00 KST. Converted prices are estimates.', 'تُحدّث أسعار الصرف يومياً عند 00:00 بتوقيت كوريا. الأسعار المحوّلة تقريبية.')}</p>}
          {recommendedArticles.length > 0 && <section className="border-t border-border-warm pt-6"><p className="eyebrow">A LITTLE MORE KOREA</p><h3 className="mb-4 mt-1 text-lg font-extrabold">{t('메뉴를 골랐다면, 한식 이야기', 'Chosen your dish? Discover its story.', 'اخترت طبقك؟ اكتشف قصته.')}</h3><div className="space-y-2">{recommendedArticles.map(article => <button key={article.id} onClick={() => navigate(`/curation/${article.id}`)} className="flex w-full items-center gap-3 rounded-2xl border border-border-warm bg-rice-white p-3 text-start"><span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-accent-soft text-2xl">{article.emoji}</span><span className="min-w-0 flex-1"><span className="block text-sm font-bold">{translateText(language, article.title)}</span><span className="mt-1 block line-clamp-1 text-xs text-text-secondary">{translateText(language, article.excerpt)}</span></span><ChevronRight className="size-4 rtl:rotate-180" /></button>)}</div></section>}

          {filteredMenus.length === 0 && (
            <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-border-warm bg-surface-raised px-5 py-12 text-center">
              <SearchX className="mb-3 size-8 text-text-tertiary" aria-hidden="true" />
              <p className="font-extrabold">{menuList.length === 0 ? t('분석된 메뉴가 없어요', 'No analyzed menu items', 'لا توجد عناصر محللة') : t('이 상태의 메뉴가 없어요', 'No items match this filter', 'لا توجد عناصر بهذا التصنيف')}</p>
              <p className="mt-1 text-sm text-text-secondary">{t('다른 필터를 선택하거나 다시 스캔해 주세요.', 'Choose another filter or scan again.', 'اختر مرشحًا آخر أو أعد المسح.')}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-border-warm bg-surface-raised/95 px-5 py-3 backdrop-blur">
        <button onClick={onRescan} className="min-h-12 rounded-xl border border-brand-primary bg-surface-raised px-3 text-sm font-extrabold text-brand-primary hover:bg-brand-primary-soft">{t('다시 스캔하기', 'Scan again', 'المسح مرة أخرى')}</button>
        <button disabled={menuList.length === 0} onClick={() => setSaveOpen(true)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-primary px-3 text-sm font-extrabold text-white disabled:opacity-40"><Bookmark className="size-4" />{saved ? t('기록 수정', 'Edit record', 'تعديل السجل') : t('기록하기', 'Keep this scan', 'احفظ المسح')}</button>
      </footer>

      {saveOpen && <SaveScanSheet language={language} menus={menuList} profile={userProfile} recordId={recordId} sourceScanId={sourceScanId} restaurantId={restaurantId} onClose={() => setSaveOpen(false)} onSaved={() => setSaved(true)} />}

      {sheetType && selectedMenu && <OwnerCommunicationSheet menu={selectedMenu} type={sheetType} userProfile={userProfile} language={language} initialResponse={getStoredResponse(selectedMenu, sheetType)} onResponseSelect={handleOwnerResponseSelect} onClose={closeSheet} />}
      {profileSheetOpen && <ProfileCommunicationSheet items={profileCommunicationItems} language={language} onClose={() => setProfileSheetOpen(false)} />}
    </div>
  );
}
