import type { Language } from '../App';

/**
 * 자주 나오는 한식 메뉴명 사전 (ko → en/ar).
 * 사전에 있으면 제대로 된 명칭/번역을, 없으면 발음 음역(로마자/아랍문자)으로 대체한다.
 */
export const MENU_NAME_I18N: Record<string, { en: string; ar: string }> = {
  비빔밥: { en: 'Bibimbap', ar: 'بيبيمباب' },
  김밥: { en: 'Gimbap', ar: 'غيمباب' },
  김치찌개: { en: 'Kimchi stew', ar: 'حساء الكيمتشي' },
  된장찌개: { en: 'Soybean paste stew', ar: 'حساء معجون الصويا' },
  순두부찌개: { en: 'Soft tofu stew', ar: 'حساء التوفو الطري' },
  부대찌개: { en: 'Army stew', ar: 'بوداي جيغيه' },
  삼겹살: { en: 'Pork belly (Samgyeopsal)', ar: 'لحم خاصرة الخنزير' },
  불고기: { en: 'Bulgogi', ar: 'بولغوغي' },
  갈비: { en: 'Galbi (ribs)', ar: 'أضلاع غالبي' },
  갈비탕: { en: 'Galbitang (rib soup)', ar: 'حساء الأضلاع' },
  삼계탕: { en: 'Ginseng chicken soup', ar: 'حساء دجاج الجينسنغ' },
  설렁탕: { en: 'Seolleongtang (ox bone soup)', ar: 'حساء عظام البقر' },
  육개장: { en: 'Spicy beef soup', ar: 'حساء اللحم الحار' },
  감자탕: { en: 'Pork bone soup', ar: 'حساء عظام الخنزير' },
  해장국: { en: 'Haejangguk (hangover soup)', ar: 'حساء الهيجانغ' },
  미역국: { en: 'Seaweed soup', ar: 'حساء الأعشاب البحرية' },
  떡볶이: { en: 'Tteokbokki', ar: 'تيوكبوكي' },
  순대: { en: 'Sundae (blood sausage)', ar: 'سونداي' },
  라면: { en: 'Ramyeon', ar: 'راميون' },
  냉면: { en: 'Cold noodles (Naengmyeon)', ar: 'نودلز باردة' },
  칼국수: { en: 'Kalguksu (knife noodles)', ar: 'كالغوكسو' },
  잡채: { en: 'Japchae (glass noodles)', ar: 'جابتشيه' },
  제육볶음: { en: 'Spicy stir-fried pork', ar: 'لحم خنزير حار مقلي' },
  제육덮밥: { en: 'Spicy pork rice bowl', ar: 'أرز بلحم الخنزير الحار' },
  닭갈비: { en: 'Dakgalbi (spicy chicken)', ar: 'دجاج حار' },
  찜닭: { en: 'Jjimdak (braised chicken)', ar: 'دجاج مطهو' },
  보쌈: { en: 'Bossam (wrapped pork)', ar: 'بوسام' },
  족발: { en: "Jokbal (pig's trotters)", ar: 'أرجل الخنزير' },
  김치: { en: 'Kimchi', ar: 'كيمتشي' },
  공기밥: { en: 'Steamed rice', ar: 'أرز مطهو' },
  볶음밥: { en: 'Fried rice', ar: 'أرز مقلي' },
  김치볶음밥: { en: 'Kimchi fried rice', ar: 'أرز مقلي بالكيمتشي' },
  파전: { en: 'Pajeon (scallion pancake)', ar: 'فطيرة البصل' },
  해물파전: { en: 'Seafood pancake', ar: 'فطيرة المأكولات البحرية' },
  김치전: { en: 'Kimchi pancake', ar: 'فطيرة الكيمتشي' },
  계란말이: { en: 'Rolled omelet', ar: 'عجة ملفوفة' },
  돈까스: { en: 'Pork cutlet (Donkkaseu)', ar: 'شرحات لحم الخنزير' },
  오므라이스: { en: 'Omurice', ar: 'أومرايس' },
  치킨: { en: 'Fried chicken', ar: 'دجاج مقلي' },
  양념치킨: { en: 'Seasoned chicken', ar: 'دجاج بالصلصة' },
  육회: { en: 'Yukhoe (beef tartare)', ar: 'لحم بقري نيء' },
};

// ── 개정 로마자 표기법(간이) : 한글 → 라틴 ──
const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];

function romanizeToLatin(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const s = code - 0xac00;
      out += CHO[Math.floor(s / 588)] + JUNG[Math.floor((s % 588) / 28)] + JONG[s % 28];
    } else {
      out += ch;
    }
  }
  return out;
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ── 라틴 → 아랍 문자 (근사 음역) : 긴 패턴 우선 ──
const ARABIC_MAP: [string, string][] = [
  ['ch', 'تش'], ['ng', 'نغ'],
  ['yae', 'يي'], ['yeo', 'يو'], ['yae', 'يي'], ['wae', 'وي'],
  ['ae', 'ي'], ['eo', 'و'], ['eu', ''], ['ya', 'يا'], ['ye', 'يي'],
  ['yo', 'يو'], ['yu', 'يو'], ['wa', 'وا'], ['wo', 'وو'], ['we', 'وي'],
  ['wi', 'وي'], ['oe', 'وي'], ['ui', 'وي'],
  ['kk', 'ك'], ['tt', 'ت'], ['pp', 'ب'], ['ss', 'س'], ['jj', 'ج'],
  ['a', 'ا'], ['e', 'ي'], ['i', 'ي'], ['o', 'و'], ['u', 'و'],
  ['b', 'ب'], ['d', 'د'], ['g', 'غ'], ['h', 'ه'], ['j', 'ج'], ['k', 'ك'],
  ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['p', 'ب'], ['r', 'ر'], ['s', 'س'],
  ['t', 'ت'], ['w', 'و'], ['y', 'ي'],
];

function latinToArabic(latin: string): string {
  let i = 0;
  let out = '';
  const lower = latin.toLowerCase();
  while (i < lower.length) {
    const ch = lower[i];
    if (ch === ' ') { out += ' '; i += 1; continue; }
    let matched = false;
    for (const [pat, ar] of ARABIC_MAP) {
      if (lower.startsWith(pat, i)) {
        out += ar;
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (!matched) { out += ch; i += 1; }
  }
  return out;
}

/**
 * 메뉴명을 해당 언어로. 사전 우선, 없으면 발음 음역(en=로마자, ar=아랍 음역).
 */
export function getMenuLabel(koName: string, language: Language): string {
  const key = (koName ?? '').trim();
  if (!key) return '';
  if (language === 'ko') return key;

  const dict = MENU_NAME_I18N[key];
  if (dict) return language === 'ar' ? dict.ar : dict.en;

  const latin = romanizeToLatin(key);
  return language === 'ar' ? latinToArabic(latin) : capitalize(latin);
}
