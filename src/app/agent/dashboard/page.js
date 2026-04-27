'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import RoleGuard from '@/components/RoleGuard';
import { Store, Package, DollarSign, TrendingUp, Plus, ClipboardList, Copy, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const demoShops = [
  { id: 'sh1', name: 'Мини-маркет "Береке"', address: 'ул. Манаса, 40', city: 'Бишкек', orders: 12, lastOrder: '2026-04-06' },
  { id: 'sh2', name: 'Магазин "Достук"', address: 'ул. Токтогула, 120', city: 'Бишкек', orders: 8, lastOrder: '2026-04-05' },
  { id: 'sh3', name: 'Супермаркет "Народный"', address: 'пр. Чуй, 150', city: 'Бишкек', orders: 23, lastOrder: '2026-04-07' },
  { id: 'sh4', name: 'Кафе "Жаштык"', address: 'ул. Ахунбаева, 93', city: 'Бишкек', orders: 5, lastOrder: '2026-04-03' },
  { id: 'sh5', name: 'Мини-маркет "Айжан"', address: 'ул. Киевская, 77', city: 'Бишкек', orders: 15, lastOrder: '2026-04-07' },
];

const demoRecentOrders = [
  { id: 'o1', shop: 'Супермаркет "Народный"', supplier: 'Шоро', items: 8, total: 24000, date: '2026-04-07', status: 'delivered' },
  { id: 'o2', shop: 'Мини-маркет "Айжан"', supplier: 'Бишкек Сүт', items: 6, total: 9800, date: '2026-04-07', status: 'in_transit' },
  { id: 'o3', shop: 'Мини-маркет "Береке"', supplier: 'Алтын Дан', items: 3, total: 12500, date: '2026-04-06', status: 'delivered' },
  { id: 'o4', shop: 'Магазин "Достук"', supplier: 'Алтын Дан', items: 5, total: 8900, date: '2026-04-05', status: 'delivered' },
  { id: 'o5', shop: 'Кафе "Жаштык"', supplier: 'Шоро', items: 4, total: 15600, date: '2026-04-03', status: 'refused' },
];

export default function AgentDashboardPage() {
  return (
    <RoleGuard roles={['agent', 'admin']}>
      <AgentDashboardContent />
    </RoleGuard>
  );
}

function AgentDashboardContent() {
  const { user, profile } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [copied, setCopied] = useState(false);

  // Реф-код агента — 8 символов из UID. Раньше было 4 (1.6 млн вариантов = коллизия
  // >50% при 1500 агентах). С 8 символами пространство 2.8 трлн — коллизий на нашей шкале не будет.
  const agentCode = user ? 'AGT-' + (user.uid || '').slice(0, 8).toUpperCase() : 'AGT-DEMO';
  const totalOrders = demoRecentOrders.length;
  const totalRevenue = demoRecentOrders.reduce((s, o) => s + o.total, 0);
  const earnings = Math.round(totalRevenue * 0.01);

  const statusLabel = (status) => {
    const map = {
      delivered: { text: isRu ? 'Доставлено' : 'Жеткирилди', color: 'bg-green-100 text-green-700' },
      in_transit: { text: isRu ? 'В пути' : 'Жолдо', color: 'bg-blue-100 text-blue-700' },
      refused: { text: isRu ? 'Отказ' : 'Баш тартуу', color: 'bg-red-100 text-red-700' },
      pending: { text: isRu ? 'Ожидает' : 'Күтүүдө', color: 'bg-gray-100 text-gray-700' },
    };
    const s = map[status] || map.pending;
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}>{s.text}</span>;
  };

  const refLink = typeof window !== 'undefined'
    ? `${window.location.origin}/mama-marketplace/auth?ref=${agentCode}`
    : `https://cursorgenesis.github.io/mama-marketplace/auth?ref=${agentCode}`;

  const refMessage = isRu
    ? `Привет! Зарегистрируйтесь на Arzaman.kg — B2B маркетплейс поставщиков Кыргызстана. Заказывайте товары оптом по лучшим ценам!\n\nРегистрация: ${refLink}`
    : `Саламатсызбы! Arzaman.kg — Кыргызстандын B2B жеткирүүчүлөр маркетплейсине катталыңыз. Товарларды оптом эң жакшы баада заказ кылыңыз!\n\nКаттоо: ${refLink}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    toast.success(isRu ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(refMessage)}`, '_blank');
  };

  const handleShareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(isRu ? 'Зарегистрируйтесь на Arzaman.kg!' : 'Arzaman.kg ге катталыңыз!')}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isRu ? 'Кабинет агента' : 'Агент кабинети'}</h1>
          <p className="text-gray-500 text-sm">{profile?.name || (isRu ? 'Демо агент' : 'Демо агент')}</p>
        </div>
      </div>

      {/* Реферальная ссылка */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-bold text-green-800">{isRu ? 'Ваша ссылка для подключения магазинов' : 'Дүкөндөрдү туташтыруу шилтемеңиз'}</span>
          <span className="font-mono text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">{agentCode}</span>
        </div>
        <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-600 font-mono mb-3 break-all">{refLink}</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-green-300 text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors">
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? (isRu ? 'Скопировано!' : 'Көчүрүлдү!') : (isRu ? 'Копировать ссылку' : 'Шилтемени көчүрүү')}
          </button>
          <button onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <button onClick={handleShareTelegram}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Telegram
          </button>
        </div>
      </div>

      {/* Инструкция */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">{isRu ? 'Как подключить магазин за 3 шага' : 'Дүкөндү 3 кадам менен кантип туташтыруу'}</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <p className="text-sm text-gray-600">{isRu ? 'Отправьте ссылку выше владельцу магазина через WhatsApp или Telegram' : 'Жогорудагы шилтемени дүкөн ээсине WhatsApp же Telegram аркылуу жөнөтүңүз'}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <p className="text-sm text-gray-600">{isRu ? 'Магазин регистрируется по ссылке как покупатель — он автоматически привязывается к вам' : 'Дүкөн шилтеме аркылуу сатып алуучу катары катталат — ал автоматтык түрдө сизге байланат'}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <p className="text-sm text-gray-600">{isRu ? 'Создавайте заказы для магазина и получайте комиссию с каждой сделки' : 'Дүкөн үчүн заказдарды түзүңүз жана ар бир келишимден комиссия алыңыз'}</p>
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Store size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{demoShops.length}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Магазинов' : 'Дүкөндөр'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Заказов' : 'Заказдар'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString('ru-RU')}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Оборот (сом)' : 'Жүгүртүү (сом)'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{earnings.toLocaleString('ru-RU')}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Заработок (сом)' : 'Киреше (сом)'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link href="/agent/order" className="bg-green-500 hover:bg-green-600 text-white rounded-xl p-5 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{isRu ? 'Создать заказ' : 'Заказ түзүү'}</h3>
            <p className="text-green-100 text-sm">{isRu ? 'Оформить заказ для магазина' : 'Дүкөн үчүн заказ тариздөө'}</p>
          </div>
        </Link>
        <Link href="/agent/shops" className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl p-5 flex items-center gap-4 transition-colors">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{isRu ? 'Мои магазины' : 'Менин дүкөндөрүм'}</h3>
            <p className="text-slate-300 text-sm">{isRu ? 'Список подключённых магазинов' : 'Туташтырылган дүкөндөр'}</p>
          </div>
        </Link>
      </div>

      {/* Мои магазины */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">{isRu ? 'Мои магазины' : 'Менин дүкөндөрүм'}</h2>
          <span className="text-sm text-gray-400">{demoShops.length} {isRu ? 'магазинов' : 'дүкөн'}</span>
        </div>
        <div className="space-y-2">
          {demoShops.map(shop => (
            <div key={shop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                  {shop.name.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-800 text-sm">{shop.name}</div>
                  <div className="text-xs text-gray-400">{shop.address}, {shop.city}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{shop.orders} {isRu ? 'заказов' : 'заказ'}</div>
                <div className="text-xs text-gray-400">{isRu ? 'Последний:' : 'Акыркы:'} {shop.lastOrder}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Последние заказы */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-lg mb-4">{isRu ? 'Последние заказы' : 'Акыркы заказдар'}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-3 font-medium">{isRu ? 'Магазин' : 'Дүкөн'}</th>
                <th className="pb-3 font-medium">{isRu ? 'Поставщик' : 'Жеткирүүчү'}</th>
                <th className="pb-3 font-medium">{isRu ? 'Товаров' : 'Товарлар'}</th>
                <th className="pb-3 font-medium">{isRu ? 'Сумма' : 'Сумма'}</th>
                <th className="pb-3 font-medium">{isRu ? 'Дата' : 'Күнү'}</th>
                <th className="pb-3 font-medium">{isRu ? 'Статус' : 'Статус'}</th>
              </tr>
            </thead>
            <tbody>
              {demoRecentOrders.map(order => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3 font-medium text-gray-800">{order.shop}</td>
                  <td className="py-3 text-gray-500">{order.supplier}</td>
                  <td className="py-3">{order.items}</td>
                  <td className="py-3 font-medium">{order.total.toLocaleString('ru-RU')} сом</td>
                  <td className="py-3 text-gray-400 text-xs">{order.date}</td>
                  <td className="py-3">{statusLabel(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
