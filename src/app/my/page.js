'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { RefreshCw, Star, ShoppingCart, Clock, TrendingUp, Plus, Check, Package } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Демо: частые товары клиента (на реальном проекте — из истории заказов)
const frequentProducts = [
  { id: 'p10', name: 'Молоко 3.2% 1л', price: 68, unit: 'шт', supplierId: 'sup3', supplierName: 'Бишкек Сүт', frequency: 12, lastOrder: '2026-03-30', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop' },
  { id: 'p6', name: 'Максым 1л', price: 75, unit: 'шт', supplierId: 'sup2', supplierName: 'Шоро', frequency: 10, lastOrder: '2026-03-29', imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop' },
  { id: 'p1', name: 'Мука пшеничная в/с 2кг', price: 95, unit: 'шт', supplierId: 'sup1', supplierName: 'Алтын Дан', frequency: 8, lastOrder: '2026-03-28', imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop' },
  { id: 'p11', name: 'Сметана 20% 400г', price: 110, unit: 'шт', supplierId: 'sup3', supplierName: 'Бишкек Сүт', frequency: 8, lastOrder: '2026-03-30', imageUrl: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop' },
  { id: 'p2', name: 'Рис узгенский 1кг', price: 180, unit: 'шт', supplierId: 'sup1', supplierName: 'Алтын Дан', frequency: 6, lastOrder: '2026-03-27', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop' },
  { id: 'p7', name: 'Чалап 1л', price: 70, unit: 'шт', supplierId: 'sup2', supplierName: 'Шоро', frequency: 6, lastOrder: '2026-03-29', imageUrl: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&h=400&fit=crop' },
];

// Демо: последние заказы
const recentOrders = [
  {
    id: 'ord-1',
    date: '2026-03-30',
    supplier: 'Бишкек Сүт',
    items: [
      { name: 'Молоко 3.2% 1л', quantity: 20, price: 68 },
      { name: 'Сметана 20% 400г', quantity: 10, price: 110 },
      { name: 'Айран 0.5л', quantity: 15, price: 55 },
    ],
    total: 3285,
  },
  {
    id: 'ord-2',
    date: '2026-03-29',
    supplier: 'Шоро',
    items: [
      { name: 'Максым 1л', quantity: 24, price: 75 },
      { name: 'Чалап 1л', quantity: 12, price: 70 },
    ],
    total: 2640,
  },
  {
    id: 'ord-3',
    date: '2026-03-28',
    supplier: 'Алтын Дан',
    items: [
      { name: 'Мука пшеничная в/с 2кг', quantity: 10, price: 95 },
      { name: 'Рис узгенский 1кг', quantity: 15, price: 180 },
      { name: 'Сахар 1кг', quantity: 20, price: 75 },
    ],
    total: 5150,
  },
];

export default function MyPage() {
  const { items, addItem } = useCart();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [addedIds, setAddedIds] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null); // id заказа который редактируем
  const [editQuantities, setEditQuantities] = useState({}); // { 'ord-1-0': 20, 'ord-1-1': 10 }

  const isInCart = (productId) => items.some(i => i.id === productId);

  const handleAddFrequent = (product) => {
    addItem(product, 1);
    setAddedIds(prev => [...prev, product.id]);
    toast.success(`${product.name} — ${isRu ? 'добавлено' : 'кошулду'}!`);
    setTimeout(() => setAddedIds(prev => prev.filter(id => id !== product.id)), 1500);
  };

  const handleRepeatOrder = (order) => {
    order.items.forEach(item => {
      const product = frequentProducts.find(p => p.name === item.name);
      if (product) {
        addItem(product, item.quantity);
      } else {
        addItem({
          id: `repeat-${item.name}`,
          name: item.name,
          price: item.price,
          unit: 'шт',
          supplierId: 'unknown',
          supplierName: order.supplier,
        }, item.quantity);
      }
    });
    toast.success(
      isRu
        ? `Заказ от ${order.supplier} добавлен в корзину!`
        : `${order.supplier} буйрутмасы себетке кошулду!`
    );
  };

  const handleRepeatAll = () => {
    frequentProducts.forEach(p => addItem(p, 1));
    toast.success(isRu ? 'Все частые товары добавлены в корзину!' : 'Бардык тез-тез алынган товарлар себетке кошулду!');
  };

  const daysAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24));
    if (diff === 0) return isRu ? 'сегодня' : 'бүгүн';
    if (diff === 1) return isRu ? 'вчера' : 'кечээ';
    return isRu ? `${diff} дн. назад` : `${diff} күн мурун`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        {isRu ? 'Мой кабинет' : 'Менин кабинетим'}
      </h1>
      <p className="text-gray-500 text-sm mb-8">
        {isRu ? 'Ваши частые товары и быстрый повтор заказов' : 'Тез-тез алынган товарлар жана тез кайталоо'}
      </p>

      {/* ===== ЧАСТЫЕ ТОВАРЫ ===== */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-lg font-bold">{isRu ? 'Ваши частые товары' : 'Тез-тез алынган товарлар'}</h2>
          </div>
          <button
            onClick={handleRepeatAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
          >
            <ShoppingCart size={14} />
            {isRu ? 'Добавить все' : 'Баарын кошуу'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {frequentProducts.map(product => {
            const inCart = isInCart(product.id);
            const justAdded = addedIds.includes(product.id);

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
                {/* Фото */}
                <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                  )}
                </div>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 text-sm truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400">{product.supplierName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-primary-600 text-sm">{product.price} сом</span>
                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                      <TrendingUp size={10} /> {product.frequency}x
                    </span>
                  </div>
                </div>

                {/* Кнопка */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleAddFrequent(product); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    justAdded
                      ? 'bg-green-500 text-white scale-110'
                      : inCart
                        ? 'bg-green-100 text-green-600'
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                  }`}
                >
                  {justAdded ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ПОВТОРИТЬ ЗАКАЗ ===== */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={20} className="text-gray-600" />
          <h2 className="text-lg font-bold">{isRu ? 'Повторить заказ' : 'Буйрутманы кайталоо'}</h2>
        </div>

        <div className="space-y-4">
          {recentOrders.map(order => {
            const isEditing = editingOrder === order.id;

            const getQty = (i) => {
              const key = `${order.id}-${i}`;
              return editQuantities[key] !== undefined ? editQuantities[key] : order.items[i].quantity;
            };

            const setQty = (i, val) => {
              const key = `${order.id}-${i}`;
              setEditQuantities(prev => ({ ...prev, [key]: Math.max(0, val) }));
            };

            const editedTotal = order.items.reduce((sum, item, i) => sum + item.price * getQty(i), 0);

            const handleConfirmRepeat = () => {
              order.items.forEach((item, i) => {
                const qty = getQty(i);
                if (qty > 0) {
                  const product = frequentProducts.find(p => p.name === item.name);
                  if (product) {
                    addItem(product, qty);
                  } else {
                    addItem({
                      id: `repeat-${item.name}-${Date.now()}`,
                      name: item.name,
                      price: item.price,
                      unit: 'шт',
                      supplierId: 'unknown',
                      supplierName: order.supplier,
                    }, qty);
                  }
                }
              });
              toast.success(isRu ? `Заказ добавлен в корзину!` : `Буйрутма себетке кошулду!`);
              setEditingOrder(null);
            };

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">{order.supplier}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {daysAgo(order.date)} · {order.items.length} {isRu ? 'товаров' : 'товар'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing && (
                      <>
                        <button
                          onClick={() => {
                            setEditingOrder(order.id);
                            const initial = {};
                            order.items.forEach((item, i) => { initial[`${order.id}-${i}`] = item.quantity; });
                            setEditQuantities(prev => ({ ...prev, ...initial }));
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          ✏️ {isRu ? 'Изменить' : 'Өзгөртүү'}
                        </button>
                        <button
                          onClick={() => handleRepeatOrder(order)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                        >
                          <RefreshCw size={14} />
                          {isRu ? 'Повторить' : 'Кайталоо'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Товары */}
                <div className="border-t bg-gray-50 px-4 py-2">
                  {order.items.map((item, i) => {
                    const qty = getQty(i);
                    return (
                      <div key={i} className={`flex items-center justify-between py-2 text-sm ${qty === 0 ? 'opacity-40' : ''}`}>
                        <span className="text-gray-600 flex-1">{item.name}</span>

                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setQty(i, qty - 1)}
                              className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 text-gray-600 text-xs font-bold"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              value={qty}
                              onChange={(e) => setQty(i, parseInt(e.target.value) || 0)}
                              className="w-14 text-center py-1 border border-gray-200 rounded-md text-sm font-bold"
                              min="0"
                            />
                            <button
                              onClick={() => setQty(i, qty + 1)}
                              className="w-7 h-7 rounded-md bg-white border border-gray-200 flex items-center justify-center hover:bg-green-50 text-gray-600 text-xs font-bold"
                            >
                              +
                            </button>
                            <span className="text-xs text-gray-400 w-20 text-right">
                              {qty > 0 ? `${(item.price * qty).toLocaleString('ru-RU')} сом` : '—'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            {item.quantity} × {item.price} = <span className="font-medium text-gray-700">{(item.quantity * item.price).toLocaleString('ru-RU')}</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Итого и кнопка при редактировании */}
                {isEditing && (
                  <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
                    <div>
                      <span className="text-sm text-gray-500">{isRu ? 'Итого:' : 'Жалпы:'} </span>
                      <span className="font-bold text-primary-600">{editedTotal.toLocaleString('ru-RU')} сом</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingOrder(null)}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                      >
                        {isRu ? 'Отмена' : 'Жокко чыгаруу'}
                      </button>
                      <button
                        onClick={handleConfirmRepeat}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
                      >
                        <ShoppingCart size={14} />
                        {isRu ? 'В корзину' : 'Себетке'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Ссылки */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/orders" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
          <Package size={24} className="mx-auto mb-2 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">{isRu ? 'История заказов' : 'Буйрутма тарыхы'}</span>
        </Link>
        <Link href="/catalog" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
          <ShoppingCart size={24} className="mx-auto mb-2 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">{isRu ? 'Каталог' : 'Каталог'}</span>
        </Link>
        <Link href="/referral" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
          <Package size={24} className="mx-auto mb-2 text-green-500" />
          <span className="text-sm font-medium text-gray-700">{isRu ? 'Пригласить поставщика' : 'Жеткирүүчү чакыруу'}</span>
        </Link>
        <Link href="/notifications" className="bg-white rounded-xl p-4 shadow-sm text-center hover:shadow-md transition-shadow">
          <Clock size={24} className="mx-auto mb-2 text-green-600" />
          <span className="text-sm font-medium text-gray-700">{isRu ? 'Уведомления' : 'Билдирүүлөр'}</span>
        </Link>
      </div>
    </div>
  );
}
