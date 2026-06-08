import type { Language } from '../App';
import type { LocalizedText } from '../i18n';

/**
 * 큐레이션 이미지 = Wikimedia Commons 무료 직링크(핫링크 허용·CDN). blob 불필요.
 * 로드 실패 시 컴포넌트의 onError 폴백(그라데이션/accent + 이모지)으로 대체.
 */
const commons = (file: string, width = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${width}`;

export type CurationTag = 'culture' | 'restaurant' | 'food' | 'tips';

export const CURATION_TAGS: { key: CurationTag; label: LocalizedText }[] = [
  { key: 'culture', label: { ko: '식문화', en: 'Food Culture', ar: 'ثقافة الطعام' } },
  { key: 'restaurant', label: { ko: '식당에서', en: 'At the Table', ar: 'في المطعم' } },
  { key: 'food', label: { ko: '한식 이야기', en: 'Korean Food', ar: 'الطعام الكوري' } },
  { key: 'tips', label: { ko: '알아두기', en: 'Good to Know', ar: 'معلومة مفيدة' } },
];

export const tagLabel = (key: CurationTag, language: Language) =>
  CURATION_TAGS.find((t) => t.key === key)?.label[language] ?? key;

export interface CurationArticle {
  id: string;
  emoji: string;
  accent: string;
  image: string;
  date: string; // ISO
  tag: CurationTag;
  title: LocalizedText;
  excerpt: LocalizedText;
  /** 문단 구분 '\n\n' */
  body: LocalizedText;
  /** 히어로 캐러셀 노출 */
  featured?: boolean;
  gradient?: string;
  subtitle?: LocalizedText;
}

export const CURATION_ARTICLES: CurationArticle[] = [
  // ───────── 히어로(featured) ─────────
  {
    id: 'korean-table',
    emoji: '🍚',
    accent: 'bg-amber-50',
    image: commons('Dolsot-bibimbap.jpg'),
    date: '2026-06-05',
    tag: 'culture',
    featured: true,
    gradient: 'from-amber-500 to-orange-600',
    title: { ko: '한 상 가득, 한국의 밥상', en: 'A Table Full of Korea', ar: 'مائدة كورية عامرة' },
    subtitle: {
      ko: '밥·국·반찬이 어우러지는 정(情)의 한 끼',
      en: 'Rice, soup, and many sides — a meal of warmth',
      ar: 'أرز وحساء وأطباق جانبية — وجبة من الدفء',
    },
    excerpt: {
      ko: '한꺼번에 펼쳐지는 그릇들, 그 안에 담긴 환대의 마음',
      en: 'Everything at once — the Korean spirit of hospitality',
      ar: 'كل شيء دفعة واحدة — روح الضيافة الكورية',
    },
    body: {
      ko: '한국의 밥상은 ‘한 상 차림’이라는 말로 요약됩니다. 밥과 국을 가운데 두고 그 둘레를 김치와 여러 반찬이 둘러싸죠. 메인 요리 하나에 집중하는 서양식 코스와 달리, 한국은 처음부터 모든 음식을 한꺼번에 펼쳐 놓고 자유롭게 오가며 먹습니다.\n\n이 상차림의 바탕에는 ‘정(情)’이 있습니다. 손님을 빈손으로 돌려보내지 않고 푸짐하게 대접하려는 마음이죠. 그래서 반찬은 대개 무료이고, 모자라면 더 달라고 할 수 있습니다.\n\n밥·국·반찬의 균형도 흥미롭습니다. 뜨거운 국과 갓 지은 밥, 짭짤한 반찬과 새콤한 김치가 한 입 안에서 어우러지도록 설계돼 있어요. 한 가지를 오래 먹기보다 여러 맛을 번갈아 즐기는 것이 한국식 식사의 리듬입니다.\n\n그러니 처음 한국 식당에 앉았다면 당황하지 마세요. 한꺼번에 깔린 그릇들은 “이걸 다 먹어야 하나?”가 아니라 “마음껏 골라 드세요”라는 환영 인사에 가깝습니다.',
      en: 'A Korean meal is best summed up by the phrase “han-sang” — a full table. Rice and soup sit at the center, ringed by kimchi and an array of side dishes. Unlike a Western course built around one main, Korea lays everything out at once and lets you wander freely between flavors.\n\nBeneath it all is “jeong,” a warmth that refuses to send a guest away empty. That is why side dishes are usually free, and why you can simply ask for more.\n\nThe balance is deliberate, too: hot soup and just-cooked rice, salty banchan and tangy kimchi, all meant to meet in a single bite. The rhythm of a Korean meal is alternating tastes rather than finishing one dish at a time.\n\nSo if it is your first time, do not panic at the crowd of little plates. They are less a question of “must I finish all this?” and more a greeting that says, “help yourself, freely.”',
      ar: 'تُلخَّص الوجبة الكورية بكلمة «هان‑سانغ» أي المائدة العامرة. يتوسّط الأرز والحساء المشهد، وتحيط بهما الكيمتشي وأطباق جانبية كثيرة. وخلافًا للوجبة الغربية القائمة على طبق رئيسي واحد، تُقدَّم كل الأطباق دفعة واحدة لتتنقّل بينها بحرية.\n\nفي جوهر ذلك «جيونغ»، وهو دفء يأبى أن يعود الضيف خالي اليدين. لذلك تكون الأطباق الجانبية مجانية غالبًا، ويمكنك ببساطة طلب المزيد.\n\nالتوازن مقصود أيضًا: حساء ساخن وأرز طازج وأطباق مالحة وكيمتشي حامض، صُمّمت لتلتقي في لقمة واحدة. وإيقاع الوجبة الكورية هو التنقّل بين النكهات لا إنهاء طبق تلو الآخر.\n\nلذا إن كانت زيارتك الأولى، فلا تقلق من كثرة الصحون الصغيرة؛ فهي ليست سؤالًا «هل عليّ إنهاء كل هذا؟» بل ترحيب يقول: «تفضّل، كُل على راحتك».',
    },
  },
  {
    id: 'fermentation',
    emoji: '🥬',
    accent: 'bg-emerald-50',
    image: commons('Kimchi.jpg'),
    date: '2026-06-04',
    tag: 'food',
    featured: true,
    gradient: 'from-emerald-500 to-teal-600',
    title: { ko: '발효의 나라', en: 'Land of Fermentation', ar: 'بلاد التخمير' },
    subtitle: {
      ko: '김치·된장·고추장, 시간이 빚어낸 깊은 맛',
      en: 'Kimchi, doenjang, gochujang — flavors aged by time',
      ar: 'كيمتشي ودوينجانغ وغوتشوغانغ — نكهات صنعها الزمن',
    },
    excerpt: {
      ko: '장독대에서 익어가는 한국의 ‘느린 맛’',
      en: "Korea's slow flavors, ripening in clay jars",
      ar: 'نكهات كوريا البطيئة، تنضج في الجِرار',
    },
    body: {
      ko: '한식의 깊은 맛 뒤에는 거의 언제나 ‘발효’가 있습니다. 배추를 소금과 양념에 절여 익히면 김치가 되고, 콩을 띄워 숙성시키면 된장과 간장이 됩니다. 거기에 고추가 더해지면 매콤달콤한 고추장이 탄생하죠.\n\n예전 한국 집의 마당엔 크고 작은 항아리가 줄지어 선 ‘장독대’가 있었습니다. 햇볕과 바람, 그리고 시간이 장맛을 좌우한다고 믿었기에, 장 담그는 일은 한 해의 중요한 행사였어요.\n\n발효는 단지 보존을 위한 기술이 아니라 ‘없던 맛을 만들어내는’ 마법입니다. 미생물이 단백질과 당을 천천히 분해하면서, 짠맛 속에 감칠맛과 산미, 단맛이 켜켜이 쌓입니다. 같은 재료라도 익는 시간과 온도에 따라 완전히 다른 맛이 나죠.\n\n그래서 한국에서 “묵은지”나 “오래 묵힌 된장”은 귀한 대접을 받습니다. 시간이 들수록 깊어지는 맛 — 그것이 발효의 나라가 자랑하는 한 끼입니다.',
      en: 'Behind the deep flavors of Korean food, you will almost always find fermentation. Salt and seasoning turn cabbage into kimchi; cultured soybeans become doenjang and soy sauce; add chili and you get the sweet-hot gochujang.\n\nOld Korean homes kept a “jangdokdae,” rows of earthen jars in the yard. Sun, wind, and time were believed to decide the taste, so making the year’s sauces was a major event.\n\nFermentation is not just preservation — it is the magic of creating flavor that was not there before. As microbes slowly break down proteins and sugars, layers of savoriness, acidity, and sweetness build inside the salt. The same ingredients can taste utterly different depending on time and temperature.\n\nThat is why well-aged kimchi (mugeunji) and long-matured doenjang are prized. Flavor that only deepens with time — that is the meal this land of fermentation is proud of.',
      ar: 'خلف النكهات العميقة للطعام الكوري ستجد التخمير دائمًا تقريبًا. فالملح والتوابل يحوّلان الملفوف إلى كيمتشي، وفول الصويا المُخمَّر يصبح دوينجانغ وصلصة صويا، ومع الفلفل يولد الغوتشوغانغ الحلو الحار.\n\nكانت البيوت الكورية القديمة تحتفظ بـ«جانغدوكداي»، صفوف من الجِرار الفخارية في الفناء. وكان يُعتقد أن الشمس والريح والوقت تحدّد المذاق، فكان تحضير الصلصات حدثًا سنويًا مهمًا.\n\nالتخمير ليس مجرد حفظ، بل سحر يخلق نكهة لم تكن موجودة. فمع تحلّل الميكروبات للبروتينات والسكريات ببطء، تتراكم طبقات من النكهة والحموضة والحلاوة داخل الملح. وقد تختلف المكوّنات نفسها تمامًا حسب الوقت والحرارة.\n\nلذا يُقدَّر الكيمتشي المُعتّق والدوينجانغ المُخمَّر طويلًا. نكهة تزداد عمقًا مع الزمن — تلك هي الوجبة التي تفخر بها بلاد التخمير.',
    },
  },
  {
    id: 'chimaek',
    emoji: '🍗',
    accent: 'bg-yellow-50',
    image: commons('Korean fried chicken 240206.jpg'),
    date: '2026-06-03',
    tag: 'culture',
    featured: true,
    gradient: 'from-yellow-500 to-amber-600',
    title: { ko: '오늘 밤은 치맥', en: 'Tonight: Chimaek', ar: 'الليلة: تشيماك' },
    subtitle: {
      ko: '바삭한 치킨에 시원한 맥주 한 잔',
      en: 'Crispy fried chicken meets cold beer',
      ar: 'دجاج مقلي مقرمش مع بيرة باردة',
    },
    excerpt: {
      ko: '치킨(chicken)+맥주(maekju)=치맥, 한국인의 밤 문화',
      en: 'Chicken + maekju = chimaek, Korea’s night ritual',
      ar: 'دجاج + بيرة = تشيماك، طقس الليل الكوري',
    },
    body: {
      ko: '‘치맥’은 치킨(chicken)과 맥주(맥주, maekju)의 합성어로, 바삭한 프라이드치킨에 시원한 맥주를 곁들이는 한국식 야식 문화를 가리킵니다. 단순한 메뉴를 넘어 ‘퇴근 후의 보상’이자 ‘친구와의 밤’을 상징하죠.\n\n한국 치킨의 매력은 압도적으로 바삭한 튀김옷입니다. 두 번 튀겨 기름기를 빼고 껍질을 얇고 단단하게 만드는데, 여기에 달콤매콤한 양념을 입히면 ‘양념치킨’, 그대로 두면 ‘프라이드’가 됩니다. 반반으로 시키는 것도 국룰이에요.\n\n치맥은 장소를 가리지 않습니다. 호프집과 치킨집은 물론, 한강 둔치에 돗자리를 펴고 배달 치킨을 즐기는 풍경은 한국의 여름을 대표하는 장면이 됐습니다. 배달 앱으로 강변까지 치킨이 오니까요.\n\n2002년 월드컵과 드라마를 타고 치맥은 전 세계로 퍼졌습니다. 누군가 “치킨엔 맥주”라고 말한다면, 그건 한국에서 거의 진리에 가깝습니다.',
      en: '“Chimaek” fuses chicken with “maekju” (beer): crispy fried chicken paired with an ice-cold lager, Korea’s beloved late-night ritual. More than a menu, it stands for the reward after work and a night out with friends.\n\nThe charm of Korean chicken is its impossibly crisp coating. It is fried twice to drain the oil and harden the skin; glaze it sweet-and-spicy for “yangnyeom,” or leave it plain for “fried.” Ordering half-and-half is practically the rule.\n\nChimaek goes anywhere. Beyond pubs and chicken shops, spreading a mat along the Han River with delivered chicken has become an icon of Korean summer — the apps will bring it right to the riverbank.\n\nCarried by the 2002 World Cup and K-dramas, chimaek spread worldwide. If someone says “beer goes with chicken,” in Korea that is close to gospel.',
      ar: '«تشيماك» مزيج من الدجاج و«مايكجو» (البيرة): دجاج مقلي مقرمش مع بيرة باردة، طقس الليل المحبوب في كوريا. وهو أكثر من قائمة طعام؛ إنه مكافأة بعد العمل وسهرة مع الأصدقاء.\n\nسحر الدجاج الكوري في قشرته المقرمشة بشكل لا يُصدّق. يُقلى مرتين لتصفية الزيت وتقوية القشرة؛ ثم يُغلَّف بصلصة حلوة حارة فيصبح «يانغنيوم»، أو يُترك ساده «مقليًا». وطلب نصف ونصف يكاد يكون قاعدة.\n\nالتشيماك يناسب كل مكان. فإلى جانب الحانات ومحلات الدجاج، صار فرش حصيرة على ضفاف نهر هان مع دجاج موصَّل رمزًا للصيف الكوري — والتطبيقات تجلبه حتى الضفة.\n\nوبفضل كأس العالم 2002 والدراما الكورية، انتشر التشيماك عالميًا. وإن قال أحدهم «البيرة تناسب الدجاج»، فهذا في كوريا أقرب إلى حقيقة مطلقة.',
    },
  },
  {
    id: 'bunsik',
    emoji: '🌶️',
    accent: 'bg-rose-50',
    image: commons('Korean.snacks-Tteokbokki-08.jpg'),
    date: '2026-06-02',
    tag: 'food',
    featured: true,
    gradient: 'from-rose-500 to-red-600',
    title: { ko: '길거리 분식의 세계', en: 'Korean Street Snacks', ar: 'وجبات الشارع الكورية' },
    subtitle: {
      ko: '떡볶이·김밥·순대, 소박하지만 중독적인',
      en: 'Tteokbokki, gimbap, sundae — simple yet addictive',
      ar: 'تيوكبوكي وغيمباب وسونداي — بسيطة لكنها تُدمن',
    },
    excerpt: {
      ko: '학교 앞 추억의 맛, 떡볶이 한 접시의 행복',
      en: 'The after-school taste everyone remembers',
      ar: 'نكهة ما بعد المدرسة التي يتذكّرها الجميع',
    },
    body: {
      ko: '‘분식(粉食)’은 본래 밀가루 음식을 뜻했지만, 지금은 떡볶이·김밥·순대·튀김처럼 저렴하고 빠르게 먹는 길거리 음식을 통칭합니다. 한국인이라면 누구나 학교 앞 분식집의 추억 하나쯤은 가지고 있죠.\n\n주인공은 단연 떡볶이입니다. 쫄깃한 가래떡을 고추장 양념에 자작하게 졸여낸 이 음식은 맵고 달고 따뜻해서, 한 번 빠지면 헤어나기 어렵습니다. 어묵 국물과 함께 먹으면 매운맛이 한결 부드러워져요.\n\n분식의 또 다른 매력은 ‘조합의 자유’입니다. 김밥을 떡볶이 국물에 찍어 먹고, 튀김을 적셔 먹고, 순대를 곁들이는 식이죠. 정해진 코스가 없으니 입맛대로 섞어 즐기면 됩니다.\n\n비싸지 않고 화려하지 않지만, 분식은 한국인의 일상에 가장 가까이 있는 맛입니다. 떡볶이 한 접시에 담긴 건 매콤함만이 아니라, 골목과 청춘의 기억이기도 하니까요.',
      en: '“Bunsik” once meant flour-based food, but today it refers to cheap, quick street snacks like tteokbokki, gimbap, sundae, and fritters. Almost every Korean carries a memory of the snack shop by their school.\n\nThe star is tteokbokki: chewy rice cakes simmered in a glossy gochujang sauce — spicy, sweet, and warm enough to be genuinely addictive. Eaten with a cup of fish-cake broth, the heat softens nicely.\n\nAnother charm is the freedom to mix. Dip gimbap into the tteokbokki sauce, soak a fritter in it, add a side of sundae. There is no set course; combine it however your taste leads.\n\nIt is neither pricey nor fancy, yet bunsik is the flavor closest to everyday Korean life. A plate of tteokbokki holds more than spice — it holds alleyways and the memory of youth.',
      ar: 'كانت «بونسيك» تعني الطعام المصنوع من الدقيق، لكنها اليوم تشير إلى وجبات الشارع الرخيصة والسريعة مثل التيوكبوكي والغيمباب والسونداي والمقالي. ويكاد كل كوري يحمل ذكرى عن محل الوجبات قرب مدرسته.\n\nالنجم هو التيوكبوكي: أصابع أرز مطاطية تُطهى في صلصة غوتشوغانغ لامعة — حارة وحلوة ودافئة لدرجة تُدمن حقًا. ومع مرق كعك السمك تخفّ الحرارة بلطف.\n\nومن سحرها أيضًا حرية المزج: تغمس الغيمباب في صلصة التيوكبوكي، وتنقع قطعة مقلية، وتضيف السونداي. لا ترتيب ثابت؛ امزج كما يقودك ذوقك.\n\nليست غالية ولا فاخرة، لكن البونسيك أقرب نكهة إلى الحياة اليومية الكورية. فطبق التيوكبوكي يحمل أكثر من الحرارة — يحمل الأزقّة وذكرى الشباب.',
    },
  },

  // ───────── 피드 ─────────
  {
    id: 'banchan-free',
    emoji: '🥗',
    accent: 'bg-emerald-50',
    image: commons('Korean side dishes-Banchan-01.jpg'),
    date: '2026-05-28',
    tag: 'culture',
    title: {
      ko: '왜 한국 식당의 반찬은 공짜일까?',
      en: 'Why are side dishes free in Korea?',
      ar: 'لماذا الأطباق الجانبية مجانية في كوريا؟',
    },
    excerpt: {
      ko: '김치·나물이 기본으로, 리필까지 — 정(情)의 식문화',
      en: 'Kimchi and greens for free, refills included',
      ar: 'كيمتشي وخضار مجانًا، مع إعادة التعبئة',
    },
    body: {
      ko: '한국 식당에서 메뉴를 시키면 묻지도 않았는데 김치·나물 같은 작은 접시들이 줄줄이 깔립니다. 이 ‘반찬’은 대부분 무료이고, 다 먹으면 “리필”도 부탁할 수 있어요. 외국인에게는 신기한 풍경이지만, 한국에선 너무나 당연한 일이죠.\n\n뿌리에는 손님을 빈손으로 돌려보내지 않으려는 ‘정(情)’ 문화가 있습니다. 푸짐하게 차려 대접하는 것이 곧 환대였기에, 반찬을 아끼지 않는 전통이 생긴 겁니다.\n\n반찬 가짓수는 식당의 자존심이기도 합니다. 백반집에선 7~8가지가 기본이고, 계절마다 나물과 절임이 바뀝니다. 어떤 노포는 20첩이 넘는 상차림으로 손님을 압도하기도 하죠.\n\n그러니 반찬이 떨어졌다고 망설이지 마세요. “반찬 리필 가능할까요?” 한마디면 충분합니다. 무료로 더 채워주는 그 인심이야말로, 가장 한국적인 맛이니까요.',
      en: 'Order at a Korean restaurant and, unasked, a row of little plates — kimchi, seasoned greens — appears. These “banchan” are mostly free, and you can ask for refills. To visitors it is a curious sight; to Koreans it is simply how meals work.\n\nThe root is “jeong,” the impulse not to send a guest away empty-handed. Setting a generous table was itself a form of welcome, so a tradition of unstinting side dishes took hold.\n\nThe count is a point of pride. A humble baekban spot may serve seven or eight, swapping greens and pickles by the season; some old restaurants overwhelm you with twenty-plus dishes.\n\nSo do not hesitate when a plate runs empty. “Can I get a refill?” is all it takes — and that no-charge generosity is one of the most Korean flavors of all.',
      ar: 'اطلب في مطعم كوري، ودون أن تسأل، يظهر صفّ من الصحون الصغيرة — كيمتشي وخضار متبّلة. هذه «البانتشان» مجانية غالبًا، ويمكنك طلب المزيد. مشهد غريب للزائر، لكنه ببساطة طريقة الوجبات في كوريا.\n\nالأصل هو «جيونغ»، الرغبة في ألا يعود الضيف خالي اليدين. فالمائدة السخيّة كانت بحد ذاتها ترحيبًا، فنشأ تقليد الكرم في الأطباق الجانبية.\n\nوعددها مصدر فخر. فقد يقدّم محل «بايكبان» المتواضع سبعة أو ثمانية، وتتبدّل الخضار والمخلّلات مع الفصول؛ وبعض المطاعم العريقة تبهرك بأكثر من عشرين طبقًا.\n\nفلا تتردّد حين يفرغ صحن. تكفي عبارة «هل يمكن إعادة التعبئة؟» — وهذا الكرم المجاني من أكثر النكهات كوريّةً.',
    },
  },
  {
    id: 'grill-cut',
    emoji: '🥩',
    accent: 'bg-rose-50',
    image: commons('Korean Barbecue-Samgyeopsal-01.jpg'),
    date: '2026-05-24',
    tag: 'restaurant',
    title: {
      ko: '사장님이 고기를 직접 잘라주는 이유',
      en: 'Why staff grill and cut your meat',
      ar: 'لماذا يشوي الموظفون اللحم ويقطعونه',
    },
    excerpt: {
      ko: '테이블 불판 위 바비큐, 그리고 쌈의 즐거움',
      en: 'Tableside barbecue and the joy of ssam',
      ar: 'شواء على الطاولة ومتعة «السام»',
    },
    body: {
      ko: '삼겹살·갈비집에 가면 직원이 테이블 한가운데 불판에서 고기를 굽고, 가위로 먹기 좋게 잘라주는 모습을 볼 수 있습니다. 처음 보면 ‘왜 손님 고기를 대신 굽지?’ 싶지만, 여기엔 분명한 이유가 있어요.\n\n첫째는 맛입니다. 굽는 타이밍과 불 조절이 고기 맛을 좌우하기 때문에, 익숙한 직원이 가장 맛있는 굽기를 맞춰주는 거죠. 둘째는 배려입니다. 손님은 손에 기름 묻히지 않고 대화에 집중하며 편히 즐길 수 있습니다.\n\n잘 구워진 고기는 그냥 먹지 않습니다. 상추나 깻잎에 고기 한 점, 쌈장, 마늘, 파채를 올려 한입에 ‘쌈’을 싸 먹는 것이 정석이에요. 입이 터질 듯 크게 싸 먹을수록 더 맛있다는 농담도 있을 정도죠.\n\n불판 위에서 지글거리는 소리, 자글자글 익는 기름, 그리고 다 같이 손을 뻗어 굽고 싸 먹는 풍경 — 한국식 바비큐는 음식이자 하나의 즐거운 의식입니다.',
      en: 'At samgyeopsal and galbi houses, a server often grills the meat on the burner set into your table and snips it into bite-size pieces with scissors. It looks odd at first — why cook the guest’s meat? — but there are good reasons.\n\nFirst, taste: timing and heat make or break grilled meat, so an experienced hand dials in the perfect doneness. Second, care: you keep your hands clean, stay in the conversation, and simply enjoy.\n\nGrilled meat is rarely eaten plain. The classic move is a “ssam”: a piece of meat on a lettuce or perilla leaf with ssamjang, garlic, and scallion, folded and eaten in one bite — the bigger the mouthful, the better, as the joke goes.\n\nThe sizzle on the plate, the fat crackling, everyone reaching in to grill and wrap together — Korean barbecue is both a meal and a joyful little ritual.',
      ar: 'في مطاعم السامغيوبسال والكالبي، غالبًا ما يشوي الموظف اللحم على الموقد المثبَّت في طاولتك ويقصّه قطعًا صغيرة بالمقص. يبدو الأمر غريبًا أول مرة — لماذا يطهو لحم الضيف؟ — لكن للأمر أسبابًا وجيهة.\n\nأولًا المذاق: فالتوقيت والحرارة يصنعان اللحم المشوي، لذا تضبط اليد الخبيرة أفضل نضج. وثانيًا المراعاة: تبقى يداك نظيفتين، وتنخرط في الحديث، وتستمتع ببساطة.\n\nنادرًا ما يُؤكل اللحم وحده. فالطريقة الكلاسيكية هي «السام»: قطعة لحم على ورقة خس أو بريلا مع صلصة السامجانغ والثوم والبصل الأخضر، تُطوى وتُؤكل بلقمة واحدة — وكلما كبرت اللقمة كان أطيب، كما تقول النكتة.\n\nصوت الشواء، وطقطقة الدهن، والجميع يمدّون أيديهم ليشووا ويلفّوا معًا — الشواء الكوري وجبة وطقس مبهج في آنٍ.',
    },
  },
  {
    id: 'kimchi-200',
    emoji: '🥬',
    accent: 'bg-orange-50',
    image: commons('Korea-Sokcho-Kkakdugi-Radish kimchi-01.jpg'),
    date: '2026-05-20',
    tag: 'food',
    title: {
      ko: '김치는 한 종류가 아니다 — 200가지의 얼굴',
      en: "Kimchi isn't just one thing — 200 kinds",
      ar: 'الكيمتشي ليس نوعًا واحدًا — 200 نوع',
    },
    excerpt: {
      ko: '배추·무·오이… 지역과 계절이 빚는 수백 가지',
      en: 'Cabbage, radish, cucumber — hundreds of kinds',
      ar: 'ملفوف وفجل وخيار — مئات الأنواع',
    },
    body: {
      ko: '많은 사람이 ‘김치=빨간 배추김치’라고 생각하지만, 김치의 세계는 훨씬 넓습니다. 무를 큼직하게 썬 깍두기, 어린 무를 통째 담그는 총각김치, 오이를 갈라 소를 넣은 오이소박이, 고춧가루 없이 담백하게 익히는 백김치까지 — 종류만 수백 가지예요.\n\n김치의 맛은 지역과 계절을 따라 변합니다. 추운 북쪽은 간을 싱겁게 해 시원하게, 더운 남쪽은 짜고 맵게 담가 오래 보관하죠. 봄엔 봄동, 여름엔 열무, 가을엔 배추로 — 제철 재료가 곧 김치가 됩니다.\n\n핵심은 결국 ‘손맛’입니다. 같은 레시피라도 누가 담그느냐에 따라 맛이 달라지기에, 집집마다 “우리 엄마 김치”가 최고라고 믿습니다.\n\n늦가을이면 가족이 모여 수십 포기를 한꺼번에 담그는 ‘김장’ 풍습이 있고, 이 공동체 문화는 유네스코 인류무형문화유산으로도 등재됐습니다. 한 포기의 김치 안에 계절과 지역, 그리고 가족의 시간이 담겨 있는 셈이죠.',
      en: 'Many picture kimchi as one thing — red cabbage kimchi — but the world of kimchi is far wider. Cubed-radish kkakdugi, whole young-radish chonggak, cucumber sobagi stuffed through a slit, mild chili-free white kimchi: there are hundreds of kinds.\n\nIts taste shifts with place and season. The cold north keeps it light and refreshing; the hot south makes it saltier and spicier to keep longer. Spring greens, summer young radish, autumn cabbage — whatever is in season becomes kimchi.\n\nThe heart of it is “sonmat,” the cook’s own touch. The same recipe tastes different by whose hands made it, so every household swears its mother’s kimchi is best.\n\nIn late autumn, families gather for “gimjang,” making dozens of heads at once — a communal tradition inscribed by UNESCO as Intangible Cultural Heritage. A single head of kimchi holds the season, the region, and a family’s time.',
      ar: 'يتخيّل كثيرون الكيمتشي شيئًا واحدًا — كيمتشي الملفوف الأحمر — لكن عالمه أوسع بكثير. «كاكدوغي» الفجل المكعّب، و«تشونغاك» الفجل الصغير كاملًا، و«سوباغي» الخيار المحشو من شقّ، والكيمتشي الأبيض اللطيف بلا فلفل: مئات الأنواع.\n\nيتغيّر مذاقه بالمكان والموسم. فالشمال البارد يجعله خفيفًا منعشًا، والجنوب الحار أكثر ملوحة وحرارة ليدوم أطول. خضار الربيع، وفجل الصيف، وملفوف الخريف — ما هو في موسمه يصير كيمتشي.\n\nوجوهره «سونمات»، أي لمسة الطاهي. فالوصفة نفسها تختلف بحسب من صنعها، لذا يقسم كل بيت أن كيمتشي أمّه هو الأفضل.\n\nوفي أواخر الخريف تجتمع العائلات لـ«الغيمجانغ»، فتحضّر عشرات الرؤوس دفعة واحدة — تقليد جماعي سجّلته اليونسكو تراثًا ثقافيًا. فرأس كيمتشي واحد يحمل الموسم والمنطقة ووقت العائلة.',
    },
  },
  {
    id: 'shared-stew',
    emoji: '🍲',
    accent: 'bg-amber-50',
    image: commons('Korean stew-Sundubu jjigae-05.jpg'),
    date: '2026-05-15',
    tag: 'culture',
    title: {
      ko: '찌개 하나를 같이 떠먹는 정(情)',
      en: 'Sharing one bubbling stew, together',
      ar: 'مشاركة وعاء حساء واحد',
    },
    excerpt: {
      ko: '가운데 끓는 뚝배기, 함께 나누는 한 끼',
      en: 'One bubbling pot in the middle, shared',
      ar: 'وعاء يغلي في المنتصف، يُشارَك',
    },
    body: {
      ko: '한국 식탁의 한가운데에는 종종 부글부글 끓는 찌개 한 그릇이 놓입니다. 그리고 여럿이 각자의 숟가락으로 그 한 그릇을 함께 떠먹죠. 처음 보는 사람에겐 낯설지만, 여기엔 ‘음식을 나눈다=마음을 나눈다’는 오랜 정서가 깔려 있습니다.\n\n된장찌개·김치찌개·순두부찌개는 한국인의 솔푸드입니다. 뚝배기에 끓여 식탁까지 보글거리는 채로 올라오는데, 밥 한 술에 찌개 국물을 얹으면 그 자체로 완전한 한 끼가 됩니다.\n\n다만 위생을 중시하는 요즘은 ‘앞접시(개인 그릇)’에 덜어 먹는 식당도 많아졌습니다. 함께 먹는 정겨움은 지키되, 각자 덜어 먹는 방식으로 변화한 거죠.\n\n뚝배기는 식탁에 올라온 뒤에도 한참 동안 펄펄 끓습니다. 멋모르고 곧장 입에 넣으면 깜짝 놀랄 만큼 뜨거우니, 한 김 식혀 천천히 즐기세요.',
      en: 'At the center of a Korean table you will often find a single pot of stew, bubbling away — and several people dipping their own spoons into that one bowl. It can feel unfamiliar, but it rests on an old sentiment: to share food is to share heart.\n\nDoenjang, kimchi, and sundubu jjigae are Korean soul food. Cooked in an earthen “ttukbaegi” and brought to the table still boiling, a spoon of rice topped with the broth is a complete meal on its own.\n\nMindful of hygiene, many restaurants now offer individual bowls to portion out from. The warmth of eating together stays; the method simply adapts.\n\nThat ttukbaegi keeps boiling long after it lands on the table. Dive straight in and you will be startled by the heat — let it cool a moment, then savor it slowly.',
      ar: 'في قلب المائدة الكورية ستجد غالبًا وعاء حساء واحدًا يغلي — وعدّة أشخاص يغمسون ملاعقهم في الوعاء نفسه. قد يبدو الأمر غريبًا، لكنه يقوم على شعور قديم: مشاركة الطعام مشاركة للقلب.\n\nدوينجانغ وكيمتشي وسوندوبو جيغيه هي «طعام الروح» الكوري. تُطهى في وعاء فخاري «توكبايغي» وتصل الطاولة وهي تغلي، وملعقة أرز فوقها المرق تصبح وجبة كاملة بذاتها.\n\nوحرصًا على النظافة، توفّر مطاعم كثيرة اليوم أوعية فردية للتقسيم. يبقى دفء الأكل معًا، وتتكيّف الطريقة فقط.\n\nويظل ذلك الوعاء يغلي طويلًا بعد وصوله. فإن سارعت إليه فاجأتك حرارته — دعه يبرد لحظة ثم تذوّقه على مهل.',
    },
  },
  {
    id: 'haejangguk',
    emoji: '🍜',
    accent: 'bg-red-50',
    image: commons('Haejangguk (hangover soup).jpg'),
    date: '2026-05-10',
    tag: 'culture',
    title: {
      ko: '숙취엔 해장국 — 술 마신 다음 날의 의식',
      en: 'Haejangguk: the morning-after ritual',
      ar: 'حساء الهيجانغ: طقس صباح اليوم التالي',
    },
    excerpt: {
      ko: '뜨끈한 국물 한 그릇으로 푸는 어제의 피로',
      en: 'A hot bowl that soothes yesterday',
      ar: 'وعاء ساخن يخفف تعب الأمس',
    },
    body: {
      ko: '전날 밤 과음했다면, 한국인은 다음 날 아침 약 대신 ‘해장국’을 찾습니다. ‘해장(解酲)’이란 글자 그대로 ‘술기운을 풀어준다’는 뜻이에요. 뜨끈한 국물과 밥 한 그릇이면 무겁던 속이 스르르 풀립니다.\n\n종류도 다양합니다. 시원한 콩나물해장국, 진한 뼈해장국(감자탕), 선지해장국, 황태해장국까지 — 지역과 취향에 따라 골라 먹습니다. 콩나물국엔 매콤한 청양고추를 넣어 얼큰하게 즐기기도 하죠.\n\n흥미로운 건 ‘해장 문화’ 자체입니다. 회식과 술자리가 잦은 한국에서, 다음 날의 해장은 거의 하나의 의식처럼 자리 잡았습니다. 그래서 도심 곳곳엔 24시간 영업하는 해장국집이 흔합니다.\n\n꼭 술을 마시지 않았더라도, 속이 출출하거나 추운 날엔 해장국 한 그릇이 그렇게 든든할 수 없습니다. 뜨거운 국물 앞에서 “아, 살겠다” 하는 그 순간이 바로 해장의 묘미예요.',
      en: 'After a heavy night, Koreans reach not for a pill but for “haejangguk.” “Haejang” literally means “to undo the drink.” A hot bowl of broth and rice, and the heavy stomach eases.\n\nThe varieties are many: refreshing bean-sprout, rich pork-bone (gamjatang), ox-blood seonji, dried-pollack hwangtae — chosen by region and taste. The bean-sprout version often gets a spicy cheongyang chili kick.\n\nWhat is striking is the “haejang” culture itself. In a country of frequent work dinners and drinking, the next-day recovery soup has become almost a ritual — which is why 24-hour haejang spots are common across the city.\n\nEven without a drop of alcohol, on a hungry or cold day a bowl of haejangguk is wonderfully comforting. That moment over the steaming broth when you sigh “ah, that hits the spot” — that is the whole point.',
      ar: 'بعد ليلة ثقيلة، لا يلجأ الكوريون إلى حبّة دواء بل إلى «هيجانغ‑غوك». و«هيجانغ» تعني حرفيًا «حلّ أثر الشراب». وعاء ساخن من المرق والأرز، فتهدأ المعدة الثقيلة.\n\nوأنواعه كثيرة: براعم الفاصوليا المنعش، وعظم الخنزير الغني (غامجاتانغ)، والـ«سونجي»، والبلوق المجفّف «هوانغتاي» — تُختار حسب المنطقة والذوق. وكثيرًا ما يُضاف لنسخة البراعم فلفل تشيونغيانغ الحار.\n\nواللافت هو ثقافة «الهيجانغ» نفسها. ففي بلد كثير العشاوات وجلسات الشرب، صار حساء التعافي في اليوم التالي أشبه بطقس — لذا تنتشر مطاعمه العاملة 24 ساعة في المدينة.\n\nوحتى دون أي كحول، في يوم جائع أو بارد يكون وعاء الهيجانغ‑غوك مريحًا بشكل رائع. تلك اللحظة فوق المرق المتصاعد حين تتنهّد «آه، هذا ما كنت أحتاجه» — هي بيت القصيد.',
    },
  },
  {
    id: 'metal-chopsticks',
    emoji: '🥢',
    accent: 'bg-neutral-100',
    image: commons('Cuchara y palitos coreanos.JPG'),
    date: '2026-05-04',
    tag: 'tips',
    title: {
      ko: '젓가락은 납작한 쇠젓가락',
      en: "Korea's flat metal chopsticks",
      ar: 'عيدان الطعام المعدنية المسطحة',
    },
    excerpt: {
      ko: '밥·국은 숟가락, 반찬은 젓가락 — 식탁의 작은 규칙',
      en: 'Spoon for rice and soup, chopsticks for sides',
      ar: 'الملعقة للأرز والحساء، والعيدان للأطباق',
    },
    body: {
      ko: '한국 식탁에 앉으면 가장 먼저 눈에 띄는 것이 ‘쇠수저’입니다. 나무나 플라스틱을 주로 쓰는 이웃 나라들과 달리, 한국은 납작한 ‘쇠젓가락’과 긴 ‘숟가락’을 한 벌로 씁니다. 이 둘을 합쳐 ‘수저’라고 부르죠.\n\n역할도 분명히 나뉩니다. 밥과 국은 숟가락으로 떠먹고, 반찬은 젓가락으로 집어 먹습니다. 국물 문화가 발달한 한국에서 숟가락이 늘 함께 놓이는 이유예요.\n\n금속 젓가락은 다루기가 살짝 까다롭습니다. 미끄러운 콩 한 알을 집어 올릴 수 있다면, 당신의 젓가락 실력은 이미 수준급이라는 농담도 있을 정도죠.\n\n작은 예절도 있습니다. 어른이 먼저 수저를 든 뒤 식사를 시작하고, 밥그릇은 손에 들지 않고 식탁에 둔 채 먹습니다. 사소해 보이지만, 이런 규칙을 알고 나면 한국에서의 식사가 한결 자연스럽고 즐거워집니다.',
      en: 'Sit at a Korean table and the first thing you notice is metal cutlery. Unlike neighbors who favor wood or plastic, Korea pairs flat “metal chopsticks” with a long “spoon” — together called “sujeo.”\n\nTheir roles are clearly split: spoon for rice and soup, chopsticks for the side dishes. In a cuisine rich with broths, that is why a spoon is always set alongside.\n\nMetal chopsticks take a little skill. There is a joke that if you can lift a single slippery bean, your chopstick game is already expert level.\n\nThere is small etiquette, too: begin after the eldest lifts their spoon, and keep the rice bowl on the table rather than in your hand. Minor as it sounds, knowing these makes dining in Korea feel far more natural and enjoyable.',
      ar: 'حين تجلس إلى مائدة كورية، أول ما يلفتك أدوات الطعام المعدنية. فخلافًا للجيران الذين يفضّلون الخشب أو البلاستيك، تجمع كوريا بين «عيدان معدنية» مسطحة و«ملعقة» طويلة — ويُسمّى الاثنان معًا «سوجيو».\n\nوأدوارها واضحة: الملعقة للأرز والحساء، والعيدان للأطباق الجانبية. وفي مطبخ غنيّ بالمرق، لذلك تُوضع الملعقة دائمًا إلى جانبها.\n\nوالعيدان المعدنية تتطلّب مهارة بسيطة. حتى إن هناك نكتة: إن استطعت رفع حبّة فاصوليا زلقة، فمهارتك في العيدان بلغت مستوى الخبراء.\n\nوهناك آداب صغيرة أيضًا: ابدأ بعد أن يرفع الأكبر سنًا ملعقته، وأبقِ وعاء الأرز على الطاولة لا في يدك. تبدو تفاصيل بسيطة، لكن معرفتها تجعل تناول الطعام في كوريا أكثر طبيعية ومتعة.',
    },
  },
];

export const HERO_ARTICLES = CURATION_ARTICLES.filter((a) => a.featured);
export const FEED_ARTICLES = CURATION_ARTICLES.filter((a) => !a.featured);
