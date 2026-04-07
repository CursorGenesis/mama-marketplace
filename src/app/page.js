'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES, SUBCATEGORIES, getProducts, getSuppliers } from '@/lib/firestore';
import { useLang } from '@/context/LangContext';
import SupplierCard from '@/components/SupplierCard';
import ProductCard from '@/components/ProductCard';
import { Search, MapPin, ArrowRight, Crown, Star, Users, TrendingUp, Building2 } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';

export default function HomePage() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCats, setShowAllCats] = useState(false);
  const [openCatId, setOpenCatId] = useState(null);
  const { t, lang } = useLang();

  useEffect(() => {
    getSuppliers().then(s => setSuppliers(s));
    getProducts().then(p => setProducts(p));
  }, []);

  const featuredSuppliers = suppliers.filter(s => s.featured);
  const regularSuppliers = suppliers.filter(s => !s.featured);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Категория на текущем языке
  const catName = (id) => t(id) || CATEGORIES.find(c => c.id === id)?.name || id;
  const isRu = lang === 'ru';

  const getSubcats = (catId) => SUBCATEGORIES[catId]?.[lang] || SUBCATEGORIES[catId]?.ru || [];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:gap-12">
            {/* Левая часть */}
            <div className="flex-1 max-w-xl">
              <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-white/90 mb-1 md:mb-2 tracking-wide uppercase">
                {lang === 'kg' ? 'Чек арасыз бизнес' : 'Бизнес без границ'}
              </h2>
              <h1 className="text-xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 leading-tight">
                {t('heroTitle')}
              </h1>
              <p className="text-sm md:text-lg text-slate-300 mb-4 md:mb-6">
                {t('heroSubtitle')}
              </p>
              <Link href="/catalog" className="inline-block px-5 py-2.5 md:px-8 md:py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg text-sm md:text-base">
                {lang === 'kg' ? 'Каталогду ачуу' : 'Открыть каталог'} →
              </Link>
            </div>

            {/* Правая часть — статистика + фичи */}
            <div className="flex-1 mt-5 md:mt-0">
              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4 text-center">
                  <div className="text-xl md:text-3xl font-extrabold">{suppliers.length}+</div>
                  <div className="text-slate-300 text-[10px] md:text-xs mt-0.5">{t('suppliers')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4 text-center">
                  <div className="text-xl md:text-3xl font-extrabold">{products.length}+</div>
                  <div className="text-slate-300 text-[10px] md:text-xs mt-0.5">{t('products')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-2.5 md:p-4 text-center">
                  <div className="text-xl md:text-3xl font-extrabold">10</div>
                  <div className="text-slate-300 text-[10px] md:text-xs mt-0.5">{t('cities')}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp size={16} className="text-green-400 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">{isRu ? 'Лучшие цены' : 'Мыкты баалар'}</p>
                    <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">{isRu ? 'Сравнивайте и экономьте' : 'Салыштырып, үнөмдөңүз'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-blue-400 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">{isRu ? 'Доставка по КР' : 'КР боюнча жеткирүү'}</p>
                    <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">{isRu ? 'Все регионы страны' : 'Өлкөнүн бардык аймактары'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Star size={16} className="text-amber-400 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">{isRu ? 'Проверенные' : 'Текшерилген'}</p>
                    <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">{isRu ? 'Рейтинги и отзывы' : 'Рейтинг жана пикирлер'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2 md:p-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <Crown size={16} className="text-purple-400 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-semibold">{isRu ? 'За 1 минуту' : '1 мүнөттө'}</p>
                    <p className="text-[10px] md:text-xs text-slate-400 hidden sm:block">{isRu ? 'Быстро и удобно' : 'Тез жана ыңгайлуу'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ТОП поставщики (платное размещение) */}
      {featuredSuppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-14">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl md:text-4xl font-bold flex items-center gap-2 text-gray-900">
              <Crown size={28} className="text-yellow-500" />
              {t('topSuppliers')}
            </h2>
            <Link href="/catalog?tab=suppliers" className="flex items-center gap-1 text-slate-700 hover:text-slate-700 font-medium text-sm md:text-base">
              {t('allSuppliersBtn')} <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSuppliers.map(s => (
              <div key={s.id} className="relative">
                {/* Бейдж ТОП */}
                <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <Crown size={12} /> {t('topBadge')}
                </div>
                <div className="ring-2 ring-yellow-400/50 rounded-xl">
                  <SupplierCard supplier={s} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Категории — крупные карточки на десктопе, лента на мобильном */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{t('byCategory')}</h2>

        {/* Мобильные категории — как в Lalafo */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-800">{isRu ? 'Категории' : 'Категориялар'}</h3>
            <button
              onClick={() => setShowAllCats(true)}
              className="text-sm text-slate-700 font-semibold px-3 py-1.5 bg-slate-50 rounded-lg active:bg-slate-100"
            >
              {isRu ? 'Смотреть все' : 'Баарын көрүү'}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => document.getElementById('cat-mobile').scrollBy({ left: -200, behavior: 'smooth' })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => document.getElementById('cat-mobile').scrollBy({ left: 200, behavior: 'smooth' })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          <div id="cat-mobile" className="flex gap-3 overflow-x-auto pb-3 snap-x scrollbar-hide px-1">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`} className="shrink-0 w-[30%] snap-start">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-3 active:scale-95 transition-transform">
                  <div className="bg-slate-50 rounded-2xl flex items-center justify-center" style={{width: 72, height: 72}}>
                    <CategoryIcon categoryId={cat.id} size={44} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center leading-tight line-clamp-2">{catName(cat.id)}</span>
                </div>
              </Link>
            ))}
          </div>
          </div>
        </div>

        {/* Модальное окно всех категорий */}
        {showAllCats && (
          <div className="fixed inset-0 z-[60] bg-black/30 md:hidden" onClick={() => setShowAllCats(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-gray-100">
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">{isRu ? 'Все категории' : 'Бардык категориялар'}</h3>
                  <button onClick={() => setShowAllCats(false)} className="text-gray-400 text-sm">{isRu ? 'Закрыть' : 'Жабуу'}</button>
                </div>
              </div>
              <div className="p-4 space-y-1">
                {CATEGORIES.map(cat => {
                  const subcats = getSubcats(cat.id);
                  const isOpenCat = openCatId === cat.id;
                  return (
                    <div key={cat.id}>
                      <button
                        onClick={() => setOpenCatId(isOpenCat ? null : cat.id)}
                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors ${isOpenCat ? 'bg-slate-50' : 'hover:bg-gray-50 active:bg-slate-50'}`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isOpenCat ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <CategoryIcon categoryId={cat.id} size={28} />
                        </div>
                        <span className={`text-base font-medium flex-1 text-left ${isOpenCat ? 'text-slate-800' : 'text-gray-800'}`}>{catName(cat.id)}</span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpenCat ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isOpenCat && subcats.length > 0 && (
                        <div className="ml-4 mr-4 mb-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <Link href={`/catalog?category=${cat.id}`}
                            onClick={() => setShowAllCats(false)}
                            className="block px-4 py-3 text-sm font-semibold text-slate-700 border-b border-gray-100 active:bg-slate-50">
                            {isRu ? `Все ${catName(cat.id).toLowerCase()} →` : `Бардык ${catName(cat.id).toLowerCase()} →`}
                          </Link>
                          {subcats.map((sub, i) => (
                            <Link key={i} href={`/catalog?category=${cat.id}&search=${encodeURIComponent(sub)}`}
                              onClick={() => setShowAllCats(false)}
                              className="block px-4 py-2.5 text-sm text-gray-700 border-b border-gray-50 last:border-0 active:bg-slate-50 active:text-slate-700">
                              {sub}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Десктоп: горизонтальная лента со стрелками */}
        <div className="hidden md:block relative">
          <button
            onClick={() => { document.getElementById('cat-row').scrollBy({ left: -300, behavior: 'smooth' }); }}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={() => { document.getElementById('cat-row').scrollBy({ left: 300, behavior: 'smooth' }); }}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div id="cat-row" className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`}
                className="shrink-0 flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-slate-300 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group w-[100px]">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                  <CategoryIcon categoryId={cat.id} size={36} />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-slate-700 transition-colors text-center leading-tight line-clamp-2">{catName(cat.id)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Рекомендуем / Новинки */}
      <FeaturedProducts products={products} lang={lang} />

      {/* Все поставщики */}
      {regularSuppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8 md:py-14">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h2 className="text-xl md:text-4xl font-bold flex items-center gap-2 text-gray-900">
              <Users size={28} className="text-slate-700" />
              {t('newOnPlatform')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularSuppliers.map(s => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>
        </section>
      )}

      {/* CTA блоки: Стать поставщиком + Попасть в ТОП + Пригласи друга */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Стать поставщиком */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('becomeSupplier')}</h3>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">
              {t('becomeSupplierDesc')}
            </p>
            <Link
              href="/auth"
              className="inline-block px-6 py-3 bg-white text-slate-800 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm mt-6 text-center"
            >
              {t('becomeSupplierBtn')}
            </Link>
          </div>

          {/* Попасть в ТОП */}
          <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Crown size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('topPlacement')}</h3>
            <p className="text-yellow-100 text-sm leading-relaxed flex-1">
              {t('topPlacementDesc')}
            </p>
            <Link
              href="/support"
              className="inline-block px-6 py-3 bg-white text-slate-800 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm mt-6 text-center"
            >
              {t('topPlacementBtn')}
            </Link>
          </div>

          {/* Пригласить поставщика */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{lang === 'kg' ? 'Жеткирүүчүнү чакыр' : 'Пригласить поставщика'}</h3>
            <p className="text-green-100 text-sm leading-relaxed flex-1">
              {lang === 'kg' ? 'Керектүү жеткирүүчүнү таппадыңызбы? Бизге айтыңыз — биз аны таап, платформага кошобуз' : 'Не нашли нужного поставщика? Расскажите нам — мы найдём его и подключим к платформе'}
            </p>
            <Link
              href="/referral"
              className="inline-block px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors text-sm mt-6 text-center"
            >
              {lang === 'kg' ? 'Заявка жөнөтүү' : 'Отправить заявку'}
            </Link>
          </div>
        </div>
      </section>

      {/* Карта */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gray-900 rounded-2xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('suppliersMap')}</h2>
            <p className="text-gray-400">
              {t('suppliersMapDesc')}
            </p>
          </div>
          <Link
            href="/map"
            className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <MapPin size={20} /> {t('openMap')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeaturedProducts({ products, lang }) {
  const [tab, setTab] = useState('recommended');
  const isRu = lang === 'ru';

  const recommended = products.filter(p => p.badge === 'recommended');
  const newProducts = products.filter(p => p.badge === 'new');
  const topProducts = products.filter(p => p.badge === 'top');

  const currentProducts = tab === 'recommended' ? recommended : tab === 'new' ? newProducts : topProducts;

  if (recommended.length === 0 && newProducts.length === 0 && topProducts.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-2 sm:px-4 pt-8">
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-3 sm:p-6 border border-slate-200">
        {/* Вкладки */}
        <div className="flex items-center justify-between mb-5">
          <div className="inline-flex bg-white rounded-xl p-1 shadow-sm">
            {recommended.length > 0 && (
              <button
                onClick={() => setTab('recommended')}
                className={`flex items-center gap-1 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  tab === 'recommended' ? 'bg-slate-800 text-white shadow' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                ⭐ {isRu ? 'Рекомендуем' : 'Сунуштайбыз'}
              </button>
            )}
            {newProducts.length > 0 && (
              <button
                onClick={() => setTab('new')}
                className={`flex items-center gap-1 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  tab === 'new' ? 'bg-green-600 text-white shadow' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                🆕 {isRu ? 'Новинки' : 'Жаңылыктар'}
              </button>
            )}
          </div>
          <Link href="/catalog" className="text-sm text-slate-700 hover:text-slate-700 font-medium shrink-0 hidden sm:block">
            {isRu ? 'Все товары' : 'Бардык товарлар'} →
          </Link>
        </div>

        {/* Товары */}
        {currentProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {currentProducts.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">{isRu ? 'Товаров пока нет' : 'Товарлар жок'}</p>
        )}
      </div>
    </section>
  );
}


