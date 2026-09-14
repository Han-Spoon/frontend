import { useState } from 'react';
import { ArrowUpRight, MapPin, Users } from 'lucide-react';
import type { Language, UserProfile } from '../../App';
import { AREAS, RESTAURANTS, type Restaurant } from '../../demo/restaurants';
import { createTranslator } from '../../locales';
import { getProfileCommunicationItems, localizeMenuText } from '../../results/resultViewModel';
import { menuPrice } from '../../demo/currency';
import { PartnershipBadge } from './PartnershipBadge';

const groups = [
  { id: 'vegan', label: { ko: '채식 유형', en: 'Vegetarian styles', ar: 'أنواع النباتية' } },
  { id: 'allergy', label: { ko: '알레르기', en: 'Allergies', ar: 'الحساسية' } },
  { id: 'religion', label: { ko: '종교 기준', en: 'Religious needs', ar: 'المتطلبات الدينية' } },
] as const;
const options = [
  { id: 'vegan:vegan', ko: '비건', en: 'Vegan', ar: 'نباتي صرف' },
  { id: 'vegan:lacto_ovo', ko: '락토·오보', en: 'Lacto-ovo', ar: 'نباتي مع البيض والحليب' },
  { id: 'vegan:pesco', ko: '페스코', en: 'Pescatarian', ar: 'نباتي مع الأسماك' },
  { id: 'allergy:milk', ko: '우유', en: 'Milk', ar: 'الحليب' },
  { id: 'allergy:egg', ko: '달걀', en: 'Egg', ar: 'البيض' },
  { id: 'allergy:peanut', ko: '땅콩', en: 'Peanut', ar: 'الفول السوداني' },
  { id: 'religion:halal', ko: '할랄', en: 'Halal', ar: 'حلال' },
  { id: 'religion:kosher', ko: '코셔', en: 'Kosher', ar: 'كوشير' },
  { id: 'religion:hindu', ko: '힌두교', en: 'Hindu', ar: 'هندوسي' },
];

export function CommunityRanking({ language, userProfile, onSelect }: {
  language: Language; userProfile: UserProfile | null; onSelect: (restaurant: Restaurant) => void;
}) {
  const t = createTranslator(language);
  const profileIds = getProfileCommunicationItems(userProfile).map(item => item.id);
  const initial = options.find(item => profileIds.includes(item.id)) ?? options[0];
  const [selection, setChoice] = useState<string | null>(null);
  const choice = selection ?? initial.id;
  const group = choice.split(':')[0];
  const option = options.find(item => item.id === choice)!;
  const rows = RESTAURANTS.flatMap(restaurant => {
    const feedback = restaurant.feedback.find(item => item.profileId === choice);
    return feedback && feedback.total > 0 ? [{ restaurant, ...feedback, ratio: feedback.positive / feedback.total }] : [];
  }).sort((a, b) => b.ratio - a.ratio || b.total - a.total || a.restaurant.id.localeCompare(b.restaurant.id)).slice(0, 5);

  return <section className="mt-10" aria-label={t('조건별 식당 랭킹', 'Restaurant rankings by need', 'ترتيب المطاعم حسب احتياجاتك')}>
    <p className="eyebrow">THE COMMUNITY PICKS</p>
    <h2 className="mt-1 text-[24px] font-extrabold tracking-tight">{t('나의 기준으로 찾는 맛집', 'Good food. Your way.', 'طعام يناسب معاييرك')}</h2>
    <p className="mt-2 text-sm leading-6 text-text-secondary">{t('같은 조건의 방문자들은 어디서 편하게 주문했을까요?', 'Where did diners with the same needs find ordering easier?', 'أين وجد الزوار باحتياجات مماثلة سهولة في الطلب؟')}</p>
    <div className="mt-5 grid grid-cols-3 gap-1 rounded-2xl bg-border-warm/50 p-1">
      {groups.map(item => <button key={item.id} aria-pressed={group === item.id} onClick={() => setChoice(options.find(o => o.id.startsWith(item.id))!.id)} className={`min-h-12 rounded-xl px-2 text-xs font-bold ${group === item.id ? 'bg-rice-white text-brand-primary shadow-sm' : 'text-text-secondary'}`}>{localizeMenuText(item.label, language)}</button>)}
    </div>
    <div className="my-4 flex flex-wrap gap-2">
      {options.filter(item => item.id.startsWith(group + ':')).map(item => <button key={item.id} onClick={() => setChoice(item.id)} aria-pressed={choice === item.id} className={`min-h-10 rounded-full border px-4 text-xs font-bold ${choice === item.id ? 'border-brand-primary bg-brand-primary text-white' : 'border-border-warm bg-rice-white'}`}>{localizeMenuText(item, language)}{profileIds.includes(item.id) && <span className="ms-1.5 opacity-75">✓</span>}</button>)}
    </div>
    <div className="mb-3 flex items-center justify-between text-xs"><span className="font-extrabold">{localizeMenuText(option, language)} · TOP {rows.length}</span><span className="text-text-secondary">{t('요청 전달이 편했어요', 'Easy to discuss needs', 'سهولة توضيح الاحتياجات')}</span></div>
    <div className="space-y-3">
      {rows.map(({ restaurant, positive, total, ratio }, index) => <button key={restaurant.id} onClick={() => onSelect(restaurant)} className="block w-full overflow-hidden rounded-[24px] border border-border-warm bg-rice-white text-start shadow-[var(--shadow-card)]">
        <div className="flex items-start gap-3 p-3.5">
          <div className="relative shrink-0"><img src={restaurant.image} alt="" loading="lazy" className="size-[88px] rounded-[18px] object-cover" /><span className={`absolute -start-1 -top-1 flex size-8 items-center justify-center rounded-full border-2 border-rice-white text-sm font-extrabold ${index === 0 ? 'bg-brand-accent text-white' : 'bg-soy-ink text-white'}`}>{index + 1}</span></div>
          <div className="min-w-0 flex-1"><PartnershipBadge restaurant={restaurant} language={language} compact /><h3 className="mt-1.5 truncate text-base font-extrabold">{localizeMenuText(restaurant.name, language)}</h3><p className="mt-1 flex items-center gap-1 text-[11px] text-text-secondary"><MapPin className="size-3" />{localizeMenuText(AREAS.find(a => a.id === restaurant.area)!, language)} · {menuPrice(String(restaurant.price), language)?.original}</p><p className="mt-1 text-[11px] text-text-secondary">{localizeMenuText(restaurant.category, language)}</p></div><ArrowUpRight className="mt-2 size-4 shrink-0 text-brand-primary rtl:-rotate-90" />
        </div>
        <div className="mx-3.5 mb-3.5 rounded-2xl bg-brand-primary-soft px-3 py-2.5"><div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-primary"><Users className="size-3.5" />{localizeMenuText(option, language)} · {positive}/{total} {t('후기', 'responses', 'إجابة')}</span><strong className="text-xl tracking-tight text-brand-primary">{Math.round(ratio * 100)}<span className="text-xs">%</span></strong></div><div aria-hidden="true" className="mt-2 h-1 overflow-hidden rounded-full bg-brand-primary/10"><div className="h-full rounded-full bg-brand-primary" style={{ width: `${ratio * 100}%` }} /></div></div>
      </button>)}
    </div>
    <p className="mt-3 text-[11px] leading-5 text-text-tertiary">{t('선택한 조건의 요청 전달 만족 비율순 · 비율이 같으면 후기 수순. 섭취 안전도나 종교 인증 순위가 아니에요.', 'Sorted by ease-of-communication feedback, then response count. This is not a safety score or religious certification.', 'مرتبة حسب سهولة التواصل ثم عدد الإجابات. ليست درجة سلامة أو شهادة دينية.')}</p>
  </section>;
}
