'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { Users, Search, UserCheck, UserX, Clock, DollarSign, Store, ChevronDown } from 'lucide-react';

// Демо-данные агентов
const demoAgents = [
  {
    id: 'agt1', name: 'Азамат Исаков', phone: '+996 555 111 222', email: 'azamat@mail.kg',
    status: 'active', shops: 18, totalOrders: 156, totalRevenue: 780000, earnings: 15600,
    lastLogin: '2026-04-06', registeredAt: '2026-03-01', code: 'AGT-AZ01',
  },
  {
    id: 'agt2', name: 'Нурлан Жумабеков', phone: '+996 700 333 444', email: 'nurlan@mail.kg',
    status: 'active', shops: 12, totalOrders: 89, totalRevenue: 445000, earnings: 8900,
    lastLogin: '2026-04-05', registeredAt: '2026-03-10', code: 'AGT-NR02',
  },
  {
    id: 'agt3', name: 'Айгуль Тойчиева', phone: '+996 550 555 666', email: 'aigul@mail.kg',
    status: 'active', shops: 25, totalOrders: 210, totalRevenue: 1050000, earnings: 21000,
    lastLogin: '2026-04-07', registeredAt: '2026-02-15', code: 'AGT-AG03',
  },
  {
    id: 'agt4', name: 'Бакыт Сатыбалдиев', phone: '+996 507 777 888', email: 'bakyt@mail.kg',
    status: 'warning', shops: 8, totalOrders: 23, totalRevenue: 115000, earnings: 2300,
    lastLogin: '2026-03-10', registeredAt: '2026-02-20', code: 'AGT-BK04',
  },
  {
    id: 'agt5', name: 'Эрмек Касымов', phone: '+996 555 999 000', email: 'ermek@mail.kg',
    status: 'inactive', shops: 5, totalOrders: 11, totalRevenue: 55000, earnings: 1100,
    lastLogin: '2026-02-01', registeredAt: '2026-01-15', code: 'AGT-ER05',
  },
];

export default function AdminAgentsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [agents, setAgents] = useState(demoAgents);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [isAdmin, authLoading]);

  if (authLoading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  if (!isAdmin) return null;

  const statusConfig = {
    active: { label: isRu ? 'Активен' : 'Активдүү', color: 'bg-green-100 text-green-700', icon: UserCheck },
    warning: { label: isRu ? 'Неактивен 20+ дней' : '20+ күн активдүү эмес', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
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

  const toggleStatus = (id) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next = a.status === 'active' ? 'inactive' : 'active';
      return { ...a, status: next };
    }));
  };

  const daysAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return isRu ? 'сегодня' : 'бүгүн';
    if (diff === 1) return isRu ? 'вчера' : 'кечээ';
    return `${diff} ${isRu ? 'дн. назад' : 'күн мурун'}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Управление агентами' : 'Агенттерди башкаруу'}</h1>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Всего агентов' : 'Жалпы агенттер'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Активных' : 'Активдүү'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Store size={20} className="text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalShops}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Магазинов' : 'Дүкөндөр'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString('ru-RU')}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Выплачено (сом)' : 'Төлөндү (сом)'}</div>
            </div>
          </div>
        </div>
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
            { key: 'warning', label: isRu ? 'Предупреждение' : 'Эскертүү' },
            { key: 'inactive', label: isRu ? 'Отключённые' : 'Өчүрүлгөн' },
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

      {/* Таблица */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{isRu ? 'Агенты не найдены' : 'Агенттер табылган жок'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">{isRu ? 'Агент' : 'Агент'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Код' : 'Код'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Статус' : 'Статус'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Магазины' : 'Дүкөндөр'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Заказы' : 'Заказдар'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Заработок' : 'Киреше'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Последний вход' : 'Акыркы кирүү'}</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(agent => {
                  const sc = statusConfig[agent.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={agent.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{agent.name}</div>
                        <div className="text-xs text-gray-400">{agent.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{agent.code}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{agent.shops}</td>
                      <td className="px-4 py-3 font-medium">{agent.totalOrders}</td>
                      <td className="px-4 py-3 font-medium text-green-600">{agent.earnings.toLocaleString('ru-RU')} сом</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{daysAgo(agent.lastLogin)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleStatus(agent.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            agent.status === 'active'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {agent.status === 'active'
                            ? (isRu ? 'Отключить' : 'Өчүрүү')
                            : (isRu ? 'Активировать' : 'Активдештирүү')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Автоматизация */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">⚙️ {isRu ? 'Автоматизация' : 'Автоматташтыруу'}</p>
        <ul className="space-y-1 text-xs text-blue-600">
          <li>• {isRu ? '30 дней без входа → статус «Предупреждение» + уведомление агенту' : '30 күн кирбесе → «Эскертүү» статусу + агентке билдирүү'}</li>
          <li>• {isRu ? '60 дней без заказов → автоматическое отключение, магазины отвязываются' : '60 күн заказсыз → автоматтык өчүрүү, дүкөндөр ажыратылат'}</li>
          <li>• {isRu ? 'Выплаты начисляются автоматически в конце каждого месяца' : 'Төлөмдөр ар бир айдын аягында автоматтык түрдө эсептелет'}</li>
        </ul>
      </div>
    </div>
  );
}
