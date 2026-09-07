import { useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { getScanResult, mapMenuResult, normalizeScanStatus, startScan } from '../../api/scan';
import type { Language, MenuAnalysis, PendingMenuImage } from '../App';
import { createTranslator } from '../locales';

interface AnalyzingScreenProps {
  language: Language;
  image: PendingMenuImage | null;
  onComplete: (scanId: string, menus: MenuAnalysis[]) => void;
  onCancel: () => void;
}

type Phase = 'analyzing' | 'retake' | 'failed';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_MS = 300000;

export function AnalyzingScreen({ language, image, onComplete, onCancel }: AnalyzingScreenProps) {
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const t = createTranslator(language);

  const steps = [
    t('메뉴판 이미지를 읽고 있어요', 'Scanning menu image', 'جار قراءة صورة القائمة'),
    t('메뉴를 찾고 있어요', 'Finding menus', 'جار البحث عن الأطباق'),
    t('식단 정보를 확인하고 있어요', 'Checking diet info', 'جار التحقق من معلومات النظام الغذائي'),
    t('알레르기와 식단 조건을 비교하고 있어요', 'Comparing allergies and diet conditions', 'جار مقارنة الحساسية وشروط النظام الغذائي'),
  ];

  // 로딩 단계 애니메이션 (분석 중일 때만)
  useEffect(() => {
    if (phase !== 'analyzing') return;
    const timer = setInterval(() => {
      setStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, 1500);
    return () => clearInterval(timer);
  }, [phase, steps.length]);

  useEffect(() => {
    if (!image) return;

    let cancelled = false;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      setPhase('analyzing');
      setErrorMessage(null);
      setStep(0);

      if (!image.storage?.key) {
        setErrorMessage(t(
          '이미지 저장 키를 찾을 수 없습니다. 다시 시도해 주세요.',
          'Image storage key is missing. Please try again.',
          'لا يمكن العثور على مفتاح تخزين الصورة. يرجى المحاولة مرة أخرى.',
        ));
        setPhase('failed');
        return;
      }

      try {
        const { scanId } = await startScan({ storageKey: image.storage.key, source: image.source });
        const deadline = Date.now() + MAX_POLL_MS;

        while (!cancelled) {
          const result = await getScanResult(scanId);
          if (cancelled) return;

          const status = normalizeScanStatus(result.status);

          if (status === 'completed') {
            onComplete(scanId, (result.menus ?? []).map(mapMenuResult));
            return;
          }
          if (status === 'needs_retake') {
            setPhase('retake');
            return;
          }
          if (status === 'failed') {
            setErrorMessage(t(
              '스캔에 실패했습니다. 다시 시도해 주세요.',
              'Scan failed. Please try again.',
              'فشل المسح. يرجى المحاولة مرة أخرى.',
            ));
            setPhase('failed');
            return;
          }
          if (status === 'unknown') {
            console.warn('Unknown scan status:', result.status, result);
          }
          if (Date.now() >= deadline) {
            setErrorMessage(t(
              '분석이 지연되고 있어요. 잠시 후 다시 시도해 주세요.',
              'Analysis is taking longer than expected. Please try again later.',
              'يستغرق التحليل وقتًا أطول من المتوقع. يرجى المحاولة لاحقًا.',
            ));
            setPhase('failed');
            return;
          }
          await delay(POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : t('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.', 'An unknown error occurred. Please try again.', 'حدث خطأ غير معروف. يرجى المحاولة مرة أخرى.'),
        );
        setPhase('failed');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, attempt]);

  // 재촬영 안내 (needs_retake)
  if (phase === 'retake') {
    return (
      <div className="h-dvh flex flex-col bg-rice-cream">
        <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center justify-center px-5 relative flex-shrink-0">
          <h1 className="text-base font-bold text-soy-ink">{t('다시 촬영이 필요해요', 'Retake needed', 'يلزم إعادة التصوير')}</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="size-20 rounded-[1.75rem] bg-brand-orange-100 flex items-center justify-center mb-6 shadow-sm">
            <Camera className="size-8 text-brand-orange-500" />
          </div>
          <p className="max-w-xs text-lg font-bold leading-relaxed text-soy-ink">
            {t('가이드라인에 맞춰 촬영해주세요', 'Please take the photo following the guideline.', 'يرجى التقاط الصورة وفقًا للإرشادات.')}
          </p>
        </div>
        <div className="border-t border-border-warm bg-rice-white/95 px-5 py-4 flex-shrink-0">
          <button
            onClick={onCancel}
            className="w-full h-14 bg-brand-green-700 text-white rounded-2xl font-bold shadow-sm hover:bg-brand-green-900 transition-colors"
          >
            {t('다시 촬영', 'Retake', 'إعادة التصوير')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-rice-cream">
      <div className="h-16 border-b border-border-warm bg-rice-white/95 flex items-center justify-center px-5 relative flex-shrink-0">
        <h1 className="text-base font-bold text-soy-ink">{t('메뉴판 분석 중', 'Analyzing menu', 'جار تحليل القائمة')}</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5 py-7">
        <div className="relative w-full max-w-xs aspect-[4/3] bg-rice-white rounded-[1.75rem] mb-8 overflow-hidden border border-border-warm shadow-[0_14px_38px_rgba(23,107,77,0.12)]">
          {image ? (
            <img src={image.previewUrl} alt={t('분석 중인 메뉴판', 'Menu being analyzed', 'القائمة قيد التحليل')} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sesame-gray">
              <span className="text-6xl">📋</span>
            </div>
          )}
          {phase === 'analyzing' && (
            <div className="animate-scan-line pointer-events-none absolute inset-x-5 top-[12%] h-0.5 rounded-full bg-brand-orange-500 shadow-[0_0_14px_rgba(244,119,59,0.8)]" aria-hidden="true" />
          )}
        </div>

        <div className="w-full max-w-xs">
          {phase === 'analyzing' ? (
            <>
              <div className="mb-6">
                <Loader2 className="size-10 text-brand-green-700 animate-spin mx-auto mb-4" />
                <p className="min-h-12 text-center text-base font-bold leading-relaxed text-soy-ink">{steps[step]}</p>
              </div>
              <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all ${
                      i <= step ? 'w-8 bg-brand-green-700' : 'w-1 bg-border-warm'
                    }`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700 text-center">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border-warm bg-rice-white/95 px-5 py-4 flex-shrink-0 space-y-2">
        {phase === 'failed' && (
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="w-full h-14 bg-brand-green-700 text-white rounded-2xl font-bold shadow-sm hover:bg-brand-green-900 transition-colors"
          >
            {t('다시 시도', 'Retry', 'إعادة المحاولة')}
          </button>
        )}
        <button
          onClick={onCancel}
          className="w-full h-12 text-sm font-semibold text-sesame-gray hover:text-soy-ink transition-colors"
        >
          {t('취소', 'Cancel', 'إلغاء')}
        </button>
      </div>
    </div>
  );
}
