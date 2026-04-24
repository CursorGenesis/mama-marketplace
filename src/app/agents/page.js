'use client';
import { useLang } from '@/context/LangContext';
import { DollarSign, Users, Smartphone, TrendingUp, ArrowRight, Calculator, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function AgentsPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [shops, setShops] = useState(20);
  const [avgOrder, setAvgOrder] = useState(5000);
  const [ordersPerMonth, setOrdersPerMonth] = useState(4);
  const [openFaq, setOpenFaq] = useState(null);

  const [percent, setPercent] = useState(1);
  const totalOrders = shops * ordersPerMonth;
  const totalRevenue = totalOrders * avgOrder;
  const agentEarnings = Math.round(totalRevenue * percent / 100);

  const faq = [
    {
      qRu: 'Кто может стать агентом?',
      aRu: 'Любой человек — торговые представители, менеджеры по продажам, фрилансеры. Нужен только телефон и желание.',
      qKg: 'Ким агент боло алат?',
      aKg: 'Каалаган адам — соода өкүлдөрү, сатуу менеджерлери, фрилансерлер. Телефон жана каалоо гана керек.',
    },
    {
      qRu: 'Как я получаю деньги?',
      aRu: 'Выплата раз в месяц на Элсом, Мбанк или О!Деньги. Минимальная сумма для вывода — 500 сом.',
      qKg: 'Акчамды кантип алам?',
      aKg: 'Айына бир жолу Элсом, Мбанк же О!Деньги аркылуу. Чыгаруу үчүн минималдуу сумма — 500 сом.',
    },
    {
      qRu: 'Нужно ли увольняться с текущей работы?',
      aRu: 'Нет! Это дополнительный доход. Вы продолжаете работать как обычно, просто оформляете заказы через платформу вместо бумажки.',
      qKg: 'Учурдагы ишимден кетишим керекпи?',
      aKg: 'Жок! Бул кошумча киреше. Адаттагыдай эле иштей бересиз, жөн гана заказдарды кагазга эмес, платформа аркылуу тариздейсиз.',
    },
    {
      qRu: 'Что если поставщик не на платформе?',
      aRu: 'Вы можете пригласить поставщика — он получит бесплатный месяц. А вы будете получать 1% от всех заказов через платформу.',
      qKg: 'Жеткирүүчү платформада болбосочу?',
      aKg: 'Жеткирүүчүнү чакырсаңыз болот — ал акысыз ай алат. Ал эми сиз платформа аркылуу бардык заказдардан 1% аласыз.',
    },
    {
      qRu: 'Что будет если я перестану работать агентом?',
      aRu: 'Если вы не заходили на платформу 30 дней — статус автоматически станет «Неактивен». Если не собрали ни одного заказа за 60 дней — отключение. За 7 дней до этого придёт уведомление. Ваши магазины останутся на платформе, но % вы перестанете получать.',
      qKg: 'Агент болуп иштебей калсам эмне болот?',
      aKg: 'Платформага 30 күн кирбесеңиз — статус автоматтык түрдө «Активдүү эмес» болот. 60 күндө бир да заказ чогултпасаңыз — өчүрүлөт. 7 күн мурун билдирүү келет. Дүкөндөрүңүз платформада калат, бирок % алууну токтотосуз.',
    },
    {
      qRu: 'Как формировать заказ через платформу?',
      aRu: 'В личном кабинете агента выбираете магазин, добавляете товары из каталога поставщика, нажимаете "Отправить". Заказ сразу поступает поставщику — без бумажек и WhatsApp.',
      qKg: 'Платформа аркылуу заказды кантип түзүү?',
      aKg: 'Агенттин кабинетинде дүкөн тандайсыз, жеткирүүчүнүн каталогунан товарларды кошосуз, "Жөнөтүү" басасыз. Заказ дароо жеткирүүчүгө барат — кагазсыз жана WhatsApp сыз.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-green-900 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            💰 {isRu ? 'Зарабатывай с каждого заказа' : 'Ар бир заказдан табыңыз'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {isRu ? 'Стань агентом платформы' : 'Платформанын агенти бол'}
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
            {isRu
              ? 'Подключай магазины, оформляй заказы через приложение вместо бумажки — и получай 1% от каждого заказа.'
              : 'Дүкөндөрдү туташтырыңыз, заказдарды кагаздын ордуна тиркеме аркылуу тариздеңиз — жана ар бир заказдан 1% алыңыз.'}
          </p>
          <Link
            href="/auth?role=agent"
            className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors"
          >
            {isRu ? 'Стать агентом' : 'Агент болуу'} <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">

        {/* Преимущества */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 -mt-8 mb-12">
          {[
            {
              icon: <DollarSign size={24} />, color: 'bg-green-100 text-green-600',
              titleRu: '1% от каждого заказа', titleKg: 'Ар бир заказдан 1%',
              descRu: 'Магазин заказывает через платформу — вы получаете 1% с каждого заказа. Каждый месяц пока вы агент.',
              descKg: 'Дүкөн платформа аркылуу заказ кылат — ар бир заказдан 1% аласыз. Агент болуп жатканда ар бир ай.',
            },
            {
              icon: <Smartphone size={24} />, color: 'bg-blue-100 text-blue-600',
              titleRu: 'Заказы через приложение', titleKg: 'Тиркеме аркылуу заказдар',
              descRu: 'Забудьте про бумажки и WhatsApp. Оформляйте заказы для магазинов прямо в приложении — быстро и без ошибок.',
              descKg: 'Кагаздарды жана WhatsApp ты унутуңуз. Заказдарды дүкөндөр үчүн тиркемеден тариздеңиз — тез жана катасыз.',
            },
            {
              icon: <Users size={24} />, color: 'bg-purple-100 text-purple-600',
              titleRu: 'Ваши магазины — ваш доход', titleKg: 'Сиздин дүкөндөр — сиздин киреше',
              descRu: 'Подключайте магазины и получайте доход пока работаете агентом. Больше магазинов — больше доход.',
              descKg: 'Дүкөндөрдү туташтырыңыз жана агент болуп иштегенде киреше алыңыз. Дүкөндөр көп — киреше көп.',
            },
            {
              icon: <TrendingUp size={24} />, color: 'bg-amber-100 text-amber-600',
              titleRu: 'Без вложений', titleKg: 'Салымсыз',
              descRu: 'Не нужно ничего покупать или вкладывать. Только ваш телефон и время.',
              descKg: 'Эч нерсе сатып алуунун же салуунун кереги жок. Телефонуңуз жана убактыңыз гана.',
            },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-lg">
              <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mb-3`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{isRu ? item.titleRu : item.titleKg}</h3>
              <p className="text-sm text-gray-500">{isRu ? item.descRu : item.descKg}</p>
            </div>
          ))}
        </div>

        {/* Калькулятор дохода */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Calculator size={20} className="text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{isRu ? 'Калькулятор дохода' : 'Киреше калькулятору'}</h2>
          </div>

          <div className="mb-4">
            <div className="py-2 px-4 bg-green-500 text-white rounded-lg text-sm font-semibold text-center">
              {isRu ? 'Комиссия агента — 1% с каждого заказа' : 'Агент комиссиясы — ар бир заказдан 1%'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {isRu ? 'Кол-во магазинов' : 'Дүкөндөр саны'}
              </label>
              <input type="range" min="5" max="100" value={shops} onChange={e => setShops(Number(e.target.value))}
                className="w-full accent-green-500" />
              <div className="text-center font-bold text-lg text-gray-800">{shops}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {isRu ? 'Средний заказ (сом)' : 'Орточо заказ (сом)'}
              </label>
              <input type="range" min="1000" max="20000" step="500" value={avgOrder} onChange={e => setAvgOrder(Number(e.target.value))}
                className="w-full accent-green-500" />
              <div className="text-center font-bold text-lg text-gray-800">{avgOrder.toLocaleString('ru-RU')}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {isRu ? 'Заказов в месяц от магазина' : 'Дүкөндөн айына заказ'}
              </label>
              <input type="range" min="1" max="12" value={ordersPerMonth} onChange={e => setOrdersPerMonth(Number(e.target.value))}
                className="w-full accent-green-500" />
              <div className="text-center font-bold text-lg text-gray-800">{ordersPerMonth}</div>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-5 text-center border border-green-200">
            <p className="text-sm text-green-700 mb-1">{isRu ? 'Ваш доход в месяц' : 'Айлык кирешеңиз'}</p>
            <p className="text-4xl font-extrabold text-green-700">{agentEarnings.toLocaleString('ru-RU')} {isRu ? 'сом' : 'сом'}</p>
            <p className="text-xs text-green-600 mt-2">
              {isRu
                ? `${totalOrders} заказов × ${avgOrder.toLocaleString('ru-RU')} сом × ${percent}%`
                : `${totalOrders} заказ × ${avgOrder.toLocaleString('ru-RU')} сом × ${percent}%`}
            </p>
          </div>
        </div>

        {/* Как это работает */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">{isRu ? 'Как это работает' : 'Кантип иштейт'}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: 1, emoji: '📝', titleRu: 'Регистрация', titleKg: 'Каттоо', descRu: 'Зарегистрируйтесь как агент — бесплатно за 1 минуту', descKg: '1 мүнөттө акысыз агент катары катталыңыз' },
              { step: 2, emoji: '🏪', titleRu: 'Подключайте магазины', titleKg: 'Дүкөндөрдү туташтырыңыз', descRu: 'Приходите в магазин, помогите зарегистрироваться по вашему коду', descKg: 'Дүкөнгө келиңиз, кодуңуз менен катталууга жардам бериңиз' },
              { step: 3, emoji: '📱', titleRu: 'Оформляйте заказы', titleKg: 'Заказдарды тариздеңиз', descRu: 'Собирайте заказы через приложение — быстро и без бумажек', descKg: 'Заказдарды тиркеме аркылуу тариздеңиз — тез жана кагазсыз' },
              { step: 4, emoji: '💰', titleRu: 'Получайте 1%', titleKg: '1% алыңыз', descRu: 'С каждого заказа ваших магазинов пока вы работаете агентом', descKg: 'Агент болуп иштеп жатканда дүкөндөрүңүздүн ар бир заказынан' },
            ].map(s => (
              <div key={s.step} className="text-center bg-white rounded-xl p-5 shadow-sm">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">{s.step}</div>
                <h3 className="font-bold text-gray-800 text-sm mb-1">{isRu ? s.titleRu : s.titleKg}</h3>
                <p className="text-xs text-gray-500">{isRu ? s.descRu : s.descKg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">{isRu ? 'Частые вопросы' : 'Көп берилген суроолор'}</h2>
          <div className="space-y-2">
            {faq.map((f, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="flex-1 font-semibold text-gray-800 text-sm">{isRu ? f.qRu : f.qKg}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{isRu ? f.aRu : f.aKg}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 sm:p-12 text-center text-white mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {isRu ? 'Начни зарабатывать сегодня' : 'Бүгүн табууну баштаңыз'}
          </h2>
          <p className="text-slate-300 mb-6 max-w-md mx-auto">
            {isRu
              ? 'Регистрация бесплатная. Без вложений. Первые деньги — уже в этом месяце.'
              : 'Каттоо акысыз. Салымсыз. Биринчи акча — ушул айда эле.'}
          </p>
          <Link
            href="/auth?role=agent"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
          >
            {isRu ? 'Стать агентом' : 'Агент болуу'} <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
