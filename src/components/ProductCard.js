'use client';
import { ShoppingCart, Plus, Minus, Check, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, onSelect }) {
  const { items, addItem, updateQuantity, removeItem } = useCart();
  const { t, lang } = useLang();
  const router = useRouter();
  const isRu = lang === 'ru';

  // Сколько этого товара уже в корзине
  const cartItem = items.find(i => i.id === product.id);
  const inCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addItem(product, 1);
    toast.success(`${product.name} — ${t('added_to_cart') || 'добавлено в корзину'}!`);
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    if (inCart <= 1) {
      removeItem(product.id);
      toast.success(isRu ? 'Товар убран из корзины' : 'Товар себеттен алынды');
    } else {
      updateQuantity(product.id, inCart - 1);
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      router.push(`/product/${product.id}`);
    }
  };

  return (
    <div onClick={handleClick} className="cursor-pointer group h-full">
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
        product.badge === 'recommended'
          ? 'border-2 border-purple-200 ring-1 ring-purple-100'
          : ''
      }`}>
        {/* Фото */}
        <div className="aspect-square bg-gray-50 overflow-hidden relative">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <div className={`w-full h-full items-center justify-center text-gray-200 text-4xl ${product.imageUrl ? 'hidden' : 'flex'}`}>
            📦
          </div>

          {/* Бейджи товара */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badge === 'top' && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                🔥 {isRu ? 'Топ продаж' : 'Топ сатуу'}
              </span>
            )}
            {product.badge === 'recommended' && (
              <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                ⭐ {isRu ? 'Рекомендуем' : 'Сунуштайбыз'}
              </span>
            )}
            {product.badge === 'new' && (
              <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                🆕 {isRu ? 'Новинка' : 'Жаңылык'}
              </span>
            )}
            {product.madeInKG && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
                🇰🇬 {isRu ? 'Сделано в КГ' : 'КР өндүрүмү'}
              </span>
            )}
          </div>

          {/* Поделиться */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = `${window.location.origin}/supplier/${product.supplierId}`;
                const text = `${product.name} — ${product.price} сом | ${product.supplierName}`;
                if (navigator.share) {
                  navigator.share({ title: product.name, text, url });
                } else {
                  navigator.clipboard.writeText(`${text}\n${url}`);
                  toast.success(isRu ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
                }
              }}
              className="w-7 h-7 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <Share2 size={13} className="text-gray-500" />
            </button>
          </div>

          {/* Бейдж "в корзине" */}
          {inCart > 0 && (
            <div className="absolute bottom-2 right-2 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <Check size={12} /> {inCart}
            </div>
          )}
        </div>

        {/* Инфо */}
        <div className="p-2.5 sm:p-4 md:p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2 text-xs sm:text-sm md:text-lg md:font-bold min-h-[2.5em]">{product.name}</h3>
          <p className="text-xs md:text-sm md:text-base text-gray-500 mb-2">{product.supplierName || ''}</p>
          <div className="mt-auto"></div>

          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="text-xl md:text-2xl font-extrabold text-gray-900">
                {Number(product.price).toLocaleString('ru-RU')} сом
              </span>
              {product.unit && (
                <span className="text-xs text-gray-400 ml-1">/ {product.unit}</span>
              )}
            </div>
          </div>
          {product.unit && (
            <p className="text-xs text-gray-400 mb-3">{isRu ? 'Мин. заказ:' : 'Мин. заказ:'} 1 {product.unit}</p>
          )}
          {!product.unit && <div className="mb-3" />}

          {/* Если товар в корзине — показать управление количеством */}
          {inCart > 0 ? (
            <>
              <div className="flex items-center justify-between mb-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                <button
                  onClick={handleDecrement}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-red-50 transition-colors"
                >
                  <Minus size={14} className="text-gray-600" />
                </button>
                <input
                  type="number"
                  value={inCart}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    e.stopPropagation();
                    const val = parseInt(e.target.value);
                    if (val > 0) {
                      updateQuantity(product.id, val);
                    } else if (val === 0 || e.target.value === '') {
                      removeItem(product.id);
                    }
                  }}
                  className="w-12 text-center text-lg font-bold text-slate-800 bg-transparent focus:outline-none focus:bg-white focus:rounded-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                />
                <button
                  onClick={handleIncrement}
                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-green-50 transition-colors"
                >
                  <Plus size={14} className="text-gray-600" />
                </button>
              </div>

              {/* Сумма в корзине */}
              <div className="text-center text-sm text-slate-800 font-semibold mb-2">
                = {(product.price * inCart).toLocaleString('ru-RU')} сом
              </div>

              {/* Кнопка "В корзине" — не перекидывает, просто показывает статус */}
              <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
                <Check size={16} />
                {isRu ? 'В корзине' : 'Себетте'} — {inCart} {product.unit || 'шт'}
              </div>
            </>
          ) : (
            /* Кнопка "В корзину" */
            <button
              onClick={handleAdd}
              className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm md:text-base font-semibold md:font-bold"
            >
              <ShoppingCart size={16} />
              {t('add_to_cart') || 'В корзину'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
