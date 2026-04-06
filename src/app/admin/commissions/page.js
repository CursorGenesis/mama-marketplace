'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { ArrowLeft, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const COMMISSION_RATE = 2; // 2%

const demoCommissions = [
  { id: 1, date: '2026-03-30', supplier: 'Шоро', buyer: 'Айбек Ж.', orderTotal: 1100, status: 'paid' },
  { id: 2, date: '2026-03-29', supplier: 'Бишкек Сүт', buyer: 'Гульнара А.', orderTotal: 2460, status: 'paid' },
  { id: 3, date: '2026-03-28', supplier: 'Алтын Дан', buyer: 'Марат С.', orderTotal: 3900, status: 'pending' },
  { id: 4, date: '2026-03-27', supplier: 'Sweet House KG', buyer: 'Назгуль Т.', orderTotal: 1440, status: 'paid' },
  { id: 5, date: '2026-03-26', supplier: 'Шоро', buyer: 'Эрлан Б.', orderTotal: 750, status: 'pending' },
  { id: 6, date: '2026-03-25', supplier: 'Тоо Муз', buyer: 'Айбек Ж.', orderTotal: 2450, status: 'paid' },
  { id: 7, date: '2026-03-24', supplier: 'Мясной Двор', buyer: 'Гульнара А.', orderTotal: 4550, status: 'paid' },
  { id: 8, date: '2026-03-23', supplier: 'Ак-Суу Агро', buyer: 'Марат С.', orderTotal: 1200, status: 'pending' },
  { id: 9, date: '2026-03-22', supplier: 'JA-Snacks', buyer: 'Назгуль Т.', orderTotal: 850, status: 'paid' },
  { id: 10, date: '2026-03-21', supplier: 'Алтын Дан', buyer: 'Эрлан Б.', orderTotal: 5200, status: 'paid' },
  { id: 11, date: '2026-03-20', supplier: 'Бишкек Сүт', buyer: 'Айбек Ж.', orderTotal: 1800, status: 'paid' },
  { id: 12, date: '2026-03-19', supplier: 'Шоро', buyer: 'Гульнара А.', orderTotal: 3200, status: 'paid' },
];

export default function CommissionsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [month, setMonth] = useState('2026-03');
  const isRu = lang === 'ru';

  // Для демо: доступ без авторизации
  // useEffect(() => {
  //   if (!authLoading && !isAdmin) router.push('/');
  // }, [isAdmin, authLoading]);

  const filtered = filter === 'all' ? demoCommissions : demoCommissions.filter(c => c.status === filter);

  const totalOrders = demoCommissions.length;
  const totalRevenue = demoCommissions.reduce((s, c) => s + c.orderTotal, 0);
  const totalCommission = Math.round(totalRevenue * COMMISSION_RATE / 100);
  const paidCommission = Math.round(demoCommissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.orderTotal, 0) * COMMISSION_RATE / 100);
  const pendingCommission = totalCommission - paidCommission;

  // По поставщикам
  const bySupplier = {};
  demoCommissions.forEach(c => {
    if (!bySupplier[c.supplier]) bySupplier[c.supplier] = { orders: 0, revenue: 0, commission: 0 };
    bySupplier[c.supplier].orders++;
    bySupplier[c.supplier].revenue += c.orderTotal;
    bySupplier[c.supplier].commission += Math.round(c.orderTotal * COMMISSION_RATE / 100);
  });

  const supplierList = Object.entries(bySupplier)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.commission - a.commission);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> {isRu ? 'Назад в админку' : 'Админге кайтуу'}
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isRu ? 'Комиссии и доходы' : 'Комиссиялар жана кирешелер'}
      </h1>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <TrendingUp size={14} /> {isRu ? 'Оборот за месяц' : 'Айлык жүгүртүү'}
          </div>
          <div className="text-2xl font-bold text-gray-800">{totalRevenue.toLocaleString('ru-RU')}</div>
          <div className="text-xs text-gray-400">сом</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <DollarSign size={14} /> {isRu ? 'Комиссия' : 'Комиссия'} ({COMMISSION_RATE}%)
          </div>
          <div className="text-2xl font-bold text-primary-600">{totalCommission.toLocaleString('ru-RU')}</div>
          <div className="text-xs text-gray-400">сом</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <CheckCircle size={14} /> {isRu ? 'Получено' : 'Алынган'}
          </div>
          <div className="text-2xl font-bold text-green-600">{paidCommission.toLocaleString('ru-RU')}</div>
          <div className="text-xs text-gray-400">сом</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
            <Clock size={14} /> {isRu ? 'Ожидает' : 'Күтүүдө'}
          </div>
          <div className="text-2xl font-bold text-orange-500">{pendingCommission.toLocaleString('ru-RU')}</div>
          <div className="text-xs text-gray-400">сом</div>
        </div>
      </div>

      {/* По поставщикам */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-800 mb-4">
          {isRu ? 'Комиссия по поставщикам' : 'Жеткирүүчүлөр боюнча комиссия'}
        </h2>
        <div className="space-y-3">
          {supplierList.map(s => (
            <div key={s.name} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                <div className="text-xs text-gray-400">{s.orders} {isRu ? 'заказов' : 'буйрутма'} · {s.revenue.toLocaleString('ru-RU')} сом</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">{s.commission.toLocaleString('ru-RU')} сом</div>
                <div className="text-xs text-gray-400">{isRu ? 'комиссия' : 'комиссия'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-4">
        {[
          { value: 'all', label: isRu ? 'Все' : 'Баары' },
          { value: 'paid', label: isRu ? 'Оплачено' : 'Төлөнгөн' },
          { value: 'pending', label: isRu ? 'Ожидает' : 'Күтүүдө' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* История */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">{isRu ? 'Дата' : 'Күнү'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Поставщик' : 'Жеткирүүчү'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Покупатель' : 'Сатып алуучу'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Сумма заказа' : 'Буйрутма суммасы'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Комиссия' : 'Комиссия'} {COMMISSION_RATE}%</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Статус' : 'Статус'}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500">{new Date(c.date).toLocaleDateString('ru-RU')}</td>
                  <td className="px-5 py-3 font-medium">{c.supplier}</td>
                  <td className="px-5 py-3 text-gray-600">{c.buyer}</td>
                  <td className="px-5 py-3 font-medium">{c.orderTotal.toLocaleString('ru-RU')} сом</td>
                  <td className="px-5 py-3 font-bold text-green-600">{Math.round(c.orderTotal * COMMISSION_RATE / 100).toLocaleString('ru-RU')} сом</td>
                  <td className="px-5 py-3">
                    {c.status === 'paid' ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {isRu ? 'Оплачено' : 'Төлөнгөн'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {isRu ? 'Ожидает' : 'Күтүүдө'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Итого */}
        <div className="px-5 py-4 bg-gray-50 border-t flex justify-between items-center">
          <span className="text-sm text-gray-500">{isRu ? 'Итого комиссия:' : 'Жалпы комиссия:'}</span>
          <span className="text-lg font-bold text-green-600">
            {Math.round(filtered.reduce((s, c) => s + c.orderTotal, 0) * COMMISSION_RATE / 100).toLocaleString('ru-RU')} сом
          </span>
        </div>
      </div>

      {/* === КОНТРОЛЬ ОПЛАТЫ ПОСТАВЩИКОВ === */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            {isRu ? 'Контроль оплаты поставщиков' : 'Жеткирүүчүлөрдүн төлөмүн көзөмөлдөө'}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-5 py-3 font-medium">{isRu ? 'Поставщик' : 'Жеткирүүчү'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Задолженность' : 'Карыз'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Срок оплаты' : 'Төлөм мөөнөтү'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Статус' : 'Статус'}</th>
                <th className="px-5 py-3 font-medium">{isRu ? 'Действия' : 'Аракеттер'}</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Алтын Дан', debt: 156, deadline: '2026-04-05', status: 'warning', daysLeft: 3, blocked: false },
                { name: 'Шоро', debt: 0, deadline: '2026-04-10', status: 'ok', daysLeft: 8, blocked: false },
                { name: 'Бишкек Сүт', debt: 98, deadline: '2026-04-07', status: 'ok', daysLeft: 5, blocked: false },
                { name: 'Sweet House KG', debt: 230, deadline: '2026-03-28', status: 'overdue', daysLeft: -5, blocked: false },
                { name: 'Мясной Двор', debt: 182, deadline: '2026-03-25', status: 'blocked', daysLeft: -8, blocked: true },
              ].map((s, i) => (
                <tr key={i} className={`border-t ${s.blocked ? 'bg-red-50' : s.status === 'overdue' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}>
                  <td className="px-5 py-3">
                    <span className="font-medium text-gray-800">{s.name}</span>
                    {s.blocked && <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{isRu ? 'Заблокирован' : 'Бөгөттөлгөн'}</span>}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-800">
                    {s.debt > 0 ? `${s.debt} сом` : <span className="text-green-600">0</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{new Date(s.deadline).toLocaleDateString('ru-RU')}</td>
                  <td className="px-5 py-3">
                    {s.status === 'ok' && <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">{isRu ? 'В норме' : 'Жакшы'}</span>}
                    {s.status === 'warning' && <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">⚠️ {isRu ? 'Через 3 дня' : '3 күндөн кийин'}</span>}
                    {s.status === 'overdue' && <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">🔴 {isRu ? 'Просрочено' : 'Мөөнөтү өткөн'}</span>}
                    {s.status === 'blocked' && <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">🚫 {isRu ? 'Заблокирован' : 'Бөгөттөлгөн'}</span>}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1">
                      {!s.blocked && s.debt > 0 && (
                        <button
                          onClick={() => toast.success(isRu ? `Уведомление отправлено ${s.name}` : `${s.name} га билдирүү жөнөтүлдү`)}
                          className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200 transition-colors"
                        >
                          {isRu ? 'Напомнить' : 'Эскертүү'}
                        </button>
                      )}
                      {s.status === 'overdue' && !s.blocked && (
                        <button
                          onClick={() => toast.success(isRu ? `${s.name} заблокирован` : `${s.name} бөгөттөлдү`)}
                          className="px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                        >
                          {isRu ? 'Блокировать' : 'Бөгөттөө'}
                        </button>
                      )}
                      {s.blocked && (
                        <button
                          onClick={() => toast.success(isRu ? `${s.name} разблокирован` : `${s.name} бөгөттөн чыгарылды`)}
                          className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                        >
                          {isRu ? 'Разблокировать' : 'Бөгөттөн чыгаруу'}
                        </button>
                      )}
                      {s.debt === 0 && (
                        <span className="text-xs text-green-500">✅ {isRu ? 'Оплачено' : 'Төлөнгөн'}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Правила */}
        <div className="px-5 py-4 bg-gray-50 border-t">
          <p className="text-xs text-gray-500 font-medium mb-2">{isRu ? '📋 Правила:' : '📋 Эрежелер:'}</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• {isRu ? 'За 3 дня до срока — автоматическое уведомление поставщику' : '3 күн мурда — жеткирүүчүгө автоматтык билдирүү'}</li>
            <li>• {isRu ? 'Просрочка — повторное уведомление + предупреждение о блокировке' : 'Мөөнөт өткөндө — кайталоо билдирүүсү + бөгөттөө жөнүндө эскертүү'}</li>
            <li>• {isRu ? 'Более 7 дней просрочки — блокировка аккаунта (товары не видны клиентам)' : '7 күндөн ашык мөөнөт — аккаунт бөгөттөлөт (товарлар кардарларга көрүнбөйт)'}</li>
            <li>• {isRu ? 'После оплаты — разблокировка в течение 1 часа' : 'Төлөмдөн кийин — 1 сааттын ичинде бөгөттөн чыгаруу'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
