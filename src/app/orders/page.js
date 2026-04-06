'use client';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getOrders, ORDER_STATUSES } from '@/lib/firestore';
import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, ShoppingBag, LogIn } from 'lucide-react';
import Link from 'next/link';

const IS_DEMO = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key';

const demoOrders = [
  { id: 'demo-1', supplierName: 'Шоро', items: [{name: 'Максым 1л', quantity: 10, price: 75}, {name: 'Чалап 1л', quantity: 5, price: 70}], total: 1100, status: 'completed', createdAt: new Date('2026-03-25') },
  { id: 'demo-2', supplierName: 'Бишкек Сүт', items: [{name: 'Молоко 3.2% 1л', quantity: 20, price: 68}, {name: 'Сметана 20% 400г', quantity: 10, price: 110}], total: 2460, status: 'in_progress', createdAt: new Date('2026-03-28') },
  { id: 'demo-3', supplierName: 'Алтын Дан', items: [{name: 'Рис узгенский 1кг', quantity: 15, price: 180}, {name: 'Гречка 1кг', quantity: 10, price: 120}], total: 3900, status: 'new', createdAt: new Date('2026-03-30') },
  { id: 'demo-4', supplierName: 'Sweet House KG', items: [{name: 'Печенье Ассорти 500г', quantity: 8, price: 180}], total: 1440, status: 'completed', createdAt: new Date('2026-03-20') },
  { id: 'demo-5', supplierName: 'Тоо Муз', items: [{name: 'Пельмени Домашние 1кг', quantity: 5, price: 280}, {name: 'Манты 1кг', quantity: 3, price: 350}], total: 2450, status: 'cancelled', createdAt: new Date('2026-03-15') },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        if (IS_DEMO || !user) {
          // Показываем демо-заказы без регистрации
          setOrders(demoOrders);
        } else {
          const allOrders = await getOrders();
          const myOrders = allOrders.filter(o => o.buyerEmail === user.email);
          setOrders(myOrders.length > 0 ? myOrders : demoOrders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrders(demoOrders);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [user]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const s = ORDER_STATUSES[status] || ORDER_STATUSES.new;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.color}`}>
        {s.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">{t('orders_empty')}</h2>
        <Link href="/catalog" className="mt-6 inline-block px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
          {t('goToCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('my_orders')}</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Order header */}
            <button
              onClick={() => toggleExpand(order.id)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-primary-600" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{order.supplierName}</h3>
                  <p className="text-sm text-gray-400">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                {getStatusBadge(order.status)}
                <span className="font-bold text-primary-600 whitespace-nowrap">
                  {Number(order.total).toLocaleString('ru-RU')} {t('som')}
                </span>
                {expandedId === order.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>
            </button>

            {/* Expanded items */}
            {expandedId === order.id && (
              <div className="border-t px-5 py-4 bg-gray-50">
                <h4 className="text-sm font-medium text-gray-500 mb-3">{t('order_items')}</h4>
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">x{item.quantity}</span>
                        <span className="font-medium text-gray-700">
                          {(item.price * item.quantity).toLocaleString('ru-RU')} {t('som')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between">
                  <span className="font-medium text-gray-600">{t('order_total')}</span>
                  <span className="font-bold text-primary-600">
                    {Number(order.total).toLocaleString('ru-RU')} {t('som')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
