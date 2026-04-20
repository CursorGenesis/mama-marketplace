'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateSupplier } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Save, Store, Phone, Mail, MapPin, MessageCircle, DollarSign } from 'lucide-react';
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
              <p className="text-green-600 text-sm mt-1">{isRu ? 'Уведомления о новых заказах будут приходить вам в Telegram' : 'Жаңы заказдар жөнүндө билдирүүлөр Telegramга келет'}</p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-blue-800 font-semibold mb-3">{isRu ? '📲 Как подключить уведомления:' : '📲 Билдирүүлөрдү кантип туташтыруу:'}</p>
              <ol className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                  <span>{isRu ? 'Откройте Telegram и найдите бота' : 'Telegramды ачыңыз жана ботту табыңыз'} <b>@userinfobot</b></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                  <span>{isRu ? 'Отправьте ему любое сообщение — он ответит вашим' : 'Ага каалаган кабар жөнөтүңүз — ал сиздин'} <b>ID</b> {isRu ? '(число)' : '(сан) менен жооп берет'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                  <span>{isRu ? 'Скопируйте число' : 'Санды көчүрүңүз'} <b>Id</b> {isRu ? 'и вставьте в поле ниже' : 'жана төмөнкү талаага чаптаңыз'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                  <span>{isRu ? 'Найдите бота' : 'Ботту табыңыз'} <b>@arzaman_kg_bot</b> {isRu ? 'и отправьте' : 'жана жөнөтүңүз'} <b>/start</b></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
                  <span>{isRu ? 'Нажмите' : 'Басыңыз'} <b>{isRu ? 'Сохранить' : 'Сактоо'}</b> — {isRu ? 'готово! Заказы будут приходить в Telegram' : 'даяр! Заказдар Telegramга келет'}</span>
                </li>
              </ol>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telegram Chat ID</label>
            <input type="text" value={form.telegramChatId} onChange={e => update('telegramChatId', e.target.value)}
              placeholder={isRu ? 'Например: 6067853905' : 'Мисалы: 6067853905'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <p className="text-xs text-gray-400 mt-1">{isRu ? 'После сохранения новые заказы будут приходить в ваш Telegram' : 'Сактагандан кийин жаңы заказдар Telegramыңызга келет'}</p>
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
