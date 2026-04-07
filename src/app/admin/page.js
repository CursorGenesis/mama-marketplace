'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrders, getSuppliers, getProducts } from '@/lib/firestore';
import Link from 'next/link';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useRouter } from 'next/navigation';
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle, BarChart3, MessageSquare, DollarSign, Award } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ suppliers: 0, products: 0, orders: 0, newOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.push('/'); return; }
    loadStats();
  }, [isAdmin, authLoading]);

  const loadStats = async () => {
    const [suppliers, products, orders] = await Promise.all([
      getSuppliers(),
      getProducts(),
      getOrders(),
    ]);

    setStats({
      suppliers: suppliers.length,
      products: products.length,
      orders: orders.length,
      newOrders: orders.filter(o => o.status === 'new').length,
    });
    setRecentOrders(orders.slice(0, 10));
    setLoading(false);
  };

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Админ-панель (CRM)</h1>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
              <div className="text-sm text-gray-500">Поставщиков</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.products}</div>
              <div className="text-sm text-gray-500">Товаров</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.orders}</div>
              <div className="text-sm text-gray-500">Заказов</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.newOrders}</div>
              <div className="text-sm text-gray-500">Новых заказов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/admin/suppliers" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-1">Управление поставщиками</h3>
          <p className="text-gray-500">Добавление, редактирование, удаление поставщиков</p>
        </Link>
        <Link href="/admin/orders" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold text-lg mb-1">Все заказы</h3>
          <p className="text-gray-500">Просмотр заявок, статусы, назначение агентов</p>
        </Link>
        <Link href="/admin/analytics" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <BarChart3 size={22} className="text-primary-600" />
            <h3 className="font-bold text-lg">Аналитика</h3>
          </div>
          <p className="text-gray-500">Продажи, статистика, графики и отчёты</p>
        </Link>
        <Link href="/admin/agents" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <Users size={22} className="text-blue-600" />
            <h3 className="font-bold text-lg">Агенты</h3>
          </div>
          <p className="text-gray-500">Статусы, магазины, заработок, автоматизация</p>
        </Link>
        <Link href="/admin/subscriptions" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <ShoppingCart size={22} className="text-purple-600" />
            <h3 className="font-bold text-lg">Подписки</h3>
          </div>
          <p className="text-gray-500">Тарифы поставщиков, оплата, блокировка</p>
        </Link>
        <Link href="/admin/logistics" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <TrendingUp size={22} className="text-cyan-600" />
            <h3 className="font-bold text-lg">Логистика</h3>
          </div>
          <p className="text-gray-500">Доставки, экспедиторы, статусы, отказы</p>
        </Link>
        <Link href="/admin/commissions" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <DollarSign size={22} className="text-green-600" />
            <h3 className="font-bold text-lg">Комиссии</h3>
          </div>
          <p className="text-gray-500">Доходы с заказов поставщиков</p>
        </Link>
        <Link href="/admin/badges" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-1">
            <Award size={22} className="text-amber-500" />
            <h3 className="font-bold text-lg">Бейджи</h3>
          </div>
          <p className="text-gray-500">Топ продаж, Рекомендуем, Новинки</p>
        </Link>
      </div>

      {/* Последние заказы */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Последние заказы</h2>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Покупатель</th>
                  <th className="pb-3 font-medium">Сумма</th>
                  <th className="pb-3 font-medium">Статус</th>
                  <th className="pb-3 font-medium">Агент</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="font-medium">{o.buyerName || o.buyerEmail}</div>
                      <div className="text-gray-400 text-xs">{o.buyerPhone}</div>
                    </td>
                    <td className="py-3 font-medium">{o.total?.toLocaleString('ru-RU')} сом</td>
                    <td className="py-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="py-3 text-gray-500">{o.agentId || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Заказов пока нет</p>
        )}
      </div>
    </div>
  );
}
