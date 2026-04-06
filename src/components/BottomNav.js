'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { Home, Search, ShoppingCart, UserCircle, Menu, Share2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const { lang } = useLang();
  const [showMore, setShowMore] = useState(false);
  const isRu = lang === 'ru';

  // Не показывать на страницах чата и карты (мешает)
  if (pathname === '/support' || pathname === '/map') return null;

  const tabs = [
    { href: '/', icon: Home, label: isRu ? 'Главная' : 'Башкы', active: pathname === '/' },
    { href: '/catalog', icon: Search, label: isRu ? 'Каталог' : 'Каталог', active: pathname === '/catalog' || pathname.startsWith('/catalog/') },
    { href: '/cart', icon: ShoppingCart, label: isRu ? 'Корзина' : 'Себет', active: pathname === '/cart', badge: totalItems },
    { href: '/my', icon: UserCircle, label: isRu ? 'Кабинет' : 'Кабинет', active: pathname === '/my' || pathname === '/orders' },
  ];

  const moreLinks = [
    { href: '/about', label: isRu ? 'О платформе' : 'Платформа' },
    { href: '/support', label: isRu ? 'Поддержка' : 'Колдоо' },
    { href: '/notifications', label: isRu ? 'Уведомления' : 'Билдирүүлөр' },
    { href: '/referral', label: isRu ? 'Пригласить поставщика' : 'Жеткирүүчү чакыруу' },
    { href: '/feedback', label: isRu ? 'Обратная связь' : 'Кайтарым байланыш' },
  ];

  return (
    <>
      {/* Меню "Ещё" */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-4 space-y-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

            {/* Поделиться ссылкой */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const url = window.location.origin;
                if (navigator.share) {
                  navigator.share({ title: 'MarketKG', text: isRu ? 'Смотри MarketKG — B2B маркетплейс поставщиков в Кыргызстане' : 'MarketKG — Кыргызстандагы жеткирүүчүлөр маркетплейси', url });
                } else {
                  navigator.clipboard.writeText(url);
                  toast.success(isRu ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
                }
                setShowMore(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-800 hover:bg-slate-50 rounded-xl text-sm font-semibold"
            >
              <Share2 size={18} /> {isRu ? 'Поделиться ссылкой' : 'Шилтеме менен бөлүшүү'}
            </button>

            <div className="border-t border-gray-100 my-1" />

            {moreLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setShowMore(false)}
                className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

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
          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full ${
              showMore ? 'text-slate-800' : 'text-gray-400'
            }`}
          >
            <Menu size={22} strokeWidth={showMore ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium">{isRu ? 'Ещё' : 'Дагы'}</span>
          </button>
        </div>
      </nav>

      {/* Отступ снизу чтобы контент не прятался за навигацией */}
      <div className="h-14 md:hidden" />
    </>
  );
}
