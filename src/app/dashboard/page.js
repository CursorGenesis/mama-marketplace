'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProducts, getOrders, getSupplier } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, profile, isSupplier, loading: authLoading } = useAuth();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [stats, setStats] = useState({ products: 0, orders: 0, newOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSupplier) { router.push('/auth'); return; }

    loadDashboard();
  }, [user, isSupplier, authLoading]);

  const loadDashboard = async () => {
    // Находим поставщика по email
    const q = query(collection(db, 'suppliers'), where('email', '==', user.email));
    const snap = await getDocs(q);
    if (snap.empty) { setLoading(false); return; }

    const sup = { id: snap.docs[0].id, ...snap.docs[0].data() };
    setSupplier(sup);

    const [products, orders] = await Promise.all([
      getProducts({ supplierId: sup.id }),
      getOrders({ supplierId: sup.id }),
    ]);

    setStats({
      products: products.length,
      orders: orders.length,
      newOrders: orders.filter(o => o.status === 'new').length,
    });
    setRecentOrders(orders.slice(0, 5));
    setLoading(false);
  };

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  if (!isSupplier) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Кабинет поставщика</h1>
          <p className="text-gray-500">{supplier?.name || profile?.name}</p>
        </div>
        <Link href="/dashboard/products" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={18} /> Добавить товар
        </Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.newOrders}</div>
              <div className="text-sm text-gray-500">Новых заказов</div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link href="/dashboard/products" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold mb-1">Мои товары</h3>
          <p className="text-sm text-gray-500">Добавление, редактирование, удаление товаров</p>
        </Link>
        <Link href="/dashboard/orders" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold mb-1">Заказы</h3>
          <p className="text-sm text-gray-500">Просмотр заявок и управление статусами</p>
        </Link>
      </div>

      {/* Последние заказы */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-bold mb-4">Последние заказы</h2>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{order.buyerName || order.buyerEmail}</div>
                  <div className="text-sm text-gray-500">
                    {order.items?.length || 0} товаров на {order.total?.toLocaleString('ru-RU')} сом
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
