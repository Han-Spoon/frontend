import type { CurationArticle, CurationTag } from './curation';

// Original editorial drafts for the demonstration. New long-form translations use English fallback outside ko/en/ar.
const stories: {
  id: string;
  emoji: string;
  tag: CurationTag;
  ko: string;
  en: string;
  ar: string;
  introKo: string;
  introEn: string;
  introAr: string;
  bodyKo: string;
  bodyEn: string;
  bodyAr: string;
}[] = [
  {
    id: 'sauce-on-side',
    emoji: '🥣',
    tag: 'tips',
    ko: '소스는 따로, 취향은 가까이',
    en: 'Sauce on the side, your way',
    ar: 'الصلصة جانباً، حسب ذوقك',
    introKo: '작은 그릇 하나가 만들어주는 선택의 여유',
    introEn: 'A little bowl can give you more choice',
    introAr: 'وعاء صغير يمنحك حرية الاختيار',
    bodyKo:
      '처음 만나는 한식이라면 소스를 한 번에 섞기보다 조금씩 맛을 더해보세요. 비빔밥의 고추장이나 전을 찍어 먹는 간장을 작은 그릇에 받으면, 마지막 한 입까지 내 취향대로 즐길 수 있어요.\n\n“소스는 따로 주세요.” 짧은 한마디를 주문할 때 보여주세요. 이미 양념에 재운 메뉴는 분리가 어려울 수 있으니 조리 전에 물어보는 것이 좋아요.\n\n알레르기나 식단 제한이 있다면 소스뿐 아니라 육수, 고명, 조리도구도 따로 확인하세요. 소스를 빼는 것만으로 모든 재료가 제외되는 것은 아니에요.',
    bodyEn:
      'With an unfamiliar dish, try adding sauce a little at a time. A small bowl of gochujang beside bibimbap or dipping sauce beside a pancake lets you choose the flavor of every bite.\n\nShow this phrase when ordering: “소스는 따로 주세요.” It means “Please serve the sauce separately.” Ask before cooking, since a pre-marinated dish may not allow this change.\n\nIf you have dietary restrictions, ask about broth, garnishes and shared utensils as well. Removing a sauce does not establish that every ingredient you avoid has been removed.',
    bodyAr:
      'عند تجربة طبق جديد، أضف الصلصة تدريجياً. وعاء صغير بجانب البيبيمباب أو الفطيرة يمنحك التحكم بالمذاق.\n\nاعرض عند الطلب: «소스는 따로 주세요.» وتعني تقديم الصلصة منفصلة. اسأل قبل الطهي لأن الأطباق المتبلة مسبقاً قد لا تسمح بذلك.\n\nإذا كانت لديك قيود غذائية، اسأل أيضاً عن المرق والإضافات والأدوات المشتركة. إزالة الصلصة لا تعني إزالة جميع المكونات التي تتجنبها.',
  },
  {
    id: 'market-small-plates',
    emoji: '🏮',
    tag: 'culture',
    ko: '시장에서 시작하는 작은 한 입',
    en: 'Small bites at the market',
    ar: 'لقمات صغيرة في السوق',
    introKo: '다 먹어보기보다, 마음에 드는 한 가지부터',
    introEn: 'Start with one dish that catches your eye',
    introAr: 'ابدأ بطبق يلفت انتباهك',
    bodyKo:
      '시장에서는 냄새와 소리만으로도 여행 기분이 나요. 한 바퀴 천천히 걸으며 무엇을 파는지 먼저 살펴보고, 자리에 앉아 먹는 곳인지 포장하는 곳인지 확인해 보세요.\n\n“하나만 주세요.” 작은 양부터 주문하면 여러 음식을 부담 없이 발견할 수 있어요. 표시된 가격이 한 개 기준인지, 한 접시 기준인지도 함께 물어보세요.\n\n진열된 모양만으로 속재료를 알아내기는 어려워요. 주문 전에 내 식단 카드를 보여주고, 소스와 고명까지 확인하는 시간을 가져보세요.',
    bodyEn:
      'The aromas and sounds of a market are part of the trip. Walk around first and notice whether each stall offers seats or takeaway. Choose one thing you are curious about.\n\n“하나만 주세요” means “Just one, please.” Ask whether the displayed price is per piece or per plate before you order. A small portion leaves room for another discovery.\n\nAppearance does not tell you what is inside. Show your dietary card before ordering and ask about fillings, sauces and garnishes.',
    bodyAr:
      'روائح السوق وأصواته جزء من الرحلة. تجول أولاً وتأكد هل يقدم المكان مقاعد أم طعاماً للسفري.\n\nتعني «하나만 주세요» واحدة فقط من فضلك. تحقق هل السعر للقطعة أم للطبق قبل الطلب.\n\nشكل الطعام لا يكشف مكوناته. اعرض بطاقتك الغذائية واسأل عن الحشوة والصلصات والإضافات.',
  },
  {
    id: 'solo-table',
    emoji: '🪑',
    tag: 'restaurant',
    ko: '혼자여도 좋은 한국의 식탁',
    en: 'A table for one',
    ar: 'طاولة لشخص واحد',
    introKo: '혼밥을 편안하게 만드는 작은 주문 요령',
    introEn: 'Make a solo meal feel easy',
    introAr: 'اجعل وجبتك الفردية مريحة',
    bodyKo:
      '혼자 식사하는 시간을 여행의 작은 쉼표로 만들어보세요. 창가나 바 자리, 한 그릇 메뉴가 있는 식당은 메뉴를 고르기도 편해요.\n\n입구에서 손가락 하나를 펴고 “한 명이에요”라고 말해보세요. 메뉴에 2인 이상이라는 표시가 있다면 최소 주문 인원을 뜻할 수 있으니 확인하세요.\n\n먹은 뒤 메뉴를 기록해두면 다음 여행의 지도가 됩니다. 식당 이름을 연결하고 좋았던 점을 짧게 남겨보세요.',
    bodyEn:
      'Let a solo meal be a quiet pause in your trip. Counter seats, window seats and single-bowl menus can make choosing a meal simpler.\n\nHold up one finger and say “한 명이에요”: “One person.” If a menu says “2인 이상,” ask about the minimum party or order size.\n\nSave the menu afterward as a little map for your next trip. Link the restaurant and remember what made the visit enjoyable.',
    bodyAr:
      'اجعل الوجبة الفردية استراحة هادئة. قد تساعدك مقاعد النافذة والقوائم ذات الطبق الواحد على الاختيار.\n\nقل «한 명이에요» لشخص واحد. وإذا رأيت «2인 이상» فاسأل عن الحد الأدنى للطلب أو عدد الأشخاص.\n\nاحفظ القائمة بعد الوجبة واربط المطعم لتتذكر ما أحببته في زيارتك.',
  },
  {
    id: 'broth-question',
    emoji: '🍲',
    tag: 'food',
    ko: '국물 속 이야기를 물어보세요',
    en: 'Ask what is in the broth',
    ar: 'اسأل عما في المرق',
    introKo: '맑은 국물에도 저마다의 재료가 있어요',
    introEn: 'Even a clear broth has its own ingredients',
    introAr: 'حتى المرق الصافي له مكوناته',
    bodyKo:
      '국물은 한 그릇의 분위기를 결정해요. 같은 이름의 국수도 식당마다 육수의 재료와 맛이 달라질 수 있습니다. 채소가 눈에 띈다고 채소만으로 만든 국물인 것은 아니에요.\n\n“육수는 무엇으로 만들었나요?”라고 물어보세요. 직원이 잘 모르겠다고 답한다면 확인을 기다리거나, 재료를 더 명확히 설명할 수 있는 메뉴를 살펴보세요.\n\n한스푼의 주의 표시는 이 질문을 쉽게 시작하기 위한 안내예요. 포함 가능성은 해당 재료에 대한 정보이지, 먹어도 되는 확률이 아닙니다.',
    bodyEn:
      'Broth gives a bowl its character. Noodles with the same name can use different stock at different restaurants. Visible vegetables do not establish a vegetable-only broth.\n\nAsk “육수는 무엇으로 만들었나요?”: “What is the broth made from?” If staff are unsure, wait for clarification or look at a dish whose ingredients they can explain.\n\nA caution label helps you start this conversation. Ingredient likelihood describes a possible ingredient, not a probability that a meal is safe to eat.',
    bodyAr:
      'يمنح المرق الطبق طابعه. وقد تستخدم مطاعم مختلفة أنواع مرق مختلفة للاسم نفسه. ظهور الخضروات لا يعني أن المرق نباتي بالكامل.\n\nاسأل «육수는 무엇으로 만들었나요؟» أي مم يتكون المرق. إذا لم يعرف الموظف، انتظر التوضيح أو اختر طبقاً يمكن شرح مكوناته.\n\nيساعد التنبيه على بدء هذا الحوار. احتمال وجود مكوّن ليس احتمال سلامة تناول الوجبة.',
  },
  {
    id: 'seongsu-walk',
    emoji: '🌿',
    tag: 'culture',
    ko: '성수, 산책과 한 끼 사이',
    en: 'A stroll and a meal in Seongsu',
    ar: 'نزهة ووجبة في سونغسو',
    introKo: '목적지를 빽빽하게 채우지 않는 오후',
    introEn: 'Leave a little room in your afternoon',
    introAr: 'اترك مساحة في برنامجك',
    bodyKo:
      '오늘은 식당 하나와 산책 한 번만 정해보세요. 방문하고 싶은 곳을 먼저 찜해두면 걷다가 배가 고파졌을 때 다시 검색할 필요가 없어요.\n\n식당을 고를 때는 사진뿐 아니라 나와 같은 프로필의 경험도 읽어보세요. “식단을 설명하기 편했다”는 후기는 낯선 곳에서 대화를 시작하는 데 도움이 됩니다.\n\n실제 운영 시간과 메뉴는 방문 전에 식당에 확인하세요. 여유 있는 일정은 계획에 없던 발견도 받아들일 수 있게 해줘요.',
    bodyEn:
      'Plan one meal and one walk today. Save a place in advance so you can return to it when you get hungry instead of starting a new search.\n\nLook beyond the photos and read experiences from people with similar dietary needs. Knowing that someone found it easy to explain their preferences can help you start a conversation.\n\nConfirm opening hours and menus directly before visiting. Leaving space in the day also leaves space for an unexpected discovery.',
    bodyAr:
      'خطط لوجبة واحدة ونزهة واحدة اليوم. احفظ المكان مسبقاً لتعود إليه عندما تجوع.\n\nانظر إلى تجارب أشخاص باحتياجات غذائية مماثلة إلى جانب الصور. قد يساعدك سهولة تواصلهم على بدء الحوار.\n\nتحقق من ساعات العمل والقائمة قبل الزيارة واترك وقتاً للاكتشافات غير المتوقعة.',
  },
  {
    id: 'busan-seaside',
    emoji: '🌊',
    tag: 'culture',
    ko: '부산에서는 바다 곁 한 끼',
    en: 'A meal by the sea in Busan',
    ar: 'وجبة قرب البحر في بوسان',
    introKo: '풍경도 취향도 함께 고르는 여행',
    introEn: 'Choose the view and the food you enjoy',
    introAr: 'اختر المنظر والطعام الذي تحبه',
    bodyKo:
      '부산 여행의 한 끼는 풍경과 함께 기억될 수 있어요. 바다를 걷기 전이나 후에 잠시 앉을 곳을 골라보세요. 해산물을 먹지 않더라도 여행의 맛을 발견할 방법은 여러 가지예요.\n\n지역을 부산으로 선택하고 식당의 메뉴 유형과 내 식단 관련 후기를 살펴보세요. 실제 메뉴와 조리 환경은 식당마다 다르니 현장에서 다시 확인하세요.\n\n마음에 든 메뉴는 라이킷으로 남겨보세요. 풍경 사진과 함께 기억할 또 하나의 여행 취향이 됩니다.',
    bodyEn:
      'A meal in Busan can become part of the scenery you remember. Pick a place to rest before or after a seaside walk. You can discover food you enjoy even if seafood is not for you.\n\nChoose Busan in the area list and explore restaurant categories and dietary feedback. Confirm actual menus and preparation with each restaurant.\n\nLike a menu you enjoyed. Alongside your photos, it becomes another reminder of your travel tastes.',
    bodyAr:
      'قد تصبح الوجبة في بوسان جزءاً من المنظر الذي تتذكره. اختر مكاناً للراحة قبل المشي قرب البحر أو بعده، حتى إذا كنت لا تأكل المأكولات البحرية.\n\nاختر بوسان واستكشف فئات المطاعم وآراء الزوار، ثم تحقق من القائمة والتحضير في المكان.\n\nضع إعجاباً للطبق الذي أحببته ليصبح تذكاراً آخر من الرحلة.',
  },
  {
    id: 'spice-conversation',
    emoji: '🌶️',
    tag: 'tips',
    ko: '덜 맵게, 더 즐겁게',
    en: 'Less heat, more enjoyment',
    ar: 'حرارة أقل، متعة أكثر',
    introKo: '맵기의 기준은 대화로 맞춰가요',
    introEn: 'Find your spice level through conversation',
    introAr: 'حدد مستوى الحرارة بالحوار',
    bodyKo:
      '같은 “조금 매워요”도 사람마다 다르게 느껴집니다. 주문할 때 매운 음식을 잘 먹지 못한다고 먼저 말해보세요.\n\n“고추는 빼고, 소스는 따로 주세요.” 변경이 가능한 메뉴에서는 이렇게 구체적으로 요청하는 편이 좋아요. 이미 완성된 양념은 조절하기 어려울 수 있습니다.\n\n식사 후에는 맵기 자체에 대한 단정 대신, 덜 맵게 요청을 전달하기 편했는지 기록해보세요. 다음 사람에게 더 구체적인 도움이 됩니다.',
    bodyEn:
      '“A little spicy” means something different to everyone. Tell staff early if you prefer mild food.\n\nTry “고추는 빼고, 소스는 따로 주세요”: “No chili, and sauce separately, please.” A specific request helps when the dish can be changed. Premixed seasoning may not be adjustable.\n\nAfterward, record whether it was easy to communicate the request instead of declaring a universal spice level. That is more useful to the next diner.',
    bodyAr:
      'تختلف عبارة حار قليلاً بين الأشخاص. أخبر الموظف مبكراً إن كنت تفضل الطعام الخفيف.\n\nاطلب «고추는 빼고, 소스는 따로 주세요» أي بدون فلفل والصلصة منفصلة. قد لا يمكن تعديل التتبيلة الجاهزة.\n\nسجل بعد الوجبة سهولة توصيل طلبك، بدلاً من تعميم مستوى الحرارة على الجميع.',
  },
  {
    id: 'banchan-questions',
    emoji: '🥬',
    tag: 'food',
    ko: '작은 반찬, 하나씩 알아가기',
    en: 'Get to know your banchan',
    ar: 'تعرّف على الأطباق الجانبية',
    introKo: '한 상의 작은 그릇에도 이름이 있어요',
    introEn: 'Every little plate has a story',
    introAr: 'لكل طبق صغير قصة',
    bodyKo:
      '반찬이 여러 개 놓이면 한 가지씩 이름을 물어보세요. 나물, 무침, 절임처럼 조리법을 알게 되면 낯선 식탁이 조금 가까워집니다.\n\n“이 반찬은 무엇인가요?” 처음 만나는 재료를 알아가는 좋은 질문이에요. 리필이 가능한지, 추가 금액이 있는지도 식당에 확인하세요.\n\n작은 반찬도 소스나 양념에 다른 재료가 들어갈 수 있어요. 주메뉴만 확인하고 끝내지 말고, 실제로 먹을 반찬에도 식단 조건을 전달해 주세요.',
    bodyEn:
      'When several side dishes arrive, learn their names one at a time. Knowing whether something is seasoned, pickled or dressed brings an unfamiliar table closer.\n\nAsk “이 반찬은 무엇인가요?”: “What is this side dish?” Ask the restaurant whether refills are available and whether they cost extra.\n\nSmall plates can also contain ingredients in their dressings and seasoning. Share your dietary needs for the side dishes you plan to eat, not just the main dish.',
    bodyAr:
      'تعرف على أسماء الأطباق الجانبية واحداً تلو الآخر. معرفة طريقة تحضيرها تقربك من المائدة.\n\nاسأل «이 반찬은 무엇인가요؟» عن اسم الطبق، وتحقق من إمكانية إعادة تعبئته وتكلفتها.\n\nقد تحتوي التتبيلات على مكونات أخرى. وضح احتياجاتك للأطباق الجانبية أيضاً، وليس للطبق الرئيسي فقط.',
  },
  {
    id: 'cafe-pause',
    emoji: '☕',
    tag: 'restaurant',
    ko: '카페에서 쉬어가는 한 페이지',
    en: 'A café pause in your day',
    ar: 'استراحة مقهى في يومك',
    introKo: '커피보다 먼저 고르는 오늘의 속도',
    introEn: 'Choose a slower pace before your coffee',
    introAr: 'اختر إيقاعاً أهدأ قبل القهوة',
    bodyKo:
      '낯선 동네를 오래 걸었다면 카페에서 다음 일정을 천천히 정해보세요. 방문하고 싶은 식당을 저장하거나 방금 먹은 메뉴를 기록하는 시간으로도 좋아요.\n\n음료 메뉴에서는 우유 변경, 시럽, 토핑을 따로 물어볼 수 있어요. “우유를 바꿀 수 있나요?”라고 보여주고 가능한 선택지를 확인하세요.\n\n식단 제한이 있다면 변경 가능한 재료와 공용 장비 사용 여부를 함께 확인하세요. 이름이 비슷해도 음료의 구성은 매장마다 다를 수 있어요.',
    bodyEn:
      'After a long walk, a café can be a place to plan slowly. Save a restaurant for later or write down the menu you just tried.\n\nAsk separately about milk options, syrups and toppings. Show “우유를 바꿀 수 있나요?”: “Can the milk be changed?” Then check which choices are available.\n\nFor dietary restrictions, ask about both ingredient substitutions and shared equipment. Drinks with similar names can be prepared differently at each café.',
    bodyAr:
      'بعد المشي الطويل، استرح في مقهى وخطط بهدوء. احفظ مطعماً لوقت لاحق أو سجل وجبتك السابقة.\n\nاسأل عن خيارات الحليب والشراب والإضافات. «우유를 바꿀 수 있나요؟» تعني هل يمكن تغيير الحليب.\n\nإذا كانت لديك قيود غذائية، تحقق من البدائل والأجهزة المشتركة. قد يختلف تحضير المشروب بين المقاهي.',
  },
  {
    id: 'halal-conversation',
    emoji: '💬',
    tag: 'tips',
    ko: '내 식단을 설명하는 첫 문장',
    en: 'The first sentence about your diet',
    ar: 'الجملة الأولى عن نظامك الغذائي',
    introKo: '서로 이해하는 주문은 짧은 대화에서 시작해요',
    introEn: 'A thoughtful order starts with a short conversation',
    introAr: 'يبدأ الطلب الواضح بحوار قصير',
    bodyKo:
      '할랄이나 채식처럼 식단의 이름만으로 모든 세부 기준이 전달되지는 않을 수 있어요. 내가 피하는 재료와 확인하고 싶은 내용을 함께 보여주는 것이 도움이 됩니다.\n\n한스푼의 식단 전달 카드에서 내 프로필을 확인한 뒤 직원에게 보여주세요. 사용 재료, 육수와 소스, 조리 방식에 대해 필요한 질문을 하나씩 이어가세요.\n\n다른 방문자의 좋은 경험이 인증을 대신하지는 않아요. 인증이 필요한 경우에는 식당이 제공하는 정보를 직접 확인하고, 불분명한 항목은 다시 물어보세요.',
    bodyEn:
      'A label such as halal or vegetarian may not communicate all of your personal requirements. Show the ingredients you avoid and the questions you want answered.\n\nCheck your dietary communication card before showing it to staff. Ask about ingredients, broth, sauce and preparation one question at a time.\n\nA positive experience from another diner is not a certification. If you require certification, check the information supplied by the restaurant and clarify anything uncertain.',
    bodyAr:
      'قد لا يكفي اسم النظام مثل الحلال أو النباتي لتوضيح جميع احتياجاتك. اعرض المكونات التي تتجنبها وأسئلتك المحددة.\n\nراجع بطاقتك الغذائية قبل عرضها على الموظف، واسأل تدريجياً عن المكونات والمرق والصلصة والتحضير.\n\nالتجربة الإيجابية لزائر آخر ليست شهادة اعتماد. تحقق من المعلومات التي يقدمها المطعم واطلب توضيح أي نقطة غير مؤكدة.',
  },
  {
    id: 'menu-memory',
    emoji: '📖',
    tag: 'tips',
    ko: '맛있는 기억을 모으는 방법',
    en: 'Collect your food memories',
    ar: 'اجمع ذكريات الطعام',
    introKo: '이름을 잊기 전에, 오늘의 한 끼를 기록해요',
    introEn: 'Save today’s meal before its name slips away',
    introAr: 'احفظ وجبة اليوم قبل أن تنسى اسمها',
    bodyKo:
      '사진 속 메뉴가 무엇이었는지 기억나지 않을 때가 있어요. 스캔 결과를 기록해두면 한글 이름과 번역, 내가 확인했던 내용을 다시 볼 수 있습니다.\n\n다시 만나고 싶은 메뉴에는 하트를 눌러주세요. 식당을 연결하면 방문한 곳의 기록이 되고, 식당을 몰라도 메뉴 스캔으로 남길 수 있어요.\n\n피드백은 직접 경험한 조건만 선택해주세요. 짧더라도 구체적인 기록이 다음 방문과 다른 여행자의 선택에 도움이 됩니다.',
    bodyEn:
      'Sometimes a photo survives but the name of the dish does not. Save a scan to revisit its Korean name, translation and the details you checked.\n\nTap the heart on a menu you want to remember. Link a restaurant to keep a visit record, or save only the menu if you do not know the place.\n\nWhen leaving feedback, select only the preferences you actually discussed. A small, specific memory can help both your next visit and another traveler.',
    bodyAr:
      'قد تبقى الصورة بينما تنسى اسم الطبق. احفظ المسح لتعود إلى الاسم الكوري والترجمة والتفاصيل التي تحققت منها.\n\nاضغط القلب للطبق الذي تود تذكره. اربط المطعم لحفظ الزيارة، أو احفظ القائمة وحدها إذا لم تعرف المكان.\n\nاختر في رأيك فقط ما جربته فعلاً. قد تساعد ذكرى صغيرة ومحددة زيارتك القادمة ومسافراً آخر.',
  },
  {
    id: 'ordering-rhythm',
    emoji: '🔔',
    tag: 'restaurant',
    ko: '주문부터 계산까지, 천천히',
    en: 'From ordering to paying',
    ar: 'من الطلب إلى الدفع',
    introKo: '낯선 식당의 리듬을 익히는 세 가지 질문',
    introEn: 'Three questions to find your way at the table',
    introAr: 'ثلاثة أسئلة لتعرف طريقة المطعم',
    bodyKo:
      '자리에 앉았는데 어떻게 주문해야 할지 모르겠다면 “주문은 어디서 하나요?”라고 물어보세요. 직원에게 주문하거나, 카운터나 테이블의 기기를 이용하는 등 방식이 다를 수 있어요.\n\n식단 관련 질문은 결제 전에 전달하는 편이 좋아요. 메뉴를 바꿔야 할 때 서로 편하게 조정할 수 있습니다.\n\n계산할 때는 “계산은 어디서 하나요?”라고 물어보세요. 인식된 원화 가격과 환산 금액은 예산을 가늠하는 데 쓰고, 최종 결제 금액은 매장에서 확인하세요.',
    bodyEn:
      'If you are seated but unsure how to order, ask “주문은 어디서 하나요?”: “Where do I order?” The restaurant may use staff, a counter or a tabletop device.\n\nRaise dietary questions before paying. If you need a different dish, it is easier to adjust the order at that point.\n\nWhen finished, ask “계산은 어디서 하나요?”: “Where do I pay?” Use recognized KRW prices and converted amounts to plan your budget, and confirm the final bill at the restaurant.',
    bodyAr:
      'إذا لم تعرف طريقة الطلب، اسأل «주문은 어디서 하나요؟». قد يكون الطلب عبر الموظف أو الشباك أو جهاز على الطاولة.\n\nاطرح الأسئلة الغذائية قبل الدفع لتسهيل تغيير الطلب عند الحاجة.\n\nفي النهاية اسأل «계산은 어디서 하나요؟» عن مكان الدفع. استخدم الأسعار المحولة للتقدير وتحقق من الفاتورة النهائية في المطعم.',
  },
];

export const EXTRA_CURATION_ARTICLES: CurationArticle[] = stories.map(
  (story, index) => ({
    id: story.id,
    emoji: story.emoji,
    tag: story.tag,
    accent: 'bg-brand-green-50',
    date: '2026-09-10',
    image: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="${index % 2 ? '#e4eadf' : '#f3e7da'}"/><circle cx="660" cy="60" r="240" fill="#176449" opacity=".08"/><circle cx="180" cy="400" r="230" fill="#d86632" opacity=".07"/><circle cx="400" cy="225" r="130" fill="#fffdf9"/><text x="400" y="260" text-anchor="middle" font-size="100">${story.emoji}</text></svg>`)}`,
    title: { ko: story.ko, en: story.en, ar: story.ar },
    excerpt: { ko: story.introKo, en: story.introEn, ar: story.introAr },
    body: { ko: story.bodyKo, en: story.bodyEn, ar: story.bodyAr },
  }),
);
