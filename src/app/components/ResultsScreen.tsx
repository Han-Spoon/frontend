import { useState } from 'react';
import { ArrowLeft, Flame, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../App';
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

export function ResultsScreen({ language, menus, userProfile, onBack, onRescan }: ResultsScreenProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedMenu, setSelectedMenu] = useState<MenuAnalysis | null>(null);
  const [sheetType, setSheetType] = useState<OwnerCommunicationType | null>(null);
  const [ownerResponses, setOwnerResponses] = useState<Record<string, OwnerResponseId>>({});

  const t = (ko: string, en: string) => (language === 'ko' ? ko : en);
  const responseKey = (menuId: string, type: OwnerCommunicationType) => `${menuId}:${type}`;

  const actionLabels: Record<CardActionType, { ko: string; en: string }> = {
    order: { ko: '주문 카드', en: 'Order card' },
    ingredient: { ko: '재료 확인', en: 'Check ingredients' },
    request: { ko: '빼고 요청', en: 'Request removal' },
  };

  const responseButtonClasses: Record<OwnerResponseTone, string> = {
    success: 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100',
    caution: 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100',
    danger: 'bg-red-50 border-red-300 text-red-900 hover:bg-red-100',
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

  const getMenuName = (menu: MenuAnalysis) => (language === 'ko' ? menu.menuName : menu.menuNameEn);
  const getMenuSubName = (menu: MenuAnalysis) => (language === 'ko' ? menu.menuNameEn : menu.menuName);
  const getDescription = (menu: MenuAnalysis) =>
    language === 'ko' ? menu.description : menu.descriptionEn ?? menu.description;
  const getRiskReasons = (menu: MenuAnalysis) =>
    language === 'ko' ? menu.riskReasons : menu.riskReasonsEn ?? menu.riskReasons;

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
          <span className="block text-[14px]">{t(label.ko, label.en)}</span>
        </span>
      );
    }

    return (
      <span className="block leading-tight">
        <span className="block text-[10px] font-medium opacity-70">
          {t(label.ko, label.en)}
        </span>
        <span className="block mt-1">{response.label.ko}</span>
        <span className="block text-[11px] opacity-80 mt-0.5">{response.label.en}</span>
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-white relative">
      <div className="h-14 border-b border-neutral-200 flex items-center px-5 relative flex-shrink-0">
        <button onClick={onBack} className="absolute left-5">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <h1 className="font-semibold text-neutral-900 mx-auto">{t('분석 결과', 'Results')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-600">{t(`총 ${menus.length}개 메뉴 인식`, `Detected ${menus.length} items`)}</span>
          </div>
        </div>

        <div className="px-5 py-4 flex gap-2">
          {[
            { value: 'all', label: t('전체', 'All') },
            { value: 'safe', label: t('먹을 수 있어요', 'Safe') },
            { value: 'caution', label: t('확인 필요', 'Check') },
            { value: 'danger', label: t('위험', 'Danger') },
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
              {menu.image && (
                <div className="w-full h-40 bg-neutral-100">
                  <img src={menu.image} alt={getMenuName(menu)} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">{getMenuName(menu)}</h3>
                    <p className="text-xs text-neutral-500">{getMenuSubName(menu)}</p>
                  </div>
                  {menu.price && (
                    <span className="text-sm font-medium text-neutral-900">{menu.price}</span>
                  )}
                </div>

                <p className="text-sm text-neutral-600 mb-3">{getDescription(menu)}</p>

                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {menu.riskLevel === 'danger' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {t('위험', 'Danger')}
                    </span>
                  )}
                  {menu.riskLevel === 'caution' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
                      <AlertTriangle className="w-3 h-3" />
                      {t('확인 필요', 'Check')}
                    </span>
                  )}
                  {menu.riskLevel === 'safe' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {t('안전', 'Safe')}
                    </span>
                  )}
                  {menu.isSpicy && userProfile?.noSpicy && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs font-medium">
                      <Flame className="w-3 h-3" />
                      {t('매움', 'Spicy')}
                    </span>
                  )}
                </div>

                {getRiskReasons(menu).length > 0 && (
                  <div className="mb-3 p-3 bg-neutral-50 rounded-lg">
                    {getRiskReasons(menu).map((reason, i) => (
                      <p key={i} className="text-xs text-neutral-700">• {reason}</p>
                    ))}
                  </div>
                )}

                <div className={`grid gap-2 ${menu.riskLevel !== 'safe' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  <button
                    onClick={() => openSheet(menu, 'order')}
                    className={`min-h-12 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                      menu.riskLevel !== 'safe' ? 'col-span-2' : ''
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
                </div>
              </div>
            </div>
          ))}
        </div>

        {safeCount > 0 && (cautionCount + dangerCount) > 0 && (
          <div className="px-5 pb-6">
            <h3 className="text-sm font-medium text-neutral-900 mb-3">{t('같은 식당 내 안전 메뉴', 'Other safe menu items')}</h3>
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
          {t('다시 스캔하기', 'Scan again')}
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
