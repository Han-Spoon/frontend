import type { Language } from '../App';

export type LocalizedText = Record<Language, string>;

export interface CodedOption {
  /** 백엔드 enum 코드값 (그대로 API로 전송) */
  value: string;
  label: LocalizedText;
}

/**
 * 채식 유형 — 백엔드 VegetarianType enum 코드값.
 * (vegan | lacto | ovo | lacto_ovo | pesco)
 */
export const VEGETARIAN_OPTIONS: CodedOption[] = [
  { value: 'vegan', label: { ko: '비건', en: 'Vegan', ar: 'نباتي صارم' } },
  { value: 'lacto', label: { ko: '락토', en: 'Lacto', ar: 'لاكتو' } },
  { value: 'ovo', label: { ko: '오보', en: 'Ovo', ar: 'أوفو' } },
  { value: 'lacto_ovo', label: { ko: '락토오보', en: 'Lacto-Ovo', ar: 'لاكتو أوفو' } },
  { value: 'pesco', label: { ko: '페스코', en: 'Pesco', ar: 'بيسكو' } },
];

/**
 * 종교 식이 — 백엔드 ReligionType enum 코드값.
 * 백엔드는 halal | kosher | hindu | none 만 허용하며,
 * '기타(Other)'에 대응하는 값이 없으므로 선택지에서 제외한다.
 */
export const RELIGION_OPTIONS: CodedOption[] = [
  { value: 'halal', label: { ko: '할랄', en: 'Halal', ar: 'حلال' } },
  { value: 'kosher', label: { ko: '코셔', en: 'Kosher', ar: 'كوشير' } },
  { value: 'hindu', label: { ko: '힌두', en: 'Hindu', ar: 'هندوسي' } },
];

/**
 * 식약처 지정 알레르기 유발물질 19종 — 백엔드 AllergyCode enum 코드값.
 */
export const ALLERGY_OPTIONS: CodedOption[] = [
  { value: 'egg', label: { ko: '계란', en: 'Egg', ar: 'بيض' } },
  { value: 'milk', label: { ko: '우유', en: 'Milk', ar: 'حليب' } },
  { value: 'buckwheat', label: { ko: '메밀', en: 'Buckwheat', ar: 'الحنطة السوداء' } },
  { value: 'peanut', label: { ko: '땅콩', en: 'Peanut', ar: 'الفول السوداني' } },
  { value: 'soybean', label: { ko: '대두', en: 'Soybean', ar: 'فول الصويا' } },
  { value: 'wheat', label: { ko: '밀', en: 'Wheat', ar: 'القمح' } },
  { value: 'mackerel', label: { ko: '고등어', en: 'Mackerel', ar: 'الإسقمري' } },
  { value: 'crab', label: { ko: '게', en: 'Crab', ar: 'سلطعون' } },
  { value: 'shrimp', label: { ko: '새우', en: 'Shrimp', ar: 'روبيان' } },
  { value: 'pork', label: { ko: '돼지고기', en: 'Pork', ar: 'لحم الخنزير' } },
  { value: 'peach', label: { ko: '복숭아', en: 'Peach', ar: 'خوخ' } },
  { value: 'tomato', label: { ko: '토마토', en: 'Tomato', ar: 'طماطم' } },
  { value: 'sulfite', label: { ko: '아황산류', en: 'Sulfite', ar: 'الكبريتيت' } },
  { value: 'walnut', label: { ko: '호두', en: 'Walnut', ar: 'الجوز' } },
  { value: 'chicken', label: { ko: '닭고기', en: 'Chicken', ar: 'دجاج' } },
  { value: 'beef', label: { ko: '소고기', en: 'Beef', ar: 'لحم البقر' } },
  { value: 'squid', label: { ko: '오징어', en: 'Squid', ar: 'حبار' } },
  { value: 'shellfish', label: { ko: '조개류', en: 'Shellfish', ar: 'المحار' } },
  { value: 'pinenut', label: { ko: '잣', en: 'Pine nut', ar: 'الصنوبر' } },
];

/**
 * 지원 국가 — ISO 3166-1 alpha-2 코드.
 * 국가명은 Intl.DisplayNames로 언어별 런타임 변환하므로 코드만 보관한다.
 */
export const COUNTRY_CODES: string[] = [
  'AD', 'AE', 'AF', 'AG', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ',
  'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FM', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY',
  'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT',
  'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NZ',
  'OM',
  'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PT', 'PW', 'PY',
  'QA',
  'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SY', 'SZ',
  'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VN', 'VU',
  'WS',
  'YE',
  'ZA', 'ZM', 'ZW',
];

const countryNameCache = new Map<Language, Intl.DisplayNames>();

function getDisplayNames(language: Language): Intl.DisplayNames {
  let instance = countryNameCache.get(language);
  if (!instance) {
    instance = new Intl.DisplayNames([language], { type: 'region' });
    countryNameCache.set(language, instance);
  }
  return instance;
}

/** ISO alpha-2 코드를 해당 언어의 국가명으로 변환. 실패 시 코드 그대로 반환. */
export function getCountryName(code: string, language: Language): string {
  try {
    return getDisplayNames(language).of(code) ?? code;
  } catch {
    return code;
  }
}

/** ISO alpha-2 코드를 국기 이모지(regional indicator)로 변환. */
export function getCountryFlag(code: string): string {
  if (code.length !== 2) return '';
  const base = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split('')
    .map((ch) => base + (ch.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}
