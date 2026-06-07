import { useState } from 'react';
import { ArrowLeft, Flame, AlertTriangle, CheckCircle2, OctagonX } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
import logo from '../../icons/logo.png';
import { getHitTagLabel } from '../i18n';
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

type FilterType = 'all' | 'safe' | 'caution' | 'danger';
type CardActionType = Exclude<OwnerCommunicationType, 'spicy'>;
type DietTag = {
  key: string;
  label: { ko: string; en: string; ar: string };
  className: string;
};

export function ResultsScreen({ language, menus, userProfile, onBack, onRescan }: ResultsScreenProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMenu, setSelectedMenu] = useState<MenuAnalysis | null>(null);
  const [sheetType, setSheetType] = useState<OwnerCommunicationType | null>(null);
  const [ownerResponses, setOwnerResponses] = useState<Record<string, OwnerResponseId>>({});

  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );
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

  const filteredMenus = menus.filter((menu) => {
    if (filter === 'all') return true;
    return menu.riskLevel === filter;
  });

  const safeCount = menus.filter((m) => m.riskLevel === 'safe').length;
  const cautionCount = menus.filter((m) => m.riskLevel === 'caution').length;
  const dangerCount = menus.filter((m) => m.riskLevel === 'danger').length;

  const openSheet = (menu: MenuAnalysis, type: OwnerCommunicationType) => {
    setSelectedMenu(menu);
    setSheetType(type);
  };

  const closeSheet = () => {
    setSheetType(null);
    setSelectedMenu(null);
  };

  const getMenuName = (menu: MenuAnalysis) => (
    language === 'ko' ? menu.menuName : language === 'ar' ? menu.menuNameAr ?? menu.menuNameEn : menu.menuNameEn
  );
  const getMenuSubName = (menu: MenuAnalysis) => (
    language === 'ko' ? menu.menuNameEn : language === 'ar' ? menu.menuName : menu.menuName
  );
  const getDescription = (menu: MenuAnalysis) =>
    language === 'ko'
      ? menu.description
      : language === 'ar'
        ? menu.descriptionAr ?? menu.descriptionEn ?? menu.description
        : menu.descriptionEn ?? menu.description;
  const getRiskReasons = (menu: MenuAnalysis) =>
    language === 'ko'
      ? menu.riskReasons
      : language === 'ar'
        ? menu.riskReasonsAr ?? menu.riskReasonsEn ?? menu.riskReasons
        : menu.riskReasonsEn ?? menu.riskReasons;
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
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-400 text-white rounded-full text-xs font-semibold">
          <OctagonX className="w-3 h-3" />
          {t('위험', 'Danger', 'خطر')}
        </span>
      );
    }

    if (menu.riskLevel === 'caution') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-400 text-white rounded-full text-xs font-semibold">
          <AlertTriangle className="w-3 h-3" />
          {t('확인 필요', 'Check', 'تحقق')}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-full text-xs font-semibold">
        <CheckCircle2 className="w-3 h-3" />
        {t('안전', 'Safe', 'آمن')}
      </span>
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
      return 'bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800';
    }

    return 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400';
  };

  const renderActionButtonLabel = (menu: MenuAnalysis, type: CardActionType) => {
    const label = actionLabels[type];
    const responseId = getStoredResponse(menu, type);
    const response = responseId ? getOwnerResponseOption(type, responseId) : null;

    if (!response) {
      return (
        <span className="block leading-tight">
          <span className="block text-[14px]">{t(label.ko, label.en, label.ar)}</span>
        </span>
      );
    }

    return (
      <span className="block leading-tight">
        <span className="block text-[10px] font-medium opacity-70">
          {t(label.ko, label.en, label.ar)}
        </span>
        <span className="block mt-1">{t(response.label.ko, response.label.en, response.label.ar)}</span>
        <span className="block text-[11px] opacity-80 mt-0.5">{language === 'ko' ? response.label.en : response.label.ko}</span>
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white relative">
      <div className="h-14 border-b border-neutral-200 flex items-center px-5 relative flex-shrink-0">
        <button onClick={onBack} className="absolute left-5">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="font-semibold text-neutral-900 mx-auto">{t('분석 결과', 'Results', 'نتائج التحليل')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">{t(`총 ${menus.length}개 메뉴 인식`, `Detected ${menus.length} items`, `تم التعرف على ${menus.length} عناصر`)}</span>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-2">
          {[
            { value: 'all', label: t('전체', 'All', 'الكل') },
            { value: 'safe', label: t('안전', 'Safe', 'آمن') },
            { value: 'caution', label: t('확인 필요', 'Check', 'تحقق') },
            { value: 'danger', label: t('위험', 'Danger', 'خطر') },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as FilterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === value
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white border border-neutral-300 text-neutral-700 hover:border-neutral-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="px-5 pb-20 space-y-3">
          {filteredMenus.map((menu) => (
            <div key={menu.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="w-full h-40 bg-neutral-100">
                {menu.image ? (
                  <img src={menu.image} alt={getImageAlt(menu)} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400">
                    <img src={logo} alt={getImageAlt(menu)} className="w-12 h-12 object-contain opacity-40" />
                    <span className="text-xs font-medium">
                      {t('이미지 없음', 'No image', 'لا توجد صورة')}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">
                      {getMenuName(menu)}
                      {menu.riskLevel === 'danger' && isSpicyMenu(menu) && <span className="ml-1">🌶️</span>}
                    </h3>
                    <p className="text-xs text-neutral-500">{getMenuSubName(menu)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-3">
                    {renderRiskBadge(menu)}
                    {menu.price && (
                      <span className="text-sm font-medium text-neutral-900">{menu.price}</span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-neutral-600 mb-3">{getDescription(menu)}</p>

                {(() => {
                  const dietTags = getDietTags(menu);
                  const ingredientTags = Array.from(
                    new Set(menu.riskReasons.map((code) => getHitTagLabel(code, language)).filter(Boolean)),
                  );
                  if (dietTags.length === 0 && ingredientTags.length === 0) return null;
                  const ingredientClass =
                    menu.riskLevel === 'danger' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700';
                  return (
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {dietTags.map((tag) => (
                        <span key={tag.key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${tag.className}`}>
                          {tag.key === 'spicy' ? <Flame className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {t(tag.label.ko, tag.label.en, tag.label.ar)}
                        </span>
                      ))}
                      {ingredientTags.map((label) => (
                        <span key={`ing-${label}`} className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${ingredientClass}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {label}
                        </span>
                      ))}
                    </div>
                  );
                })()}

                <div className={`grid gap-2 ${menu.riskLevel !== 'safe' || isSpicyMenu(menu) ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <button
                    onClick={() => openSheet(menu, 'order')}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      menu.riskLevel !== 'safe' || isSpicyMenu(menu) ? 'col-span-2' : ''
                    } ${getActionButtonClasses(menu, 'order', true)}`}
                  >
                    {renderActionButtonLabel(menu, 'order')}
                  </button>
                  {menu.riskLevel !== 'safe' && (
                    <>
                      <button
                        onClick={() => openSheet(menu, 'ingredient')}
                        className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${getActionButtonClasses(menu, 'ingredient')}`}
                      >
                        {renderActionButtonLabel(menu, 'ingredient')}
                      </button>
                      <button
                        onClick={() => openSheet(menu, 'request')}
                        className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${getActionButtonClasses(menu, 'request')}`}
                      >
                        {renderActionButtonLabel(menu, 'request')}
                      </button>
                    </>
                  )}
                  {isSpicyMenu(menu) && (
                    <>
                      <button
                        onClick={() => openSheet(menu, 'lessSpicy')}
                        className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${getActionButtonClasses(menu, 'lessSpicy')}`}
                      >
                        {renderActionButtonLabel(menu, 'lessSpicy')}
                      </button>
                      <button
                        onClick={() => openSheet(menu, 'moreSpicy')}
                        className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${getActionButtonClasses(menu, 'moreSpicy')}`}
                      >
                        {renderActionButtonLabel(menu, 'moreSpicy')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {safeCount > 0 && (cautionCount + dangerCount) > 0 && (
          <div className="px-5 pb-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">{t('같은 식당 내 안전 메뉴', 'Other safe menu items', 'أطباق آمنة أخرى في نفس المطعم')}</h3>
            <div className="space-y-2">
              {menus.filter((m) => m.riskLevel === 'safe').slice(0, 2).map((menu) => (
                <div key={menu.id} className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900">{getMenuName(menu)}</span>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-200 px-5 py-4 bg-white flex-shrink-0">
        <button
          onClick={onRescan}
          className="w-full h-12 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors"
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
