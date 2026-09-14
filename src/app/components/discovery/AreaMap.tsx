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
  mode = 'card',
}: {
  area: AreaId;
  restaurants: Restaurant[];
  selectedId: string;
  onSelect: (id: string) => void;
  language: Language;
  mode?: 'card' | 'fullscreen';
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
      className={`relative overflow-hidden bg-[#e9eee5] ${mode === 'fullscreen' ? 'h-full min-h-[560px]' : 'h-[270px] rounded-[26px]'}`}
      aria-label={t(
        '지역 식당 지도',
        'Area restaurant map',
        'خريطة مطاعم المنطقة',
      )}
    >
      <svg
        viewBox={mode === 'fullscreen' ? '0 0 400 700' : '0 0 400 270'}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        <rect width="400" height={mode === 'fullscreen' ? '700' : '270'} fill="#e9eee5" />
        <path
          d={mode === 'fullscreen' ? 'M-40 610 Q100 480 235 570 T460 500' : 'M-20 215 Q100 145 230 215 T440 205'}
          fill="none"
          stroke="#c1dbe0"
          strokeWidth="38"
        />
        <path
          d={mode === 'fullscreen' ? 'M-20 90 L430 190 M-30 340 L430 275 M-20 500 L430 410 M35 -20 L210 740 M330 -20 L165 740 M-20 650 L400 45' : 'M-20 56 L430 120 M35 -20 L160 290 M280 -20 L215 290 M-20 175 L400 30'}
          stroke="#fffdf9"
          strokeWidth="15"
          fill="none"
        />
        <path
          d={mode === 'fullscreen' ? 'M-20 90 L430 190 M-30 340 L430 275 M-20 500 L430 410 M35 -20 L210 740 M330 -20 L165 740 M-20 650 L400 45' : 'M-20 56 L430 120 M35 -20 L160 290 M280 -20 L215 290 M-20 175 L400 30'}
          stroke="#deded2"
          strokeWidth="1"
          fill="none"
        />
        <rect x="292" y={mode === 'fullscreen' ? '390' : '155'} width="59" height="37" rx="15" fill="#c9ddbc" />
        <rect x="40" y={mode === 'fullscreen' ? '245' : '84'} width="36" height="40" rx="12" fill="#c9ddbc" />
      </svg>
      {mode === 'card' && <div className="absolute start-3 top-3 rounded-full bg-rice-white/95 px-3 py-1.5 text-xs font-bold shadow-sm">{localizeMenuText(AREAS.find((a) => a.id === area)!, language)}</div>}
      {restaurants.map((r) => (
        <button
          key={r.id}
          onClick={() => onSelect(r.id)}
          aria-pressed={r.id === selectedId}
          aria-label={localizeMenuText(r.name, language)}
          style={{
            left: `${Math.max(15, Math.min(82, 50 + (r.lng - centerLng) * 5500))}%`,
            top: `${Math.max(mode === 'fullscreen' ? 28 : 30, Math.min(mode === 'fullscreen' ? 66 : 70, 50 - (r.lat - centerLat) * 4500))}%`,
          }}
          className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-[3px] border-white shadow-md transition-transform ${r.id === selectedId ? 'z-10 scale-110 bg-brand-primary text-white' : 'bg-rice-white text-brand-primary'}`}
        >
          <MapPin className="size-6" />
        </button>
      ))}
      <span className={`absolute start-4 flex size-9 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm ${mode === 'fullscreen' ? 'bottom-48' : 'bottom-4'}`}>
        <Navigation className="size-4" />
      </span>
    </div>
  );
}
