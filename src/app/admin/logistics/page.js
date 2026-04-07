'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLang } from '@/context/LangContext';
import { Truck, Search, CheckCircle, XCircle, Clock, Package, MapPin, Phone, User } from 'lucide-react';

const demoDeliveries = [
  {
    id: 'd1', orderNumber: 'MKG-A1B2C-1', driverName: 'Талант Эшматов', driverPhone: '+996 555 100 200',
    supplier: 'Алтын Дан', shop: 'Мини-маркет "Береке"', shopAddress: 'ул. Манаса, 40, Бишкек',
    items: 3, total: 12500, status: 'delivered', date: '2026-04-07', time: '10:30',
    lat: 42.8746, lng: 74.5898,
  },
  {
    id: 'd2', orderNumber: 'MKG-A1B2C-2', driverName: 'Талант Эшматов', driverPhone: '+996 555 100 200',
    supplier: 'Алтын Дан', shop: 'Магазин "Достук"', shopAddress: 'ул. Токтогула, 120, Бишкек',
    items: 5, total: 8900, status: 'in_transit', date: '2026-04-07', time: '11:00',
    lat: 42.8690, lng: 74.5750,
  },
  {
    id: 'd3', orderNumber: 'MKG-D3E4F-1', driverName: 'Азиз Мамбетов', driverPhone: '+996 700 300 400',
    supplier: 'Шоро', shop: 'Супермаркет "Народный"', shopAddress: 'пр. Чуй, 150, Бишкек',
    items: 8, total: 24000, status: 'delivered', date: '2026-04-07', time: '09:15',
    lat: 42.8780, lng: 74.6100,
  },
  {
    id: 'd4', orderNumber: 'MKG-D3E4F-2', driverName: 'Азиз Мамбетов', driverPhone: '+996 700 300 400',
    supplier: 'Шоро', shop: 'Кафе "Жаштык"', shopAddress: 'ул. Ахунбаева, 93, Бишкек',
    items: 4, total: 15600, status: 'refused', refuseReason: 'Магазин закрыт',
    date: '2026-04-07', time: '10:00',
    lat: 42.8550, lng: 74.6200,
  },
  {
    id: 'd5', orderNumber: 'MKG-G5H6I-1', driverName: 'Нурбек Сыдыков', driverPhone: '+996 550 500 600',
    supplier: 'Бишкек Сүт', shop: 'Мини-маркет "Айжан"', shopAddress: 'ул. Киевская, 77, Бишкек',
    items: 6, total: 9800, status: 'in_transit', date: '2026-04-07', time: '11:30',
    lat: 42.8650, lng: 74.5600,
  },
  {
    id: 'd6', orderNumber: 'MKG-G5H6I-2', driverName: 'Нурбек Сыдыков', driverPhone: '+996 550 500 600',
    supplier: 'Бишкек Сүт', shop: 'Магазин "Ырыс"', shopAddress: 'ул. Жибек Жолу, 200, Бишкек',
    items: 3, total: 5400, status: 'pending', date: '2026-04-07', time: '12:00',
    lat: 42.8720, lng: 74.5500,
  },
  {
    id: 'd7', orderNumber: 'MKG-J7K8L-1', driverName: 'Талант Эшматов', driverPhone: '+996 555 100 200',
    supplier: 'Sweet House KG', shop: 'Кондитерская "Сладкоежка"', shopAddress: 'ул. Боконбаева, 55, Бишкек',
    items: 2, total: 18000, status: 'partial', partialReason: 'Торт Наполеон — не тот размер',
    date: '2026-04-07', time: '09:45',
    lat: 42.8620, lng: 74.5800,
  },
];

export default function AdminLogisticsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [deliveries, setDeliveries] = useState(demoDeliveries);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [isAdmin, authLoading]);

  if (authLoading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  if (!isAdmin) return null;

  const statusConfig = {
    pending: { label: isRu ? 'Ожидает' : 'Күтүүдө', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
    in_transit: { label: isRu ? 'В пути' : 'Жолдо', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    delivered: { label: isRu ? 'Доставлено' : 'Жеткирилди', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    refused: { label: isRu ? 'Отказ' : 'Баш тартуу', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    partial: { label: isRu ? 'Частично' : 'Жарым-жартылай', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  };

  const drivers = [...new Set(deliveries.map(d => d.driverName))];

  const filtered = deliveries
    .filter(d => filter === 'all' || d.status === filter)
    .filter(d => driverFilter === 'all' || d.driverName === driverFilter)
    .filter(d => !search || d.shop.toLowerCase().includes(search.toLowerCase()) || d.orderNumber.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    inTransit: deliveries.filter(d => d.status === 'in_transit').length,
    refused: deliveries.filter(d => d.status === 'refused').length,
    partial: deliveries.filter(d => d.status === 'partial').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{isRu ? 'Логистика и доставки' : 'Логистика жана жеткирүү'}</h1>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: isRu ? 'Всего' : 'Жалпы', value: stats.total, color: 'bg-slate-100', textColor: 'text-slate-600' },
          { label: isRu ? 'Доставлено' : 'Жеткирилди', value: stats.delivered, color: 'bg-green-100', textColor: 'text-green-600' },
          { label: isRu ? 'В пути' : 'Жолдо', value: stats.inTransit, color: 'bg-blue-100', textColor: 'text-blue-600' },
          { label: isRu ? 'Отказ' : 'Баш тартуу', value: stats.refused, color: 'bg-red-100', textColor: 'text-red-600' },
          { label: isRu ? 'Частично' : 'Жарым-жартылай', value: stats.partial, color: 'bg-yellow-100', textColor: 'text-yellow-600' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className={`text-2xl font-bold ${s.textColor}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Экспедиторы сводка */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h2 className="font-bold text-gray-800 mb-3">{isRu ? 'Экспедиторы сегодня' : 'Бүгүнкү экспедиторлор'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {drivers.map(name => {
            const driverDeliveries = deliveries.filter(d => d.driverName === name);
            const done = driverDeliveries.filter(d => d.status === 'delivered').length;
            const total = driverDeliveries.length;
            const phone = driverDeliveries[0]?.driverPhone;
            return (
              <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 text-sm">{name}</div>
                  <div className="text-xs text-gray-400">{done}/{total} {isRu ? 'доставлено' : 'жеткирилди'}</div>
                </div>
                <a href={`tel:${phone}`} className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <Phone size={14} />
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRu ? 'Поиск по магазину или номеру...' : 'Дүкөн же номер боюнча издөө...'}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <select value={driverFilter} onChange={e => setDriverFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none">
          <option value="all">{isRu ? 'Все экспедиторы' : 'Бардык экспедиторлор'}</option>
          {drivers.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div className="flex gap-1 flex-wrap">
          {[
            { key: 'all', label: isRu ? 'Все' : 'Баары' },
            { key: 'in_transit', label: '🔵' },
            { key: 'delivered', label: '🟢' },
            { key: 'refused', label: '🔴' },
            { key: 'partial', label: '🟡' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-slate-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Список доставок */}
      <div className="space-y-3">
        {filtered.map(d => {
          const sc = statusConfig[d.status];
          return (
            <div key={d.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Статус точка */}
                <div className={`w-3 h-3 rounded-full shrink-0 ${sc.dot}`} />

                {/* Инфо */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-800">{d.shop}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                    <span className="flex items-center gap-1"><MapPin size={10} /> {d.shopAddress}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Truck size={10} /> {d.driverName}</span>
                    <span>•</span>
                    <span>{d.supplier}</span>
                  </div>
                </div>

                {/* Сумма и время */}
                <div className="text-right shrink-0">
                  <div className="font-bold text-gray-800">{d.total.toLocaleString('ru-RU')} сом</div>
                  <div className="text-xs text-gray-400">{d.items} {isRu ? 'товаров' : 'товар'} • {d.time}</div>
                </div>

                {/* Номер заказа */}
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded shrink-0">{d.orderNumber}</span>
              </div>

              {/* Причина отказа */}
              {d.status === 'refused' && d.refuseReason && (
                <div className="mt-2 ml-6 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                  ❌ {isRu ? 'Причина:' : 'Себеби:'} {d.refuseReason}
                </div>
              )}
              {d.status === 'partial' && d.partialReason && (
                <div className="mt-2 ml-6 text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg">
                  ⚠️ {isRu ? 'Частично:' : 'Жарым-жартылай:'} {d.partialReason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">{isRu ? 'Доставки не найдены' : 'Жеткирүүлөр табылган жок'}</div>
      )}
    </div>
  );
}
