'use client';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { Minus, Plus, Trash2, ShoppingBag, Send, MessageCircle, MapPin, Sparkles } from 'lucide-react';
import { BOUGHT_TOGETHER, DEMO_PRODUCTS, DEMO_SUPPLIERS } from '@/lib/demoData';
import { getSmartRecommendations, saveOrderToHistory, seedDemoHistory } from '@/lib/recommendations';
import { createOrder } from '@/lib/firestore';
import { sendTelegramNotification } from '@/lib/telegram';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { useState, useEffect, useRef } from 'react';
import { getNextDeliveryDate, formatDeliveryDate } from '@/lib/delivery';

const DeliveryMap = dynamic(() => import('@/components/DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[250px] md:h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center text-gray-400">
        <MapPin size={32} className="mx-auto mb-1" />
        <p className="text-sm">Загрузка карты...</p>
      </div>
    </div>
  ),
});


export default function CartPage() {
  const router = useRouter();
  const { items, addItem, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCart();
  const { user, profile, updateProfile } = useAuth();
  const { t, lang } = useLang();
  const [submitting, setSubmitting] = useState({});
  // Синхронный лок против двойного клика — useState не успевает обновиться между двумя
  // быстрыми нажатиями, и без этого создаются дубли заказов с одинаковым orderNumber.
  const submitLockRef = useRef(false);
  const [sentSuppliers, setSentSuppliers] = useState([]);
  const [expandedSupplier, setExpandedSupplier] = useState(null);

  const [form, setForm] = useState({
    name: '',
    shopName: '',
    phone: '',
    address: '',
    comment: '',
  });

  // Авто-заполнение из профиля
  useEffect(() => {
    if (profile) {
      setForm(prev => ({
        ...prev,
        name: prev.name || profile.name || '',
        phone: prev.phone || profile.phone || '',
        shopName: prev.shopName || profile.shopName || '',
        address: prev.address || profile.address || '',
      }));
    }
  }, [profile]);
  const [deliveryMarker, setDeliveryMarker] = useState(null);
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [searchingAddress, setSearchingAddress] = useState(false);

  function handleMapClick(latlng) {
    setDeliveryMarker(latlng);
    // Обратный геокодинг — получить адрес по координатам
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng[0]}&lon=${latlng[1]}&accept-language=ru`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          const short = data.display_name.split(',').slice(0, 3).join(',');
          setForm(prev => ({ ...prev, address: short }));
        }
      })
      .catch(() => {
        setForm(prev => ({ ...prev, address: `${latlng[0].toFixed(4)}°, ${latlng[1].toFixed(4)}°` }));
      });
  }

  // Геокодинг — найти точку по адресу
  function searchAddressOnMap() {
    const addr = form.address.trim();
    if (!addr || addr.length < 3) return;

    setSearchingAddress(true);
    const query = addr.includes('Бишкек') || addr.includes('Ош') ? addr : `${addr}, Кыргызстан`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=ru`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          const latlng = [parseFloat(lat), parseFloat(lon)];
          setDeliveryMarker(latlng);
          toast.success(t('map_found'));
        } else {
          toast.error(t('map_not_found'));
        }
      })
      .catch(() => {
        toast.error('Ошибка поиска. Укажите точку на карте.');
      })
      .finally(() => setSearchingAddress(false));
  }

  // Группируем товары по поставщику
  const groupedBySupplier = {};
  items.forEach(item => {
    const key = item.supplierId || 'unknown';
    if (!groupedBySupplier[key]) {
      const supplier = DEMO_SUPPLIERS.find(s => s.id === key);
      groupedBySupplier[key] = {
        supplierId: key,
        supplierName: item.supplierName || 'Поставщик',
        minOrder: supplier?.minOrder || 0,
        deliverySchedule: supplier?.deliverySchedule || {},
        items: [],
        total: 0,
      };
    }
    groupedBySupplier[key].items.push(item);
    groupedBySupplier[key].total += item.price * item.quantity;
  });

  const supplierGroups = Object.values(groupedBySupplier);
  const hasMinOrderIssue = supplierGroups.some(g => g.minOrder > 0 && g.total < g.minOrder);

  // === ЗАЩИТА ОТ ФЕЙКОВЫХ ЗАКАЗОВ ===
  const ORDER_LIMIT_KEY = 'marketkg_order_limit';
  const BLACKLIST_KEY = 'marketkg_blacklist';

  function validateOrder() {
    // 0. Авторизация — Firestore Rules требуют buyerId == auth.uid при создании
    // заказа. Без логина пользователь получит permission-denied. Перехватываем
    // здесь и направляем на вход (актуально для iOS PWA, где сессия Firebase
    // может слететь после долгого неиспользования).
    if (!user) {
      toast.error(lang === 'kg'
        ? 'Заказ берүү үчүн аккаунтуңузга кириңиз'
        : 'Войдите в аккаунт чтобы оформить заказ');
      router.push('/auth');
      return false;
    }

    // 1. Проверка обязательных полей
    if (!form.name || !form.phone) {
      toast.error(t('fillNamePhone'));
      return false;
    }

    // 2. Проверка формата телефона (должен быть KG номер)
    const phoneClean = form.phone.replace(/[^0-9+]/g, '');
    if (phoneClean.length < 9) {
      toast.error(lang === 'kg' ? 'Туура телефон номерин жазыңыз' : 'Укажите корректный номер телефона');
      return false;
    }

    // 3. Проверка названия магазина
    if (!form.shopName || form.shopName.trim().length < 2) {
      toast.error(lang === 'kg' ? 'Дүкөнүңүздүн атын жазыңыз' : 'Укажите название вашего магазина');
      return false;
    }

    // 3.1. Проверка адреса
    if (!form.address || form.address.trim().length < 3) {
      toast.error(lang === 'kg' ? 'Жеткирүү дарегин жазыңыз' : 'Укажите адрес доставки');
      return false;
    }

    // 4. Проверка чёрного списка
    const blacklist = JSON.parse(localStorage.getItem(BLACKLIST_KEY) || '[]');
    if (blacklist.includes(phoneClean)) {
      toast.error(lang === 'kg' ? 'Бул номер бөгөттөлгөн' : 'Этот номер заблокирован. Свяжитесь с поддержкой');
      return false;
    }

    // 5. Проверка минимального заказа
    const minOrderIssues = supplierGroups.filter(g => g.minOrder > 0 && g.total < g.minOrder);
    if (minOrderIssues.length > 0) {
      const names = minOrderIssues.map(g => g.supplierName).join(', ');
      toast.error(lang === 'kg'
        ? `Мин. заказ суммасына жеткен жок: ${names}`
        : `Не набрана мин. сумма заказа: ${names}`);
      return false;
    }

    // 6. Лимит заказов (не более 10 в час)
    const now = Date.now();
    const orderTimes = JSON.parse(localStorage.getItem(ORDER_LIMIT_KEY) || '[]');
    const recentOrders = orderTimes.filter(t => now - t < 3600000);
    if (recentOrders.length >= 10) {
      toast.error(lang === 'kg' ? 'Заказдар лимити ашты. 1 сааттан кийин кайталаңыз' : 'Превышен лимит заказов. Попробуйте через 1 час');
      return false;
    }
    localStorage.setItem(ORDER_LIMIT_KEY, JSON.stringify([...recentOrders, now]));

    return true;
  }

  // Отправка заявки конкретному поставщику через WhatsApp
  const handleWhatsApp = (group) => {
    if (!form.name || !form.phone) {
      toast.error(t('fillNamePhone'));
      return;
    }

    let text = `*Заявка с Arzaman.kg*\n\n`;
    text += `*Покупатель:* ${form.name}\n`;
    if (form.shopName) text += `*Магазин:* ${form.shopName}\n`;
    text += `*Телефон:* ${form.phone}\n`;
    if (form.address) text += `*Адрес:* ${form.address}\n`;
    text += `\n*Товары:*\n`;
    group.items.forEach(item => {
      text += `- ${item.name} x${item.quantity} = ${(item.price * item.quantity).toLocaleString('ru-RU')} сом\n`;
    });
    text += `\n*Итого: ${group.total.toLocaleString('ru-RU')} сом*`;
    if (form.comment) text += `\n\nКомментарий: ${form.comment}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Отправка заявки конкретному поставщику
  const handleSubmitToSupplier = async (group) => {
    if (!validateOrder()) return;

    // Сохраняем данные в профиль если не заполнены (защита: в след. раз телефон подставится автоматически)
    if (user && updateProfile) {
      const updates = {};
      if (form.shopName && !profile?.shopName) updates.shopName = form.shopName;
      if (form.address && !profile?.address) updates.address = form.address;
      if (form.phone && !profile?.phone) updates.phone = form.phone;
      if (form.name && !profile?.name) updates.name = form.name;
      if (Object.keys(updates).length > 0) {
        updateProfile(updates).catch(() => {});
      }
    }

    setSubmitting(prev => ({ ...prev, [group.supplierId]: true }));

    const orderNumber = 'MKG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();

    let supplierChatId = null;
    try {
      const result = await createOrder({
        orderNumber,
        buyerId: user?.uid || null,
        buyerName: form.name,
        buyerPhone: form.phone,
        shopName: form.shopName,
        address: form.address,
        comment: form.comment,
        supplierId: group.supplierId,
        supplierName: group.supplierName,
        items: group.items.map(item => ({
          id: item.id, name: item.name, quantity: item.quantity,
          price: item.price, unit: item.unit || 'шт',
        })),
        totalPrice: group.total,
        deliveryMarker: deliveryMarker,
        agentRef: profile?.agentRef || localStorage.getItem('marketkg_ref') || null,
      });
      supplierChatId = result?.supplierChatId || null;
    } catch (e) {
      console.error('Order save error:', e);
      // Диагностический режим: показываем код+сообщение чтобы понять причину на iOS,
      // где консоль недоступна без подключения к Mac. После починки — заменить
      // обратно на дружелюбный текст.
      const detail = e?.code ? `${e.code}: ${e.message || ''}` : (e?.message || String(e));
      toast.error((lang === 'kg' ? 'Заказ сакталган жок: ' : 'Ошибка заказа: ') + detail, { duration: 10000 });
      setSubmitting(prev => ({ ...prev, [group.supplierId]: false }));
      return;
    }

    const receipt = {
      orderNumber,
      date: new Date(),
      buyer: { name: form.name, shopName: form.shopName, phone: form.phone, address: form.address, comment: form.comment },
      suppliers: [{
        name: group.supplierName,
        items: group.items.map(item => ({
          name: item.name, quantity: item.quantity, price: item.price,
          unit: item.unit || 'шт', total: item.price * item.quantity,
        })),
        subtotal: group.total,
      }],
      subtotal: group.total, discount: 0, discountAmount: 0,
      total: group.total, promoCode: null, deliveryMarker,
    };

    // Telegram уведомление + Google Sheets
    sendTelegramNotification('new_order', {
      orderNumber,
      supplierName: group.supplierName,
      supplierId: group.supplierId,
      supplierChatId,
      shopName: form.shopName,
      buyerName: form.name,
      buyerPhone: form.phone,
      address: form.address,
      agentRef: profile?.agentRef || localStorage.getItem('marketkg_ref') || null,
      city: profile?.city || '',
      buyerEmail: user?.email || '',
      items: group.items,
      total: group.total,
      totalPrice: group.total,
    }).catch(() => {});

    group.items.forEach(item => removeItem(item.id));
    setOrderReceipt(receipt);
    setSentSuppliers(prev => [...prev, group.supplierName]);
    setSubmitting(prev => ({ ...prev, [group.supplierId]: false }));
    toast.success(`Заявка для "${group.supplierName}" отправлена!`);
  };

  // Отправить всем поставщикам сразу
  const handleSubmitAll = async () => {
    // Синхронный лок против двойного клика. setSubmitting state обновляется асинхронно,
    // поэтому два быстрых нажатия раньше создавали ДУБЛИКАТЫ заказов с одним orderNumber.
    if (submitLockRef.current) return;
    if (!validateOrder()) return;
    submitLockRef.current = true;
    setSubmitting({ all: true });

    try {
    // Сохраняем данные в профиль если не заполнены
    if (user && updateProfile) {
      const updates = {};
      if (form.shopName && !profile?.shopName) updates.shopName = form.shopName;
      if (form.address && !profile?.address) updates.address = form.address;
      if (form.phone && !profile?.phone) updates.phone = form.phone;
      if (form.name && !profile?.name) updates.name = form.name;
      if (Object.keys(updates).length > 0) {
        updateProfile(updates);
      }
    }

    // Сохраняем данные для чека перед очисткой
    const receipt = {
      orderNumber: 'MKG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
      date: new Date(),
      buyer: { name: form.name, shopName: form.shopName, phone: form.phone, address: form.address, comment: form.comment },
      suppliers: supplierGroups.map(g => ({
        name: g.supplierName,
        items: g.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          unit: item.unit || 'шт',
          total: item.price * item.quantity,
        })),
        subtotal: g.total,
      })),
      subtotal: totalPrice,
      discount: 0,
      discountAmount: 0,
      total: totalPrice,
      promoCode: null,
      deliveryMarker: deliveryMarker,
    };

    // (Сохранение данных клиента в профиль уже сделано выше — только если поля пустые.
    // Здесь больше не перезаписываем — иначе клиент, изменивший профиль вручную, потерял бы правки.)

    // Сохраняем каждый заказ в Firebase (по поставщикам). Трекаем что прошло, что упало —
    // иначе при частичном сбое клиент жмёт повторно и получает дубли.
    const agentRef = profile?.agentRef || localStorage.getItem('marketkg_ref') || null;

    const supplierChatIds = {};
    let buyerChatId = null;
    const succeeded = [];
    const failed = [];
    let lastError = null;
    for (const group of supplierGroups) {
      try {
        const result = await createOrder({
          orderNumber: receipt.orderNumber,
          buyerId: user?.uid || null,
          buyerName: form.name,
          buyerPhone: form.phone,
          shopName: form.shopName,
          address: form.address,
          comment: form.comment,
          supplierId: group.supplierId,
          supplierName: group.supplierName,
          items: group.items.map(item => ({
            id: item.id, name: item.name, quantity: item.quantity,
            price: item.price, unit: item.unit || 'шт',
          })),
          totalPrice: group.total,
          deliveryMarker: deliveryMarker,
          agentRef,
        });
        if (result?.supplierChatId) supplierChatIds[group.supplierId] = result.supplierChatId;
        if (result?.buyerChatId && !buyerChatId) buyerChatId = result.buyerChatId;
        succeeded.push(group);
      } catch (e) {
        console.error('Order save error:', e);
        lastError = e;
        failed.push(group);
      }
    }

    // Всё упало — ничего не трогаем, корзина остаётся.
    // Диагностический режим: показываем код+сообщение из последней ошибки.
    if (succeeded.length === 0) {
      const detail = lastError?.code
        ? `${lastError.code}: ${lastError.message || ''}`
        : (lastError?.message || 'unknown');
      toast.error((lang === 'kg' ? 'Заказдар сакталган жок: ' : 'Заказы не сохранились: ') + detail, { duration: 10000 });
      setSubmitting({});
      return;
    }

    // Уведомления только по успешным
    for (const group of succeeded) {
      sendTelegramNotification('new_order', {
        orderNumber: receipt.orderNumber,
        supplierName: group.supplierName,
        supplierId: group.supplierId,
        supplierChatId: supplierChatIds[group.supplierId] || null,
        // buyerChatId — если покупатель подключил свой Telegram в профиле,
        // ему придёт подтверждение приёма заказа и потом уведомления о статусе.
        buyerChatId: buyerChatId,
        shopName: form.shopName,
        buyerName: form.name,
        buyerPhone: form.phone,
        address: form.address,
        agentName: agentRef || 'Прямой клиент',
        agentRef: agentRef,
        items: group.items,
        total: group.total,
        totalPrice: group.total,
      }).catch(() => {});
    }

    // Удаляем из корзины только товары успешных заказов — не все сразу
    const succeededSupplierIds = new Set(succeeded.map(g => g.supplierId));
    const soldItems = items.filter(i => succeededSupplierIds.has(i.supplierId));
    soldItems.forEach(item => removeItem(item.id));
    saveOrderToHistory(soldItems);

    if (failed.length > 0) {
      // Часть упала — показываем конкретику, клиент видит что осталось в корзине
      const failedNames = failed.map(g => g.supplierName).join(', ');
      toast.error(lang === 'kg'
        ? `${succeeded.length} жиберилди, ${failed.length} жиберилген жок: ${failedNames}. Кайра аракет кылыңыз.`
        : `Отправлено ${succeeded.length}, не удалось ${failed.length}: ${failedNames}. Попробуйте ещё раз.`);
      setSubmitting({});
      return;
    }

    // Все успешно — показываем чек
    const successReceipt = {
      ...receipt,
      suppliers: succeeded.map(g => ({
        name: g.supplierName,
        items: g.items.map(item => ({
          name: item.name, quantity: item.quantity, price: item.price,
          unit: item.unit || 'шт', total: item.price * item.quantity,
        })),
        subtotal: g.total,
      })),
    };
    setOrderReceipt(successReceipt);
    setSentSuppliers(succeeded.map(g => g.supplierName));
    setSubmitting({});
    toast.success(`${lang === 'kg' ? 'Заявкалар жиберилди' : 'Заявки отправлены'}: ${succeeded.length}`);
    } finally {
      // Снимаем лок и индикатор отправки даже если что-то упало —
      // иначе клиент окажется заблокирован навсегда без возможности повторить.
      submitLockRef.current = false;
      setSubmitting(prev => ({ ...prev, all: false }));
    }
  };

  // Экран чека после отправки
  if (sentSuppliers.length > 0 && items.length === 0 && orderReceipt) {
    const r = orderReceipt;
    const dateStr = r.date.toLocaleDateString('ru-RU');
    const timeStr = r.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="text-center mb-6" data-print="hide">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={28} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{t('orderSent')}</h2>
          <p className="text-gray-500 text-sm">
            {lang === 'kg'
              ? `${r.suppliers.length} жеткирүүчүгө ${r.suppliers.length} заявка жөнөтүлдү`
              : `Отправлено ${r.suppliers.length} заявки ${r.suppliers.length} поставщикам`}
          </p>
        </div>

        {/* ОТДЕЛЬНЫЙ ЧЕК ДЛЯ КАЖДОГО ПОСТАВЩИКА */}
        <div className="space-y-6" id="order-receipts">
          {r.suppliers.map((supplier, si) => {
            const orderNum = `${r.orderNumber}-${si + 1}`;
            return (
              <div key={si} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Шапка заявки */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-3 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-200 text-xs">{lang === 'kg' ? 'Заявка' : 'Заявка'} {si + 1} {lang === 'kg' ? 'ичинен' : 'из'} {r.suppliers.length}</p>
                      <h3 className="font-bold text-lg">{supplier.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs font-bold">{orderNum}</p>
                      <p className="text-primary-200 text-xs">{dateStr} {timeStr}</p>
                    </div>
                  </div>
                </div>

                {/* Покупатель */}
                <div className="px-5 py-3 border-b border-dashed border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {r.buyer.shopName && (
                      <div>
                        <span className="text-gray-400 text-xs">{lang === 'kg' ? 'Дүкөн' : 'Магазин'}</span>
                        <p className="font-semibold text-gray-800">{r.buyer.shopName}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-400 text-xs">{t('receipt_buyer')}</span>
                      <p className="font-medium text-gray-800">{r.buyer.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">{t('receipt_phone')}</span>
                      <p className="font-medium text-gray-800">{r.buyer.phone}</p>
                    </div>
                    {r.buyer.address && (
                      <div className="col-span-2">
                        <span className="text-gray-400 text-xs">{t('receipt_address')}</span>
                        <p className="font-medium text-gray-800">{r.buyer.address}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Товары */}
                <div className="px-5">
                  {supplier.items.map((item, ii) => (
                    <div key={ii} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm">
                      <span className="text-gray-800 flex-1">{item.name}</span>
                      <span className="text-gray-400 text-xs mx-3 whitespace-nowrap">
                        {item.quantity} {item.unit} × {item.price.toLocaleString('ru-RU')}
                      </span>
                      <span className="font-semibold text-gray-800 whitespace-nowrap">
                        {item.total.toLocaleString('ru-RU')} сом
                      </span>
                    </div>
                  ))}
                </div>

                {/* Итого по поставщику */}
                <div className="px-5 py-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-800">{t('receipt_total')}</span>
                  <span className="text-xl font-bold text-primary-600">{supplier.subtotal.toLocaleString('ru-RU')} сом</span>
                </div>

                {/* Комментарий если есть */}
                {r.buyer.comment && (
                  <div className="px-5 py-2 bg-yellow-50 border-t border-yellow-100 text-sm text-yellow-800">
                    💬 {r.buyer.comment}
                  </div>
                )}

                {/* Напоминание поставщику */}
                <div className="px-5 py-2 bg-blue-50 border-t border-blue-100 text-xs text-blue-700">
                  📞 {lang === 'kg'
                    ? 'Жеткирүүчүгө: Жеткирүүдөн мурун заказды телефон аркылуу ырастаңыз'
                    : 'Поставщику: Перед доставкой обязательно подтвердите заказ по телефону'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Общий итог */}
        {r.suppliers.length > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-5 mt-6" data-print="hide">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">{lang === 'kg' ? 'Бардык заявкалар боюнча жалпы:' : 'Общий итог по всем заявкам:'}</span>
              <span className="text-xl font-bold text-primary-600">{r.total.toLocaleString('ru-RU')} сом</span>
            </div>
            {r.promoCode && (
              <div className="flex justify-between text-sm mt-2 text-green-600">
                <span>{lang === 'kg' ? 'Промокод' : 'Промокод'} {r.promoCode} (-{r.discount}%)</span>
                <span>-{r.discountAmount.toLocaleString('ru-RU')} сом</span>
              </div>
            )}
          </div>
        )}

        {/* Карта доставки */}
        {r.deliveryMarker && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="px-5 py-3 border-b border-gray-100">
              <h4 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" />
                {t('map_point')}
              </h4>
            </div>
            <div className="h-[250px]">
              <DeliveryMap marker={r.deliveryMarker} onLocationSelect={() => {}} />
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6" data-print="hide">
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium text-sm"
          >
            🖨️ {t('print_receipt')}
          </button>
          <Link
            href="/catalog"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors font-medium text-sm"
          >
            {t('backToCatalog')}
          </Link>
        </div>
      </div>
    );
  }

  // Если отправили но нет чека (старый формат)
  if (sentSuppliers.length > 0 && items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Send size={36} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">{t('orderSent')}</h2>
        <p className="text-gray-500 mb-4">{t('orderSentDesc')}</p>
        <div className="bg-gray-50 rounded-xl p-4 mb-8 inline-block">
          {sentSuppliers.map((name, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1">
              <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
              {name}
            </div>
          ))}
        </div>
        <br />
        <Link href="/catalog" className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
          {t('backToCatalog')}
        </Link>
      </div>
    );
  }

  // Пустая корзина
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">{t('cartEmpty')}</h2>
        <p className="text-gray-400 mb-6">{t('cartEmptyDesc')}</p>
        <Link href="/catalog" className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium">
          {t('goToCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        {t('cart')} <span className="text-gray-400 font-normal text-lg">({totalItems} {t('items')})</span>
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {t('orders_split_desc')}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Левая часть — товары по поставщикам */}
        <div className="lg:col-span-2 space-y-6">
          {supplierGroups.map(group => (
            <div key={group.supplierId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Заголовок поставщика */}
              <div className={`px-5 py-3 flex items-center justify-between border-b ${group.minOrder > 0 && group.total < group.minOrder ? 'bg-red-50' : 'bg-gray-50'}`}>
                <button onClick={() => setExpandedSupplier(expandedSupplier === group.supplierId ? null : group.supplierId)} className="text-left hover:opacity-80">
                  <h3 className="font-bold text-gray-800">{group.supplierName}</h3>
                  <p className="text-xs text-gray-400">{group.items.length} {lang === 'kg' ? 'товар' : 'товаров'} {expandedSupplier !== group.supplierId ? (lang === 'kg' ? '• Дагы кошуу ▼' : '• Добавить ещё ▼') : '▲'}</p>
                </button>
                <span className="font-bold text-primary-600">
                  {group.total.toLocaleString('ru-RU')} {t('som')}
                </span>
              </div>
              {/* Ближайшая дата доставки */}
              {(() => {
                const city = profile?.city || form.city || '';
                const hasSchedule = group.deliverySchedule && Object.keys(group.deliverySchedule).length > 0;
                if (!hasSchedule) return null;
                if (!city) {
                  return (
                    <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-sm">
                      <span>📍</span>
                      <span className="text-amber-800">
                        {lang === 'kg' ? 'Жеткирүү күнүн көрүү үчүн шаарды көрсөтүңүз' : 'Укажите город, чтобы увидеть дату доставки'}
                      </span>
                    </div>
                  );
                }
                const nextDate = getNextDeliveryDate(group.deliverySchedule, city);
                if (!nextDate) {
                  return (
                    <div className="px-5 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-sm">
                      <span>⚠️</span>
                      <span className="text-amber-800">
                        {lang === 'kg'
                          ? `Бул жеткирүүчү ${city} шаарына жеткирбейт — биз менен байланышыңыз`
                          : `Этот поставщик не доставляет в ${city} — свяжитесь с нами`}
                      </span>
                    </div>
                  );
                }
                return (
                  <div className="px-5 py-2 bg-green-50 border-b border-green-100 flex items-center gap-2 text-sm">
                    <span className="text-green-700">🚚</span>
                    <span className="text-green-800">
                      {lang === 'kg' ? 'Жакынкы жеткирүү:' : 'Ближайшая доставка:'}
                      <span className="font-semibold ml-1">{formatDeliveryDate(nextDate, lang)}</span>
                    </span>
                  </div>
                );
              })()}

              {/* Предупреждение о минимальном заказе */}
              {group.minOrder > 0 && group.total < group.minOrder && (
                <div className="px-5 py-2.5 bg-red-50 border-b border-red-100">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ {lang === 'kg'
                      ? `Мин. заказ: ${group.minOrder.toLocaleString('ru-RU')} сом. Дагы ${(group.minOrder - group.total).toLocaleString('ru-RU')} сом кошуңуз`
                      : `Мин. заказ: ${group.minOrder.toLocaleString('ru-RU')} сом. Добавьте ещё на ${(group.minOrder - group.total).toLocaleString('ru-RU')} сом`}
                  </p>
                  <div className="mt-1.5 w-full bg-red-200 rounded-full h-1.5">
                    <div className="bg-red-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, (group.total / group.minOrder) * 100)}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-red-400">
                      {Math.round((group.total / group.minOrder) * 100)}% {lang === 'kg' ? 'толтурулду' : 'набрано'}
                    </p>
                    <button onClick={() => setExpandedSupplier(expandedSupplier === group.supplierId ? null : group.supplierId)}
                      className="px-3 py-1.5 bg-white text-red-600 border border-red-300 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm">
                      {expandedSupplier === group.supplierId
                        ? (lang === 'kg' ? 'Жабуу' : 'Свернуть')
                        : (lang === 'kg'
                          ? `Дагы ${(group.minOrder - group.total).toLocaleString('ru-RU')} сом кошуу`
                          : `Добавить ещё на ${(group.minOrder - group.total).toLocaleString('ru-RU')} сом`)}
                    </button>
                  </div>
                </div>
              )}

              {/* Ассортимент поставщика для дозаказа */}
              {expandedSupplier === group.supplierId && (() => {
                const allSupplierProducts = DEMO_PRODUCTS.filter(p => p.supplierId === group.supplierId);
                const cartIds = group.items.map(i => i.id);
                return (
                  <div className="border-b bg-blue-50 px-4 py-3">
                    <div className="flex items-center justify-between mb-2 sticky top-0 bg-blue-50 py-1 z-10">
                      <h4 className="text-sm font-bold text-blue-800">
                        {group.supplierName} — {lang === 'kg' ? 'ассортимент' : 'ассортимент'} ({allSupplierProducts.length})
                      </h4>
                      <button onClick={() => setExpandedSupplier(null)} className="text-xs text-blue-500 font-medium">
                        {lang === 'kg' ? 'Жабуу' : 'Свернуть'} ✕
                      </button>
                    </div>
                    {group.minOrder > 0 && group.total < group.minOrder && (
                      <div className="text-xs text-blue-600 font-medium mb-2">
                        {lang === 'kg' ? 'Дагы керек:' : 'Ещё нужно:'} {Math.max(0, group.minOrder - group.total).toLocaleString('ru-RU')} сом
                      </div>
                    )}
                    <div className="space-y-1.5">
                      {allSupplierProducts.map(p => {
                        const inCart = items.find(i => i.id === p.id);
                        const alreadyAdded = cartIds.includes(p.id);
                        return (
                          <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg ${alreadyAdded ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg">📦</div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-800 truncate">{p.name}</div>
                              <div className="text-xs text-green-600 font-bold">{p.price} сом {p.unit && `/ ${p.unit}`}</div>
                            </div>
                            {inCart ? (
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => { if (inCart.quantity <= 1) removeItem(p.id); else updateQuantity(p.id, inCart.quantity - 1); }}
                                  className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-600"><Minus size={12} /></button>
                                <span className="w-6 text-center text-xs font-bold">{inCart.quantity}</span>
                                <button onClick={() => addItem(p, 1)}
                                  className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-gray-600"><Plus size={12} /></button>
                                <button onClick={() => removeItem(p.id)}
                                  className="w-7 h-7 rounded bg-red-50 flex items-center justify-center text-red-400 hover:text-red-600 ml-1"><Trash2 size={12} /></button>
                              </div>
                            ) : (
                              <button onClick={() => { addItem(p, 1); toast.success(`${p.name} — добавлено!`); }}
                                className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium shrink-0"><Plus size={12} /></button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Товары (скрываем когда ассортимент открыт — они уже видны там) */}
              {expandedSupplier !== group.supplierId && <div className="divide-y">
                {group.items.map(item => (
                  <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                    {/* Фото */}
                    <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                      )}
                    </div>

                    {/* Название + цена */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                      <p className="text-primary-600 font-semibold text-sm">
                        {Number(item.price).toLocaleString('ru-RU')} {t('som')}
                        {item.unit && <span className="text-gray-400 font-normal"> / {item.unit}</span>}
                      </p>
                    </div>

                    {/* +/- */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600">
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center font-semibold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-gray-600">
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Сумма строки */}
                    <div className="w-20 text-right font-bold text-sm flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString('ru-RU')}
                    </div>

                    {/* Удалить */}
                    <button onClick={() => { if (confirm(lang === 'kg' ? 'Товарды себеттен алып салабызбы?' : 'Удалить товар из корзины?')) removeItem(item.id); }} className="text-gray-300 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>}

              {/* Кнопки для этого поставщика */}
              <div className="px-5 py-3 bg-gray-50 border-t space-y-2">
                <div className="flex gap-2">
                  {group.minOrder > 0 && group.total < group.minOrder ? (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm font-semibold cursor-not-allowed">
                      {lang === 'kg'
                        ? `Дагы ${(group.minOrder - group.total).toLocaleString('ru-RU')} сом кошуңуз`
                        : `Добавьте ещё на ${(group.minOrder - group.total).toLocaleString('ru-RU')} сом`}
                    </div>
                  ) : (
                  <button
                    onClick={() => handleSubmitToSupplier(group)}
                    disabled={submitting[group.supplierId]}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    <Send size={14} />
                    {submitting[group.supplierId] ? t('sending') : `${t('submitOrder')}`}
                  </button>
                  )}
                  <button
                    onClick={() => handleWhatsApp(group)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-semibold"
                  >
                    <MessageCircle size={14} /> WA
                  </button>
                </div>
                <button
                  onClick={() => { group.items.forEach(item => removeItem(item.id)); toast.success(lang === 'kg' ? 'Поставщик алынып салынды' : 'Поставщик удалён из корзины'); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-medium"
                >
                  <Trash2 size={14} />
                  {lang === 'kg' ? 'Себеттен алуу' : 'Убрать из корзины'}
                </button>
              </div>
            </div>
          ))}

          {/* С этим покупают — умные рекомендации */}
          {(() => {
            // Предзаполняем демо-данные при первом запуске
            if (typeof window !== 'undefined') seedDemoHistory();

            const cartIds = items.map(i => i.id);

            // Сначала пробуем умные рекомендации из истории заказов
            let suggestionList = getSmartRecommendations(cartIds, DEMO_PRODUCTS, 4);

            // Если умных рекомендаций мало — добавляем из статических связей
            if (suggestionList.length < 2) {
              const staticSuggestions = new Map();
              cartIds.forEach(id => {
                const related = BOUGHT_TOGETHER[id] || [];
                related.forEach(relId => {
                  if (!cartIds.includes(relId) && !staticSuggestions.has(relId) && !suggestionList.find(s => s.id === relId)) {
                    const product = DEMO_PRODUCTS.find(p => p.id === relId);
                    if (product) staticSuggestions.set(relId, product);
                  }
                });
              });
              suggestionList = [...suggestionList, ...Array.from(staticSuggestions.values())].slice(0, 4);
            }

            if (suggestionList.length === 0) return null;

            return (
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500" />
                  {lang === 'kg' ? 'Муну менен алышат' : 'С этим покупают'}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {lang === 'kg' ? 'Башка кардарлардын заказдарына негизделген' : 'На основе заказов других клиентов'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestionList.map(product => (
                    <div key={product.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.supplierName}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-primary-600">{product.price} сом</span>
                          {product.pairCount && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                              {product.pairCount}x {lang === 'kg' ? 'бирге' : 'вместе'}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          addItem(product, 1);
                          toast.success(`${product.name} — ${t('added_to_cart')}!`);
                        }}
                        className="w-9 h-9 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors flex-shrink-0"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Очистить */}
          <button onClick={clearCart}
            className="text-sm text-red-400 hover:text-red-600 transition-colors">
            {t('clearCart')}
          </button>
        </div>

        {/* Правая часть — форма + итого */}
        <div className="space-y-4">
          {/* Общий итог */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <div className="space-y-2 mb-3">
              {supplierGroups.map(g => (
                <div key={g.supplierId} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{g.supplierName}</span>
                  <span className="font-medium whitespace-nowrap">{g.total.toLocaleString('ru-RU')} {t('som')}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-lg font-semibold">{t('total')}:</span>
              <span className="text-2xl font-bold text-primary-600">
                {totalPrice.toLocaleString('ru-RU')} {t('som')}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {supplierGroups.length} поставщик(ов) — {totalItems} {t('items')}
            </p>
          </div>

          {/* Форма */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h2 className="font-bold text-lg mb-4">{t('orderForm')}</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{lang === 'kg' ? 'Дүкөн аты' : 'Название магазина'} <span className="text-red-500">*</span></label>
                <input type="text" value={form.shopName || ''} onChange={e => setForm({...form, shopName: e.target.value})}
                  placeholder={lang === 'kg' ? 'Мисалы: Мини-маркет Ай' : 'Например: Мини-маркет Солнышко'}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('yourName')} <span className="text-red-500">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder={lang === 'kg' ? 'Атыңыз' : 'Иван Петров'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} <span className="text-red-500">*</span></label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                  placeholder="+996 555 123 456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryAddress')} <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                    placeholder="Бишкек, ул. Манаса 40"
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchAddressOnMap())}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                  <button
                    type="button"
                    onClick={searchAddressOnMap}
                    disabled={searchingAddress || !form.address.trim()}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 shrink-0"
                  >
                    <MapPin size={14} />
                    {searchingAddress ? '...' : t('map_find')}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">{t('map_hint')}</p>
              </div>
              {/* Карта доставки */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1" />
                  {t('map_point')}
                </label>
                <div className="h-[250px] md:h-[300px] rounded-xl overflow-hidden border border-gray-200">
                  <DeliveryMap onLocationSelect={handleMapClick} marker={deliveryMarker} />
                </div>
                {deliveryMarker && (
                  <p className="text-xs text-gray-400 mt-1">
                    Координаты: {deliveryMarker[0].toFixed(4)}°, {deliveryMarker[1].toFixed(4)}°
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('comment')}</label>
                <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}
                  placeholder="Доставка с 9:00 до 18:00..." rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            {/* Отправить всем */}
            <div className="mt-5 space-y-3">
              {hasMinOrderIssue && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-sm text-red-700 font-medium">
                    ❌ {lang === 'kg'
                      ? 'Бардык жеткирүүчүлөрдүн мин. заказ суммасына жетиңиз'
                      : 'Наберите минимальную сумму заказа у всех поставщиков'}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {supplierGroups.filter(g => g.minOrder > 0 && g.total < g.minOrder).map(g => (
                      <li key={g.supplierId} className="text-xs text-red-600">
                        • {g.supplierName}: {lang === 'kg' ? 'дагы' : 'ещё'} {(g.minOrder - g.total).toLocaleString('ru-RU')} сом
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <button
                onClick={handleSubmitAll}
                disabled={submitting.all || hasMinOrderIssue}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 ${
                  hasMinOrderIssue ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <Send size={18} />
                {submitting.all ? t('sending') : `${lang === 'kg' ? 'Баарына жөнөтүү' : 'Отправить всем'} (${supplierGroups.length})`}
              </button>

              {/* Предупреждение */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  ⚠️ {lang === 'kg'
                    ? 'Маанилүү: Жеткирүүчү заказды жеткирүүдөн мурун телефон аркылуу ырастайт. Жалган заявкалар үчүн аккаунт бөгөттөлүшү мүмкүн.'
                    : 'Важно: Поставщик обязательно подтвердит заказ по телефону перед доставкой. За фейковые заявки аккаунт может быть заблокирован.'}
                </p>
              </div>

              <p className="text-xs text-gray-400 text-center">
                {lang === 'kg'
                  ? 'Заявка жөнөтүү менен сиз платформанын колдонуу шарттарын кабыл аласыз'
                  : 'Отправляя заявку, вы принимаете условия использования платформы'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
