'use client';
import { useFavorites } from '@/context/FavoritesContext';
import { useLang } from '@/context/LangContext';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { lang } = useLang();
  const isRu = lang === 'ru';

  if (favorites.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600 mb-2">
          {isRu ? 'Избранное пусто' : 'Тандалма бош'}
        </h2>
        <p className="text-gray-400 mb-6">
          {isRu ? 'Нажмите ❤️ на товаре, чтобы добавить в избранное' : 'Тандалмага кошуу үчүн товардагы ❤️ басыңыз'}
        </p>
        <Link href="/catalog" className="px-8 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium">
          {isRu ? 'Перейти в каталог' : 'Каталогго өтүү'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart size={24} className="text-red-500" />
          {isRu ? 'Избранное' : 'Тандалма'}
        </h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {favorites.length} {isRu ? 'товаров' : 'товар'}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
