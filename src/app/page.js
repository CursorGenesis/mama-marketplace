'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CATEGORIES, getProducts } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import ProductCard from '@/components/ProductCard';
import { Search, ArrowRight, Gift, ShoppingBag } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';

  useEffect(() => {
    getProducts().then(p => setProducts(p));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${window.location.origin}/mama-marketplace/catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const catName = (id) => {
    const cat = CATEGORIES.find(c => c.id === id);
    if (cat) return isRu ? cat.name : (cat.nameKg || cat.name);
    return id;
  };

  const recommended = products.filter(p => p.badge === 'recommended');
  const newProducts = products.filter(p => p.badge === 'new');
  const showProducts = recommended.length > 0 ? recommended : newProducts.length > 0 ? newProducts : products;

  return (
    <div>
      {/* Hero — компактный */}
      <section className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-4 py-6 md:py-10 text-center">
          <h1 className="text-xl md:text-3xl font-bold mb-2">
            {isRu ? 'Заказывай оптом — быстро и просто' : 'Оптом заказ кыл — тез жана жөнөкөй'}
          </h1>
          <p className="text-sm md:text-base text-slate-300 mb-4">
            {isRu ? 'Выбери товар → добавь в корзину → отправь заказ' : 'Товар тандаңыз → корзинага кошуңуз → заказ жөнөтүңүз'}
          </p>

          {/* Поиск */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isRu ? 'Что ищете? Например: рис, молоко, мука...' : 'Эмне издейсиз? Мисалы: күрүч, сүт, ун...'}
                className="w-full pl-4 pr-12 py-3.5 rounded-xl text-gray-800 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-green-500 hover:bg-green-600 rounded-lg text-white flex items-center transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Если не авторизован — призыв */}
          {!user && (
            <div className="mt-4">
              <Link href="/auth" className="inline-flex items-center gap-2 px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">
                <ShoppingBag size={16} />
                {isRu ? 'Зарегистрируйтесь и заказывайте в 1 клик' : 'Катталыңыз жана 1 кликте заказ кылыңыз'}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Баннер розыгрыша — компактный */}
      <section className="max-w-3xl mx-auto px-4 -mt-3 relative z-10">
        <Link href="/raffle" className="block bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-3 md:p-4 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎁</div>
              <div>
                <p className="font-bold text-sm md:text-base">{isRu ? 'Заказывай и участвуй в розыгрыше!' : 'Заказ кыл жана розыгрышка катыш!'}</p>
                <p className="text-xs text-white/80">{isRu ? 'За каждые 500 сом — 1 монетка. Призы каждые 3 месяца' : 'Ар 500 сом үчүн — 1 монета. 3 айда сыйлыктар'}</p>
              </div>
            </div>
            <Gift size={20} className="shrink-0 hidden sm:block" />
          </div>
        </Link>
      </section>

      {/* Категории */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{isRu ? 'Категории' : 'Категориялар'}</h2>
          <Link href="/catalog" className="text-sm text-slate-600 font-medium flex items-center gap-1">
            {isRu ? 'Все' : 'Баары'} <ArrowRight size={14} />
          </Link>
        </div>

        {/* Мобильные — 4 колонки */}
        <div className="md:hidden grid grid-cols-4 gap-2">
          {CATEGORIES.slice(0, 12).map(cat => (
            <Link key={cat.id} href={`/catalog?category=${cat.id}`}
              className="bg-white rounded-xl p-2.5 text-center shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100">
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-[10px] font-semibold text-gray-700 leading-tight break-words">{catName(cat.id)}</div>
            </Link>
          ))}
        </div>

        {/* Десктоп — 8 колонок */}
        <div className="hidden md:grid grid-cols-8 gap-3">
          {CATEGORIES.slice(0, 16).map(cat => (
            <Link key={cat.id} href={`/catalog?category=${cat.id}`}
              className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-lg transition-all hover:scale-105 border border-gray-100">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-xs font-semibold text-gray-700">{catName(cat.id)}</div>
            </Link>
          ))}
        </div>

        {CATEGORIES.length > 12 && (
          <Link href="/catalog"
            className="flex items-center justify-center gap-1 mt-3 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            {isRu ? `Все категории (${CATEGORIES.length})` : `Бардык категориялар (${CATEGORIES.length})`} →
          </Link>
        )}
      </section>

      {/* Товары */}
      {showProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">
              {recommended.length > 0
                ? (isRu ? '⭐ Рекомендуем' : '⭐ Сунуштайбыз')
                : newProducts.length > 0
                  ? (isRu ? '🆕 Новинки' : '🆕 Жаңылыктар')
                  : (isRu ? 'Товары' : 'Товарлар')}
            </h2>
            <Link href="/catalog" className="text-sm text-slate-600 font-medium flex items-center gap-1">
              {isRu ? 'Каталог' : 'Каталог'} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {showProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Как это работает — 3 шага */}
      <section className="max-w-3xl mx-auto px-4 py-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-6">
          {isRu ? 'Как заказать?' : 'Кантип заказ кылуу?'}
        </h2>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {[
            { num: '1', icon: '🔍', title: isRu ? 'Найдите товар' : 'Товар табыңыз', desc: isRu ? 'В каталоге или через поиск' : 'Каталогдон же издөө аркылуу' },
            { num: '2', icon: '🛒', title: isRu ? 'Добавьте в корзину' : 'Корзинага кошуңуз', desc: isRu ? 'Укажите количество' : 'Санын көрсөтүңүз' },
            { num: '3', icon: '📱', title: isRu ? 'Отправьте заказ' : 'Заказ жөнөтүңүз', desc: isRu ? 'Поставщик свяжется с вами' : 'Жеткирүүчү сиз менен байланышат' },
          ].map(step => (
            <div key={step.num} className="text-center">
              <div className="text-3xl md:text-4xl mb-2">{step.icon}</div>
              <div className="text-sm md:text-base font-bold text-gray-800">{step.title}</div>
              <div className="text-[10px] md:text-xs text-gray-500 mt-1">{step.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
