'use client';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart();
  const { t } = useLang();

  if (totalItems === 0) return null;

  return (
    <Link href="/cart">
      <div className="fixed bottom-36 right-4 z-50 bg-slate-800 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 hover:bg-slate-700 transition-all hover:scale-105 cursor-pointer md:bottom-24 md:right-6">
        <div className="relative">
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </div>
        <div>
          <div className="text-sm font-bold">{t('cart')}</div>
          <div className="text-xs text-slate-300">
            {totalPrice.toLocaleString('ru-RU')} {t('som')}
          </div>
        </div>
      </div>
    </Link>
  );
}
