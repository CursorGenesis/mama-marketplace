'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import { Play, Pause, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    titleRu: 'Откройте сайт Arzaman.kg',
    titleKg: 'Arzaman.kg сайтын ачыңыз',
    hintRu: 'Нажмите «Войти» в правом верхнем углу',
    hintKg: 'Жогорку оң бурчтагы «Кирүү» баскычын басыңыз',
    arrow: { x: 82, y: 3, labelRu: 'Нажми', labelKg: 'Бас' },
    mock: 'home',
  },
  {
    id: 2,
    titleRu: 'Перейдите к регистрации',
    titleKg: 'Каттоого өтүңүз',
    hintRu: 'Нажмите «Регистрация» под формой входа',
    hintKg: 'Кирүү формасынын астында «Каттоо» басыңыз',
    arrow: { x: 72, y: 80, labelRu: 'Нажми', labelKg: 'Бас' },
    mock: 'auth',
  },
  {
    id: 3,
    titleRu: 'Заполните данные',
    titleKg: 'Маалыматты толтуруңуз',
    hintRu: 'Имя, телефон, email — 30 секунд',
    hintKg: 'Аты, телефону, email — 30 секунд',
    arrow: { x: 50, y: 82, labelRu: 'Готово', labelKg: 'Даяр' },
    mock: 'register',
  },
  {
    id: 4,
    titleRu: 'Откройте каталог',
    titleKg: 'Каталогду ачыңыз',
    hintRu: 'В нижнем меню нажмите «Каталог»',
    hintKg: 'Төмөнкү менюдан «Каталог» басыңыз',
    arrow: { x: 28, y: 92, labelRu: 'Тап', labelKg: 'Бас' },
    mock: 'home2',
  },
  {
    id: 5,
    titleRu: 'Выберите категорию',
    titleKg: 'Категорияны тандаңыз',
    hintRu: 'Например — «Молочные продукты»',
    hintKg: 'Мисалы — «Сүт азыктары»',
    arrow: { x: 30, y: 35, labelRu: 'Тап', labelKg: 'Бас' },
    mock: 'catalog',
  },
  {
    id: 6,
    titleRu: 'Добавьте товар в корзину',
    titleKg: 'Товарды себетке кошуңуз',
    hintRu: 'Нажмите «В корзину» на нужной карточке',
    hintKg: 'Керектүү карточкага «Себетке» басыңыз',
    arrow: { x: 78, y: 70, labelRu: '+ Корзина', labelKg: '+ Себет' },
    mock: 'product',
  },
  {
    id: 7,
    titleRu: 'Откройте корзину',
    titleKg: 'Себетти ачыңыз',
    hintRu: 'Проверьте заказ и нажмите «Оформить»',
    hintKg: 'Заказды текшерип, «Расмилөө» басыңыз',
    arrow: { x: 50, y: 85, labelRu: 'Оформить', labelKg: 'Расмилөө' },
    mock: 'cart',
  },
  {
    id: 8,
    titleRu: '🎉 Заказ оформлен!',
    titleKg: '🎉 Заказ расмилениздөө!',
    hintRu: 'Поставщик получил уведомление. Доставка в среду',
    hintKg: 'Жеткирүүчү билдирүү алды. Шаршембиде жеткирилет',
    arrow: null,
    mock: 'success',
  },
];

const AUTOPLAY_MS = 4000;

export default function TourPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setStep(p => (p + 1) % STEPS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [playing]);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const share = (kind) => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = isRu
      ? `Как сделать заказ в Arzaman.kg за 2 минуты — ${url}`
      : `Arzaman.kg'де 2 мүнөттө заказ — ${url}`;
    if (kind === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    else if (kind === 'tg') window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
    else if (kind === 'copy') navigator.clipboard?.writeText(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-4xl font-black mb-2">
            {isRu ? 'Как сделать заказ' : 'Кантип заказ берүү'}
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            {isRu ? 'От регистрации до доставки — за 2 минуты' : 'Каттоодон жеткирүүгө — 2 мүнөттө'}
          </p>
        </div>

        {/* Индикатор шага */}
        <div className="flex items-center justify-between mb-4 text-xs md:text-sm">
          <span className="text-slate-300 font-mono">{step + 1} / {STEPS.length}</span>
          <span className="text-slate-300 font-semibold truncate max-w-[70%] text-right">
            {isRu ? current.titleRu : current.titleKg}
          </span>
        </div>

        {/* Прогресс-бар */}
        <div className="h-1 bg-slate-700 rounded-full mb-6 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Макет телефона */}
        <div className="flex justify-center mb-6">
          <div className="relative w-[320px] md:w-[360px]">
            {/* Рамка телефона */}
            <div className="relative bg-slate-900 rounded-[40px] p-3 shadow-2xl border-[3px] border-slate-700">
              {/* Notch */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-900 rounded-b-2xl z-20" />

              {/* Экран */}
              <div className="relative bg-white rounded-[30px] overflow-hidden aspect-[9/19.5]">
                <MockScreen type={current.mock} isRu={isRu} />

                {/* Стрелочка и подсветка */}
                {current.arrow && (
                  <>
                    <div
                      className="absolute w-14 h-14 rounded-full border-[3px] border-red-500 animate-ping pointer-events-none"
                      style={{ top: `calc(${current.arrow.y}% - 28px)`, left: `calc(${current.arrow.x}% - 28px)` }}
                    />
                    <div
                      className="absolute w-14 h-14 rounded-full border-[3px] border-red-500 pointer-events-none"
                      style={{ top: `calc(${current.arrow.y}% - 28px)`, left: `calc(${current.arrow.x}% - 28px)` }}
                    />
                    <div
                      className="absolute bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md pointer-events-none whitespace-nowrap"
                      style={{ top: `calc(${current.arrow.y}% + 28px)`, left: `calc(${current.arrow.x}% - 20px)` }}
                    >
                      👉 {isRu ? current.arrow.labelRu : current.arrow.labelKg}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Подсказка */}
        <div className="bg-slate-800/60 backdrop-blur rounded-xl p-4 mb-6 text-center">
          <p className="text-sm md:text-base font-semibold text-white">{isRu ? current.titleRu : current.titleKg}</p>
          <p className="text-xs md:text-sm text-slate-300 mt-1">{isRu ? current.hintRu : current.hintKg}</p>
        </div>

        {/* Управление */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setStep(p => (p - 1 + STEPS.length) % STEPS.length)}
            className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Назад"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            className="w-14 h-14 flex items-center justify-center bg-green-500 hover:bg-green-600 rounded-full transition-colors shadow-lg"
            aria-label={playing ? 'Пауза' : 'Play'}
          >
            {playing ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={() => setStep(p => (p + 1) % STEPS.length)}
            className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Вперёд"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        {/* Точки */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`transition-all rounded-full ${i === step ? 'w-6 h-2 bg-green-500' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
              aria-label={`Шаг ${i + 1}`}
            />
          ))}
        </div>

        {/* CTA + Share */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 md:p-6 text-center mb-4">
          <p className="font-bold text-white text-base md:text-lg mb-2">
            {isRu ? 'Готовы попробовать?' : 'Сынап көрөсүзбү?'}
          </p>
          <p className="text-white/90 text-xs md:text-sm mb-4">
            {isRu ? 'Регистрация — 30 секунд. Без обязательств.' : 'Каттоо — 30 секунд. Милдеттенмесиз.'}
          </p>
          <Link href="/auth" className="inline-block px-8 py-3 bg-white text-green-600 rounded-xl font-bold text-sm md:text-base hover:bg-gray-50 transition-colors">
            {isRu ? 'Зарегистрироваться →' : 'Катталуу →'}
          </Link>
        </div>

        {/* Поделиться */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-400">{isRu ? 'Поделиться:' : 'Бөлүшүү:'}</span>
          <button onClick={() => share('wa')} className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 rounded-lg text-green-300 transition-colors">WhatsApp</button>
          <button onClick={() => share('tg')} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-blue-300 transition-colors">Telegram</button>
          <button onClick={() => share('copy')} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-slate-200 transition-colors flex items-center gap-1">
            <Share2 size={12} /> {isRu ? 'Ссылка' : 'Шилтеме'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ Мок-экраны ============

function MockScreen({ type, isRu }) {
  if (type === 'home') return <MockHome isRu={isRu} />;
  if (type === 'home2') return <MockHome isRu={isRu} loggedIn />;
  if (type === 'auth') return <MockAuth isRu={isRu} />;
  if (type === 'register') return <MockRegister isRu={isRu} />;
  if (type === 'catalog') return <MockCatalog isRu={isRu} />;
  if (type === 'product') return <MockProduct isRu={isRu} />;
  if (type === 'cart') return <MockCart isRu={isRu} />;
  if (type === 'success') return <MockSuccess isRu={isRu} />;
  return null;
}

function MockHome({ isRu, loggedIn }) {
  return (
    <div className="h-full flex flex-col bg-white text-slate-800 text-[9px]">
      {/* Верхняя шапка */}
      <div className="px-2 pt-6 pb-1.5 bg-slate-800 flex items-center justify-between text-white">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 bg-white rounded text-slate-800 flex items-center justify-center font-black text-[10px]">A</div>
        </div>
        <div className="flex items-center gap-1">
          <div className="px-1.5 py-0.5 bg-white/10 rounded text-[7px] flex items-center gap-0.5">🇷🇺 RU</div>
          {loggedIn ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded">
              <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center text-[7px] font-bold">А</div>
            </div>
          ) : (
            <div className="px-2 py-0.5 bg-green-500 text-white rounded text-[8px] font-bold">{isRu ? 'Войти' : 'Кирүү'}</div>
          )}
        </div>
      </div>
      {/* Табы ролей */}
      {!loggedIn && (
        <div className="flex items-center justify-around bg-slate-800 text-white/70 text-[7px] pb-1.5 border-t border-white/10 pt-1">
          <div className="flex items-center gap-0.5">👤 {isRu ? 'Клиент' : 'Кардар'}</div>
          <div className="flex items-center gap-0.5">🏭 {isRu ? 'Поставщик' : 'Жеткирүүчү'}</div>
          <div className="flex items-center gap-0.5">👥 {isRu ? 'Агент' : 'Агент'}</div>
        </div>
      )}
      {/* Hero */}
      <div className="px-3 py-3 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white">
        <div className="font-black text-[9px] mb-0.5 tracking-wide">{isRu ? 'БИЗНЕС БЕЗ ГРАНИЦ' : 'ЧЕК АРАСЫЗ БИЗНЕС'}</div>
        <div className="font-bold text-[10px] leading-tight mb-1">{isRu ? 'B2B маркетплейс поставщиков Кыргызстана' : 'Кыргызстандын B2B жеткирүүчүлөр маркетплейси'}</div>
        <div className="flex gap-1 mt-1.5 mb-2">
          <div className="bg-green-500 text-white px-2 py-1 rounded text-[8px] font-bold">{isRu ? 'Открыть каталог →' : 'Каталог →'}</div>
          <div className="bg-white/10 border border-white/20 text-white px-2 py-1 rounded text-[8px] font-bold">▶ {isRu ? 'Как работает' : 'Кантип'}</div>
        </div>
        {/* Статистика */}
        <div className="grid grid-cols-3 gap-1 mt-2">
          <div className="bg-white/10 rounded p-1 text-center">
            <div className="font-extrabold text-[10px]">8+</div>
            <div className="text-[6px] text-slate-300">{isRu ? 'Поставщиков' : 'Жеткирүүчү'}</div>
          </div>
          <div className="bg-white/10 rounded p-1 text-center">
            <div className="font-extrabold text-[10px]">69+</div>
            <div className="text-[6px] text-slate-300">{isRu ? 'Товаров' : 'Товар'}</div>
          </div>
          <div className="bg-white/10 rounded p-1 text-center">
            <div className="font-extrabold text-[10px]">10</div>
            <div className="text-[6px] text-slate-300">{isRu ? 'Городов' : 'Шаар'}</div>
          </div>
        </div>
      </div>
      {/* Категории */}
      <div className="px-2 py-2 flex-1 overflow-hidden">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-bold">{isRu ? 'По категориям' : 'Категориялар'}</div>
          <div className="text-[8px] text-slate-500">{isRu ? 'Все' : 'Баары'}</div>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { e: '🥖', bg: 'from-yellow-100 to-yellow-200', t: 'text-yellow-800' },
            { e: '🥛', bg: 'from-sky-100 to-sky-200', t: 'text-sky-800' },
            { e: '🥩', bg: 'from-red-100 to-red-200', t: 'text-red-800' },
            { e: '🐟', bg: 'from-cyan-100 to-cyan-300', t: 'text-cyan-800' },
            { e: '🥬', bg: 'from-emerald-100 to-emerald-200', t: 'text-emerald-800' },
            { e: '🍚', bg: 'from-amber-100 to-amber-200', t: 'text-amber-800' },
            { e: '🧴', bg: 'from-lime-100 to-lime-200', t: 'text-lime-800' },
            { e: '🍰', bg: 'from-pink-100 to-pink-200', t: 'text-pink-800' },
          ].map((c, i) => (
            <div key={i} className={`bg-gradient-to-br ${c.bg} rounded-lg p-1 text-center`}>
              <div className="text-lg">{c.e}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Нижняя навигация */}
      <div className="flex justify-around py-1.5 bg-white border-t border-slate-200 text-slate-500 text-[7px]">
        <div className="flex flex-col items-center gap-0.5 text-slate-800"><span className="text-[10px]">🏠</span>{isRu ? 'Главная' : 'Башкы'}</div>
        <div className="flex flex-col items-center gap-0.5"><span className="text-[10px]">🔍</span>{isRu ? 'Каталог' : 'Каталог'}</div>
        <div className="flex flex-col items-center gap-0.5"><span className="text-[10px]">🛒</span>{isRu ? 'Корзина' : 'Себет'}</div>
        <div className="flex flex-col items-center gap-0.5"><span className="text-[10px]">📋</span>{isRu ? 'Заказы' : 'Заказ'}</div>
        <div className="flex flex-col items-center gap-0.5"><span className="text-[10px]">👤</span>{isRu ? 'Профиль' : 'Профиль'}</div>
      </div>
    </div>
  );
}

function MockAuth({ isRu }) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-2 pt-6 pb-1.5 bg-slate-800 flex items-center justify-between text-white">
        <div className="w-5 h-5 bg-white rounded text-slate-800 flex items-center justify-center font-black text-[10px]">A</div>
        <div className="px-1.5 py-0.5 bg-white/10 rounded text-[7px]">🇷🇺 RU</div>
      </div>
      <div className="flex-1 flex items-start justify-center pt-2 px-3 overflow-hidden">
        <div className="bg-white rounded-2xl p-3 w-full shadow-lg">
          {/* Лого-круг */}
          <div className="text-center mb-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg mx-auto flex items-center justify-center mb-1.5">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">{isRu ? 'Вход' : 'Кирүү'}</div>
            <div className="text-[7px] text-slate-500">Arzaman.kg — B2B {isRu ? 'маркетплейс' : 'маркетплейс'}</div>
          </div>
          {/* Соцкнопки */}
          <div className="space-y-1.5">
            <div className="h-7 bg-white border border-slate-200 rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-medium text-slate-700">
              <span className="text-[10px]">🇬</span> Google
            </div>
            <div className="h-7 bg-black rounded-lg flex items-center justify-center gap-1.5 text-[9px] font-medium text-white">
              🍎 Apple
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="h-7 bg-green-500 rounded-lg flex items-center justify-center gap-1 text-[8px] font-medium text-white">WhatsApp</div>
              <div className="h-7 bg-blue-500 rounded-lg flex items-center justify-center gap-1 text-[8px] font-medium text-white">Telegram</div>
            </div>
          </div>
          {/* Разделитель */}
          <div className="relative my-2.5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-white text-slate-400 text-[7px]">{isRu ? 'или по email' : 'же email менен'}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-6 bg-gray-50 rounded-lg border border-gray-200 px-2 text-[8px] flex items-center text-slate-400">Email</div>
            <div className="h-6 bg-gray-50 rounded-lg border border-gray-200 px-2 text-[8px] flex items-center text-slate-400">{isRu ? 'Пароль' : 'Сыр сөз'}</div>
            <div className="bg-slate-800 text-white text-center py-1.5 rounded-lg text-[9px] font-bold">{isRu ? 'Войти' : 'Кирүү'}</div>
            <div className="text-center text-[8px] text-slate-500 pt-1">
              {isRu ? 'Нет аккаунта?' : 'Аккаунт жокпу?'} <span className="text-green-600 font-bold">{isRu ? 'Регистрация' : 'Каттоо'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockRegister({ isRu }) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-2 pt-6 pb-1.5 bg-slate-800 flex items-center justify-between text-white">
        <div className="w-5 h-5 bg-white rounded text-slate-800 flex items-center justify-center font-black text-[10px]">A</div>
        <div className="px-1.5 py-0.5 bg-white/10 rounded text-[7px]">🇷🇺 RU</div>
      </div>
      <div className="flex-1 flex items-start justify-center pt-2 px-3 overflow-hidden">
        <div className="bg-white rounded-2xl p-3 w-full shadow-lg">
          {/* Лого-круг */}
          <div className="text-center mb-2">
            <div className="w-8 h-8 bg-slate-800 rounded-lg mx-auto flex items-center justify-center mb-1.5">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <div className="text-[11px] font-bold text-slate-800">{isRu ? 'Регистрация' : 'Каттоо'}</div>
          </div>
          {/* Поля */}
          <div className="space-y-1.5">
            <div className="h-6 bg-white rounded-lg border-2 border-green-400 px-2 text-[8px] flex items-center text-slate-700">aibek@gmail.com</div>
            <div className="h-6 bg-white rounded-lg border-2 border-green-400 px-2 text-[8px] flex items-center text-slate-700">••••••••</div>
            <div className="h-6 bg-white rounded-lg border-2 border-green-400 px-2 text-[8px] flex items-center text-slate-700">Айбек</div>
            <div className="h-6 bg-white rounded-lg border-2 border-green-400 px-2 text-[8px] flex items-center text-slate-700">+996 555 12 34 56</div>
            {/* Роли — 4 кнопки в 2 ряда */}
            <div className="text-[7px] font-semibold text-slate-600 mt-1">{isRu ? 'Я:' : 'Мен:'}</div>
            <div className="grid grid-cols-2 gap-1">
              <div className="py-1 bg-slate-800 text-white rounded text-[8px] text-center font-bold">🛒 {isRu ? 'Покупатель' : 'Сатып алуучу'}</div>
              <div className="py-1 bg-slate-100 text-slate-500 rounded text-[8px] text-center">🏭 {isRu ? 'Поставщик' : 'Жеткирүүчү'}</div>
              <div className="py-1 bg-slate-100 text-slate-500 rounded text-[8px] text-center">🤝 {isRu ? 'Агент' : 'Агент'}</div>
              <div className="py-1 bg-slate-100 text-slate-500 rounded text-[8px] text-center">🚚 {isRu ? 'Экспедитор' : 'Экспедитор'}</div>
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[7px] text-slate-600">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-sm flex items-center justify-center text-white text-[6px]">✓</div>
              {isRu ? 'Согласен с условиями' : 'Шарттар менен макулмун'}
            </div>
            <div className="bg-green-500 text-white text-center py-1.5 rounded-lg text-[9px] font-bold mt-1.5">✓ {isRu ? 'Зарегистрироваться' : 'Катталуу'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockCatalog({ isRu }) {
  return (
    <div className="h-full flex flex-col bg-slate-50 text-slate-800">
      <div className="flex items-center justify-between px-2 pt-6 pb-2 bg-slate-800 text-white">
        <div className="w-5 h-5 bg-white rounded text-slate-800 flex items-center justify-center font-black text-[10px]">A</div>
        <div className="flex items-center gap-1">
          <div className="px-1.5 py-0.5 bg-white/10 rounded text-[7px]">🇷🇺 RU</div>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[8px] font-bold">А</div>
        </div>
      </div>
      {/* Поиск + фильтры */}
      <div className="px-2 py-2 flex gap-1.5">
        <div className="flex-1 h-6 bg-white rounded-lg border border-slate-200 px-2 text-[8px] flex items-center text-slate-400">🔍 {isRu ? 'Товар или поставщик...' : 'Товар же жеткирүүчү...'}</div>
        <div className="h-6 bg-white rounded-lg border border-slate-200 px-2 text-[8px] flex items-center text-slate-700 font-semibold">⚙ {isRu ? 'Фильтры' : 'Фильтр'}</div>
      </div>
      {/* Назад + категория */}
      <div className="px-2 pb-1.5 flex items-center gap-1.5">
        <div className="text-[8px] text-slate-500">← {isRu ? 'Все категории' : 'Бардык'}</div>
        <div className="text-[9px] font-bold">🥛 {isRu ? 'Молочные продукты' : 'Сүт азыктары'}</div>
      </div>
      {/* Подкатегории */}
      <div className="px-2 pb-1.5 flex gap-1 overflow-x-auto">
        <div className="shrink-0 px-2 py-0.5 bg-slate-800 text-white rounded-full text-[7px] font-semibold">{isRu ? 'Все' : 'Баары'}</div>
        <div className="shrink-0 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[7px] text-slate-700">{isRu ? 'Молоко' : 'Сүт'}</div>
        <div className="shrink-0 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[7px] text-slate-700">{isRu ? 'Кефир' : 'Кефир'}</div>
        <div className="shrink-0 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[7px] text-slate-700">{isRu ? 'Сметана' : 'Каймак'}</div>
        <div className="shrink-0 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[7px] text-slate-700">{isRu ? 'Творог' : 'Сүзмө'}</div>
      </div>
      {/* Баннеры акций */}
      <div className="px-2 space-y-1 mb-1.5">
        <div className="bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded-lg p-1.5 flex items-center gap-1.5">
          <div className="text-sm">📢</div>
          <div className="flex-1">
            <div className="text-[7px] opacity-90">Бишкек Сүт</div>
            <div className="text-[8px] font-bold">{isRu ? 'Скидка 15% на молочку' : '15% арзандатуу'}</div>
          </div>
          <div className="text-[7px]">{isRu ? 'до 20 апр' : '20 апр.'}</div>
        </div>
      </div>
      {/* Табы */}
      <div className="px-2 flex gap-1 mb-1.5">
        <div className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[7px] text-slate-700">{isRu ? 'Поставщики' : 'Жет.'}</div>
        <div className="px-2 py-0.5 bg-slate-800 text-white rounded text-[7px] font-bold">{isRu ? 'Рекомендуем' : 'Сунуш'}</div>
        <div className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[7px] text-slate-700">🇰🇬 {isRu ? 'Сделано в КГ' : 'КГда'}</div>
      </div>
      {/* Товары */}
      <div className="px-2 flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-white rounded-lg border border-slate-200 p-1.5">
            <div className="relative h-10 bg-slate-100 rounded flex items-center justify-center text-xl mb-1">
              🥛
              <div className="absolute top-0.5 left-0.5 text-[6px] bg-amber-400 text-white px-1 rounded">⭐</div>
            </div>
            <div className="text-[8px] font-bold truncate">{isRu ? 'Молоко 1л' : 'Сүт 1л'}</div>
            <div className="text-[6px] text-slate-500 truncate">Бишкек Сүт</div>
            <div className="text-[9px] font-bold text-green-600">95 сом</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-1.5">
            <div className="relative h-10 bg-slate-100 rounded flex items-center justify-center text-xl mb-1">🥄</div>
            <div className="text-[8px] font-bold truncate">{isRu ? 'Сметана 400г' : 'Каймак'}</div>
            <div className="text-[6px] text-slate-500 truncate">Бишкек Сүт</div>
            <div className="text-[9px] font-bold text-green-600">125 сом</div>
          </div>
        </div>
      </div>
      <div className="flex justify-around py-1.5 bg-white border-t border-slate-200 text-slate-500 text-[7px]">
        <div className="flex flex-col items-center gap-0.5"><span>🏠</span>{isRu ? 'Главная' : 'Башкы'}</div>
        <div className="flex flex-col items-center gap-0.5 text-slate-800"><span>🔍</span>{isRu ? 'Каталог' : 'Каталог'}</div>
        <div className="flex flex-col items-center gap-0.5"><span>🛒</span>{isRu ? 'Корзина' : 'Себет'}</div>
        <div className="flex flex-col items-center gap-0.5"><span>📋</span>{isRu ? 'Заказы' : 'Заказ'}</div>
        <div className="flex flex-col items-center gap-0.5"><span>👤</span>{isRu ? 'Профиль' : 'Профиль'}</div>
      </div>
    </div>
  );
}

function MockProduct({ isRu }) {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex items-center justify-between px-2 pt-6 pb-2 bg-slate-800 text-white">
        <div className="w-5 h-5 bg-white rounded text-slate-800 flex items-center justify-center font-black text-[10px]">A</div>
        <div className="flex items-center gap-1">
          <div className="px-1.5 py-0.5 bg-white/10 rounded text-[7px]">🇷🇺 RU</div>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[8px] font-bold">А</div>
        </div>
      </div>
      <div className="px-2 py-2 flex items-center gap-1.5">
        <div className="flex-1 h-6 bg-white rounded-lg border border-slate-200 px-2 text-[8px] flex items-center text-slate-400">🔍 {isRu ? 'Поиск' : 'Издөө'}</div>
      </div>
      <div className="px-2 text-[9px] font-bold mb-1.5">🥛 {isRu ? 'Молочные продукты' : 'Сүт азыктары'}</div>
      <div className="px-2 flex-1">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { name: 'Молоко 1л', kg: 'Сүт 1л', price: 95, seller: 'Бишкек Сүт', img: '🥛', rec: true },
            { name: 'Сметана 400г', kg: 'Каймак 400г', price: 125, seller: 'Бишкек Сүт', img: '🥄' },
            { name: 'Кефир 1л', kg: 'Кефир 1л', price: 90, seller: 'Бишкек Сүт', img: '🥤' },
            { name: 'Творог 200г', kg: 'Сүзмө 200г', price: 110, seller: 'Ак-Суу', img: '🧀', rec: true },
          ].map((p, i) => (
            <div key={i} className="bg-white rounded-lg border border-slate-200 p-1.5 relative">
              <div className="relative h-12 bg-slate-100 rounded flex items-center justify-center text-2xl mb-1">
                {p.img}
                {p.rec && <div className="absolute top-0.5 left-0.5 text-[5px] bg-amber-400 text-white px-1 py-0.5 rounded-full font-bold">⭐ {isRu ? 'Рекомен.' : 'Сунуш'}</div>}
              </div>
              <div className="text-[8px] font-bold text-slate-800 truncate">{isRu ? p.name : p.kg}</div>
              <div className="text-[6px] text-slate-500 truncate">{p.seller}</div>
              <div className="flex items-center justify-between mt-0.5">
                <div className="text-[10px] font-black text-green-600">{p.price} сом</div>
              </div>
              <div className="bg-green-500 text-white text-center py-1 rounded text-[8px] font-bold mt-1">
                + {isRu ? 'В корзину' : 'Себетке'}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-around py-1.5 bg-white border-t border-slate-200 text-slate-500 text-[7px]">
        <div className="flex flex-col items-center gap-0.5"><span>🏠</span>{isRu ? 'Главная' : 'Башкы'}</div>
        <div className="flex flex-col items-center gap-0.5 text-slate-800"><span>🔍</span>{isRu ? 'Каталог' : 'Каталог'}</div>
        <div className="flex flex-col items-center gap-0.5"><span>🛒</span>{isRu ? 'Корзина' : 'Себет'}</div>
        <div className="flex flex-col items-center gap-0.5"><span>📋</span>{isRu ? 'Заказы' : 'Заказ'}</div>
        <div className="flex flex-col items-center gap-0.5"><span>👤</span>{isRu ? 'Профиль' : 'Профиль'}</div>
      </div>
    </div>
  );
}

function MockCart({ isRu }) {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex items-center justify-between px-2 pt-6 pb-2 bg-slate-800 text-white">
        <div className="w-5 h-5 bg-white rounded text-slate-800 flex items-center justify-center font-black text-[10px]">A</div>
        <div className="flex items-center gap-1">
          <div className="px-1.5 py-0.5 bg-white/10 rounded text-[7px]">🇷🇺 RU</div>
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[8px] font-bold">А</div>
        </div>
      </div>
      <div className="px-2 py-2 flex items-center justify-between">
        <div className="text-[11px] font-black text-slate-800">🛒 {isRu ? 'Корзина' : 'Себет'}</div>
        <div className="text-[8px] text-slate-500">10 {isRu ? 'товаров' : 'товар'}</div>
      </div>
      {/* Поставщик */}
      <div className="px-2 mb-1.5">
        <div className="bg-white rounded-lg p-2 shadow-sm">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
            <div className="w-5 h-5 bg-sky-100 rounded flex items-center justify-center text-[10px]">🏭</div>
            <div className="text-[9px] font-bold text-slate-800">Бишкек Сүт</div>
            <div className="ml-auto text-[7px] text-green-600 font-semibold">🚚 {isRu ? 'Доставка: ср 24 апр' : 'Жеткирүү: шрб'}</div>
          </div>
          {[
            { name: 'Молоко 1л', kg: 'Сүт 1л', qty: 5, price: 95, img: '🥛' },
            { name: 'Сметана 400г', kg: 'Каймак 400г', qty: 3, price: 125, img: '🥄' },
            { name: 'Кефир 1л', kg: 'Кефир 1л', qty: 2, price: 90, img: '🥤' },
          ].map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 py-1 border-b border-slate-50 last:border-0">
              <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center text-sm">{p.img}</div>
              <div className="flex-1">
                <div className="text-[8px] font-bold text-slate-800">{isRu ? p.name : p.kg}</div>
                <div className="text-[7px] text-slate-500">{p.price} сом × {p.qty}</div>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 rounded px-1 py-0.5">
                <div className="text-[8px] font-bold">−</div>
                <div className="text-[8px] font-bold px-1">{p.qty}</div>
                <div className="text-[8px] font-bold">+</div>
              </div>
              <div className="text-[8px] font-bold text-slate-800 w-10 text-right">{p.qty * p.price}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-2 flex-1">
        {/* Адрес */}
        <div className="bg-white rounded-lg p-2 mb-1.5 shadow-sm">
          <div className="text-[8px] font-bold text-slate-700 mb-1">📍 {isRu ? 'Доставка' : 'Жеткирүү'}</div>
          <div className="text-[8px] text-slate-500 truncate">{isRu ? 'Бишкек, ул. Токтогула 12' : 'Бишкек, Токтогула көч. 12'}</div>
        </div>
        {/* Итого */}
        <div className="bg-white rounded-lg p-2 mb-1.5 shadow-sm">
          <div className="flex items-center justify-between text-[8px] text-slate-500 mb-0.5">
            <span>{isRu ? 'Товары:' : 'Товарлар:'}</span>
            <span>1 030 сом</span>
          </div>
          <div className="flex items-center justify-between text-[8px] text-slate-500 mb-0.5">
            <span>{isRu ? 'Доставка:' : 'Жеткирүү:'}</span>
            <span className="text-green-600">{isRu ? 'Бесплатно' : 'Бекер'}</span>
          </div>
          <div className="h-px bg-slate-100 my-1"></div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-black text-slate-800">{isRu ? 'Итого:' : 'Жыйынтык:'}</div>
            <div className="text-[14px] font-black text-green-600">1 030 сом</div>
          </div>
        </div>
      </div>
      <div className="px-2 pb-2">
        <div className="bg-green-500 text-white text-center py-2.5 rounded-xl text-[10px] font-bold shadow-lg">
          ✓ {isRu ? 'Оформить заказ' : 'Заказ расмилөө'}
        </div>
      </div>
    </div>
  );
}

function MockSuccess({ isRu }) {
  return (
    <div className="h-full bg-gradient-to-br from-green-500 to-emerald-600 flex flex-col items-center justify-center text-white p-4">
      <div className="text-6xl mb-4 animate-bounce">🎉</div>
      <div className="text-center font-black text-base mb-2">
        {isRu ? 'Заказ оформлен!' : 'Заказ расмиленди!'}
      </div>
      <div className="text-[10px] text-white/90 text-center mb-4">
        {isRu ? '№1042 · Поставщик уведомлён' : '№1042 · Жеткирүүчү билгиленди'}
      </div>
      <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-[9px] text-center mb-2">
        <div className="font-bold mb-0.5">🚚 {isRu ? 'Доставка в среду' : 'Шаршембиде жеткирилет'}</div>
        <div className="text-white/80">{isRu ? 'Мы пришлём Telegram' : 'Telegramга жазабыз'}</div>
      </div>
      <div className="bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-[9px]">
        <div className="font-bold">💎 +2 {isRu ? 'монетки' : 'монета'}</div>
      </div>
    </div>
  );
}
