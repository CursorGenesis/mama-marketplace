'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts, getSuppliers, CATEGORIES, CITIES, SUBCATEGORIES } from '@/lib/firestore';
import { useLang } from '@/context/LangContext';
import ProductCard from '@/components/ProductCard';
import SupplierCard from '@/components/SupplierCard';
import { Search, SlidersHorizontal, X, ShoppingBag } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';

function CatalogContent() {
  const searchParams = useSearchParams();
  const { t, lang } = useLang();
  const [tab, setTab] = useState(searchParams.get('tab') || 'products');
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  // Фильтры
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [onlyKG, setOnlyKG] = useState(false);

  useEffect(() => {
    loadData();
  }, [category, city]);

  const loadData = async () => {
    setLoading(true);
    const filters = {};
    if (city) filters.city = city;

    const [prods, sups] = await Promise.all([
      getProducts(category ? { category, ...filters } : filters),
      getSuppliers(filters),
    ]);
    setProducts(prods);
    setSuppliers(sups);
    setLoading(false);
  };

  // Умный поиск: разбираем запрос на ключевые слова и намерение
  const smartSearch = (searchQuery) => {
    const lower = searchQuery.toLowerCase().trim();
    if (!lower) return { keywords: '', sortOverride: null };

    // Определяем намерение по цене
    const cheapWords = ['дешёв', 'дешев', 'дешовый', 'недорог', 'арзан', 'cheap', 'самый дешёв', 'самый дешев', 'подешевле', 'бюджет'];
    const expensiveWords = ['дорог', 'премиум', 'кымбат', 'expensive', 'лучший', 'качествен'];

    let sortOverride = null;
    let cleanQuery = lower;

    for (const word of cheapWords) {
      if (lower.includes(word)) {
        sortOverride = 'price_asc';
        cleanQuery = cleanQuery.replace(new RegExp(word + '[а-яёүөңa-z]*', 'gi'), '').trim();
        break;
      }
    }
    if (!sortOverride) {
      for (const word of expensiveWords) {
        if (lower.includes(word)) {
          sortOverride = 'price_desc';
          cleanQuery = cleanQuery.replace(new RegExp(word + '[а-яёүөңa-z]*', 'gi'), '').trim();
          break;
        }
      }
    }

    // Убираем служебные слова
    cleanQuery = cleanQuery.replace(/\b(самый|самые|самая|самое|где|найти|найди|покажи|хочу|купить|мне|нужен|нужна|нужно|нужны|какой|какая|какие|какое|эң|кайда|табуу|керек|кана|бар)\b/gi, '').trim();
    // Убираем лишние пробелы
    cleanQuery = cleanQuery.replace(/\s+/g, ' ').trim();

    return { keywords: cleanQuery, sortOverride };
  };

  const { keywords: searchKeywords, sortOverride } = smartSearch(search);
  const activeSortBy = sortOverride || sortBy;

  const filteredProducts = products
    .filter(p => {
      if (searchKeywords) {
        const words = searchKeywords.split(' ').filter(w => w.length > 1);
        if (words.length === 0) return true; // Все слова были служебные — показать всё
        const productText = `${p.name || ''} ${p.description || ''} ${p.supplierName || ''} ${p.category || ''}`.toLowerCase();
        // Хотя бы одно слово должно совпасть
        const found = words.some(word => productText.includes(word));
        if (!found) return false;
      }
      if (priceMin && p.price < Number(priceMin)) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      if (onlyKG && !p.madeInKG) return false;
      return true;
    })
    .sort((a, b) => {
      if (activeSortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
      if (activeSortBy === 'price_desc') return (b.price || 0) - (a.price || 0);
      if (activeSortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    });

  const filteredSuppliers = suppliers.filter(s => {
    if (search && !s.name?.toLowerCase().includes(search.toLowerCase()) &&
        !s.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => {
    setSearch(''); setCategory(''); setCity('');
    setPriceMin(''); setPriceMax(''); setSortBy('newest');
    setVisibleCount(20); setOnlyKG(false);
  };

  const hasFilters = search || category || city || priceMin || priceMax;

  // Название категории на текущем языке
  const catName = (id) => t(id) || CATEGORIES.find(c => c.id === id)?.name || id;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Заголовок + поиск */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-4xl font-bold md:font-extrabold">{t('catalog')}</h1>
        <div className="flex gap-2 flex-1 md:max-w-md">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={lang === 'kg' ? 'Издөө: "сүт", "конфета"...' : 'Поиск: "молоко", "конфеты"...'}
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-lg text-sm md:text-base md:font-medium focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg border transition-colors flex items-center gap-1 ${
              showFilters ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            <SlidersHorizontal size={18} /> {t('filters')}
          </button>
        </div>
      </div>

      {/* Категории — горизонтальная лента со стрелками */}
      <div className="mb-4 relative">
        {/* Стрелка влево */}
        <button
          onClick={() => document.getElementById('cat-scroll').scrollBy({ left: -200, behavior: 'smooth' })}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        {/* Стрелка вправо */}
        <button
          onClick={() => document.getElementById('cat-scroll').scrollBy({ left: 200, behavior: 'smooth' })}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-all"
        >
          <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <div id="cat-scroll" className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
          <button
            onClick={() => { setCategory(''); setSearch(''); }}
            className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[72px] ${
              !category ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <ShoppingBag size={24} />
            <span>{t('all')}</span>
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setCategory(category === cat.id ? '' : cat.id); setSearch(''); }}
              className={`shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all min-w-[72px] ${
                category === cat.id ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <CategoryIcon categoryId={cat.id} size={28} />
              <span className="text-center leading-tight line-clamp-1">{catName(cat.id)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Подкатегории — появляются когда выбрана категория */}
      {category && (() => {
        const subs = SUBCATEGORIES[category]?.[lang] || SUBCATEGORIES[category]?.ru || [];
        if (subs.length === 0) return null;
        return (
          <div className="mb-4 flex flex-wrap gap-2">
            {subs.map((sub, i) => (
              <button key={i}
                onClick={() => setSearch(sub)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  search === sub ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}>
                {sub}
              </button>
            ))}
          </div>
        );
      })()}

      {/* Табы */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('products')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
            tab === 'products' ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('productsTab')} ({filteredProducts.length})
        </button>
        <button
          onClick={() => setTab('suppliers')}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-colors ${
            tab === 'suppliers' ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {t('suppliersTab')} ({filteredSuppliers.length})
        </button>
        <button
          onClick={() => { setOnlyKG(!onlyKG); setVisibleCount(20); }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1 ml-auto ${
            onlyKG ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          🇰🇬 {lang === 'kg' ? 'КР өндүрүмү' : 'Сделано в КГ'}
        </button>
      </div>

      {/* Фильтры */}
      {showFilters && (
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')}</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option value="">{t('allCities')}</option>
                {CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('price')}</label>
              <div className="flex gap-2">
                <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)}
                  placeholder="от" className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
                <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)}
                  placeholder="до" className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('sorting')}</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
                <option value="newest">{t('newest')}</option>
                <option value="price_asc">{t('priceAsc')}</option>
                <option value="price_desc">{t('priceDesc')}</option>
                <option value="name">{t('byName')}</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <X size={14} /> {t('clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Контент */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">{t('loading')}</div>
      ) : tab === 'products' ? (
        filteredProducts.length > 0 ? (
          <>
            {/* Подсказка умного поиска */}
            {sortOverride && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700">
                <span>🤖</span>
                {sortOverride === 'price_asc'
                  ? (lang === 'kg' ? `Эң арзандан кымбатка иреттелди • ${filteredProducts.length} товар табылды` : `Отсортировано от дешёвых к дорогим • Найдено ${filteredProducts.length} товаров`)
                  : (lang === 'kg' ? `Эң кымбаттан арзанга иреттелди • ${filteredProducts.length} товар табылды` : `Отсортировано от дорогих к дешёвым • Найдено ${filteredProducts.length} товаров`)}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.slice(0, visibleCount).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            {visibleCount < filteredProducts.length && (
              <div className="text-center mt-6">
                <button
                  onClick={() => setVisibleCount(prev => prev + 20)}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  {lang === 'kg'
                    ? `Дагы көрсөтүү (${filteredProducts.length - visibleCount} калды)`
                    : `Показать ещё (${filteredProducts.length - visibleCount} осталось)`}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">{t('productsNotFound')}</div>
        )
      ) : (
        filteredSuppliers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(s => <SupplierCard key={s.id} supplier={s} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">{t('suppliersNotFound')}</div>
        )
      )}
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
