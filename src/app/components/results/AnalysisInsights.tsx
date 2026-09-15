import { ArrowDown, ChefHat, CircleHelp, ClipboardCheck, GitBranch, Leaf, ScanLine, ShieldQuestion, Utensils } from 'lucide-react';
import type { Language, MenuAnalysis, UserProfile } from '../../App';
import { createTranslator } from '../../locales';
import { buildMenuResultViewModel, CONFIDENCE_LABELS, getCautionProbabilities, localizeMenuText } from '../../results/resultViewModel';

export function CautionInsight({ menu, profile, language }: { menu: MenuAnalysis; profile: UserProfile | null; language: Language }) {
  const t = createTranslator(language);
  const evidence = getCautionProbabilities(menu, profile);
  const vm = buildMenuResultViewModel(menu, language);
  return <section className="overflow-hidden rounded-2xl border border-status-caution-border bg-status-caution-surface" aria-label={t('주의 판정 요약', 'Caution at a glance', 'ملخص التنبيه')}>
    <div className="flex items-center gap-2 border-b border-status-caution-border/60 px-4 py-3 text-status-caution-text"><ShieldQuestion className="size-5" /><h4 className="text-sm font-extrabold">{t('확인하고 선택해요', 'Check before choosing', 'تحقق قبل الاختيار')}</h4><span className="ms-auto text-[10px] font-semibold">{t('재료 확인 필요', 'Ingredients to verify', 'تحقق من المكونات')}</span></div>
    {vm.primaryReason && <p className="px-4 pt-3 text-sm font-semibold leading-6 text-text-primary">{vm.primaryReason}</p>}
    {evidence.length > 0 ? <div className="grid grid-cols-1 gap-2 p-3 min-[380px]:grid-cols-2">{evidence.map((ingredient, index) => <div key={index} className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/80 p-3">
      <div className="relative size-14 shrink-0" role="img" aria-label={`${localizeMenuText(ingredient.name, language)} ${ingredient.inclusionProbability}%`}>
        <svg viewBox="0 0 64 64" className="size-full -rotate-90" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-status-caution-border, #e9d8ad)" strokeWidth="5" /><circle cx="32" cy="32" r="27" fill="none" stroke="var(--color-status-caution, #b97b20)" strokeWidth="5" pathLength="100" strokeDasharray={`${ingredient.inclusionProbability} 100`} strokeLinecap="round" /></svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold tabular-nums text-status-caution-text">{ingredient.inclusionProbability}<small className="text-[9px]">%</small></span>
      </div><div className="min-w-0"><p className="break-words text-xs font-extrabold text-text-primary">{localizeMenuText(ingredient.name, language)}</p><p className="mt-1 text-[10px] leading-4 text-status-caution-text">{t('포함 가능성', 'May be included', 'احتمال وجوده')}</p></div>
    </div>)}</div> : <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-white/60 p-3 text-xs text-status-caution-text"><CircleHelp className="size-4 shrink-0" />{t('수치로 확인된 정보가 없어 확률은 표시하지 않아요.', 'No reliable numeric estimate is available.', 'لا يتوفر تقدير رقمي موثوق.')}</div>}
    <p className="px-4 pb-3 pt-2 text-[10px] leading-4 text-status-caution-text">{menu.demoScenario ? t('시연용 고정 추정치 · 실제 분석값이 아니에요.', 'Fixed demo estimates · not real analysis.', 'تقديرات تجريبية ثابتة وليست تحليلاً فعلياً.') : t('재료 포함 추정치이며 직원 확인이 필요해요.', 'Ingredient estimates require staff confirmation.', 'تحتاج تقديرات المكونات إلى تأكيد الموظف.')} {t('섭취 안전 확률이 아니에요.', 'Not a probability of safe consumption.', 'ليست احتمال سلامة الاستهلاك.')}</p>
  </section>;
}

export function AnalysisEvidence({ menu, language }: { menu: MenuAnalysis; language: Language }) {
  const t = createTranslator(language);
  const vm = buildMenuResultViewModel(menu, language);
  const kinds = {
    menu: { icon: ScanLine, label: t('메뉴 읽기', 'Menu reading', 'قراءة القائمة') },
    recipe: { icon: ChefHat, label: t('조리법 검토', 'Recipe review', 'مراجعة الوصفة') },
    profile: { icon: Leaf, label: t('내 기준 대조', 'Profile match', 'مطابقة ملفي') },
    'cross-contact': { icon: Utensils, label: t('조리 환경', 'Kitchen checks', 'بيئة التحضير') },
  };
  return <div className="space-y-5 py-4" data-analysis-evidence="">
    <div><p className="eyebrow text-brand-primary">BEHIND THE RESULT</p><h4 className="mt-1 text-base font-extrabold">{t('근거를 한눈에', 'Evidence, made clear', 'الأدلة بوضوح')}</h4><p className="mt-1 text-xs text-text-secondary">{t('확인된 사실과 아직 모르는 것을 구분했어요.', 'Facts, inferences and open questions—kept separate.', 'نميّز بين الحقائق والاستنتاجات وما يحتاج للتحقق.')}</p></div>
    {!!menu.explainability?.checks?.length && <div className="grid grid-cols-2 gap-2">{menu.explainability.checks.map((check, index) => {
      const kind = kinds[check.kind]; const Icon = kind.icon;
      const state = check.status === 'observed' ? t('표기 확인', 'Observed', 'ظاهر') : check.status === 'inferred' ? t('추정', 'Inferred', 'استنتاج') : t('미확인', 'Unverified', 'غير متحقق');
      return <div key={index} className="rounded-2xl border border-border-warm bg-surface-raised p-3"><div className="mb-3 flex items-center justify-between gap-1"><span className="flex size-8 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary"><Icon className="size-4" /></span><span className="text-[10px] font-semibold text-text-tertiary">{state}</span></div><p className="text-xs font-extrabold">{kind.label}</p><p className="mt-1.5 text-xs leading-5 text-text-secondary">{localizeMenuText(check.finding, language)}</p></div>;
    })}</div>}
    {vm.ingredients.length > 0 && <div className="rounded-2xl border border-border-warm bg-surface-raised p-3"><h5 className="mb-3 flex items-center gap-2 text-xs font-extrabold"><Leaf className="size-4 text-brand-primary" />{t('재료별 근거', 'Ingredient evidence', 'أدلة المكونات')}</h5><div className="space-y-3">{vm.ingredients.map((ingredient, index) => <div key={index} className="border-t border-border-warm pt-3 first:border-0 first:pt-0"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-bold">{ingredient.localizedName}</span>{ingredient.confidence && <span className="rounded-full bg-surface-subtle px-2 py-1 text-[10px] text-text-secondary">{t('근거', 'Evidence', 'الدليل')} · {localizeMenuText(CONFIDENCE_LABELS[ingredient.confidence], language)}</span>}</div>{ingredient.localizedSources.length > 0 && <p className="mt-1 text-[11px] text-text-tertiary">{ingredient.localizedSources.join(' · ')}</p>}{ingredient.sourcesConflict && <p className="mt-1 text-xs text-status-caution-text">{t('출처가 달라 직원 확인이 필요해요.', 'Sources disagree; ask staff.', 'المصادر متعارضة؛ اسأل الموظف.')}</p>}</div>)}</div></div>}
    {vm.profileRelatedItems.length > 0 && <div className="flex flex-wrap gap-2">{vm.profileRelatedItems.map(item => <span key={item} className="rounded-full bg-brand-primary-soft px-3 py-1 text-xs font-bold text-brand-primary">{item}</span>)}</div>}
    {vm.ingredients.filter(i => i.staffEvidence).map((i, index) => <div key={index} className="rounded-xl border border-border-warm bg-surface-raised p-3 text-xs"><p className="font-bold">{i.localizedName} · {t('직원 확인 기록', 'Staff records', 'سجلات الموظفين')}</p>{i.staffEvidence?.usedCount !== undefined && i.staffEvidence?.checkedCount !== undefined && <p className="mt-1">{t(`확인 ${i.staffEvidence.checkedCount}건 중 사용 ${i.staffEvidence.usedCount}건`, `Used in ${i.staffEvidence.usedCount} of ${i.staffEvidence.checkedCount} records`, `استُخدم في ${i.staffEvidence.usedCount} من ${i.staffEvidence.checkedCount} سجلاً`)}</p>}{i.staffEvidence?.sampleSufficient === false && <p className="mt-1 text-status-caution-text">{t('아직 확인 기록이 충분하지 않아요.', 'Confirmation records are still limited.', 'سجلات التأكيد لا تزال محدودة.')}</p>}</div>)}
    {vm.hiddenIngredientPaths.length > 0 && <section><h5 className="mb-3 flex items-center gap-2 text-xs font-extrabold"><GitBranch className="size-4 text-brand-primary" />{t('주의 재료가 숨어 있는 곳', 'Where ingredients may hide', 'أين قد تختبئ المكونات')}</h5><div className="space-y-3">{vm.hiddenIngredientPaths.map((path, index) => <div key={index} className="flex flex-col items-center rounded-2xl bg-brand-primary-soft/50 p-3">{path.map((item, i) => <FragmentNode key={i} item={item} last={i === path.length - 1} />)}</div>)}</div></section>}
    {vm.uncertainties.length > 0 && <section className="rounded-2xl border border-status-caution-border bg-status-caution-surface p-3.5"><h5 className="mb-3 flex items-center gap-2 text-xs font-extrabold text-status-caution-text"><ClipboardCheck className="size-4" />{t('주문 전, 이것만 확인해요', 'Before ordering, check these', 'تحقق من هذه قبل الطلب')}</h5><ul className="space-y-3">{vm.uncertainties.map((item, index) => <li key={index} className="flex items-start gap-2 text-xs leading-5"><CircleHelp className="mt-0.5 size-4 shrink-0 text-status-caution-text" /><span>{item}</span></li>)}</ul></section>}
    {!vm.ingredients.length && !menu.explainability?.checks?.length && <p className="text-xs text-text-tertiary">{t('상세 근거가 아직 제공되지 않았어요.', 'Detailed evidence has not been supplied.', 'لم يتم توفير أدلة تفصيلية بعد.')}</p>}
    {menu.imageCredit && <a href={menu.imageCredit.url} target="_blank" rel="noreferrer" className="block text-[10px] text-text-tertiary underline">{t('참고 사진', 'Reference photo', 'صورة مرجعية')}: {menu.imageCredit.author} · {menu.imageCredit.license} · {t('화면에 맞춰 크롭', 'Cropped to fit', 'مقتصة للعرض')}</a>}
  </div>;
}

function FragmentNode({ item, last }: { item: string; last: boolean }) {
  return <><span className={`w-full rounded-xl border px-3 py-2 text-center text-xs font-bold ${last ? 'border-brand-primary/20 bg-brand-primary text-white' : 'border-border-warm bg-surface-raised text-text-primary'}`}>{item}</span>{!last && <ArrowDown className="my-1 size-4 text-brand-primary/60" aria-hidden="true" />}</>;
}
