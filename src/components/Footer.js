'use client';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const { t, lang } = useLang();
  const isRu = lang === 'ru';

  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-bold text-lg mb-3">MarketKG</h3>
            <p className="text-sm leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <p>{isRu ? 'Бишкек, Кыргызстан' : 'Бишкек, Кыргызстан'}</p>
              <p>info@marketkg.com</p>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isRu ? 'Покупателям' : 'Сатып алуучуларга'}</h4>
            <div className="space-y-2 text-sm">
              <Link href="/catalog" className="block hover:text-white transition-colors">{t('catalog')}</Link>
              <Link href="/map" className="block hover:text-white transition-colors">{t('suppliersMap')}</Link>
              <Link href="/orders" className="block hover:text-white transition-colors">{t('my_orders')}</Link>
              <Link href="/raffle" className="block hover:text-yellow-400 transition-colors">🪙 {isRu ? 'Розыгрыш призов' : 'Сыйлык розыгрышы'}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isRu ? 'Поставщикам' : 'Жеткирүүчүлөргө'}</h4>
            <div className="space-y-2 text-sm">
              <Link href="/pricing" className="block hover:text-white transition-colors">{isRu ? 'Тарифы' : 'Тарифтер'}</Link>
              <Link href="/auth" className="block hover:text-white transition-colors">{t('becomeSupplier')}</Link>
              <Link href="/dashboard" className="block hover:text-white transition-colors">{isRu ? 'Панель управления' : 'Башкаруу панели'}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isRu ? 'Агентам' : 'Агенттерге'}</h4>
            <div className="space-y-2 text-sm">
              <Link href="/agents" className="block hover:text-white transition-colors">{isRu ? 'Стать агентом' : 'Агент болуу'}</Link>
              <Link href="/agent/dashboard" className="block hover:text-white transition-colors">{isRu ? 'Кабинет агента' : 'Агент кабинети'}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isRu ? 'Компания' : 'Компания'}</h4>
            <div className="space-y-2 text-sm">
              <Link href="/about" className="block hover:text-white transition-colors">{isRu ? 'О платформе' : 'Платформа жөнүндө'}</Link>
              <Link href="/terms" className="block hover:text-white transition-colors">{isRu ? 'Пользовательское соглашение' : 'Колдонуучу келишими'}</Link>
              <Link href="/privacy" className="block hover:text-white transition-colors">{isRu ? 'Конфиденциальность' : 'Купуялык'}</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-xs text-gray-500 text-center mb-3 max-w-2xl mx-auto leading-relaxed">
            {isRu
              ? 'Платформа не является продавцом товаров. Все сделки заключаются напрямую между Покупателем и Поставщиком. Поставщики несут ответственность за наличие лицензий и соблюдение законодательства КР.'
              : 'Платформа товарларды сатуучу эмес. Бардык бүтүмдөр Сатып алуучу менен Жеткирүүчүнүн ортосунда түздөн-түз түзүлөт. Жеткирүүчүлөр лицензиялар жана КР мыйзамдарын сактоо үчүн жоопкерчилик тартышат.'}
          </p>
          <span>&copy; {new Date().getFullYear()} MarketKG. {t('allRights')}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const url = 'https://cursorgenesis.github.io/mama-marketplace/';
                const text = isRu
                  ? `MarketKG — B2B маркетплейс поставщиков Кыргызстана. Находите поставщиков, сравнивайте цены, заказывайте оптом!\n\n${url}`
                  : `MarketKG — Кыргызстандын B2B жеткирүүчүлөр маркетплейси.\n\n${url}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button
              onClick={() => {
                const url = 'https://cursorgenesis.github.io/mama-marketplace/';
                const text = isRu ? 'MarketKG — B2B маркетплейс поставщиков Кыргызстана!' : 'MarketKG — Кыргызстандын B2B маркетплейси!';
                window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
              }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
            <button
              onClick={() => {
                const url = 'https://cursorgenesis.github.io/mama-marketplace/';
                const text = isRu
                  ? `MarketKG — B2B маркетплейс поставщиков Кыргызстана.\n${url}`
                  : `MarketKG — Кыргызстандын B2B маркетплейси.\n${url}`;
                navigator.clipboard.writeText(text);
                toast.success(isRu ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
              }}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
            >
              <Share2 size={14} />
              {isRu ? 'Копировать' : 'Көчүрүү'}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
