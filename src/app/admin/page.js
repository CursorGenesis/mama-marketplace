'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrders, getSuppliers, getProducts } from '@/lib/firestore';
import Link from 'next/link';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useRouter } from 'next/navigation';
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle, BarChart3, MessageSquare, DollarSign, Award, CheckCircle2, AlertTriangle, XOctagon } from 'lucide-react';

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

const getCreatedMs = (o) => {
  const c = o?.createdAt;
  if (!c) return 0;
  if (c.toDate) return c.toDate().getTime();
  if (c.seconds) return c.seconds * 1000;
  return new Date(c).getTime();
};

export default function AdminPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ suppliers: 0, products: 0, orders: 0, newOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
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
    setAllOrders(orders);
    setLoading(false);
  };

  // Категоризация заказов для дашборда
  const now = Date.now();
  const receivedWeek = allOrders.filter(o => o.status === 'received' && now - getCreatedMs(o) < 7 * DAY);
  const receivedToday = allOrders.filter(o => o.status === 'received' && now - getCreatedMs(o) < DAY);
  const weeklyCommission = receivedWeek.reduce((s, o) => s + (o.commission || 0), 0);

  const stuckNew = allOrders.filter(o => o.status === 'new' && now - getCreatedMs(o) > 2 * HOUR);
  const stuckPacked = allOrders.filter(o => o.status === 'packed' && now - getCreatedMs(o) > 2 * DAY);
  const warningCount = stuckNew.length + stuckPacked.length;

  const notReceived = allOrders.filter(o => o.status === 'not_received');
  const stuckDelivering = allOrders.filter(o => o.status === 'delivering' && now - getCreatedMs(o) > 3 * DAY);
  const urgentCount = notReceived.length + stuckDelivering.length;

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Админ-панель (CRM)</h1>
      <p className="text-gray-500 mb-6 text-sm">Автопилот: система сама ведёт заказы. Вы — только когда проблема.</p>

      {/* Дашборд «3 колонки» */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* ЗЕЛЁНАЯ — всё хорошо */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={22} className="text-green-600" />
            <span className="text-xs font-bold text-green-700 uppercase tracking-wide">Всё хорошо</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-3xl font-black text-green-700">{receivedToday.length}</div>
              <div className="text-sm text-green-700">заказов доставлено сегодня</div>
            </div>
            <div className="pt-2 border-t border-green-200">
              <div className="text-lg font-bold text-green-700">{weeklyCommission.toLocaleString('ru-RU')} сом</div>
              <div className="text-xs text-green-600">комиссия за 7 дней ({receivedWeek.length} зак.)</div>
            </div>
          </div>
          <p className="text-xs text-green-600/80 mt-4 italic">Ничего делать не нужно — идёт как надо.</p>
        </div>

        {/* ЖЁЛТАЯ — внимание */}
        <div className={`bg-gradient-to-br ${warningCount > 0 ? 'from-amber-50 to-amber-100 border-amber-200' : 'from-gray-50 to-gray-100 border-gray-200'} border rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={22} className={warningCount > 0 ? 'text-amber-600' : 'text-gray-400'} />
            <span className={`text-xs font-bold uppercase tracking-wide ${warningCount > 0 ? 'text-amber-700' : 'text-gray-500'}`}>Внимание</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className={`text-3xl font-black ${warningCount > 0 ? 'text-amber-700' : 'text-gray-400'}`}>{warningCount}</div>
              <div className={`text-sm ${warningCount > 0 ? 'text-amber-700' : 'text-gray-500'}`}>заказов требуют напоминания</div>
            </div>
            {warningCount > 0 && (
              <div className="pt-2 border-t border-amber-200 text-xs text-amber-700 space-y-1">
                {stuckNew.length > 0 && <div>• {stuckNew.length} не собраны &gt; 2 часов</div>}
                {stuckPacked.length > 0 && <div>• {stuckPacked.length} собраны, но не отправлены &gt; 2 дней</div>}
              </div>
            )}
          </div>
          {warningCount > 0 ? (
            <Link href="/admin/orders" className="mt-4 inline-block w-full text-center px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold transition-colors">
              Открыть заказы
            </Link>
          ) : (
            <p className="text-xs text-gray-500 mt-4 italic">Нет заказов, требующих внимания.</p>
          )}
        </div>

        {/* КРАСНАЯ — срочно */}
        <div className={`bg-gradient-to-br ${urgentCount > 0 ? 'from-red-50 to-red-100 border-red-200' : 'from-gray-50 to-gray-100 border-gray-200'} border rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-3">
            <XOctagon size={22} className={urgentCount > 0 ? 'text-red-600' : 'text-gray-400'} />
            <span className={`text-xs font-bold uppercase tracking-wide ${urgentCount > 0 ? 'text-red-700' : 'text-gray-500'}`}>Срочно</span>
          </div>
          <div className="space-y-2">
            <div>
              <div className={`text-3xl font-black ${urgentCount > 0 ? 'text-red-700' : 'text-gray-400'}`}>{urgentCount}</div>
              <div className={`text-sm ${urgentCount > 0 ? 'text-red-700' : 'text-gray-500'}`}>нужна ваша помощь</div>
            </div>
            {urgentCount > 0 && (
              <div className="pt-2 border-t border-red-200 text-xs text-red-700 space-y-1">
                {notReceived.length > 0 && <div>• {notReceived.length} клиент НЕ получил заказ</div>}
                {stuckDelivering.length > 0 && <div>• {stuckDelivering.length} в доставке &gt; 3 дней</div>}
              </div>
            )}
          </div>
          {urgentCount > 0 ? (
            <Link href="/admin/orders" className="mt-4 inline-block w-full text-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-colors">
              Разобраться сейчас
            </Link>
          ) : (
            <p className="text-xs text-gray-500 mt-4 italic">Всё спокойно. Никаких проблем.</p>
          )}
        </div>
      </div>

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
