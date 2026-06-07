import { User } from 'lucide-react';
import type { Language } from '../App';
import type { LocalizedText } from '../i18n';
import { BottomNav } from './BottomNav';

interface CurationScreenProps {
  language: Language;
  onMyPage: () => void;
}

interface CurationItem {
  emoji: string;
  title: LocalizedText;
  description: LocalizedText;
}

interface CurationCategory {
  key: string;
  title: LocalizedText;
  items: CurationItem[];
}

const CATEGORIES: CurationCategory[] = [
  {
    key: 'korean-food',
    title: { ko: '한식 소개', en: 'Korean Food', ar: 'الطعام الكوري' },
    items: [
      {
        emoji: '🍚',
        title: { ko: '비빔밥', en: 'Bibimbap', ar: 'بيبيمباب' },
        description: {
          ko: '밥 위에 나물·고기·계란을 올리고 고추장에 비벼 먹는 대표 한식이에요.',
          en: 'Rice topped with vegetables, meat, and egg, mixed with red chili paste.',
          ar: 'أرز مع الخضار واللحم والبيض، يُخلط مع معجون الفلفل الأحمر.',
        },
      },
      {
        emoji: '🍲',
        title: { ko: '된장찌개', en: 'Doenjang Jjigae', ar: 'حساء الدوينجانغ' },
        description: {
          ko: '발효 콩으로 만든 된장을 푼 구수한 찌개. 멸치 육수가 들어갈 수 있어요.',
          en: 'A savory stew made with fermented soybean paste; may contain anchovy broth.',
          ar: 'حساء غني بمعجون فول الصويا المخمّر؛ قد يحتوي على مرق الأنشوجة.',
        },
      },
      {
        emoji: '🥩',
        title: { ko: '삼겹살', en: 'Samgyeopsal', ar: 'سامغيوبسال' },
        description: {
          ko: '두툼한 삼겹살을 직접 구워 쌈채소에 싸 먹는 인기 메뉴예요.',
          en: 'Thick pork belly grilled at the table and wrapped in lettuce.',
          ar: 'لحم خاصرة الخنزير المشوي على الطاولة ويُلف بأوراق الخس.',
        },
      },
    ],
  },
  {
    key: 'vegan',
    title: { ko: '비건 음식', en: 'Vegan Food', ar: 'طعام نباتي' },
    items: [
      {
        emoji: '🥬',
        title: { ko: '나물비빔밥', en: 'Vegetable Bibimbap', ar: 'بيبيمباب الخضار' },
        description: {
          ko: '계란과 고기를 빼고 나물만으로 즐기는 비건 비빔밥. 고추장 대신 간장을 요청해 보세요.',
          en: 'Bibimbap with only vegetables — ask for soy sauce instead of chili paste to keep it vegan.',
          ar: 'بيبيمباب بالخضار فقط — اطلب صلصة الصويا بدل معجون الفلفل ليبقى نباتيًا.',
        },
      },
      {
        emoji: '🍄',
        title: { ko: '버섯전골', en: 'Mushroom Hot Pot', ar: 'وعاء الفطر الساخن' },
        description: {
          ko: '다양한 버섯과 채소를 끓여 먹는 전골. 고기 육수 여부를 확인하세요.',
          en: 'A hot pot of assorted mushrooms and vegetables; check whether meat broth is used.',
          ar: 'وعاء ساخن من الفطر والخضار؛ تحقق إن كان يحتوي على مرق اللحم.',
        },
      },
    ],
  },
  {
    key: 'allergy',
    title: { ko: '알레르기와 음식', en: 'Allergies & Food', ar: 'الحساسية والطعام' },
    items: [
      {
        emoji: '🦐',
        title: { ko: '갑각류 주의', en: 'Shellfish Caution', ar: 'تنبيه المحار' },
        description: {
          ko: '해물파전, 해물탕 등에는 새우·게가 들어가요. "갑각류 빼주세요"라고 요청하세요.',
          en: 'Seafood pancakes and stews contain shrimp or crab. Ask to leave out shellfish.',
          ar: 'فطائر ومرق البحر تحتوي على الروبيان أو السلطعون. اطلب استبعاد المحار.',
        },
      },
      {
        emoji: '🥜',
        title: { ko: '견과류 주의', en: 'Nut Caution', ar: 'تنبيه المكسرات' },
        description: {
          ko: '냉면 고명이나 일부 소스에 땅콩·호두가 들어갈 수 있어요.',
          en: 'Cold noodle toppings and some sauces may contain peanuts or walnuts.',
          ar: 'قد تحتوي إضافات النودلز الباردة وبعض الصلصات على الفول السوداني أو الجوز.',
        },
      },
      {
        emoji: '🥚',
        title: { ko: '계란 주의', en: 'Egg Caution', ar: 'تنبيه البيض' },
        description: {
          ko: '비빔밥, 김밥, 전 등에 계란이 자주 사용돼요. "계란 빼주세요"가 유용해요.',
          en: 'Egg is common in bibimbap, gimbap, and jeon. "No egg, please" is handy.',
          ar: 'البيض شائع في البيبيمباب والغيمباب والجون. عبارة "بدون بيض" مفيدة.',
        },
      },
    ],
  },
];

export function CurationScreen({ language, onMyPage }: CurationScreenProps) {
  const t = (ko: string, en: string, ar: string) => (
    language === 'ko' ? ko : language === 'ar' ? ar : en
  );

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="h-14 border-b border-neutral-200 flex items-center justify-between px-5 flex-shrink-0">
        <span className="font-semibold text-neutral-900">{t('큐레이션', 'Curation', 'مقالات')}</span>
        <button
          onClick={onMyPage}
          className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
        >
          <User className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
        {CATEGORIES.map((category) => (
          <section key={category.key}>
            <h2 className="text-base font-semibold text-neutral-900 mb-3">{category.title[language]}</h2>
            <div className="space-y-3">
              {category.items.map((item) => (
                <div
                  key={item.title.en}
                  className="flex gap-3 p-4 rounded-2xl border border-neutral-200 bg-white"
                >
                  <span className="text-2xl leading-none">{item.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-900 mb-1">{item.title[language]}</div>
                    <p className="text-xs text-neutral-600 leading-relaxed">{item.description[language]}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <BottomNav language={language} />
    </div>
  );
}
