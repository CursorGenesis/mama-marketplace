'use client';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SupportButton() {
  const pathname = usePathname();

  // Не показываем на странице чата
  if (pathname === '/support') return null;

  return (
    <Link
      href="/support"
      className="fixed bottom-20 left-3 z-30 w-10 h-10 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all flex items-center justify-center md:bottom-6 md:left-6 md:w-12 md:h-12"
      title="Поддержка"
    >
      <MessageCircle size={24} />
    </Link>
  );
}
