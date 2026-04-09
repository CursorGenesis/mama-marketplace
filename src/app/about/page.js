'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import Link from 'next/link';
import {
  ShoppingCart, Truck, Shield, Star, Users, TrendingUp,
  MapPin, MessageCircle, BarChart3, Gift, Clock, CheckCircle,
  ChevronRight, ArrowRight, Package, DollarSign, Eye, Zap
} from 'lucide-react';

export default function AboutPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [activeTab, setActiveTab] = useState('clients');

  const stats = [
    { value: '30+', label: isRu ? 'Товаров в каталоге' : 'Каталогдогу товарлар' },
    { value: '8', label: isRu ? 'Поставщиков' : 'Жеткирүүчүлөр' },
    { value: '10', label: isRu ? 'Городов КР' : 'КР шаарлары' },
    { value: '24/7', label: isRu ? 'Онлайн заказы' : 'Онлайн буйрутмалар' },
  ];

  const clientBenefits = [
    { icon: <ShoppingCart size={24} />, title: isRu ? 'Все поставщики в одном месте' : 'Бардык жеткирүүчүлөр бир жерде', desc: isRu ? 'Не нужно ездить по базарам. Выбирайте товары от разных поставщиков и оформляйте заказ в пару кликов' : 'Базарларга барбай туруп, ар кандай жеткирүүчүлөрдөн товар тандап, бир нече кликте буйрутма бериңиз', color: 'bg-blue-50 text-blue-600' },
    { icon: <DollarSign size={24} />, title: isRu ? 'Прозрачные цены' : 'Ачык баалар', desc: isRu ? 'Сравнивайте цены разных поставщиков. Видите цену за штуку, а не за упаковку' : 'Ар кандай жеткирүүчүлөрдүн бааларын салыштырыңыз', color: 'bg-green-50 text-green-600' },
    { icon: <Clock size={24} />, title: isRu ? 'Повторный заказ за 10 секунд' : '10 секундда кайталоо', desc: isRu ? 'Система помнит ваши частые товары. Нажмите "Повторить" — и всё в корзине' : 'Система тез-тез алынган товарларды эстейт. "Кайталоо" басыңыз — баары себетте', color: 'bg-purple-50 text-purple-600' },
    { icon: <MapPin size={24} />, title: isRu ? 'Доставка на карте' : 'Картадан жеткирүү', desc: isRu ? 'Укажите точку доставки на интерактивной карте. Поставщик точно знает куда везти' : 'Жеткирүү чекитин интерактивдүү картадан белгилеңиз', color: 'bg-orange-50 text-orange-600' },
    { icon: <Gift size={24} />, title: isRu ? 'Пригласи поставщика — получи скидку' : 'Жеткирүүчүнү чакыр — арзандатуу ал', desc: isRu ? 'Отправьте ссылку поставщику. Он получит бесплатный ТОП на 7 дней, а вы — скидку 5% на первый заказ' : 'Жеткирүүчүгө шилтеме жөнөтүңүз. Ал 7 күнгө акысыз ТОП алат, сиз — биринчи заказга 5% арзандатуу', color: 'bg-pink-50 text-pink-600' },
    { icon: <MessageCircle size={24} />, title: isRu ? 'WhatsApp интеграция' : 'WhatsApp интеграциясы', desc: isRu ? 'Заказывайте через платформу или отправляйте заявку напрямую в WhatsApp поставщика' : 'Платформа аркылуу же жеткирүүчүнүн WhatsApp ына түздөн-түз жөнөтүңүз', color: 'bg-emerald-50 text-emerald-600' },
  ];

  const supplierBenefits = [
    { icon: <Users size={24} />, title: isRu ? 'Доступ к клиентам' : 'Кардарларга мүмкүнчүлүк', desc: isRu ? 'Тысячи розничных магазинов по всему Кыргызстану ищут поставщиков. Они найдут вас на MarketKG' : 'Кыргызстан боюнча миңдеген чекене дүкөндөр жеткирүүчүлөрдү издейт', color: 'bg-blue-50 text-blue-600' },
    { icon: <Package size={24} />, title: isRu ? 'Простая карточка товара' : 'Жөнөкөй товар карточкасы', desc: isRu ? 'Пошаговый мастер с подсказками. Заполните по шаблону — карточка будет профессиональной' : 'Көрсөтмөлөр менен кадамдык мастер. Калып боюнча толтуруңуз — карточка профессионалдуу болот', color: 'bg-purple-50 text-purple-600' },
    { icon: <TrendingUp size={24} />, title: isRu ? 'Бейджи и продвижение' : 'Бейджилер жана жылдыруу', desc: isRu ? '«Топ продаж» — бесплатно по популярности. «Рекомендуем» — платное продвижение, подробнее в тарифах' : '«Топ сатуу» — акысыз. «Сунуштайбыз» — акылуу жылдыруу, тарифтерде кененирээк', color: 'bg-amber-50 text-amber-600' },
    { icon: <BarChart3 size={24} />, title: isRu ? 'Статистика и аналитика' : 'Статистика жана аналитика', desc: isRu ? 'Видите сколько заказов, какие товары популярны, из каких регионов покупают' : 'Канча буйрутма, кайсы товарлар популярдуу, кайсы аймактардан сатып алышат', color: 'bg-green-50 text-green-600' },
    { icon: <Shield size={24} />, title: isRu ? 'Выгодные тарифы' : 'Тиешелүү тарифтер', desc: isRu ? 'Первый месяц бесплатно. Комиссия всего 3–5% — в разы ниже чем на других маркетплейсах. Подробности на странице тарифов' : 'Биринчи ай акысыз. Комиссия болгону 3–5% — башка маркетплейстерге караганда алда канча аз. Толугураак тарифтер барагында', color: 'bg-red-50 text-red-600' },
    { icon: <Zap size={24} />, title: isRu ? 'Быстрый старт' : 'Тез баштоо', desc: isRu ? 'Зарегистрируйтесь, добавьте товары — и начинайте получать заказы уже сегодня' : 'Катталыңыз, товарларды кошуңуз — бүгүн эле заказдарды ала баштаңыз', color: 'bg-cyan-50 text-cyan-600' },
  ];

  const howItWorksClient = [
    { step: 1, title: isRu ? 'Выбираете товары' : 'Товар тандайсыз', desc: isRu ? 'Просматриваете каталог, сравниваете цены и добавляете в корзину' : 'Каталогду карап, бааларды салыштырып, себетке кошосуз', icon: '🛒' },
    { step: 2, title: isRu ? 'Оформляете заказ' : 'Буйрутма бересиз', desc: isRu ? 'Указываете адрес, точку на карте и отправляете. Заявки уходят каждому поставщику отдельно' : 'Дарек, картадагы чекитти көрсөтүп жөнөтөсүз. Ар бир жеткирүүчүгө өзүнчө заявка', icon: '📋' },
    { step: 3, title: isRu ? 'Получаете товар' : 'Товарды аласыз', desc: isRu ? 'Поставщик связывается с вами и доставляет товар. Оплата при получении' : 'Жеткирүүчү сиз менен байланышып, товарды жеткирет', icon: '🚚' },
  ];

  const howItWorksSupplier = [
    { step: 1, title: isRu ? 'Регистрация' : 'Каттоо', desc: isRu ? 'Создайте аккаунт как поставщик — бесплатно и за 2 минуты' : 'Жеткирүүчү катары аккаунт түзүңүз — акысыз, 2 мүнөттө', icon: '📝' },
    { step: 2, title: isRu ? 'Добавьте товары' : 'Товар кошуңуз', desc: isRu ? 'Заполните карточки по шаблону — название, цена, фото, описание' : 'Карточкаларды калып боюнча толтуруңуз — аты, баасы, сүрөт', icon: '📦' },
    { step: 3, title: isRu ? 'Получайте заказы' : 'Заказ алыңыз', desc: isRu ? 'Клиенты находят вас в каталоге и отправляют заявки' : 'Кардарлар сизди каталогдон таап, заявка жөнөтүшөт', icon: '📲' },
    { step: 4, title: isRu ? 'Доставляйте и зарабатывайте' : 'Жеткирип, акча табыңыз', desc: isRu ? 'Выполняйте заказы, наращивайте базу постоянных клиентов' : 'Заказдарды аткарып, туруктуу кардарлар базасын көбөйтүңүз', icon: '💰' },
  ];

  const pricing = [
    { name: isRu ? 'Для клиентов' : 'Кардарлар үчүн', price: isRu ? 'Бесплатно' : 'Акысыз', features: [isRu ? 'Каталог и поиск' : 'Каталог жана издөө', isRu ? 'Оформление заказов' : 'Буйрутма берүү', isRu ? 'Карта поставщиков' : 'Жеткирүүчүлөр картасы', isRu ? 'Промокоды и бонусы' : 'Промокоддор жана бонустар', isRu ? 'История заказов' : 'Буйрутма тарыхы'], color: 'border-blue-200 bg-blue-50', btn: 'bg-blue-600 hover:bg-blue-700' },
    { name: isRu ? 'Для поставщиков' : 'Жеткирүүчүлөр үчүн', price: isRu ? '2% с заказа' : 'Заказдан 2%', features: [isRu ? 'Размещение товаров' : 'Товарларды жайгаштыруу', isRu ? 'Приём заказов' : 'Заказдарды кабыл алуу', isRu ? 'Статистика продаж' : 'Сатуу статистикасы', isRu ? 'WhatsApp уведомления' : 'WhatsApp билдирүүлөр', isRu ? 'Бейдж «Топ продаж»' : '«Топ сатуу» бейджи'], color: 'border-green-200 bg-green-50', btn: 'bg-green-600 hover:bg-green-700' },
    { name: isRu ? 'Продвижение' : 'Жылдыруу', price: isRu ? '2 000 сом/мес' : '2 000 сом/ай', features: [isRu ? 'Бейдж «Рекомендуем»' : '«Сунуштайбыз» бейджи', isRu ? 'Приоритет в каталоге' : 'Каталогдо артыкчылык', isRu ? 'Выделение в поиске' : 'Издөөдө бөлүп көрсөтүү', isRu ? 'Повышенная видимость' : 'Жогорулатылган көрүнүш', isRu ? 'Статистика просмотров' : 'Көрүүлөр статистикасы'], color: 'border-amber-200 bg-amber-50', btn: 'bg-amber-600 hover:bg-amber-700' },
  ];

  const faq = [
    { q: isRu ? 'Как зарегистрироваться?' : 'Кантип катталуу керек?', a: isRu ? 'Нажмите "Войти" в правом верхнем углу, выберите "Регистрация" и укажите свою роль — покупатель или поставщик. Можно войти через Google, Apple, WhatsApp или Telegram.' : '"Кирүү" баскычын басып, "Каттоо" тандаңыз. Google, Apple, WhatsApp же Telegram аркылуу кирүүгө болот.' },
    { q: isRu ? 'Какие тарифы для поставщиков?' : 'Жеткирүүчүлөр үчүн тарифтер кандай?', a: isRu ? 'Первый месяц бесплатно на любом тарифе. Далее от 1 500 сом/мес. Комиссия 3–5% — в разы ниже чем на других маркетплейсах. Подробности на странице тарифов.' : 'Каалаган тарифте биринчи ай акысыз. Андан кийин 1 500 сом/айдан. Комиссия 3–5% — башка маркетплейстерге караганда алда канча аз. Толугураак тарифтер барагында.' },
    { q: isRu ? 'Как происходит оплата?' : 'Төлөм кантип жүрөт?', a: isRu ? 'Оплата при получении — наличными или переводом. Клиент платит поставщику напрямую. Комиссия маркетплейса выставляется отдельно.' : 'Алууда төлөм — накталай же которуу. Кардар жеткирүүчүгө түздөн-түз төлөйт.' },
    { q: isRu ? 'В каких городах работает?' : 'Кайсы шаарларда иштейт?', a: isRu ? 'Бишкек, Ош, Джалал-Абад, Каракол, Токмок, Нарын, Баткен, Талас, Балыкчы и Кызыл-Кия. Мы расширяемся!' : 'Бишкек, Ош, Жалал-Абад, Каракол, Токмок, Нарын, Баткен, Талас, Балыкчы жана Кызыл-Кыя.' },
    { q: isRu ? 'Как стать «Топ поставщиком»?' : 'Кантип «Топ жеткирүүчү» болуу?', a: isRu ? 'Бейдж «Топ продаж» присваивается автоматически по количеству заказов. Бейдж «Рекомендуем» — платное продвижение, подробности при регистрации.' : '«Топ сатуу» бейджи заказдар саны боюнча автоматтык. «Сунуштайбыз» — акылуу жылдыруу, толугураак катталууда.' },
  ];

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-white text-sm mb-6">
            <Zap size={14} /> {isRu ? 'Первый B2B маркетплейс в Кыргызстане' : 'Кыргызстандагы биринчи B2B маркетплейс'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            MarketKG
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            {isRu
              ? 'Платформа, которая связывает поставщиков продуктов питания с розничными магазинами по всему Кыргызстану'
              : 'Кыргызстан боюнча азык-түлүк жеткирүүчүлөрүн чекене дүкөндөр менен байланыштырган платформа'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalog" className="px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg">
              {isRu ? 'Открыть каталог' : 'Каталогду ачуу'} →
            </Link>
            <Link href="/auth" className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
              {isRu ? 'Стать поставщиком' : 'Жеткирүүчү болуу'}
            </Link>
          </div>
        </div>
      </section>

      {/* СТАТИСТИКА */}
      <section className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ПЕРЕКЛЮЧАТЕЛЬ: ДЛЯ КЛИЕНТОВ / ДЛЯ ПОСТАВЩИКОВ */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex justify-center mb-10">
          <div className="bg-gray-100 rounded-xl p-1 flex">
            <button onClick={() => setActiveTab('clients')}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'clients' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              🛒 {isRu ? 'Для клиентов' : 'Кардарлар үчүн'}
            </button>
            <button onClick={() => setActiveTab('suppliers')}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'suppliers' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              📦 {isRu ? 'Для поставщиков' : 'Жеткирүүчүлөр үчүн'}
            </button>
          </div>
        </div>

        {/* ПРЕИМУЩЕСТВА */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {(activeTab === 'clients' ? clientBenefits : supplierBenefits).map((b, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 ${b.color} rounded-xl flex items-center justify-center mb-4`}>
                {b.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        {/* КАК ЭТО РАБОТАЕТ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
            {isRu ? 'Как это работает' : 'Кантип иштейт'}
          </h2>
          <div className={`grid grid-cols-1 ${activeTab === 'clients' ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
            {(activeTab === 'clients' ? howItWorksClient : howItWorksSupplier).map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {step.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ПЛЮСЫ ДЛЯ КЛИЕНТОВ / ВОЗРАЖЕНИЯ ДЛЯ ПОСТАВЩИКОВ */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* === ДЛЯ КЛИЕНТОВ: ПЛЮСЫ === */}
          {activeTab === 'clients' && (<>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                {isRu ? 'Почему магазины выбирают MarketKG' : 'Дүкөндөр эмне үчүн MarketKG тандашат'}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {isRu ? 'Вот конкретные причины, почему закупка через платформу выгоднее, быстрее и удобнее' : 'Платформа аркылуу сатып алуу эмне үчүн пайдалуу, тезирээк жана ыңгайлуу'}
              </p>
            </div>

            <div className="space-y-5 mb-10">
              {[
                { icon: '🤖', title: isRu ? 'Умный помощник — найдёт самый дешёвый товар за 1 секунду' : 'Акылдуу жардамчы — 1 секундда эң арзан товарды табат',
                  desc: isRu ? 'Не нужно самому сравнивать цены у разных поставщиков. Умный помощник автоматически покажет где дешевле, предложит аналоги и подскажет у кого лучший рейтинг.' : 'Ар кандай жеткирүүчүлөрдүн бааларын өзүңүз салыштырбаңыз. Акылдуу жардамчы кайда арзан экенин автоматтык көрсөтөт, аналогдорду сунуштайт.' },
                { icon: '💰', title: isRu ? 'Сравнение цен' : 'Бааларды салыштыруу',
                  desc: isRu ? 'Видите цены всех поставщиков в одном каталоге. Сразу понятно кто предлагает лучшую цену на нужный вам товар.' : 'Бардык жеткирүүчүлөрдүн бааларын бир каталогдо көрөсүз. Кайсы жеткирүүчү жакшы баа сунуштайт — дароо түшүнүктүү.' },
                { icon: '📦', title: isRu ? 'Заказ у нескольких поставщиков за раз' : 'Бир убакта бир нече жеткирүүчүдөн заказ',
                  desc: isRu ? 'Молоко от Бишкек Сүт, напитки от Шоро, крупы от Алтын Дан — в одной корзине. Каждый поставщик получает свою отдельную заявку автоматически.' : 'Бишкек Сүттөн сүт, Шородон суусундук, Алтын Дандан жарма — бир себетте. Ар бир жеткирүүчү автоматтык түрдө өзүнүн заявкасын алат.' },
                { icon: '🔄', title: isRu ? 'Повторный заказ в 1 клик' : '1 кликте кайталоо',
                  desc: isRu ? 'Каждый понедельник заказываете одно и то же? Нажмите «Повторить» — все товары в корзине. Можно изменить количество перед отправкой.' : 'Ар дүйшөмбүдө бир эле нерсе заказ кыласызбы? «Кайталоо» басыңыз — бардык товарлар себетте. Жөнөтүүдөн мурун санын өзгөртсө болот.' },
                { icon: '📱', title: isRu ? 'Заказ в любое время — даже ночью' : 'Каалаган убакта заказ — түн ортосунда да',
                  desc: isRu ? 'Вспомнили в 11 вечера что закончился сахар? Откройте MarketKG и закажите. Поставщик увидит заявку утром и доставит.' : 'Кечки 11де кант бүткөнүн эстедиңизби? MarketKG ачып заказ кылыңыз. Жеткирүүчү заявканы эртең менен көрүп, жеткирет.' },
                { icon: '🗺️', title: isRu ? 'Доставка по карте — без ошибок' : 'Карта боюнча жеткирүү — катасыз',
                  desc: isRu ? 'Укажите точку доставки на карте — курьер точно найдёт ваш магазин. Не нужно объяснять «поверните налево после зелёного забора».' : 'Жеткирүү чекитин картадан белгилеңиз — курьер дүкөнүңүздү так табат.' },
                { icon: '📋', title: isRu ? 'Чек и история каждого заказа' : 'Ар бир заказдын чеги жана тарыхы',
                  desc: isRu ? 'После каждого заказа — чек с деталями. В истории видно что заказывали, когда, у кого, на какую сумму. Удобно для бухгалтерии.' : 'Ар бир заказдан кийин — чоо-жайлуу чек. Тарыхта эмне, качан, кимден, канча сомго заказ кылганыңыз көрүнөт.' },
                { icon: '💬', title: isRu ? 'Связь с поставщиком через WhatsApp' : 'Жеткирүүчү менен WhatsApp аркылуу байланыш',
                  desc: isRu ? 'Хотите уточнить наличие или договориться о доставке? Нажмите кнопку WhatsApp прямо на карточке поставщика.' : 'Бар-жогун тактагыңыз же жеткирүү жөнүндө сүйлөшкүңүз келеби? Жеткирүүчүнүн карточкасындагы WhatsApp баскычын басыңыз.' },
                { icon: '🆓', title: isRu ? 'Полностью бесплатно для покупателей' : 'Сатып алуучулар үчүн толугу менен акысыз',
                  desc: isRu ? 'Никаких комиссий, подписок и скрытых платежей. Вы платите только за товар поставщику — и всё.' : 'Эч кандай комиссия, жазылуу жана жашыруун төлөм жок. Товар үчүн жеткирүүчүгө гана төлөйсүз — баары.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-gray-50 rounded-xl p-5 hover:bg-primary-50 transition-colors">
                  <span className="text-3xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA для клиентов */}
            <div className="bg-gradient-to-r from-blue-600 to-primary-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-xl font-bold mb-3">
                {isRu ? 'Попробуйте прямо сейчас — это бесплатно' : 'Азыр сынап көрүңүз — бул акысыз'}
              </h3>
              <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                {isRu ? 'Откройте каталог, выберите товары и оформите первый заказ за 2 минуты' : 'Каталогду ачыңыз, товарларды тандаңыз жана 2 мүнөттө биринчи заказ бериңиз'}
              </p>
              <Link href="/catalog" className="inline-block px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                🛒 {isRu ? 'Открыть каталог' : 'Каталогду ачуу'} →
              </Link>
            </div>
          </>)}

          {/* === ДЛЯ ПОСТАВЩИКОВ: ВОЗРАЖЕНИЯ === */}
          {activeTab === 'suppliers' && (<>
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                {isRu ? '«У нас уже есть торговые представители...»' : '«Бизде соода өкүлдөрү бар...»'}
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                {isRu
                  ? 'Мы понимаем ваши сомнения. Вот честные ответы на самые частые вопросы поставщиков'
                  : 'Сиздин күмөндөрүңүздү түшүнөбүз. Жеткирүүчүлөрдүн эң көп берилүүчү суроолоруна чынчыл жооптор'}
              </p>
            </div>

          <div className="space-y-6">
            {/* Возражение 1 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«У нас есть торговые представители, зачем нам платформа?»' : '«Бизде соода өкүлдөрү бар, платформа эмне кылат?»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Платформа НЕ заменяет торговых представителей — она им помогает' : 'Платформа соода өкүлдөрүн АЛМАШТЫРБАЙТ — аларга жардам берет'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Ваш торговый представитель обслуживает 30-50 точек в день. Платформа принимает заказы 24/7 от тех клиентов, куда он не успевает доехать — это новые магазины в других районах, ночные заказы, мелкие точки которые невыгодно посещать лично.'
                        : 'Соода өкүлүңүз күнүнө 30-50 чекитти тейлейт. Платформа ал жете албаган кардарлардан 24/7 заказ кабыл алат — башка райондордогу жаңы дүкөндөр, түнкү заказдар.'}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <p className="text-sm text-gray-500 mb-2 font-medium">{isRu ? '📊 Цифры:' : '📊 Сандар:'}</p>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div><span className="block text-xl font-bold text-primary-600">+40%</span><span className="text-xs text-gray-400">{isRu ? 'новых клиентов' : 'жаңы кардарлар'}</span></div>
                    <div><span className="block text-xl font-bold text-primary-600">24/7</span><span className="text-xs text-gray-400">{isRu ? 'приём заказов' : 'заказ кабыл алуу'}</span></div>
                    <div><span className="block text-xl font-bold text-primary-600">0 ₽</span><span className="text-xs text-gray-400">{isRu ? 'зарплата' : 'айлык'}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Возражение 2 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«Зачем мне платить комиссию?»' : '«Эмне үчүн комиссия төлөйм?»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Давайте посчитаем: торговый представитель стоит дороже' : 'Эсептеп көрөлү: соода өкүлү кымбатыраак турат'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Зарплата торгового: 25 000-35 000 сом + бензин 5 000 + связь 1 000 = 35 000 сом/мес минимум. Это фиксированный расход — даже если продаж нет. На платформе вы платите минимальную комиссию только с реальных заказов. Нет заказов — нет оплаты.'
                        : 'Соода өкүлүнүн айлыгы: 25 000-35 000 сом + бензин 5 000 + байланыш 1 000 = 35 000 сом/ай минимум. Бул туруктуу чыгаша — сатуу болбосо да. Платформада чыныгы заказдардан гана минималдуу комиссия төлөйсүз. Заказ жок — төлөм жок.'}
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-green-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="font-bold text-red-600 text-lg">35 000 сом</p>
                      <p className="text-gray-500 text-xs">{isRu ? 'Торговый представитель / мес' : 'Соода өкүлү / ай'}</p>
                      <p className="text-red-400 text-xs mt-1">{isRu ? '+ платите даже если нет продаж' : '+ сатуу болбосо да төлөйсүз'}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="font-bold text-green-600 text-lg">{isRu ? 'Мин. %' : 'Мин. %'}</p>
                      <p className="text-gray-500 text-xs">{isRu ? 'MarketKG / с заказа' : 'MarketKG / заказдан'}</p>
                      <p className="text-green-400 text-xs mt-1">{isRu ? 'только с реальных продаж' : 'чыныгы сатуулардан гана'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Возражение 3 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«Мои клиенты привыкли звонить и заказывать по телефону»' : '«Менин кардарларым телефон менен заказ кылууга көнгөн»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Мы не убираем телефон — мы добавляем удобство' : 'Телефонду алып салбайбыз — ыңгайлуулукту кошобуз'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Клиент может заказать и по телефону, и через WhatsApp, и через платформу — как ему удобнее. Но когда он в 11 вечера вспомнит что забыл заказать муку — он зайдёт на MarketKG и закажет. А по телефону вы в это время уже не ответите.'
                        : 'Кардар телефон, WhatsApp же платформа аркылуу — кантип ыңгайлуу болсо, ошондой заказ кылат. Бирок кечки 11де ун заказ кылууну унутканын эстесе — MarketKG га кирет. Телефонго бул убакта жооп бербейсиз.'}
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">📱 {isRu ? 'Заказ в 10 сек' : '10 секда заказ'}</span>
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">🌙 24/7</span>
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">📋 {isRu ? 'Без ошибок' : 'Катасыз'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Возражение 4 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«А если конкуренты увидят мои цены?»' : '«Атаандаштар менин бааларымды көрсөчү?»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Прозрачность = больше доверия = больше клиентов' : 'Ачыктык = көбүрөөк ишеним = көбүрөөк кардарлар'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Ваши клиенты уже знают цены конкурентов — они звонят и сравнивают. На платформе вы конкурируете не ценой, а сервисом: скорость ответа, качество товара, рейтинг, отзывы. Те кто боится конкуренции — проигрывают тем, кто её не боится.'
                        : 'Кардарларыңыз атаандаштардын бааларын билишет — чалып салыштырышат. Платформада баа менен эмес, тейлөө менен атаандашасыз: жооп берүү ылдамдыгы, товар сапаты, рейтинг, пикирлер.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Возражение 5 */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«Мне сложно, я не разбираюсь в технологиях»' : '«Мага кыйын, мен технологияларды түшүнбөйм»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Если вы умеете пользоваться WhatsApp — вы справитесь' : 'WhatsApp колдоно алсаңыз — баарын жасай аласыз'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Добавить товар — как отправить фото в WhatsApp. Заполните название, цену, загрузите фото — готово. У нас есть пошаговые подсказки в каждом поле. А если застрянете — наша поддержка поможет бесплатно. Мы даже можем добавить ваши товары за вас.'
                        : 'Товар кошуу — WhatsApp ка сүрөт жөнөтүү сыяктуу. Аталышын, баасын жазып, сүрөт жүктөңүз — даяр. Ар бир талаада кадамдык көрсөтмөлөр бар. Тыгылып калсаңыз — колдоо акысыз жардам берет.'}
                    </p>
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-green-800 text-sm font-medium">🤝 {isRu ? 'Бонус: мы бесплатно добавим ваши первые 10 товаров!' : 'Бонус: биринчи 10 товарыңызды акысыз кошобуз!'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Возражение 6 */}
            {/* Возражение: нет времени */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«Нет времени этим заниматься»' : '«Буга убакыт жок»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Настройка — 15 минут. Дальше заказы приходят сами' : 'Жөндөө — 15 мүнөт. Андан кийин заказдар өзү келет'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Регистрация — 2 минуты. Добавить товар — 3 минуты. За 15 минут вы размещаете весь каталог. После этого платформа работает на вас автоматически: клиенты находят вас сами, заявки приходят на WhatsApp. Вы не тратите ни минуты на поиск клиентов.'
                        : 'Каттоо — 2 мүнөт. Товар кошуу — 3 мүнөт. 15 мүнөттө бүт каталогуңузду жайгаштырасыз. Андан кийин платформа автоматтык иштейт: кардарлар сизди өздөрү табышат, заявкалар WhatsApp ка келет.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">⏱️ {isRu ? 'Регистрация: 2 мин' : 'Каттоо: 2 мин'}</span>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">📦 {isRu ? 'Товар: 3 мин' : 'Товар: 3 мин'}</span>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">🚀 {isRu ? 'Готово: 15 мин' : 'Даяр: 15 мин'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Возражение: уже пробовали онлайн */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="bg-red-50 px-6 py-4 border-l-4 border-red-400">
                <p className="font-bold text-red-800 text-lg">
                  ❌ {isRu ? '«Мы уже пробовали онлайн — не работает»' : '«Биз онлайнды сынап көрдүк — иштебейт»'}
                </p>
              </div>
              <div className="px-6 py-5">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl mt-0.5">✅</span>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'MarketKG — это не сайт и не Instagram. Это целевые клиенты' : 'MarketKG — бул сайт же Instagram эмес. Бул максаттуу кардарлар'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Instagram и сайт — это витрина, куда заходят случайные люди. MarketKG — это платформа, где владельцы магазинов целенаправленно ищут поставщиков. Каждый посетитель — это потенциальный покупатель, который уже готов заказать. Разница как между рекламой на столбе и встречей с клиентом лицом к лицу.'
                        : 'Instagram жана сайт — бул кокустук адамдар кирген витрина. MarketKG — бул дүкөн ээлери жеткирүүчүлөрдү максаттуу издеген платформа. Ар бир келүүчү — заказ кылууга даяр потенциалдуу сатып алуучу.'}
                    </p>
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm font-medium">
                        💡 {isRu ? 'Instagram: 1000 просмотров = 2-3 заказа. MarketKG: 100 просмотров = 10-15 заказов. Потому что здесь ищут именно поставщиков.' : 'Instagram: 1000 көрүү = 2-3 заказ. MarketKG: 100 көрүү = 10-15 заказ. Себеби бул жерде жеткирүүчүлөрдү издешет.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Итоговый блок */}
            <div className="bg-gradient-to-r from-primary-600 to-emerald-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-xl font-bold mb-3">
                {isRu ? 'Платформа — это не расход, а инвестиция' : 'Платформа — бул чыгаша эмес, инвестиция'}
              </h3>
              <p className="text-primary-100 mb-6 max-w-xl mx-auto">
                {isRu
                  ? 'Торговый представитель + MarketKG = максимальный охват. Оффлайн + онлайн. Те кто подключились первыми — уже получают новых клиентов.'
                  : 'Соода өкүлү + MarketKG = максималдуу камтуу. Оффлайн + онлайн. Биринчи кошулгандар — буга чейин жаңы кардарларды алышат.'}
              </p>
              <Link href="/auth" className="inline-block px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg">
                {isRu ? 'Попробовать бесплатно →' : 'Акысыз сынап көрүү →'}
              </Link>
            </div>
          </div>
          </>)}

        </div>
      </section>

      {/* НАЧНИТЕ БЕСПЛАТНО — только для поставщиков */}
      {activeTab === 'suppliers' && <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              {isRu ? 'Начните бесплатно' : 'Акысыз баштаңыз'}
            </h2>
            <p className="text-gray-500">
              {isRu ? 'Разместите товары и начните получать заказы уже сегодня' : 'Товарларды жайгаштырып, бүгүн эле заказдарды ала баштаңыз'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: '✅', text: isRu ? 'Размещение товаров — бесплатно' : 'Товарларды жайгаштыруу — акысыз' },
                { icon: '✅', text: isRu ? 'Приём заказов — бесплатно' : 'Заказдарды кабыл алуу — акысыз' },
                { icon: '✅', text: isRu ? 'Статистика и аналитика — бесплатно' : 'Статистика жана аналитика — акысыз' },
                { icon: '✅', text: isRu ? 'WhatsApp уведомления — бесплатно' : 'WhatsApp билдирүүлөр — акысыз' },
                { icon: '✅', text: isRu ? 'Бейдж «Топ продаж» — бесплатно' : '«Топ сатуу» бейджи — акысыз' },
                { icon: '✅', text: isRu ? 'Поддержка и помощь в настройке' : 'Колдоо жана жөндөөдө жардам' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-lg">{item.icon}</span> {item.text}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-center text-sm text-gray-500 mb-4">
                {isRu
                  ? 'Хотите узнать подробные условия сотрудничества? Свяжитесь с нами — обсудим индивидуально'
                  : 'Кызматташуунун толук шарттарын билгиңиз келеби? Биз менен байланышыңыз — жеке талкуулайбыз'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="https://wa.me/?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%83%D0%B7%D0%BD%D0%B0%D1%82%D1%8C%20%D1%83%D1%81%D0%BB%D0%BE%D0%B2%D0%B8%D1%8F%20%D0%B4%D0%BB%D1%8F%20%D0%BF%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D1%89%D0%B8%D0%BA%D0%BE%D0%B2" target="_blank"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-md">
                  <MessageCircle size={18} />
                  {isRu ? 'Написать в WhatsApp' : 'WhatsApp га жазуу'}
                </a>
                <Link href="/auth"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-md">
                  {isRu ? 'Зарегистрироваться бесплатно' : 'Акысыз катталуу'} →
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            {isRu ? 'Мы подберём условия под ваш бизнес. Для крупных поставщиков — специальные условия.' : 'Бизнесиңизге шарттарды тандайбыз. Ири жеткирүүчүлөр үчүн — атайын шарттар.'}
          </p>
        </div>
      </section>}

      {/* FAQ — только для поставщиков */}
      {activeTab === 'suppliers' && <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-10">
          {isRu ? 'Частые вопросы' : 'Көп берилүүчү суроолор'}
        </h2>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <details key={i} className="bg-white rounded-xl shadow-sm group">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-800 flex items-center justify-between hover:bg-gray-50 rounded-xl">
                {item.q}
                <ChevronRight size={18} className="text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>}

      {/* Ссылка на условия */}
      <section className="max-w-3xl mx-auto px-4 py-8 text-center">
        <Link href="/terms" className="text-primary-600 hover:text-primary-700 underline text-sm">
          {isRu ? 'Условия использования платформы' : 'Платформаны колдонуу шарттары'}
        </Link>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-600 to-emerald-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isRu ? 'Готовы начать?' : 'Баштоого даярсызбы?'}
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            {isRu
              ? 'Присоединяйтесь к MarketKG — первому B2B маркетплейсу продуктов питания в Кыргызстане'
              : 'MarketKG га кошулуңуз — Кыргызстандагы биринчи B2B азык-түлүк маркетплейси'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/catalog" className="px-8 py-3.5 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg">
              🛒 {isRu ? 'Начать покупки' : 'Сатып алууну баштоо'}
            </Link>
            <Link href="/auth" className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20">
              📦 {isRu ? 'Стать поставщиком' : 'Жеткирүүчү болуу'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
