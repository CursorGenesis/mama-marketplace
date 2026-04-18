'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, Search, UserCheck, UserX, Clock, DollarSign, Store, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

// Демо-данные (fallback если нет реальных)
const demoAgents = [
  {
    id: 'agt1', name: 'Азамат Исаков', phone: '+996 555 111 222', email: 'azamat@mail.kg',
    status: 'active', shops: 18, totalOrders: 156, totalRevenue: 780000, earnings: 15600,
    registeredAt: '2026-03-01', code: 'AGT-AZ01', inn: '12345678901234',
  },
  {
    id: 'agt2', name: 'Нурлан Жумабеков', phone: '+996 700 333 444', email: 'nurlan@mail.kg',
    status: 'active', shops: 12, totalOrders: 89, totalRevenue: 445000, earnings: 8900,
    registeredAt: '2026-03-10', code: 'AGT-NR02',
  },
  {
    id: 'agt3', name: 'Айгуль Тойчиева', phone: '+996 550 555 666', email: 'aigul@mail.kg',
    status: 'active', shops: 25, totalOrders: 210, totalRevenue: 1050000, earnings: 21000,
    registeredAt: '2026-02-15', code: 'AGT-AG03',
  },
];

const demoShopsMap = {
  agt1: [
    { name: 'Мини-маркет "Береке"', city: 'Бишкек', orders: 12, total: 156000 },
    { name: 'Магазин "Ырыс"', city: 'Бишкек', orders: 9, total: 98000 },
  ],
  agt2: [
    { name: 'Магазин "Достук"', city: 'Бишкек', orders: 8, total: 89000 },
  ],
  agt3: [
    { name: 'Супермаркет "Народный"', city: 'Бишкек', orders: 23, total: 312000 },
    { name: 'Мини-маркет "Айжан"', city: 'Бишкек', orders: 15, total: 198000 },
  ],
};

export default function AdminAgentsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [agents, setAgents] = useState([]);
  const [shopsMap, setShopsMap] = useState({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (!isAdmin) return;
    loadAgents();
  }, [isAdmin]);

  const loadAgents = async () => {
    try {
      // 1. Загружаем всех агентов
      const agentQuery = query(collection(db, 'users'), where('role', '==', 'agent'));
      const agentSnap = await getDocs(agentQuery);

      if (agentSnap.empty) {
        // Если нет реальных — показываем демо
        setAgents(demoAgents);
        setShopsMap(demoShopsMap);
        setLoading(false);
        return;
      }

      // 2. Загружаем всех покупателей с agentRef (магазины агентов)
      const allUsersSnap = await getDocs(collection(db, 'users'));
      const allOrders = await getDocs(collection(db, 'orders'));

      const realAgents = [];
      const realShopsMap = {};

      agentSnap.docs.forEach(agentDoc => {
        const data = agentDoc.data();
        const agentCode = 'AGT-' + agentDoc.id.slice(0, 4).toUpperCase();

        // Находим магазины (покупатели) привязанные к этому агенту
        const linkedShops = allUsersSnap.docs
          .filter(u => u.data().agentRef === agentCode)
          .map(u => {
            const ud = u.data();
            // Считаем заказы этого покупателя
            const shopOrders = allOrders.docs.filter(o => o.data().buyerId === u.id);
            const totalRevenue = shopOrders.reduce((s, o) => s + Number(o.data().totalPrice || o.data().total || 0), 0);
            return {
              name: ud.shopName || ud.name || ud.email,
              city: ud.city || '',
              phone: ud.phone || '',
              orders: shopOrders.length,
              total: totalRevenue,
              registeredAt: ud.createdAt?.toDate?.()?.toLocaleDateString('ru-RU') || '',
            };
          });

        // Считаем суммарные заказы через этого агента
        const agentOrders = allOrders.docs.filter(o => o.data().agentRef === agentCode);
        const totalRevenue = agentOrders.reduce((s, o) => s + Number(o.data().totalPrice || o.data().total || 0), 0);

        realAgents.push({
          id: agentDoc.id,
          name: data.name || data.email || '—',
          phone: data.phone || '',
          email: data.email || '',
          inn: data.inn || '',
          status: 'active',
          shops: linkedShops.length,
          totalOrders: agentOrders.length,
          totalRevenue,
          earnings: data.earnings || 0,
          registeredAt: data.createdAt?.toDate?.()?.toLocaleDateString('ru-RU') || '',
          code: agentCode,
        });

        realShopsMap[agentDoc.id] = linkedShops;
      });

      setAgents(realAgents.length > 0 ? realAgents : demoAgents);
      setShopsMap(realAgents.length > 0 ? realShopsMap : demoShopsMap);
    } catch (e) {
      console.error('Load agents error:', e);
      setAgents(demoAgents);
      setShopsMap(demoShopsMap);
    }
    setLoading(false);
  };

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  if (!isAdmin) return null;

  const statusConfig = {
    active: { label: isRu ? 'Активен' : 'Активдүү', color: 'bg-green-100 text-green-700', icon: UserCheck },
    warning: { label: isRu ? 'Неактивен' : 'Активдүү эмес', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    inactive: { label: isRu ? 'Отключён' : 'Өчүрүлгөн', color: 'bg-red-100 text-red-700', icon: UserX },
  };

  const filtered = agents
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    totalShops: agents.reduce((s, a) => s + a.shops, 0),
    totalEarnings: agents.reduce((s, a) => s + a.earnings, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isRu ? 'Управление агентами' : 'Агенттерди башкаруу'}</h1>
        <Link href="/admin" className="text-sm text-primary-600 hover:underline">{isRu ? '← Назад' : '← Артка'}</Link>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: isRu ? 'Всего агентов' : 'Жалпы агенттер', value: stats.total, icon: Users, bg: 'bg-blue-100', text: 'text-blue-600' },
          { label: isRu ? 'Активных' : 'Активдүү', value: stats.active, icon: UserCheck, bg: 'bg-green-100', text: 'text-green-600' },
          { label: isRu ? 'Магазинов' : 'Дүкөндөр', value: stats.totalShops, icon: Store, bg: 'bg-purple-100', text: 'text-purple-600' },
          { label: isRu ? 'Начислено (сом)' : 'Эсептелген (сом)', value: stats.totalEarnings.toLocaleString('ru-RU'), icon: DollarSign, bg: 'bg-amber-100', text: 'text-amber-600' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                  <Icon size={20} className={s.text} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRu ? 'Поиск по имени или коду...' : 'Аты же коду боюнча издөө...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: isRu ? 'Все' : 'Баары' },
            { key: 'active', label: isRu ? 'Активные' : 'Активдүү' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.key ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список агентов */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{isRu ? 'Агенты не найдены' : 'Агенттер табылган жок'}</div>
        ) : filtered.map(agent => {
          const sc = statusConfig[agent.status] || statusConfig.active;
          const StatusIcon = sc.icon;
          const isExpanded = selectedAgent === agent.id;
          const shops = shopsMap[agent.id] || [];
          return (
            <div key={agent.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button onClick={() => setSelectedAgent(isExpanded ? null : agent.id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left">
                <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{agent.name}</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{agent.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                      <StatusIcon size={12} /> {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                    {agent.phone && <span>{agent.phone}</span>}
                    <span>{agent.shops} {isRu ? 'магазинов' : 'дүкөн'}</span>
                    <span>{agent.totalOrders} {isRu ? 'заказов' : 'заказ'}</span>
                    <span className="text-green-600 font-medium">{agent.earnings.toLocaleString('ru-RU')} сом</span>
                  </div>
                  {agent.inn && (
                    <div className="text-xs text-gray-500 mt-1">
                      {isRu ? 'ИНН:' : 'ИНН:'} <span className="font-mono">{agent.inn}</span>
                    </div>
                  )}
                </div>
                <svg className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Магазины агента */}
              {isExpanded && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">
                    {isRu ? 'Привлечённые магазины' : 'Тартылган дүкөндөр'} ({shops.length})
                  </h4>
                  {shops.length > 0 ? (
                    <div className="space-y-2">
                      {shops.map((shop, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm">
                          <div>
                            <div className="font-medium text-gray-800">{shop.name}</div>
                            <div className="text-xs text-gray-400">
                              {shop.city && `${shop.city} · `}
                              {shop.phone && <a href={`tel:${shop.phone}`} className="text-blue-500 hover:underline">{shop.phone}</a>}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs text-gray-500">{shop.orders} {isRu ? 'заказов' : 'заказ'} / {shop.total.toLocaleString('ru-RU')} сом</div>
                            {shop.registeredAt && (
                              <div className="text-xs text-gray-400">{isRu ? 'С' : 'Баштап'} {shop.registeredAt}</div>
                            )}
                          </div>
                        </div>
                      ))}
                      {/* Итого по агенту */}
                      <div className="bg-green-50 rounded-lg p-3 flex justify-between text-sm font-semibold">
                        <span className="text-green-700">{isRu ? 'Итого комиссия агента (2%)' : 'Агент комиссиясы (2%)'}</span>
                        <span className="text-green-700">{agent.earnings.toLocaleString('ru-RU')} сом</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{isRu ? 'Магазинов пока нет' : 'Дүкөндөр жок'}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
