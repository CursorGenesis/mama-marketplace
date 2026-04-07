'use client';
import Link from 'next/link';
import { MapPin, Star, MessageCircle, Share2 } from 'lucide-react';
import { useLang } from '@/context/LangContext';
import toast from 'react-hot-toast';

export default function SupplierCard({ supplier }) {
  const { t, lang } = useLang();
  const whatsappLink = supplier.whatsapp
    ? `https://wa.me/${supplier.whatsapp.replace(/[^0-9]/g, '')}`
    : null;

  const telegramLink = supplier.telegram
    ? `https://t.me/${supplier.telegram.replace('@', '')}`
    : null;

  return (
    <div className="bg-white rounded-xl p-5 md:p-8 shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <Link href={`/supplier/${supplier.id}`}>
        <h3 className="font-bold text-lg md:text-2xl md:font-extrabold text-gray-800 mb-2 hover:text-slate-700 transition-colors flex items-center gap-2">
          {supplier.name}
          {supplier.verified && (
            <span className="inline-flex items-center gap-0.5 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full" title={t('moreDetails')}>
              ✅ {lang === 'kg' ? 'Текшерилген' : 'Проверенный'}
            </span>
          )}
        </h3>
      </Link>

      <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
        <MapPin size={14} />
        <span>{supplier.city || t('notSpecified')}</span>
      </div>

      {/* Рейтинг */}
      <div className="flex items-center gap-1 mb-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={16}
            className={i <= Math.round(supplier.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
          />
        ))}
        <span className="text-sm md:text-base text-gray-500 ml-1">
          {supplier.rating || 0} ({supplier.reviewCount || 0})
        </span>
      </div>

      <p className="text-sm md:text-base text-gray-600 line-clamp-2 mb-3 md:leading-relaxed">
        {(lang === 'kg' && supplier.descriptionKg) ? supplier.descriptionKg : (supplier.description || t('descNotSpecified'))}
      </p>

      {/* Минимальный заказ */}
      {supplier.minOrder && (
        <div className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">{t('minOrder')}:</span>{' '}
          {t('minOrderFrom')} {supplier.minOrder.toLocaleString('ru-RU')} {supplier.minOrderUnit || 'сом'}
        </div>
      )}

      {/* Кнопки связи */}
      <div className="flex gap-2">
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 bg-green-50 text-green-600 rounded-lg text-sm md:text-base font-medium hover:bg-green-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        )}
        {telegramLink && (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 md:px-4 md:py-2 bg-blue-50 text-blue-600 rounded-lg text-sm md:text-base font-medium hover:bg-blue-100 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={14} /> Telegram
          </a>
        )}
        <Link
          href={`/supplier/${supplier.id}`}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors ml-auto"
        >
          {t('moreDetails')}
        </Link>
      </div>
    </div>
  );
}
