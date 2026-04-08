'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import RoleGuard from '@/components/RoleGuard';
import { Truck, CheckCircle, XCircle, AlertTriangle, MapPin, Phone, Package, Clock, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const initialDeliveries = [
  {
    id: 'd1', orderNumber: 'MKG-A1B2C-1', shop: 'Мини-маркет "Береке"',
    address: 'ул. Манаса, 40, Бишкек', phone: '+996 555 111 222',
    supplier: 'Алтын Дан', items: [
      { name: 'Мука пшеничная в/с 2кг', qty: 10, price: 95 },
      { name: 'Рис узгенский 1кг', qty: 5, price: 180 },
      { name: 'Сахар 1кг', qty: 20, price: 75 },
    ],
    total: 3350, status: 'pending', time: '09:00',
  },
  {
    id: 'd2', orderNumber: 'MKG-A1B2C-2', shop: 'Магазин "Достук"',
    address: 'ул. Токтогула, 120, Бишкек', phone: '+996 700 333 444',
    supplier: 'Алтын Дан', items: [
      { name: 'Макароны спагетти 400г', qty: 15, price: 85 },
      { name: 'Масло подсолнечное 1л', qty: 10, price: 145 },
    ],
    total: 2725, status: 'pending', time: '10:00',
  },
  {
    id: 'd3', orderNumber: 'MKG-D3E4F-1', shop: 'Супермаркет "Народный"',
    address: 'пр. Чуй, 150, Бишкек', phone: '+996 550 555 666',
    supplier: 'Шоро', items: [
      { name: 'Максым 1л', qty: 24, price: 75 },
      { name: 'Чалап 1л', qty: 12, price: 70 },
      { name: 'Бозо 0.5л', qty: 10, price: 65 },
    ],
    total: 3290, status: 'pending', time: '11:00',
  },
  {
    id: 'd4', orderNumber: 'MKG-G5H6I-1', shop: 'Мини-маркет "Айжан"',
    address: 'ул. Киевская, 77, Бишкек', phone: '+996 507 777 888',
    supplier: 'Бишкек Сүт', items: [
      { name: 'Молоко 3.2% 1л', qty: 20, price: 68 },
      { name: 'Сметана 20% 400г', qty: 10, price: 110 },
      { name: 'Айран 0.5л', qty: 15, price: 55 },
    ],
    total: 3285, status: 'pending', time: '12:00',
  },
];

const refuseReasons = {
  ru: ['Магазин закрыт', 'Нет денег', 'Отказ от товара', 'Не тот товар', 'Другое'],
  kg: ['Дүкөн жабык', 'Акча жок', 'Товардан баш тартуу', 'Туура эмес товар', 'Башка'],
};

export default function DriverDashboardPage() {
  return <RoleGuard roles={['driver', 'admin']}><DriverDashboardContent /></RoleGuard>;
}

function DriverDashboardContent() {
  const { profile } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [expandedId, setExpandedId] = useState(null);
  const [refuseId, setRefuseId] = useState(null);
  const [refuseReason, setRefuseReason] = useState('');

  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    pending: deliveries.filter(d => d.status === 'pending').length,
    refused: deliveries.filter(d => d.status === 'refused').length,
  };

  const markDelivered = (id) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'delivered' } : d));
    toast.success(isRu ? 'Доставлено!' : 'Жеткирилди!');
  };

  const markRefused = (id) => {
    if (!refuseReason) { toast.error(isRu ? 'Укажите причину' : 'Себебин жазыңыз'); return; }
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'refused', refuseReason } : d));
    setRefuseId(null);
    setRefuseReason('');
    toast.success(isRu ? 'Отказ зафиксирован' : 'Баш тартуу белгиленди');
  };

  const statusConfig = {
    pending: { label: isRu ? 'Ожидает' : 'Күтүүдө', color: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
    delivered: { label: isRu ? 'Доставлено' : 'Жеткирилди', color: 'bg-green-100 text-green-700', border: 'border-green-200' },
    refused: { label: isRu ? 'Отказ' : 'Баш тартуу', color: 'bg-red-100 text-red-700', border: 'border-red-200' },
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isRu ? 'Мои доставки' : 'Менин жеткирүүлөрүм'}</h1>
          <p className="text-gray-500 text-sm">{profile?.name || (isRu ? 'Экспедитор' : 'Экспедитор')} • {new Date().toLocaleDateString(isRu ? 'ru-RU' : 'ky-KG', { day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="w-12 h-12 bg-slate-800 text-white rounded-full flex items-center justify-center">
          <Truck size={24} />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-700">{stats.pending}</div>
          <div className="text-xs text-blue-600">{isRu ? 'Ожидает' : 'Күтүүдө'}</div>
        </div>
        <div className="bg-green-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-700">{stats.delivered}</div>
          <div className="text-xs text-green-600">{isRu ? 'Доставлено' : 'Жеткирилди'}</div>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{stats.refused}</div>
          <div className="text-xs text-red-600">{isRu ? 'Отказ' : 'Баш тартуу'}</div>
        </div>
      </div>

      {/* Прогресс */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{isRu ? 'Прогресс' : 'Прогресс'}</span>
          <span className="text-sm text-gray-500">{stats.delivered}/{stats.total}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${(stats.delivered / stats.total) * 100}%` }} />
        </div>
      </div>

      {/* Список доставок */}
      <div className="space-y-3">
        {deliveries.map((d, index) => {
          const sc = statusConfig[d.status];
          const isExpanded = expandedId === d.id;
          const isRefusing = refuseId === d.id;

          return (
            <div key={d.id} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${sc.border}`}>
              {/* Заголовок */}
              <button onClick={() => setExpandedId(isExpanded ? null : d.id)}
                className="w-full p-4 text-left flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  d.status === 'delivered' ? 'bg-green-500 text-white' : d.status === 'refused' ? 'bg-red-500 text-white' : 'bg-blue-100 text-blue-700'
                }`}>
                  {d.status === 'delivered' ? '✓' : d.status === 'refused' ? '✕' : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm">{d.shop}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {d.time} • {d.supplier}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm">{d.total.toLocaleString('ru-RU')} сом</div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>{sc.label}</span>
                </div>
              </button>

              {/* Детали */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Адрес и телефон */}
                  <div className="flex gap-2 mt-3 mb-3">
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(d.address)}`} target="_blank"
                      className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-600 hover:bg-gray-100">
                      <MapPin size={14} className="text-gray-400 shrink-0" /> {d.address}
                    </a>
                    <a href={`tel:${d.phone}`}
                      className="flex items-center gap-1 px-3 py-2 bg-green-50 rounded-lg text-xs text-green-600 hover:bg-green-100 shrink-0">
                      <Phone size={14} /> {isRu ? 'Позвонить' : 'Чалуу'}
                    </a>
                  </div>

                  {/* Товары */}
                  <div className="space-y-1 mb-3">
                    {d.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="text-gray-400">{item.qty} × {item.price} = <span className="font-medium text-gray-700">{(item.qty * item.price).toLocaleString('ru-RU')}</span></span>
                      </div>
                    ))}
                  </div>

                  {/* Кнопки действий */}
                  {d.status === 'pending' && !isRefusing && (
                    <div className="flex gap-2">
                      <button onClick={() => markDelivered(d.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                        <CheckCircle size={18} /> {isRu ? 'Доставлено' : 'Жеткирилди'}
                      </button>
                      <button onClick={() => setRefuseId(d.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors">
                        <XCircle size={18} /> {isRu ? 'Отказ' : 'Баш тартуу'}
                      </button>
                    </div>
                  )}

                  {/* Форма отказа */}
                  {isRefusing && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-700">{isRu ? 'Причина отказа:' : 'Баш тартуу себеби:'}</p>
                      <div className="flex flex-wrap gap-2">
                        {(isRu ? refuseReasons.ru : refuseReasons.kg).map(reason => (
                          <button key={reason} onClick={() => setRefuseReason(reason)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              refuseReason === reason ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}>
                            {reason}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => markRefused(d.id)}
                          className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm">
                          {isRu ? 'Подтвердить отказ' : 'Баш тартууну ырастоо'}
                        </button>
                        <button onClick={() => { setRefuseId(null); setRefuseReason(''); }}
                          className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm">
                          {isRu ? 'Отмена' : 'Жокко чыгаруу'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Причина отказа если отказано */}
                  {d.status === 'refused' && d.refuseReason && (
                    <div className="bg-red-50 rounded-lg px-3 py-2 text-xs text-red-600">
                      ❌ {d.refuseReason}
                    </div>
                  )}

                  {/* Доставлено */}
                  {d.status === 'delivered' && (
                    <div className="bg-green-50 rounded-lg px-3 py-2 text-xs text-green-600 flex items-center gap-1">
                      <CheckCircle size={14} /> {isRu ? 'Успешно доставлено' : 'Ийгиликтүү жеткирилди'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
