'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES, SUBCATEGORIES, getProducts, getSuppliers, getOrders } from '@/lib/firestore';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import SupplierCard from '@/components/SupplierCard';
import ProductCard from '@/components/ProductCard';
import { Search, MapPin, ArrowRight, Crown, Star, Users, TrendingUp, Building2, ShoppingCart, RotateCcw, Package, Sparkles } from 'lucide-react';
import CategoryIcon from '@/components/CategoryIcon';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCats, setShowAllCats] = useState(false);
  const [openCatId, setOpenCatId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { t, lang } = useLang();
  const { user, profile, isAdmin, isSupplier } = useAuth();
  const isAgent = profile?.role === 'agent';
  const isDriver = profile?.role === 'driver';
  const isBuyer = mounted && user && !isAdmin && !isSupplier && !isAgent && !isDriver;

  useEffect(() => {
    setMounted(true);
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

  const isRu = lang === 'ru';

  // Категория на текущем языке
  const catName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    if (cat) return isRu ? cat.name : (cat.nameKg || cat.name);
    return id;
  };

  const getSubcats = (catId) => SUBCATEGORIES[catId]?.[lang] || SUBCATEGORIES[catId]?.ru || [];

  // Персональная главная для залогиненного клиента
  if (isBuyer) {
    return <PersonalClientHome
      profile={profile}
      user={user}
      suppliers={suppliers}
      products={products}
      isRu={isRu}
      lang={lang}
      t={t}
    />;
  }

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
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Link href="/catalog" className="inline-block px-5 py-2.5 md:px-8 md:py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors shadow-lg text-sm md:text-base">
                  {lang === 'kg' ? 'Каталогду ачуу' : 'Открыть каталог'} →
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center gap-1 px-5 py-2.5 md:px-8 md:py-3.5 bg-white/10 backdrop-blur hover:bg-white/20 text-white border border-white/20 rounded-xl font-semibold transition-colors text-sm md:text-base">
                  ▶ {lang === 'kg' ? 'Кантип иштейт' : 'Как это работает'}
                </Link>
              </div>
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

      {/* Баннер «Как сделать заказ» — демо-тур */}
      <section className="max-w-7xl mx-auto px-4 pt-6 md:pt-10">
        <Link href="/tour" className="group block relative overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-4 md:p-6 text-white hover:shadow-2xl transition-all hover:scale-[1.01]">
          <div className="flex items-center gap-3 md:gap-5 flex-wrap">
            <div className="text-4xl md:text-5xl animate-pulse">📱</div>
            <div className="flex-1 min-w-[180px]">
              <div className="inline-block px-2 py-0.5 bg-white/25 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">
                ▶ {isRu ? 'Демо' : 'Демо'}
              </div>
              <h3 className="text-base md:text-xl font-extrabold mb-0.5">
                {isRu ? 'Как сделать заказ за 2 минуты' : '2 мүнөттө заказ берүү'}
              </h3>
              <p className="text-xs md:text-sm opacity-90">
                {isRu ? 'Пошаговое демо — от регистрации до доставки' : 'Кадам-кадам демо — каттоодон жеткирүүгө чейин'}
              </p>
            </div>
            <div className="px-4 py-2 md:px-6 md:py-3 bg-white text-purple-600 rounded-xl text-xs md:text-sm font-extrabold shadow-lg group-hover:bg-pink-50 transition-colors">
              ▶ {isRu ? 'Смотреть' : 'Көрүү'}
            </div>
          </div>
        </Link>
      </section>

      {/* Категории — крупные карточки на десктопе, лента на мобильном */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{t('byCategory')}</h2>

        {/* Мобильные категории — крупные цветные карточки */}
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

          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.slice(0, 8).map(cat => {
              const colors = {
                bakery: 'from-yellow-100 to-yellow-200 text-yellow-800',
                dairy: 'from-sky-100 to-sky-200 text-sky-800',
                meat: 'from-red-100 to-red-200 text-red-800',
                fish: 'from-cyan-100 to-cyan-300 text-cyan-800',
                fruits: 'from-emerald-100 to-emerald-200 text-emerald-800',
                grocery: 'from-amber-100 to-amber-200 text-amber-800',
                oils: 'from-lime-100 to-lime-200 text-lime-800',
                confectionery: 'from-pink-100 to-pink-200 text-pink-800',
                drinks: 'from-blue-100 to-blue-300 text-blue-800',
                alcohol: 'from-purple-100 to-purple-200 text-purple-800',
                tea_coffee: 'from-teal-100 to-teal-200 text-teal-800',
                canned: 'from-slate-100 to-slate-200 text-slate-700',
                spices: 'from-rose-100 to-rose-200 text-rose-800',
                snacks: 'from-orange-100 to-orange-200 text-orange-800',
                frozen: 'from-violet-100 to-violet-300 text-violet-800',
                eggs: 'from-amber-50 to-amber-200 text-amber-700',
              };
              const c = colors[cat.id] || 'from-gray-100 to-gray-200 text-gray-700';
              const [gradFrom, gradTo, textColor] = c.split(' ');
              return (
                <Link key={cat.id} href={`/catalog?category=${cat.id}`}
                  className={`bg-gradient-to-br ${gradFrom} ${gradTo} rounded-2xl p-3 text-center hover:shadow-md transition-all active:scale-95`}>
                  <div className="text-3xl mb-1">{cat.icon}</div>
                  <div className={`text-[10px] font-bold leading-tight break-words ${textColor}`}>{catName(cat.id)}</div>
                </Link>
              );
            })}
          </div>
          <button onClick={() => setShowAllCats(true)}
            className="flex items-center justify-center gap-1 mt-3 py-2.5 w-full text-sm font-semibold text-gray-500 bg-gray-50 rounded-xl active:bg-gray-100 transition-colors">
            {isRu ? `Все категории (${CATEGORIES.length}) →` : `Бардык категориялар (${CATEGORIES.length}) →`}
          </button>
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

        {/* Десктоп — цветные карточки 8 в ряду */}
        <div className="hidden md:block">
          <div className="grid grid-cols-8 gap-3">
            {CATEGORIES.slice(0, 16).map(cat => {
              const colors = {
                bakery: 'from-yellow-100 to-yellow-200 text-yellow-800',
                dairy: 'from-sky-100 to-sky-200 text-sky-800',
                meat: 'from-red-100 to-red-200 text-red-800',
                fish: 'from-cyan-100 to-cyan-300 text-cyan-800',
                fruits: 'from-emerald-100 to-emerald-200 text-emerald-800',
                grocery: 'from-amber-100 to-amber-200 text-amber-800',
                oils: 'from-lime-100 to-lime-200 text-lime-800',
                confectionery: 'from-pink-100 to-pink-200 text-pink-800',
                drinks: 'from-blue-100 to-blue-300 text-blue-800',
                alcohol: 'from-purple-100 to-purple-200 text-purple-800',
                tea_coffee: 'from-teal-100 to-teal-200 text-teal-800',
                canned: 'from-slate-100 to-slate-200 text-slate-700',
                spices: 'from-rose-100 to-rose-200 text-rose-800',
                snacks: 'from-orange-100 to-orange-200 text-orange-800',
                frozen: 'from-violet-100 to-violet-300 text-violet-800',
                eggs: 'from-amber-50 to-amber-200 text-amber-700',
              };
              const c = colors[cat.id] || 'from-gray-100 to-gray-200 text-gray-700';
              const [gradFrom, gradTo, textColor] = c.split(' ');
              return (
                <Link key={cat.id} href={`/catalog?category=${cat.id}`}
                  className={`bg-gradient-to-br ${gradFrom} ${gradTo} rounded-2xl p-4 text-center hover:shadow-lg transition-all hover:scale-105`}>
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className={`text-xs font-bold leading-tight ${textColor}`}>{catName(cat.id)}</div>
                </Link>
              );
            })}
          </div>
          {CATEGORIES.length > 16 && (
            <Link href="/catalog"
              className="flex items-center justify-center gap-1 mt-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              {isRu ? `Все категории (${CATEGORIES.length})` : `Бардык категориялар (${CATEGORIES.length})`} →
            </Link>
          )}
        </div>
      </section>

      {/* Рекомендуем / Новинки */}
      <FeaturedProducts products={products} lang={lang} />

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

      {/* Баннер розыгрыша */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <Link href="/raffle" className="group block relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-5 md:p-6 text-white hover:shadow-2xl transition-all hover:scale-[1.01]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute text-3xl opacity-20 animate-bounce" style={{top: '10%', left: '5%', animationDelay: '0s', animationDuration: '3s'}}>🪙</div>
            <div className="absolute text-2xl opacity-15 animate-bounce" style={{top: '60%', left: '15%', animationDelay: '0.5s', animationDuration: '2.5s'}}>🪙</div>
            <div className="absolute text-4xl opacity-20 animate-bounce" style={{top: '20%', right: '10%', animationDelay: '1s', animationDuration: '3.5s'}}>🪙</div>
            <div className="absolute text-2xl opacity-15 animate-bounce" style={{top: '70%', right: '20%', animationDelay: '1.5s', animationDuration: '2s'}}>🪙</div>
          </div>
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="text-4xl md:text-5xl animate-pulse drop-shadow-lg">🎁</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-white/25 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">🔥 {isRu ? 'Акция' : 'Акция'}</span>
                </div>
                <h3 className="text-base md:text-xl font-extrabold drop-shadow">{isRu ? 'Заказывай и участвуй в розыгрыше!' : 'Заказ кыл жана розыгрышка катыш!'}</h3>
                <p className="text-xs md:text-sm opacity-90 mt-0.5">{isRu ? 'За каждые 500 сом — 1 монетка. Призы каждые 3 месяца' : 'Ар 500 сом үчүн — 1 монета. 3 айда сыйлыктар'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white text-orange-600 rounded-xl text-xs md:text-sm font-extrabold shadow-lg group-hover:bg-yellow-50 transition-colors">
              🎁 {isRu ? 'Участвовать' : 'Катышуу'}
            </div>
          </div>
        </Link>
      </section>

      {/* CTA блоки: Стань клиентом + Стань поставщиком + Стань агентом */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Стань клиентом */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <ShoppingCart size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{isRu ? 'Стань клиентом' : 'Кардар бол'}</h3>
            <p className="text-blue-100 text-sm leading-relaxed flex-1">
              {isRu ? 'Заказывайте оптом напрямую от поставщиков. Лучшие цены, быстрая доставка по всему Кыргызстану' : 'Жеткирүүчүлөрдөн түздөн-түз оптом заказ кылыңыз. Эң жакшы баалар, бүт Кыргызстан боюнча тез жеткирүү'}
            </p>
            <Link href="/auth"
              className="inline-block px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-sm mt-6 text-center">
              {isRu ? 'Зарегистрироваться' : 'Катталуу'}
            </Link>
          </div>

          {/* Стань поставщиком */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{isRu ? 'Стань поставщиком' : 'Жеткирүүчү бол'}</h3>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">
              {isRu ? 'Разместите компанию на маркетплейсе и получайте заказы от покупателей по всему Кыргызстану. Первый месяц бесплатно' : 'Компанияңызды маркетплейске жайгаштырыңыз жана бүт Кыргызстан боюнча заказдарды алыңыз. Биринчи ай акысыз'}
            </p>
            <Link href="/auth"
              className="inline-block px-6 py-3 bg-white text-slate-800 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm mt-6 text-center">
              {isRu ? 'Зарегистрироваться' : 'Катталуу'}
            </Link>
          </div>

          {/* Стань агентом */}
          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 text-white flex flex-col">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">{isRu ? 'Стань агентом' : 'Агент бол'}</h3>
            <p className="text-green-100 text-sm leading-relaxed flex-1">
              {isRu ? 'Подключайте магазины к платформе и получайте 1% с каждого заказа. Свободный график, без вложений' : 'Дүкөндөрдү платформага туташтырып, ар бир заказдан 1% алыңыз. Эркин график, салымсыз'}
            </p>
            <Link href="/agents"
              className="inline-block px-6 py-3 bg-white text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors text-sm mt-6 text-center">
              {isRu ? 'Подробнее' : 'Толугураак'}
            </Link>
          </div>
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

// ПЕРСОНАЛЬНАЯ ГЛАВНАЯ для залогиненного клиента
function PersonalClientHome({ profile, user, suppliers, products, isRu, lang, t }) {
  const { addItem } = useCart();
  const [lastOrder, setLastOrder] = useState(null);
  const [activeOrders, setActiveOrders] = useState([]);
  const [frequentProducts, setFrequentProducts] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    getOrders({ buyerId: user.uid }).then(orders => {
      if (!orders || orders.length === 0) return;
      setLastOrder(orders[0]);
      const active = orders.filter(o =>
        !['received', 'cancelled', 'not_received'].includes(o.status)
      );
      setActiveOrders(active);

      // Подсчёт частоты товаров по всем заказам
      const itemCount = {};
      orders.forEach(o => {
        (o.items || []).forEach(item => {
          const id = item.id || item.productId;
          if (id) itemCount[id] = (itemCount[id] || 0) + (item.quantity || 1);
        });
      });
      const sortedIds = Object.entries(itemCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id]) => id);
      const frequent = sortedIds
        .map(id => products.find(p => p.id === id))
        .filter(Boolean);
      setFrequentProducts(frequent);
    });
  }, [user?.uid, products]);

  const repeatOrder = () => {
    if (!lastOrder?.items?.length) return;
    lastOrder.items.forEach(item => {
      addItem(item, item.quantity || 1);
    });
    toast.success(isRu ? 'Товары добавлены в корзину' : 'Товарлар себетке кошулду');
    setTimeout(() => { window.location.href = '/mama-marketplace/cart'; }, 600);
  };

  const featuredSuppliers = suppliers.filter(s => s.featured);
  const name = profile?.name || user?.email?.split('@')[0] || (isRu ? 'Друг' : 'Дос');
  const coins = profile?.coins || 0;
  const nextCoinGoal = Math.ceil(coins / 10) * 10 + 10;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Приветствие */}
      <section className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <h1 className="text-2xl md:text-4xl font-bold mb-1">
            {isRu ? `С возвращением, ${name}!` : `Кош келдиңиз, ${name}!`}
          </h1>
          <p className="text-slate-300 text-sm md:text-base">
            {isRu ? 'Готовы к новому заказу?' : 'Жаңы буйрутмага даярсызбы?'}
          </p>

          {/* Статус активных заказов */}
          {activeOrders.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <div className="text-2xl">🚚</div>
              <div>
                <div className="text-sm font-semibold">
                  {isRu
                    ? `У вас ${activeOrders.length} активных заказов`
                    : `Сизде ${activeOrders.length} активдүү буйрутма`}
                </div>
                <Link href="/orders" className="text-xs text-slate-300 hover:text-white">
                  {isRu ? 'Посмотреть статус →' : 'Статусту көрүү →'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Последний заказ — повторить */}
      {lastOrder && (
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <RotateCcw size={20} className="text-green-600" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">
                    {isRu ? 'Ваш последний заказ' : 'Акыркы буйрутмаңыз'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {isRu ? 'От' : ''} {lastOrder.supplierName || '—'} · {(lastOrder.items || []).length} {isRu ? 'товаров' : 'товар'} · {Number(lastOrder.total || lastOrder.totalPrice || 0).toLocaleString('ru-RU')} сом
                  </p>
                </div>
              </div>
              <button
                onClick={repeatOrder}
                className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shadow-sm"
              >
                <RotateCcw size={16} /> {isRu ? 'Повторить заказ' : 'Кайталоо'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs text-gray-600">
              {(lastOrder.items || []).slice(0, 5).map((item, i) => (
                <span key={i} className="bg-gray-50 rounded-md px-2 py-1">
                  {item.name} × {item.quantity}
                </span>
              ))}
              {(lastOrder.items || []).length > 5 && (
                <span className="text-gray-400 px-2 py-1">
                  +{(lastOrder.items || []).length - 5} {isRu ? 'ещё' : 'дагы'}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Частые товары */}
      {frequentProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package size={24} className="text-slate-700" />
              {isRu ? 'Ваши частые товары' : 'Тез-тез алган товарлар'}
            </h2>
            <Link href="/orders" className="text-sm text-slate-700 font-medium">
              {isRu ? 'История →' : 'Тарых →'}
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {frequentProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ТОП поставщики (платное размещение) */}
      {featuredSuppliers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-gray-900">
              <Crown size={26} className="text-yellow-500" />
              {t('topSuppliers')}
            </h2>
            <Link href="/catalog?tab=suppliers" className="flex items-center gap-1 text-slate-700 font-medium text-sm">
              {t('allSuppliersBtn')} <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSuppliers.map(s => (
              <div key={s.id} className="relative">
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

      {/* Розыгрыш с прогрессом коинов */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        <Link href="/raffle" className="block relative overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl p-5 md:p-6 text-white hover:shadow-2xl transition-all">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-5xl animate-pulse">🎁</div>
            <div className="flex-1 min-w-[200px]">
              <h3 className="text-base md:text-lg font-extrabold mb-1">
                {isRu ? `У вас ${coins} монеток` : `Сизде ${coins} монета`}
              </h3>
              <p className="text-xs md:text-sm opacity-90">
                {isRu
                  ? `До следующего уровня: ${Math.max(0, nextCoinGoal - coins)} монеток`
                  : `Кийинки деңгээлге чейин: ${Math.max(0, nextCoinGoal - coins)} монета`}
              </p>
            </div>
            <div className="px-5 py-2.5 bg-white text-orange-600 rounded-xl font-bold text-sm shadow-lg">
              {isRu ? 'К розыгрышу →' : 'Розыгрышка →'}
            </div>
          </div>
        </Link>
      </section>

      {/* Каталог — внизу */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-slate-700" />
            {isRu ? 'Хотите что-то новое?' : 'Жаңы нерсе издейсизби?'}
          </h2>
          <Link href="/catalog" className="text-sm text-slate-700 font-medium">
            {isRu ? 'Весь каталог →' : 'Бардык каталог →'}
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 md:gap-3">
          {CATEGORIES.slice(0, 8).map(cat => {
            const colors = {
              bakery: 'from-yellow-100 to-yellow-200 text-yellow-800',
              dairy: 'from-sky-100 to-sky-200 text-sky-800',
              meat: 'from-red-100 to-red-200 text-red-800',
              fish: 'from-cyan-100 to-cyan-300 text-cyan-800',
              fruits: 'from-emerald-100 to-emerald-200 text-emerald-800',
              grocery: 'from-amber-100 to-amber-200 text-amber-800',
              oils: 'from-lime-100 to-lime-200 text-lime-800',
              confectionery: 'from-pink-100 to-pink-200 text-pink-800',
              drinks: 'from-blue-100 to-blue-300 text-blue-800',
              alcohol: 'from-purple-100 to-purple-200 text-purple-800',
              tea_coffee: 'from-teal-100 to-teal-200 text-teal-800',
              canned: 'from-slate-100 to-slate-200 text-slate-700',
              spices: 'from-rose-100 to-rose-200 text-rose-800',
              snacks: 'from-orange-100 to-orange-200 text-orange-800',
              frozen: 'from-violet-100 to-violet-300 text-violet-800',
              eggs: 'from-amber-50 to-amber-200 text-amber-700',
            };
            const c = colors[cat.id] || 'from-gray-100 to-gray-200 text-gray-700';
            const [gradFrom, gradTo, textColor] = c.split(' ');
            const name = isRu ? cat.name : (cat.nameKg || cat.name);
            return (
              <Link key={cat.id} href={`/catalog?category=${cat.id}`}
                className={`bg-gradient-to-br ${gradFrom} ${gradTo} rounded-2xl p-3 text-center hover:shadow-md transition-all active:scale-95`}>
                <div className="text-2xl md:text-3xl mb-1">{cat.icon}</div>
                <div className={`text-[10px] md:text-xs font-bold leading-tight break-words ${textColor}`}>{name}</div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

