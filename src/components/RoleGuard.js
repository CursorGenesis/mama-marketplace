'use client';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import Link from 'next/link';

export default function RoleGuard({ roles, children }) {
  const { user, profile, isAdmin, loading } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';

  const userRole = isAdmin ? 'admin' : profile?.role || 'buyer';

  if (loading) {
    return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  }

  // Требуем авторизацию
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{isRu ? 'Требуется авторизация' : 'Авторизация керек'}</h2>
        <p className="text-gray-500 text-sm mb-6">{isRu ? 'Войдите или зарегистрируйтесь для доступа к этому разделу' : 'Бул бөлүмгө кирүү үчүн каттаңыз'}</p>
        <Link href="/auth" className="inline-block px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors">
          {isRu ? 'Войти' : 'Кирүү'}
        </Link>
      </div>
    );
  }

  // Если роль не совпадает
  if (!roles.includes(userRole)) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⛔</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{isRu ? 'Доступ запрещён' : 'Кирүүгө тыюу салынган'}</h2>
        <p className="text-gray-500 text-sm mb-6">{isRu ? 'У вас нет прав для доступа к этому разделу' : 'Бул бөлүмгө кирүүгө укугуңуз жок'}</p>
        <Link href="/" className="inline-block px-8 py-3 bg-slate-800 text-white rounded-xl font-semibold hover:bg-slate-700 transition-colors">
          {isRu ? 'На главную' : 'Башкы бетке'}
        </Link>
      </div>
    );
  }

  return children;
}
