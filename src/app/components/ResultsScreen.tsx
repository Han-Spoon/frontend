import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Flame,
  Info,
  ListChecks,
  MessageSquareText,
  SearchX,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
import { createTranslator, LANGUAGE_LOCALES, translateText } from '../locales';
import logo from '../../assets/brand/han-spoon-logo.svg';
import { findMenuImageByName } from '../../api/image';
import { getMenuMeaning, getMenuPronunciation } from '../constants/menuNames';
import { CURATION_ARTICLES } from '../constants/curation';
import { speak, ttsSupported } from '../utils/speech';
import {
  getOwnerResponseOption,
  OwnerCommunicationSheet,
  type OwnerCommunicationType,
  type OwnerResponseId,
} from './OwnerCommunicationSheet';
import {
  ConfidenceBadge,
  EvidenceSection,
  ResultCount,
  RiskBadge,
  StatusGuidance,
} from './results/ResultEvidence';
import {
  buildMenuResultViewModel,
  CONFIDENCE_LABELS,
  getProfileSummary,
  LIKELIHOOD_LABELS,
  localizeMenuText,
} from '../results/resultViewModel';

interface ResultsScreenProps {
  language: Language;
  menus: MenuAnalysis[];
  userProfile: UserProfile | null;
  onBack: () => void;
  onRescan: () => void;
}

interface MenuImageProps {
  menu: MenuAnalysis;
  translatedName: string;
  t: (ko: string, en: string, ar: string) => string;
}

type FilterType = 'all' | MenuAnalysis['riskLevel'];

const cardBorderClasses: Record<MenuAnalysis['riskLevel'], string> = {
  safe: 'border-s-status-safe',
  caution: 'border-s-status-caution',
  danger: 'border-s-status-danger',
};

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
    return () => {
      mounted = false;
    };
  }, [menu.image, menu.menuName]);

  if (resolvedImage) {
    return <img src={resolvedImage} alt={translatedName} className="size-full object-cover" />;
  }

  return (
    <div className="flex size-full flex-col items-center justify-center gap-1.5 bg-surface-subtle text-text-tertiary">
      <img src={logo} alt={isDefaultImage ? t('기본 메뉴 이미지', 'Default menu image', 'صورة قائمة افتراضية') : translatedName} className="w-20 opacity-35" />
      <span className="text-[11px] font-semibold">{t('참고 이미지 없음', 'No reference image', 'لا توجد صورة مرجعية')}</span>
    </div>
  );
}

export function ResultsScreen({ language, menus, userProfile, onBack, onRescan }: ResultsScreenProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedMenu, setSelectedMenu] = useState<MenuAnalysis | null>(null);
  const [sheetType, setSheetType] = useState<OwnerCommunicationType | null>(null);
  const [ownerResponses, setOwnerResponses] = useState<Record<string, OwnerResponseId>>({});
  const t = createTranslator(language);
  const menuList = Array.isArray(menus) ? menus : [];
  const profileSummary = getProfileSummary(userProfile, language);

  const counts = useMemo(() => ({
    safe: menuList.filter((menu) => menu.riskLevel === 'safe').length,
    caution: menuList.filter((menu) => menu.riskLevel === 'caution').length,
    danger: menuList.filter((menu) => menu.riskLevel === 'danger').length,
  }), [menuList]);
  const filteredMenus = filter === 'all'
    ? menuList
    : menuList.filter((menu) => menu.riskLevel === filter);

  const responseKey = (menuId: string, type: OwnerCommunicationType) => `${menuId}:${type}`;
  const getStoredResponse = (menu: MenuAnalysis, type: OwnerCommunicationType) =>
    ownerResponses[responseKey(menu.id, type)] ?? null;
  const openSheet = (menu: MenuAnalysis, type: OwnerCommunicationType) => {
    setSelectedMenu(menu);
    setSheetType(type);
  };
  const closeSheet = () => {
    setSelectedMenu(null);
    setSheetType(null);
  };
  const handleOwnerResponseSelect = (type: OwnerCommunicationType, responseId: OwnerResponseId) => {
    if (!selectedMenu) return;
    setOwnerResponses((current) => ({
      ...current,
      [responseKey(selectedMenu.id, type)]: responseId,
    }));
  };
  const toggleExpanded = (menuId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };
  const formatPrice = (price: string) => {
    const value = Number(price);
    if (!Number.isFinite(value)) return price;
    return new Intl.NumberFormat(LANGUAGE_LOCALES[language], {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value);
  };

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
          <p className="mb-1 text-xs font-extrabold tracking-[0.08em] text-brand-primary">{t('분석 완료', 'ANALYSIS COMPLETE', 'اكتمل التحليل')}</p>
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
            {t(`메뉴 ${menuList.length}개를 확인했어요`, `${menuList.length} menu items checked`, `تم فحص ${menuList.length} عناصر`)}
          </h2>

          <div className="mt-4 rounded-xl border border-border-warm bg-surface-subtle px-3.5 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-extrabold text-text-secondary">
              <ShieldCheck className="size-4 text-brand-primary" aria-hidden="true" />
              {t('적용된 내 식단 프로필', 'Applied dietary profile', 'الملف الغذائي المطبق')}
            </div>
            {profileSummary.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profileSummary.map((item) => <span key={item} className="rounded-md bg-surface-raised px-2 py-1 text-xs font-semibold text-text-primary">{item}</span>)}
              </div>
            ) : (
              <p className="text-xs leading-5 text-text-secondary">{t('설정된 식단 조건이 없어요', 'No dietary conditions are set.', 'لا توجد شروط غذائية محددة.')}</p>
            )}
          </div>

          <div className="mt-3 flex gap-2">
            <ResultCount level="safe" count={counts.safe} label={t('안전', 'Safe', 'آمن')} />
            <ResultCount level="caution" count={counts.caution} label={t('주의', 'Caution', 'تنبيه')} />
            <ResultCount level="danger" count={counts.danger} label={t('위험', 'Danger', 'خطر')} />
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-border-warm px-3 py-2.5 text-xs leading-5 text-text-secondary">
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
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`min-h-11 shrink-0 rounded-xl border px-3.5 text-sm font-bold ${filter === item.value ? 'border-text-primary bg-text-primary text-white' : 'border-border-warm bg-surface-raised text-text-secondary hover:border-text-tertiary'}`}
            >
              {item.label} <span className="ms-1 opacity-70">{item.count}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-4 px-4 py-5 sm:px-5">
          {filteredMenus.map((menu) => {
            const expanded = expandedIds.has(menu.id);
            const translatedName = getTranslatedMenuName(menu, language);
            const pronunciation = getMenuPronunciation(menu.menuName, language);
            const description = getDescription(menu, language);
            const viewModel = buildMenuResultViewModel(menu, language);
            const curation = CURATION_ARTICLES.find((article) => article.id === viewModel.curationId);
            const responseId = getStoredResponse(menu, 'ingredient');
            const response = responseId ? getOwnerResponseOption('ingredient', responseId) : null;
            const cardDetailsId = `menu-details-${menu.id}`;

            return (
              <article key={menu.id} className={`overflow-hidden rounded-[var(--radius-card)] border border-s-4 border-border-warm bg-surface-raised shadow-[var(--shadow-card)] ${cardBorderClasses[menu.riskLevel]}`}>
                <div className="flex gap-3 border-b border-border-warm p-3.5">
                  <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-border-warm bg-surface-subtle sm:size-28">
                    <MenuImage menu={menu} translatedName={translatedName} t={t} />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                      <RiskBadge level={menu.riskLevel} t={t} />
                      {menu.price && <span className="text-sm font-extrabold">{formatPrice(menu.price)}</span>}
                    </div>
                    <h3 className="break-words text-lg font-extrabold tracking-[-0.015em]">{menu.menuName}</h3>
                    <p className="mt-0.5 break-words text-sm font-semibold text-text-secondary">{translatedName}</p>
                    <div className="mt-1 flex min-h-8 items-center gap-1.5">
                      {pronunciation && <span className="min-w-0 text-xs text-text-tertiary">{pronunciation}</span>}
                      {ttsSupported && (
                        <button onClick={() => speak(menu.menuName, 'ko-KR')} className="touch-target inline-flex shrink-0 items-center justify-center rounded-full text-brand-primary hover:bg-brand-primary-soft" aria-label={`${t('음성 듣기', 'Listen', 'استمع')}: ${menu.menuName}`}>
                          <Volume2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <StatusGuidance level={menu.riskLevel} t={t} />
                  {viewModel.primaryReason && (
                    <div>
                      <p className="mb-1 text-[11px] font-extrabold uppercase tracking-[0.06em] text-text-tertiary">{t('가장 중요한 판정 이유', 'Key reason', 'السبب الرئيسي')}</p>
                      <p className="text-sm font-semibold leading-5.5 text-text-primary">{viewModel.primaryReason}</p>
                    </div>
                  )}
                  {(viewModel.ingredients.length > 0 || menu.isSpicy || menu.is_spicy) && (
                    <div className="flex flex-wrap gap-1.5">
                      {viewModel.ingredients.slice(0, 4).map((ingredient) => (
                        <span key={ingredient.localizedName} className="rounded-lg border border-border-warm bg-surface-subtle px-2.5 py-1.5 text-xs font-bold text-text-secondary">{ingredient.localizedName}</span>
                      ))}
                      {(menu.isSpicy || menu.is_spicy) && <span className="inline-flex items-center gap-1 rounded-lg border border-border-warm bg-surface-subtle px-2.5 py-1.5 text-xs font-bold text-text-secondary"><Flame className="size-3" />{t('매운 음식', 'Spicy', 'حار')}</span>}
                    </div>
                  )}

                  <div className={`grid gap-2 ${menu.riskLevel === 'safe' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {menu.riskLevel !== 'safe' && (
                      <button onClick={() => openSheet(menu, 'ingredient')} className="col-span-2 min-h-12 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-extrabold text-white hover:bg-brand-primary-hover">
                        <span className="inline-flex items-center justify-center gap-2"><MessageSquareText className="size-4" />{t('직원에게 확인하기', 'Ask staff to confirm', 'اطلب من الموظف التأكيد')}</span>
                      </button>
                    )}
                    <button onClick={() => toggleExpanded(menu.id)} aria-expanded={expanded} aria-controls={cardDetailsId} className={`${menu.riskLevel === 'safe' ? '' : 'col-span-1'} min-h-11 rounded-xl border border-border-warm bg-surface-raised px-3 py-2 text-sm font-bold text-text-primary hover:bg-surface-subtle`}>
                      <span className="inline-flex items-center justify-center gap-1.5">{expanded ? t('근거 접기', 'Hide evidence', 'إخفاء الأدلة') : t('판정 근거 보기', 'View evidence', 'عرض الأدلة')}<ChevronDown className={`size-4 transition-transform ${expanded ? 'rotate-180' : ''}`} /></span>
                    </button>
                    <button onClick={() => openSheet(menu, 'order')} className={`${menu.riskLevel === 'safe' ? 'bg-brand-primary text-white hover:bg-brand-primary-hover' : 'col-span-1 border border-brand-primary text-brand-primary hover:bg-brand-primary-soft'} min-h-11 rounded-xl px-3 py-2 text-sm font-bold`}>
                      {t('주문 카드', 'Order card', 'بطاقة الطلب')}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div id={cardDetailsId} className="border-t border-border-warm bg-surface-subtle/60 px-4 pb-1 pt-4">
                    <EvidenceSection title={t('판정 이유', 'Decision reason', 'سبب القرار')} icon={<ListChecks className="size-4 text-brand-primary" />}>
                      <p className="text-sm leading-6 text-text-secondary">{viewModel.primaryReason || t('세부 판정 이유가 아직 제공되지 않았어요.', 'A detailed reason is not available yet.', 'سبب القرار التفصيلي غير متاح بعد.')}</p>
                    </EvidenceSection>

                    <EvidenceSection title={t('내 식단 프로필 관련 항목', 'Related profile items', 'عناصر الملف ذات الصلة')}>
                      {viewModel.profileRelatedItems.length > 0 ? (
                        <ul className="space-y-1.5 text-sm text-text-secondary">{viewModel.profileRelatedItems.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul>
                      ) : (
                        <p className="text-sm leading-6 text-text-tertiary">{t('판정에 사용된 세부 프로필 항목은 백엔드 연동 후 표시돼요.', 'Detailed profile matches will appear when supplied by the analysis API.', 'ستظهر مطابقة الملف التفصيلية عند توفيرها من واجهة التحليل.')}</p>
                      )}
                    </EvidenceSection>

                    <EvidenceSection title={t('확인되었거나 포함 가능성이 있는 재료', 'Confirmed or possible ingredients', 'مكونات مؤكدة أو محتملة')}>
                      {viewModel.ingredients.length > 0 ? (
                        <div className="space-y-2">
                          {viewModel.ingredients.map((ingredient) => (
                            <div key={ingredient.localizedName} className="rounded-xl border border-border-warm bg-surface-raised p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm font-extrabold">{ingredient.localizedName}</span>
                                {ingredient.confidence && <ConfidenceBadge confidence={ingredient.confidence} language={language} />}
                              </div>
                              {ingredient.inclusionLikelihood && <p className="mt-2 text-xs text-text-secondary">{t('포함 가능성', 'Likelihood of inclusion', 'احتمال الاحتواء')}: <strong>{localizeMenuText(LIKELIHOOD_LABELS[ingredient.inclusionLikelihood], language)}</strong></p>}
                              {ingredient.staffEvidence?.checkedCount !== undefined && ingredient.staffEvidence?.usedCount !== undefined && (
                                <p className="mt-1 text-xs text-text-secondary">{t('직원 확인 기록', 'Staff records', 'سجلات الموظفين')}: {t(`확인된 ${ingredient.staffEvidence.checkedCount}건 중 ${ingredient.staffEvidence.usedCount}건에서 사용됐어요`, `Used in ${ingredient.staffEvidence.usedCount} of ${ingredient.staffEvidence.checkedCount} confirmed records`, `استُخدم في ${ingredient.staffEvidence.usedCount} من أصل ${ingredient.staffEvidence.checkedCount} سجلاً مؤكداً`)}</p>
                              )}
                              {ingredient.staffEvidence?.sampleSufficient === false && <p className="mt-1 text-xs font-semibold text-status-caution-text">{t('아직 확인 기록이 충분하지 않아요', 'There are not enough confirmation records yet.', 'لا توجد سجلات تأكيد كافية بعد.')}</p>}
                              {ingredient.sourcesConflict && <p className="mt-1 text-xs font-semibold text-status-caution-text">{t('재료 정보가 서로 달라 직원 확인이 필요해요', 'Ingredient sources conflict, so staff confirmation is needed.', 'تتعارض معلومات المكونات، لذا يلزم تأكيد الموظف.')}</p>}
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-text-tertiary">{t('표시할 재료 정보가 없어요.', 'No ingredient details are available.', 'لا تتوفر تفاصيل عن المكونات.')}</p>}
                    </EvidenceSection>

                    {viewModel.hiddenIngredientPaths.length > 0 && (
                      <EvidenceSection title={t('숨은 재료 추론 경로', 'Hidden ingredient path', 'مسار المكونات المخفية')}>
                        <div className="space-y-2">{viewModel.hiddenIngredientPaths.map((path) => <div key={path.join('-')} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border-warm bg-surface-raised p-3 text-sm font-semibold">{path.map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-1.5"><span>{item}</span>{index < path.length - 1 && <ChevronRight className="size-4 text-text-tertiary rtl:rotate-180" />}</span>)}</div>)}</div>
                      </EvidenceSection>
                    )}

                    {viewModel.sources.length > 0 && (
                      <EvidenceSection title={t('근거와 출처', 'Evidence and sources', 'الأدلة والمصادر')}>
                        <div className="space-y-2">{viewModel.sources.map((source, index) => <div key={`${source.type}-${index}`} className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-border-warm bg-surface-raised px-3 py-2"><span className="text-sm font-semibold">{source.label}</span>{source.confidence && <span className="text-xs text-text-tertiary">{t('근거 수준', 'Evidence level', 'مستوى الدليل')}: {localizeMenuText(CONFIDENCE_LABELS[source.confidence], language)}</span>}</div>)}</div>
                      </EvidenceSection>
                    )}

                    <EvidenceSection title={t('추가 확인이 필요한 정보', 'Information to verify', 'معلومات تحتاج إلى تحقق')} icon={<CircleHelp className="size-4 text-status-caution" />}>
                      {viewModel.uncertainties.length > 0 ? <ul className="space-y-1.5 text-sm text-text-secondary">{viewModel.uncertainties.map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true">•</span><span>{item}</span></li>)}</ul> : <p className="text-sm leading-6 text-text-tertiary">{t('현재 API에서 별도의 불확실성 정보는 제공되지 않았어요.', 'The current API did not provide separate uncertainty details.', 'لم توفر الواجهة الحالية تفاصيل منفصلة عن عدم اليقين.')}</p>}
                    </EvidenceSection>

                    <EvidenceSection title={t('직원 소통 카드', 'Staff communication card', 'بطاقة التواصل مع الموظف')} icon={<MessageSquareText className="size-4 text-brand-primary" />}>
                      {response ? (
                        <div className="mb-2 rounded-xl border border-status-safe-border bg-status-safe-surface p-3 text-sm text-status-safe-text">
                          <p className="font-extrabold">{translateText(language, response.label)}</p>
                          <p className="mt-1 text-xs leading-5">{t('이번 응답은 향후 재료 가능성 계산을 개선하는 데 활용돼요.', 'This response helps improve future ingredient likelihood estimates.', 'تساعد هذه الإجابة في تحسين تقديرات احتمال المكونات مستقبلاً.')}</p>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => openSheet(menu, 'ingredient')} className="col-span-2 min-h-11 rounded-xl bg-brand-primary px-3 py-2 text-sm font-extrabold text-white hover:bg-brand-primary-hover">{t('직원에게 재료 확인하기', 'Ask staff about ingredients', 'اسأل الموظف عن المكونات')}</button>
                        {menu.riskLevel !== 'safe' && <button onClick={() => openSheet(menu, 'request')} className="min-h-11 rounded-xl border border-border-warm bg-surface-raised px-3 py-2 text-sm font-bold hover:bg-surface-interactive">{t('빼고 요청', 'Request removal', 'طلب الإزالة')}</button>}
                        {(menu.isSpicy || menu.is_spicy) && <button onClick={() => openSheet(menu, 'lessSpicy')} className="min-h-11 rounded-xl border border-border-warm bg-surface-raised px-3 py-2 text-sm font-bold hover:bg-surface-interactive">{t('덜 맵게 요청', 'Less spicy', 'أقل حدة')}</button>}
                      </div>
                    </EvidenceSection>

                    {curation && (
                      <EvidenceSection title={t('이 음식 더 알아보기', 'Learn more about this food', 'اعرف المزيد عن هذا الطعام')} icon={<Sparkles className="size-4 text-brand-accent" />}>
                        <button onClick={() => navigate(`/curation/${curation.id}`)} className="flex w-full items-center gap-3 rounded-xl border border-border-warm bg-surface-raised p-3 text-start hover:border-brand-accent">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-accent-soft text-xl" aria-hidden="true">{curation.emoji}</span>
                          <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold">{translateText(language, curation.title)}</span><span className="mt-0.5 block text-xs leading-5 text-text-secondary">{translateText(language, curation.excerpt)}</span></span>
                          <ExternalLink className="size-4 shrink-0 text-text-tertiary" />
                        </button>
                      </EvidenceSection>
                    )}

                    {description && <p className="border-t border-border-warm py-4 text-sm leading-6 text-text-secondary"><strong className="text-text-primary">{getMenuMeaning(menu.menuName, language) || translatedName}</strong>{' · '}{description}</p>}
                  </div>
                )}
              </article>
            );
          })}

          {filteredMenus.length === 0 && (
            <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-border-warm bg-surface-raised px-5 py-12 text-center">
              <SearchX className="mb-3 size-8 text-text-tertiary" aria-hidden="true" />
              <p className="font-extrabold">{menuList.length === 0 ? t('분석된 메뉴가 없어요', 'No analyzed menu items', 'لا توجد عناصر محللة') : t('이 상태의 메뉴가 없어요', 'No items match this filter', 'لا توجد عناصر بهذا التصنيف')}</p>
              <p className="mt-1 text-sm text-text-secondary">{t('다른 필터를 선택하거나 다시 스캔해 주세요.', 'Choose another filter or scan again.', 'اختر مرشحًا آخر أو أعد المسح.')}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="shrink-0 border-t border-border-warm bg-surface-raised/95 px-5 py-3 backdrop-blur">
        <button onClick={onRescan} className="min-h-11 w-full rounded-xl border border-brand-primary bg-surface-raised px-4 text-sm font-extrabold text-brand-primary hover:bg-brand-primary-soft">{t('다시 스캔하기', 'Scan again', 'المسح مرة أخرى')}</button>
      </footer>

      {sheetType && selectedMenu && (
        <OwnerCommunicationSheet
          menu={selectedMenu}
          type={sheetType}
          userProfile={userProfile}
          language={language}
          initialResponse={getStoredResponse(selectedMenu, sheetType)}
          onResponseSelect={handleOwnerResponseSelect}
          onClose={closeSheet}
        />
      )}
    </div>
  );
}
