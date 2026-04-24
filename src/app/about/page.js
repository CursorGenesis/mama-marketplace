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

  const clientStats = [
    { value: '36', label: isRu ? 'Категорий товаров' : 'Товар категориялары' },
    { value: '29', label: isRu ? 'Городов КР' : 'КР шаарлары' },
    { value: '0 сом', label: isRu ? 'Для клиентов' : 'Кардарлар үчүн' },
    { value: '24/7', label: isRu ? 'Онлайн заказы' : 'Онлайн буйрутмалар' },
  ];

  const supplierStats = [
    { value: '36', label: isRu ? 'Категорий товаров' : 'Товар категориялары' },
    { value: '29', label: isRu ? 'Городов КР' : 'КР шаарлары' },
    { value: '5%', label: isRu ? 'Комиссия' : 'Комиссия' },
    { value: '24/7', label: isRu ? 'Заказы в Telegram' : 'Telegramга заказдар' },
  ];

  const stats = activeTab === 'clients' ? clientStats : supplierStats;

  const clientBenefits = [
    { icon: <ShoppingCart size={24} />, title: isRu ? 'Все поставщики в одном месте' : 'Бардык жеткирүүчүлөр бир жерде', desc: isRu ? 'Выбирайте товары от разных поставщиков и оформляйте заказ в пару кликов' : 'Ар кандай жеткирүүчүлөрдөн товар тандап, бир нече кликте буйрутма бериңиз', color: 'bg-blue-50 text-blue-600' },
    { icon: <DollarSign size={24} />, title: isRu ? 'Прозрачные цены' : 'Ачык баалар', desc: isRu ? 'Сравнивайте цены разных поставщиков и выбирайте лучшее предложение' : 'Ар кандай жеткирүүчүлөрдүн бааларын салыштырып, эң жакшы сунушту тандаңыз', color: 'bg-green-50 text-green-600' },
    { icon: <MapPin size={24} />, title: isRu ? 'Доставка на карте' : 'Картадан жеткирүү', desc: isRu ? 'Укажите точку доставки на интерактивной карте. Поставщик точно знает куда везти' : 'Жеткирүү чекитин интерактивдүү картадан белгилеңиз', color: 'bg-orange-50 text-orange-600' },
    { icon: <Gift size={24} />, title: isRu ? 'Розыгрыш скидок' : 'Арзандатуу розыгрышы', desc: isRu ? 'Собирайте монетки за каждый заказ и участвуйте в розыгрыше скидок на будущие заказы' : 'Ар бир заказ үчүн монета чогултуп, келечектеги заказдарга арзандатуу розыгрышына катышыңыз', color: 'bg-pink-50 text-pink-600' },
    { icon: <CheckCircle size={24} />, title: isRu ? 'Подтверждение доставки' : 'Жеткирүүнү ырастоо', desc: isRu ? 'Получили товар? Подтвердите в разделе «Мои заказы» одним нажатием. Без подтверждения монетки не начисляются' : 'Товарды алдыңызбы? «Менин заказдарым» бөлүмүндө бир басуу менен ырастаңыз. Ырастоосуз монеталар чегерилбейт', color: 'bg-emerald-50 text-emerald-600' },
  ];

  const supplierBenefits = [
    { icon: <Users size={24} />, title: isRu ? 'Доступ к клиентам' : 'Кардарларга мүмкүнчүлүк', desc: isRu ? 'Тысячи розничных магазинов по всему Кыргызстану ищут поставщиков. Они найдут вас на Arzaman.kg' : 'Кыргызстан боюнча миңдеген чекене дүкөндөр жеткирүүчүлөрдү издейт', color: 'bg-blue-50 text-blue-600' },
    { icon: <Package size={24} />, title: isRu ? 'Простая карточка товара' : 'Жөнөкөй товар карточкасы', desc: isRu ? 'Пошаговый мастер с подсказками. Заполните по шаблону — карточка будет профессиональной' : 'Көрсөтмөлөр менен кадамдык мастер. Калып боюнча толтуруңуз — карточка профессионалдуу болот', color: 'bg-purple-50 text-purple-600' },
    { icon: <TrendingUp size={24} />, title: isRu ? 'Бейджи и продвижение' : 'Бейджилер жана жылдыруу', desc: isRu ? '«Топ продаж» — бесплатно по популярности. «Рекомендуем» — платное продвижение, подробнее в тарифах' : '«Топ сатуу» — акысыз. «Сунуштайбыз» — акылуу жылдыруу, тарифтерде кененирээк', color: 'bg-amber-50 text-amber-600' },
    { icon: <BarChart3 size={24} />, title: isRu ? 'Статистика и аналитика' : 'Статистика жана аналитика', desc: isRu ? 'Видите сколько заказов, какие товары популярны, из каких регионов покупают' : 'Канча буйрутма, кайсы товарлар популярдуу, кайсы аймактардан сатып алышат', color: 'bg-green-50 text-green-600' },
    { icon: <Shield size={24} />, title: isRu ? 'Выгодные тарифы' : 'Тиешелүү тарифтер', desc: isRu ? 'Первый месяц — только комиссия 5%, без абонентской платы. Тарифы от 2 000 сом/мес. Подробности на странице тарифов' : 'Биринчи ай — 5% комиссия гана, абоненттик төлөмсүз. Тарифтер 2 000 сом/айдан. Толугураак тарифтер барагында', color: 'bg-red-50 text-red-600' },
    { icon: <Zap size={24} />, title: isRu ? 'Telegram уведомления' : 'Telegram билдирүүлөр', desc: isRu ? 'Заказы приходят прямо в Telegram — не нужно постоянно заходить на сайт. Подключите за 2 минуты в настройках' : 'Заказдар Telegramга түздөн-түз келет — сайтка дайыма кирүүнүн кереги жок. Жөндөөлөрдө 2 мүнөттө туташтырыңыз', color: 'bg-cyan-50 text-cyan-600' },
  ];

  const howItWorksClient = [
    { step: 1, title: isRu ? 'Выбираете товары' : 'Товар тандайсыз', desc: isRu ? 'Просматриваете каталог, сравниваете цены и добавляете в корзину' : 'Каталогду карап, бааларды салыштырып, себетке кошосуз', icon: '🛒' },
    { step: 2, title: isRu ? 'Оформляете заказ' : 'Буйрутма бересиз', desc: isRu ? 'Указываете адрес, точку на карте и отправляете. Заявки уходят каждому поставщику отдельно' : 'Дарек, картадагы чекитти көрсөтүп жөнөтөсүз. Ар бир жеткирүүчүгө өзүнчө заявка', icon: '📋' },
    { step: 3, title: isRu ? 'Получаете и подтверждаете' : 'Алып, ырастайсыз', desc: isRu ? 'Поставщик доставляет товар. Вы подтверждаете получение в разделе «Мои заказы». Оплата при получении' : 'Жеткирүүчү товарды жеткирет. Сиз «Менин заказдарым» бөлүмүндө алганыңызды ырастайсыз', icon: '🚚' },
  ];

  const howItWorksSupplier = [
    { step: 1, title: isRu ? 'Регистрация' : 'Каттоо', desc: isRu ? 'Создайте аккаунт как поставщик и заполните профиль компании' : 'Жеткирүүчү катары аккаунт түзүп, компания профилин толтуруңуз', icon: '📝' },
    { step: 2, title: isRu ? 'Добавьте товары' : 'Товар кошуңуз', desc: isRu ? 'Заполните карточки — название, цена, фото. Подключите Telegram для уведомлений' : 'Карточкаларды толтуруңуз — аты, баасы, сүрөт. Билдирүүлөр үчүн Telegram туташтырыңыз', icon: '📦' },
    { step: 3, title: isRu ? 'Получайте заказы в Telegram' : 'Заказдарды Telegramдан алыңыз', desc: isRu ? 'Клиенты заказывают — вам приходит уведомление в Telegram с деталями и телефоном' : 'Кардарлар заказ берет — сизге Telegramга деталдар жана телефон менен билдирүү келет', icon: '📲' },
    { step: 4, title: isRu ? 'Доставляйте и зарабатывайте' : 'Жеткирип, акча табыңыз', desc: isRu ? 'Звоните клиенту, доставляйте товар. Комиссия 5% списывается автоматически' : 'Кардарга чалып, товарды жеткириңиз. 5% комиссия автоматтык чегерилет', icon: '💰' },
  ];

  const pricing = [
    { name: isRu ? 'Для клиентов' : 'Кардарлар үчүн', price: isRu ? 'Бесплатно' : 'Акысыз', features: [isRu ? 'Абсолютно бесплатно — без комиссий' : 'Толугу менен акысыз — комиссиясыз', isRu ? 'Заказывай и участвуй в розыгрыше призов' : 'Заказ берип, сыйлык розыгрышына катыш', isRu ? 'Каталог и поиск поставщиков' : 'Каталог жана жеткирүүчүлөрдү издөө', isRu ? 'Подтверждение доставки' : 'Жеткирүүнү ырастоо', isRu ? 'История заказов' : 'Буйрутма тарыхы'], color: 'border-blue-200 bg-blue-50', btn: 'bg-blue-600 hover:bg-blue-700' },
    { name: isRu ? 'Для поставщиков' : 'Жеткирүүчүлөр үчүн', price: isRu ? '5% с заказа' : 'Заказдан 5%', features: [isRu ? 'Размещение товаров' : 'Товарларды жайгаштыруу', isRu ? 'Telegram уведомления' : 'Telegram билдирүүлөр', isRu ? 'Профиль компании' : 'Компания профили', isRu ? 'История заказов' : 'Заказдар тарыхы', isRu ? 'Акции и баннеры' : 'Акциялар жана баннерлер'], color: 'border-green-200 bg-green-50', btn: 'bg-green-600 hover:bg-green-700' },
    { name: isRu ? 'Для агентов' : 'Агенттер үчүн', price: isRu ? '1% с заказа клиента' : 'Кардар заказынан 1%', features: [isRu ? 'Реферальная ссылка' : 'Реферал шилтемеси', isRu ? 'Привлечение клиентов' : 'Кардарларды тартуу', isRu ? 'Автоматическое начисление' : 'Автоматтык чегерүү', isRu ? 'Кабинет агента' : 'Агент кабинети', isRu ? 'Свободный график' : 'Эркин график'], color: 'border-amber-200 bg-amber-50', btn: 'bg-amber-600 hover:bg-amber-700' },
  ];

  const faq = [
    { q: isRu ? 'Как зарегистрироваться?' : 'Кантип катталуу керек?', a: isRu ? 'Нажмите "Войти" в правом верхнем углу, выберите "Регистрация" и укажите свою роль — покупатель или поставщик. Можно войти через Google, Apple, WhatsApp или Telegram.' : '"Кирүү" баскычын басып, "Каттоо" тандаңыз. Google, Apple, WhatsApp же Telegram аркылуу кирүүгө болот.' },
    { q: isRu ? 'Какие тарифы для поставщиков?' : 'Жеткирүүчүлөр үчүн тарифтер кандай?', a: isRu ? 'Комиссия 5% с каждого заказа. Тарифы от 2 000 сом/мес. Подробности на странице тарифов.' : 'Ар бир заказдан 5% комиссия. Тарифтер 2 000 сом/айдан. Толугураак тарифтер барагында.' },
    { q: isRu ? 'Как происходит оплата?' : 'Төлөм кантип жүрөт?', a: isRu ? 'Оплата при получении — наличными или переводом. Клиент платит поставщику напрямую. Комиссия 5% списывается автоматически с баланса поставщика.' : 'Алууда төлөм — накталай же которуу. Кардар жеткирүүчүгө түздөн-түз төлөйт. 5% комиссия жеткирүүчүнүн балансынан автоматтык чегерилет.' },
    { q: isRu ? 'В каких городах работает?' : 'Кайсы шаарларда иштейт?', a: isRu ? 'Бишкек, Ош, Манас, Каракол, Токмок, Нарын, Баткен, Талас, Балыкчы и Кызыл-Кия. Мы расширяемся!' : 'Бишкек, Ош, Манас, Каракол, Токмок, Нарын, Баткен, Талас, Балыкчы жана Кызыл-Кыя.' },
    { q: isRu ? 'Как поставщик узнает о заказе?' : 'Жеткирүүчү заказ жөнүндө кантип билет?', a: isRu ? 'Уведомление приходит в Telegram с деталями заказа и телефоном клиента. Подключите бота @arzaman_kg_bot в настройках профиля компании.' : 'Билдирүү Telegramга заказдын деталдары жана кардардын телефону менен келет. @arzaman_kg_bot ботту компания профилинин жөндөөлөрүнөн туташтырыңыз.' },
    { q: isRu ? 'Как клиент подтверждает получение?' : 'Кардар алганын кантип ырастайт?', a: isRu ? 'В разделе «Мои заказы» клиент нажимает «Получил» или «Не получил». Администратор получает уведомление и принимает решение.' : '«Менин заказдарым» бөлүмүндө кардар «Алдым» же «Алган жокмун» басат. Администратор билдирүү алып, чечим кабыл алат.' },
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
            Arzaman.kg
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
              {activeTab === 'suppliers' ? (isRu ? 'Стать поставщиком' : 'Жеткирүүчү болуу') : (isRu ? 'Стать клиентом' : 'Кардар болуу')}
            </Link>
          </div>
        </div>
      </section>

      {/* ПЕРЕКЛЮЧАТЕЛЬ */}
      <section className="max-w-5xl mx-auto px-4 pt-8">
        <div className="flex justify-center mb-6">
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
      </section>

      {/* СТАТИСТИКА (меняется при переключении) */}
      <section className="max-w-5xl mx-auto px-4 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ПРЕИМУЩЕСТВА */}
      <section className="max-w-5xl mx-auto px-4 py-8">

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
                {isRu ? 'Почему магазины выбирают Arzaman.kg' : 'Дүкөндөр эмне үчүн Arzaman.kg тандашат'}
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
                  desc: isRu ? 'Вспомнили в 11 вечера что закончился сахар? Откройте Arzaman.kg и закажите. Поставщик увидит заявку утром и доставит.' : 'Кечки 11де кант бүткөнүн эстедиңизби? Arzaman.kg ачып заказ кылыңыз. Жеткирүүчү заявканы эртең менен көрүп, жеткирет.' },
                { icon: '🗺️', title: isRu ? 'Доставка по карте — без ошибок' : 'Карта боюнча жеткирүү — катасыз',
                  desc: isRu ? 'Укажите точку доставки на карте — курьер точно найдёт ваш магазин. Не нужно объяснять «поверните налево после зелёного забора».' : 'Жеткирүү чекитин картадан белгилеңиз — курьер дүкөнүңүздү так табат.' },
                { icon: '📋', title: isRu ? 'Чек и история каждого заказа' : 'Ар бир заказдын чеги жана тарыхы',
                  desc: isRu ? 'После каждого заказа — чек с деталями. В истории видно что заказывали, когда, у кого, на какую сумму. Удобно для бухгалтерии.' : 'Ар бир заказдан кийин — чоо-жайлуу чек. Тарыхта эмне, качан, кимден, канча сомго заказ кылганыңыз көрүнөт.' },
                { icon: '💬', title: isRu ? 'Связь с поставщиком' : 'Жеткирүүчү менен байланыш',
                  desc: isRu ? 'Хотите уточнить наличие или договориться о доставке? Позвоните или напишите в WhatsApp прямо из карточки поставщика.' : 'Бар-жогун тактагыңыз же жеткирүү жөнүндө сүйлөшкүңүз келеби? Жеткирүүчүнүн карточкасынан чалыңыз же WhatsApp га жазыңыз.' },
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
                      <p className="text-gray-500 text-xs">{isRu ? 'Arzaman.kg / с заказа' : 'Arzaman.kg / заказдан'}</p>
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
                        ? 'Клиент может заказать в любое время — даже в 11 вечера. Заявка сохраняется и приходит вам в Telegram. Утром вы её видите и звоните клиенту. Без пропущенных заказов.'
                        : 'Кардар каалаган убакта заказ кыла алат — кечки 11де да. Заявка сакталып, Telegramга келет. Эртең менен көрүп, кардарга чаласыз. Өткөрүлүп жиберилген заказсыз.'}
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
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Добавить товар — проще простого' : 'Товар кошуу — абдан оңой'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Заполните название, цену, загрузите фото — готово. У нас есть пошаговые подсказки в каждом поле. А если застрянете — наша поддержка поможет бесплатно.'
                        : 'Аталышын, баасын жазып, сүрөт жүктөңүз — даяр. Ар бир талаада кадамдык көрсөтмөлөр бар. Тыгылып калсаңыз — колдоо акысыз жардам берет.'}
                    </p>
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
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Настройка — 15 минут. Заказы приходят в Telegram' : 'Жөндөө — 15 мүнөт. Заказдар Telegramга келет'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Регистрация — 2 минуты. Добавить товар — 3 минуты. За 15 минут вы размещаете весь каталог. После этого заказы приходят прямо в Telegram с деталями и телефоном клиента. Вы не тратите ни минуты на поиск клиентов.'
                        : 'Каттоо — 2 мүнөт. Товар кошуу — 3 мүнөт. 15 мүнөттө бүт каталогуңузду жайгаштырасыз. Андан кийин заказдар Telegramга деталдар жана кардардын телефону менен келет. Кардар издөөгө бир мүнөт да коротпойсуз.'}
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
                    <p className="font-semibold text-gray-800 mb-1">{isRu ? 'Arzaman.kg — это не сайт и не Instagram. Это целевые клиенты' : 'Arzaman.kg — бул сайт же Instagram эмес. Бул максаттуу кардарлар'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isRu
                        ? 'Instagram и сайт — это витрина, куда заходят случайные люди. Arzaman.kg — это платформа, где владельцы магазинов целенаправленно ищут поставщиков. Каждый посетитель — это потенциальный покупатель, который уже готов заказать. Разница как между рекламой на столбе и встречей с клиентом лицом к лицу.'
                        : 'Instagram жана сайт — бул кокустук адамдар кирген витрина. Arzaman.kg — бул дүкөн ээлери жеткирүүчүлөрдү максаттуу издеген платформа. Ар бир келүүчү — заказ кылууга даяр потенциалдуу сатып алуучу.'}
                    </p>
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-blue-800 text-sm font-medium">
                        💡 {isRu ? 'Instagram: 1000 просмотров = 2-3 заказа. Arzaman.kg: 100 просмотров = 10-15 заказов. Потому что здесь ищут именно поставщиков.' : 'Instagram: 1000 көрүү = 2-3 заказ. Arzaman.kg: 100 көрүү = 10-15 заказ. Себеби бул жерде жеткирүүчүлөрдү издешет.'}
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
                  ? 'Торговый представитель + Arzaman.kg = максимальный охват. Оффлайн + онлайн. Те кто подключились первыми — уже получают новых клиентов.'
                  : 'Соода өкүлү + Arzaman.kg = максималдуу камтуу. Оффлайн + онлайн. Биринчи кошулгандар — буга чейин жаңы кардарларды алышат.'}
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
                { icon: '✅', text: isRu ? 'Telegram уведомления — бесплатно' : 'Telegram билдирүүлөр — акысыз' },
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
              ? 'Присоединяйтесь к Arzaman.kg — первому B2B маркетплейсу продуктов питания в Кыргызстане'
              : 'Arzaman.kg га кошулуңуз — Кыргызстандагы биринчи B2B азык-түлүк маркетплейси'}
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
