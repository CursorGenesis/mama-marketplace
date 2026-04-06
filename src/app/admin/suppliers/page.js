'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSuppliers, createSupplier, updateSupplier, CITIES, CATEGORIES } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminSuppliersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    name: '', email: '', phone: '', whatsapp: '', telegram: '',
    city: '', address: '', description: '', categories: [],
    lat: '', lng: '',
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.push('/'); return; }
    loadData();
  }, [isAdmin, authLoading]);

  const loadData = async () => {
    const sups = await getSuppliers();
    setSuppliers(sups);
    setLoading(false);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name || '', email: s.email || '', phone: s.phone || '',
      whatsapp: s.whatsapp || '', telegram: s.telegram || '',
      city: s.city || '', address: s.address || '',
      description: s.description || '', categories: s.categories || [],
      lat: s.lat || '', lng: s.lng || '',
    });
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleCitySelect = (cityName) => {
    const city = CITIES.find(c => c.name === cityName);
    setForm({
      ...form,
      city: cityName,
      lat: city ? city.lat : form.lat,
      lng: city ? city.lng : form.lng,
    });
  };

  const toggleCategory = (catId) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        ...form,
        lat: form.lat ? Number(form.lat) : null,
        lng: form.lng ? Number(form.lng) : null,
      };

      if (editingId) {
        await updateSupplier(editingId, data);
        toast.success('Поставщик обновлён');
      } else {
        await createSupplier(data);
        toast.success('Поставщик добавлен');
      }
      resetForm();
      loadData();
    } catch (err) {
      toast.error('Ошибка: ' + err.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить поставщика?')) return;
    await deleteDoc(doc(db, 'suppliers', id));
    toast.success('Удалён');
    loadData();
  };

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="flex items-center gap-1 text-primary-600 hover:text-primary-700 mb-6 font-medium">
        <ArrowLeft size={18} /> Назад в админку
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Поставщики ({suppliers.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <Plus size={18} /> Добавить
        </button>
      </div>

      {/* Форма */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">{editingId ? 'Редактировать' : 'Новый поставщик'}</h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                placeholder="Название компании" required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                placeholder="Email (для входа в кабинет)" required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder="Телефон"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
                placeholder="WhatsApp (номер с кодом: 996...)"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input type="text" value={form.telegram} onChange={e => setForm({...form, telegram: e.target.value})}
                placeholder="Telegram (@username)"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <select value={form.city} onChange={e => handleCitySelect(e.target.value)} required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Выберите город</option>
                {CITIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                placeholder="Адрес"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <div className="flex gap-2">
                <input type="number" step="any" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})}
                  placeholder="Широта (lat)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="number" step="any" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})}
                  placeholder="Долгота (lng)"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Описание компании" rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500" />

            {/* Категории */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Категории:</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      form.categories.includes(c.id) ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium disabled:opacity-50">
              <Save size={18} /> {submitting ? 'Сохранение...' : editingId ? 'Сохранить' : 'Добавить'}
            </button>
          </form>
        </div>
      )}

      {/* Список */}
      <div className="space-y-3">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{s.name}</h3>
                <p className="text-sm text-gray-500">{s.city} | {s.email} | {s.phone}</p>
                {s.whatsapp && <p className="text-sm text-gray-400">WA: {s.whatsapp}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {s.categories?.map(catId => {
                    const cat = CATEGORIES.find(c => c.id === catId);
                    return cat ? (
                      <span key={catId} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{cat.icon} {cat.name}</span>
                    ) : null;
                  })}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(s)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                  <Pencil size={18} />
                </button>
                <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
