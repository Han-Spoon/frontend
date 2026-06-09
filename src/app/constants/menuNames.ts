import type { Language } from '../App';

/**
 * 자주 나오는 한식 메뉴의 "뜻(의미) 번역" 사전 (ko → en/ar).
 * - 회색줄: 발음 음역(로마자/아랍문자) — 알고리즘으로 자동 생성
 * - 설명 앞: 아래 사전의 "뜻"을 붙여 외국인이 이해하도록
 * 키는 공백 제거해 정규화 매칭한다("매운 갈비찜" == "매운갈비찜").
 */
const MENU_MEANING: Record<string, { en: string; ar: string }> = {
  비빔밥: { en: 'Mixed rice with vegetables', ar: 'أرز مخلوط بالخضار' },
  돌솥비빔밥: { en: 'Hot stone pot mixed rice', ar: 'أرز مخلوط في وعاء حجري ساخن' },
  김밥: { en: 'Seaweed rice roll', ar: 'لفائف الأرز بالأعشاب البحرية' },
  김치찌개: { en: 'Kimchi stew', ar: 'حساء الكيمتشي' },
  된장찌개: { en: 'Soybean paste stew', ar: 'حساء معجون الصويا' },
  순두부찌개: { en: 'Soft tofu stew', ar: 'حساء التوفو الطري' },
  부대찌개: { en: 'Sausage & ham stew', ar: 'حساء النقانق واللحم' },
  삼겹살: { en: 'Grilled pork belly', ar: 'لحم خاصرة الخنزير المشوي' },
  목살: { en: 'Grilled pork shoulder', ar: 'لحم كتف الخنزير المشوي' },
  불고기: { en: 'Marinated grilled beef', ar: 'لحم بقري متبّل مشوي' },
  갈비: { en: 'Grilled ribs', ar: 'أضلاع مشوية' },
  갈비찜: { en: 'Braised short ribs', ar: 'أضلاع مطهوة ببطء' },
  매운갈비찜: { en: 'Spicy braised short ribs', ar: 'أضلاع حارة مطهوة' },
  갈비탕: { en: 'Beef rib soup', ar: 'حساء أضلاع البقر' },
  곰탕: { en: 'Beef bone soup', ar: 'حساء عظام البقر' },
  특곰탕: { en: "Extra-large beef bone soup", ar: 'حساء عظام البقر (حجم كبير)' },
  설렁탕: { en: 'Ox bone soup', ar: 'حساء عظام الثور' },
  삼계탕: { en: 'Ginseng chicken soup', ar: 'حساء دجاج الجينسنغ' },
  육개장: { en: 'Spicy beef soup', ar: 'حساء لحم بقري حار' },
  감자탕: { en: 'Pork bone & potato soup', ar: 'حساء عظام الخنزير والبطاطا' },
  해장국: { en: 'Hangover soup', ar: 'حساء لإزالة آثار الكحول' },
  미역국: { en: 'Seaweed soup', ar: 'حساء الأعشاب البحرية' },
  떡국: { en: 'Rice cake soup', ar: 'حساء كعك الأرز' },
  만두국: { en: 'Dumpling soup', ar: 'حساء الزلابية' },
  떡만두국: { en: 'Rice cake & dumpling soup', ar: 'حساء كعك الأرز والزلابية' },
  떡볶이: { en: 'Spicy rice cakes', ar: 'كعك الأرز الحار' },
  순대: { en: 'Korean blood sausage', ar: 'نقانق كورية' },
  라면: { en: 'Instant noodles', ar: 'نودلز سريعة التحضير' },
  냉면: { en: 'Cold buckwheat noodles', ar: 'نودلز الحنطة السوداء الباردة' },
  비빔냉면: { en: 'Spicy cold noodles', ar: 'نودلز باردة حارة' },
  물냉면: { en: 'Cold noodles in broth', ar: 'نودلز باردة بالمرق' },
  칼국수: { en: 'Knife-cut noodle soup', ar: 'حساء النودلز المقطّعة' },
  잔치국수: { en: 'Banquet noodles', ar: 'نودلز الاحتفال' },
  비빔국수: { en: 'Spicy mixed noodles', ar: 'نودلز مخلوطة حارة' },
  잡채: { en: 'Stir-fried glass noodles', ar: 'نودلز زجاجية مقلية' },
  제육볶음: { en: 'Spicy stir-fried pork', ar: 'لحم خنزير حار مقلي' },
  제육덮밥: { en: 'Spicy pork over rice', ar: 'أرز بلحم خنزير حار' },
  오징어볶음: { en: 'Spicy stir-fried squid', ar: 'حبار حار مقلي' },
  닭갈비: { en: 'Spicy stir-fried chicken', ar: 'دجاج حار مقلي' },
  찜닭: { en: 'Braised soy chicken', ar: 'دجاج مطهو بصلصة الصويا' },
  닭볶음탕: { en: 'Spicy braised chicken', ar: 'دجاج حار مطهو' },
  보쌈: { en: 'Boiled pork wraps', ar: 'لفائف لحم الخنزير المسلوق' },
  족발: { en: "Braised pig's trotters", ar: 'أرجل خنزير مطهوة' },
  김치: { en: 'Kimchi (fermented cabbage)', ar: 'كيمتشي' },
  깍두기: { en: 'Radish kimchi', ar: 'كيمتشي الفجل' },
  공기밥: { en: 'Bowl of steamed rice', ar: 'وعاء أرز مطهو' },
  볶음밥: { en: 'Fried rice', ar: 'أرز مقلي' },
  김치볶음밥: { en: 'Kimchi fried rice', ar: 'أرز مقلي بالكيمتشي' },
  파전: { en: 'Scallion pancake', ar: 'فطيرة البصل الأخضر' },
  해물파전: { en: 'Seafood scallion pancake', ar: 'فطيرة البحريات والبصل' },
  김치전: { en: 'Kimchi pancake', ar: 'فطيرة الكيمتشي' },
  감자전: { en: 'Potato pancake', ar: 'فطيرة البطاطا' },
  계란말이: { en: 'Rolled omelette', ar: 'عجة ملفوفة' },
  돈까스: { en: 'Pork cutlet', ar: 'شرحات لحم الخنزير' },
  오므라이스: { en: 'Omelette over rice', ar: 'أرز بالعجة' },
  만두: { en: 'Dumplings', ar: 'زلابية' },
  김치만두: { en: 'Kimchi dumplings', ar: 'زلابية الكيمتشي' },
  군만두: { en: 'Fried dumplings', ar: 'زلابية مقلية' },
  치킨: { en: 'Fried chicken', ar: 'دجاج مقلي' },
  양념치킨: { en: 'Sweet & spicy chicken', ar: 'دجاج حلو حار' },
  후라이드치킨: { en: 'Fried chicken', ar: 'دجاج مقلي' },
  육회: { en: 'Beef tartare', ar: 'لحم بقري نيء' },
  회: { en: 'Sliced raw fish', ar: 'سمك نيء مقطّع' },
  된장국: { en: 'Soybean paste soup', ar: 'حساء معجون الصويا' },
  콩나물국: { en: 'Bean sprout soup', ar: 'حساء براعم الفاصوليا' },
  순두부: { en: 'Soft tofu', ar: 'توفو طري' },
  공깃밥: { en: 'Bowl of steamed rice', ar: 'وعاء أرز مطهو' },
};

const MEANING_INDEX = new Map(
  Object.entries(MENU_MEANING).map(([k, v]) => [k.replace(/\s+/g, ''), v]),
);

// ── 개정 로마자 표기법(간이): 한글 → 라틴 ──
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

// ── 라틴 → 아랍 문자(근사 음역): 긴 패턴 우선 ──
const ARABIC_MAP: [string, string][] = [
  ['ch', 'تش'], ['ng', 'نغ'],
  ['yae', 'يي'], ['yeo', 'يو'], ['wae', 'وي'], ['ya', 'يا'], ['ye', 'يي'],
  ['yo', 'يو'], ['yu', 'يو'], ['wa', 'وا'], ['wo', 'وو'], ['we', 'وي'],
  ['wi', 'وي'], ['oe', 'وي'], ['ui', 'وي'], ['ae', 'ي'], ['eo', 'و'], ['eu', ''],
  ['kk', 'ك'], ['tt', 'ت'], ['pp', 'ب'], ['ss', 'س'], ['jj', 'ج'],
  ['a', 'ا'], ['e', 'ي'], ['i', 'ي'], ['o', 'و'], ['u', 'و'],
  ['b', 'ب'], ['d', 'د'], ['g', 'غ'], ['h', 'ه'], ['j', 'ج'], ['k', 'ك'],
  ['l', 'ل'], ['m', 'م'], ['n', 'ن'], ['p', 'ب'], ['r', 'ر'], ['s', 'س'],
  ['t', 'ت'], ['w', 'و'], ['y', 'ي'],
];

function latinToArabic(latin: string): string {
  const lower = latin.toLowerCase();
  let i = 0;
  let out = '';
  while (i < lower.length) {
    if (lower[i] === ' ') { out += ' '; i += 1; continue; }
    let matched = false;
    for (const [pat, ar] of ARABIC_MAP) {
      if (lower.startsWith(pat, i)) {
        out += ar;
        i += pat.length;
        matched = true;
        break;
      }
    }
    if (!matched) { out += lower[i]; i += 1; }
  }
  return out;
}

/** 발음(회색줄): en=로마자, ar=아랍 음역. ko는 호출하지 않음(빈 값). */
export function getMenuPronunciation(koName: string, language: Language): string {
  const key = (koName ?? '').trim();
  if (!key || language === 'ko') return '';
  const latin = romanizeToLatin(key);
  return language === 'ar' ? latinToArabic(latin) : capitalize(latin);
}

/** 뜻(설명 앞): 사전에 있으면 en/ar 의미, 없으면 빈 문자열. */
export function getMenuMeaning(koName: string, language: Language): string {
  if (language === 'ko') return '';
  const v = MEANING_INDEX.get((koName ?? '').trim().replace(/\s+/g, ''));
  if (!v) return '';
  return language === 'ar' ? v.ar : v.en;
}
