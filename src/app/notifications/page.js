'use client';
import { useLang } from '@/context/LangContext';
import { useState } from 'react';
import { Package, Tag, Bell, Check } from 'lucide-react';

const demoNotificationsData = {
  ru: [
    { id: 1, type: 'order', title: 'Заказ доставлен', message: 'Ваш заказ от Шоро успешно доставлен', date: new Date('2026-03-30'), read: false },
    { id: 2, type: 'promo', title: 'Новая акция!', message: 'Скидка 15% на все напитки Шоро до конца месяца', date: new Date('2026-03-29'), read: false },
    { id: 3, type: 'order', title: 'Заказ в обработке', message: 'Ваш заказ от Бишкек Сүт принят в обработку', date: new Date('2026-03-28'), read: true },
    { id: 4, type: 'system', title: 'Добро пожаловать!', message: 'Добро пожаловать в MarketKG! Начните с каталога товаров', date: new Date('2026-03-20'), read: true },
  ],
  kg: [
    { id: 1, type: 'order', title: 'Буйрутма жеткирилди', message: 'Шоро буйрутмаңыз ийгиликтүү жеткирилди', date: new Date('2026-03-30'), read: false },
    { id: 2, type: 'promo', title: 'Жаңы акция!', message: 'Шоро суусундуктарына 15% арзандатуу ай аягына чейин', date: new Date('2026-03-29'), read: false },
    { id: 3, type: 'order', title: 'Буйрутма иштелүүдө', message: 'Бишкек Сүт буйрутмаңыз кабыл алынды', date: new Date('2026-03-28'), read: true },
    { id: 4, type: 'system', title: 'Кош келиңиз!', message: 'MarketKG ге кош келиңиз! Каталогдон баштаңыз', date: new Date('2026-03-20'), read: true },
  ],
};

const typeConfig = {
  order: { icon: Package, color: 'bg-blue-50 text-blue-600', label: 'notif_order' },
  promo: { icon: Tag, color: 'bg-orange-50 text-orange-600', label: 'notif_promo' },
  system: { icon: Bell, color: 'bg-gray-100 text-gray-600', label: 'notif_system' },
};

export default function NotificationsPage() {
  const { t, lang } = useLang();
  const [notifications, setNotifications] = useState(demoNotificationsData[lang] || demoNotificationsData.ru);

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  if (notifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Bell size={64} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-2xl font-bold text-gray-600">{t('notif_empty')}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('notifications')}</h1>
        {unreadCount > 0 && (
          <span className="text-sm text-gray-500">
            {unreadCount} {t('notifications').toLowerCase()}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map(notif => {
          const config = typeConfig[notif.type] || typeConfig.system;
          const Icon = config.icon;

          return (
            <div
              key={notif.id}
              onClick={() => !notif.read && markAsRead(notif.id)}
              className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 transition-colors cursor-pointer hover:bg-gray-50 ${
                !notif.read ? 'border-l-4 border-primary-500' : ''
              }`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold text-sm ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-gray-400">{formatDate(notif.date)}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-gray-400">{t(config.label)}</span>
                </div>
              </div>

              {/* Read indicator */}
              {notif.read && (
                <div className="flex-shrink-0 mt-1">
                  <Check size={16} className="text-gray-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
