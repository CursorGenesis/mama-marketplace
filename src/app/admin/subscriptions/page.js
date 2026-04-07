'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { CreditCard, Search, AlertTriangle, CheckCircle, XCircle, Clock, Crown, Building2, Package, Rocket } from 'lucide-react';

const planConfig = {
  start: { name: 'Старт', nameKg: 'Старт', price: 1000, icon: '🌱', color: 'bg-gray-100 text-gray-700' },
  basic: { name: 'Базовый', nameKg: 'Базалык', price: 2000, icon: '📦', color: 'bg-blue-100 text-blue-700' },
  business: { name: 'Бизнес', nameKg: 'Бизнес', price: 5000, icon: '🏢', color: 'bg-green-100 text-green-700' },
  premium: { name: 'Премиум', nameKg: 'Премиум', price: 12000, icon: '👑', color: 'bg-amber-100 text-amber-700' },
};

const demoSubscriptions = [
  {
    id: 's1', supplierId: 'sup1', supplierName: 'Алтын Дан', city: 'Бишкек',
    plan: 'business', status: 'active', paidUntil: '2026-05-01',
    startDate: '2026-03-01', products: 87, commission: 5,
  },
  {
    id: 's2', supplierId: 'sup2', supplierName: 'Шоро', city: 'Бишкек',
    plan: 'premium', status: 'active', paidUntil: '2026-05-15',
    startDate: '2026-02-15', products: 24, commission: 3,
  },
  {
    id: 's3', supplierId: 'sup3', supplierName: 'Бишкек Сүт', city: 'Бишкек',
    plan: 'basic', status: 'active', paidUntil: '2026-04-20',
    startDate: '2026-03-20', products: 45, commission: 5,
  },
  {
    id: 's4', supplierId: 'sup4', supplierName: 'Sweet House KG', city: 'Ош',
    plan: 'start', status: 'expiring', paidUntil: '2026-04-10',
    startDate: '2026-03-10', products: 18, commission: 5,
  },
  {
    id: 's5', supplierId: 'sup5', supplierName: 'Ак-Суу Агро', city: 'Каракол',
    plan: 'start', status: 'trial', paidUntil: '2026-04-15',
    startDate: '2026-03-15', products: 12, commission: 5,
  },
  {
    id: 's6', supplierId: 'sup6', supplierName: 'Мясной Двор', city: 'Бишкек',
    plan: 'basic', status: 'expired', paidUntil: '2026-03-25',
    startDate: '2026-02-25', products: 31, commission: 5,
  },
  {
    id: 's7', supplierId: 'sup7', supplierName: 'JA-Snacks', city: 'Джалал-Абад',
    plan: 'start', status: 'blocked', paidUntil: '2026-03-10',
    startDate: '2026-02-10', products: 9, commission: 5,
  },
];

export default function AdminSubscriptionsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [subs, setSubs] = useState(demoSubscriptions);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [isAdmin, authLoading]);

  if (authLoading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  if (!isAdmin) return null;

  const statusConfig = {
    trial: { label: isRu ? 'Пробный' : 'Сыноо', color: 'bg-blue-100 text-blue-700', icon: Clock },
    active: { label: isRu ? 'Активен' : 'Активдүү', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    expiring: { label: isRu ? 'Истекает' : 'Бүтүп жатат', color: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
    expired: { label: isRu ? 'Просрочен' : 'Мөөнөтү өткөн', color: 'bg-red-100 text-red-700', icon: XCircle },
    blocked: { label: isRu ? 'Заблокирован' : 'Бөгөттөлгөн', color: 'bg-gray-100 text-gray-700', icon: XCircle },
  };

  const filtered = subs
    .filter(s => filter === 'all' || s.status === filter)
    .filter(s => !search || s.supplierName.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: subs.length,
    active: subs.filter(s => s.status === 'active' || s.status === 'trial').length,
    expiring: subs.filter(s => s.status === 'expiring').length,
    expired: subs.filter(s => s.status === 'expired' || s.status === 'blocked').length,
    monthlyRevenue: subs
      .filter(s => s.status === 'active' || s.status === 'trial')
      .reduce((sum, s) => sum + (planConfig[s.plan]?.price || 0), 0),
  };

  const daysLeft = (dateStr) => {
    const diff = Math.floor((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return isRu ? `${Math.abs(diff)} дн. просрочен` : `${Math.abs(diff)} күн мөөнөтү өткөн`;
    if (diff === 0) return isRu ? 'сегодня' : 'бүгүн';
    return `${diff} ${isRu ? 'дн.' : 'күн'}`;
  };

  const changePlan = (id, newPlan) => {
    setSubs(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, plan: newPlan, commission: newPlan === 'premium' ? 3 : 5 };
    }));
  };

  const changeStatus = (id, newStatus) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Подписки поставщиков' : 'Жеткирүүчүлөрдүн жазылуулары'}</h1>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Всего' : 'Жалпы'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.active}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Активных' : 'Активдүү'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.expiring + stats.expired}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Требуют внимания' : 'Көңүл буруу керек'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <CreditCard size={20} className="text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString('ru-RU')}</div>
              <div className="text-xs text-gray-500">{isRu ? 'Доход/мес (сом)' : 'Киреше/ай (сом)'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRu ? 'Поиск по поставщику...' : 'Жеткирүүчү боюнча издөө...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: isRu ? 'Все' : 'Баары' },
            { key: 'active', label: isRu ? 'Активные' : 'Активдүү' },
            { key: 'trial', label: isRu ? 'Пробный' : 'Сыноо' },
            { key: 'expiring', label: isRu ? 'Истекает' : 'Бүтүп жатат' },
            { key: 'expired', label: isRu ? 'Просрочен' : 'Мөөнөтү өткөн' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
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
          <div className="text-center py-12 text-gray-400">{isRu ? 'Не найдено' : 'Табылган жок'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="px-4 py-3 font-medium">{isRu ? 'Поставщик' : 'Жеткирүүчү'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Тариф' : 'Тариф'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Статус' : 'Статус'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Оплачено до' : 'Төлөнгөн мөөнөт'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Товаров' : 'Товарлар'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Комиссия' : 'Комиссия'}</th>
                  <th className="px-4 py-3 font-medium">{isRu ? 'Действия' : 'Аракеттер'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => {
                  const plan = planConfig[sub.plan];
                  const sc = statusConfig[sub.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{sub.supplierName}</div>
                        <div className="text-xs text-gray-400">{sub.city}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>
                          {plan.icon} {isRu ? plan.name : plan.nameKg}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                          <StatusIcon size={12} /> {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-gray-800 text-xs">{new Date(sub.paidUntil).toLocaleDateString('ru-RU')}</div>
                        <div className={`text-xs ${sub.status === 'expired' || sub.status === 'blocked' ? 'text-red-500' : sub.status === 'expiring' ? 'text-yellow-600' : 'text-gray-400'}`}>
                          {daysLeft(sub.paidUntil)}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{sub.products}</td>
                      <td className="px-4 py-3 font-medium">{sub.commission}%</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <select
                            value={sub.plan}
                            onChange={e => changePlan(sub.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none"
                          >
                            <option value="start">🌱 {isRu ? 'Старт' : 'Старт'}</option>
                            <option value="basic">📦 {isRu ? 'Базовый' : 'Базалык'}</option>
                            <option value="business">🏢 {isRu ? 'Бизнес' : 'Бизнес'}</option>
                            <option value="premium">👑 {isRu ? 'Премиум' : 'Премиум'}</option>
                          </select>
                          {(sub.status === 'expired' || sub.status === 'blocked') && (
                            <button onClick={() => changeStatus(sub.id, 'active')}
                              className="px-2 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100">
                              {isRu ? 'Активировать' : 'Активдештирүү'}
                            </button>
                          )}
                          {sub.status === 'active' && (
                            <button onClick={() => changeStatus(sub.id, 'blocked')}
                              className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">
                              {isRu ? 'Блок' : 'Бөгөт'}
                            </button>
                          )}
                        </div>
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
          <li>• {isRu ? 'За 3 дня до конца подписки → уведомление поставщику «Оплатите до...»' : 'Жазылуу бүткөнгө 3 күн калганда → жеткирүүчүгө «Төлөңүз...» билдирүүсү'}</li>
          <li>• {isRu ? 'Подписка истекла → товары автоматически скрываются из каталога' : 'Жазылуу бүттү → товарлар каталогдон автоматтык жашырылат'}</li>
          <li>• {isRu ? 'После оплаты → товары автоматически возвращаются в каталог' : 'Төлөмдөн кийин → товарлар автоматтык түрдө каталогго кайтат'}</li>
          <li>• {isRu ? 'Бейдж «Проверенный» автоматически по тарифу Бизнес/Премиум' : '«Текшерилген» бейджи Бизнес/Премиум тарифи боюнча автоматтык'}</li>
        </ul>
      </div>
    </div>
  );
}
