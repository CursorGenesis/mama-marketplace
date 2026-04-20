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
import { useLang } from '@/context/LangContext';

export default function DashboardPage() {
  const { user, profile, isSupplier, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
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

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  if (!isSupplier) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isRu ? 'Кабинет поставщика' : 'Жеткирүүчү кабинети'}</h1>
          <p className="text-gray-500">{supplier?.name || profile?.name}</p>
        </div>
        <Link href="/dashboard/products" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={18} /> {isRu ? 'Добавить товар' : 'Товар кошуу'}
        </Link>
      </div>

      {/* Баннер — заполните профиль */}
      {(!supplier?.name || !supplier?.phone || !supplier?.city) && (
        <Link href="/dashboard/settings" className="block mb-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-5 hover:bg-amber-100 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center text-2xl shrink-0">📝</div>
            <div>
              <h3 className="font-bold text-amber-800">{isRu ? 'Заполните профиль компании' : 'Компания профилин толтуруңуз'}</h3>
              <p className="text-sm text-amber-700">{isRu ? 'Укажите название, город, телефон и контакты чтобы клиенты могли вас найти и сделать заказ' : 'Кардарлар сизди таап, заказ бериши үчүн аталышын, шаарын, телефонун жазыңыз'}</p>
            </div>
          </div>
        </Link>
      )}

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.products}</div>
              <div className="text-sm text-gray-500">{isRu ? 'Товаров' : 'Товар'}</div>
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
              <div className="text-sm text-gray-500">{isRu ? 'Заказов' : 'Заказ'}</div>
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
              <div className="text-sm text-gray-500">{isRu ? 'Новых заказов' : 'Жаңы заказ'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация */}
      {/* Баланс */}
      <Link href="/dashboard/balance" className={`block rounded-xl p-5 shadow-sm mb-6 ${supplier?.blocked ? 'bg-red-50 border-2 border-red-300' : (supplier?.balance || 0) < 1000 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{isRu ? 'Баланс' : 'Баланс'}</p>
            <p className={`text-3xl font-bold ${supplier?.blocked ? 'text-red-600' : (supplier?.balance || 0) < 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
              {(supplier?.balance || 0).toLocaleString('ru-RU')} сом
            </p>
          </div>
          {supplier?.blocked && (
            <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">{isRu ? 'Заблокирован — пополните баланс' : 'Бөгөттөлгөн — балансты толуктаңыз'}</span>
          )}
          {!supplier?.blocked && (supplier?.balance || 0) < 1000 && (
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{isRu ? 'Заканчивается' : 'Бүтүүдө'}</span>
          )}
          {!supplier?.blocked && (supplier?.balance || 0) >= 1000 && (
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">{isRu ? 'Активен' : 'Активдүү'}</span>
          )}
        </div>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/settings" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-blue-200">
          <h3 className="font-bold mb-1">📋 {isRu ? 'Профиль компании' : 'Компания профили'}</h3>
          <p className="text-sm text-gray-500">{isRu ? 'Название, контакты, город, минимальный заказ, Telegram' : 'Аталыш, байланыш, шаар, мин. заказ, Telegram'}</p>
        </Link>
        <Link href="/dashboard/products" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold mb-1">📦 {isRu ? 'Мои товары' : 'Менин товарларым'}</h3>
          <p className="text-sm text-gray-500">{isRu ? 'Добавление, редактирование, удаление товаров' : 'Товарларды кошуу, өзгөртүү, жок кылуу'}</p>
        </Link>
        <Link href="/dashboard/orders" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-bold mb-1">🛒 {isRu ? 'История заказов' : 'Заказдар тарыхы'}</h3>
          <p className="text-sm text-gray-500">{isRu ? 'Все заказы от клиентов' : 'Кардарлардан бардык заказдар'}</p>
        </Link>
        <Link href="/dashboard/promotions" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-purple-200">
          <h3 className="font-bold mb-1">🏷 {isRu ? 'Акции' : 'Акциялар'}</h3>
          <p className="text-sm text-gray-500">{isRu ? 'Создание акций, скидки, баннеры' : 'Акция түзүү, арзандатуулар, баннерлер'}</p>
        </Link>
        <Link href="/dashboard/balance" className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-green-200">
          <h3 className="font-bold mb-1">💰 {isRu ? 'Баланс' : 'Баланс'}</h3>
          <p className="text-sm text-gray-500">{isRu ? 'Депозит, история списаний, пополнение' : 'Депозит, чегерүү тарыхы, толуктоо'}</p>
        </Link>
      </div>

      {/* Последние заказы */}
      {recentOrders.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-bold mb-4">{isRu ? 'Последние заказы' : 'Акыркы заказдар'}</h2>
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
