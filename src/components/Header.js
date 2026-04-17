'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLang } from '@/context/LangContext';
import { ShoppingCart, Menu, X, User, MapPin, Shield, Bell, BarChart3, UserCircle, HeadphonesIcon, Search, Building2, Package, ClipboardList, DollarSign, LogOut, ChevronDown, Award, Truck, Users } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isCatalog = pathname === '/catalog' || pathname?.startsWith('/catalog');
  const hideSearch = pathname === '/my' || pathname === '/auth' || pathname?.startsWith('/dashboard') || pathname?.startsWith('/agent') || pathname?.startsWith('/admin');
  const { user, profile, isAdmin, isSupplier, logout } = useAuth();
  const isAgent = profile?.role === 'agent';
  const isDriver = profile?.role === 'driver';
  const { totalItems } = useCart();
  const { lang, switchLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `${window.location.origin}${'/mama-marketplace'}/catalog?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Информационная полоса */}
      <div className="bg-slate-900 text-white/80 text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between">
          <span>{lang === 'kg' ? 'Кыргызстан боюнча жеткирүү' : 'Доставка по всему Кыргызстану'}</span>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-white transition-colors">{lang === 'kg' ? 'Биз жөнүндө' : 'О нас'}</Link>
            <Link href="/about" className="hover:text-white transition-colors">{lang === 'kg' ? 'Жардам' : 'Помощь'}</Link>
          </div>
        </div>
      </div>
      {/* Верхняя панель */}
      <div className="bg-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-14 md:h-16 gap-3">
            {/* Лого */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-slate-800 font-black text-sm">M</span>
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">MarketKG</span>
            </Link>

            {/* Каталог */}
            <Link href="/catalog" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
              <Menu size={18} />{lang === 'kg' ? 'Каталог' : 'Каталог'}
            </Link>

            {/* Поиск */}
            {hideSearch ? null : isCatalog ? (
              /* На каталоге — компактный поиск только на десктопе */
              <div className="hidden md:block flex-1 max-w-md">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={lang === 'kg' ? 'Ылдам издөө...' : 'Быстрый поиск...'}
                    className="w-full px-4 py-2 rounded-lg text-sm bg-white/10 text-white placeholder-white/50 focus:outline-none focus:bg-white/20"
                  />
                  <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                    <Search size={16} />
                  </button>
                </form>
              </div>
            ) : (
              /* На остальных — полный поиск */
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl min-w-0">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={lang === 'kg' ? 'Издөө...' : 'Искать...'}
                    className="w-full pl-3 pr-10 py-2 md:pl-4 md:pr-12 md:py-3 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                  <button type="submit" className="absolute right-1 top-1 bottom-1 px-2 md:px-5 bg-slate-700 hover:bg-slate-600 rounded-md text-white flex items-center transition-colors">
                    <Search size={18} />
                  </button>
                </div>
              </form>
            )}

            {/* Правая часть */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Язык */}
              <button
                onClick={() => switchLang(lang === 'ru' ? 'kg' : 'ru')}
                className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold text-white transition-colors"
              >
                <img
                  src={lang === 'ru' ? 'https://flagcdn.com/w20/ru.png' : 'https://flagcdn.com/w20/kg.png'}
                  alt={lang === 'ru' ? 'RU' : 'KG'}
                  className="w-4 h-3 rounded-sm"
                />
                {lang === 'ru' ? 'RU' : 'KG'}
              </button>

              {/* Уведомления */}
              <Link href="/notifications" className="relative p-2 text-white/80 hover:text-white transition-colors hidden sm:block">
                <Bell size={20} />
                {/* TODO: подключить реальный счётчик уведомлений */}
              </Link>

              {/* Корзина — скрыта на мобильном (есть в нижней навигации) */}
              <Link href="/cart" className="relative p-2 text-white/80 hover:text-white transition-colors hidden sm:block">
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{totalItems}</span>
                )}
              </Link>

              {/* Профиль */}
              {(
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(profile?.name || user?.email || 'D').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white font-medium hidden md:block max-w-[120px] truncate">{profile?.name || user?.email || (lang === 'kg' ? 'Профиль' : 'Профиль')}</span>
                    <ChevronDown size={14} className={`text-white/60 transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50">
                        {/* Имя и роль */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-bold text-gray-800 text-sm">{profile?.name || user?.email || (lang === 'kg' ? 'Демо колдонуучу' : 'Демо пользователь')}</p>
                          <p className="text-xs text-gray-400">
                            {isAdmin ? (lang === 'kg' ? 'Администратор' : 'Администратор') : isSupplier ? (lang === 'kg' ? 'Жеткирүүчү' : 'Поставщик') : isAgent ? (lang === 'kg' ? 'Агент' : 'Агент') : isDriver ? (lang === 'kg' ? 'Экспедитор' : 'Экспедитор') : (lang === 'kg' ? 'Сатып алуучу' : 'Покупатель')}
                          </p>
                        </div>

                        {/* Ссылки для клиента */}
                        {(!isAdmin && !isSupplier && !isAgent && !isDriver || !user) && (
                          <>
                            <Link href="/my" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <UserCircle size={18} className="text-gray-400" /> {lang === 'kg' ? 'Менин кабинетим' : 'Мой кабинет'}
                            </Link>
                            <Link href="/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <ClipboardList size={18} className="text-gray-400" /> {lang === 'kg' ? 'Буйрутмаларым' : 'Мои заказы'}
                            </Link>
                            <Link href="/notifications" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Bell size={18} className="text-gray-400" /> {t('notifications')}
                            </Link>
                          </>
                        )}

                        {/* Ссылки для поставщика */}
                        {isSupplier && (
                          <>
                            <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <BarChart3 size={18} className="text-gray-400" /> {lang === 'kg' ? 'Жеткирүүчү кабинети' : 'Кабинет поставщика'}
                            </Link>
                            <Link href="/dashboard/products" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Package size={18} className="text-gray-400" /> {lang === 'kg' ? 'Менин товарларым' : 'Мои товары'}
                            </Link>
                            <Link href="/dashboard/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <ClipboardList size={18} className="text-gray-400" /> {lang === 'kg' ? 'Заказдар тарыхы' : 'История заказов'}
                            </Link>
                            <Link href="/pricing" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <DollarSign size={18} className="text-gray-400" /> {lang === 'kg' ? 'Тарифтер' : 'Тарифы'}
                            </Link>
                          </>
                        )}

                        {/* Ссылки для агента */}
                        {isAgent && (
                          <>
                            <Link href="/agent/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Users size={18} className="text-green-400" /> {lang === 'kg' ? 'Агент кабинети' : 'Кабинет агента'}
                            </Link>
                            <Link href="/agent/order" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <ClipboardList size={18} className="text-green-400" /> {lang === 'kg' ? 'Заказ түзүү' : 'Создать заказ'}
                            </Link>
                            <Link href="/agent/shops" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Building2 size={18} className="text-green-400" /> {lang === 'kg' ? 'Менин дүкөндөрүм' : 'Мои магазины'}
                            </Link>
                          </>
                        )}

                        {/* Ссылки для экспедитора */}
                        {isDriver && (
                          <>
                            <Link href="/driver/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Truck size={18} className="text-cyan-400" /> {lang === 'kg' ? 'Менин жеткирүүлөрүм' : 'Мои доставки'}
                            </Link>
                          </>
                        )}

                        {/* Ссылки для админа */}
                        {isAdmin && (
                          <>
                            <Link href="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Shield size={18} className="text-orange-400" /> {lang === 'kg' ? 'Админ панель' : 'Админ-панель'}
                            </Link>
                            <Link href="/admin/analytics" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <BarChart3 size={18} className="text-purple-400" /> {lang === 'kg' ? 'Аналитика' : 'Аналитика'}
                            </Link>
                            <Link href="/admin/commissions" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <DollarSign size={18} className="text-green-400" /> {lang === 'kg' ? 'Комиссиялар' : 'Комиссии'}
                            </Link>
                            <Link href="/admin/badges" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                              <Award size={18} className="text-amber-400" /> {lang === 'kg' ? 'Бейджилер' : 'Бейджи'}
                            </Link>
                          </>
                        )}

                        {/* Выйти */}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button onClick={() => { logout(); setProfileOpen(false); window.location.href = '/mama-marketplace/'; }}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                            <LogOut size={18} /> {t('logout')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>


    </header>
  );
}
