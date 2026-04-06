'use client';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">MarketKG</h3>
            <p className="text-sm leading-relaxed">
              B2B маркетплейс поставщиков продуктов питания в Кыргызстане.
              Находите поставщиков, сравнивайте цены, заказывайте оптом.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>Бишкек, Кыргызстан</p>
              <p>info@marketkg.com</p>
              <p>+996 XXX XXX XXX</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Покупателям</h4>
            <div className="space-y-2 text-sm">
              <Link href="/catalog" className="block hover:text-white transition-colors">Каталог</Link>
              <Link href="/map" className="block hover:text-white transition-colors">Карта поставщиков</Link>
              <Link href="/orders" className="block hover:text-white transition-colors">Мои заказы</Link>
              <Link href="/support" className="block hover:text-white transition-colors">Поддержка</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Поставщикам</h4>
            <div className="space-y-2 text-sm">
              <Link href="/auth" className="block hover:text-white transition-colors">Стать поставщиком</Link>
              <Link href="/dashboard" className="block hover:text-white transition-colors">Панель управления</Link>
              <Link href="/dashboard/products" className="block hover:text-white transition-colors">Мои товары</Link>
              <Link href="/dashboard/orders" className="block hover:text-white transition-colors">Заказы</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Компания</h4>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block hover:text-white transition-colors">О платформе</Link>
              <Link href="/terms" className="block hover:text-white transition-colors">Условия использования</Link>
              <Link href="/auth" className="block hover:text-white transition-colors">Вход / Регистрация</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} MarketKG. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
