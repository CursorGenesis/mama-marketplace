'use client';
import { useLang } from '@/context/LangContext';
import { Check, X, Crown, Building2, Package, Rocket, Star, BarChart3, Shield, HeadphonesIcon, ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const plans = [
  {
    id: 'start',
    icon: '🌱',
    nameRu: 'Старт', nameKg: 'Старт',
    descRu: 'Для небольших поставщиков и новичков', descKg: 'Кичинекей жеткирүүчүлөр жана жаңы баштагандар үчүн',
    price: 2000,
    color: 'slate',
    features: [
      { textRu: 'До 30 карточек товаров', textKg: '30 товар карточкасына чейин', included: true },
      { textRu: 'Профиль компании', textKg: 'Компания профили', included: true },
      { textRu: 'Telegram уведомления о заказах', textKg: 'Заказдар жөнүндө Telegram билдирүүлөр', included: true },
      { textRu: 'Комиссия 5%', textKg: '5% комиссия', included: true },
      { textRu: 'История заказов', textKg: 'Заказдар тарыхы', included: true },
      { textRu: 'Акции и баннеры в каталоге', textKg: 'Каталогдогу акциялар жана баннерлер', included: false },
      { textRu: 'Баннер на главной странице', textKg: 'Башкы беттеги баннер', included: false },
    ],
  },
  {
    id: 'basic',
    icon: '📦',
    nameRu: 'Базовый', nameKg: 'Базалык',
    descRu: 'Для активных поставщиков с широким ассортиментом', descKg: 'Кең ассортименттүү активдүү жеткирүүчүлөр үчүн',
    price: 3000,
    color: 'blue',
    features: [
      { textRu: 'До 100 карточек товаров', textKg: '100 товар карточкасына чейин', included: true },
      { textRu: 'Профиль компании', textKg: 'Компания профили', included: true },
      { textRu: 'Telegram уведомления о заказах', textKg: 'Заказдар жөнүндө Telegram билдирүүлөр', included: true },
      { textRu: 'Комиссия 5%', textKg: '5% комиссия', included: true },
      { textRu: 'История заказов', textKg: 'Заказдар тарыхы', included: true },
      { textRu: 'Акции и баннеры в каталоге', textKg: 'Каталогдогу акциялар жана баннерлер', included: true, bold: true },
      { textRu: 'Баннер на главной странице', textKg: 'Башкы беттеги баннер', included: false },
    ],
  },
  {
    id: 'business',
    icon: '🏢',
    nameRu: 'Бизнес', nameKg: 'Бизнес',
    descRu: 'Для серьёзных поставщиков с большим ассортиментом', descKg: 'Кең ассортименттүү олуттуу жеткирүүчүлөр үчүн',
    price: 7000,
    color: 'green',
    popular: true,
    features: [
      { textRu: 'До 300 карточек товаров', textKg: '300 товар карточкасына чейин', included: true },
      { textRu: 'Профиль компании', textKg: 'Компания профили', included: true },
      { textRu: 'Telegram уведомления о заказах', textKg: 'Заказдар жөнүндө Telegram билдирүүлөр', included: true },
      { textRu: 'Комиссия 5%', textKg: '5% комиссия', included: true },
      { textRu: 'История заказов', textKg: 'Заказдар тарыхы', included: true },
      { textRu: 'Акции и баннеры', textKg: 'Акциялар жана баннерлер', included: true, bold: true },
      { textRu: 'Баннер на главной странице', textKg: 'Башкы беттеги баннер', included: true, bold: true },
    ],
  },
  {
    id: 'premium',
    icon: '👑',
    nameRu: 'Премиум', nameKg: 'Премиум',
    descRu: 'Для крупных компаний — максимум возможностей', descKg: 'Ири компаниялар үчүн — максимум мүмкүнчүлүк',
    price: 10000,
    color: 'amber',
    features: [
      { textRu: 'Безлимит карточек товаров', textKg: 'Чексиз товар карточкалары', included: true, bold: true },
      { textRu: 'Профиль компании', textKg: 'Компания профили', included: true },
      { textRu: 'Telegram уведомления о заказах', textKg: 'Заказдар жөнүндө Telegram билдирүүлөр', included: true },
      { textRu: 'Комиссия 5%', textKg: '5% комиссия', included: true },
      { textRu: 'История заказов', textKg: 'Заказдар тарыхы', included: true },
      { textRu: 'Акции и баннеры', textKg: 'Акциялар жана баннерлер', included: true, bold: true },
      { textRu: 'Баннер на главной странице', textKg: 'Башкы беттеги баннер', included: true, bold: true },
      { textRu: 'Приоритетная поддержка', textKg: 'Приоритеттүү колдоо', included: true, bold: true },
    ],
  },
];

const addons = [
  {
    icon: Crown,
    iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
    nameRu: 'ТОП-размещение', nameKg: 'ТОП-жайгашуу',
    descRu: 'Пакет видимости по всему сайту: блок ТОП на главной, золотой бейдж на всех карточках, первые места в каталоге и в поиске, приоритет в персональных рекомендациях клиентам',
    descKg: 'Бүт сайт боюнча көрүнүү пакети: башкы беттеги ТОП блогу, бардык карточкалардагы алтын бейдж, каталогдо жана издөөдө биринчи орундар, кардарларга жеке сунуштарда приоритет',
    priceRu: '6 000 сом/мес', priceKg: '6 000 сом/ай',
  },
  {
    icon: Star,
    iconBg: 'bg-pink-100', iconColor: 'text-pink-600',
    nameRu: 'Рекомендуем (1 товар)', nameKg: 'Сунуштайбыз (1 товар)',
    descRu: 'Товар в секции «Рекомендуем» на главной. Ротация до 8 мест',
    descKg: 'Башкы беттеги «Сунуштайбыз» бөлүмүндө. 8 орунга чейин ротация',
    priceRu: '500 сом/мес за товар', priceKg: '500 сом/ай товар үчүн',
  },
  {
    icon: Package,
    iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
    nameRu: 'Доп. карточки', nameKg: 'Кошумча карточкалар',
    descRu: 'Превысили лимит тарифа? Добавляйте ещё',
    descKg: 'Тариф лимитинен аштыңызбы? Дагы кошуңуз',
    priceRu: '10 сом/шт сверх лимита', priceKg: '10 сом/даана лимиттен ашык',
  },
];

export default function PricingPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {isRu ? 'Тарифы для поставщиков' : 'Жеткирүүчүлөр үчүн тарифтер'}
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            {isRu
              ? 'Первый месяц — оплата только комиссии 5%. Выберите план под ваш бизнес'
              : 'Биринчи ай — 5% комиссия гана төлөнөт. Бизнесиңизге план тандаңыз'}
          </p>
        </div>
      </div>

      {/* Тарифные карточки */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl p-6 shadow-lg relative flex flex-col border-2 ${
              plan.popular ? 'border-green-500' : plan.color === 'amber' ? 'border-amber-400' : 'border-transparent'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {isRu ? 'Популярный' : 'Популярдуу'}
                </div>
              )}
              {plan.color === 'amber' && !plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  {isRu ? 'Максимум' : 'Максимум'}
                </div>
              )}

              <div className="text-3xl mb-3">{plan.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{isRu ? plan.nameRu : plan.nameKg}</h3>
              <p className="text-sm text-gray-500 mb-4">{isRu ? plan.descRu : plan.descKg}</p>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price.toLocaleString('ru-RU')}</span>
                <span className="text-gray-400 text-sm"> {isRu ? 'сом/мес' : 'сом/ай'}</span>
                <p className="text-green-600 text-xs font-semibold mt-1">
                  {isRu ? 'Первый месяц — только 5% комиссия!' : 'Биринчи ай — 5% комиссия гана!'}
                </p>
              </div>

              <ul className="space-y-2 flex-1 mb-5">
                {plan.features.map((f, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${f.included ? 'text-gray-700' : 'text-gray-300'}`}>
                    {f.included
                      ? <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                      : <X size={16} className="text-gray-300 mt-0.5 shrink-0" />
                    }
                    <span className={f.bold ? 'font-semibold' : ''}>{isRu ? f.textRu : f.textKg}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth"
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.popular
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : plan.color === 'amber'
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
              >
                {isRu ? 'Начать сейчас' : 'Азыр баштоо'} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Подробнее о возможностях */}
      <FeaturesDetails lang={lang} isRu={isRu} />

      {/* Дополнительные услуги */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          {isRu ? 'Дополнительные услуги' : 'Кошумча кызматтар'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {addons.map((addon, i) => {
            const Icon = addon.icon;
            return (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${addon.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={20} className={addon.iconColor} />
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{isRu ? addon.nameRu : addon.nameKg}</h3>
                <p className="text-sm text-gray-500 mb-3">{isRu ? addon.descRu : addon.descKg}</p>
                <p className="text-lg font-bold text-green-600">{isRu ? addon.priceRu : addon.priceKg}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {isRu ? 'Начните уже сегодня' : 'Бүгүн баштаңыз'}
          </h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            {isRu
              ? 'Первый месяц — только комиссия 5%, без абонентской платы. Без контрактов. Можно сменить тариф в любой момент'
              : 'Биринчи ай — 5% комиссия гана, абоненттик төлөмсүз. Контрактсыз. Тарифти каалаган убакта алмаштырса болот'}
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
          >
            {isRu ? 'Зарегистрироваться' : 'Катталуу'} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}

const featuresData = [
  {
    icon: '📦',
    titleRu: 'Карточки товаров',
    titleKg: 'Товар карточкалары',
    descRu: 'Каждый товар — это отдельная карточка с фото, названием, ценой, описанием и единицей измерения. Лимит зависит от тарифа: Старт — до 30, Базовый — до 100, Бизнес — до 300, Премиум — без ограничений. Если нужно больше — можно докупить по 10 сом за карточку.',
    descKg: 'Ар бир товар — сүрөтү, аталышы, баасы, сүрөттөмөсү жана өлчөө бирдиги менен өзүнчө карточка. Лимит тарифке жараша: Старт — 30, Базалык — 100, Бизнес — 300, Премиум — чексиз. Көбүрөөк керек болсо — карточкага 10 сом кошумча.',
  },
  {
    icon: '🏪',
    titleRu: 'Профиль компании',
    titleKg: 'Компания профили',
    descRu: 'Ваш профиль на Arzaman.kg с названием компании, описанием, контактами и адресом. Клиенты видят все ваши товары в одном месте и могут связаться по телефону или WhatsApp.',
    descKg: 'Arzaman.kg деги профилиңиз — компаниянын аты, сүрөттөмө, байланыш жана дарек. Кардарлар бардык товарларыңызды бир жерден көрүп, телефон же WhatsApp аркылуу байланыша алышат.',
  },
  {
    icon: '📋',
    titleRu: 'Заказы в Telegram',
    titleKg: 'Telegramга заказдар',
    descRu: 'Клиенты оформляют заказ на платформе — вам приходит уведомление в Telegram с именем клиента, телефоном, адресом и списком товаров. Звоните клиенту и доставляйте.',
    descKg: 'Кардарлар платформадан заказ берет — сизге Telegramга кардардын аты, телефону, дареги жана товарлар тизмеси менен билдирүү келет. Кардарга чалып, жеткириңиз.',
  },
  {
    icon: '💬',
    titleRu: 'WhatsApp / Telegram связь',
    titleKg: 'WhatsApp / Telegram байланыш',
    descRu: 'На вашей странице и в карточке поставщика показываются кнопки WhatsApp и Telegram. Клиенты могут написать вам напрямую — обсудить заказ, уточнить наличие или договориться о доставке.',
    descKg: 'Баракчаңызда жана жеткирүүчү карточкасында WhatsApp жана Telegram баскычтары көрсөтүлөт. Кардарлар сизге түз жаза алышат — буйрутманы талкуулоо, бар-жоктугун тактоо же жеткирүү жөнүндө сүйлөшүү.',
  },
  {
    icon: '💰',
    titleRu: 'Комиссия 5%',
    titleKg: '5% комиссия',
    descRu: 'С каждого заказа, оформленного через платформу, автоматически списывается комиссия 5% от суммы заказа. Комиссия одинаковая на всех тарифах.',
    descKg: 'Платформа аркылуу түзүлгөн ар бир буйрутмадан буйрутма суммасынан 5% комиссия автоматтык чегерилет. Комиссия бардык тарифтерде бирдей.',
  },
  {
    icon: '👑',
    titleRu: 'ТОП-размещение — что это даёт',
    titleKg: 'ТОП-жайгашуу — бул эмнени берет',
    descRu: 'ТОП-размещение — это не просто один блок, а пакет видимости по всему Arzaman.kg:\n\n• 🏆 Блок «ТОП поставщики» на главной странице (и для гостей, и для зарегистрированных клиентов)\n• ⭐ Золотой бейдж «ТОП» на вашей карточке везде — в каталоге, поиске, рекомендациях\n• 🔝 Первые места в каталоге в вашей категории\n• 🔍 Приоритет в результатах поиска при одинаковой релевантности\n• 🎯 Приоритет в персональных рекомендациях клиентам — ваши товары чаще попадают в подборки "Рекомендуем" и "Частые товары"\n• 📈 Выделение среди других поставщиков — увеличивает доверие и конверсию в заказ',
    descKg: 'ТОП-жайгашуу — бул жөн гана бир блок эмес, бүт Arzaman.kg боюнча көрүнүү пакети:\n\n• 🏆 Башкы беттеги «ТОП жеткирүүчүлөр» блогу (коноктор үчүн да, катталган кардарлар үчүн да)\n• ⭐ Бардык жерде карточкаңызда «ТОП» алтын бейджи — каталогдо, издөөдө, сунуштарда\n• 🔝 Каталогдо сиздин категорияңызда биринчи орундар\n• 🔍 Издөө жыйынтыгында бирдей актуалдуулукта артыкчылык\n• 🎯 Кардарларга жеке сунуштарда артыкчылык — сиздин товарлар "Сунуштайбыз" жана "Тез-тез" тизмелерине көбүрөөк киришет\n• 📈 Башка жеткирүүчүлөрдөн өзгөчөлөнүү — ишеним жана буйрутмага конверсияны жогорулатат',
  },
  {
    icon: '🎧',
    titleRu: 'Приоритетная поддержка',
    titleKg: 'Приоритеттүү колдоо',
    descRu: 'Только для Премиум:\n• Ответ на вопросы в течение 1 часа (вместо 24 часов)\n• Личный менеджер в WhatsApp\n• Помощь с загрузкой товаров и настройкой страницы\n• Консультации по продвижению и увеличению продаж\n• Первоочередное решение технических проблем',
    descKg: 'Премиум үчүн гана:\n• Суроолорго 1 сааттын ичинде жооп (24 сааттын ордуна)\n• WhatsApp тагы жеке менеджер\n• Товарларды жүктөө жана баракчаны жөндөө боюнча жардам\n• Жылдыруу жана сатууну көбөйтүү боюнча кеңештер\n• Техникалык көйгөйлөрдү биринчи кезекте чечүү',
  },
];

function FeaturesDetails({ lang, isRu }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
        {isRu ? 'Что входит в тарифы — подробно' : 'Тарифтерге эмне кирет — толук'}
      </h2>
      <p className="text-center text-sm text-gray-500 mb-8">
        {isRu ? 'Нажмите на пункт, чтобы узнать подробности' : 'Толук маалымат үчүн пунктту басыңыз'}
      </p>

      <div className="space-y-2">
        {featuresData.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl">{f.icon}</span>
                <span className="flex-1 font-semibold text-gray-800">{isRu ? f.titleRu : f.titleKg}</span>
                <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-0">
                  <div className="pl-11 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {isRu ? f.descRu : f.descKg}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
