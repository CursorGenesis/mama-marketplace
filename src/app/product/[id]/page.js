'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getProducts, getSupplier } from '@/lib/firestore';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useLang } from '@/context/LangContext';
import ProductCard from '@/components/ProductCard';
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, MapPin, Star, MessageCircle, Share2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const { id } = useParams();
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { t, lang } = useLang();
  const isRu = lang === 'ru';

  const [product, setProduct] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    const p = await getProduct(id);
    if (!p) { setLoading(false); return; }
    setProduct(p);

    const [sup, related] = await Promise.all([
      p.supplierId ? getSupplier(p.supplierId) : null,
      getProducts({ category: p.category }),
    ]);
    setSupplier(sup);
    setRelatedProducts(related.filter(r => r.id !== id).slice(0, 4));
    setLoading(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t('loading')}</div>;
  if (!product) return (
    <div className="text-center py-20">
      <p className="text-gray-400 text-lg mb-4">{isRu ? 'Товар не найден' : 'Товар табылган жок'}</p>
      <Link href="/catalog" className="text-slate-800 font-semibold hover:underline">{t('goToCatalog')}</Link>
    </div>
  );

  const cartItem = items.find(i => i.id === product.id);
  const inCart = cartItem ? cartItem.quantity : 0;
  const liked = isFavorite(product.id);

  const handleAdd = () => {
    addItem(product, 1);
    toast.success(`${product.name} — ${t('added_to_cart')}!`);
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `${product.name} — ${product.price} сом | ${product.supplierName || ''}`;
    if (navigator.share) {
      navigator.share({ title: product.name, text, url });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success(isRu ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
    }
  };

  const whatsappLink = supplier?.whatsapp
    ? `https://wa.me/${supplier.whatsapp.replace(/[^0-9]/g, '')}`
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Назад */}
      <Link href="/catalog" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-6 font-medium text-sm">
        <ArrowLeft size={18} /> {t('catalog')}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Фото */}
        <div className="relative">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div className={`w-full h-full items-center justify-center text-gray-200 text-6xl ${product.imageUrl ? 'hidden' : 'flex'}`}>
              📦
            </div>
          </div>

          {/* Бейджи */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.badge === 'top' && (
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                🔥 {isRu ? 'Топ продаж' : 'Топ сатуу'}
              </span>
            )}
            {product.badge === 'recommended' && (
              <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                ⭐ {isRu ? 'Рекомендуем' : 'Сунуштайбыз'}
              </span>
            )}
            {product.badge === 'new' && (
              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                🆕 {isRu ? 'Новинка' : 'Жаңылык'}
              </span>
            )}
          </div>

          {/* Кнопки справа */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button onClick={() => { toggleFavorite(product); toast.success(liked ? (isRu ? 'Убрано из избранного' : 'Тандалмадан алынды') : (isRu ? 'В избранном' : 'Тандалмада')); }}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
              <Heart size={20} className={liked ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
            </button>
            <button onClick={handleShare}
              className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
              <Share2 size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Инфо */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>

          {/* Поставщик */}
          {supplier && (
            <Link href={`/supplier/${supplier.id}`} className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin size={14} />
                <span>{supplier.city || ''}</span>
                <span className="mx-1">·</span>
                <span className="font-medium text-slate-700">{supplier.name}</span>
              </div>
              {supplier.rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-500">{supplier.rating}</span>
                </div>
              )}
            </Link>
          )}

          {/* Цена */}
          <div className="mb-6">
            <span className="text-3xl font-extrabold text-gray-900">
              {Number(product.price).toLocaleString('ru-RU')} {t('som')}
            </span>
            {product.unit && (
              <span className="text-gray-400 ml-2">/ {product.unit}</span>
            )}
          </div>

          {/* Описание */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-1">{isRu ? 'Описание' : 'Сүрөттөмө'}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Мин. заказ */}
          {product.unit && (
            <p className="text-sm text-gray-500 mb-6">{isRu ? 'Мин. заказ:' : 'Мин. заказ:'} 1 {product.unit}</p>
          )}

          {/* Корзина */}
          {inCart > 0 ? (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <button onClick={() => { if (inCart <= 1) removeItem(product.id); else updateQuantity(product.id, inCart - 1); }}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-red-50">
                  <Minus size={16} className="text-gray-600" />
                </button>
                <span className="text-xl font-bold text-slate-800 w-12 text-center">{inCart}</span>
                <button onClick={() => addItem(product, 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-white shadow-sm hover:bg-green-50">
                  <Plus size={16} className="text-gray-600" />
                </button>
                <span className="text-lg font-bold text-slate-800 ml-auto">
                  = {(product.price * inCart).toLocaleString('ru-RU')} {t('som')}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2.5 bg-green-100 text-green-700 rounded-xl text-sm font-semibold">
                <Check size={16} />
                {isRu ? 'В корзине' : 'Себетте'} — {inCart} {product.unit || isRu ? 'шт' : 'даана'}
              </div>
            </div>
          ) : (
            <button onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-base font-bold mb-6">
              <ShoppingCart size={20} />
              {t('add_to_cart')}
            </button>
          )}

          {/* Связь с поставщиком */}
          <div className="flex gap-3">
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors font-medium text-sm">
                <MessageCircle size={18} /> WhatsApp
              </a>
            )}
            {supplier && (
              <Link href={`/supplier/${supplier.id}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm">
                {t('moreDetails')}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Похожие товары */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {isRu ? 'Похожие товары' : 'Окшош товарлар'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
