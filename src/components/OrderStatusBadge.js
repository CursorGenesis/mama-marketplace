'use client';
import { ORDER_STATUSES } from '@/lib/firestore';
import { useLang } from '@/context/LangContext';

export default function OrderStatusBadge({ status }) {
  const { lang } = useLang();
  const info = ORDER_STATUSES[status] || { label: status, labelKg: status, color: 'bg-gray-100 text-gray-800' };
  const label = lang === 'kg' && info.labelKg ? info.labelKg : info.label;
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${info.color}`}>
      {label}
    </span>
  );
}
