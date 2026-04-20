'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getSuppliers, getPromotions, CATEGORIES, CITIES, SUBCATEGORIES } from '@/lib/firestore';
import { useLang } from '@/context/LangContext';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import SupplierCard from '@/components/SupplierCard';
import SkeletonCard from '@/components/SkeletonCard';
import { Search, SlidersHorizontal, X, ChevronRight, Megaphone, ShoppingCart, Plus, Minus, ArrowLeft, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const CATEGORY_COLORS = {
  bakery: { bg: 'from-yellow-100 to-yellow-200', text: 'text-yellow-800' },
  dairy: { bg: 'from-sky-100 to-sky-200', text: 'text-sky-800' },
  meat: { bg: 'from-red-100 to-red-200', text: 'text-red-800' },
  fish: { bg: 'from-cyan-100 to-cyan-300', text: 'text-cyan-800' },
  fruits: { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-800' },
  grocery: { bg: 'from-amber-100 to-amber-200', text: 'text-amber-800' },
  oils: { bg: 'from-lime-100 to-lime-200', text: 'text-lime-800' },
  confectionery: { bg: 'from-pink-100 to-pink-200', text: 'text-pink-800' },
  gum: { bg: 'from-sky-50 to-sky-200', text: 'text-sky-700' },
  drinks: { bg: 'from-blue-100 to-blue-300', text: 'text-blue-800' },
  alcohol: { bg: 'from-purple-100 to-purple-200', text: 'text-purple-800' },
  tea_coffee: { bg: 'from-teal-100 to-teal-200', text: 'text-teal-800' },
  canned: { bg: 'from-slate-100 to-slate-200', text: 'text-slate-700' },
  spices: { bg: 'from-rose-100 to-rose-200', text: 'text-rose-800' },
  snacks: { bg: 'from-orange-100 to-orange-200', text: 'text-orange-800' },
  frozen: { bg: 'from-violet-100 to-violet-300', text: 'text-violet-800' },
  eggs: { bg: 'from-amber-50 to-amber-200', text: 'text-amber-700' },
  ice_cream: { bg: 'from-fuchsia-100 to-fuchsia-200', text: 'text-fuchsia-800' },
  honey: { bg: 'from-yellow-100 to-yellow-300', text: 'text-yellow-800' },
  dried_fruits: { bg: 'from-orange-100 to-orange-300', text: 'text-orange-800' },
  baby: { bg: 'from-cyan-50 to-cyan-200', text: 'text-cyan-800' },
  tobacco: { bg: 'from-stone-100 to-stone-200', text: 'text-stone-700' },
  household: { bg: 'from-blue-100 to-blue-200', text: 'text-blue-700' },
  hygiene: { bg: 'from-teal-50 to-teal-200', text: 'text-teal-700' },
  cosmetics: { bg: 'from-pink-100 to-pink-300', text: 'text-pink-700' },
  disposable: { bg: 'from-indigo-100 to-indigo-200', text: 'text-indigo-800' },
  hardware: { bg: 'from-zinc-100 to-zinc-200', text: 'text-zinc-700' },
  kitchen: { bg: 'from-warm-100 to-gray-200', text: 'text-gray-700' },
  electric: { bg: 'from-yellow-50 to-yellow-200', text: 'text-yellow-700' },
  stationery: { bg: 'from-fuchsia-50 to-fuchsia-200', text: 'text-fuchsia-800' },
  textile: { bg: 'from-rose-50 to-rose-200', text: 'text-rose-700' },
  pet_food: { bg: 'from-green-100 to-green-200', text: 'text-green-800' },
  toys: { bg: 'from-red-50 to-red-200', text: 'text-red-700' },
  packaging: { bg: 'from-amber-50 to-amber-200', text: 'text-amber-700' },
  catering: { bg: 'from-emerald-50 to-emerald-200', text: 'text-emerald-700' },
  other: { bg: 'from-gray-100 to-gray-200', text: 'text-gray-700' },
};

// Демо-акции поставщиков
const DEMO_PROMOS = [
  { id: 1, supplier: 'Бишкек Сүт', text: 'Скидка 15% на молочную продукцию', textKg: 'Сүт азыктарына 15% арзандатуу', until: '20 апреля', color: 'from-blue-500 to-cyan-500' },
  { id: 2, supplier: 'Sweet House KG', text: 'Купи 3 — получи 4-й в подарок!', textKg: '3 алсаңыз — 4-үнчүсү белек!', until: '15 апреля', color: 'from-pink-500 to-rose-500' },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const { t, lang } = useLang();
  const isRu = lang === 'ru';
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const [tab, setTab] = useState(searchParams.get('tab') || 'products');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [onlyKG, setOnlyKG] = useState(false);

  useEffect(() => { loadData(); }, [category, city]);

  const loadData = async () => {
    setLoading(true);
    const filters = {};
    if (city) filters.city = city;
    const [prods, sups, promosData] = await Promise.all([
      getProducts(category ? { category, ...filters } : filters),
      getSuppliers(filters),
      getPromotions(),
    ]);
    setProducts(prods);
    setSuppliers(sups);
    setPromos(promosData);
    setLoading(false);
  };

  const filteredProducts = products
    .filter(p => {
      if (search) {
        const lower = search.toLowerCase();
        const text = `${p.name || ''} ${p.description || ''} ${p.supplierName || ''}`.toLowerCase();
        if (!text.includes(lower)) return false;
      }
      if (selectedSubs.length > 0) {
        const text = `${p.name || ''} ${p.description || ''}`.toLowerCase();
        if (!selectedSubs.some(sub => text.includes(sub.toLowerCase()))) return false;
      }
      if (onlyKG && !p.madeInKG) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'popular') {
        const aRec = a.badge === 'recommended' ? 1 : 0;
        const bRec = b.badge === 'recommended' ? 1 : 0;
        if (bRec !== aRec) return bRec - aRec;
        return (b.orderCount || 0) - (a.orderCount || 0);
      }
      if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  const filteredSuppliers = suppliers.filter(s => {
    if (search && !s.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const catName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    if (cat) return isRu ? cat.name : (cat.nameKg || cat.name);
    return id;
  };
  const visibleCategories = showAllCategories ? CATEGORIES : CATEGORIES.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Поиск + Фильтры */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRu ? 'Товар или поставщик...' : 'Товар же жеткирүүчү...'}
            className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
          {/* Подсказки поставщиков */}
          {search.length >= 2 && !selectedSupplier && (() => {
            const matchedSuppliers = suppliers.filter(s =>
              s.name?.toLowerCase().includes(search.toLowerCase())
            );
            if (matchedSuppliers.length === 0) return null;
            return (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 z-40 overflow-hidden">
                <div className="px-3 py-1.5 text-xs text-gray-400 border-b border-gray-100">{isRu ? 'Поставщики' : 'Жеткирүүчүлөр'}</div>
                {matchedSuppliers.slice(0, 5).map(s => {
                  const supplierProducts = products.filter(p => p.supplierId === s.id);
                  return (
                    <button key={s.id} onClick={() => { setSelectedSupplier(s); setSearch(''); setCategory(''); setSelectedSubs([]); }}
                      className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {s.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-gray-800 truncate">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.city} {s.rating ? `• ⭐${s.rating}` : ''} • {supplierProducts.length} {isRu ? 'товаров' : 'товар'}</div>
                      </div>
                      <span className="text-xs text-green-600 font-medium">{isRu ? 'Весь ассортимент →' : 'Бардык ассортимент →'}</span>
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>
        <div className="relative shrink-0">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 h-full ${showFilters ? 'bg-slate-800 text-white' : 'bg-gray-50 border-2 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
            <SlidersHorizontal size={16} /> {isRu ? 'Фильтры' : 'Чыпкалар'}
          </button>
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl p-4 shadow-lg border border-gray-200 z-30">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{isRu ? 'Город' : 'Шаар'}</label>
                  <select value={city} onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                    <option value="">{isRu ? 'Все города' : 'Бардык шаарлар'}</option>
                    {CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{isRu ? 'Сортировка' : 'Иреттөө'}</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
                    <option value="popular">{isRu ? 'Рекомендуем' : 'Сунуштайбыз'}</option>
                    <option value="price_asc">{isRu ? 'Сначала дешевле' : 'Арзандан'}</option>
                    <option value="rating">{isRu ? 'По рейтингу' : 'Рейтинг боюнча'}</option>
                  </select>
                </div>
                <button onClick={() => { setCity(''); setSortBy('popular'); setShowFilters(false); }}
                  className="w-full py-2 text-xs text-red-500 hover:text-red-600 font-medium">
                  {isRu ? 'Сбросить фильтры' : 'Чыпкаларды тазалоо'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Категории — сетка */}
      {!category && (
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-800 mb-3">{isRu ? 'Категории' : 'Категориялар'}</h2>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
            {visibleCategories.map(cat => {
              const colors = CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.other;
              return (
                <button key={cat.id} onClick={() => { setCategory(cat.id); setSearch(''); setSelectedSubs([]); setSelectedSupplier(null); setVisibleCount(20); }}
                  className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-2 text-center hover:shadow-md transition-all hover:scale-105 active:scale-95 flex flex-col items-center justify-center aspect-square`}>
                  <div className="text-2xl md:text-3xl mb-1">{cat.icon}</div>
                  <div className={`text-[9px] md:text-xs font-bold leading-snug break-words w-full px-0.5 ${colors.text}`}>{catName(cat.id)}</div>
                </button>
              );
            })}
          </div>
          {CATEGORIES.length > 8 && (
            <button onClick={() => setShowAllCategories(!showAllCategories)}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center justify-center gap-1">
              {showAllCategories
                ? (isRu ? 'Свернуть' : 'Жыйуу')
                : (isRu ? `Все категории (${CATEGORIES.length})` : `Бардык категориялар (${CATEGORIES.length})`)}
              <ChevronRight size={14} className={`transition-transform ${showAllCategories ? 'rotate-90' : ''}`} />
            </button>
          )}
        </div>
      )}

      {/* Выбранная категория + подкатегории */}
      {category && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => { setCategory(''); setSearch(''); setSelectedSubs([]); setSelectedSupplier(null); setVisibleCount(20); }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200">
              ← {isRu ? 'Все категории' : 'Бардык категориялар'}
            </button>
            <span className="text-base font-bold text-gray-800">{CATEGORIES.find(c => c.id === category)?.icon} {catName(category)}</span>
          </div>
          {(() => {
            const subs = SUBCATEGORIES[category]?.[lang] || SUBCATEGORIES[category]?.ru || [];
            if (subs.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-1.5 mb-4">
                <button onClick={() => { setSelectedSubs([]); setSearch(''); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedSubs.length === 0 && !search ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {isRu ? 'Все' : 'Баары'}
                </button>
                {subs.map((sub, i) => (
                  <button key={i} onClick={() => { setSelectedSubs(selectedSubs[0] === sub ? [] : [sub]); setSearch(''); }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${selectedSubs.includes(sub) ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {sub}
                  </button>
                ))}
              </div>
            );
          })()}
        </>
      )}

      {/* Баннеры акций поставщиков */}
      {(() => {
        const bannerColors = ['from-blue-500 to-cyan-500', 'from-pink-500 to-rose-500', 'from-violet-500 to-purple-500', 'from-emerald-500 to-teal-500', 'from-orange-500 to-amber-500'];
        const catalogPromos = promos.filter(p => p.bannerType === 'catalog' || p.bannerType === 'main');
        const displayPromos = catalogPromos.length > 0 ? catalogPromos : DEMO_PROMOS;
        return displayPromos.length > 0 && (
          <div className="space-y-2 mb-5">
            {displayPromos.map((promo, i) => (
              <div key={promo.id} className={`bg-gradient-to-r ${promo.color || bannerColors[i % bannerColors.length]} rounded-xl p-3.5 text-white flex items-center gap-3`}>
                <Megaphone size={20} className="shrink-0 opacity-80" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold opacity-80">{promo.supplierName || promo.supplier}</div>
                  <div className="text-sm font-bold">{promo.title || (isRu ? promo.text : promo.textKg)}</div>
                  {promo.discount && <div className="text-xs opacity-80">-{promo.discount}%</div>}
                </div>
                <div className="text-xs opacity-70 shrink-0">{isRu ? 'до' : 'чейин'} {promo.endDate || promo.until}</div>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Табы и сортировка */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-hide">
        <button onClick={() => setTab('suppliers')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${tab === 'suppliers' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {isRu ? 'Поставщики' : 'Жеткирүүчүлөр'}
        </button>
        <button onClick={() => { setTab('products'); setSortBy('popular'); }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${tab === 'products' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          {isRu ? 'Рекомендуем' : 'Сунуштайбыз'}
        </button>
        <button onClick={() => setOnlyKG(!onlyKG)}
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${onlyKG ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <img src="https://flagcdn.com/w20/kg.png" alt="KG" style={{width: 16, height: 12, display: 'inline'}} /> {isRu ? 'Сделано в КГ' : 'КР өндүрүмү'}
        </button>
      </div>


      {/* Выбранный поставщик — весь ассортимент */}
      {selectedSupplier && (() => {
        const supplierProducts = products.filter(p => p.supplierId === selectedSupplier.id);
        return (
          <div className="mb-6">
            {/* Карточка поставщика */}
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {selectedSupplier.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selectedSupplier.name}</h2>
                    <div className="text-sm text-gray-500">
                      {selectedSupplier.city} {selectedSupplier.rating ? `• ⭐${selectedSupplier.rating}` : ''} • {supplierProducts.length} {isRu ? 'товаров' : 'товар'}
                      {selectedSupplier.minOrder ? ` • ${isRu ? 'Мин.' : 'Мин.'} ${selectedSupplier.minOrder?.toLocaleString('ru-RU')} сом` : ''}
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedSupplier(null)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">
                  ✕ {isRu ? 'Закрыть' : 'Жабуу'}
                </button>
              </div>
              {selectedSupplier.description && (
                <p className="text-sm text-gray-500">{selectedSupplier.description}</p>
              )}
            </div>

            {/* Товары поставщика */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {supplierProducts.map(p => <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />)}
            </div>
            {supplierProducts.length === 0 && (
              <div className="text-center py-12 text-gray-400">{isRu ? 'У этого поставщика пока нет товаров' : 'Бул жеткирүүчүнүн товарлары жок'}</div>
            )}
          </div>
        );
      })()}

      {/* Контент */}
      {selectedSupplier ? null : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tab === 'products' ? (
        filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.slice(0, visibleCount).map(p => <ProductCard key={p.id} product={p} onSelect={setSelectedProduct} />)}
            </div>
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-6">
                <button onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
                  {isRu ? `Показать ещё (${filteredProducts.length - visibleCount})` : `Дагы көрсөтүү (${filteredProducts.length - visibleCount})`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">{isRu ? 'Товары не найдены' : 'Товарлар табылган жок'}</div>
        )
      ) : (
        filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(s => <SupplierCard key={s.id} supplier={s} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">{isRu ? 'Поставщики не найдены' : 'Жеткирүүчүлөр табылган жок'}</div>
        )
      )}

      {/* Модальное окно товара */}
      {selectedProduct && (() => {
        const p = selectedProduct;
        const supplier = suppliers.find(s => s.id === p.supplierId);
        const cartItem = items.find(i => i.id === p.id);
        const inCart = cartItem ? cartItem.quantity : 0;

        return (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSelectedProduct(null)}>
            <div className="absolute bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg md:max-h-[90vh] bg-white rounded-t-2xl md:rounded-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
              {/* Фото */}
              <div className="relative">
                <div className="h-64 md:h-80 bg-gray-100">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                  )}
                </div>
                <button onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center shadow">
                  <X size={18} />
                </button>
                {p.badge === 'recommended' && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-purple-500 text-white rounded-lg text-xs font-bold">{isRu ? 'Рекомендуем' : 'Сунуштайбыз'}</span>
                )}
                {p.badge === 'new' && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold">{isRu ? 'Новинка' : 'Жаңы'}</span>
                )}
              </div>

              {/* Информация */}
              <div className="p-5">
                {/* Поставщик */}
                {supplier && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center text-white text-xs font-bold">{supplier.name?.charAt(0)}</div>
                    <span className="text-sm text-gray-500">{supplier.name}</span>
                    {supplier.rating && <span className="text-xs text-gray-400">⭐{supplier.rating}</span>}
                    <span className="text-xs text-gray-400">{supplier.city}</span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-gray-800 mb-2">{p.name}</h2>
                {p.description && <p className="text-sm text-gray-500 mb-4">{p.description}</p>}

                {p.madeInKG && (
                  <div className="flex items-center gap-1 mb-3 text-xs text-green-600 font-medium">
                    <img src="https://flagcdn.com/w20/kg.png" alt="KG" style={{width: 14, height: 10}} /> {isRu ? 'Сделано в Кыргызстане' : 'Кыргызстанда жасалган'}
                  </div>
                )}

                {/* Цена и корзина */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-3xl font-extrabold text-gray-800">{p.price}</span>
                    <span className="text-lg text-gray-500 ml-1">сом</span>
                    {p.unit && <span className="text-sm text-gray-400 ml-1">/ {p.unit}</span>}
                  </div>
                  {inCart > 0 ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => { if (inCart <= 1) removeItem(p.id); else updateQuantity(p.id, inCart - 1); }}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-50"><Minus size={16} /></button>
                      <span className="text-lg font-bold w-8 text-center">{inCart}</span>
                      <button onClick={() => addItem(p, 1)}
                        className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-green-50"><Plus size={16} /></button>
                    </div>
                  ) : (
                    <button onClick={() => { addItem(p, 1); toast.success(`${p.name} — ${isRu ? 'добавлено' : 'кошулду'}!`); }}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700">
                      <ShoppingCart size={18} /> {isRu ? 'В корзину' : 'Себетке'}
                    </button>
                  )}
                </div>

                {/* Мин заказ */}
                {supplier?.minOrder && (
                  <div className="text-xs text-orange-600 mb-4">{isRu ? 'Мин. заказ:' : 'Мин. заказ:'} {supplier.minOrder.toLocaleString('ru-RU')} сом</div>
                )}

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
