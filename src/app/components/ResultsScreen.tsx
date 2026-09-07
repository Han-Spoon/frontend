import { useState, useEffect } from 'react';
import { ArrowLeft, Flame, AlertTriangle, CheckCircle2, OctagonX, Volume2 } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
import { createTranslator, LANGUAGE_LOCALES, translateText } from '../locales';
import logo from '../../assets/brand/han-spoon-logo.svg';
import { findMenuImageByName } from '../../api/image';
import { getHitTagLabel } from '../i18n';
import { getMenuMeaning, getMenuPronunciation } from '../constants/menuNames';
import { speak, ttsSupported } from '../utils/speech';
import {
  getOwnerResponseOption,
  OwnerCommunicationSheet,
  type OwnerCommunicationType,
  type OwnerResponseId,
  type OwnerResponseTone,
} from './OwnerCommunicationSheet';

interface ResultsScreenProps {
  language: Language;
  menus: MenuAnalysis[];
  userProfile: UserProfile | null;
  onBack: () => void;
  onRescan: () => void;
}

interface MenuImageProps {
  menu: MenuAnalysis;
  language: Language;
  getMenuName: (menu: MenuAnalysis) => string;
  t: (ko: string, en: string, ar: string) => string;
}

type FilterType = 'all' | 'safe' | 'caution' | 'danger';
type CardActionType = Exclude<OwnerCommunicationType, 'spicy'>;
type DietTag = {
  key: string;
  label: { ko: string; en: string; ar: string };
  className: string;
};

const HIDDEN_RISK_REASON_LABELS = new Set([
  'unknown menu',
  'unknown remain',
  'hidden animal',
]);

const asStringList = (value?: string[] | null) => (Array.isArray(value) ? value : []);

export function MenuImage({ menu, getMenuName, t }: MenuImageProps) {
  const [resolvedImage, setResolvedImage] = useState<string | null>(menu.image ?? null);
  const [isDefaultImage, setIsDefaultImage] = useState(!menu.image);

  useEffect(() => {
    let isMounted = true;

    async function resolveImage() {
      console.log('[MenuImage] menu:', menu);

      // 1. menu.image가 있으면 그대로 사용
      if (menu.image) {
        console.log('[MenuImage] image URL:', menu.image);
        setResolvedImage(menu.image);
        setIsDefaultImage(false);
        return;
      }

      // 2. menu.image가 없으면 메뉴명과 같은 참고 이미지 탐색
      const fileNameWithoutExt = menu.menuName;
      const referenceImageUrl = await findMenuImageByName(fileNameWithoutExt);

      if (!isMounted) return;

      // 3. 참고 이미지가 있으면 해당 이미지 사용
      if (referenceImageUrl) {
        console.log('[MenuImage] image URL:', referenceImageUrl);
        setResolvedImage(referenceImageUrl);
        setIsDefaultImage(false);
        return;
      }

      // 4. 없으면 기본 이미지 사용
      setResolvedImage(null);
      setIsDefaultImage(true);
    }

    resolveImage();

    return () => {
      isMounted = false;
    };
  }, [menu, getMenuName]);

  const imageAlt = isDefaultImage
    ? t('기본 메뉴 이미지', 'Default menu image', 'صورة قائمة افتراضية')
    : getMenuName(menu);

  if (resolvedImage) {
    return (
      <img
        src={resolvedImage}
        alt={imageAlt}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-brand-green-50 text-sesame-gray">
      <img
        src={logo}
        alt={imageAlt}
        className="w-28 h-auto object-contain opacity-40"
      />
      <span className="text-xs font-medium">
        {t('이미지 없음', 'No image', 'لا توجد صورة')}
      </span>
    </div>
  );
}

export function ResultsScreen({ language, menus, userProfile, onBack, onRescan }: ResultsScreenProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMenu, setSelectedMenu] = useState<MenuAnalysis | null>(null);
  const [sheetType, setSheetType] = useState<OwnerCommunicationType | null>(null);
  const [ownerResponses, setOwnerResponses] = useState<Record<string, OwnerResponseId>>({});
  const menuList = Array.isArray(menus) ? menus : [];

  const t = createTranslator(language);
  const formatPrice = (price: string) => {
    const value = Number(price);
    if (!Number.isFinite(value)) return price;
    return new Intl.NumberFormat(LANGUAGE_LOCALES[language], {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value);
  };
  const responseKey = (menuId: string, type: OwnerCommunicationType) => `${menuId}:${type}`;

  const actionLabels: Record<CardActionType, { ko: string; en: string; ar: string }> = {
    order: { ko: '주문 카드', en: 'Order card', ar: 'بطاقة الطلب' },
    ingredient: { ko: '재료 확인', en: 'Check ingredients', ar: 'تحقق من المكونات' },
    request: { ko: '빼고 요청', en: 'Request removal', ar: 'طلب الإزالة' },
    lessSpicy: { ko: '덜맵게 요청', en: 'Less spicy', ar: 'أقل حدة' },
    moreSpicy: { ko: '더맵게 요청', en: 'More spicy', ar: 'أكثر حدة' },
  };

  const responseButtonClasses: Record<OwnerResponseTone, string> = {
    success: 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100',
    caution: 'bg-orange-50 border-orange-300 text-orange-900 hover:bg-orange-100',
    danger: 'bg-red-50 border-red-300 text-red-900 hover:bg-red-100',
  };

  const religionWarningLabels: Record<string, DietTag['label']> = {
    halal: { ko: '할랄 주의', en: 'Halal caution', ar: 'تنبيه حلال' },
    kosher: { ko: '코셔 주의', en: 'Kosher caution', ar: 'تنبيه كوشير' },
    hindu: { ko: '힌두 주의', en: 'Hindu caution', ar: 'تنبيه هندوسي' },
  };

  const veganWarningLabels: Record<string, DietTag['label']> = {
    vegan: { ko: '비건 주의', en: 'Vegan caution', ar: 'تنبيه نباتي صارم' },
    lacto: { ko: '락토 주의', en: 'Lacto caution', ar: 'تنبيه لاكتو' },
    ovo: { ko: '오보 주의', en: 'Ovo caution', ar: 'تنبيه أوفو' },
    lacto_ovo: { ko: '락토 오보 주의', en: 'Lacto-Ovo caution', ar: 'تنبيه لاكتو أوفو' },
    pesco: { ko: '페스코 주의', en: 'Pesco caution', ar: 'تنبيه بيسكو' },
  };

  const normalizeReligionType = (value?: string | null) => {
    const normalized = value?.trim().toLowerCase();
    const aliases: Record<string, string> = {
      halal: 'halal',
      '할랄': 'halal',
      kosher: 'kosher',
      '코셔': 'kosher',
      hindu: 'hindu',
      '힌두': 'hindu',
    };

    return normalized ? aliases[normalized] : undefined;
  };

  const normalizeVeganType = (value?: string | null) => {
    const normalized = value?.trim().toLowerCase().replace(/-/g, '_');
    const aliases: Record<string, string> = {
      vegan: 'vegan',
      '비건': 'vegan',
      lacto: 'lacto',
      '락토': 'lacto',
      ovo: 'ovo',
      '오보': 'ovo',
      lacto_ovo: 'lacto_ovo',
      lactoovo: 'lacto_ovo',
      '락토오보': 'lacto_ovo',
      '락토 오보': 'lacto_ovo',
      pesco: 'pesco',
      '페스코': 'pesco',
    };

    return normalized ? aliases[normalized] : undefined;
  };

  const filteredMenus = menuList.filter((menu) => {
    if (filter === 'all') return true;
    return menu.riskLevel === filter;
  });

  const safeCount = menuList.filter((m) => m.riskLevel === 'safe').length;
  const cautionCount = menuList.filter((m) => m.riskLevel === 'caution').length;
  const dangerCount = menuList.filter((m) => m.riskLevel === 'danger').length;

  const openSheet = (menu: MenuAnalysis, type: OwnerCommunicationType) => {
    setSelectedMenu(menu);
    setSheetType(type);
  };

  const closeSheet = () => {
    setSheetType(null);
    setSelectedMenu(null);
  };

  // 메인: 항상 한국어 메뉴명
  const getMenuName = (menu: MenuAnalysis) => menu.menuName;
  // 회색 보조줄: 사용자 언어 발음(en=로마자, ar=아랍 음역). ko는 빈 값.
  const getMenuSubName = (menu: MenuAnalysis) => getMenuPronunciation(menu.menuName, language);
  const getDescription = (menu: MenuAnalysis) =>
    language === 'ko'
      ? menu.description
      : language === 'ar'
        ? menu.descriptionAr ?? menu.descriptionEn ?? menu.description
        : menu.descriptionEn ?? menu.description;
  const getRiskReasons = (menu: MenuAnalysis) =>
    language === 'ko'
      ? asStringList(menu.riskReasons)
      : language === 'ar'
        ? asStringList(menu.riskReasonsAr ?? menu.riskReasonsEn ?? menu.riskReasons)
        : asStringList(menu.riskReasonsEn ?? menu.riskReasons);
  const getImageAlt = (menu: MenuAnalysis) => (
    menu.image
      ? getMenuName(menu)
      : t('기본 메뉴 이미지', 'Default menu image', 'صورة قائمة افتراضية')
  );

  const isSpicyMenu = (menu: MenuAnalysis) => menu.isSpicy || menu.is_spicy === true;
  const isAlcoholMenu = (menu: MenuAnalysis) => menu.isAlcohol === true || menu.is_alcohol === true;

  const getDietTags = (menu: MenuAnalysis): DietTag[] => {
    const tags: DietTag[] = [];
    const religionType = normalizeReligionType(userProfile?.religionType);
    const veganType = normalizeVeganType(userProfile?.veganType);

    if (religionType && religionWarningLabels[religionType]) {
      tags.push({
        key: `religion-${religionType}`,
        label: religionWarningLabels[religionType],
        className: 'bg-amber-50 text-amber-700',
      });
    }

    if (veganType && veganWarningLabels[veganType]) {
      tags.push({
        key: `vegan-${veganType}`,
        label: veganWarningLabels[veganType],
        className: 'bg-amber-50 text-amber-700',
      });
    }

    if (userProfile?.noSpicy && isSpicyMenu(menu)) {
      tags.push({
        key: 'spicy',
        label: { ko: '매운 음식', en: 'Spicy food', ar: 'طعام حار' },
        className: 'bg-amber-50 text-amber-700',
      });
    }

    if (userProfile?.noAlcohol && isAlcoholMenu(menu)) {
      tags.push({
        key: 'alcohol',
        label: { ko: '알코올', en: 'Alcohol', ar: 'كحول' },
        className: 'bg-amber-50 text-amber-700',
      });
    }

    return tags;
  };

  const renderRiskBadge = (menu: MenuAnalysis) => {
    if (menu.riskLevel === 'danger') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
          <OctagonX className="w-3 h-3" />
          {t('위험', 'Danger', 'خطر')}
        </span>
      );
    }

    if (menu.riskLevel === 'caution') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800">
          <AlertTriangle className="w-3 h-3" />
          {t('주의', 'Caution', 'تنبيه')}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-800">
        <CheckCircle2 className="w-3 h-3" />
        {t('안전', 'Safe', 'آمن')}
      </span>
    );
  };

  const renderRiskGuidance = (menu: MenuAnalysis) => {
    if (menu.riskLevel === 'danger') {
      return (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3 text-red-900">
          <OctagonX className="mt-0.5 size-4 shrink-0 text-red-600" aria-hidden="true" />
          <p className="text-sm font-semibold leading-5">
            {t(
              '식이 기준과 맞지 않아 피하는 게 좋아요',
              'This dish may not fit your dietary needs, so it is best to avoid it.',
              'قد لا يناسب هذا الطبق احتياجاتك الغذائية، لذا يُفضّل تجنبه.',
            )}
          </p>
        </div>
      );
    }

    if (menu.riskLevel === 'caution') {
      return (
        <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-950">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
          <p className="text-sm font-semibold leading-5">
            {t(
              '재료나 조리법을 한 번 더 확인해 주세요',
              'Please check the ingredients or cooking method before ordering.',
              'يرجى التحقق من المكونات أو طريقة التحضير قبل الطلب.',
            )}
          </p>
        </div>
      );
    }

    return (
      <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-green-200 bg-green-50 px-3.5 py-3 text-green-950">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-700" aria-hidden="true" />
        <p className="text-sm font-semibold leading-5">
          {t(
            '현재 확인된 정보로는 안심하고 선택해도 좋아요',
            'Based on the information available, this dish should suit your needs.',
            'وفقًا للمعلومات المتاحة، يمكنك اختيار هذا الطبق باطمئنان.',
          )}
        </p>
      </div>
    );
  };

  const getStoredResponse = (menu: MenuAnalysis, type: OwnerCommunicationType) =>
    ownerResponses[responseKey(menu.id, type)] ?? null;

  const handleOwnerResponseSelect = (type: OwnerCommunicationType, responseId: OwnerResponseId) => {
    if (!selectedMenu) return;

    setOwnerResponses((prev) => ({
      ...prev,
      [responseKey(selectedMenu.id, type)]: responseId,
    }));
  };

  const getActionButtonClasses = (menu: MenuAnalysis, type: CardActionType, primary = false) => {
    const responseId = getStoredResponse(menu, type);
    const response = responseId ? getOwnerResponseOption(type, responseId) : null;

    if (response) {
      return responseButtonClasses[response.tone];
    }

    if (primary) {
      return 'bg-brand-green-700 border-brand-green-700 text-white hover:bg-brand-green-900';
    }

    return 'bg-rice-white border-border-warm text-soy-ink hover:bg-brand-green-50 hover:border-brand-green-500';
  };

  const renderActionButtonLabel = (menu: MenuAnalysis, type: CardActionType) => {
    const label = actionLabels[type];
    const responseId = getStoredResponse(menu, type);
    const response = responseId ? getOwnerResponseOption(type, responseId) : null;

    if (!response) {
      return (
        <span className="block leading-tight">
          <span className="block text-[14px]">{translateText(language, label)}</span>
        </span>
      );
    }

    return (
      <span className="block leading-tight">
        <span className="block text-[10px] font-medium opacity-70">
          {translateText(language, label)}
        </span>
        <span className="block mt-1">{translateText(language, response.label)}</span>
        <span className="block text-[11px] opacity-80 mt-0.5">{language === 'ko' ? response.label.en : response.label.ko}</span>
      </span>
    );
  };

  return (
    <div className="h-dvh flex flex-col bg-rice-cream relative">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center px-5 relative flex-shrink-0">
        <button
          onClick={onBack}
          className="absolute start-4 inline-flex size-11 items-center justify-center rounded-full text-soy-ink transition-colors hover:bg-brand-green-50"
          aria-label={t('이전', 'Back', 'رجوع')}
        >
          <ArrowLeft className="size-5 rtl:rotate-180" />
        </button>
        <h1 className="text-base font-bold text-soy-ink mx-auto">{t('분석 결과', 'Results', 'نتائج التحليل')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-6 pb-5 bg-brand-green-50 border-b border-brand-green-100">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-bold tracking-[0.08em] text-brand-green-700">
                {t('SCAN COMPLETE', 'SCAN COMPLETE', 'اكتمل المسح')}
              </p>
              <span className="text-lg font-extrabold text-soy-ink">{t(`총 ${menuList.length}개 메뉴 인식`, `Detected ${menuList.length} items`, `تم التعرف على ${menuList.length} عناصر`)}</span>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rice-white text-brand-green-700 shadow-sm">
              <CheckCircle2 className="size-6" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { value: 'all', label: t('전체', 'All', 'الكل'), count: menuList.length },
            { value: 'safe', label: t('안전', 'Safe', 'آمن'), count: safeCount },
            { value: 'caution', label: t('주의', 'Caution', 'تنبيه'), count: cautionCount },
            { value: 'danger', label: t('위험', 'Danger', 'خطر'), count: dangerCount },
          ].map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilter(value as FilterType)}
              className={`min-h-10 shrink-0 px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap transition-colors ${
                filter === value
                  ? 'bg-brand-green-700 border-brand-green-700 text-white shadow-sm'
                  : 'bg-rice-white border-border-warm text-sesame-gray hover:border-brand-green-500'
              }`}
            >
              {label} <span className="opacity-70">{count}</span>
            </button>
          ))}
        </div>

        <div className="px-5 pb-8 space-y-4">
          {filteredMenus.map((menu) => (
            <article key={menu.id} className="bg-rice-white border border-border-warm rounded-[1.5rem] overflow-hidden shadow-[0_8px_28px_rgba(54,61,57,0.07)]">
              <div className="w-full h-44 bg-brand-green-50">
                <MenuImage
                  menu={menu}
                  language={language}
                  getMenuName={getMenuName}
                  t={t}
                />
              </div>

              <div className="p-4.5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-extrabold tracking-[-0.015em] text-soy-ink mb-1">
                      {getMenuName(menu)}
                      {menu.riskLevel === 'danger' && isSpicyMenu(menu) && <span className="ms-1">🌶️</span>}
                    </h3>
                    {getMenuSubName(menu) && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-sesame-gray min-w-0 break-words">{getMenuSubName(menu)}</span>
                        {ttsSupported && (
                          <button
                            onClick={() => speak(menu.menuName, 'ko-KR')}
                            className="flex-shrink-0 size-8 rounded-full bg-brand-green-50 flex items-center justify-center text-brand-green-700 hover:bg-brand-green-100 transition-colors"
                            aria-label={t('음성 듣기', 'Play audio', 'تشغيل الصوت')}
                          >
                            <Volume2 className="size-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {renderRiskBadge(menu)}
                    {menu.price && (
                      <span className="text-sm font-bold text-soy-ink">{formatPrice(menu.price)}</span>
                    )}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-sesame-gray mb-4">
                  {getMenuMeaning(menu.menuName, language) && (
                    <span className="font-bold text-soy-ink">
                      {getMenuMeaning(menu.menuName, language)}.{' '}
                    </span>
                  )}
                  {getDescription(menu)}
                </p>

                {renderRiskGuidance(menu)}

                {(() => {
                  const dietTags = getDietTags(menu);
                  const ingredientTags = Array.from(
                    new Set(asStringList(menu.riskReasons)
                      .map((code) => getHitTagLabel(code, language))
                      .filter((label): label is string => Boolean(label))
                      .filter((label) => !HIDDEN_RISK_REASON_LABELS.has(label.trim().toLowerCase()))
                    ),
                  );
                  if (dietTags.length === 0 && ingredientTags.length === 0) return null;
                  const ingredientClass =
                    menu.riskLevel === 'danger' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';
                  return (
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {dietTags.map((tag) => (
                        <span 
                          key={tag.key} 
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${tag.className}`}
                        >
                          {tag.key === 'spicy' ? <Flame className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {translateText(language, tag.label)}
                        </span>
                      ))}
                      {ingredientTags.map((label) => (
                        <span
                          key={`ing-${label}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${ingredientClass}`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {label === 'fish' ? '생선' : label}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                <div className={`grid gap-2 ${menu.riskLevel !== 'safe' || isSpicyMenu(menu) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <button
                    onClick={() => openSheet(menu, 'order')}
                    className={`min-h-13 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${
                      menu.riskLevel !== 'safe' || isSpicyMenu(menu) ? 'col-span-2' : ''
                    } ${getActionButtonClasses(menu, 'order', true)}`}
                  >
                    {renderActionButtonLabel(menu, 'order')}
                  </button>
                  {menu.riskLevel !== 'safe' && (
                    <>
                      <button
                        onClick={() => openSheet(menu, 'ingredient')}
                        className={`min-h-13 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${getActionButtonClasses(menu, 'ingredient')}`}
                      >
                        {renderActionButtonLabel(menu, 'ingredient')}
                      </button>
                      <button
                        onClick={() => openSheet(menu, 'request')}
                        className={`min-h-13 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${getActionButtonClasses(menu, 'request')}`}
                      >
                        {renderActionButtonLabel(menu, 'request')}
                      </button>
                    </>
                  )}
                  {isSpicyMenu(menu) && (
                    <>
                      <button
                        onClick={() => openSheet(menu, 'lessSpicy')}
                        className={`min-h-13 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${getActionButtonClasses(menu, 'lessSpicy')}`}
                      >
                        {renderActionButtonLabel(menu, 'lessSpicy')}
                      </button>
                      <button
                        onClick={() => openSheet(menu, 'moreSpicy')}
                        className={`min-h-13 rounded-2xl border px-3 py-2 text-xs font-bold transition-colors ${getActionButtonClasses(menu, 'moreSpicy')}`}
                      >
                        {renderActionButtonLabel(menu, 'moreSpicy')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {safeCount > 0 && (cautionCount + dangerCount) > 0 && (
          <div className="px-5 pb-6">
            <h3 className="text-sm font-bold text-soy-ink mb-3">{t('함께 찾은 안심 메뉴', 'Other suitable dishes we found', 'أطباق أخرى مناسبة وجدناها')}</h3>
            <div className="space-y-2">
              {menuList.filter((m) => m.riskLevel === 'safe').slice(0, 2).map((menu) => (
                <div key={menu.id} className="p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-900">{getMenuName(menu)}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border-warm px-5 py-4 bg-rice-white/95 flex-shrink-0">
        <button
          onClick={onRescan}
          className="w-full h-13 bg-rice-white border border-brand-green-700 text-brand-green-700 text-sm font-bold rounded-2xl hover:bg-brand-green-50 transition-colors"
        >
          {t('다시 스캔하기', 'Scan again', 'المسح مرة أخرى')}
        </button>
      </div>

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
