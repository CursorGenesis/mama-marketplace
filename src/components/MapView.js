'use client';
import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useLang } from '@/context/LangContext';

export default function MapView({ suppliers = [], center = [41.5, 74.5], zoom = 7, onMarkerClick }) {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [MapComponent, setMapComponent] = useState(null);

  useEffect(() => {
    // Импортируем CSS
    import('leaflet/dist/leaflet.css');

    import('leaflet').then(L => {
      import('react-leaflet').then(RL => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Компонент для фикса размера карты
        function MapResizeFix() {
          const map = RL.useMap();
          useEffect(() => {
            setTimeout(() => map.invalidateSize(), 100);
            setTimeout(() => map.invalidateSize(), 500);
            window.addEventListener('resize', () => map.invalidateSize());
            return () => window.removeEventListener('resize', () => map.invalidateSize());
          }, [map]);
          return null;
        }

        setMapComponent(() => {
          return function Map() {
            return (
              <RL.MapContainer
                center={center}
                zoom={zoom}
                style={{ width: '100%', height: '100%', borderRadius: '12px', zIndex: 0 }}
                scrollWheelZoom={true}
              >
                <MapResizeFix />
                <RL.TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {suppliers.map(s => (
                  s.lat && s.lng ? (
                    <RL.Marker key={s.id} position={[s.lat, s.lng]}>
                      <RL.Popup>
                        <div className="min-w-[200px]">
                          <h3 className="font-bold text-base mb-1">{s.name}</h3>
                          <p className="text-sm text-gray-500 mb-1">{s.city}</p>
                          <p className="text-sm mb-2">{s.description?.slice(0, 100)}</p>
                          {s.phone && <p className="text-sm">Tel: {s.phone}</p>}
                          {onMarkerClick && (
                            <button
                              onClick={() => onMarkerClick(s)}
                              className="mt-2 text-sm text-primary-600 font-medium hover:underline"
                            >
                              {isRu ? 'Подробнее' : 'Толугураак'} &rarr;
                            </button>
                          )}
                        </div>
                      </RL.Popup>
                    </RL.Marker>
                  ) : null
                ))}
              </RL.MapContainer>
            );
          };
        });
      });
    });
  }, [suppliers, center, zoom, onMarkerClick]);

  if (!MapComponent) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MapPin size={48} className="mx-auto mb-2" />
          <p>{isRu ? 'Загрузка карты...' : 'Карта жүктөлүүдө...'}</p>
        </div>
      </div>
    );
  }

  return <MapComponent />;
}
