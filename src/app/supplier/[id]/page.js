'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSupplier, getProducts, addReview } from '@/lib/firestore';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import ProductCard from '@/components/ProductCard';
import RatingStars from '@/components/RatingStars';
import MapView from '@/components/MapView';
import { MapPin, Phone, Mail, MessageCircle, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplierPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getSupplier(id),
      getProducts({ supplierId: id }),
    ]).then(([s, p]) => {
      setSupplier(s);
      setProducts(p);
      setLoading(false);
    });
  }, [id]);

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Войдите, чтобы оставить отзыв'); return; }
    if (reviewRating === 0) { toast.error('Поставьте оценку'); return; }

    await addReview(id, {
      userId: user.uid,
      userName: user.email,
      rating: reviewRating,
      text: reviewText,
    });
    toast.success('Отзыв добавлен');
    setReviewRating(0);
    setReviewText('');
    // Обновляем данные
    const s = await getSupplier(id);
    setSupplier(s);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  if (!supplier) return <div className="text-center py-20 text-gray-400">Поставщик не найден</div>;

  const whatsappLink = supplier.whatsapp
    ? `https://wa.me/${supplier.whatsapp.replace(/[^0-9]/g, '')}`
    : null;
  const telegramLink = supplier.telegram
    ? `https://t.me/${supplier.telegram.replace('@', '')}`
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/catalog?tab=suppliers" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> Назад к поставщикам
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная информация */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h1 className="text-2xl font-bold mb-3">{supplier.name}</h1>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin size={16} /> {supplier.city || 'Не указан'}
              </div>
              <div className="flex items-center gap-2">
                <RatingStars value={Math.round(supplier.rating || 0)} />
                <span className="text-sm text-gray-500">
                  {supplier.rating || 0} ({supplier.reviewCount || 0} отзывов)
                </span>
              </div>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              {(lang === 'kg' && supplier.descriptionKg) ? supplier.descriptionKg : (supplier.description || t('descNotSpecified'))}
            </p>

            {/* Минимальный заказ */}
            {supplier.minOrder && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm mb-6">
                <span className="font-semibold text-amber-800">Мин. заказ:</span>
                <span className="text-amber-700">от {supplier.minOrder.toLocaleString('ru-RU')} {supplier.minOrderUnit || 'сом'}</span>
              </div>
            )}

            {/* Контакты */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {supplier.phone && (
                <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Phone size={18} className="text-primary-600" />
                  <span>{supplier.phone}</span>
                </a>
              )}
              {supplier.email && (
                <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Mail size={18} className="text-primary-600" />
                  <span>{supplier.email}</span>
                </a>
              )}
            </div>

            {/* Кнопки мессенджеров */}
            <div className="flex gap-3 flex-wrap">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium">
                  <MessageCircle size={18} /> Написать в WhatsApp
                </a>
              )}
              {telegramLink && (
                <a href={telegramLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium">
                  <MessageCircle size={18} /> Написать в Telegram
                </a>
              )}
            </div>
          </div>

          {/* Товары поставщика */}
          <h2 className="text-xl font-bold mb-4">Товары ({products.length})</h2>
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white rounded-xl">Товары пока не добавлены</div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Карта */}
          {supplier.lat && supplier.lng && (
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold mb-3">Местоположение</h3>
              <div className="h-48 rounded-lg overflow-hidden">
                <MapView
                  suppliers={[supplier]}
                  center={[supplier.lat, supplier.lng]}
                  zoom={14}
                />
              </div>
              {supplier.address && (
                <p className="text-sm text-gray-500 mt-2">{supplier.address}</p>
              )}
            </div>
          )}

          {/* Форма отзыва */}
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3">Оставить отзыв</h3>
            <form onSubmit={handleReview}>
              <div className="mb-3">
                <RatingStars value={reviewRating} onChange={setReviewRating} size={24} />
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Ваш отзыв..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
              <button type="submit"
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
