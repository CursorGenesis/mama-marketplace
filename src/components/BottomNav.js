'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Home, Search, ShoppingCart, ClipboardList, UserCircle } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { lang } = useLang();
  const { user } = useAuth();
  const isRu = lang === 'ru';

  if (pathname === '/map') return null;

  const profileHref = user ? '/my' : '/auth';
  const isProfile = pathname === '/my' || pathname === '/auth' || pathname?.startsWith('/dashboard') || pathname?.startsWith('/agent') || pathname?.startsWith('/admin');

  const tabs = [
    { href: '/', icon: Home, label: isRu ? 'Главная' : 'Башкы', active: pathname === '/' },
    { href: '/catalog', icon: Search, label: isRu ? 'Каталог' : 'Каталог', active: pathname === '/catalog' || pathname?.startsWith('/catalog/') },
    { href: '/cart', icon: ShoppingCart, label: isRu ? 'Корзина' : 'Себет', active: pathname === '/cart', badge: totalItems },
    { href: '/orders', icon: ClipboardList, label: isRu ? 'Заказы' : 'Заказдар', active: pathname === '/orders' },
    { href: profileHref, icon: UserCircle, label: isRu ? 'Профиль' : 'Профиль', active: isProfile },
  ];

  return (
    <>
      {/* Нижняя навигация */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 md:hidden safe-bottom">
        <div className="flex items-center justify-around h-14">
          {tabs.map(tab => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-0.5 w-full h-full relative ${
                tab.active ? 'text-slate-800' : 'text-gray-400'
              }`}
            >
              <tab.icon size={22} strokeWidth={tab.active ? 2.5 : 1.5} />
              {tab.badge > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge > 99 ? '99' : tab.badge}
                </span>
              )}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Отступ снизу чтобы контент не прятался за навигацией */}
      <div className="h-14 md:hidden" />
    </>
  );
}
