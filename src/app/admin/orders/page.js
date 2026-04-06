'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminOrdersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.push('/'); return; }
    loadOrders();
  }, [isAdmin, authLoading]);

  const loadOrders = async () => {
    const ords = await getOrders();
    setOrders(ords);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success('Статус обновлён');
    loadOrders();
  };

  const handleAssignAgent = async (orderId) => {
    const agentName = prompt('Имя агента:');
    if (!agentName) return;
    await updateOrderStatus(orderId, undefined, agentName);
    toast.success('Агент назначен');
    loadOrders();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/admin" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> Назад в админку
      </Link>

      <h1 className="text-2xl font-bold mb-6">Все заказы ({orders.length})</h1>

      {/* Статистика комиссий */}
      {(() => {
        const COMMISSION_PERCENT = 5;
        const completedOrders = orders.filter(o => o.status === 'completed');
        const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        const completedRevenue = completedOrders.reduce((s, o) => s + (o.total || 0), 0);
        const totalCommission = Math.round(totalRevenue * COMMISSION_PERCENT / 100);
        const earnedCommission = Math.round(completedRevenue * COMMISSION_PERCENT / 100);
        const pendingCommission = totalCommission - earnedCommission;
        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">Оборот платформы</div>
              <div className="text-xl font-bold text-gray-800">{totalRevenue.toLocaleString('ru-RU')} <span className="text-sm font-normal text-gray-400">сом</span></div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">Комиссия ({COMMISSION_PERCENT}%)</div>
              <div className="text-xl font-bold text-primary-600">{totalCommission.toLocaleString('ru-RU')} <span className="text-sm font-normal text-gray-400">сом</span></div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">Получено (завершённые)</div>
              <div className="text-xl font-bold text-green-600">{earnedCommission.toLocaleString('ru-RU')} <span className="text-sm font-normal text-gray-400">сом</span></div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-xs text-gray-400 mb-1">Ожидает оплаты</div>
              <div className="text-xl font-bold text-orange-500">{pendingCommission.toLocaleString('ru-RU')} <span className="text-sm font-normal text-gray-400">сом</span></div>
            </div>
          </div>
        );
      })()}

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: `Все (${orders.length})` },
          { value: 'new', label: `Новые (${orders.filter(o => o.status === 'new').length})` },
          { value: 'in_progress', label: `В работе (${orders.filter(o => o.status === 'in_progress').length})` },
          { value: 'completed', label: `Завершённые (${orders.filter(o => o.status === 'completed').length})` },
          { value: 'cancelled', label: `Отменённые (${orders.filter(o => o.status === 'cancelled').length})` },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Таблица */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-5 py-3 font-medium">Покупатель</th>
                  <th className="px-5 py-3 font-medium">Поставщик</th>
                  <th className="px-5 py-3 font-medium">Товары</th>
                  <th className="px-5 py-3 font-medium">Сумма</th>
                  <th className="px-5 py-3 font-medium">Комиссия 5%</th>
                  <th className="px-5 py-3 font-medium">Статус</th>
                  <th className="px-5 py-3 font-medium">Агент</th>
                  <th className="px-5 py-3 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-medium">{o.buyerName || '—'}</div>
                      <div className="text-gray-400 text-xs">{o.buyerEmail}</div>
                      <div className="text-gray-400 text-xs">{o.buyerPhone}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-sm">{o.supplierName || '—'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {o.items?.map((item, i) => (
                        <div key={i} className="text-xs">{item.name} x{item.quantity}</div>
                      ))}
                    </td>
                    <td className="px-5 py-4 font-bold">{o.total?.toLocaleString('ru-RU')} сом</td>
                    <td className="px-5 py-4">
                      <span className="font-semibold text-green-600">{Math.round((o.total || 0) * 0.05).toLocaleString('ru-RU')} сом</span>
                    </td>
                    <td className="px-5 py-4"><OrderStatusBadge status={o.status} /></td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleAssignAgent(o.id)}
                        className="text-primary-600 hover:underline text-xs">
                        {o.agentId || 'Назначить'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {o.status === 'new' && (
                          <button onClick={() => handleStatusChange(o.id, 'in_progress')}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200">
                            В работу
                          </button>
                        )}
                        {o.status === 'in_progress' && (
                          <button onClick={() => handleStatusChange(o.id, 'completed')}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200">
                            Завершить
                          </button>
                        )}
                        {o.status !== 'cancelled' && o.status !== 'completed' && (
                          <button onClick={() => handleStatusChange(o.id, 'cancelled')}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200">
                            Отмена
                          </button>
                        )}
                        {o.buyerPhone && (
                          <a href={`https://wa.me/${o.buyerPhone.replace(/[^0-9]/g, '')}`}
                            target="_blank" rel="noopener noreferrer"
                            className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600">
                            WA
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl">Заказов не найдено</div>
      )}
    </div>
  );
}
