'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { Users, Search, UserCheck, UserX, Clock, DollarSign, Store, ChevronDown } from 'lucide-react';

// Демо-данные магазинов по агентам
const agentShops = {
  agt1: [
    { name: 'Мини-маркет "Береке"', address: 'ул. Манаса, 40', city: 'Бишкек', orders: 12, total: 156000, date: '2026-03-05' },
    { name: 'Магазин "Ырыс"', address: 'ул. Жибек Жолу, 200', city: 'Бишкек', orders: 9, total: 98000, date: '2026-03-08' },
    { name: 'Супермаркет "Алтын"', address: 'пр. Манаса, 77', city: 'Бишкек', orders: 15, total: 210000, date: '2026-03-12' },
  ],
  agt2: [
    { name: 'Магазин "Достук"', address: 'ул. Токтогула, 120', city: 'Бишкек', orders: 8, total: 89000, date: '2026-03-15' },
    { name: 'Кафе "Нурдин"', address: 'ул. Боконбаева, 33', city: 'Бишкек', orders: 6, total: 72000, date: '2026-03-18' },
  ],
  agt3: [
    { name: 'Супермаркет "Народный"', address: 'пр. Чуй, 150', city: 'Бишкек', orders: 23, total: 312000, date: '2026-02-20' },
    { name: 'Мини-маркет "Айжан"', address: 'ул. Киевская, 77', city: 'Бишкек', orders: 15, total: 198000, date: '2026-02-25' },
    { name: 'Магазин "Салам"', address: 'ул. Исанова, 45', city: 'Бишкек', orders: 18, total: 245000, date: '2026-03-01' },
    { name: 'Кафе "Жаштык"', address: 'ул. Ахунбаева, 93', city: 'Бишкек', orders: 5, total: 42000, date: '2026-03-10' },
  ],
  agt4: [
    { name: 'Магазин "Арзан"', address: 'ул. Льва Толстого, 15', city: 'Бишкек', orders: 3, total: 35000, date: '2026-03-01' },
  ],
  agt5: [
    { name: 'Мини-маркет "Бай"', address: 'ул. Панфилова, 80', city: 'Бишкек', orders: 2, total: 18000, date: '2026-02-01' },
  ],
};

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

      {/* Список агентов */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">{isRu ? 'Агенты не найдены' : 'Агенттер табылган жок'}</div>
        ) : filtered.map(agent => {
          const sc = statusConfig[agent.status];
          const StatusIcon = sc.icon;
          const isExpanded = selectedAgent === agent.id;
          const shops = agentShops[agent.id] || [];
          return (
            <div key={agent.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Строка агента */}
              <button onClick={() => setSelectedAgent(isExpanded ? null : agent.id)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left">
                <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{agent.name}</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{agent.code}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}><StatusIcon size={12} /> {sc.label}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{agent.phone}</span>
                    <span>{agent.shops} {isRu ? 'магазинов' : 'дүкөн'}</span>
                    <span>{agent.totalOrders} {isRu ? 'заказов' : 'заказ'}</span>
                    <span className="text-green-600 font-medium">{agent.earnings.toLocaleString('ru-RU')} сом</span>
                    <span>{isRu ? 'Вход:' : 'Кирүү:'} {daysAgo(agent.lastLogin)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStatus(agent.id); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${agent.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  >
                    {agent.status === 'active' ? (isRu ? 'Отключить' : 'Өчүрүү') : (isRu ? 'Активировать' : 'Активдештирүү')}
                  </button>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </button>

              {/* Раскрывающийся список магазинов */}
              {isExpanded && (
                <div className="border-t bg-gray-50 px-4 py-3">
                  <h4 className="text-sm font-bold text-gray-700 mb-3">{isRu ? 'Привлечённые магазины' : 'Тартылган дүкөндөр'} ({shops.length})</h4>
                  {shops.length > 0 ? (
                    <div className="space-y-2">
                      {shops.map((shop, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm">
                          <div>
                            <div className="font-medium text-gray-800">{shop.name}</div>
                            <div className="text-xs text-gray-400">{shop.address}, {shop.city}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs text-gray-500">{shop.orders} {isRu ? 'заказов' : 'заказ'} / {shop.total.toLocaleString('ru-RU')} сом</div>
                            <div className="text-xs text-gray-400">{isRu ? 'Подключён:' : 'Туташтырылган:'} {shop.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">{isRu ? 'Магазинов пока нет' : 'Дүкөндөр жок'}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
