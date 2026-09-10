import { MapPin, Navigation } from 'lucide-react';
import type { Language } from '../../App';
import { AREAS, type AreaId, type Restaurant } from '../../demo/restaurants';
import { localizeMenuText } from '../../results/resultViewModel';
import { createTranslator } from '../../locales';

// Schematic demo map. Pin positions derive from fixture coordinates; replace the renderer with a map SDK later.
export function AreaMap({
  area,
  restaurants,
  selectedId,
  onSelect,
  language,
}: {
  area: AreaId;
  restaurants: Restaurant[];
  selectedId: string;
  onSelect: (id: string) => void;
  language: Language;
}) {
  const t = createTranslator(language);
  const centerLat =
    restaurants.reduce((sum, r) => sum + r.lat, 0) /
    Math.max(restaurants.length, 1);
  const centerLng =
    restaurants.reduce((sum, r) => sum + r.lng, 0) /
    Math.max(restaurants.length, 1);
  return (
    <div
      className="relative h-[235px] overflow-hidden rounded-t-[24px] bg-[#e9eee5]"
      aria-label={t(
        '지역 식당 지도',
        'Area restaurant map',
        'خريطة مطاعم المنطقة',
      )}
    >
      <svg
        viewBox="0 0 400 235"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <rect width="400" height="235" fill="#e9eee5" />
        <path
          d="M-20 190 Q100 120 230 195 T440 190"
          fill="none"
          stroke="#c1dbe0"
          strokeWidth="38"
        />
        <path
          d="M-20 56 L430 120 M35 -20 L160 260 M280 -20 L215 260 M-20 155 L400 30"
          stroke="#fffdf9"
          strokeWidth="15"
          fill="none"
        />
        <path
          d="M-20 56 L430 120 M35 -20 L160 260 M280 -20 L215 260 M-20 155 L400 30"
          stroke="#deded2"
          strokeWidth="1"
          fill="none"
        />
        <rect x="292" y="134" width="59" height="37" rx="15" fill="#c9ddbc" />
        <rect x="40" y="84" width="36" height="40" rx="12" fill="#c9ddbc" />
      </svg>
      <div className="absolute start-3 top-3 rounded-full bg-rice-white/95 px-3 py-1.5 text-xs font-bold shadow-sm">
        {localizeMenuText(AREAS.find((a) => a.id === area)!, language)}
      </div>
      {restaurants.map((r, index) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          aria-pressed={r.id === selectedId}
          aria-label={localizeMenuText(r.name, language)}
          style={{
            left: `${Math.max(15, Math.min(82, 50 + (r.lng - centerLng) * 5500))}%`,
            top: `${Math.max(30, Math.min(70, 50 - (r.lat - centerLat) * 4500))}%`,
          }}
          className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-[3px] border-white shadow-md transition-transform ${r.id === selectedId ? 'z-10 scale-110 bg-brand-primary text-white' : 'bg-rice-white text-brand-primary'}`}
        >
          <MapPin className="size-6" />
          <span className="absolute -end-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brand-accent text-[10px] font-bold text-white">
            {index + 1}
          </span>
        </button>
      ))}
      <span className="absolute bottom-4 start-4 flex size-9 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm">
        <Navigation className="size-4" />
      </span>
    </div>
  );
}
