'use client';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function FloatingCart() {
  const { totalItems, totalPrice } = useCart();

  if (totalItems === 0) return null;

  return (
    <Link href="/cart">
      <div className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 hover:bg-primary-700 transition-all hover:scale-105 cursor-pointer animate-bounce-once">
        <div className="relative">
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        </div>
        <div>
          <div className="text-sm font-bold">Корзина</div>
          <div className="text-xs text-primary-200">
            {totalPrice.toLocaleString('ru-RU')} сом
          </div>
        </div>
      </div>
    </Link>
  );
}
