'use client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp, ShoppingCart, Calculator, Users,
  ArrowLeft, MapPin, Package, Calendar,
} from 'lucide-react';

const monthlyData = [
  { month: 'Окт', value: 45000, pct: 45 },
  { month: 'Ноя', value: 62000, pct: 62 },
  { month: 'Дек', value: 78000, pct: 78 },
  { month: 'Янв', value: 55000, pct: 55 },
  { month: 'Фев', value: 89000, pct: 89 },
  { month: 'Мар', value: 100000, pct: 100 },
];

const topProducts = [
  { name: 'Рис узгенский 25кг', sold: 340, revenue: 952000, pct: 100 },
  { name: 'Мука в/с 50кг', sold: 280, revenue: 616000, pct: 82 },
  { name: 'Максым 1л', sold: 520, revenue: 390000, pct: 65 },
  { name: 'Молоко 3.2% 1л', sold: 450, revenue: 306000, pct: 51 },
  { name: 'Сахар 50кг', sold: 120, revenue: 288000, pct: 48 },
];

const regionData = [
  { name: 'Бишкек', orders: 68, pct: 100 },
  { name: 'Ош', orders: 25, pct: 37 },
  { name: 'Джалал-Абад', orders: 15, pct: 22 },
  { name: 'Каракол', orders: 11, pct: 16 },
  { name: 'Нарын', orders: 8, pct: 12 },
];

const recentOrders = [
  { id: 1, buyer: 'ИП Асанов', supplier: 'Алтын Дан', amount: 45000, status: 'completed', date: '28.03.2026' },
  { id: 2, buyer: 'Магазин "Береке"', supplier: 'Шоро', amount: 12500, status: 'in_progress', date: '27.03.2026' },
  { id: 3, buyer: 'Кафе "Достук"', supplier: 'Бишкек Сүт', amount: 8900, status: 'new', date: '27.03.2026' },
  { id: 4, buyer: 'ООО "Азия Трейд"', supplier: 'Мясной Двор', amount: 67000, status: 'completed', date: '26.03.2026' },
  { id: 5, buyer: 'Маркет "Ала-Тоо"', supplier: 'Тоо Муз', amount: 23400, status: 'cancelled', date: '25.03.2026' },
];

const statusMap = {
  new: { label: 'Новый', cls: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'В работе', cls: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Завершён', cls: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменён', cls: 'bg-red-100 text-red-800' },
};

export default function AnalyticsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) router.push('/');
  }, [isAdmin, authLoading]);

  if (authLoading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  if (!isAdmin) return null;

  const stats = [
    { label: 'Общие продажи', value: '458 000 сом', icon: TrendingUp, color: 'green' },
    { label: 'Всего заказов', value: '127', icon: ShoppingCart, color: 'blue' },
    { label: 'Средний чек', value: '3 607 сом', icon: Calculator, color: 'purple' },
    { label: 'Новые клиенты', value: '45', icon: Users, color: 'orange' },
  ];

  const colorClasses = {
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Аналитика</h1>
          <p className="text-gray-500 text-sm">Обзор продаж и статистики</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          const cc = colorClasses[s.color];
          return (
            <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${cc.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={20} className={cc.text} />
                </div>
                <div>
                  <div className="text-xl font-bold">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Sales Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Calendar size={18} className="text-gray-400" />
            <h2 className="font-bold text-lg">Продажи по месяцам</h2>
          </div>
          <div className="flex items-end justify-between gap-3" style={{ height: 200 }}>
            {monthlyData.map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-600">
                  {(d.value / 1000).toFixed(0)}к
                </span>
                <div
                  className="w-full bg-primary-500 rounded-t-md transition-all duration-500"
                  style={{ height: `${d.pct}%` }}
                />
                <span className="text-xs text-gray-500 font-medium">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Package size={18} className="text-gray-400" />
            <h2 className="font-bold text-lg">Топ-5 товаров</h2>
          </div>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate mr-2">
                    {i + 1}. {p.name}
                  </span>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {p.sold} шт / {(p.revenue / 1000).toFixed(0)}к сом
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={18} className="text-gray-400" />
            <h2 className="font-bold text-lg">Распределение по регионам</h2>
          </div>
          <div className="space-y-4">
            {regionData.map((r) => (
              <div key={r.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{r.name}</span>
                  <span className="text-sm text-gray-500">{r.orders} заказов</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingCart size={18} className="text-gray-400" />
            <h2 className="font-bold text-lg">Последние заказы</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Покупатель</th>
                  <th className="pb-3 font-medium">Поставщик</th>
                  <th className="pb-3 font-medium">Сумма</th>
                  <th className="pb-3 font-medium">Статус</th>
                  <th className="pb-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const st = statusMap[o.status];
                  return (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-2.5 font-medium">{o.buyer}</td>
                      <td className="py-2.5 text-gray-500">{o.supplier}</td>
                      <td className="py-2.5 font-medium">{o.amount.toLocaleString('ru-RU')} сом</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-500">{o.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
