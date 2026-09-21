import { useState } from 'react';
import { Check, ChevronRight, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveScanRecord, type ScanRecordResponse } from '../../../api/scan';
import type { StoreCandidate, StoreMatchMethod, StoreSummary } from '../../../api/store';
import type { Language, MenuAnalysis, UserProfile } from '../../App';
import { BottomSheet } from '../discovery/BottomSheet';
import { RestaurantPicker } from '../discovery/RestaurantPicker';
import { RESTAURANTS } from '../../demo/restaurants';
import { saveVisit, type VisitRecord } from '../../demo/records';
import { createTranslator } from '../../locales';
import {
  getProfileCommunicationItems,
  localizeMenuText,
} from '../../results/resultViewModel';
import { readDemo, writeDemo } from '../../demo/storage';

export function SaveScanSheet({
  language,
  menus,
  profile,
  recordId,
  sourceScanId,
  restaurantId,
  scanStore,
  scanRecord,
  onClose,
  onSaved,
}: {
  language: Language;
  menus: MenuAnalysis[];
  profile: UserProfile | null;
  recordId: string;
  sourceScanId?: string;
  restaurantId: string | null;
  scanStore?: StoreSummary | null;
  scanRecord?: ScanRecordResponse | null;
  onClose: () => void;
  onSaved: (record?: ScanRecordResponse) => void;
}) {
  const t = createTranslator(language);
  const navigate = useNavigate();
  const existing = readDemo<VisitRecord[]>('records', []).find(
    (r) => r.id === recordId,
  );
  const [selected, setSelected] = useState<string | null>(
    existing ? existing.restaurantId : restaurantId,
  );
  const [selectedStore, setSelectedStore] = useState<{
    storeId: number;
    name: string;
    matchMethod: StoreMatchMethod;
  } | null>(() => {
    if (scanRecord?.storeLocked || !scanRecord?.store || !scanRecord.storeMatchMethod) {
      return null;
    }
    return {
      storeId: scanRecord.store.storeId,
      name: scanRecord.store.name,
      matchMethod: scanRecord.storeMatchMethod,
    };
  });
  const [picker, setPicker] = useState(false);
  const [done, setDone] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<VisitRecord['feedback']>(
    scanRecord?.feedback ?? existing?.feedback ?? {},
  );
  const restaurant = RESTAURANTS.find((r) => r.id === selected);
  // 기존 로컬 기록은 그대로 편집하고, 로컬 기록이 없는 실제 스캔만 서버에 저장한다.
  const isServerRecord = sourceScanId !== undefined && existing === undefined;
  const lockedStore = scanStore
    ?? (scanRecord?.storeLocked ? scanRecord.store : null)
    ?? null;
  const hasRestaurant = lockedStore !== null
    || selectedStore !== null
    || restaurant !== undefined;
  const savedRestaurantId = lockedStore
    ? String(lockedStore.storeId)
    : selected;
  const restaurantName = lockedStore?.name
    ?? selectedStore?.name
    ?? (restaurant ? localizeMenuText(restaurant.name, language) : null);
  const items = getProfileCommunicationItems(profile);
  const validFeedback = Object.fromEntries(
    Object.entries(feedback).filter(([id]) =>
      items.some((item) => item.id === id),
    ),
  );

  const selectServerStore = (store: StoreCandidate | null) => {
    setSelectedStore(store ? {
      storeId: store.storeId,
      name: store.branchName ? `${store.name} ${store.branchName}` : store.name,
      matchMethod: store.matchMethod,
    } : null);
    setFeedback({});
    setSaveError(null);
    setPicker(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      if (isServerRecord && sourceScanId) {
        const record = await saveScanRecord(sourceScanId, {
          ...(!lockedStore && selectedStore ? {
            storeId: selectedStore.storeId,
            storeMatchMethod: selectedStore.matchMethod,
          } : {}),
          feedback: hasRestaurant ? validFeedback : {},
        });
        setDone(true);
        onSaved(record);
        return;
      }

      saveVisit({
        id: recordId,
        sourceScanId,
        restaurantId: savedRestaurantId,
        title: existing && existing.restaurantId === savedRestaurantId
          ? existing.title
          : restaurantName
            ? restaurantName
            : t('나의 메뉴 스캔', 'My menu scan', 'مسح قائمتي'),
        date: existing?.date ?? new Date().toISOString(),
        menuCount: menus.length,
        dangerCount: menus.filter((m) => m.riskLevel === 'danger').length,
        menus,
        profileSnapshot: profile,
        feedback: hasRestaurant ? validFeedback : {},
      });
      if (!lockedStore) writeDemo('selected-restaurant', selected);
      setDone(true);
      onSaved();
    } catch (error) {
      console.error('Unable to save scan record:', error);
      setSaveError(t(
        '기록을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.',
        'Could not save this scan. Please try again shortly.',
        'تعذر حفظ هذا المسح. يرجى المحاولة بعد قليل.',
      ));
    } finally {
      setIsSaving(false);
    }
  };

  if (picker)
    return (
      <RestaurantPicker
        language={language}
        demoMode={!isServerRecord}
        selectedId={selected}
        selectedStoreId={selectedStore?.storeId}
        onClose={() => setPicker(false)}
        onSelectDemo={(r) => {
          setSelected(r?.id ?? null);
          setFeedback({});
          setPicker(false);
        }}
        onSelectStore={selectServerStore}
      />
    );
  return (
    <BottomSheet
      language={language}
      title={
        done
          ? t(
              '오늘의 한 끼를 기록했어요',
              'A meal to remember',
              'تم حفظ وجبتك اليوم',
            )
          : t('오늘의 메뉴 기록하기', 'Keep today’s menu', 'احفظ قائمة اليوم')
      }
      description={
        done
          ? t(
              '스캔 기록에서 언제든 다시 볼 수 있어요.',
              'Find it again in your scan journal, anytime.',
              'يمكنك العودة إليه في سجل المسح في أي وقت.',
            )
          : t(
              '식당을 연결하거나, 메뉴만 간단히 저장하세요.',
              'Link a restaurant or simply save the menu.',
              'اربط مطعماً أو احفظ القائمة فقط.',
            )
      }
      onClose={onClose}
    >
      {done ? (
        <div className="text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
            <Check className="size-8" />
          </div>
          <button
            onClick={() => navigate('/history')}
            className="min-h-12 w-full rounded-xl bg-brand-primary font-bold text-white"
          >
            {t('스캔 기록 보기', 'Open scan journal', 'افتح سجل المسح')}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setPicker(true)}
            disabled={lockedStore !== null}
            className="mb-4 flex min-h-20 w-full items-center gap-3 rounded-2xl border border-border-warm p-4 text-start"
          >
            <MapPin className="size-5 shrink-0 text-brand-primary" />
            <span className="flex-1">
              <span className="block text-sm font-bold">
                {restaurantName
                  ? restaurantName
                  : t(
                      '식당 연결하기 · 선택',
                      'Add a restaurant · optional',
                      'أضف مطعماً · اختياري',
                    )}
              </span>
              <span className="mt-1 block text-xs text-text-secondary">
                {lockedStore
                  ? t(
                      '스캔할 때 선택한 식당',
                      'Restaurant selected for this scan',
                      'المطعم المحدد لهذا المسح',
                    )
                : selectedStore
                  ? t(
                      '분석 후 연결한 식당',
                      'Restaurant linked after the scan',
                      'مطعم تم ربطه بعد المسح',
                    )
                  : restaurant
                    ? restaurant.name.ko
                  : t(
                      '연결하지 않아도 기록이 저장돼요',
                      'Your scan is saved even without a restaurant',
                      'يُحفظ المسح حتى بدون مطعم',
                    )}
              </span>
            </span>
            {!lockedStore && (
              <ChevronRight className="size-4 rtl:rotate-180" />
            )}
          </button>
          {!lockedStore && (selectedStore || restaurant) && (
            <button
              onClick={() => {
                setSelected(null);
                setSelectedStore(null);
                setFeedback({});
                setSaveError(null);
              }}
              className="mb-4 min-h-11 text-xs font-semibold text-text-secondary underline"
            >
              {t('식당 연결 해제', 'Remove restaurant', 'إزالة المطعم')}
            </button>
          )}
          {hasRestaurant && items.length > 0 && (
            <section className="mb-5">
              <h3 className="text-sm font-extrabold">
                {t(
                  '내 식단을 전달하기 편했나요?',
                  'Was it easy to share your needs?',
                  'هل كان توضيح احتياجاتك سهلاً؟',
                )}
              </h3>
              <p className="mb-3 mt-1 text-xs leading-5 text-text-secondary">
                {t(
                  '직접 경험한 항목만 알려주세요. 나중에 남겨도 괜찮아요.',
                  'Share only what you experienced. You can also skip this.',
                  'شارك ما جربته فقط. يمكنك تخطي هذه الخطوة.',
                )}
              </p>
              {items.map((item) => (
                <fieldset
                  key={item.id}
                  className="mb-3 rounded-xl bg-surface-subtle p-3"
                >
                  <legend className="px-1 text-xs font-bold">
                    {localizeMenuText(item.label, language)}
                  </legend>
                  <div className="flex gap-1.5">
                    {(
                      [
                        ['yes', t('편했어요', 'Easy', 'سهل')],
                        ['no', t('어려웠어요', 'Difficult', 'صعب')],
                        [
                          'unknown',
                          t('잘 모르겠어요', 'Not sure', 'لست متأكداً'),
                        ],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border px-1 text-center text-xs font-semibold ${feedback[item.id] === value ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-warm bg-rice-white'}`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          name={item.id}
                          checked={feedback[item.id] === value}
                          onChange={() =>
                            setFeedback((current) => ({
                              ...current,
                              [item.id]: value,
                            }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </section>
          )}
          {saveError && (
            <p role="alert" className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {saveError}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="min-h-12 w-full rounded-xl bg-brand-primary text-sm font-extrabold text-white disabled:cursor-wait disabled:opacity-60"
          >
            {isSaving
              ? t('저장하고 있어요…', 'Saving…', 'جارٍ الحفظ…')
              : t('기록 저장하기', 'Save to my journal', 'احفظ في سجلي')}
          </button>
        </>
      )}
    </BottomSheet>
  );
}
