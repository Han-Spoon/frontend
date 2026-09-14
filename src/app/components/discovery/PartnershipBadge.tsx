import { BadgeCheck } from 'lucide-react';
import type { Language } from '../../App';
import type { Restaurant } from '../../demo/restaurants';
import { createTranslator } from '../../locales';

export function PartnershipBadge({
  restaurant,
  language,
  compact = false,
}: {
  restaurant: Restaurant;
  language: Language;
  compact?: boolean;
}) {
  const t = createTranslator(language);
  const verified = restaurant.partnership === 'recipe-verified';
  if (!verified) return null;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full font-extrabold ${
        compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-[11px]'
      } bg-brand-primary text-white`}
    >
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {t(
        '입점 및 전체 레시피 인증',
        'Partner · all recipes verified',
        'شريك · جميع الوصفات موثقة',
      )}
    </span>
  );
}
