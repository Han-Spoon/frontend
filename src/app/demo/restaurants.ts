import type { LocalizedMenuText, UserProfile } from '../App';
import { getProfileCommunicationItems } from '../results/resultViewModel';

export const AREAS = [
  { id: 'nearby', ko: '내 주변', en: 'Nearby', ar: 'بالقرب مني', 'zh-CN': '附近', ja: '周辺', 'zh-TW': '附近', es: 'Cerca' },
  { id: 'cheongdam', ko: '청담', en: 'Cheongdam', ar: 'تشونغدام' },
  { id: 'busan', ko: '부산', en: 'Busan', ar: 'بوسان', 'zh-CN': '釜山', ja: '釜山', 'zh-TW': '釜山', es: 'Busan' },
  { id: 'gangnam-yeoksam', ko: '강남·역삼', en: 'Gangnam · Yeoksam', ar: 'غانغنام · يوكسام' },
  { id: 'gwanghwamun-jongno', ko: '광화문·종로', en: 'Gwanghwamun · Jongno', ar: 'غوانغهامون · جونغنو' },
  { id: 'sinsa-nonhyeon', ko: '신사·논현', en: 'Sinsa · Nonhyeon', ar: 'سينسا · نونهيون' },
  { id: 'jeju', ko: '제주', en: 'Jeju', ar: 'جيجو', 'zh-CN': '济州', ja: '済州', 'zh-TW': '濟州', es: 'Jeju' },
  { id: 'hapjeong-mangwon', ko: '합정·망원', en: 'Hapjeong · Mangwon', ar: 'هابجونغ · مانغوون' },
  { id: 'yeonnam', ko: '연남', en: 'Yeonnam', ar: 'يوننام' },
  { id: 'geumho-oksu', ko: '금호·옥수', en: 'Geumho · Oksu', ar: 'غومهو · أوكسو' },
  { id: 'apgujeong-rodeo', ko: '압구정·로데오', en: 'Apgujeong · Rodeo', ar: 'أبغوجونغ · روديو' },
  { id: 'jamsil-songpa', ko: '잠실·송파', en: 'Jamsil · Songpa', ar: 'جامسيل · سونغبا' },
  { id: 'yongsan-samgakji', ko: '용산·삼각지', en: 'Yongsan · Samgakji', ar: 'يونغسان · سامغاكجي' },
  { id: 'itaewon-hannam', ko: '이태원·한남', en: 'Itaewon · Hannam', ar: 'إيتايوون · هاننام' },
  { id: 'seongsu', ko: '성수', en: 'Seongsu', ar: 'سونغسو', 'zh-CN': '圣水', ja: '聖水', 'zh-TW': '聖水', es: 'Seongsu' },
  { id: 'yeouido', ko: '여의도', en: 'Yeouido', ar: 'يويدو' },
  { id: 'daegu', ko: '대구', en: 'Daegu', ar: 'دايغو', 'zh-CN': '大邱', ja: '大邱', 'zh-TW': '大邱', es: 'Daegu' },
  { id: 'myeongdong-euljiro', ko: '명동·을지로', en: 'Myeongdong · Euljiro', ar: 'ميونغدونغ · يولجيرو' },
  { id: 'hongdae-sinchon', ko: '홍대·신촌', en: 'Hongdae · Sinchon', ar: 'هونغداي · سينتشون' },
] as const;

export type AreaId = (typeof AREAS)[number]['id'];
export type DiscoverAreaId = Exclude<AreaId, 'nearby'>;

export interface Restaurant {
  id: string;
  name: LocalizedMenuText;
  area: DiscoverAreaId;
  lat: number;
  lng: number;
  category: LocalizedMenuText;
  price: number;
  image: string;
  profileIds: string[];
  feedback: { profileId: string; positive: number; total: number }[];
  address: string;
  /** Demo state: every recipe was supplied by the partner; this is not a dietary safety guarantee. */
  partnership: 'recipe-verified' | 'standard';
}

export const AREA_CENTERS: Record<DiscoverAreaId, [number, number]> = {
  cheongdam: [37.524, 127.047],
  busan: [35.156, 129.12],
  'gangnam-yeoksam': [37.5, 127.036],
  'gwanghwamun-jongno': [37.573, 126.979],
  'sinsa-nonhyeon': [37.516, 127.024],
  jeju: [33.499, 126.531],
  'hapjeong-mangwon': [37.553, 126.91],
  yeonnam: [37.562, 126.923],
  'geumho-oksu': [37.544, 127.018],
  'apgujeong-rodeo': [37.527, 127.039],
  'jamsil-songpa': [37.513, 127.102],
  'yongsan-samgakji': [37.535, 126.973],
  'itaewon-hannam': [37.535, 127.0],
  seongsu: [37.545, 127.055],
  yeouido: [37.522, 126.924],
  daegu: [35.868, 128.598],
  'myeongdong-euljiro': [37.565, 126.99],
  'hongdae-sinchon': [37.556, 126.936],
};

const names: Record<DiscoverAreaId, [string, string][]> = {
  cheongdam: [['고운한상', 'Goun Table'], ['솔빛다이닝', 'Solbit Dining'], ['담소정', 'Damsojeong']],
  busan: [['바다 곁 식탁', 'Seaside Table'], ['달맞이 그린', 'Dalmaji Green'], ['파도 키친', 'Wave Kitchen']],
  'gangnam-yeoksam': [['온기밥상', 'Ongi Table'], ['그레인룸', 'Grain Room'], ['담백한 하루', 'A Simple Day']],
  'gwanghwamun-jongno': [['궁뜰', 'Palace Garden'], ['종로 한그릇', 'Jongno Bowl'], ['소반 광화문', 'Soban Gwanghwamun']],
  'sinsa-nonhyeon': [['가로수 부엌', 'Garosu Kitchen'], ['논현 식탁', 'Nonhyeon Table'], ['하루 채움', 'Haru Chaeum']],
  jeju: [['오름 한상', 'Oreum Table'], ['돌담 키친', 'Stonewall Kitchen'], ['제주 숨', 'Jeju Soom']],
  'hapjeong-mangwon': [['망원 소반', 'Mangwon Soban'], ['합정 한끼', 'Hapjeong Meal'], ['강변 부엌', 'Riverside Kitchen']],
  yeonnam: [['연남 정원', 'Yeonnam Garden'], ['골목 식탁', 'Alley Table'], ['숲길 한그릇', 'Forest Bowl']],
  'geumho-oksu': [['옥수 온기', 'Oksu Ongi'], ['금호 소담', 'Geumho Sodam'], ['강변 한상', 'Riverside Table']],
  'apgujeong-rodeo': [['도산 그린', 'Dosan Green'], ['로데오 키친', 'Rodeo Kitchen'], ['압구정 소반', 'Apgujeong Soban']],
  'jamsil-songpa': [['호수 식탁', 'Lake Table'], ['송파 한그릇', 'Songpa Bowl'], ['잠실 온기', 'Jamsil Ongi']],
  'yongsan-samgakji': [['올리브 서울', 'Olive Seoul'], ['나무와 그릇', 'Wood & Bowl'], ['삼각지 부엌', 'Samgakji Kitchen']],
  'itaewon-hannam': [['한남 테이블', 'Hannam Table'], ['이태원 가든', 'Itaewon Garden'], ['언덕 위 식탁', 'Hilltop Table']],
  seongsu: [['초록식탁', 'Green Table'], ['소담키친', 'Sodam Kitchen'], ['한그릇 정원', 'Garden Bowl']],
  yeouido: [['윤슬 식탁', 'Yoonseul Table'], ['여의 한상', 'Yeoui Table'], ['강빛 키친', 'Riverlight Kitchen']],
  daegu: [['달구벌 소반', 'Dalgubeol Soban'], ['동성로 한끼', 'Dongseong Meal'], ['대구 온기', 'Daegu Ongi']],
  'myeongdong-euljiro': [['을지 한그릇', 'Eulji Bowl'], ['명동 식탁', 'Myeongdong Table'], ['골목 소반', 'Alley Soban']],
  'hongdae-sinchon': [['홍대 정원', 'Hongdae Garden'], ['신촌 한상', 'Sinchon Table'], ['연희 부엌', 'Yeonhui Kitchen']],
};

const images = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=82',
];

const profiles = [
  ['vegan:vegan', 'allergy:milk', 'preference:no-spicy'],
  ['religion:halal', 'preference:no-spicy', 'preference:no-alcohol'],
  ['allergy:milk', 'allergy:egg', 'vegan:vegan', 'religion:halal'],
];

const discoverAreaIds = Object.keys(AREA_CENTERS) as DiscoverAreaId[];

// Fictional restaurants, coordinates, feedback and partnership states for UI demonstrations.
export const RESTAURANTS: Restaurant[] = discoverAreaIds.flatMap((areaId, areaIndex) => {
  const area = AREAS.find((item) => item.id === areaId)!;
  const [centerLat, centerLng] = AREA_CENTERS[areaId];
  return names[areaId].map(([ko, en], slot) => {
    const index = areaIndex * 3 + slot;
    const profileIds = [...profiles[index % profiles.length], ...[
      ['vegan:lacto_ovo', 'allergy:peanut', 'religion:kosher'],
      ['vegan:pesco', 'religion:hindu'],
      ['vegan:lacto_ovo', 'vegan:pesco', 'allergy:peanut'],
    ][index % 3]];
    return {
      id: `demo-restaurant-${index + 1}`,
      name: { ko, en, ar: en },
      area: areaId,
      lat: centerLat + (slot - 1) * 0.0027,
      lng: centerLng + (slot % 2 === 0 ? -1 : 1) * (slot + 1) * 0.0019,
      category: {
        ko: ['채소가 있는 한식', '편안한 한 끼', '계절의 한 그릇'][slot],
        en: ['Plant-forward Korean', 'Comfort food', 'Seasonal bowls'][slot],
      },
      price: [13000, 15000, 12000][slot],
      image: images[index % images.length],
      profileIds,
      feedback: profileIds.map((profileId, profileIndex) => ({
        profileId,
        positive: Math.round((24 + (index * 13 + profileIndex * 7) % 83) * (0.72 + (index * 7 + profileIndex * 3) % 24 / 100)),
        total: 24 + (index * 13 + profileIndex * 7) % 83,
      })),
      address: `${area.ko} · ${slot + 1}`,
      partnership: slot === 2 ? 'standard' : 'recipe-verified',
    } satisfies Restaurant;
  });
});

export function profileMatches(restaurant: Restaurant, profile: UserProfile | null) {
  const ids = new Set(getProfileCommunicationItems(profile).map((item) => item.id));
  return restaurant.feedback.filter((item) => ids.has(item.profileId));
}

export const restaurantsInArea = (area: AreaId) =>
  RESTAURANTS.filter((restaurant) => restaurant.area === (area === 'nearby' ? 'seongsu' : area));
