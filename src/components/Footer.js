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
          <button
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.origin : '';
              const text = isRu
                ? 'MarketKG — B2B маркетплейс поставщиков Кыргызстана. Находите поставщиков, сравнивайте цены, заказывайте оптом!'
                : 'MarketKG — Кыргызстандын B2B жеткирүүчүлөр маркетплейси. Жеткирүүчүлөрдү табыңыз, бааларды салыштырыңыз!';
              if (navigator.share) {
                navigator.share({ title: 'MarketKG', text, url });
              } else {
                navigator.clipboard.writeText(`${text}\n${url}`);
                toast.success(isRu ? 'Ссылка скопирована!' : 'Шилтеме көчүрүлдү!');
              }
            }}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
          >
            <Share2 size={14} />
            {isRu ? 'Поделиться платформой' : 'Платформаны бөлүшүү'}
          </button>
        </div>
      </div>
    </footer>
  );
}
