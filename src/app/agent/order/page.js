'use client';
import { useState, useMemo } from 'react';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import RoleGuard from '@/components/RoleGuard';
import { DEMO_PRODUCTS, DEMO_SUPPLIERS } from '@/lib/demoData';
import { createOrder } from '@/lib/firestore';
import { sendTelegramNotification } from '@/lib/telegram';
import { ArrowLeft, Search, Plus, Minus, Trash2, Send, Store, ChevronDown, ChevronUp, ShoppingCart, Calculator, Package, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const CATEGORY_NAMES = {
  grocery: { ru: 'Бакалея', kg: 'Бакалея' },
  drinks: { ru: 'Напитки', kg: 'Суусундуктар' },
  dairy: { ru: 'Молочные', kg: 'Сүт азыктары' },
  confectionery: { ru: 'Кондитерка', kg: 'Кондитердик' },
  meat: { ru: 'Мясо', kg: 'Эт' },
  fruits: { ru: 'Фрукты/Овощи', kg: 'Жемиш/Жашылча' },
  frozen: { ru: 'Заморозка', kg: 'Тоңдурулган' },
  snacks: { ru: 'Снеки', kg: 'Снектер' },
};

const demoShops = [
  { id: 'sh1', name: 'Мини-маркет "Береке"', address: 'ул. Манаса, 40' },
  { id: 'sh2', name: 'Магазин "Достук"', address: 'ул. Токтогула, 120' },
  { id: 'sh3', name: 'Супермаркет "Народный"', address: 'пр. Чуй, 150' },
  { id: 'sh4', name: 'Кафе "Жаштык"', address: 'ул. Ахунбаева, 93' },
  { id: 'sh5', name: 'Мини-маркет "Айжан"', address: 'ул. Киевская, 77' },
];

export default function AgentOrderPage() {
  return <RoleGuard roles={['agent', 'admin']}><AgentOrderContent /></RoleGuard>;
}

function AgentOrderContent() {
  const { lang } = useLang();
  const { user, profile } = useAuth();
  const isRu = lang === 'ru';
  const [submitting, setSubmitting] = useState(false);

  const [selectedShop, setSelectedShop] = useState(null);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedSupplier, setExpandedSupplier] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [sent, setSent] = useState(false);
  const [fullViewSupplier, setFullViewSupplier] = useState(null);
  const [showNewShop, setShowNewShop] = useState(false);
  const [newShopName, setNewShopName] = useState('');
  const [newShopAddress, setNewShopAddress] = useState('');
  const [newShopPhone, setNewShopPhone] = useState('');
  const [newShopLat, setNewShopLat] = useState(null);
  const [newShopLng, setNewShopLng] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [customShops, setCustomShops] = useState([]);

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

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  // Группировка корзины по поставщикам
  const cartBySupplier = useMemo(() => {
    const groups = {};
    cart.forEach(item => {
      if (!groups[item.supplierId]) {
        const sup = DEMO_SUPPLIERS.find(s => s.id === item.supplierId);
        groups[item.supplierId] = { supplier: sup, items: [], total: 0 };
      }
      groups[item.supplierId].items.push(item);
      groups[item.supplierId].total += item.price * item.quantity;
    });
    return Object.values(groups);
  }, [cart]);

  // Фильтрация товаров поставщика
  const getSupplierProducts = (supplierId) => {
    return DEMO_PRODUCTS
      .filter(p => p.supplierId === supplierId)
      .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  };

  // Категории поставщика
  const getSupplierCategories = (supplierId) => {
    const cats = new Set(DEMO_PRODUCTS.filter(p => p.supplierId === supplierId).map(p => p.category));
    return [...cats];
  };

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error(isRu ? 'Добавьте товары' : 'Товар кошуңуз'); return; }
    // Проверка минимального заказа по каждому поставщику
    const belowMin = cartBySupplier.filter(g => g.supplier.minOrder && g.total < g.supplier.minOrder);
    if (belowMin.length > 0) {
      belowMin.forEach(g => {
        toast.error(isRu
          ? `${g.supplier.name}: мин. заказ ${g.supplier.minOrder.toLocaleString('ru-RU')} сом (сейчас ${g.total.toLocaleString('ru-RU')} сом)`
          : `${g.supplier.name}: мин. заказ ${g.supplier.minOrder.toLocaleString('ru-RU')} сом (азыр ${g.total.toLocaleString('ru-RU')} сом)`
        );
      });
      return;
    }

    setSubmitting(true);
    try {
      // Создаём отдельный заказ для каждого поставщика
      for (const group of cartBySupplier) {
        const orderData = {
          supplierId: group.supplier.id,
          supplierName: group.supplier.name,
          shopName: selectedShop.name,
          shopAddress: selectedShop.address,
          shopPhone: selectedShop.phone || '',
          agentId: user?.uid || 'demo',
          agentName: profile?.name || user?.email || 'Агент',
          buyerEmail: user?.email || '',
          items: group.items.map(i => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            unit: i.unit || 'шт',
          })),
          totalItems: group.items.reduce((s, i) => s + i.quantity, 0),
          totalPrice: group.total,
        };

        await createOrder(orderData);

        // Отправка уведомления в Telegram
        await sendTelegramNotification('new_order', {
          supplierName: group.supplier.name,
          supplierTelegram: group.supplier.telegram,
          shopName: selectedShop.name,
          agentName: orderData.agentName,
          items: group.items,
          total: group.total,
        });
      }

      setSent(true);
      toast.success(isRu ? 'Заказы отправлены поставщикам!' : 'Заказдар жеткирүүчүлөргө жөнөтүлдү!');
    } catch (err) {
      console.error('Order error:', err);
      toast.error(isRu ? 'Ошибка отправки заказа' : 'Заказ жөнөтүү катасы');
    }
    setSubmitting(false);
  };

  // Экран успеха
  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send size={28} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{isRu ? 'Заказы отправлены!' : 'Заказдар жөнөтүлдү!'}</h2>
          <p className="text-gray-500">{selectedShop?.name}</p>
        </div>

        {/* Разбивка по поставщикам */}
        <div className="space-y-4 mb-8">
          {cartBySupplier.map(group => (
            <div key={group.supplier.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  {group.supplier.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{group.supplier.name}</div>
                  <div className="text-xs text-gray-400">{group.items.length} {isRu ? 'товаров' : 'товар'}</div>
                </div>
                <div className="ml-auto text-green-600 font-bold">{group.total.toLocaleString('ru-RU')} сом</div>
              </div>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="font-medium">{(item.price * item.quantity).toLocaleString('ru-RU')} сом</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 rounded-xl p-4 mb-6 text-center">
          <div className="text-sm text-green-700">{isRu ? 'Итого' : 'Жалпы'}</div>
          <div className="text-2xl font-bold text-green-800">{totalPrice.toLocaleString('ru-RU')} сом</div>
          <div className="text-xs text-green-600">{totalItems} {isRu ? 'товаров' : 'товар'} • {cartBySupplier.length} {isRu ? 'поставщик(ов)' : 'жеткирүүчү'}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setSent(false); setCart([]); setSelectedShop(null); setExpandedSupplier(null); }}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
            {isRu ? 'Новый заказ' : 'Жаңы заказ'}
          </button>
          <Link href="/agent/dashboard" className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-center">
            {isRu ? 'В кабинет' : 'Кабинетке'}
          </Link>
        </div>
      </div>
    );
  }

  const allShops = [...demoShops, ...customShops];

  const handleAddShop = () => {
    if (!newShopName.trim()) { toast.error(isRu ? 'Введите название магазина' : 'Дүкөндүн атын жазыңыз'); return; }
    if (!newShopPhone.trim()) { toast.error(isRu ? 'Введите номер телефона' : 'Телефон номерин жазыңыз'); return; }
    if (!newShopAddress.trim()) { toast.error(isRu ? 'Введите адрес магазина' : 'Дүкөндүн дарегин жазыңыз'); return; }
    const shop = {
      id: 'custom-' + Date.now(),
      name: newShopName.trim(),
      address: newShopAddress.trim(),
      phone: newShopPhone.trim(),
      lat: newShopLat,
      lng: newShopLng,
    };
    setCustomShops(prev => [...prev, shop]);
    setSelectedShop(shop);
    setNewShopName('');
    setNewShopAddress('');
    setNewShopPhone('');
    setNewShopLat(null);
    setNewShopLng(null);
    setShowNewShop(false);
    toast.success(isRu ? 'Магазин добавлен!' : 'Дүкөн кошулду!');
  };

  const handleFindByAddress = async () => {
    if (!newShopAddress.trim()) { toast.error(isRu ? 'Сначала введите адрес' : 'Адегенде даректи жазыңыз'); return; }
    setGeoLoading(true);
    try {
      const query = `${newShopAddress}, Кыргызстан`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data.length > 0) {
        setNewShopLat(parseFloat(data[0].lat));
        setNewShopLng(parseFloat(data[0].lon));
        toast.success(isRu ? 'Адрес найден на карте!' : 'Дарек картадан табылды!');
      } else {
        toast.error(isRu ? 'Адрес не найден. Попробуйте уточнить или используйте GPS.' : 'Дарек табылган жок. Тактаңыз же GPS колдонуңуз.');
      }
    } catch {
      toast.error(isRu ? 'Ошибка поиска адреса' : 'Дарек издөө катасы');
    }
    setGeoLoading(false);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) { toast.error(isRu ? 'Геолокация не поддерживается' : 'Геолокация колдоого алынбайт'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewShopLat(pos.coords.latitude);
        setNewShopLng(pos.coords.longitude);
        setGeoLoading(false);
        toast.success(isRu ? 'Местоположение определено!' : 'Жайгашкан жери аныкталды!');
      },
      () => {
        setGeoLoading(false);
        toast.error(isRu ? 'Не удалось определить местоположение' : 'Жайгашкан жерди аныктоо мүмкүн болгон жок');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Шаг 1: Выбор магазина
  if (!selectedShop) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/agent/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
          <ArrowLeft size={18} /> {isRu ? 'Кабинет агента' : 'Агент кабинети'}
        </Link>
        <h1 className="text-2xl font-bold mb-2">{isRu ? 'Создать заказ' : 'Заказ түзүү'}</h1>
        <p className="text-sm text-gray-500 mb-4">{isRu ? 'Выберите магазин или добавьте новый:' : 'Дүкөн тандаңыз же жаңысын кошуңуз:'}</p>

        {/* Кнопка добавить магазин */}
        {!showNewShop ? (
          <button onClick={() => setShowNewShop(true)}
            className="w-full flex items-center justify-center gap-2 p-4 mb-4 bg-green-50 border-2 border-dashed border-green-300 rounded-xl text-green-700 font-medium hover:bg-green-100 transition-colors">
            <Plus size={20} /> {isRu ? 'Добавить новый магазин' : 'Жаңы дүкөн кошуу'}
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-green-200">
            <h3 className="font-bold text-gray-800 mb-3">{isRu ? 'Новый магазин' : 'Жаңы дүкөн'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{isRu ? 'Название магазина' : 'Дүкөндүн аты'} <span className="text-red-500">*</span></label>
                <input type="text" value={newShopName} onChange={e => setNewShopName(e.target.value)}
                  placeholder={isRu ? 'Например: Мини-маркет "Береке"' : 'Мисалы: Мини-маркет "Береке"'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{isRu ? 'Телефон' : 'Телефон'} <span className="text-red-500">*</span></label>
                <input type="tel" value={newShopPhone} onChange={e => setNewShopPhone(e.target.value)}
                  placeholder="+996 555 123 456"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{isRu ? 'Адрес' : 'Дареги'} <span className="text-red-500">*</span></label>
                <input type="text" value={newShopAddress} onChange={e => setNewShopAddress(e.target.value)}
                  placeholder={isRu ? 'ул. Манаса, 40' : 'Манас көч., 40'}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{isRu ? 'Местоположение на карте' : 'Картадагы жайгашуу'}</label>
                <div className="flex gap-2">
                  <button onClick={handleFindByAddress} disabled={geoLoading || !newShopAddress.trim()} type="button"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50">
                    <Search size={14} />
                    {isRu ? 'Найти по адресу' : 'Дарек боюнча табуу'}
                  </button>
                  <button onClick={handleGeolocation} disabled={geoLoading} type="button"
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-xs font-medium hover:bg-gray-100 transition-colors disabled:opacity-50">
                    <MapPin size={14} />
                    {isRu ? 'GPS' : 'GPS'}
                  </button>
                </div>
                {geoLoading && (
                  <p className="text-xs text-blue-500 mt-1 text-center">{isRu ? 'Поиск...' : 'Издөө...'}</p>
                )}
                {newShopLat && (
                  <div className="mt-2">
                    <div className="rounded-xl overflow-hidden border border-gray-200" style={{height: '150px'}}>
                      <iframe
                        width="100%" height="150" frameBorder="0" style={{border:0}}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${newShopLng-0.005},${newShopLat-0.003},${newShopLng+0.005},${newShopLat+0.003}&layer=mapnik&marker=${newShopLat},${newShopLng}`}
                      />
                    </div>
                    <p className="text-xs text-green-600 mt-1 text-center">{isRu ? 'Местоположение определено' : 'Жайгашуу аныкталды'}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddShop}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors text-sm">
                  {isRu ? 'Добавить и выбрать' : 'Кошуу жана тандоо'}
                </button>
                <button onClick={() => { setShowNewShop(false); setNewShopName(''); setNewShopAddress(''); setNewShopPhone(''); setNewShopLat(null); setNewShopLng(null); }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm">
                  {isRu ? 'Отмена' : 'Жокко чыгаруу'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Список магазинов */}
        <div className="space-y-2">
          {allShops.map(shop => (
            <button key={shop.id} onClick={() => setSelectedShop(shop)}
              className="w-full flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Store size={20} className="text-slate-600" />
              </div>
              <div>
                <div className="font-medium text-gray-800">{shop.name}</div>
                <div className="text-xs text-gray-400">{shop.address}{shop.phone ? ` • ${shop.phone}` : ''}</div>
              </div>
              {shop.id.startsWith('custom-') && (
                <span className="ml-auto px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{isRu ? 'Новый' : 'Жаңы'}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Шаг 2: Поставщики с товарами
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
      <Link href="/agent/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Кабинет агента' : 'Агент кабинети'}
      </Link>

      {/* Шапка с магазином */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{isRu ? 'Создать заказ' : 'Заказ түзүү'}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Store size={14} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">{selectedShop.name}</span>
            <button onClick={() => { setSelectedShop(null); setExpandedSupplier(null); setSelectedCategory('all'); }}
              className="text-xs text-gray-400 hover:text-gray-600 underline">{isRu ? 'Изменить' : 'Өзгөртүү'}</button>
          </div>
        </div>
        {cart.length > 0 && (
          <button onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600">
            <ShoppingCart size={16} />
            <span>{totalItems}</span>
            <span className="hidden sm:inline">• {totalPrice.toLocaleString('ru-RU')} сом</span>
          </button>
        )}
      </div>

      {/* Поиск */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isRu ? 'Поиск товара по всем поставщикам...' : 'Бардык жеткирүүчүлөрдөн товар издөө...'}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      {/* Глобальный фильтр по категориям */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === 'all' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
          {isRu ? 'Все категории' : 'Баары'}
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, val]) => (
          <button key={key} onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCategory === key ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            {isRu ? val.ru : val.kg}
          </button>
        ))}
      </div>

      {/* Корзина (раскрывающаяся) */}
      {showCart && cart.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calculator size={16} /> {isRu ? 'Корзина' : 'Себет'}
          </h3>
          {cartBySupplier.map(group => (
            <div key={group.supplier.id} className="mb-3 last:mb-0">
              <div className="text-xs font-bold text-slate-600 mb-1 uppercase">{group.supplier.name}</div>
              {group.items.map(item => (
                <div key={item.id} className="flex items-center gap-2 py-1.5 border-b border-gray-50 last:border-0">
                  <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-red-50 text-gray-500">
                      <Minus size={10} />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center hover:bg-green-50 text-gray-500">
                      <Plus size={10} />
                    </button>
                  </div>
                  <span className="text-sm font-medium text-gray-800 w-20 text-right">{(item.price * item.quantity).toLocaleString('ru-RU')} с</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="text-right text-sm font-bold text-green-600 mt-1">{group.total.toLocaleString('ru-RU')} сом</div>
            </div>
          ))}
        </div>
      )}

      {/* Список поставщиков */}
      <div className="space-y-3">
        {DEMO_SUPPLIERS.map(supplier => {
          const isFiltering = search.length > 0 || selectedCategory !== 'all';
          const showFullView = fullViewSupplier === supplier.id;
          const filteredProducts = getSupplierProducts(supplier.id);
          const allProducts = DEMO_PRODUCTS.filter(p => p.supplierId === supplier.id);
          const products = showFullView ? allProducts : filteredProducts;
          const categories = getSupplierCategories(supplier.id);
          const supplierCartItems = cart.filter(i => i.supplierId === supplier.id);
          const supplierTotal = supplierCartItems.reduce((s, i) => s + i.price * i.quantity, 0);
          const isExpanded = showFullView || (isFiltering ? filteredProducts.length > 0 : expandedSupplier === supplier.id);

          // Скрыть поставщика если при фильтрации у него нет подходящих товаров
          if (isFiltering && !showFullView && filteredProducts.length === 0 && supplierCartItems.length === 0) return null;

          return (
            <div key={supplier.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Заголовок поставщика */}
              <button onClick={() => {
                  if (isFiltering) {
                    // При поиске/фильтре: клик переключает полный вид ассортимента
                    setFullViewSupplier(showFullView ? null : supplier.id);
                  } else {
                    setExpandedSupplier(isExpanded ? null : supplier.id);
                    setFullViewSupplier(null);
                  }
                }}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {supplier.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800">{supplier.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
                    <span>{supplier.city}</span>
                    <span>•</span>
                    <span>{categories.map(c => CATEGORY_NAMES[c]?.[isRu ? 'ru' : 'kg'] || c).join(', ')}</span>
                    <span>•</span>
                    <span className="text-orange-500 font-medium">{isRu ? 'Мин.' : 'Мин.'} {supplier.minOrder?.toLocaleString('ru-RU')} сом</span>
                  </div>
                </div>
                {supplierCartItems.length > 0 && (
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold shrink-0 ${
                    supplier.minOrder && supplierTotal < supplier.minOrder
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {supplierCartItems.length} • {supplierTotal.toLocaleString('ru-RU')} с
                    {supplier.minOrder && supplierTotal < supplier.minOrder && (
                      <span className="block text-[10px]">{isRu ? 'мин.' : 'мин.'} {supplier.minOrder.toLocaleString('ru-RU')}</span>
                    )}
                  </div>
                )}
                {isExpanded ? <ChevronUp size={18} className="text-gray-400 shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
              </button>

              {/* Раскрытый список товаров */}
              {isExpanded && (
                <div className="border-t bg-gray-50 p-4">
                  {/* Кнопка показать весь ассортимент */}
                  {isFiltering && !showFullView && (
                    <button onClick={() => setFullViewSupplier(supplier.id)}
                      className="w-full mb-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                      {isRu ? `Показать весь ассортимент (${allProducts.length} товаров)` : `Бардык ассортиментти көрсөтүү (${allProducts.length} товар)`}
                    </button>
                  )}
                  {showFullView && isFiltering && (
                    <button onClick={() => setFullViewSupplier(null)}
                      className="w-full mb-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                      {isRu ? 'Вернуться к результатам поиска' : 'Издөө жыйынтыктарына кайтуу'}
                    </button>
                  )}

                  {/* Фильтр по категориям (только если глобальный не выбран) */}
                  {categories.length > 1 && selectedCategory === 'all' && !search && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-white text-gray-600 hover:bg-gray-100 transition-colors">
                          {CATEGORY_NAMES[cat]?.[isRu ? 'ru' : 'kg'] || cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Товары */}
                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                    {products.map(product => {
                      const inCart = cart.find(i => i.id === product.id);
                      return (
                        <div key={product.id} className="flex items-center gap-3 p-2.5 bg-white rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 text-sm truncate">{product.name}</div>
                            <div className="text-xs text-green-600 font-bold">{product.price} сом {product.unit && `/ ${product.unit}`}</div>
                          </div>
                          {inCart ? (
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => updateQty(product.id, inCart.quantity - 1)}
                                className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center hover:bg-red-50">
                                <Minus size={12} />
                              </button>
                              <span className="w-8 text-center font-bold text-sm">{inCart.quantity}</span>
                              <button onClick={() => updateQty(product.id, inCart.quantity + 1)}
                                className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center hover:bg-green-50">
                                <Plus size={12} />
                              </button>
                              <span className="text-xs font-bold text-gray-600 w-16 text-right">{(product.price * inCart.quantity).toLocaleString('ru-RU')} с</span>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(product)}
                              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 shrink-0">
                              <Plus size={14} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {products.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">{isRu ? 'Товары не найдены' : 'Товарлар табылган жок'}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Нижняя панель с итогом */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm text-gray-500">{totalItems} {isRu ? 'товаров' : 'товар'} • {cartBySupplier.length} {isRu ? 'поставщик(ов)' : 'жеткирүүчү'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calculator size={16} className="text-green-600" />
                <span className="text-xl font-bold text-green-600">{totalPrice.toLocaleString('ru-RU')} сом</span>
              </div>
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50">
              <Send size={18} /> {submitting ? (isRu ? 'Отправка...' : 'Жөнөтүлүүдө...') : (isRu ? `Оформить заказы (${cartBySupplier.length} поставщик.)` : `Заказдарды жөнөтүү (${cartBySupplier.length} жеткирүүчү)`)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
