'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrders, getSuppliers, getProducts } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { useRouter } from 'next/navigation';
import { Users, Package, ShoppingCart, TrendingUp, AlertCircle, BarChart3, MessageSquare, DollarSign, Award, CheckCircle2, AlertTriangle, XOctagon, FileSpreadsheet, Wallet, Activity, Coins, UserPlus } from 'lucide-react';

const ADMIN_SHEET_URL = process.env.NEXT_PUBLIC_ADMIN_SHEET_URL;

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
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [firestoreErrors, setFirestoreErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.push('/'); return; }
    loadStats();
  }, [isAdmin, authLoading]);

  const loadStats = async () => {
    const [suppliers, products, orders, usersSnap] = await Promise.all([
      getSuppliers(),
      getProducts(),
      getOrders(),
      getDocs(collection(db, 'users')).catch(() => ({ docs: [] })),
    ]);
    const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    setStats({
      suppliers: suppliers.length,
      products: products.length,
      orders: orders.length,
      newOrders: orders.filter(o => o.status === 'new').length,
    });
    setRecentOrders(orders.slice(0, 10));
    setAllOrders(orders);
    setAllSuppliers(suppliers);
    setAllUsers(users);
    // Считываем ошибки Firestore которые трекер собрал во время загрузки —
    // если что-то упало в getSuppliers/getProducts/getOrders, админ это увидит
    if (typeof window !== 'undefined' && window.__firestoreErrors) {
      setFirestoreErrors([...window.__firestoreErrors]);
    }
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

  // Новые сегодня
  const ordersToday = allOrders.filter(o => now - getCreatedMs(o) < DAY);
  const newUsersToday = allUsers.filter(u => u.createdAt && now - getCreatedMs(u) < DAY);

  // Низкий баланс у поставщиков (< 3000 сом)
  const suppliersLowBalance = allSuppliers
    .filter(s => (Number(s.balance) || 0) < 3000)
    .sort((a, b) => (Number(a.balance) || 0) - (Number(b.balance) || 0))
    .slice(0, 10);

  // Топ по коинам — для контроля накруток
  const topCoinUsers = allUsers
    .filter(u => (Number(u.coins) || 0) > 20)
    .sort((a, b) => (Number(b.coins) || 0) - (Number(a.coins) || 0))
    .slice(0, 5);

  // График за последние 7 дней
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const daysAgo = 6 - i;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - daysAgo);
    const dayEnd = dayStart.getTime() + DAY;
    const count = allOrders.filter(o => {
      const ms = getCreatedMs(o);
      return ms >= dayStart.getTime() && ms < dayEnd;
    }).length;
    return {
      label: dayStart.toLocaleDateString('ru-RU', { weekday: 'short' }),
      date: dayStart.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }),
      count,
      isToday: daysAgo === 0,
    };
  });
  const maxDayCount = Math.max(...last7Days.map(d => d.count), 1);

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Админ-панель (CRM)</h1>
          <p className="text-gray-500 text-sm">Автопилот: система сама ведёт заказы. Вы — только когда проблема.</p>
        </div>
        {ADMIN_SHEET_URL && (
          <a href={ADMIN_SHEET_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors shadow-sm">
            <FileSpreadsheet size={18} /> Таблица учёта
          </a>
        )}
      </div>

      {/* Алерт об ошибках Firestore — раньше платформа тихо подменяла на DEMO-данные.
          Теперь админ видит сразу что что-то не работает. */}
      {firestoreErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-red-800 mb-1">
                Firestore вернул ошибку — показаны DEMO-данные ({firestoreErrors.length})
              </p>
              <p className="text-sm text-red-700 mb-2">
                Это значит реальные данные не загрузились. Возможные причины: превышена квота Firebase,
                проблемы со связью, изменились правила безопасности.
              </p>
              <details className="text-xs text-red-700">
                <summary className="cursor-pointer hover:underline">Подробности ({firestoreErrors.slice(-5).length} последних)</summary>
                <ul className="mt-2 space-y-1 font-mono">
                  {firestoreErrors.slice(-5).map((err, i) => (
                    <li key={i} className="bg-white/60 px-2 py-1 rounded">
                      <span className="font-bold">{err.operation}</span>
                      {err.code && <span className="text-red-500"> [{err.code}]</span>}: {err.message}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}

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

      {/* Активность за 7 дней + сегодня */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Мини-график за 7 дней */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={20} className="text-primary-600" />
              <h2 className="font-bold text-lg">Заказы за 7 дней</h2>
            </div>
            <span className="text-sm text-gray-500">всего: <b className="text-gray-800">{last7Days.reduce((s, d) => s + d.count, 0)}</b></span>
          </div>
          <div className="flex items-end gap-2 h-36">
            {last7Days.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group cursor-default">
                <div className="text-xs font-bold text-gray-700">{day.count || ''}</div>
                <div className="w-full bg-gray-100 rounded-t flex items-end" style={{ height: '100%' }}>
                  <div
                    className={`w-full rounded-t transition-all ${day.isToday ? 'bg-primary-600' : 'bg-primary-300 group-hover:bg-primary-400'}`}
                    style={{ height: day.count > 0 ? `${(day.count / maxDayCount) * 100}%` : '0%', minHeight: day.count > 0 ? '4px' : '0' }}
                    title={`${day.date}: ${day.count} зак.`}
                  />
                </div>
                <div className={`text-xs ${day.isToday ? 'font-bold text-primary-700' : 'text-gray-500'}`}>{day.label}</div>
                <div className="text-[10px] text-gray-400">{day.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Сегодня */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus size={20} className="text-indigo-600" />
            <h2 className="font-bold text-lg">Сегодня</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-600">Заказов</span>
              <span className="text-2xl font-black text-indigo-700">{ordersToday.length}</span>
            </div>
            <div className="flex items-baseline justify-between pt-3 border-t">
              <span className="text-sm text-gray-600">Новых регистраций</span>
              <span className="text-2xl font-black text-indigo-700">{newUsersToday.length}</span>
            </div>
            <div className="flex items-baseline justify-between pt-3 border-t">
              <span className="text-sm text-gray-600">Всего пользователей</span>
              <span className="text-xl font-bold text-gray-700">{allUsers.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Контроль: низкие балансы + подозрительная активность */}
      {(suppliersLowBalance.length > 0 || topCoinUsers.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          {/* Низкие балансы поставщиков */}
          {suppliersLowBalance.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wallet size={20} className="text-amber-600" />
                  <h2 className="font-bold text-lg">Низкие балансы</h2>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">{suppliersLowBalance.length}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">&lt; 3 000 сом — позвонить, напомнить пополнить. Иначе не смогут принимать заказы.</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suppliersLowBalance.map(s => (
                  <Link key={s.id} href={`/admin/suppliers`} className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm truncate">{s.name || s.companyName || s.email}</div>
                      <div className="text-xs text-gray-400 truncate">{s.phone || s.email}</div>
                    </div>
                    <div className={`text-sm font-bold tabular-nums ${(Number(s.balance) || 0) <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {(Number(s.balance) || 0).toLocaleString('ru-RU')} сом
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Топ по коинам — контроль накруток */}
          {topCoinUsers.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Coins size={20} className="text-blue-600" />
                  <h2 className="font-bold text-lg">Контроль коинов</h2>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">топ-{topCoinUsers.length}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">Пользователи с максимальным количеством коинов. Если кто-то выделяется неестественно — проверить его заказы (не накрутка ли).</p>
              <div className="space-y-2">
                {topCoinUsers.map((u, idx) => (
                  <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{u.name || u.email || 'Без имени'}</div>
                        <div className="text-xs text-gray-400 truncate">
                          {u.role || 'buyer'} · {u.totalOrders || 0} зак.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-600 tabular-nums">
                      {(Number(u.coins) || 0).toLocaleString('ru-RU')} <Coins size={12} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
