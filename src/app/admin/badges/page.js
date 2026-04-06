'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { ArrowLeft, Award, TrendingUp, Star, Sparkles, DollarSign, Eye, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const badgeTypes = [
  { id: 'top', icon: '🔥', nameRu: 'Топ продаж', nameKg: 'Топ сатуу', color: 'bg-amber-500', type: 'auto', descRu: 'Автоматически по количеству заказов', descKg: 'Буйрутмалар саны боюнча автоматтык' },
  { id: 'recommended', icon: '⭐', nameRu: 'Рекомендуем', nameKg: 'Сунуштайбыз', color: 'bg-primary-600', type: 'paid', descRu: 'Платный — 2 000 сом/мес', descKg: 'Акылуу — 2 000 сом/ай' },
  { id: 'new', icon: '🆕', nameRu: 'Новинка', nameKg: 'Жаңылык', color: 'bg-green-500', type: 'auto', descRu: 'Автоматически для новых товаров (14 дней)', descKg: 'Жаңы товарлар үчүн автоматтык (14 күн)' },
];

const demoBadgeStats = [
  { badge: 'top', products: 4, suppliers: 2, avgOrderIncrease: '+32%', views: 12400 },
  { badge: 'recommended', products: 2, suppliers: 1, avgOrderIncrease: '+45%', views: 8900, revenue: 4000 },
  { badge: 'new', products: 3, suppliers: 3, avgOrderIncrease: '+18%', views: 5600 },
];

const demoActiveBadges = [
  { id: 1, productName: 'Мука пшеничная в/с 2кг', supplier: 'Алтын Дан', badge: 'top', since: '2026-02-01', orders: 340, status: 'active' },
  { id: 2, productName: 'Максым 1л', supplier: 'Шоро', badge: 'top', since: '2026-01-15', orders: 520, status: 'active' },
  { id: 3, productName: 'Молоко 3.2% 1л', supplier: 'Бишкек Сүт', badge: 'top', since: '2026-02-10', orders: 450, status: 'active' },
  { id: 4, productName: 'Рис узгенский 1кг', supplier: 'Алтын Дан', badge: 'recommended', since: '2026-03-01', orders: 280, status: 'active', paid: true, amount: 2000 },
  { id: 5, productName: 'Печенье Ассорти 500г', supplier: 'Sweet House KG', badge: 'recommended', since: '2026-03-10', orders: 150, status: 'active', paid: true, amount: 2000 },
  { id: 6, productName: 'Макароны спагетти 400г', supplier: 'Алтын Дан', badge: 'new', since: '2026-03-25', orders: 45, status: 'active' },
  { id: 7, productName: 'Пельмени Домашние 1кг', supplier: 'Тоо Муз', badge: 'new', since: '2026-03-28', orders: 28, status: 'active' },
];

export default function BadgesPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const isRu = lang === 'ru';

  if (authLoading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  const getBadgeInfo = (id) => badgeTypes.find(b => b.id === id);
  const filtered = filter === 'all' ? demoActiveBadges : demoActiveBadges.filter(b => b.badge === filter);
  const totalPaidRevenue = demoActiveBadges.filter(b => b.paid).reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> {isRu ? 'Назад' : 'Артка'}
      </Link>

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Award size={24} className="text-amber-500" />
        {isRu ? 'Управление бейджами' : 'Бейджиларды башкаруу'}
      </h1>

      {/* Типы бейджей */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {badgeTypes.map(badge => {
          const stats = demoBadgeStats.find(s => s.badge === badge.id);
          return (
            <div key={badge.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className={`${badge.color} text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg`}>
                  {badge.icon}
                </span>
                <div>
                  <h3 className="font-bold text-gray-800">{isRu ? badge.nameRu : badge.nameKg}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.type === 'paid' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    {badge.type === 'paid' ? (isRu ? 'Платный' : 'Акылуу') : (isRu ? 'Автоматический' : 'Автоматтык')}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3">{isRu ? badge.descRu : badge.descKg}</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-gray-800">{stats?.products || 0}</div>
                  <div className="text-[10px] text-gray-400">{isRu ? 'товаров' : 'товар'}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="font-bold text-green-600">{stats?.avgOrderIncrease || '0%'}</div>
                  <div className="text-[10px] text-gray-400">{isRu ? 'рост заказов' : 'буйрутма өсүшү'}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Статистика доходов от платных бейджей */}
      <div className="bg-gradient-to-r from-purple-500 to-primary-600 rounded-xl p-5 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <DollarSign size={20} />
              {isRu ? 'Доход от платных бейджей' : 'Акылуу бейджиларден киреше'}
            </h3>
            <p className="text-purple-100 text-sm mt-1">
              {isRu ? `${demoActiveBadges.filter(b => b.paid).length} активных подписок` : `${demoActiveBadges.filter(b => b.paid).length} активдүү жазылуу`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{totalPaidRevenue.toLocaleString('ru-RU')}</div>
            <div className="text-purple-200 text-sm">сом / {isRu ? 'мес' : 'ай'}</div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
          {isRu ? 'Все' : 'Баары'} ({demoActiveBadges.length})
        </button>
        {badgeTypes.map(b => (
          <button key={b.id} onClick={() => setFilter(b.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${filter === b.id ? `${b.color} text-white` : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
            {b.icon} {isRu ? b.nameRu : b.nameKg} ({demoActiveBadges.filter(x => x.badge === b.id).length})
          </button>
        ))}
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">{isRu ? 'Товар' : 'Товар'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Поставщик' : 'Жеткирүүчү'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Бейдж' : 'Бейдж'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Заказов' : 'Буйрутма'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'С даты' : 'Күнүнөн'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Оплата' : 'Төлөм'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Действие' : 'Аракет'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const badge = getBadgeInfo(item.badge);
                return (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{item.productName}</td>
                    <td className="px-5 py-3 text-gray-600">{item.supplier}</td>
                    <td className="px-5 py-3">
                      <span className={`${badge.color} text-white text-xs font-bold px-2.5 py-1 rounded-full`}>
                        {badge.icon} {isRu ? badge.nameRu : badge.nameKg}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-bold">{item.orders}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(item.since).toLocaleDateString('ru-RU')}</td>
                    <td className="px-5 py-3">
                      {item.paid ? (
                        <span className="text-green-600 font-semibold">{item.amount?.toLocaleString('ru-RU')} сом</span>
                      ) : (
                        <span className="text-gray-400 text-xs">{isRu ? 'Бесплатно' : 'Акысыз'}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toast.success(isRu ? 'Бейдж обновлён' : 'Бейдж жаңыланды')}
                        className="text-xs text-primary-600 hover:underline"
                      >
                        {item.badge === 'top' ? (isRu ? 'Снять' : 'Алуу') : (isRu ? 'Управлять' : 'Башкаруу')}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
