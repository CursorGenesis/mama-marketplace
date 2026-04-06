'use client';
import { MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';

export default function FeedbackButton() {
  const { lang } = useLang();
  return (
    <Link
      href="/feedback"
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl hover:scale-105 transition-all animate-bounce-once"
      style={{ animationDelay: '2s' }}
    >
      <MessageSquarePlus size={20} />
      <span className="text-sm font-semibold">
        {lang === 'kg' ? 'Кайтарым байланыш' : 'Обратная связь'}
      </span>
    </Link>
  );
}
