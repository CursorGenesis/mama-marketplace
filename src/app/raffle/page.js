'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Gift, Trophy, Clock, Star, Users, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import Link from 'next/link';

// Пороги статусов — должны совпадать с логикой в src/lib/firestore.js
const computeStatus = (coins) => coins >= 150 ? 'gold' : coins >= 50 ? 'silver' : 'bronze';

const PRIZES = [
  { id: 1, name: 'Скидка 10% на 3 месяца', nameKg: '3 айга 10% арзандатуу', icon: '🎁', quantity: 1, tier: 'grand', description: 'До 20 000 сом скидки • макс 2 000 сом за заказ', descriptionKg: '20 000 сомго чейин • ар бир заказда 2 000 сомго чейин' },
  { id: 2, name: 'Скидка 10% на 1 месяц', nameKg: '1 айга 10% арзандатуу', icon: '💸', quantity: 3, tier: 'main', description: 'До 5 000 сом скидки', descriptionKg: '5 000 сомго чейин арзандатуу' },
  { id: 3, name: 'Бонус 2 000 сом на заказ', nameKg: '2 000 сом заказ бонусу', icon: '🪙', quantity: 5, tier: 'main', description: 'Единоразовая скидка на следующий заказ', descriptionKg: 'Кийинки заказга бир жолку арзандатуу' },
  { id: 4, name: 'Бонус 500 сом на заказ', nameKg: '500 сом заказ бонусу', icon: '🎟️', quantity: 10, tier: 'bonus', description: 'Единоразовая скидка на следующий заказ', descriptionKg: 'Кийинки заказга бир жолку арзандатуу' },
];

// Правила начисления — должны точно соответствовать коду в src/lib/firestore.js (updateOrderStatus → 'received').
// Ничего не выдумывать: пользователь увидит обещание — система обязана его выполнить.
const EARN_RULES = [
  { action: 'Каждые 500 сом в заказе (после получения)', actionKg: 'Заказдагы ар бир 500 сом (алгандан кийин)', coins: '+1', icon: '🛒' },
];

const TICKET_TIERS = [
  { min: 100, max: 299, tickets: 1, orderAmount: '50 000 сом/мес', orderAmountKg: '50 000 сом/ай' },
  { min: 300, max: 499, tickets: 3, orderAmount: '150 000 сом/мес', orderAmountKg: '150 000 сом/ай' },
  { min: 500, max: 999, tickets: 5, orderAmount: '250 000 сом/мес', orderAmountKg: '250 000 сом/ай' },
  { min: 1000, max: null, tickets: 10, orderAmount: '500 000+ сом/мес', orderAmountKg: '500 000+ сом/ай' },
];

export default function RafflePage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const { user, profile } = useAuth();
  const [showRules, setShowRules] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Реальные коины пользователя из его профиля. Если не залогинен — 0.
  const userCoins = Number(profile?.coins) || 0;
  const userStatus = profile?.coinStatus || computeStatus(userCoins);

  // Дата следующего квартального розыгрыша — ОДНА для всех клиентов, не «+45 дней от визита».
  // Меняется админом раз в квартал в коде (или в будущем через админку).
  const RAFFLE_DATE = new Date('2026-06-30T20:00:00+06:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = RAFFLE_DATE - now;
      if (diff <= 0) { clearInterval(timer); setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const statusConfig = {
    bronze: { label: isRu ? 'Бронза' : 'Коло', color: 'from-amber-600 to-amber-700', icon: '🥉', next: 50 },
    silver: { label: isRu ? 'Серебро' : 'Күмүш', color: 'from-gray-400 to-gray-500', icon: '🥈', next: 150 },
    gold: { label: isRu ? 'Золото' : 'Алтын', color: 'from-yellow-400 to-yellow-500', icon: '🥇', next: null },
  };
  const status = statusConfig[userStatus];
  const nextStatus = userStatus === 'bronze' ? statusConfig.silver : userStatus === 'silver' ? statusConfig.gold : null;
  const progress = nextStatus ? (userCoins / status.next) * 100 : 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
          <Gift size={16} /> {isRu ? 'Акция' : 'Акция'}
        </div>
        <h1 className="text-3xl font-bold mb-2">{isRu ? 'Собери монетки — выиграй скидки!' : 'Монеталарды чогулт — арзандатуу ут!'}</h1>
        <p className="text-gray-500">{isRu ? 'Заказывайте, копите монетки и участвуйте в розыгрыше скидок на будущие заказы' : 'Заказ кылыңыз, монета чогултуңуз жана келечектеги заказдарга арзандатуу розыгрышына катышыңыз'}</p>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white text-center mb-6">
        <p className="text-sm opacity-80 mb-2">{isRu ? 'До следующего розыгрыша' : 'Кийинки розыгрышка чейин'}</p>
        <div className="flex justify-center gap-4">
          {[
            { value: timeLeft.days, label: isRu ? 'дней' : 'күн' },
            { value: timeLeft.hours, label: isRu ? 'часов' : 'саат' },
            { value: timeLeft.minutes, label: isRu ? 'минут' : 'мүнөт' },
            { value: timeLeft.seconds, label: isRu ? 'секунд' : 'секунд' },
          ].map((t, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold tabular-nums">{String(t.value).padStart(2, '0')}</div>
              <div className="text-xs opacity-70">{t.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs opacity-60 mt-3">{isRu ? 'Розыгрыш раз в 3 месяца • 19 победителей' : 'Розыгрыш 3 айда 1 жолу • 19 жеңүүчү'}</p>
      </div>

      {/* Незалогиненный пользователь — приглашение войти */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <LogIn size={24} />
            <h2 className="font-bold text-lg">{isRu ? 'Войдите чтобы начать копить' : 'Чогултуу үчүн кириңиз'}</h2>
          </div>
          <p className="text-sm opacity-90 mb-3">
            {isRu
              ? 'Без аккаунта монетки не сохраняются. Войдите или зарегистрируйтесь — это бесплатно.'
              : 'Аккаунтсуз монета сакталбайт. Кириңиз же катталыңыз — акысыз.'}
          </p>
          <Link href="/auth" className="inline-flex items-center gap-2 px-5 py-2 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors">
            {isRu ? 'Войти / Зарегистрироваться' : 'Кирүү / Катталуу'} →
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">🪙 {isRu ? 'Мои монетки' : 'Менин монеталарым'}</h2>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white bg-gradient-to-r ${status.color}`}>
            {status.icon} {status.label}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="text-4xl font-bold text-yellow-500">{userCoins}</div>
          <div className="text-sm text-gray-500">
            {userCoins >= 100
              ? (isRu ? `монеток за этот месяц → ${userCoins >= 1000 ? 10 : userCoins >= 500 ? 5 : userCoins >= 300 ? 3 : 1} билетов в розыгрыше 🎫` : `бул айдагы монета → ${userCoins >= 1000 ? 10 : userCoins >= 500 ? 5 : userCoins >= 300 ? 3 : 1} билет`)
              : (isRu ? `монеток за этот месяц. До участия ещё ${100 - userCoins}` : `бул айдагы монета. Катышууга дагы ${100 - userCoins}`)}
          </div>
        </div>
        {nextStatus && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{status.icon} {status.label}</span>
              <span>{nextStatus.icon} {nextStatus.label} ({status.next})</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{isRu ? `Ещё ${status.next - userCoins} до ${nextStatus.label}` : `${nextStatus.label} үчүн дагы ${status.next - userCoins}`}</p>
          </div>
        )}
      </div>

      {/* Градация билетов — чем больше монеток в месяц, тем больше билетов в розыгрыше */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🎫 {isRu ? 'Шкала билетов' : 'Билет шкаласы'}
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          {isRu
            ? 'Чем больше монеток за месяц — тем больше билетов. Билеты за 3 месяца суммируются и участвуют в розыгрыше.'
            : 'Ар бир айда канча көп монета — ошончо көп билет. 3 айдын билеттери кошулуп, розыгрышка катышат.'}
        </p>
        <div className="space-y-2">
          {TICKET_TIERS.map((tier, i) => {
            const inTier = userCoins >= tier.min && (tier.max === null || userCoins <= tier.max);
            return (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-colors ${inTier ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${inTier ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {tier.min}{tier.max ? `-${tier.max}` : '+'}
                  </div>
                  <div>
                    <div className="text-sm text-gray-700">{isRu ? 'монеток/мес' : 'монета/ай'}</div>
                    <div className="text-xs text-gray-400">{isRu ? tier.orderAmount : tier.orderAmountKg}</div>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${inTier ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {tier.tickets} 🎫
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-xl text-xs text-blue-700">
          💡 {isRu
            ? 'Пример: 200 монеток в январе (1 билет) + 400 в феврале (3 билета) + 600 в марте (5 билетов) = 9 билетов в квартальном розыгрыше.'
            : 'Мисал: январда 200 монета (1 билет) + февралда 400 (3 билет) + мартта 600 (5 билет) = 9 билет.'}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Trophy size={20} className="text-yellow-500" /> {isRu ? 'Призы розыгрыша' : 'Розыгрыш сыйлыктары'}
        </h2>
        <div className="space-y-3">
          {PRIZES.filter(p => p.tier === 'grand').map(prize => (
            <div key={prize.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-5 text-center">
              <div className="text-5xl mb-2">{prize.icon}</div>
              <div className="text-xs text-yellow-700 font-bold uppercase mb-1">{isRu ? 'Гран-при' : 'Гран-при'}</div>
              <h3 className="text-xl font-bold text-gray-800">{isRu ? prize.name : prize.nameKg}</h3>
              <p className="text-sm text-gray-500">{prize.quantity} {isRu ? 'шт' : 'даана'}</p>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            {PRIZES.filter(p => p.tier === 'main').map(prize => (
              <div key={prize.id} className="bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
                <div className="text-3xl mb-2">{prize.icon}</div>
                <h3 className="font-bold text-gray-800 text-sm">{isRu ? prize.name : prize.nameKg}</h3>
                <p className="text-xs text-gray-400">{isRu ? prize.description : prize.descriptionKg}</p>
                <p className="text-xs text-green-600 font-bold mt-1">{prize.quantity} {isRu ? 'шт' : 'даана'}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {PRIZES.filter(p => p.tier === 'bonus').map(prize => (
              <div key={prize.id} className="bg-gray-50 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{prize.icon}</div>
                <h3 className="font-medium text-gray-700 text-sm">{isRu ? prize.name : prize.nameKg}</h3>
                <p className="text-xs text-green-600 font-bold">{prize.quantity} {isRu ? 'шт' : 'даана'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <button onClick={() => setShowRules(!showRules)} className="w-full flex items-center justify-between">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" /> {isRu ? 'Как заработать монетки' : 'Монеталарды кантип табуу'}
          </h2>
          {showRules ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
        </button>
        {showRules && (
          <div className="mt-4 space-y-2">
            {EARN_RULES.map((rule, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="text-xl">{rule.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">{isRu ? rule.action : rule.actionKg}</div>
                </div>
                <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-bold">{rule.coins}</div>
              </div>
            ))}
            <div className="bg-red-50 rounded-xl p-3 mt-3">
              <p className="text-xs text-red-600">{isRu ? '⚠️ Монетки сгорают через 120 дней без заказов. Заказывайте регулярно!' : '⚠️ Монеталар 120 күн заказсыз болсо күйүп кетет. Үзгүлтүксүз заказ кылыңыз!'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Users size={20} className="text-yellow-500" /> {isRu ? 'Статусы' : 'Статустар'}
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '🥉', name: isRu ? 'Бронза' : 'Коло', range: '0-49', color: 'bg-amber-50 border-amber-200', active: userStatus === 'bronze' },
            { icon: '🥈', name: isRu ? 'Серебро' : 'Күмүш', range: '50-149', color: 'bg-gray-50 border-gray-300', active: userStatus === 'silver' },
            { icon: '🥇', name: isRu ? 'Золото' : 'Алтын', range: '150+', color: 'bg-yellow-50 border-yellow-300', active: userStatus === 'gold' },
          ].map((s, i) => (
            <div key={i} className={`text-center p-3 rounded-xl border-2 ${s.color} ${s.active ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bold text-sm">{s.name}</div>
              <div className="text-xs text-gray-400">{s.range} {isRu ? 'монеток' : 'монета'}</div>
              {s.active && <div className="text-xs text-green-600 font-bold mt-1">{isRu ? 'Ваш статус' : 'Сиздин статус'}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Заглушка — первый розыгрыш ещё не проводился (30.06.2026). После него сюда подгрузим реальных победителей. */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 mb-6 text-center">
        <Trophy size={32} className="text-yellow-500 mx-auto mb-2" />
        <h2 className="font-bold text-gray-800 mb-1">
          {isRu ? 'Розыгрыш ещё не проводился' : 'Розыгрыш дагы өткөн эмес'}
        </h2>
        <p className="text-sm text-gray-600">
          {isRu
            ? 'Стань первым победителем — копи монетки уже сейчас!'
            : 'Биринчи жеңүүчү бол — азыр эле монета чогулт!'}
        </p>
      </div>

      {/* Важное условие */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800 font-semibold mb-1">⚠️ {isRu ? 'Важно!' : 'Маанилүү!'}</p>
        <p className="text-sm text-amber-700">
          {isRu
            ? 'Монетки начисляются только после подтверждения получения товара. После доставки зайдите в «Мои заказы» и нажмите «Получил». Без подтверждения монетки не засчитываются.'
            : 'Монеталар товарды алганыңызды ырастагандан кийин гана чегерилет. Жеткирүүдөн кийин «Менин заказдарым» бөлүмүнө кирип, «Алдым» басыңыз. Ырастоосуз монеталар эсептелбейт.'}
        </p>
      </div>

      <div className="text-center">
        <Link href="/catalog" className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg">
          🛒 {isRu ? 'Заказать и получить монетки' : 'Заказ кылуу жана монета алуу'}
        </Link>
        <p className="text-xs text-gray-400 mt-3">{isRu ? 'Минимум 100 монеток за месяц для участия в розыгрыше' : 'Розыгрышка катышуу үчүн ар бир айда 100 монета'}</p>
      </div>
    </div>
  );
}
