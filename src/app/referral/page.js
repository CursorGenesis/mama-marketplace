'use client';
import { useLang } from '@/context/LangContext';
import { Search, Send, MessageCircle, CheckCircle, Clock, Building2, Phone, MapPin, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

// Демо: уже поступившие заявки
const demoRequests = [
  { id: 1, company: 'Ак-Суу Молоко', city: 'Каракол', category: 'Молочные продукты', status: 'connected', date: '2026-03-20', requestedBy: 'Магазин "Береке"' },
  { id: 2, company: 'Ош Нан', city: 'Ош', category: 'Хлеб и выпечка', status: 'searching', date: '2026-03-25', requestedBy: 'Мини-маркет "Айжан"' },
  { id: 3, company: 'Фрукты от Ахмата', city: 'Джалал-Абад', category: 'Фрукты и овощи', status: 'new', date: '2026-03-28', requestedBy: 'Магазин "Достук"' },
];

export default function InviteSupplierPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';

  const [form, setForm] = useState({ company: '', city: '', category: '', phone: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);
  const [requests, setRequests] = useState(demoRequests);

  const categories = [
    { id: 'dairy', ru: 'Молочные продукты', kg: 'Сүт азыктары' },
    { id: 'drinks', ru: 'Напитки', kg: 'Суусундуктар' },
    { id: 'grocery', ru: 'Бакалея', kg: 'Бакалея' },
    { id: 'meat', ru: 'Мясо и птица', kg: 'Эт жана канаттуулар' },
    { id: 'fruits', ru: 'Фрукты и овощи', kg: 'Жемиштер жана жашылчалар' },
    { id: 'confectionery', ru: 'Кондитерка', kg: 'Кондитердик' },
    { id: 'frozen', ru: 'Заморозка', kg: 'Тоңдурулган' },
    { id: 'household', ru: 'Бытовая химия', kg: 'Тиричилик химиясы' },
    { id: 'other', ru: 'Другое', kg: 'Башка' },
  ];

  const cities = ['Бишкек', 'Ош', 'Джалал-Абад', 'Каракол', 'Токмок', 'Нарын', 'Баткен', 'Талас'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.company.trim()) {
      toast.error(isRu ? 'Укажите название компании' : 'Компаниянын атын жазыңыз');
      return;
    }

    const newRequest = {
      id: Date.now(),
      company: form.company,
      city: form.city || 'Не указан',
      category: form.category || 'Другое',
      status: 'new',
      date: new Date().toISOString().split('T')[0],
      requestedBy: isRu ? 'Вы' : 'Сиз',
    };

    setRequests([newRequest, ...requests]);
    setSubmitted(true);
    setForm({ company: '', city: '', category: '', phone: '', comment: '' });
    toast.success(isRu ? 'Заявка отправлена! Мы свяжемся с этим поставщиком' : 'Заявка жөнөтүлдү! Бул жеткирүүчү менен байланышабыз');

    setTimeout(() => setSubmitted(false), 3000);
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: { bg: 'bg-blue-100 text-blue-700', text: isRu ? 'Новая заявка' : 'Жаңы заявка', icon: <Clock size={12} /> },
      searching: { bg: 'bg-yellow-100 text-yellow-700', text: isRu ? 'Ищем контакт' : 'Байланыш издеп жатабыз', icon: <Search size={12} /> },
      connected: { bg: 'bg-green-100 text-green-700', text: isRu ? 'Подключён!' : 'Кошулду!', icon: <CheckCircle size={12} /> },
    };
    const s = styles[status] || styles.new;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg}`}>
        {s.icon} {s.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {isRu ? 'Пригласить поставщика' : 'Жеткирүүчүнү чакыруу'}
          </h1>
          <p className="text-primary-100 text-lg max-w-xl mx-auto">
            {isRu
              ? 'Не нашли нужного поставщика? Расскажите нам — мы найдём его и подключим к платформе'
              : 'Керектүү жеткирүүчүнү таппадыңызбы? Бизге айтыңыз — биз аны таап, платформага кошобуз'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Форма заявки */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="font-bold text-lg text-gray-800 mb-1">
            {isRu ? 'Какого поставщика вы ищете?' : 'Кайсы жеткирүүчүнү издеп жатасыз?'}
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            {isRu ? 'Заполните форму — мы свяжемся с поставщиком и пригласим его на MarketKG' : 'Форманы толтуруңуз — жеткирүүчү менен байланышып, MarketKG га чакырабыз'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Название компании */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRu ? 'Название компании / поставщика' : 'Компаниянын / жеткирүүчүнүн аты'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })}
                placeholder={isRu ? 'Например: Шоро, Бишкек Сүт...' : 'Мисалы: Шоро, Бишкек Сүт...'}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Город и Категория */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRu ? 'Город' : 'Шаар'}
                </label>
                <select
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{isRu ? 'Выберите город' : 'Шаар тандаңыз'}</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isRu ? 'Категория товаров' : 'Товар категориясы'}
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{isRu ? 'Выберите категорию' : 'Категория тандаңыз'}</option>
                  {categories.map(c => <option key={c.id} value={isRu ? c.ru : c.kg}>{isRu ? c.ru : c.kg}</option>)}
                </select>
              </div>
            </div>

            {/* Телефон поставщика */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRu ? 'Телефон поставщика (если знаете)' : 'Жеткирүүчүнүн телефону (билсеңиз)'}
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="+996 ..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Комментарий */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isRu ? 'Что именно хотите заказывать?' : 'Эмне заказ кылгыңыз келет?'}
              </label>
              <textarea
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                placeholder={isRu ? 'Например: молоко, кефир, сметану оптом каждую неделю' : 'Мисалы: сүт, кефир, каймак оптом ар жума'}
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Кнопка */}
            <button
              type="submit"
              disabled={submitted}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all ${
                submitted
                  ? 'bg-green-500 text-white'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {submitted ? (
                <><CheckCircle size={18} /> {isRu ? 'Заявка отправлена!' : 'Заявка жөнөтүлдү!'}</>
              ) : (
                <><Send size={18} /> {isRu ? 'Отправить заявку' : 'Заявка жөнөтүү'}</>
              )}
            </button>
          </form>
        </div>

        {/* Как это работает */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="font-bold text-lg text-gray-800 mb-6">
            {isRu ? 'Как это работает' : 'Кантип иштейт'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: 1, icon: '📝', titleRu: 'Вы отправляете заявку', titleKg: 'Заявка жөнөтөсүз', descRu: 'Укажите название поставщика и что хотите заказывать', descKg: 'Жеткирүүчүнүн атын жана эмне заказ кылгыңыз келгенин жазыңыз' },
              { step: 2, icon: '📞', titleRu: 'Мы находим и звоним', titleKg: 'Биз таап, чалабыз', descRu: 'Наша команда связывается с поставщиком и приглашает на платформу', descKg: 'Биздин команда жеткирүүчү менен байланышып, платформага чакырат' },
              { step: 3, icon: '✅', titleRu: 'Поставщик подключается', titleKg: 'Жеткирүүчү кошулат', descRu: 'Он добавляет товары — и вы можете заказывать через MarketKG', descKg: 'Товарларын кошот — жана сиз MarketKG аркылуу заказ кыла аласыз' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{isRu ? s.titleRu : s.titleKg}</h3>
                <p className="text-xs text-gray-500">{isRu ? s.descRu : s.descKg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Заявки от других клиентов */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="font-bold text-lg text-gray-800 mb-1">
            {isRu ? 'Последние заявки' : 'Акыркы заявкалар'}
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            {isRu ? 'Другие клиенты тоже ищут поставщиков' : 'Башка кардарлар да жеткирүүчүлөрдү издешет'}
          </p>

          <div className="space-y-3">
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{r.company}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><MapPin size={10} /> {r.city}</span>
                      <span>·</span>
                      <span>{r.category}</span>
                    </p>
                  </div>
                </div>
                {getStatusBadge(r.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Или напишите нам */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 sm:p-8 mb-12 text-center text-white">
          <h3 className="font-bold text-lg mb-2">
            {isRu ? 'Или просто напишите нам' : 'Же жөн гана бизге жазыңыз'}
          </h3>
          <p className="text-green-100 text-sm mb-4">
            {isRu ? 'Расскажите какого поставщика ищете — мы найдём' : 'Кайсы жеткирүүчүнү издеп жатканыңызды айтыңыз — биз табабыз'}
          </p>
          <a
            href="https://wa.me/996555000000?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5!%20%D0%98%D1%89%D1%83%20%D0%BF%D0%BE%D1%81%D1%82%D0%B0%D0%B2%D1%89%D0%B8%D0%BA%D0%B0:"
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg"
          >
            <MessageCircle size={18} />
            {isRu ? 'Написать в WhatsApp' : 'WhatsApp га жазуу'}
          </a>
        </div>
      </div>
    </div>
  );
}
