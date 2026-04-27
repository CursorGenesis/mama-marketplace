'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateSupplier } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Save, Store, Phone, Mail, MapPin, MessageCircle, DollarSign, Truck, Send, Loader2, Check, X } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function SupplierSettingsPage() {
  const { user, isSupplier, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingId, setFetchingId] = useState(false);
  const [idSuggestion, setIdSuggestion] = useState(null);

  const BOT_USERNAME = 'arzaman_kg_bot';
  const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  // Уникальный токен для этого поставщика — Telegram передаст его боту вместе с /start
  const startToken = user?.uid ? `u${user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)}` : '';

  const fetchChatIdAuto = async () => {
    if (!BOT_TOKEN) {
      toast.error(isRu ? 'Telegram-бот не настроен' : 'Telegram бот жөндөлгөн эмес');
      return;
    }
    setFetchingId(true);
    setIdSuggestion(null);
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
      const data = await res.json();
      if (!data.ok) throw new Error('Telegram API error');
      const updates = data.result || [];

      // 1) Сначала ищем точное совпадение по нашему токену — это 100% наш пользователь
      const expected = `/start ${startToken}`;
      const exactMatch = startToken
        ? updates.find(u =>
            u.message?.from && !u.message.from.is_bot &&
            u.message.text === expected
          )
        : null;

      if (exactMatch) {
        const from = exactMatch.message.from;
        setIdSuggestion({
          id: from.id,
          name: [from.first_name, from.last_name].filter(Boolean).join(' ') || (isRu ? 'Без имени' : 'Атсыз'),
          username: from.username || '',
          confident: true,
        });
        return;
      }

      // 2) Резерв: последнее сообщение от не-бота (возможно тестовое от другого пользователя)
      const lastUserMsg = [...updates].reverse().find(u =>
        u.message?.from && !u.message.from.is_bot
      );

      if (!lastUserMsg) {
        toast.error(isRu
          ? 'Не нашли ваше сообщение. Откройте бота кнопкой выше и нажмите /start.'
          : 'Кабарыңыз табылган жок. Жогорудагы кнопка менен ботту ачып /start басыңыз.');
        return;
      }

      const from = lastUserMsg.message.from;
      setIdSuggestion({
        id: from.id,
        name: [from.first_name, from.last_name].filter(Boolean).join(' ') || (isRu ? 'Без имени' : 'Атсыз'),
        username: from.username || '',
        confident: false,
      });
    } catch (e) {
      toast.error(isRu ? 'Ошибка соединения с Telegram' : 'Telegram байланыш катасы');
      console.error('Telegram getUpdates error:', e);
    } finally {
      setFetchingId(false);
    }
  };

  const acceptIdSuggestion = () => {
    if (!idSuggestion) return;
    update('telegramChatId', String(idSuggestion.id));
    setIdSuggestion(null);
    toast.success(isRu
      ? 'ID подставлен. Не забудьте сохранить настройки.'
      : 'ID коюлду. Жөндөөлөрдү сактаганды унутпаңыз.');
  };

  const [form, setForm] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    whatsapp: '',
    telegram: '',
    telegramChatId: '',
    minOrder: '',
    minOrderUnit: 'сом',
    deliverySchedule: {},
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSupplier) { router.push('/auth'); return; }
    loadSupplier();
  }, [user, isSupplier, authLoading]);

  const loadSupplier = async () => {
    try {
      const q = query(collection(db, 'suppliers'), where('email', '==', user.email));
      const snap = await getDocs(q);
      if (snap.empty) { setLoading(false); return; }

      const sup = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setSupplier(sup);
      setForm({
        name: sup.name || '',
        description: sup.description || '',
        city: sup.city || '',
        address: sup.address || '',
        phone: sup.phone || '',
        email: sup.email || '',
        whatsapp: sup.whatsapp || '',
        telegram: sup.telegram || '',
        telegramChatId: sup.telegramChatId || '',
        minOrder: sup.minOrder || '',
        minOrderUnit: sup.minOrderUnit || 'сом',
        deliverySchedule: sup.deliverySchedule || {},
      });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!supplier) return;
    setSaving(true);
    try {
      await updateSupplier(supplier.id, {
        name: form.name,
        description: form.description,
        city: form.city,
        address: form.address,
        phone: form.phone,
        email: form.email,
        whatsapp: form.whatsapp,
        telegram: form.telegram,
        telegramChatId: form.telegramChatId,
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        minOrderUnit: form.minOrderUnit,
        deliverySchedule: form.deliverySchedule || {},
      });
      toast.success(isRu ? 'Настройки сохранены!' : 'Жөндөөлөр сакталды!');
    } catch (e) {
      toast.error(isRu ? 'Ошибка сохранения' : 'Сактоо катасы');
      console.error(e);
    }
    setSaving(false);
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Кабинет поставщика' : 'Жеткирүүчү кабинети'}
      </Link>

      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Профиль компании' : 'Компания профили'}</h1>

      <div className="space-y-6">
        {/* Основная информация */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Store size={18} /> {isRu ? 'Компания' : 'Компания'}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Название компании' : 'Компаниянын аталышы'}</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Описание' : 'Сүрөттөмө'}</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3}
                placeholder={isRu ? 'Расскажите о вашей компании, что поставляете, условия работы...' : 'Компанияңыз жөнүндө, эмне жеткиресиз, шарттар...'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Город' : 'Шаар'}</label>
                <select value={form.city} onChange={e => update('city', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">{isRu ? 'Выберите' : 'Тандаңыз'}</option>
                  <option value="Бишкек">Бишкек</option>
                  <option value="Ош">Ош</option>
                  <option value="Манас">Манас</option>
                  <option value="Каракол">Каракол</option>
                  <option value="Токмок">Токмок</option>
                  <option value="Нарын">Нарын</option>
                  <option value="Баткен">Баткен</option>
                  <option value="Талас">Талас</option>
                  <option value="Балыкчы">Балыкчы</option>
                  <option value="Кызыл-Кия">Кызыл-Кия</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Адрес' : 'Дарек'}</label>
                <input type="text" value={form.address} onChange={e => update('address', e.target.value)}
                  placeholder={isRu ? 'ул. Манаса, 40' : 'Манас көч., 40'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Минимальный заказ */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign size={18} /> {isRu ? 'Минимальный заказ' : 'Минималдуу заказ'}
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Сумма (сом)' : 'Сумма (сом)'}</label>
            <input type="number" value={form.minOrder} onChange={e => update('minOrder', e.target.value)}
              placeholder={isRu ? 'Например: 3000' : 'Мисалы: 3000'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <p className="text-xs text-gray-400 mt-2">{isRu ? 'Покупатели не смогут оформить заказ на сумму меньше указанной' : 'Сатып алуучулар көрсөтүлгөн суммадан аз заказ бере алышпайт'}</p>
        </div>

        {/* График доставки */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Truck size={18} /> {isRu ? 'График доставки' : 'Жеткирүү графиги'}
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            {isRu
              ? 'Отметьте в какие дни недели вы доставляете в каждый город. Клиенты будут видеть ближайшую дату доставки автоматически.'
              : 'Ар бир шаарга кайсы күндөрү жеткиресиз? Кардарлар жакынкы жеткирүү күнүн автоматтык көрөт.'}
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-2 font-medium text-gray-600">{isRu ? 'Город' : 'Шаар'}</th>
                  {[
                    { k: 1, ru: 'Пн', kg: 'Дш' },
                    { k: 2, ru: 'Вт', kg: 'Ше' },
                    { k: 3, ru: 'Ср', kg: 'Ша' },
                    { k: 4, ru: 'Чт', kg: 'Бш' },
                    { k: 5, ru: 'Пт', kg: 'Жм' },
                    { k: 6, ru: 'Сб', kg: 'Иш' },
                    { k: 0, ru: 'Вс', kg: 'Жк' },
                  ].map(d => (
                    <th key={d.k} className="text-center py-2 px-1 font-medium text-gray-600 text-xs">
                      {isRu ? d.ru : d.kg}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Бишкек', 'Ош', 'Манас', 'Каракол', 'Токмок', 'Нарын', 'Баткен', 'Талас', 'Балыкчы', 'Кызыл-Кия'].map(city => {
                  const days = form.deliverySchedule[city] || [];
                  return (
                    <tr key={city} className="border-b border-gray-50">
                      <td className="py-2 pr-2 text-gray-800 font-medium">{city}</td>
                      {[1, 2, 3, 4, 5, 6, 0].map(d => {
                        const checked = days.includes(d);
                        return (
                          <td key={d} className="text-center py-1">
                            <input type="checkbox" checked={checked}
                              onChange={e => {
                                const current = form.deliverySchedule[city] || [];
                                const next = e.target.checked ? [...current, d] : current.filter(x => x !== d);
                                update('deliverySchedule', { ...form.deliverySchedule, [city]: next });
                              }}
                              className="w-4 h-4 accent-primary-600 cursor-pointer" />
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Phone size={18} /> {isRu ? 'Контакты' : 'Байланыштар'}
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Телефон' : 'Телефон'}</label>
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="+996 555 123 456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                  <MessageCircle size={14} className="text-green-500" /> WhatsApp
                </label>
                <input type="tel" value={form.whatsapp} onChange={e => update('whatsapp', e.target.value)}
                  placeholder="996555123456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                <input type="text" value={form.telegram} onChange={e => update('telegram', e.target.value)}
                  placeholder="@username"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Telegram уведомления */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-blue-500" /> {isRu ? 'Telegram уведомления о заказах' : 'Заказдар жөнүндө Telegram билдирүүлөр'}
          </h2>

          {form.telegramChatId ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                ✅ {isRu ? 'Telegram подключён' : 'Telegram туташтырылды'}
              </p>
              <p className="text-green-600 text-sm mt-1">
                {isRu ? `Chat ID: ${form.telegramChatId} — уведомления о новых заказах будут приходить вам в Telegram` : `Chat ID: ${form.telegramChatId} — жаңы заказдар Telegramга келет`}
              </p>
              <button
                type="button"
                onClick={() => update('telegramChatId', '')}
                className="mt-2 text-xs text-green-700 underline hover:text-green-900"
              >
                {isRu ? 'Подключить другой Telegram' : 'Башка Telegram туташтыруу'}
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-800 font-semibold mb-3">
                {isRu ? '📲 Подключить уведомления — 2 шага:' : '📲 Билдирүүлөрдү туташтыруу — 2 кадам:'}
              </p>
              <ol className="text-sm text-blue-700 space-y-3">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <div className="flex-1">
                    <p className="mb-2">
                      {isRu ? 'Откройте нашего бота и нажмите' : 'Биздин ботту ачып басыңыз'} <b>/start</b>
                    </p>
                    <a
                      href={startToken ? `https://t.me/${BOT_USERNAME}?start=${startToken}` : `https://t.me/${BOT_USERNAME}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Send size={14} /> {isRu ? `Открыть @${BOT_USERNAME}` : `@${BOT_USERNAME} ачуу`}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <div className="flex-1">
                    <p className="mb-2">
                      {isRu ? 'Вернитесь сюда и нажмите кнопку — мы найдём ваш ID автоматически' : 'Бул жерге кайтып келип кнопканы басыңыз — IDңиз автоматтык табылат'}
                    </p>
                    <button
                      type="button"
                      onClick={fetchChatIdAuto}
                      disabled={fetchingId}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      {fetchingId
                        ? <><Loader2 size={14} className="animate-spin" /> {isRu ? 'Ищем...' : 'Изделүүдө...'}</>
                        : <><MessageCircle size={14} /> {isRu ? 'Получить мой ID автоматически' : 'IDны автоматтык алуу'}</>}
                    </button>
                  </div>
                </li>
              </ol>
            </div>
          )}

          {/* Найденное предложение Chat ID */}
          {idSuggestion && (
            <div className={`rounded-xl p-4 mb-4 border ${idSuggestion.confident ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <p className={`font-semibold mb-2 ${idSuggestion.confident ? 'text-green-800' : 'text-amber-800'}`}>
                {idSuggestion.confident
                  ? (isRu ? '✅ Ваш Telegram найден' : '✅ Telegramыңыз табылды')
                  : (isRu ? '🔍 Возможно это вы — проверьте имя' : '🔍 Балким бул сизсиз — атты текшериңиз')}
              </p>
              <div className={`bg-white rounded-lg p-3 mb-3 border ${idSuggestion.confident ? 'border-green-200' : 'border-amber-200'}`}>
                <p className="text-sm">
                  <b>{idSuggestion.name}</b>
                  {idSuggestion.username && <span className="text-gray-500"> · @{idSuggestion.username}</span>}
                </p>
                <p className="text-xs text-gray-500 mt-1">Chat ID: <span className="font-mono">{idSuggestion.id}</span></p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={acceptIdSuggestion}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Check size={14} /> {idSuggestion.confident ? (isRu ? 'Использовать этот ID' : 'Бул IDны колдонуу') : (isRu ? 'Да, это я' : 'Ооба, бул мен')}
                </button>
                <button
                  type="button"
                  onClick={() => setIdSuggestion(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  <X size={14} /> {isRu ? 'Не я' : 'Мен эмес'}
                </button>
              </div>
              {!idSuggestion.confident && (
                <p className="text-xs text-amber-700 mt-2">
                  {isRu
                    ? 'Это последнее сообщение боту, но возможно от другого пользователя. Если не вы — нажмите кнопку «Открыть бота» выше ещё раз, потом /start, и повторите.'
                    : 'Бул ботко акыркы кабар, бирок башка колдонуучудан болушу мүмкүн. Эгер сиз эмес болсоңуз — «Ботту ачуу» кнопкасын дагы басыңыз, /start, кайталаңыз.'}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isRu ? 'Или введите Chat ID вручную' : 'Же Chat IDны кол менен киргизиңиз'}
            </label>
            <input type="text" value={form.telegramChatId} onChange={e => update('telegramChatId', e.target.value)}
              placeholder={isRu ? 'Например: 6067853905' : 'Мисалы: 6067853905'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">
              {isRu
                ? 'Если автопоиск не сработал — узнайте свой ID через бота @userinfobot и вставьте сюда'
                : 'Автопоиск иштебесе — IDыңызды @userinfobot аркылуу билип чаптаңыз'}
            </p>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50">
          <Save size={18} /> {saving ? (isRu ? 'Сохранение...' : 'Сакталууда...') : (isRu ? 'Сохранить' : 'Сактоо')}
        </button>
      </div>
    </div>
  );
}
