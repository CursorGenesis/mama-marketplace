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

  const agentCode = user ? 'AGT-' + (user.uid || '').slice(0, 4).toUpperCase() : 'AGT-DEMO';
  const totalOrders = demoRecentOrders.length;
  const totalRevenue = demoRecentOrders.reduce((s, o) => s + o.total, 0);
  const earnings = Math.round(totalRevenue * 0.02);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(agentCode);
    setCopied(true);
    toast.success(isRu ? 'Код скопирован!' : 'Код көчүрүлдү!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isRu ? 'Кабинет агента' : 'Агент кабинети'}</h1>
          <p className="text-gray-500 text-sm">{profile?.name || (isRu ? 'Демо агент' : 'Демо агент')}</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
          <span className="text-xs text-gray-500">{isRu ? 'Ваш код:' : 'Кодуңуз:'}</span>
          <span className="font-mono font-bold text-sm">{agentCode}</span>
          <button onClick={handleCopy} className="text-slate-600 hover:text-slate-800">
            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
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
