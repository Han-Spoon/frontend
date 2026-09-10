import type { LocalizedMenuText, UserProfile } from '../App';
import { getProfileCommunicationItems } from '../results/resultViewModel';

export const AREAS = [
  {
    id: 'nearby',
    ko: '내 주변',
    en: 'Nearby',
    ar: 'بالقرب مني',
    'zh-CN': '附近',
    ja: '周辺',
    'zh-TW': '附近',
    es: 'Cerca',
  },
  {
    id: 'seongsu',
    ko: '성수',
    en: 'Seongsu',
    ar: 'سونغسو',
    'zh-CN': '圣水',
    ja: '聖水',
    'zh-TW': '聖水',
    es: 'Seongsu',
  },
  {
    id: 'gangnam',
    ko: '강남',
    en: 'Gangnam',
    ar: 'غانغنام',
    'zh-CN': '江南',
    ja: '江南',
    'zh-TW': '江南',
    es: 'Gangnam',
  },
  {
    id: 'yongsan',
    ko: '용산',
    en: 'Yongsan',
    ar: 'يونغسان',
    'zh-CN': '龙山',
    ja: '龍山',
    'zh-TW': '龍山',
    es: 'Yongsan',
  },
  {
    id: 'busan',
    ko: '부산',
    en: 'Busan',
    ar: 'بوسان',
    'zh-CN': '釜山',
    ja: '釜山',
    'zh-TW': '釜山',
    es: 'Busan',
  },
] as const;
export type AreaId = (typeof AREAS)[number]['id'];
export interface Restaurant {
  id: string;
  name: LocalizedMenuText;
  area: AreaId;
  lat: number;
  lng: number;
  category: LocalizedMenuText;
  price: number;
  image: string;
  profileIds: string[];
  feedback: { profileId: string; positive: number; total: number }[];
  address: string;
}
const images = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
];
// Fictional businesses, coordinates and feedback for the demo. No certification claims.
const seeds: [string, string, AreaId, number, number][] = [
  ['초록식탁', 'Green Table', 'seongsu', 37.5445, 127.0557],
  ['소담키친', 'Sodam Kitchen', 'seongsu', 37.5428, 127.0512],
  ['한그릇 정원', 'Garden Bowl', 'seongsu', 37.5481, 127.0579],
  ['온기밥상', 'Ongi Table', 'gangnam', 37.5009, 127.0278],
  ['그레인룸', 'Grain Room', 'gangnam', 37.5045, 127.0251],
  ['담백한 하루', 'A Simple Day', 'gangnam', 37.4979, 127.032],
  ['올리브 서울', 'Olive Seoul', 'yongsan', 37.5341, 126.9946],
  ['나무와 그릇', 'Wood & Bowl', 'yongsan', 37.5308, 126.991],
  ['작은 부엌', 'Little Kitchen', 'yongsan', 37.537, 126.999],
  ['바다 곁 식탁', 'Seaside Table', 'busan', 35.1564, 129.1195],
  ['달맞이 그린', 'Dalmaji Green', 'busan', 35.16, 129.124],
  ['파도 키친', 'Wave Kitchen', 'busan', 35.153, 129.115],
];
const profiles = [
  ['vegan:vegan', 'allergy:milk', 'preference:no-spicy'],
  ['religion:halal', 'preference:no-spicy', 'preference:no-alcohol'],
  ['allergy:milk', 'allergy:egg', 'vegan:vegan', 'religion:halal'],
];
export const RESTAURANTS: Restaurant[] = seeds.map(
  ([ko, en, area, lat, lng], index) => ({
    id: `demo-restaurant-${index + 1}`,
    name: { ko, en, ar: en },
    area,
    lat,
    lng,
    category: {
      ko: ['채소가 있는 한식', '편안한 한 끼', '계절의 한 그릇'][index % 3],
      en: ['Plant-forward Korean', 'Comfort food', 'Seasonal bowls'][index % 3],
    },
    price: [13000, 15000, 12000][index % 3],
    image: images[index % 3],
    profileIds: profiles[index % 3],
    feedback: profiles[index % 3].map((profileId, n) => ({
      profileId,
      positive: 18 + index * 3 + n,
      total: 23 + index * 3 + n,
    })),
    address: `${AREAS.find((a) => a.id === area)?.ko} · ${index + 1}`,
  }),
);
export function profileMatches(
  restaurant: Restaurant,
  profile: UserProfile | null,
) {
  const ids = new Set(
    getProfileCommunicationItems(profile).map((item) => item.id),
  );
  return restaurant.feedback.filter((item) => ids.has(item.profileId));
}
export const restaurantsInArea = (area: AreaId) =>
  RESTAURANTS.filter((r) => r.area === (area === 'nearby' ? 'seongsu' : area));
