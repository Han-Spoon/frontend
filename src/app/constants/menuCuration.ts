const MENU_CURATION_RULES: Array<{ keywords: string[]; curationId: string }> = [
  { keywords: ['김치'], curationId: 'kimchi-200' },
  { keywords: ['비빔밥', '백반', '한정식'], curationId: 'korean-table' },
  { keywords: ['된장', '고추장', '간장'], curationId: 'fermentation' },
  { keywords: ['치킨', '닭강정'], curationId: 'chimaek' },
  { keywords: ['떡볶이', '김밥', '순대', '튀김'], curationId: 'bunsik' },
  { keywords: ['삼겹살', '갈비', '불고기'], curationId: 'grill-cut' },
  { keywords: ['찌개', '전골'], curationId: 'shared-stew' },
  { keywords: ['해장국', '감자탕'], curationId: 'haejangguk' },
];

/** API 추천 필드가 오기 전까지 한 곳에서만 관리하는 임시 연결 규칙. */
export function getCurationIdForMenu(menuName: string): string | undefined {
  return MENU_CURATION_RULES.find(({ keywords }) =>
    keywords.some((keyword) => menuName.includes(keyword)),
  )?.curationId;
}
