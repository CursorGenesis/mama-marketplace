'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getOrders, updateOrderStatus, ORDER_STATUSES } from '@/lib/firestore';
import { sendTelegramNotification } from '@/lib/telegram';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import OrderStatusBadge from '@/components/OrderStatusBadge';
import { ArrowLeft, Phone, Mail, MessageCircle, Download, Printer, Package, Truck, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SupplierOrdersPage() {
  const { user, profile } = useAuth();
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

  const handleStatusChange = async (orderId, newStatus, order) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      // Уведомление покупателю при смене на "В доставке"
      if (newStatus === 'delivering' && order.buyerPhone) {
        sendTelegramNotification('order_status', {
          orderId: orderId.slice(0, 8).toUpperCase(),
          status: 'delivering',
          buyerName: order.buyerName || '',
          supplierName: profile?.companyName || profile?.name || '',
          total: order.total || 0,
        }).catch(() => {});
      }

      const statusLabels = {
        packed: isRu ? 'Собран' : 'Чогултулду',
        delivering: isRu ? 'В доставке' : 'Жеткирүүдө',
      };
      toast.success(statusLabels[newStatus] || (isRu ? 'Статус обновлён' : 'Статус жаңыланды'));
      loadOrders();
    } catch (e) {
      toast.error(isRu ? 'Ошибка обновления' : 'Жаңыртуу катасы');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // Сколько заказов у каждого клиента (у этого поставщика). Если 1 — это первый заказ, метим "Новый клиент"
  const buyerKey = (o) => o.buyerEmail || o.buyerId || o.buyerPhone || '';
  const ordersByBuyer = orders.reduce((acc, o) => {
    const key = buyerKey(o);
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // Счётчики для фильтров
  const counts = {
    all: orders.length,
    new: orders.filter(o => o.status === 'new').length,
    packed: orders.filter(o => o.status === 'packed').length,
    delivering: orders.filter(o => o.status === 'delivering').length,
    received: orders.filter(o => o.status === 'received').length,
  };

  // Печать накладных
  const printInvoices = () => {
    const toPrint = filtered.filter(o => o.status === 'packed' || (filter === 'all' && o.status === 'packed'));
    const target = filter === 'packed' ? filtered : orders.filter(o => o.status === 'packed');
    if (target.length === 0) {
      toast.error(isRu ? 'Нет собранных заказов для печати' : 'Басып чыгаруу үчүн чогултулган заказдар жок');
      return;
    }

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${isRu ? 'Накладные' : 'Жүк каттар'}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; }
  .invoice { page-break-after: always; padding: 20px; }
  .invoice:last-child { page-break-after: auto; }
  h2 { margin: 0 0 5px; font-size: 16px; }
  .info { margin-bottom: 10px; color: #555; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f5; font-weight: bold; }
  .total { font-weight: bold; font-size: 14px; margin-top: 10px; text-align: right; }
  .footer { margin-top: 30px; display: flex; justify-content: space-between; }
  .sign { border-top: 1px solid #000; width: 200px; text-align: center; padding-top: 5px; font-size: 11px; }
</style></head><body>
${target.map((order, idx) => {
      const date = order.createdAt?.toDate
        ? order.createdAt.toDate().toLocaleDateString('ru-RU')
        : new Date().toLocaleDateString('ru-RU');
      const num = order.id.slice(0, 8).toUpperCase();
      return `<div class="invoice">
  <h2>${isRu ? 'Накладная' : 'Жүк кат'} №${num}</h2>
  <div class="info">
    <div>${isRu ? 'Дата' : 'Дата'}: ${date}</div>
    <div>${isRu ? 'Покупатель' : 'Сатып алуучу'}: ${order.buyerName || '—'}</div>
    <div>${isRu ? 'Телефон' : 'Телефон'}: ${order.buyerPhone || '—'}</div>
    <div>${isRu ? 'Адрес' : 'Дарек'}: ${order.buyerAddress || order.address || '—'}</div>
  </div>
  <table>
    <thead><tr>
      <th>№</th><th>${isRu ? 'Наименование' : 'Аталышы'}</th><th>${isRu ? 'Ед.' : 'Бир.'}</th>
      <th>${isRu ? 'Кол-во' : 'Саны'}</th><th>${isRu ? 'Цена' : 'Баа'}</th><th>${isRu ? 'Сумма' : 'Сумма'}</th>
    </tr></thead>
    <tbody>${(order.items || []).map((item, i) =>
      `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.unit || 'шт'}</td>
      <td>${item.quantity}</td><td>${Number(item.price).toLocaleString('ru-RU')}</td>
      <td>${(item.price * item.quantity).toLocaleString('ru-RU')}</td></tr>`
    ).join('')}</tbody>
  </table>
  <div class="total">${isRu ? 'Итого' : 'Жалпы'}: ${order.total?.toLocaleString('ru-RU')} сом</div>
  <div class="footer">
    <div class="sign">${isRu ? 'Отпустил' : 'Берген'}</div>
    <div class="sign">${isRu ? 'Получил' : 'Алган'}</div>
  </div>
</div>`;
    }).join('')}
</body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  // Экспорт в Excel/1С
  const exportToExcel = () => {
    if (filtered.length === 0) {
      toast.error(isRu ? 'Нет заказов для выгрузки' : 'Жүктөө үчүн заказдар жок');
      return;
    }

    const rows = [];
    filtered.forEach(order => {
      const date = order.createdAt?.toDate
        ? order.createdAt.toDate().toLocaleDateString('ru-RU')
        : order.createdAt || '';
      const orderNum = order.id.slice(0, 8).toUpperCase();
      const statusInfo = ORDER_STATUSES[order.status];
      const status = statusInfo ? (isRu ? statusInfo.label : (statusInfo.labelKg || statusInfo.label)) : order.status;

      (order.items || []).forEach(item => {
        rows.push({
          date, orderNum,
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

    const headers = [
      'Дата', 'Номер заказа', 'Контрагент', 'Телефон', 'Адрес доставки',
      'Номенклатура', 'Ед.', 'Количество', 'Цена', 'Сумма', 'Статус'
    ];
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
    a.download = `Arzaman.kg_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isRu ? 'Файл скачан' : 'Файл жүктөлдү');
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> {isRu ? 'Назад в кабинет' : 'Кабинетке кайтуу'}
      </Link>

      {/* Заголовок и кнопки */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">{isRu ? 'Заказы' : 'Заказдар'} ({orders.length})</h1>
        <div className="flex gap-2">
          {counts.packed > 0 && (
            <button onClick={printInvoices}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Printer size={16} />
              {isRu ? `Печать накладных (${counts.packed})` : `Жүк каттарды басуу (${counts.packed})`}
            </button>
          )}
          {orders.length > 0 && (
            <button onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
              <Download size={16} />
              {isRu ? 'Excel / 1С' : 'Excel / 1С'}
            </button>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { value: 'all', label: isRu ? 'Все' : 'Баары' },
          { value: 'new', label: isRu ? 'Новые' : 'Жаңы', dot: true },
          { value: 'packed', label: isRu ? 'Собраны' : 'Чогултулган' },
          { value: 'delivering', label: isRu ? 'В доставке' : 'Жеткирүүдө' },
          { value: 'received', label: isRu ? 'Получено' : 'Алынды' },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}>
            {f.label} {counts[f.value] > 0 && `(${counts[f.value]})`}
            {f.dot && counts.new > 0 && filter !== 'new' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Список заказов */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order.id} className={`bg-white rounded-xl p-5 shadow-sm ${order.status === 'new' ? 'border-l-4 border-red-400' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{order.buyerName || (isRu ? 'Покупатель' : 'Сатып алуучу')}</h3>
                    {ordersByBuyer[buyerKey(order)] === 1 && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap" title={isRu ? 'Первый заказ от этого клиента — рекомендуем позвонить для подтверждения' : ''}>
                        ⚠ {isRu ? 'Новый клиент' : 'Жаңы кардар'}
                      </span>
                    )}
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                    {order.buyerPhone && (
                      <a href={`tel:${order.buyerPhone}`} className="flex items-center gap-1 hover:text-primary-600">
                        <Phone size={14} /> {order.buyerPhone}
                      </a>
                    )}
                    {(order.buyerAddress || order.address) && (
                      <span className="text-gray-400">{order.buyerAddress || order.address}</span>
                    )}
                    {order.createdAt?.toDate && (
                      <span className="text-gray-400">{order.createdAt.toDate().toLocaleDateString('ru-RU')}</span>
                    )}
                  </div>
                </div>

                {/* Связаться */}
                <div className="flex gap-2 shrink-0">
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
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm">
                    <span>{item.name} x{item.quantity} {item.unit || 'шт'}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString('ru-RU')} сом</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-200 font-bold">
                  <span>{isRu ? 'Итого' : 'Жалпы'}</span>
                  <span className="text-primary-600">{order.total?.toLocaleString('ru-RU')} сом</span>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="flex gap-2">
                {order.status === 'new' && (
                  <button onClick={() => handleStatusChange(order.id, 'packed', order)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-semibold hover:bg-yellow-600 transition-colors">
                    <Package size={16} /> {isRu ? 'Собран' : 'Чогултулду'}
                  </button>
                )}
                {order.status === 'packed' && (
                  <button onClick={() => handleStatusChange(order.id, 'delivering', order)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
                    <Truck size={16} /> {isRu ? 'В доставке' : 'Жеткирүүдө'}
                  </button>
                )}
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
