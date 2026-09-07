import { useState, useEffect } from 'react';
import { Camera, ChevronDown, CircleDashed, Database, Loader2, ScanText, Search, ShieldCheck, Users } from 'lucide-react';
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
  const [phase, setPhase] = useState<Phase>('analyzing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const t = createTranslator(language);

  const steps = [
    { icon: ScanText, label: t('메뉴 이름과 설명을 읽고 있어요', 'Reading menu names and descriptions', 'جار قراءة أسماء الأطباق وأوصافها') },
    { icon: Search, label: t('조리법과 재료 정보를 찾고 있어요', 'Finding cooking and ingredient information', 'جار البحث عن معلومات الطهي والمكونات') },
    { icon: Database, label: t('육수와 소스 속 숨은 재료도 확인하고 있어요', 'Checking hidden ingredients in broths and sauces', 'جار التحقق من المكونات المخفية في المرق والصلصات') },
    { icon: ShieldCheck, label: t('내 식단 기준과 비교하고 있어요', 'Comparing with your dietary profile', 'جار المقارنة مع ملفك الغذائي') },
  ];

  useEffect(() => {
    if (!image) return;

    let cancelled = false;
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      setPhase('analyzing');
      setErrorMessage(null);

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
      <div className="flex h-dvh flex-col bg-surface-base">
        <div className="relative flex h-16 flex-shrink-0 items-center justify-center border-b border-border-warm bg-surface-raised/95 px-5">
          <h1 className="text-base font-bold text-soy-ink">{t('다시 촬영이 필요해요', 'Retake needed', 'يلزم إعادة التصوير')}</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-border-warm bg-surface-raised shadow-[var(--shadow-card)]">
            <Camera className="size-7 text-brand-accent" />
          </div>
          <p className="max-w-xs text-lg font-bold leading-relaxed text-soy-ink">
            {t('가이드라인에 맞춰 촬영해주세요', 'Please take the photo following the guideline.', 'يرجى التقاط الصورة وفقًا للإرشادات.')}
          </p>
        </div>
        <div className="border-t border-border-warm bg-rice-white/95 px-5 py-4 flex-shrink-0">
          <button
            onClick={onCancel}
            className="min-h-12 w-full rounded-xl bg-brand-primary font-bold text-white shadow-sm hover:bg-brand-primary-hover"
          >
            {t('다시 촬영', 'Retake', 'إعادة التصوير')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-surface-base">
      <div className="relative flex h-16 flex-shrink-0 items-center justify-center border-b border-border-warm bg-surface-raised/95 px-5">
        <h1 className="text-base font-bold text-soy-ink">{t('메뉴판 분석 중', 'Analyzing menu', 'جار تحليل القائمة')}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="relative mx-auto mb-5 aspect-[16/9] w-full max-w-xs overflow-hidden rounded-[var(--radius-card)] border border-border-warm bg-surface-raised shadow-[var(--shadow-card)]">
          {image ? (
            <img src={image.previewUrl} alt={t('분석 중인 메뉴판', 'Menu being analyzed', 'القائمة قيد التحليل')} className="w-full h-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-text-secondary">
              <span className="text-6xl">📋</span>
            </div>
          )}
          {phase === 'analyzing' && (
            <div className="animate-scan-line pointer-events-none absolute inset-x-5 top-[12%] h-0.5 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(23,100,73,0.35)]" aria-hidden="true" />
          )}
        </div>

        <div className="mx-auto w-full max-w-sm">
          {phase === 'analyzing' ? (
            <>
              <div className="mb-4 text-center">
                <Loader2 className="mx-auto mb-3 size-7 animate-spin text-brand-primary" />
                <p className="text-base font-extrabold text-text-primary">{t('필요한 정보를 차근차근 확인하고 있어요', 'We are carefully checking the information', 'نتحقق من المعلومات بعناية')}</p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">{t('실제 완료 시점은 분석 결과가 준비되면 알려드려요.', 'We will let you know when the actual analysis is ready.', 'سنخبرك عندما يصبح التحليل الفعلي جاهزًا.')}</p>
              </div>
              <ol className="space-y-2 rounded-[var(--radius-card)] border border-border-warm bg-surface-raised p-3 shadow-[var(--shadow-card)]">
                {steps.map(({ icon: Icon, label }, index) => (
                  <li key={label} className="flex min-h-11 items-center gap-3 rounded-xl px-2 py-2">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-brand-primary"><Icon className="size-4" aria-hidden="true" /></span>
                    <span className="min-w-0 flex-1 text-sm font-semibold leading-5 text-text-primary">{label}</span>
                    <span className="text-xs font-bold tabular-nums text-text-tertiary">{index + 1}</span>
                  </li>
                ))}
              </ol>

              <button onClick={() => setShowDetails((current) => !current)} aria-expanded={showDetails} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-xl border border-border-warm bg-surface-raised px-3.5 text-sm font-bold text-text-secondary hover:bg-surface-subtle">
                <span>{t('분석 과정 자세히 보기', 'See how analysis works', 'عرض تفاصيل عملية التحليل')}</span>
                <ChevronDown className={`size-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              </button>
              {showDetails && (
                <div className="mt-2 rounded-xl border border-border-warm bg-surface-subtle p-4 text-xs leading-5 text-text-secondary">
                  <div className="mb-2 flex items-center gap-2 font-extrabold text-text-primary"><CircleDashed className="size-4 text-brand-primary" />{t('기술을 쉬운 말로 설명해요', 'The technology, in plain language', 'شرح التقنية بلغة بسيطة')}</div>
                  <p>{t('OCR로 글자를 읽고 메뉴판 문맥을 살핀 뒤, 조리 정보와 검색 근거를 모아 육수·소스의 구성 재료까지 확인해요. 마지막으로 기존 직원 응답 기록과 내 식단 프로필을 비교해 결과를 정리합니다.', 'We read text with OCR, use menu context and cooking references, inspect compound ingredients such as broths and sauces, then organize the supplied result using staff records and your dietary profile.', 'نقرأ النص بتقنية OCR ونستخدم سياق القائمة ومراجع الطهي، ثم نفحص المكونات المركبة مثل المرق والصلصات وننظم النتيجة بالاستناد إلى سجلات الموظفين وملفك الغذائي.')}</p>
                  <p className="mt-2 flex gap-2"><Users className="mt-0.5 size-4 shrink-0" />{t('현재 백엔드는 세부 단계별 진행 상태를 제공하지 않아 가짜 퍼센트는 표시하지 않아요.', 'The backend does not provide live stage progress, so no artificial percentage is shown.', 'لا توفر الواجهة الخلفية تقدّمًا مباشرًا للمراحل، لذلك لا نعرض نسبة مئوية مصطنعة.')}</p>
                  {/* TODO: 백엔드가 실제 단계 상태를 제공하면 각 항목의 완료/진행 상태와 연결한다. */}
                </div>
              )}
            </>
          ) : (
            <div className="mb-6 rounded-xl border border-status-danger-border bg-status-danger-surface p-4">
              <p className="text-center text-sm text-status-danger-text">{errorMessage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 space-y-2 border-t border-border-warm bg-surface-raised/95 px-5 py-3">
        {phase === 'failed' && (
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="min-h-12 w-full rounded-xl bg-brand-primary font-bold text-white shadow-sm hover:bg-brand-primary-hover"
          >
            {t('다시 시도', 'Retry', 'إعادة المحاولة')}
          </button>
        )}
        <button
          onClick={onCancel}
          className="min-h-11 w-full text-sm font-semibold text-text-secondary hover:text-text-primary"
        >
          {t('취소', 'Cancel', 'إلغاء')}
        </button>
      </div>
    </div>
  );
}
