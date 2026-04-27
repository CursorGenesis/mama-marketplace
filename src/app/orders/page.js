'use client';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getOrders, updateOrderStatus } from '@/lib/firestore';
import { sendTelegramNotification } from '@/lib/telegram';
import { useState, useEffect } from 'react';
import { Package, ChevronDown, ChevronUp, ShoppingBag, CheckCircle, XCircle, Clock, Truck } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PromptModal from '@/components/PromptModal';

const STATUS_CONFIG = {
  new: { label: 'Ожидает', labelKg: 'Күтүүдө', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  packed: { label: 'Собран', labelKg: 'Чогултулду', color: 'bg-orange-100 text-orange-700', icon: Package },
  delivering: { label: 'В доставке', labelKg: 'Жеткирүүдө', color: 'bg-blue-100 text-blue-700', icon: Truck },
  received: { label: 'Получено', labelKg: 'Алынды', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  not_received: { label: 'Не получен', labelKg: 'Алынган жок', color: 'bg-red-100 text-red-700', icon: XCircle },
  cancelled: { label: 'Отменён', labelKg: 'Жокко чыгарылды', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

export default function OrdersPage() {
  const { user, profile } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updating, setUpdating] = useState(null);
  // Модалка для запроса причины «не получено» — заменяет нативный prompt(),
  // который не работает в iOS PWA и выглядит как чужеродное окно
  const [reasonModal, setReasonModal] = useState({ open: false, order: null });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const allOrders = await getOrders({ buyerId: user.uid });
      setOrders(allOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
    setLoading(false);
  };

  const handleConfirmReceived = async (order) => {
    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, 'received');

      // Уведомление админу + покупателю (если у него подключён Telegram)
      sendTelegramNotification('order_status', {
        orderId: order.id ? order.id.slice(0, 8).toUpperCase() : '',
        shopName: order.shopName || profile?.shopName || '',
        supplierName: order.supplierName || 'Поставщик',
        status: 'received',
        total: order.totalPrice || order.total || 0,
        buyerChatId: order.buyerChatId || profile?.telegramChatId || null,
        coins: Math.floor((order.totalPrice || order.total || 0) / 500),
      }).catch(() => {});

      toast.success(isRu ? 'Спасибо! Заказ подтверждён' : 'Рахмат! Заказ ырасталды');
      await fetchOrders();
    } catch (e) {
      toast.error(isRu ? 'Ошибка' : 'Ката');
    }
    setUpdating(null);
  };

  // Открывает модалку для ввода причины. Сама обработка — ниже в submitNotReceived.
  const handleNotReceived = (order) => {
    setReasonModal({ open: true, order });
  };

  const submitNotReceived = async (rawReason) => {
    const order = reasonModal.order;
    setReasonModal({ open: false, order: null });
    if (!order) return;

    const reason = String(rawReason).replace(/[<>"'&]/g, '').trim();
    if (!reason) return;

    setUpdating(order.id);
    try {
      await updateOrderStatus(order.id, 'not_received');

      sendTelegramNotification('order_status', {
        orderId: order.id ? order.id.slice(0, 8).toUpperCase() : '',
        shopName: order.shopName || profile?.shopName || '',
        supplierName: order.supplierName || 'Поставщик',
        status: 'not_received',
        total: order.totalPrice || order.total || 0,
        reason,
        buyerPhone: order.buyerPhone || profile?.phone || '',
        buyerChatId: order.buyerChatId || profile?.telegramChatId || null,
      }).catch(() => {});

      toast.success(isRu ? 'Заявка на возврат отправлена' : 'Кайтаруу өтүнүчү жөнөтүлдү');
      await fetchOrders();
    } catch (e) {
      toast.error(isRu ? 'Ошибка' : 'Ката');
    }
    setUpdating(null);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">{isRu ? 'Войдите чтобы увидеть заказы' : 'Заказдарды көрүү үчүн кириңиз'}</h2>
        <Link href="/auth" className="mt-4 inline-block px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold">
          {isRu ? 'Войти' : 'Кирүү'}
        </Link>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-600 mb-2">{isRu ? 'Заказов пока нет' : 'Заказдар жок'}</h2>
        <p className="text-gray-400 mb-6">{isRu ? 'Оформите первый заказ в каталоге' : 'Каталогдон биринчи заказ берүүнү'}</p>
        <Link href="/catalog" className="inline-block px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold">
          {isRu ? 'В каталог' : 'Каталогго'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Мои заказы' : 'Менин заказдарым'}</h1>

      <div className="space-y-4">
        {orders.map(order => {
          const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
          const StatusIcon = status.icon;
          const canConfirm = ['new', 'packed', 'delivering'].includes(order.status);
          const total = order.totalPrice || order.total || 0;

          return (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Заголовок заказа */}
              <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    <Package size={20} className="text-slate-600" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{order.supplierName}</h3>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)} {order.orderNumber && `• ${order.orderNumber}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    <StatusIcon size={12} />
                    {isRu ? status.label : status.labelKg}
                  </span>
                  <span className="font-bold text-slate-800 whitespace-nowrap">
                    {Number(total).toLocaleString('ru-RU')} сом
                  </span>
                  {expandedId === order.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </button>

              {/* Развёрнутые детали */}
              {expandedId === order.id && (
                <div className="border-t">
                  {/* Товары */}
                  <div className="px-5 py-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">{isRu ? 'Товары' : 'Товарлар'}</h4>
                    <div className="space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400">x{item.quantity}</span>
                            <span className="font-medium text-gray-700">
                              {(item.price * item.quantity).toLocaleString('ru-RU')} сом
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between">
                      <span className="font-medium text-gray-600">{isRu ? 'Итого' : 'Жалпы'}</span>
                      <span className="font-bold text-slate-800">{Number(total).toLocaleString('ru-RU')} сом</span>
                    </div>
                  </div>

                  {/* Кнопки подтверждения */}
                  {canConfirm && (
                    <div className="px-5 py-4 bg-white border-t">
                      <p className="text-sm text-gray-500 mb-3">
                        {isRu ? 'Вы получили этот заказ?' : 'Бул заказды алдыңызбы?'}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConfirmReceived(order)}
                          disabled={updating === order.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle size={18} />
                          {updating === order.id ? '...' : (isRu ? 'Да, получил' : 'Ооба, алдым')}
                        </button>
                        <button
                          onClick={() => handleNotReceived(order)}
                          disabled={updating === order.id}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={18} />
                          {isRu ? 'Не получил' : 'Алган жокмун'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Статус подтверждён */}
                  {order.status === 'received' && (
                    <div className="px-5 py-3 bg-green-50 border-t">
                      <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                        <CheckCircle size={16} /> {isRu ? 'Вы подтвердили получение этого заказа' : 'Сиз бул заказды алганыңызды ырастадыңыз'}
                      </p>
                    </div>
                  )}

                  {/* Статус не получен */}
                  {order.status === 'not_received' && (
                    <div className="px-5 py-3 bg-red-50 border-t">
                      <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                        <XCircle size={16} /> {isRu ? 'Заявка на возврат отправлена. Мы свяжемся с вами' : 'Кайтаруу өтүнүчү жөнөтүлдү. Биз сиз менен байланышабыз'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <PromptModal
        open={reasonModal.open}
        title={isRu ? 'Не получили заказ?' : 'Заказ алган жоксузбу?'}
        description={isRu ? 'Опишите коротко: товар не приехал, брак, не тот товар и т.п.' : 'Кыскача жазыңыз: товар келген жок, брак, башка товар ж.б.'}
        placeholder={isRu ? 'Например: не доехал' : 'Мисалы: келген жок'}
        confirmText={isRu ? 'Отправить заявку' : 'Өтүнүч жөнөтүү'}
        cancelText={isRu ? 'Отмена' : 'Жокко чыгаруу'}
        multiline
        onConfirm={submitNotReceived}
        onCancel={() => setReasonModal({ open: false, order: null })}
      />
    </div>
  );
}
