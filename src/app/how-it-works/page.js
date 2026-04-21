'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import {
  ShoppingCart, Package, Users, ArrowRight, Check, X, Gift,
  Search, Bell, TrendingUp, Store, Phone, MessageCircle, Zap,
} from 'lucide-react';

const ROLES = [
  { id: 'client', emoji: '🛒', labelRu: 'Для клиента', labelKg: 'Кардарга', color: 'blue' },
  { id: 'supplier', emoji: '📦', labelRu: 'Для поставщика', labelKg: 'Жеткирүүчүгө', color: 'slate' },
  { id: 'agent', emoji: '🤝', labelRu: 'Для агента', labelKg: 'Агентке', color: 'green' },
];

export default function HowItWorksPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [role, setRole] = useState('client');

  const current = CONTENT[role];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            {isRu ? 'Как работает Arzaman' : 'Arzaman кантип иштейт'}
          </h1>
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto">
            {isRu
              ? 'B2B маркетплейс Кыргызстана — поставщики, магазины, агенты на одной платформе'
              : 'Кыргызстандын B2B маркетплейси — жеткирүүчүлөр, дүкөндөр жана агенттер бир платформада'}
          </p>

          {/* Переключатель ролей */}
          <div className="mt-6 md:mt-8 inline-flex bg-white/10 backdrop-blur rounded-2xl p-1.5 flex-wrap gap-1 justify-center">
            {ROLES.map(r => (
              <button key={r.id} onClick={() => setRole(r.id)}
                className={`px-4 md:px-6 py-2.5 rounded-xl text-sm md:text-base font-semibold transition-all ${
                  role === r.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}>
                <span className="text-lg mr-1">{r.emoji}</span>
                {isRu ? r.labelRu : r.labelKg}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Узнали себя? (боли) */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-red-100 text-red-700 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider">
            {isRu ? 'Знакомо?' : 'Тааныш?'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
            {isRu ? 'Узнали себя?' : 'Өзүңүздү таанып жатасызбы?'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {current.pains[isRu ? 'ru' : 'kg'].map((pain, i) => (
            <div key={i} className="bg-white border-2 border-red-100 rounded-2xl p-5 flex items-start gap-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <X size={20} className="text-red-600" />
              </div>
              <p className="text-gray-800 font-medium leading-relaxed">{pain}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Мы решили это */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-14 bg-gradient-to-b from-green-50 to-white rounded-3xl mx-4">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider">
            {isRu ? 'Мы решили это' : 'Биз муну чечтик'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
            {isRu ? 'Как Arzaman помогает' : 'Arzaman кантип жардам берет'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {current.solutions[isRu ? 'ru' : 'kg'].map((s, i) => (
            <div key={i} className="bg-white border-2 border-green-100 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
                <Check size={20} className="text-white" />
              </div>
              <p className="text-gray-800 font-medium leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Как это работает — шаги */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider">
            {isRu ? 'Пошагово' : 'Кадам-кадам'}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3">
            {isRu ? 'Как начать' : 'Кантип баштоо'}
          </h2>
        </div>

        <div className="space-y-4">
          {current.steps[isRu ? 'ru' : 'kg'].map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{step.icon}</span>
                  <h3 className="text-base md:text-lg font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Цифры / выгода */}
      <section className="max-w-4xl mx-auto px-4 py-10 md:py-14">
        <div className={`bg-gradient-to-br ${current.color} rounded-3xl p-6 md:p-10 text-white`}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
            {isRu ? 'Что вы получаете' : 'Сиз эмне аласыз'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {current.numbers.map((n, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-5xl font-extrabold mb-1">{n.value}</div>
                <div className="text-xs md:text-sm text-white/80">{isRu ? n.labelRu : n.labelKg}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-10 md:py-14 text-center">
        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          {isRu ? 'Готовы начать?' : 'Баштоого даярсызбы?'}
        </h2>
        <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-lg">
          {isRu ? current.ctaDescRu : current.ctaDescKg}
        </p>
        <Link href={current.ctaHref}
          className={`inline-flex items-center gap-2 px-6 md:px-10 py-3 md:py-4 ${current.ctaColor} text-white rounded-2xl font-bold text-base md:text-lg hover:shadow-2xl transition-all hover:scale-105`}>
          {isRu ? current.ctaBtnRu : current.ctaBtnKg} <ArrowRight size={20} />
        </Link>

        {/* Поделиться */}
        <div className="mt-10 bg-gray-100 rounded-2xl p-5 md:p-6">
          <p className="text-sm text-gray-600 mb-3">
            {isRu ? '📤 Поделитесь этой страницей:' : '📤 Бул бетти бөлүшүңүз:'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <ShareButton platform="whatsapp" lang={lang} />
            <ShareButton platform="telegram" lang={lang} />
            <ShareButton platform="copy" lang={lang} />
          </div>
        </div>
      </section>
    </div>
  );
}

function ShareButton({ platform, lang }) {
  const isRu = lang === 'ru';
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/mama-marketplace/how-it-works`
    : 'https://cursorgenesis.github.io/mama-marketplace/how-it-works';
  const text = isRu
    ? 'Arzaman — B2B маркетплейс Кыргызстана. Посмотрите как работает:'
    : 'Arzaman — Кыргызстандын B2B маркетплейси. Кантип иштээрин көрүңүз:';

  const handlers = {
    whatsapp: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'),
    telegram: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'),
    copy: () => { navigator.clipboard.writeText(url); alert(isRu ? 'Ссылка скопирована' : 'Шилтеме көчүрүлдү'); },
  };

  const labels = {
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    copy: isRu ? 'Копировать' : 'Көчүрүү',
  };

  const colors = {
    whatsapp: 'bg-green-500 hover:bg-green-600',
    telegram: 'bg-blue-500 hover:bg-blue-600',
    copy: 'bg-slate-700 hover:bg-slate-800',
  };

  return (
    <button onClick={handlers[platform]}
      className={`${colors[platform]} text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors`}>
      {labels[platform]}
    </button>
  );
}

const CONTENT = {
  client: {
    color: 'from-blue-600 to-blue-900',
    pains: {
      ru: [
        'Агент не пришёл, а товар нужен срочно',
        'Только открываете магазин — не знаете всех поставщиков',
        'Хочется быстро заказать, а не тратить день на звонки',
        'Не знаешь когда приедет заказ — ждёшь весь день',
      ],
      kg: [
        'Агент келген жок, бирок товар тез керек',
        'Дүкөндү жаңы ачасыз — бардык жеткирүүчүлөрдү билбейсиз',
        'Тез заказ кылгыңыз келет, чалуу үчүн күнүңүздү коротпой',
        'Заказ качан келерин билбейсиз — күн бою күтөсүз',
      ],
    },
    solutions: {
      ru: [
        'Заказ за 1 минуту через платформу',
        'Все поставщики в одном месте — сравниваешь и выбираешь',
        'Заказывай и участвуй в розыгрышах призов',
        'Видно дату доставки сразу — не нужно звонить',
      ],
      kg: [
        'Платформа аркылуу 1 мүнөттө заказ',
        'Бардык жеткирүүчүлөр бир жерде — салыштырып тандайсыз',
        'Заказ кыл жана сыйлык розыгрыштарына катыш',
        'Жеткирүү күнү дароо көрүнөт — чалуунун кереги жок',
      ],
    },
    steps: {
      ru: [
        { icon: '📱', title: 'Регистрация за 30 секунд', desc: 'Укажите имя, телефон, город — один раз и навсегда' },
        { icon: '🔍', title: 'Выберите товары', desc: 'Каталог с сотнями позиций от проверенных поставщиков' },
        { icon: '🛒', title: 'Добавьте в корзину', desc: 'Увидите ближайшую дату доставки автоматически' },
        { icon: '✅', title: 'Отправьте заказ', desc: 'Поставщик получит уведомление и свяжется для подтверждения' },
        { icon: '🎁', title: 'Получите монетки', desc: '1 монетка за каждые 500 сом — участвуете в розыгрышах призов' },
      ],
      kg: [
        { icon: '📱', title: '30 секундда катталуу', desc: 'Аты, телефон, шаар — бир жолу жана түбөлүк' },
        { icon: '🔍', title: 'Товарларды тандаңыз', desc: 'Текшерилген жеткирүүчүлөрдөн жүздөгөн позициялар' },
        { icon: '🛒', title: 'Корзинага кошуңуз', desc: 'Жакынкы жеткирүү күнүн автоматтык көрөсүз' },
        { icon: '✅', title: 'Заказды жөнөтүңүз', desc: 'Жеткирүүчү билдирүү алып, байланышат' },
        { icon: '🎁', title: 'Монеталарды алыңыз', desc: 'Ар 500 сом үчүн 1 монета — сыйлык розыгрыштарына катышасыз' },
      ],
    },
    numbers: [
      { value: '1 мин', labelRu: 'На заказ', labelKg: 'Бир заказга' },
      { value: '0 сом', labelRu: 'Для клиента', labelKg: 'Кардар үчүн' },
      { value: '50+', labelRu: 'Поставщиков', labelKg: 'Жеткирүүчү' },
      { value: '🎁', labelRu: 'Розыгрыши', labelKg: 'Розыгрыштар' },
    ],
    ctaHref: '/auth',
    ctaBtnRu: 'Зарегистрироваться бесплатно',
    ctaBtnKg: 'Акысыз катталуу',
    ctaColor: 'bg-blue-600 hover:bg-blue-700',
    ctaDescRu: 'Начните заказывать уже сегодня — это займёт 30 секунд',
    ctaDescKg: 'Бүгүн заказ кылып баштаңыз — 30 секунд кетет',
  },

  supplier: {
    color: 'from-slate-700 to-slate-900',
    pains: {
      ru: [
        'Агент поленился / заболел / не доехал — заказы ушли к конкуренту',
        'Новые точки открываются — агенты их ещё не знают',
        'Недобор продаж — нужно больше клиентов',
        'Новая компания без штата торговых — как начать продавать?',
      ],
      kg: [
        'Агент жалкоолук кылды / ооруп калды / жеткен жок — заказдар атаандашка кетти',
        'Жаңы дүкөндөр ачылат — агенттер аларды билбейт',
        'Сатуулар жетишсиз — көбүрөөк кардар керек',
        'Сатуу кызматкерлери жок жаңы компания — кантип сатууну баштоо?',
      ],
    },
    solutions: {
      ru: [
        'Дополнительный канал продаж — агенты остаются как есть',
        'Новые точки сами находят вас через платформу',
        'Заказы приходят в Telegram — не теряются',
        'Для новых компаний без штата — быстрый старт без вложений',
      ],
      kg: [
        'Кошумча сатуу каналы — агенттер калат',
        'Жаңы дүкөндөр өздөрү платформа аркылуу табат',
        'Заказдар Telegramга келет — жоголбойт',
        'Жаңы компаниялар үчүн — салымсыз тез баштоо',
      ],
    },
    steps: {
      ru: [
        { icon: '📝', title: 'Регистрация компании', desc: 'Укажите ИНН, адрес, контакты — один раз' },
        { icon: '📦', title: 'Загрузите товары', desc: 'Добавьте каталог с ценами и фото' },
        { icon: '🚚', title: 'Настройте график доставки', desc: 'Отметьте в какие дни куда возите — система посчитает сама' },
        { icon: '📲', title: 'Получайте заказы', desc: 'Уведомления в Telegram сразу после нового заказа' },
        { icon: '💰', title: 'Платите 5% с продаж', desc: 'Первый месяц без абонплаты — только комиссия с реальных заказов' },
      ],
      kg: [
        { icon: '📝', title: 'Компанияны каттоо', desc: 'ИНН, дарек, байланыш — бир жолу' },
        { icon: '📦', title: 'Товарларды жүктөө', desc: 'Баасы жана сүрөтү менен каталог кошуңуз' },
        { icon: '🚚', title: 'Жеткирүү графигин түзүңүз', desc: 'Кайсы күндөрү кайда жеткиресиз — система өзү эсептейт' },
        { icon: '📲', title: 'Заказдарды алыңыз', desc: 'Жаңы заказдан кийин Telegramга билдирүү' },
        { icon: '💰', title: 'Сатуудан 5% төлөйсүз', desc: 'Биринчи ай абоненттик төлөмсүз — чыныгы заказдардан гана' },
      ],
    },
    numbers: [
      { value: '5%', labelRu: 'Комиссия', labelKg: 'Комиссия' },
      { value: '0 сом', labelRu: 'Первый месяц', labelKg: 'Биринчи ай' },
      { value: '24/7', labelRu: 'Заказы приходят', labelKg: 'Заказдар келет' },
      { value: '0', labelRu: 'Вложений', labelKg: 'Салым' },
    ],
    ctaHref: '/auth',
    ctaBtnRu: 'Стать поставщиком',
    ctaBtnKg: 'Жеткирүүчү болуу',
    ctaColor: 'bg-slate-800 hover:bg-slate-900',
    ctaDescRu: 'Первый месяц только 5% комиссия — без абонентской платы',
    ctaDescKg: 'Биринчи ай 5% комиссия гана — абоненттик төлөмсүз',
  },

  agent: {
    color: 'from-green-600 to-green-900',
    pains: {
      ru: [
        'Хочется дополнительный доход без лишней работы',
        'Хожу по точкам, но можно зарабатывать больше',
        'Нет возможности подрабатывать без вложений',
      ],
      kg: [
        'Кошумча иш жасабай кошумча киреше алгыңыз келет',
        'Дүкөндөргө барам, бирок көбүрөөк акча табууга болот',
        'Салымсыз кошумча иштөөгө мүмкүнчүлүк жок',
      ],
    },
    solutions: {
      ru: [
        'Ходишь по тем же точкам — получаешь +2% сверху',
        'Работа через телефон — всё просто и понятно',
        'Без вложений, без офиса, свободный график',
        'Доход растёт пока магазины заказывают через тебя',
      ],
      kg: [
        'Ошол эле дүкөндөргө барасыз — +2% аласыз',
        'Телефон аркылуу иш — баары жөнөкөй',
        'Салымсыз, офисcиз, эркин график',
        'Дүкөндөр сиз аркылуу заказ кылганча киреше өсөт',
      ],
    },
    steps: {
      ru: [
        { icon: '📝', title: 'Регистрация агента', desc: 'Укажите ИНН — нужен для выплат' },
        { icon: '🔗', title: 'Получите свою ссылку', desc: 'Уникальная реферальная ссылка в вашем кабинете' },
        { icon: '🤝', title: 'Подключайте магазины', desc: 'Отправляйте ссылку магазинам — они регистрируются через вас' },
        { icon: '🛒', title: 'Магазин заказывает', desc: 'Каждый заказ через платформу даёт вам 2%' },
        { icon: '💰', title: 'Получайте выплаты', desc: 'Заработок копится на счету и автоматически выплачивается' },
      ],
      kg: [
        { icon: '📝', title: 'Агент болуп катталуу', desc: 'ИНН көрсөтүңүз — төлөмдөр үчүн керек' },
        { icon: '🔗', title: 'Шилтемеңизди алыңыз', desc: 'Кабинетиңизде уникалдуу реф шилтеме' },
        { icon: '🤝', title: 'Дүкөндөрдү туташтырыңыз', desc: 'Шилтемени жөнөтүңүз — алар сиз аркылуу катталат' },
        { icon: '🛒', title: 'Дүкөн заказ кылат', desc: 'Платформадагы ар бир заказ сизге 2% берет' },
        { icon: '💰', title: 'Төлөмдөрдү алыңыз', desc: 'Киреше чотуңузда чогулуп, автоматтык төлөнөт' },
      ],
    },
    numbers: [
      { value: '2%', labelRu: 'С каждого заказа', labelKg: 'Ар бир заказдан' },
      { value: '0 сом', labelRu: 'Вложений', labelKg: 'Салым' },
      { value: '24/7', labelRu: 'Свой график', labelKg: 'Өз графиги' },
      { value: '∞', labelRu: 'Магазинов', labelKg: 'Дүкөндөр' },
    ],
    ctaHref: '/agents',
    ctaBtnRu: 'Стать агентом',
    ctaBtnKg: 'Агент болуу',
    ctaColor: 'bg-green-600 hover:bg-green-700',
    ctaDescRu: 'Дополнительный доход без вложений — начни сегодня',
    ctaDescKg: 'Салымсыз кошумча киреше — бүгүн баштаңыз',
  },
};
