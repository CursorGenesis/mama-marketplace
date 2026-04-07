'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import { DEMO_PRODUCTS, DEMO_SUPPLIERS } from '@/lib/demoData';
import { ArrowLeft, Search, Plus, Minus, Trash2, Send, Store, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const demoShops = [
  { id: 'sh1', name: 'Мини-маркет "Береке"', address: 'ул. Манаса, 40' },
  { id: 'sh2', name: 'Магазин "Достук"', address: 'ул. Токтогула, 120' },
  { id: 'sh3', name: 'Супермаркет "Народный"', address: 'пр. Чуй, 150' },
  { id: 'sh4', name: 'Кафе "Жаштык"', address: 'ул. Ахунбаева, 93' },
  { id: 'sh5', name: 'Мини-маркет "Айжан"', address: 'ул. Киевская, 77' },
];

// Частые товары магазина (имитация истории)
const frequentByShop = {
  sh1: ['p1', 'p4', 'p10'],
  sh2: ['p2', 'p6', 'p11'],
  sh3: ['p6', 'p7', 'p10', 'p12'],
  sh4: ['p6', 'p7', 'p9'],
  sh5: ['p10', 'p11', 'p13'],
};

export default function AgentOrderPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';

  const [step, setStep] = useState(1); // 1 = выбор магазина, 2 = выбор поставщика, 3 = товары
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [sent, setSent] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const supplierProducts = DEMO_PRODUCTS
    .filter(p => p.supplierId === selectedSupplier?.id)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const frequentIds = selectedShop ? (frequentByShop[selectedShop.id] || []) : [];
  const frequentProducts = frequentIds.map(id => DEMO_PRODUCTS.find(p => p.id === id)).filter(Boolean);

  const handleSubmit = () => {
    if (cart.length === 0) { toast.error(isRu ? 'Добавьте товары' : 'Товар кошуңуз'); return; }
    setSent(true);
    toast.success(isRu ? 'Заказ отправлен поставщику!' : 'Заказ жеткирүүчүгө жөнөтүлдү!');
  };

  // Экран успеха
  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={28} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{isRu ? 'Заказ отправлен!' : 'Заказ жөнөтүлдү!'}</h2>
        <p className="text-gray-500 mb-2">{selectedShop?.name} → {selectedSupplier?.name}</p>
        <p className="text-gray-500 mb-6">{totalItems} {isRu ? 'товаров' : 'товар'} • {totalPrice.toLocaleString('ru-RU')} сом</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => { setSent(false); setCart([]); setStep(1); setSelectedShop(null); setSelectedSupplier(null); }}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
            {isRu ? 'Новый заказ' : 'Жаңы заказ'}
          </button>
          <Link href="/agent/dashboard" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            {isRu ? 'В кабинет' : 'Кабинетке'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/agent/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Кабинет агента' : 'Агент кабинети'}
      </Link>

      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Создать заказ' : 'Заказ түзүү'}</h1>

      {/* Шаги */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { n: 1, label: isRu ? 'Магазин' : 'Дүкөн' },
          { n: 2, label: isRu ? 'Поставщик' : 'Жеткирүүчү' },
          { n: 3, label: isRu ? 'Товары' : 'Товарлар' },
        ].map(s => (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s.n ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s.n}</div>
            <span className={`text-sm font-medium ${step >= s.n ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</span>
            {s.n < 3 && <div className={`w-8 h-0.5 ${step > s.n ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {/* Шаг 1: Выбор магазина */}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-500 mb-3">{isRu ? 'Выберите магазин для заказа:' : 'Заказ үчүн дүкөн тандаңыз:'}</p>
          {demoShops.map(shop => (
            <button key={shop.id} onClick={() => { setSelectedShop(shop); setStep(2); }}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Store size={20} className="text-slate-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">{shop.name}</div>
                <div className="text-xs text-gray-400">{shop.address}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Шаг 2: Выбор поставщика */}
      {step === 2 && (
        <div className="space-y-2">
          <div className="bg-green-50 rounded-xl p-3 mb-3 flex items-center gap-2">
            <Store size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">{selectedShop?.name}</span>
            <button onClick={() => setStep(1)} className="ml-auto text-xs text-green-600 hover:underline">{isRu ? 'Изменить' : 'Өзгөртүү'}</button>
          </div>
          <p className="text-sm text-gray-500 mb-3">{isRu ? 'Выберите поставщика:' : 'Жеткирүүчү тандаңыз:'}</p>
          {DEMO_SUPPLIERS.map(sup => (
            <button key={sup.id} onClick={() => { setSelectedSupplier(sup); setStep(3); }}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {sup.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800">{sup.name}</div>
                <div className="text-xs text-gray-400">{sup.city}</div>
              </div>
              <div className="text-xs text-gray-400">{DEMO_PRODUCTS.filter(p => p.supplierId === sup.id).length} {isRu ? 'товаров' : 'товар'}</div>
            </button>
          ))}
        </div>
      )}

      {/* Шаг 3: Товары */}
      {step === 3 && (
        <>
          {/* Шапка */}
          <div className="bg-green-50 rounded-xl p-3 mb-4 flex items-center gap-2 flex-wrap">
            <Store size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-700">{selectedShop?.name}</span>
            <span className="text-green-400">→</span>
            <span className="text-sm font-medium text-green-700">{selectedSupplier?.name}</span>
            <button onClick={() => setStep(2)} className="ml-auto text-xs text-green-600 hover:underline">{isRu ? 'Изменить' : 'Өзгөртүү'}</button>
          </div>

          {/* Частые товары этого магазина */}
          {frequentProducts.length > 0 && frequentProducts.some(p => p.supplierId === selectedSupplier?.id) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-bold text-amber-800 mb-2 flex items-center gap-1">
                <RefreshCw size={14} /> {isRu ? 'Частые товары этого магазина' : 'Бул дүкөндүн тез-тез алган товарлары'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {frequentProducts.filter(p => p.supplierId === selectedSupplier?.id).map(p => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors border border-amber-200">
                    <Plus size={12} /> {p.name} — {p.price} сом
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Поиск */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isRu ? 'Поиск товара...' : 'Товар издөө...'}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          {/* Список товаров */}
          <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
            {supplierProducts.map(product => {
              const inCart = cart.find(i => i.id === product.id);
              return (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 text-sm truncate">{product.name}</div>
                    <div className="text-xs text-green-600 font-bold">{product.price} сом {product.unit && `/ ${product.unit}`}</div>
                  </div>
                  {inCart ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(product.id, inCart.quantity - 1)}
                        className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center hover:bg-red-50">
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{inCart.quantity}</span>
                      <button onClick={() => updateQty(product.id, inCart.quantity + 1)}
                        className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center hover:bg-green-50">
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(product)}
                      className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            {supplierProducts.length === 0 && (
              <div className="text-center py-8 text-gray-400">{isRu ? 'Товары не найдены' : 'Товарлар табылган жок'}</div>
            )}
          </div>

          {/* Корзина и отправка */}
          {cart.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-5 sticky bottom-16 md:bottom-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800">{totalItems} {isRu ? 'товаров' : 'товар'}</span>
                <span className="text-xl font-bold text-green-600">{totalPrice.toLocaleString('ru-RU')} сом</span>
              </div>
              <button onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors">
                <Send size={18} /> {isRu ? 'Отправить заказ' : 'Заказды жөнөтүү'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
