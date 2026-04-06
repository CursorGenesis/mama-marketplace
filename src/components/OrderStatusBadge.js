'use client';
import { ORDER_STATUSES } from '@/lib/firestore';

export default function OrderStatusBadge({ status }) {
  const info = ORDER_STATUSES[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}
