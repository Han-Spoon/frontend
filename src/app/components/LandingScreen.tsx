import { ArrowRight, Languages, MessageSquareText, ScanLine, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/brand/han-spoon-logo.svg';
import type { Language } from '../App';
import { createTranslator, LANGUAGE_OPTIONS } from '../locales';

const HERO_IMAGE =
  'https://commons.wikimedia.org/wiki/Special:FilePath/Myeongdong%20night%20market%20seoul%202.jpg?width=1400';

export function LandingScreen({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
}) {
  const navigate = useNavigate();
  const t = createTranslator(language);

  return (
    <div className="relative h-dvh overflow-y-auto bg-soy-ink text-white">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-brand-green-900" />
        <img
          src={HERO_IMAGE}
          alt=""
          className="h-[64%] w-full object-cover object-[center_42%] opacity-95"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,31,23,.08)_0%,rgba(12,34,26,.08)_30%,rgba(14,37,28,.78)_59%,#12251d_76%,#12251d_100%)]" />
        <div className="absolute -end-20 bottom-28 size-64 rounded-full bg-brand-orange-500/20 blur-3xl" />
        <div className="absolute -start-24 bottom-0 size-72 rounded-full bg-brand-green-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-full flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between gap-3">
          <span className="inline-flex rounded-2xl bg-rice-white/95 px-3 py-2 shadow-lg backdrop-blur">
            <img
              src={logo}
              alt={t('한스푼', 'Han Spoon', 'هان سبون')}
              className="h-auto w-[108px]"
            />
          </span>

          <label className="relative flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-soy-ink/55 px-3 text-sm font-bold text-white shadow-lg backdrop-blur-md">
            <Languages className="size-4" aria-hidden="true" />
            <select
              aria-label={t('언어 선택', 'Choose language', 'اختر اللغة')}
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="appearance-none bg-transparent pe-4 outline-none"
            >
              {LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-soy-ink">
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute end-3 text-[10px] text-white/70">▾</span>
          </label>
        </header>

        <main className="mt-auto pt-[42vh]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[.14em] text-white/90 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-brand-orange-500" />
            YOUR TASTE, YOUR KOREA
          </div>

          <h1 className="max-w-[370px] whitespace-pre-line text-[38px] font-extrabold leading-[1.08] tracking-[-0.045em]">
            {t(
              '낯선 메뉴도,\n맛있는 발견으로.',
              'Turn an unfamiliar menu\ninto a delicious discovery.',
              'حوّل القائمة الجديدة\nإلى اكتشاف شهي.',
            )}
          </h1>
          <p className="mt-4 max-w-[350px] text-[15px] font-medium leading-6 text-white/72">
            {t(
              '메뉴판 한 장이면 번역부터 내 식단 확인, 식당에서 필요한 말까지 준비해드려요.',
              'One menu photo gives you translations, dietary guidance, and the words you need at the table.',
              'صورة واحدة للقائمة تمنحك الترجمة وإرشادات النظام الغذائي والعبارات التي تحتاجها.',
            )}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2" aria-label={t('한스푼 주요 기능', 'Han Spoon highlights', 'مزايا هان سبون')}>
            {[
              [ScanLine, t('메뉴 번역', 'Translate', 'ترجمة')],
              [ShieldCheck, t('식단 확인', 'Check', 'تحقق')],
              [MessageSquareText, t('직원 소통', 'Communicate', 'تواصل')],
            ].map(([Icon, label]) => {
              const FeatureIcon = Icon as typeof ScanLine;
              return (
                <div key={String(label)} className="rounded-[20px] border border-white/12 bg-white/[.08] p-3 backdrop-blur-md">
                  <FeatureIcon className="mb-2 size-4 text-[#8ad6b3]" aria-hidden="true" />
                  <p className="text-[11px] font-bold text-white/90">{String(label)}</p>
                </div>
              );
            })}
          </div>
        </main>

        <footer className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="group flex min-h-15 w-full items-center justify-between rounded-full bg-rice-white py-2 ps-6 pe-2 text-start font-extrabold text-soy-ink shadow-[0_18px_48px_rgba(0,0,0,.28)]"
          >
            <span>{t('한스푼 시작하기', 'Start with Han Spoon', 'ابدأ مع هان سبون')}</span>
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-primary text-white transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
              <ArrowRight className="size-5 rtl:rotate-180" aria-hidden="true" />
            </span>
          </button>
          <p className="mt-3 text-center text-[11px] font-medium text-white/55">
            {t(
              '계속하면 Google 계정으로 로그인할 수 있어요.',
              'Continue to sign in securely with Google.',
              'تابع لتسجيل الدخول بأمان باستخدام Google.',
            )}
          </p>
        </footer>
      </div>
    </div>
  );
}
