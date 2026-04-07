'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadImage, CATEGORIES } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Plus, Pencil, Trash2, Save, X, Sparkles, Image } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function SupplierProductsPage() {
  const { user, isSupplier } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '', price: '', category: '', description: '', unit: 'шт', imageFile: null, autoImageUrl: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    // Демо-режим: показываем товары без авторизации
    try {
      if (user) {
        const q = query(collection(db, 'suppliers'), where('email', '==', user.email));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const sup = { id: snap.docs[0].id, ...snap.docs[0].data() };
          setSupplier(sup);
          const prods = await getProducts({ supplierId: sup.id });
          setProducts(prods);
          setLoading(false);
          return;
        }
      }
    } catch (e) {}

    // Демо: показать пример
    const { DEMO_PRODUCTS, DEMO_SUPPLIERS } = await import('@/lib/demoData');
    setSupplier(DEMO_SUPPLIERS[0]);
    const prods = DEMO_PRODUCTS.filter(p => p.supplierId === DEMO_SUPPLIERS[0].id);
    setProducts(prods);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: '', price: '', category: '', description: '', unit: 'шт', imageFile: null });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category || '',
      description: product.description || '',
      unit: product.unit || 'шт',
      imageFile: null,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = '';
      if (form.imageFile) {
        imageUrl = await uploadImage(form.imageFile, 'products');
      }

      const productData = {
        name: form.name,
        price: Number(form.price),
        category: form.category,
        description: form.description,
        unit: form.unit,
        supplierId: supplier.id,
        supplierName: supplier.name,
        city: supplier.city,
      };
      if (imageUrl) productData.imageUrl = imageUrl;

      if (editingId) {
        await updateProduct(editingId, productData);
        toast.success('Товар обновлён');
      } else {
        await createProduct(productData);
        toast.success('Товар добавлен');
      }

      resetForm();
      loadData();
    } catch (err) {
      toast.error('Ошибка: ' + err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return;
    await deleteProduct(id);
    toast.success('Товар удалён');
    loadData();
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> Назад в кабинет
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Мои товары ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={18} /> Добавить
        </button>
      </div>

      {/* Форма с подсказками и превью */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          {/* Шапка */}
          <div className="bg-primary-50 px-6 py-4 border-b border-primary-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg text-primary-800">{editingId ? 'Редактировать товар' : '📦 Новый товар'}</h2>
              <p className="text-xs text-primary-600">Заполните все поля по шаблону — карточка будет выглядеть профессионально</p>
            </div>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Левая часть — форма */}
            <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">

              {/* 1. Название */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  1. Название товара <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name}
                  onChange={e => {
                    const name = e.target.value;
                    setForm(prev => ({ ...prev, name }));
                  }}
                  placeholder="Молоко 3.2% 1л" required maxLength={80}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                  <span>💡 Формат: Название + характеристика + объём. Пример: "Рис узгенский 1кг"</span>
                  <span className={form.name.length > 60 ? 'text-orange-500' : ''}>{form.name.length}/80</span>
                </p>
                {form.name && !form.name.match(/\d/) && (
                  <p className="text-xs text-orange-500 mt-1">⚠️ Рекомендуем указать вес или объём (например: 1кг, 0.5л, 200г)</p>
                )}
              </div>

              {/* 2. Категория */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  2. Категория <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c.id} type="button" onClick={() => setForm({...form, category: c.id})}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-center ${
                        form.category === c.id
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}>
                      {c.icon} {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Цена и единица */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  3. Цена и единица измерения <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                      placeholder="75" required min="1" step="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 pr-14" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">сом</span>
                  </div>
                  <div className="flex bg-gray-50 rounded-xl p-1">
                    {['шт', 'кг', 'л', 'уп'].map(u => (
                      <button key={u} type="button" onClick={() => setForm({...form, unit: u})}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          form.unit === u ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">💡 Укажите цену за 1 штуку/кг/литр. Без упаковок — клиент сам выберет количество</p>
              </div>

              {/* 4. Описание */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    4. Описание
                  </label>
                </div>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Описание товара" rows={3} maxLength={300}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <p className="text-xs text-gray-400 mt-1 flex items-center justify-between">
                  <span>Опишите товар для покупателей</span>
                  <span>{form.description.length}/300</span>
                </p>
              </div>

              {/* 5. Фото */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    5. Фото товара
                  </label>
                </div>

                {/* Показать подобранное фото */}
                {form.autoImageUrl && !form.imageFile && (
                  <div className="mb-3 relative">
                    <img src={form.autoImageUrl} alt="auto" className="w-full h-40 object-cover rounded-xl" />
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      ✨ Подобрано автоматически
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, autoImageUrl: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >✕</button>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors">
                  <input type="file" accept="image/*" onChange={e => setForm({...form, imageFile: e.target.files[0]})}
                    className="w-full" id="product-image" />
                  {!form.imageFile && (
                    <div className="text-gray-400 text-sm mt-2">
                      <p>📸 Рекомендации для фото:</p>
                      <p className="text-xs mt-1">• Белый или светлый фон</p>
                      <p className="text-xs">• Товар в центре, хорошее освещение</p>
                      <p className="text-xs">• Квадратный формат (1:1)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопка */}
              <button type="submit" disabled={submitting || !form.name || !form.price || !form.category}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={18} /> {submitting ? 'Сохранение...' : editingId ? 'Сохранить изменения' : 'Добавить товар'}
              </button>

              {/* Чеклист заполнения */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Чеклист карточки:</p>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className={form.name ? 'text-green-600' : 'text-gray-400'}>
                    {form.name ? '✅' : '⬜'} Название
                  </span>
                  <span className={form.category ? 'text-green-600' : 'text-gray-400'}>
                    {form.category ? '✅' : '⬜'} Категория
                  </span>
                  <span className={form.price ? 'text-green-600' : 'text-gray-400'}>
                    {form.price ? '✅' : '⬜'} Цена
                  </span>
                  <span className={form.description ? 'text-green-600' : 'text-gray-400'}>
                    {form.description ? '✅' : '⬜'} Описание
                  </span>
                  <span className={form.name.match(/\d/) ? 'text-green-600' : 'text-gray-400'}>
                    {form.name.match(/\d/) ? '✅' : '⬜'} Вес/объём в названии
                  </span>
                  <span className={form.imageFile ? 'text-green-600' : 'text-gray-400'}>
                    {form.imageFile ? '✅' : '⬜'} Фото
                  </span>
                </div>
              </div>
            </form>

            {/* Правая часть — превью карточки */}
            <div className="lg:w-72 bg-gray-50 p-6 border-t lg:border-t-0 lg:border-l border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-3 text-center">👁 Превью карточки</p>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-[220px] mx-auto">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {form.imageFile ? (
                    <img src={URL.createObjectURL(form.imageFile)} alt="preview" className="w-full h-full object-cover" />
                  ) : form.autoImageUrl ? (
                    <img src={form.autoImageUrl} alt="auto" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-gray-300">📦</span>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-1">
                    {form.name || 'Название товара'}
                  </h4>
                  <p className="text-xs text-gray-400 mb-1">{supplier?.name || 'Ваша компания'}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary-600 font-bold">
                      {form.price ? `${Number(form.price).toLocaleString('ru-RU')} сом` : '— сом'}
                    </span>
                    <span className="text-xs text-gray-400">/ {form.unit}</span>
                  </div>
                  <div className="mt-2 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-xs font-medium text-center">
                    В корзину
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">Так карточка будет выглядеть в каталоге</p>
            </div>
          </div>
        </div>
      )}

      {/* Список товаров */}
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p.name}</h3>
                <p className="text-primary-600 font-bold">{Number(p.price).toLocaleString('ru-RU')} сом / {p.unit || 'шт'}</p>
                <p className="text-xs text-gray-400">{CATEGORIES.find(c => c.id === p.category)?.name || ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Товаров пока нет</p>
          <p>Нажмите "Добавить" чтобы создать первый товар</p>
        </div>
      )}
    </div>
  );
}
