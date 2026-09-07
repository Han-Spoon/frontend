import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, OctagonX } from 'lucide-react';
import type { EvidenceConfidence, MenuAnalysis } from '../../App';
import { CONFIDENCE_LABELS, localizeMenuText } from '../../results/resultViewModel';
import type { Language } from '../../locales';

export type ResultTranslator = (ko: string, en: string, ar: string) => string;

const statusClasses: Record<MenuAnalysis['riskLevel'], string> = {
  safe: 'border-status-safe-border bg-status-safe-surface text-status-safe-text',
  caution: 'border-status-caution-border bg-status-caution-surface text-status-caution-text',
  danger: 'border-status-danger-border bg-status-danger-surface text-status-danger-text',
};

const statusIcons = {
  safe: CheckCircle2,
  caution: AlertTriangle,
  danger: OctagonX,
};

export function RiskBadge({ level, t }: { level: MenuAnalysis['riskLevel']; t: ResultTranslator }) {
  const Icon = statusIcons[level];
  const label = level === 'safe'
    ? t('안전', 'Safe', 'آمن')
    : level === 'caution'
      ? t('주의', 'Caution', 'تنبيه')
      : t('위험', 'Danger', 'خطر');

  return (
    <span className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${statusClasses[level]}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export function StatusGuidance({ level, t }: { level: MenuAnalysis['riskLevel']; t: ResultTranslator }) {
  const Icon = statusIcons[level];
  const guidance = level === 'safe'
    ? t(
      '현재 확인된 정보로는 안심하고 선택해도 좋아요',
      'Based on the information available, you can choose this with confidence.',
      'وفقًا للمعلومات المتاحة، يمكنك اختيار هذا الطبق باطمئنان.',
    )
    : level === 'caution'
      ? t(
        '재료나 조리법을 한 번 더 확인해 주세요',
        'Please check the ingredients or cooking method once more.',
        'يرجى التحقق من المكونات أو طريقة التحضير مرة أخرى.',
      )
      : t(
        '식이 기준과 맞지 않아 피하는 게 좋아요',
        'This does not fit your dietary needs, so it is best to avoid it.',
        'هذا لا يناسب احتياجاتك الغذائية، لذا يُفضّل تجنبه.',
      );

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3 py-3 ${statusClasses[level]}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="text-sm font-semibold leading-5">{guidance}</p>
    </div>
  );
}

export function EvidenceSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border-warm py-4 first:border-t-0 first:pt-0">
      <h4 className="mb-2.5 flex items-center gap-2 text-sm font-extrabold text-text-primary">
        {icon}
        {title}
      </h4>
      {children}
    </section>
  );
}

export function ConfidenceBadge({
  confidence,
  language,
}: {
  confidence: EvidenceConfidence;
  language: Language;
}) {
  return (
    <span className="inline-flex rounded-md bg-surface-interactive px-2 py-1 text-[11px] font-bold text-text-secondary">
      {localizeMenuText(CONFIDENCE_LABELS[confidence], language)}
    </span>
  );
}

export function ResultCount({
  level,
  count,
  label,
}: {
  level: MenuAnalysis['riskLevel'];
  count: number;
  label: string;
}) {
  const Icon = statusIcons[level];
  const iconClass = level === 'safe'
    ? 'text-status-safe'
    : level === 'caution'
      ? 'text-status-caution'
      : 'text-status-danger';

  return (
    <div className="min-w-0 flex-1 rounded-xl border border-border-warm bg-surface-raised px-3 py-3 shadow-[var(--shadow-card)]">
      <div className="mb-1 flex items-center gap-1.5">
        <Icon className={`size-4 shrink-0 ${iconClass}`} aria-hidden="true" />
        <span className="truncate text-xs font-semibold text-text-secondary">{label}</span>
      </div>
      <strong className="text-xl font-extrabold tabular-nums text-text-primary">{count}</strong>
    </div>
  );
}
