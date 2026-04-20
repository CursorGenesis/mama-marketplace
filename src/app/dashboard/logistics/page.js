'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { Truck, Phone, MapPin, Lock, Crown } from 'lucide-react';
import Link from 'next/link';

const demoDeliveries = [
  { id: 'd1', driver: 'Талант Эшматов', driverPhone: '+996 555 100 200', shop: 'Мини-маркет Береке', address: 'ул. Манаса, 40', items: 3, total: 12500, status: 'delivered', time: '10:30' },
  { id: 'd2', driver: 'Талант Эшматов', driverPhone: '+996 555 100 200', shop: 'Магазин Достук', address: 'ул. Токтогула, 120', items: 5, total: 8900, status: 'in_transit', time: '11:00' },
  { id: 'd3', driver: 'Азиз Мамбетов', driverPhone: '+996 700 300 400', shop: 'Супермаркет Народный', address: 'пр. Чуй, 150', items: 8, total: 24000, status: 'delivered', time: '09:15' },
  { id: 'd4', driver: 'Азиз Мамбетов', driverPhone: '+996 700 300 400', shop: 'Кафе Жаштык', address: 'ул. Ахунбаева, 93', items: 4, total: 15600, status: 'refused', refuseReason: 'Магазин закрыт', time: '10:00' },
  { id: 'd5', driver: 'Талант Эшматов', driverPhone: '+996 555 100 200', shop: 'Мини-маркет Айжан', address: 'ул. Киевская, 77', items: 6, total: 9800, status: 'pending', time: '12:00' },
];

export default function SupplierLogisticsPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [filter, setFilter] = useState('all');
  const hasAccess = true;

  const sc = { pending: { l: isRu ? 'Ожидает' : 'Кутууде', c: 'bg-gray-100 text-gray-700', d: 'bg-gray-400' }, in_transit: { l: isRu ? 'В пути' : 'Жолдо', c: 'bg-blue-100 text-blue-700', d: 'bg-blue-500' }, delivered: { l: isRu ? 'Доставлено' : 'Жеткирилди', c: 'bg-green-100 text-green-700', d: 'bg-green-500' }, refused: { l: isRu ? 'Отказ' : 'Баш тартуу', c: 'bg-red-100 text-red-700', d: 'bg-red-500' } };

  if (!hasAccess) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <Lock size={48} className="mx-auto mb-4 text-amber-400" />
      <h2 className="text-2xl font-bold mb-2">{isRu ? 'Логистика' : 'Логистика'}</h2>
      <p className="text-gray-500 mb-6">{isRu ? 'Доступно в пакете Логистика за 3 000 сом/мес' : '3 000 сом/ай Логистика пакетинде жеткиликтуу'}</p>
      <Link href="/pricing" className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600">{isRu ? 'Подключить' : 'Туташтыруу'}</Link>
    </div>
  );

  const filtered = demoDeliveries.filter(d => filter === 'all' || d.status === filter);
  const drivers = [...new Set(demoDeliveries.map(d => d.driver))];
  const stats = { total: demoDeliveries.length, delivered: demoDeliveries.filter(d => d.status === 'delivered').length, transit: demoDeliveries.filter(d => d.status === 'in_transit' || d.status === 'pending').length, refused: demoDeliveries.filter(d => d.status === 'refused').length };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{isRu ? 'Логистика и доставки' : 'Логистика жана жеткируу'}</h1>
          <p className="text-sm text-gray-500">{isRu ? 'Отслеживание экспедиторов' : 'Экспедиторлорду козомолдоо'}</p>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full flex items-center gap-1"><Crown size={12} /> {isRu ? 'Платный пакет' : 'Акылуу пакет'}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[{v:stats.total,l:isRu?'Всего':'Жалпы',cl:'text-slate-700'},{v:stats.delivered,l:isRu?'Доставлено':'Жеткирилди',cl:'text-green-600'},{v:stats.transit,l:isRu?'В пути':'Жолдо',cl:'text-blue-600'},{v:stats.refused,l:isRu?'Отказ':'Баш тартуу',cl:'text-red-600'}].map((s,i)=>(
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm text-center"><div className={`text-2xl font-bold ${s.cl}`}>{s.v}</div><div className="text-xs text-gray-500">{s.l}</div></div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <h2 className="font-bold text-gray-800 mb-3">{isRu ? 'Экспедиторы' : 'Экспедиторлор'}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {drivers.map(name => { const dd = demoDeliveries.filter(d => d.driver === name); const done = dd.filter(d => d.status === 'delivered').length; return (
            <div key={name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold">{name.split(' ').map(n=>n[0]).join('')}</div>
              <div className="flex-1"><div className="font-medium text-gray-800 text-sm">{name}</div><div className="text-xs text-gray-400">{done}/{dd.length} {isRu?'доставлено':'жеткирилди'}</div></div>
              <a href={`tel:${dd[0]?.driverPhone}`} className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><Phone size={14}/></a>
            </div>
          );})}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {[{k:'all',l:isRu?'Все':'Баары'},{k:'in_transit',l:isRu?'В пути':'Жолдо'},{k:'delivered',l:isRu?'Доставлено':'Жеткирилди'},{k:'refused',l:isRu?'Отказ':'Баш тартуу'}].map(f=>(
          <button key={f.k} onClick={()=>setFilter(f.k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${filter===f.k?'bg-slate-800 text-white':'bg-white text-gray-600 border border-gray-200'}`}>{f.l}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(d => { const s = sc[d.status]; return (
          <div key={d.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full shrink-0 ${s.d}`}/>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap"><span className="font-medium text-gray-800 text-sm">{d.shop}</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.c}`}>{s.l}</span></div>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-2 flex-wrap"><MapPin size={10}/> {d.address} <span>-</span> <Truck size={10}/> {d.driver} <span>-</span> {d.time}</div>
              </div>
              <div className="text-right shrink-0"><div className="font-bold text-sm">{d.total.toLocaleString('ru-RU')} сом</div><div className="text-xs text-gray-400">{d.items} {isRu ? 'товаров' : 'товар'}</div></div>
            </div>
            {d.refuseReason && <div className="mt-2 ml-6 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{d.refuseReason}</div>}
          </div>
        );})}
      </div>
    </div>
  );
}
