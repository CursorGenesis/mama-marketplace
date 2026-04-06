'use client';
import { useState } from 'react';
import { Search, ShoppingCart, User, MapPin, ChevronRight, Star, Heart, Milk, Apple, Drumstick, ShoppingBasket, Candy, GlassWater, Snowflake, Cookie } from 'lucide-react';
import { DEMO_PRODUCTS, DEMO_SUPPLIERS } from '@/lib/demoData';

const OZON_BLUE = '#005BFF';

const categories = [
  { id: 'dairy', name: 'Молочные', icon: Milk },
  { id: 'drinks', name: 'Напитки', icon: GlassWater },
  { id: 'grocery', name: 'Бакалея', icon: ShoppingBasket },
  { id: 'meat', name: 'Мясо', icon: Drumstick },
  { id: 'fruits', name: 'Фрукты', icon: Apple },
  { id: 'confectionery', name: 'Сладости', icon: Candy },
  { id: 'frozen', name: 'Заморозка', icon: Snowflake },
  { id: 'snacks', name: 'Снеки', icon: Cookie },
];

export default function DemoOzonPage() {
  const [search, setSearch] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [selectedCat, setSelectedCat] = useState('');
  const [favorites, setFavorites] = useState([]);

  const filtered = DEMO_PRODUCTS
    .filter(p => !selectedCat || p.category === selectedCat)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 20);

  const toggleFav = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-[#f2f3f5]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* === ШАПКА OZON === */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: OZON_BLUE }}>
        {/* Верхняя полоска */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 gap-4">
            {/* Лого */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="font-black text-sm" style={{ color: OZON_BLUE }}>M</span>
              </div>
              <span className="text-white font-bold text-lg hidden sm:block">MarketKG</span>
            </div>

            {/* Поиск */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Искать на MarketKG"
                  className="w-full pl-4 pr-12 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button className="absolute right-1 top-1 bottom-1 px-3 rounded-md text-white flex items-center" style={{ backgroundColor: OZON_BLUE }}>
                  <Search size={18} />
                </button>
              </div>
            </div>

            {/* Правая часть */}
            <div className="flex items-center gap-4 text-white shrink-0">
              <button className="flex flex-col items-center gap-0.5 text-xs opacity-80 hover:opacity-100 hidden sm:flex">
                <MapPin size={20} />
                <span>Бишкек</span>
              </button>
              <button className="flex flex-col items-center gap-0.5 text-xs opacity-80 hover:opacity-100 hidden sm:flex">
                <User size={20} />
                <span>Войти</span>
              </button>
              <button className="relative flex flex-col items-center gap-0.5 text-xs opacity-80 hover:opacity-100">
                <ShoppingCart size={20} />
                <span className="hidden sm:block">Корзина</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Категории лента */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCat('')}
                className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  !selectedCat ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={!selectedCat ? { backgroundColor: OZON_BLUE } : {}}
              >
                Все
              </button>
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(selectedCat === cat.id ? '' : cat.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedCat === cat.id ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedCat === cat.id ? { backgroundColor: OZON_BLUE } : {}}
                  >
                    <Icon size={14} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* === БАННЕР === */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${OZON_BLUE}, #0041b8)` }}>
          <div className="px-8 py-8 text-white">
            <p className="text-sm opacity-70 mb-1">B2B маркетплейс Кыргызстана</p>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Бизнес без границ</h1>
            <p className="text-sm opacity-80 mb-4 max-w-md">Закупайте продукты у проверенных поставщиков по лучшим ценам. Доставка по всему Кыргызстану.</p>
            <button className="px-6 py-2.5 bg-white rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors" style={{ color: OZON_BLUE }}>
              Начать покупки
            </button>
          </div>
        </div>
      </div>

      {/* === ТОВАРЫ === */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCat ? categories.find(c => c.id === selectedCat)?.name : 'Все товары'}
            <span className="text-gray-400 font-normal text-sm ml-2">{filtered.length} товаров</span>
          </h2>
          <button className="text-sm font-medium flex items-center gap-1 hover:opacity-80" style={{ color: OZON_BLUE }}>
            Смотреть все <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(product => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow group relative">
              {/* Избранное */}
              <button
                onClick={() => toggleFav(product.id)}
                className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <Heart size={16} className={favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>

              {/* Бейдж */}
              {product.badge === 'top' && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-orange-500 text-white text-[10px] font-bold rounded">
                  ХИТ
                </div>
              )}
              {product.badge === 'new' && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 text-white text-[10px] font-bold rounded" style={{ backgroundColor: OZON_BLUE }}>
                  NEW
                </div>
              )}

              {/* Фото */}
              <div className="aspect-square bg-gray-50 p-4 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <span className="text-4xl text-gray-200">📦</span>
                )}
              </div>

              {/* Инфо */}
              <div className="p-3">
                {/* Цена */}
                <div className="mb-1">
                  <span className="text-lg font-bold text-gray-900">{product.price} ₿</span>
                  <span className="text-xs text-gray-400 ml-1">/ {product.unit || 'шт'}</span>
                </div>

                {/* Название */}
                <p className="text-xs text-gray-700 leading-snug line-clamp-2 mb-2 min-h-[32px]">{product.name}</p>

                {/* Поставщик */}
                <p className="text-[10px] text-gray-400 mb-2">{product.supplierName}</p>

                {/* Рейтинг */}
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-500">4.{Math.floor(Math.random() * 5 + 5)}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{Math.floor(Math.random() * 200 + 10)} отзывов</span>
                </div>

                {/* Кнопка */}
                <button
                  onClick={() => setCartCount(c => c + 1)}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: OZON_BLUE }}
                >
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === ПОСТАВЩИКИ === */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Поставщики</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {DEMO_SUPPLIERS.slice(0, 4).map(s => (
            <div key={s.id} className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: OZON_BLUE }}>
                  {s.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{s.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-500">{s.rating}</span>
                    <span className="text-xs text-gray-400">· {s.reviewCount} отзывов</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">{s.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={12} /> {s.city}</span>
                <button className="text-xs font-semibold px-3 py-1 rounded-lg hover:opacity-80 text-white" style={{ backgroundColor: OZON_BLUE }}>
                  Каталог
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Подвал */}
      <div className="bg-white border-t py-6 text-center text-sm text-gray-400">
        <p>Демо-страница в стиле Ozon · <a href="/" className="underline" style={{ color: OZON_BLUE }}>Вернуться на MarketKG</a></p>
      </div>
    </div>
  );
}
