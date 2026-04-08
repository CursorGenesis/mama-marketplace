'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RoleGuard({ roles, children }) {
  const { user, profile, isAdmin, isSupplier, loading } = useAuth();
  const router = useRouter();

  const userRole = isAdmin ? 'admin' : profile?.role || 'buyer';

  useEffect(() => {
    if (loading) return;

    // В демо-режиме (без авторизации) — показываем всё
    if (!user) return;

    // Проверяем роль
    if (!roles.includes(userRole)) {
      router.push('/');
    }
  }, [user, userRole, loading]);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Загрузка...</div>;
  }

  // В демо-режиме показываем
  if (!user) return children;

  // Если роль не совпадает — не показываем
  if (!roles.includes(userRole)) return null;

  return children;
}
