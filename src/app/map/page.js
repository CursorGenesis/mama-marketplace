'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { getSuppliers } from '@/lib/firestore';
import MapView from '@/components/MapView';

export default function MapPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    getSuppliers().then(s => {
      setSuppliers(s);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Карта поставщиков Кыргызстана' : 'Кыргызстандын жеткирүүчүлөр картасы'}</h1>

      <div className="h-[70vh] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            {isRu ? 'Загрузка карты...' : 'Карта жүктөлүүдө...'}
          </div>
        ) : (
          <MapView
            suppliers={suppliers}
            center={[41.5, 74.5]}
            zoom={7}
            onMarkerClick={(s) => router.push(`/supplier/${s.id}`)}
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {suppliers.map(s => (
          <div
            key={s.id}
            onClick={() => router.push(`/supplier/${s.id}`)}
            className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-sm">{s.name}</h3>
            <p className="text-xs text-gray-500">{s.city}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
