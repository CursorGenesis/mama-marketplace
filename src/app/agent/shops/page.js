'use client';
import { useState } from 'react';
import { useLang } from '@/context/LangContext';
import RoleGuard from '@/components/RoleGuard';
import { Store, Plus, MapPin, Phone, Package, ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const demoShops = [
  { id: 'sh1', name: 'Мини-маркет "Береке"', address: 'ул. Манаса, 40', city: 'Бишкек', phone: '+996 555 111 222', orders: 12, totalSpent: 156000, lastOrder: '2026-04-06', registered: '2026-03-05' },
  { id: 'sh2', name: 'Магазин "Достук"', address: 'ул. Токтогула, 120', city: 'Бишкек', phone: '+996 700 333 444', orders: 8, totalSpent: 89000, lastOrder: '2026-04-05', registered: '2026-03-10' },
  { id: 'sh3', name: 'Супермаркет "Народный"', address: 'пр. Чуй, 150', city: 'Бишкек', phone: '+996 550 555 666', orders: 23, totalSpent: 312000, lastOrder: '2026-04-07', registered: '2026-02-20' },
  { id: 'sh4', name: 'Кафе "Жаштык"', address: 'ул. Ахунбаева, 93', city: 'Бишкек', phone: '+996 507 777 888', orders: 5, totalSpent: 42000, lastOrder: '2026-04-03', registered: '2026-03-15' },
  { id: 'sh5', name: 'Мини-маркет "Айжан"', address: 'ул. Киевская, 77', city: 'Бишкек', phone: '+996 555 999 000', orders: 15, totalSpent: 198000, lastOrder: '2026-04-07', registered: '2026-02-25' },
];

export default function AgentShopsPage() {
  return <RoleGuard roles={['agent', 'admin']}><AgentShopsContent /></RoleGuard>;
}

function AgentShopsContent() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [shops, setShops] = useState(demoShops);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newShop, setNewShop] = useState({ name: '', address: '', city: 'Бишкек', phone: '' });

  const filtered = shops.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!newShop.name || !newShop.phone) {
      toast.error(isRu ? 'Заполните название и телефон' : 'Аталыш жана телефонду толтуруңуз');
      return;
    }
    setShops(prev => [{
      id: 'sh' + Date.now(), ...newShop, orders: 0, totalSpent: 0,
      lastOrder: '-', registered: new Date().toISOString().split('T')[0],
    }, ...prev]);
    setNewShop({ name: '', address: '', city: 'Бишкек', phone: '' });
    setShowAdd(false);
    toast.success(isRu ? 'Магазин добавлен!' : 'Дүкөн кошулду!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/agent/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Кабинет агента' : 'Агент кабинети'}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isRu ? 'Мои магазины' : 'Менин дүкөндөрүм'}</h1>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
          <Plus size={16} /> {isRu ? 'Добавить' : 'Кошуу'}
        </button>
      </div>

      {/* Форма добавления */}
      {showAdd && (
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6 border border-green-200">
          <h3 className="font-bold mb-3">{isRu ? 'Новый магазин' : 'Жаңы дүкөн'}</h3>
          <div className="space-y-3">
            <input type="text" value={newShop.name} onChange={e => setNewShop({ ...newShop, name: e.target.value })}
              placeholder={isRu ? 'Название магазина' : 'Дүкөндүн аты'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="text" value={newShop.address} onChange={e => setNewShop({ ...newShop, address: e.target.value })}
              placeholder={isRu ? 'Адрес' : 'Дарек'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <input type="tel" value={newShop.phone} onChange={e => setNewShop({ ...newShop, phone: e.target.value })}
              placeholder={isRu ? 'Телефон' : 'Телефон'}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="flex-1 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 text-sm">
                {isRu ? 'Добавить магазин' : 'Дүкөн кошуу'}
              </button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 text-sm">
                {isRu ? 'Отмена' : 'Жокко чыгаруу'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Поиск */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isRu ? 'Поиск магазина...' : 'Дүкөн издөө...'}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500" />
      </div>

      {/* Список */}
      <div className="space-y-3">
        {filtered.map(shop => (
          <div key={shop.id} className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Store size={22} className="text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800">{shop.name}</div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} /> {shop.address}, {shop.city}
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-gray-500"><Package size={10} className="inline mr-0.5" /> {shop.orders} {isRu ? 'заказов' : 'заказ'}</span>
                  <span className="text-green-600 font-medium">{shop.totalSpent.toLocaleString('ru-RU')} сом</span>
                  <span className="text-gray-400">{isRu ? 'Посл.:' : 'Акыркы:'} {shop.lastOrder}</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <a href={`tel:${shop.phone}`} className="w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center hover:bg-green-100">
                  <Phone size={16} />
                </a>
                <Link href={`/agent/order?shop=${shop.id}`} className="w-9 h-9 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center hover:bg-slate-200">
                  <Plus size={16} />
                </Link>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">{isRu ? 'Магазины не найдены' : 'Дүкөндөр табылган жок'}</div>
        )}
      </div>
    </div>
  );
}
