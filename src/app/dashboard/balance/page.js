'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { getSupplierBalance, getTransactions, addToBalance } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ArrowLeft, Wallet, TrendingDown, TrendingUp, AlertTriangle, Plus } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BalancePage() {
  const { user, isSupplier, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [balance, setBalance] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setBalance(sup.balance || 0);
      setBlocked(sup.blocked || false);

      const txns = await getTransactions(sup.id);
      setTransactions(txns);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (authLoading || loading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Кабинет поставщика' : 'Жеткирүүчү кабинети'}
      </Link>

      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Баланс' : 'Баланс'}</h1>

      {/* Блок баланса */}
      <div className={`rounded-2xl p-6 mb-6 ${blocked ? 'bg-red-50 border-2 border-red-300' : balance < 1000 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet size={24} className={blocked ? 'text-red-500' : balance < 1000 ? 'text-yellow-500' : 'text-green-500'} />
            <span className="text-sm text-gray-600">{isRu ? 'Текущий баланс' : 'Учурдагы баланс'}</span>
          </div>
          {blocked && (
            <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
              <AlertTriangle size={12} /> {isRu ? 'Заблокирован' : 'Бөгөттөлгөн'}
            </span>
          )}
        </div>
        <div className={`text-4xl font-bold mb-1 ${blocked ? 'text-red-600' : balance < 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
          {balance.toLocaleString('ru-RU')} сом
        </div>
        {blocked && (
          <p className="text-sm text-red-600 mt-2">
            {isRu ? 'Ваш баланс исчерпан. Товары скрыты из каталога. Пополните баланс чтобы восстановить доступ.' : 'Балансыңыз түгөндү. Товарлар каталогдон жашырылды. Мүмкүнчүлүктү калыбына келтирүү үчүн балансты толуктаңыз.'}
          </p>
        )}
        {!blocked && balance < 1000 && balance > 0 && (
          <p className="text-sm text-yellow-600 mt-2">
            {isRu ? 'Баланс заканчивается. Рекомендуем пополнить чтобы избежать блокировки.' : 'Баланс түгөп баратат. Бөгөттөлүүдөн качуу үчүн толуктоону сунуштайбыз.'}
          </p>
        )}
      </div>

      {/* Как пополнить */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Plus size={18} /> {isRu ? 'Пополнить баланс' : 'Балансты толуктоо'}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {isRu ? 'Для пополнения баланса свяжитесь с администратором платформы:' : 'Балансты толуктоо үчүн платформа администратору менен байланышыңыз:'}
        </p>
        <div className="space-y-2">
          <a href="https://wa.me/996555000000" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            {isRu ? 'Написать в WhatsApp' : 'WhatsAppка жазуу'}
          </a>
          <p className="text-xs text-gray-400 px-1">{isRu ? 'Онлайн-оплата через Элсом, О!Деньги, Баланс.кг — скоро' : 'Элсом, О!Деньги, Баланс.кг аркылуу онлайн-төлөм — жакында'}</p>
        </div>
      </div>

      {/* Как работает */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-bold text-blue-800 text-sm mb-2">{isRu ? 'Как работает баланс' : 'Баланс кантип иштейт'}</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• {isRu ? 'Вы вносите депозит — он зачисляется на ваш баланс' : 'Депозит киргизесиз — ал балансыңызга чегерилет'}</li>
          <li>• {isRu ? 'С каждого заказа автоматически списывается комиссия (3-5%)' : 'Ар бир заказдан комиссия автоматтык түрдө алынат (3-5%)'}</li>
          <li>• {isRu ? 'Когда баланс заканчивается — товары скрываются из каталога' : 'Баланс түгөнгөндө — товарлар каталогдон жашырылат'}</li>
          <li>• {isRu ? 'После пополнения — товары сразу возвращаются' : 'Толуктагандан кийин — товарлар дароо кайтарылат'}</li>
        </ul>
      </div>

      {/* История операций */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">{isRu ? 'История операций' : 'Операциялар тарыхы'}</h2>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {isRu ? 'Операций пока нет. После первого депозита здесь появится история.' : 'Операциялар азырынча жок. Биринчи депозиттен кийин бул жерде тарых пайда болот.'}
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map(txn => (
              <div key={txn.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {txn.amount > 0 ? <TrendingUp size={16} className="text-green-600" /> : <TrendingDown size={16} className="text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate">{txn.description}</div>
                  <div className="text-xs text-gray-400">{formatDate(txn.createdAt)}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`font-bold text-sm ${txn.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString('ru-RU')} сом
                  </div>
                  <div className="text-xs text-gray-400">{txn.balance?.toLocaleString('ru-RU')} сом</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
