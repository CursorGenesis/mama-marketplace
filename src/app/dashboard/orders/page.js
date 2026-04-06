'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { ArrowLeft, Phone, Mail, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SupplierOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    const q = query(collection(db, 'suppliers'), where('email', '==', user.email));
    const snap = await getDocs(q);
    if (snap.empty) { setLoading(false); return; }

    const supId = snap.docs[0].id;
    const ords = await getOrders({ supplierId: supId });
    setOrders(ords);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    toast.success('Статус обновлён');
    loadOrders();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> Назад в кабинет
      </Link>

      <h1 className="text-2xl font-bold mb-6">Заказы ({orders.length})</h1>

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: 'Все' },
          { value: 'new', label: 'Новые' },
          { value: 'in_progress', label: 'В работе' },
          { value: 'completed', label: 'Завершённые' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Список */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">{order.buyerName || 'Покупатель'}</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    {order.buyerPhone && (
                      <a href={`tel:${order.buyerPhone}`} className="flex items-center gap-1 hover:text-primary-600">
                        <Phone size={14} /> {order.buyerPhone}
                      </a>
                    )}
                    {order.buyerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={14} /> {order.buyerEmail}
                      </span>
                    )}
                  </div>
                </div>

                {/* Смена статуса */}
                <div className="flex gap-2">
                  {order.status === 'new' && (
                    <button onClick={() => handleStatusChange(order.id, 'in_progress')}
                      className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors">
                      Взять в работу
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button onClick={() => handleStatusChange(order.id, 'completed')}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
                      Завершить
                    </button>
                  )}
                  {order.buyerPhone && (
                    <a href={`https://wa.me/${order.buyerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              {/* Товары */}
              <div className="bg-gray-50 rounded-lg p-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString('ru-RU')} сом</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-bold">
                  <span>Итого</span>
                  <span className="text-primary-600">{order.total?.toLocaleString('ru-RU')} сом</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">Заказов не найдено</div>
      )}
    </div>
  );
}
