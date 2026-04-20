'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { createPromotion, getPromotions, updatePromotion, deletePromotion } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Plus, Trash2, X, Save, Megaphone, Tag, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function PromotionsPage() {
  const { user, isSupplier, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    discount: '',
    endDate: '',
    bannerType: 'free',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isSupplier) { router.push('/auth'); return; }
    loadData();
  }, [user, isSupplier, authLoading]);

  const loadData = async () => {
    try {
      const q = query(collection(db, 'suppliers'), where('email', '==', user.email));
      const snap = await getDocs(q);
      if (snap.empty) { setLoading(false); return; }

      const sup = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setSupplier(sup);

      const promos = await getPromotions({ supplierId: sup.id });
      setPromotions(promos);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) { toast.error(isRu ? 'Введите название акции' : 'Акциянын аталышын жазыңыз'); return; }
    if (!form.endDate) { toast.error(isRu ? 'Укажите дату окончания' : 'Аяктоо күнүн көрсөтүңүз'); return; }
    setSubmitting(true);
    try {
      await createPromotion({
        supplierId: supplier.id,
        supplierName: supplier.name,
        title: form.title,
        description: form.description,
        discount: form.discount ? Number(form.discount) : null,
        endDate: form.endDate,
        bannerType: form.bannerType,
      });
      toast.success(isRu ? 'Акция создана!' : 'Акция түзүлдү!');
      setForm({ title: '', description: '', discount: '', endDate: '', bannerType: 'free' });
      setShowForm(false);
      loadData();
    } catch (e) {
      toast.error(isRu ? 'Ошибка создания акции' : 'Акция түзүүдө ката');
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm(isRu ? 'Удалить акцию?' : 'Акцияны жок кылуу?')) return;
    await deletePromotion(id);
    toast.success(isRu ? 'Акция удалена' : 'Акция жок кылынды');
    loadData();
  };

  const handleToggle = async (promo) => {
    await updatePromotion(promo.id, { active: !promo.active });
    toast.success(promo.active ? (isRu ? 'Акция приостановлена' : 'Акция токтотулду') : (isRu ? 'Акция активирована' : 'Акция активдештирилди'));
    loadData();
  };

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Кабинет поставщика' : 'Жеткирүүчү кабинети'}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isRu ? 'Мои акции' : 'Менин акцияларым'}</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          <Plus size={16} /> {isRu ? 'Создать акцию' : 'Акция түзүү'}
        </button>
      </div>

      {/* Форма создания */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2"><Megaphone size={20} /> {isRu ? 'Новая акция' : 'Жаңы акция'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Название акции' : 'Акциянын аталышы'} <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                placeholder={isRu ? 'Например: Скидка 15% на молочную продукцию' : 'Мисалы: Сүт продукцияларына 15% арзандатуу'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Описание (условия акции)' : 'Сүрөттөмө (акция шарттары)'}</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                placeholder={isRu ? 'Подробные условия: какие товары участвуют, минимальный заказ и т.д.' : 'Толук шарттар: кайсы товарлар катышат, минималдуу заказ ж.б.'}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'Скидка %' : 'Арзандатуу %'}</label>
                <input type="number" value={form.discount} onChange={e => setForm({...form, discount: e.target.value})}
                  placeholder="15"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isRu ? 'До какой даты' : 'Кайсы күнгө чейин'} <span className="text-red-500">*</span></label>
                <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>

            {/* Тип размещения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{isRu ? 'Размещение баннера' : 'Баннерди жайгаштыруу'}</label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <input type="radio" name="bannerType" value="free" checked={form.bannerType === 'free'}
                    onChange={e => setForm({...form, bannerType: e.target.value})} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-gray-800">{isRu ? 'Бесплатно — на карточках товаров' : 'Акысыз — товар карточкаларында'}</div>
                    <div className="text-xs text-gray-500">{isRu ? 'Бейдж "Акция" появится на ваших товарах в каталоге' : '"Акция" бейджи каталогдогу товарларыңызда пайда болот'}</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200">
                  <input type="radio" name="bannerType" value="catalog" checked={form.bannerType === 'catalog'}
                    onChange={e => setForm({...form, bannerType: e.target.value})} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-gray-800">{isRu ? 'Баннер в каталоге' : 'Каталогдогу баннер'} — <span className="text-blue-600 font-bold">500 {isRu ? 'сом/неделю' : 'сом/апта'}</span></div>
                    <div className="text-xs text-gray-500">{isRu ? 'Яркий баннер вверху каталога. Видят все покупатели.' : 'Каталогдун жогору жагындагы жарык баннер. Бардык сатып алуучулар көрөт.'}</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors border border-yellow-200">
                  <input type="radio" name="bannerType" value="main" checked={form.bannerType === 'main'}
                    onChange={e => setForm({...form, bannerType: e.target.value})} className="mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-gray-800">{isRu ? 'Баннер на главной' : 'Башкы беттеги баннер'} — <span className="text-yellow-700 font-bold">1 000 {isRu ? 'сом/неделю' : 'сом/апта'}</span></div>
                    <div className="text-xs text-gray-500">{isRu ? 'Максимальный охват. Баннер на главной странице платформы.' : 'Максималдуу камтуу. Платформанын башкы бетиндеги баннер.'}</div>
                  </div>
                </label>
              </div>
            </div>

            {(form.bannerType === 'catalog' || form.bannerType === 'main') && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  {isRu ? 'Платное размещение списывается с вашего баланса. После создания акции администратор подтвердит размещение баннера.' : 'Акылуу жайгаштыруу балансыңыздан алынат. Акция түзүлгөндөн кийин администратор баннерди ырастайт.'}
                </p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50">
              <Save size={18} /> {submitting ? (isRu ? 'Создание...' : 'Түзүлүүдө...') : (isRu ? 'Создать акцию' : 'Акция түзүү')}
            </button>
          </div>
        </div>
      )}

      {/* Список акций */}
      {promotions.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Megaphone size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="font-bold text-gray-600 mb-2">{isRu ? 'Нет активных акций' : 'Активдүү акциялар жок'}</h3>
          <p className="text-sm text-gray-400 mb-4">{isRu ? 'Создайте акцию чтобы привлечь покупателей и увеличить продажи' : 'Сатып алуучуларды тартуу жана сатууну көбөйтүү үчүн акция түзүңүз'}</p>
          <button onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
            {isRu ? 'Создать первую акцию' : 'Биринчи акцияны түзүү'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={14} className="text-purple-500" />
                    <span className="font-bold text-gray-800">{promo.title}</span>
                    {promo.bannerType === 'catalog' && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{isRu ? 'Баннер в каталоге' : 'Каталогдогу баннер'}</span>}
                    {promo.bannerType === 'main' && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">{isRu ? 'Баннер на главной' : 'Башкы беттеги баннер'}</span>}
                  </div>
                  {promo.description && <p className="text-sm text-gray-500 mb-1">{promo.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {promo.discount && <span className="text-green-600 font-bold">-{promo.discount}%</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {isRu ? 'до' : 'чейин'} {promo.endDate}</span>
                    <span className={promo.active ? 'text-green-600' : 'text-red-500'}>{promo.active ? (isRu ? 'Активна' : 'Активдүү') : (isRu ? 'Остановлена' : 'Токтотулган')}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleToggle(promo)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium ${promo.active ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {promo.active ? (isRu ? 'Пауза' : 'Тыныгуу') : (isRu ? 'Запустить' : 'Баштоо')}
                  </button>
                  <button onClick={() => handleDelete(promo.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Подсказка */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <h3 className="font-bold text-blue-800 text-sm mb-2">{isRu ? 'Как работают акции' : 'Акциялар кантип иштейт'}</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• {isRu ? 'Бесплатно: бейдж "Акция" на ваших товарах в каталоге' : 'Акысыз: каталогдогу товарларыңызда "Акция" бейджи'}</li>
          <li>• {isRu ? 'Баннер в каталоге (500 сом/нед): яркий баннер вверху каталога' : 'Каталогдогу баннер (500 сом/апта): каталогдун жогору жагында жарык баннер'}</li>
          <li>• {isRu ? 'Баннер на главной (1000 сом/нед): максимальный охват' : 'Башкы беттеги баннер (1000 сом/апта): максималдуу камтуу'}</li>
          <li>• {isRu ? 'Акция автоматически завершается по дате окончания' : 'Акция аяктоо датасы боюнча автоматтык түрдө аяктайт'}</li>
          <li>• {isRu ? 'Платные баннеры списываются с вашего баланса' : 'Акылуу баннерлер балансыңыздан алынат'}</li>
        </ul>
      </div>
    </div>
  );
}
