'use client';
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 left-3 md:bottom-6 md:left-6 z-40 w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
    >
      <ChevronUp size={20} />
    </button>
  );
}
