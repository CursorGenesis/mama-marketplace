'use client';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import Link from 'next/link';
import {
  User, ShoppingBag, Settings, LogOut, ChevronRight,
  Store, Package, TrendingUp, Users, Award, MapPin, FileText,
  HelpCircle, MessageCircle, DollarSign, Truck, ClipboardList, Send
} from 'lucide-react';

export default function MyPage() {
  const { user, profile, isAdmin, isSupplier, logout } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const isAgent = profile?.role === 'agent';
  const isDriver = profile?.role === 'driver';

  // Не авторизован
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={40} className="text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{isRu ? 'Войдите в аккаунт' : 'Аккаунтка кириңиз'}</h2>
        <p className="text-gray-500 text-sm mb-6">{isRu ? 'Чтобы видеть заказы, избранное и управлять профилем' : 'Заказдарды, тандалмаларды көрүү жана профилди башкаруу үчүн'}</p>
        <Link href="/auth" className="inline-block px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors">
          {isRu ? 'Войти / Зарегистрироваться' : 'Кирүү / Катталуу'}
        </Link>
      </div>
    );
  }

  // Меню для покупателя
  const buyerLinks = [
    { href: '/orders', icon: ClipboardList, label: isRu ? 'Мои заказы' : 'Менин заказдарым', color: 'text-blue-600 bg-blue-50' },
    { href: '/raffle', icon: Award, label: isRu ? 'Розыгрыш призов' : 'Сыйлык розыгрышы', color: 'text-amber-600 bg-amber-50', extra: profile?.coins ? `${profile.coins} 🪙` : null },
    { href: '/notifications', icon: MessageCircle, label: isRu ? 'Уведомления' : 'Билдирүүлөр', color: 'text-purple-600 bg-purple-50' },
    {
      href: '/my/telegram',
      icon: Send,
      label: isRu ? 'Telegram-уведомления' : 'Telegram билдирүүлөрү',
      color: profile?.telegramChatId ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50',
      extra: profile?.telegramChatId ? '✓' : null,
    },
  ];

  // Меню для поставщика
  const supplierLinks = [
    { href: '/dashboard', icon: Store, label: isRu ? 'Кабинет поставщика' : 'Жеткирүүчү кабинети', color: 'text-slate-700 bg-slate-100' },
    { href: '/dashboard/products', icon: Package, label: isRu ? 'Мои товары' : 'Менин товарларым', color: 'text-blue-600 bg-blue-50' },
    { href: '/dashboard/orders', icon: ClipboardList, label: isRu ? 'История заказов' : 'Заказдар тарыхы', color: 'text-orange-600 bg-orange-50' },
    { href: '/pricing', icon: DollarSign, label: isRu ? 'Тарифы' : 'Тарифтер', color: 'text-emerald-600 bg-emerald-50' },
  ];

  // Меню для агента
  const agentLinks = [
    { href: '/agent/dashboard', icon: Users, label: isRu ? 'Кабинет агента' : 'Агент кабинети', color: 'text-green-700 bg-green-100' },
  ];

  // Меню для водителя
  const driverLinks = [
    { href: '/driver/dashboard', icon: Truck, label: isRu ? 'Кабинет водителя' : 'Айдоочу кабинети', color: 'text-indigo-700 bg-indigo-100' },
  ];

  // Меню для админа
  const adminLinks = [
    { href: '/admin', icon: Settings, label: isRu ? 'Админ-панель' : 'Админ панели', color: 'text-red-700 bg-red-100' },
  ];

  // Общие ссылки
  const generalLinks = [
    { href: '/about', icon: HelpCircle, label: isRu ? 'О платформе' : 'Платформа жөнүндө', color: 'text-gray-600 bg-gray-50' },
    { href: '/terms', icon: FileText, label: isRu ? 'Соглашение' : 'Келишим', color: 'text-gray-600 bg-gray-50' },
  ];

  const renderLinks = (links, title) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {title && <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</h3></div>}
      {links.map((link, i) => (
        <Link key={link.href} href={link.href}
          className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors ${i < links.length - 1 ? 'border-b border-gray-50' : ''}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${link.color}`}>
            <link.icon size={20} />
          </div>
          <span className="flex-1 text-sm font-medium text-gray-800">{link.label}</span>
          {link.extra && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">{link.extra}</span>}
          <ChevronRight size={16} className="text-gray-300" />
        </Link>
      ))}
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* Профиль */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800 truncate">{profile?.name || user.email}</h2>
            {profile?.shopName && <p className="text-sm text-gray-500 truncate">{profile.shopName}</p>}
            <p className="text-xs text-gray-400">{profile?.phone || user.email}</p>
          </div>
          {profile?.coinStatus && !isSupplier && !isAgent && !isDriver && !isAdmin && (
            <div className="text-center shrink-0">
              <div className="text-2xl">{profile.coinStatus === 'gold' ? '👑' : profile.coinStatus === 'silver' ? '🥈' : '🥉'}</div>
              <div className="text-[10px] text-gray-400 font-medium">{profile.coins || 0} 🪙</div>
            </div>
          )}
        </div>
      </div>

      {/* Роль-специфичные разделы */}
      {isAdmin && renderLinks(adminLinks, isRu ? 'Администрирование' : 'Башкаруу')}
      {isSupplier && renderLinks(supplierLinks, isRu ? 'Поставщик' : 'Жеткирүүчү')}
      {isAgent && renderLinks(agentLinks, isRu ? 'Агент' : 'Агент')}
      {isDriver && renderLinks(driverLinks, isRu ? 'Водитель' : 'Айдоочу')}

      {/* Основные разделы (только для покупателей) */}
      {!isSupplier && !isAgent && !isDriver && !isAdmin && renderLinks(buyerLinks, isRu ? 'Покупки' : 'Сатып алуулар')}

      {/* Общее */}
      {renderLinks(generalLinks, isRu ? 'Информация' : 'Маалымат')}

      {/* Выход */}
      <button onClick={() => { logout(); window.location.href = '/mama-marketplace/'; }}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl shadow-sm text-red-500 hover:bg-red-50 transition-colors font-medium">
        <LogOut size={18} />
        {isRu ? 'Выйти из аккаунта' : 'Аккаунттан чыгуу'}
      </button>
    </div>
  );
}
