'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { ArrowLeft, Phone, Mail, MessageCircle, Download } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SupplierOrdersPage() {
  const { user } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
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
    toast.success(isRu ? 'Статус обновлён' : 'Статус жаңыланды');
    loadOrders();
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.error(isRu ? 'Нет заказов для выгрузки' : 'Жүктөө үчүн заказдар жок');
      return;
    }

    // Формируем строки: каждый товар — отдельная строка (формат 1С)
    const rows = [];
    filtered.forEach(order => {
      const date = order.createdAt?.toDate
        ? order.createdAt.toDate().toLocaleDateString('ru-RU')
        : order.createdAt || '';
      const orderNum = order.id.slice(0, 8).toUpperCase();
      const status = order.status === 'received' ? (isRu ? 'Получено' : 'Алынды')
        : order.status === 'not_received' ? (isRu ? 'Не получено' : 'Алынган жок')
        : (isRu ? 'Новый' : 'Жаңы');

      (order.items || []).forEach(item => {
        rows.push({
          date,
          orderNum,
          buyerName: order.buyerName || '',
          buyerPhone: order.buyerPhone || '',
          buyerAddress: order.buyerAddress || order.address || '',
          productName: item.name || '',
          unit: item.unit || 'шт',
          quantity: item.quantity || 0,
          price: item.price || 0,
          sum: (item.price || 0) * (item.quantity || 0),
          status,
        });
      });
    });

    // Заголовки для 1С
    const headers = [
      'Дата', 'Номер заказа', 'Контрагент', 'Телефон', 'Адрес доставки',
      'Номенклатура', 'Ед.', 'Количество', 'Цена', 'Сумма', 'Статус'
    ];

    // Формируем CSV с BOM для корректного открытия в Excel
    const BOM = '\uFEFF';
    const csv = BOM + headers.join(';') + '\n' + rows.map(r =>
      [r.date, r.orderNum, r.buyerName, r.buyerPhone, r.buyerAddress,
       r.productName, r.unit, r.quantity, r.price, r.sum, r.status
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(';')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarketKG_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isRu ? 'Файл скачан — откройте в 1С или Excel' : 'Файл жүктөлдү — 1С же Excel де ачыңыз');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> {isRu ? 'Назад в кабинет' : 'Кабинетке кайтуу'}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isRu ? 'История заказов' : 'Заказдар тарыхы'} ({orders.length})</h1>
        {orders.length > 0 && (
          <button onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            <Download size={16} />
            {isRu ? 'Выгрузить в Excel / 1С' : 'Excel / 1С ге жүктөө'}
          </button>
        )}
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: isRu ? 'Все' : 'Баары' },
          { value: 'new', label: isRu ? 'Новые' : 'Жаңы' },
          { value: 'received', label: isRu ? 'Получено' : 'Алынды' },
          { value: 'not_received', label: isRu ? 'Не получено' : 'Алынган жок' },
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
                    <h3 className="font-bold">{order.buyerName || (isRu ? 'Покупатель' : 'Сатып алуучу')}</h3>
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

                {/* Связаться */}
                <div className="flex gap-2">
                  {order.buyerPhone && (
                    <>
                      <a href={`tel:${order.buyerPhone}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                        <Phone size={14} /> {isRu ? 'Позвонить' : 'Чалуу'}
                      </a>
                      <a href={`https://wa.me/${order.buyerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    </>
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
                  <span>{isRu ? 'Итого' : 'Жалпы'}</span>
                  <span className="text-primary-600">{order.total?.toLocaleString('ru-RU')} сом</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">{isRu ? 'Заказов не найдено' : 'Заказдар табылган жок'}</div>
      )}
    </div>
  );
}
