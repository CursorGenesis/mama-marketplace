'use client';
import { useLang } from '@/context/LangContext';
import { MessageCircle, Mail, Clock, Phone, ChevronDown, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const faqData = [
  {
    qRu: 'Как зарегистрироваться как поставщик?',
    aRu: 'Нажмите «Регистрация», выберите роль «Поставщик», заполните данные. После регистрации добавьте товары в личном кабинете.',
    qKg: 'Жеткирүүчү катары кантип катталса болот?',
    aKg: '«Каттоо» басыңыз, «Жеткирүүчү» ролун тандаңыз, маалыматтарды толтуруңуз. Катталгандан кийин жеке кабинетте товарларды кошуңуз.',
  },
  {
    qRu: 'Как оформить заказ?',
    aRu: 'Добавьте товары в корзину, укажите имя, телефон и адрес доставки, нажмите «Отправить заявку». Поставщик свяжется с вами.',
    qKg: 'Буйрутма кантип берүүгө болот?',
    aKg: 'Товарларды себетке кошуңуз, атыңызды, телефонуңузду жана жеткирүү дарегин көрсөтүңүз, «Заявка жөнөтүү» басыңыз.',
  },
  {
    qRu: 'Какие способы оплаты?',
    aRu: 'Оплата при получении — наличными или переводом на Элсом/Мбанк. Условия оплаты обсуждаются с поставщиком.',
    qKg: 'Кандай төлөө ыкмалары бар?',
    aKg: 'Алганда төлөө — накталай же Элсом/Мбанк аркылуу которуу. Төлөө шарттары жеткирүүчү менен талкууланат.',
  },
  {
    qRu: 'Сколько стоит размещение для поставщиков?',
    aRu: 'Первый месяц бесплатно на любом тарифе. Далее — от 1 000 сом/мес. Подробности на странице тарифов.',
    qKg: 'Жеткирүүчүлөр үчүн жайгашуу канча турат?',
    aKg: 'Каалаган тарифте биринчи ай акысыз. Андан кийин — 1 000 сом/айдан. Толугураак тарифтер барагында.',
  },
  {
    qRu: 'Как работает доставка?',
    aRu: 'Доставку осуществляет сам поставщик. При заказе вы указываете адрес и точку на карте — поставщик видит куда везти.',
    qKg: 'Жеткирүү кантип иштейт?',
    aKg: 'Жеткирүүнү жеткирүүчүнүн өзү жүзөгө ашырат. Буйрутма берүүдө даректи жана картадагы чекитти көрсөтөсүз.',
  },
  {
    qRu: 'Можно ли вернуть товар?',
    aRu: 'Возврат обсуждается напрямую с поставщиком. Свяжитесь через WhatsApp или Telegram на странице поставщика.',
    qKg: 'Товарды кайтарса болобу?',
    aKg: 'Кайтаруу жеткирүүчү менен түз талкууланат. Жеткирүүчүнүн баракчасындагы WhatsApp же Telegram аркылуу байланышыңыз.',
  },
];

export default function SupportPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{isRu ? 'Поддержка' : 'Колдоо'}</h1>
      <p className="text-gray-500 text-sm mb-8">
        {isRu ? 'Свяжитесь с нами или найдите ответ в FAQ' : 'Биз менен байланышыңыз же FAQ дан жооп табыңыз'}
      </p>

      {/* Контакты */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <a
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4 hover:bg-green-100 transition-colors"
        >
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">WhatsApp</h3>
            <p className="text-sm text-gray-500">{isRu ? 'Ответим за 5 минут' : '5 мүнөттө жооп беребиз'}</p>
          </div>
        </a>

        <a
          href="https://t.me/MarketKG_support"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-center gap-4 hover:bg-blue-100 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Telegram</h3>
            <p className="text-sm text-gray-500">@MarketKG_support</p>
          </div>
        </a>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
            <Mail size={24} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Email</h3>
            <p className="text-sm text-gray-500">info@marketkg.com</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={24} className="text-gray-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{isRu ? 'Время работы' : 'Иш убактысы'}</h3>
            <p className="text-sm text-gray-500">{isRu ? 'Пн-Сб: 09:00 — 18:00' : 'Дш-Шб: 09:00 — 18:00'}</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold mb-4">{isRu ? 'Частые вопросы' : 'Көп берилген суроолор'}</h2>
      <div className="space-y-2 mb-10">
        {faqData.map((faq, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="flex-1 font-semibold text-gray-800 text-sm">{isRu ? faq.qRu : faq.qKg}</span>
              <ChevronDown size={18} className={`text-gray-400 transition-transform shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-600 leading-relaxed">{isRu ? faq.aRu : faq.aKg}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ссылки */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/pricing" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100">
          <span className="text-2xl block mb-2">💰</span>
          <span className="text-sm font-medium text-gray-700">{isRu ? 'Тарифы' : 'Тарифтер'}</span>
        </Link>
        <Link href="/about" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow border border-gray-100">
          <span className="text-2xl block mb-2">ℹ️</span>
          <span className="text-sm font-medium text-gray-700">{isRu ? 'О платформе' : 'Платформа жөнүндө'}</span>
        </Link>
      </div>
    </div>
  );
}
