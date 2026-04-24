'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import {
  ShoppingCart, Package, Users, ArrowRight, Check, X, Gift,
  Search, Bell, TrendingUp, Store, Phone, MessageCircle, Zap,
  Share2, Copy, Sparkles, Rocket,
} from 'lucide-react';

const ROLES = [
  { id: 'client', emoji: '🛒', labelRu: 'Клиент', labelKg: 'Кардар', color: 'blue' },
  { id: 'supplier', emoji: '📦', labelRu: 'Поставщик', labelKg: 'Жеткирүүчү', color: 'slate' },
  { id: 'agent', emoji: '🤝', labelRu: 'Агент', labelKg: 'Агент', color: 'green' },
];

// Хук: появление при скролле
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true);
        obs.unobserve(el);
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// Анимированный счётчик
function AnimatedNumber({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const [ref, visible] = useReveal();

  useEffect(() => {
    if (!visible) return;
    if (isNaN(parseFloat(value))) { setDisplay(value); return; }
    const num = parseFloat(value);
    const duration = 1500;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(num * eased));
      if (progress >= 1) {
        setDisplay(num);
        clearInterval(timer);
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// Блок с появлением
function RevealBlock({ children, delay = 0, className = '' }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref}
      className={`transition-all duration-700 ${className} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [role, setRole] = useState('client');
  const [roleLocked, setRoleLocked] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Читаем роль из URL ?role=client|supplier|agent — скрываем переключатель если задана
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole && ['client', 'supplier', 'agent'].includes(urlRole)) {
      setRole(urlRole);
      setRoleLocked(true);
    }
  }, []);

  const current = CONTENT[role];
  const steps = current.steps[isRu ? 'ru' : 'kg'];

  // Автопереключение шагов
  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex(prev => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [steps.length]);

  // Сброс шагов при смене роли
  useEffect(() => { setStepIndex(0); }, [role]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Анимированный фон */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-40 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white py-12 md:py-20 overflow-hidden">
        {/* Плавающие элементы на фоне */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute text-4xl opacity-10 animate-bounce" style={{top: '10%', left: '5%', animationDuration: '3s'}}>🚚</div>
          <div className="absolute text-3xl opacity-10 animate-bounce" style={{top: '30%', right: '10%', animationDuration: '4s', animationDelay: '0.5s'}}>📦</div>
          <div className="absolute text-4xl opacity-10 animate-bounce" style={{bottom: '20%', left: '20%', animationDuration: '3.5s', animationDelay: '1s'}}>🛒</div>
          <div className="absolute text-3xl opacity-10 animate-bounce" style={{bottom: '30%', right: '20%', animationDuration: '4.5s', animationDelay: '1.5s'}}>🎁</div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <RevealBlock>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full text-xs md:text-sm font-semibold mb-4">
              <Sparkles size={14} className="text-yellow-400" />
              {isRu ? 'Маркетплейс будущего уже здесь' : 'Келечектин маркетплейси ушул жерде'}
            </div>
          </RevealBlock>

          <RevealBlock delay={100}>
            <h1 className="text-3xl md:text-6xl font-extrabold mb-4 leading-tight">
              {isRu ? (
                <>Как работает <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Arzaman</span></>
              ) : (
                <>Arzaman <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">кантип иштейт</span></>
              )}
            </h1>
          </RevealBlock>

          <RevealBlock delay={200}>
            <p className="text-slate-300 text-base md:text-xl max-w-2xl mx-auto mb-6 md:mb-10">
              {isRu
                ? 'B2B маркетплейс Кыргызстана. Поставщики, магазины, агенты — на одной платформе'
                : 'Кыргызстандын B2B маркетплейси. Жеткирүүчүлөр, дүкөндөр, агенттер — бир платформада'}
            </p>
          </RevealBlock>

          {/* Переключатель ролей — скрыт если роль задана через URL */}
          {!roleLocked && (
            <RevealBlock delay={300}>
              <div className="inline-flex bg-white/10 backdrop-blur-lg rounded-2xl p-2 shadow-2xl flex-wrap gap-1 justify-center">
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => setRole(r.id)}
                    className={`relative px-4 md:px-6 py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                      role === r.id
                        ? 'bg-white text-slate-900 shadow-lg scale-105'
                        : 'text-white hover:bg-white/10'
                    }`}>
                    <span className="text-lg mr-1.5">{r.emoji}</span>
                    {isRu ? r.labelRu : r.labelKg}
                    {role === r.id && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </RevealBlock>
          )}
        </div>
      </section>

      {/* Узнали себя? */}
      <section className="relative max-w-5xl mx-auto px-4 py-12 md:py-20">
        <RevealBlock>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-700 rounded-full text-xs md:text-sm font-bold mb-3">
              <X size={14} /> {isRu ? 'Боли которые знакомы' : 'Тааныш көйгөйлөр'}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
              {isRu ? 'Узнали себя?' : 'Өзүңүздү таанып жатасызбы?'}
            </h2>
            <p className="text-gray-500 text-sm md:text-lg max-w-xl mx-auto">
              {isRu ? 'Если хотя бы одно вам знакомо — Arzaman решит это' : 'Эгер кеминде бирөө тааныш болсо — Arzaman муну чечет'}
            </p>
          </div>
        </RevealBlock>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {current.pains[isRu ? 'ru' : 'kg'].map((pain, i) => (
            <RevealBlock key={i} delay={i * 100}>
              <div className="group bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-100 rounded-2xl p-5 md:p-6 flex items-start gap-4 hover:scale-[1.02] hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform duration-300 shadow-lg">
                  <X size={24} className="text-white" strokeWidth={3} />
                </div>
                <p className="text-gray-800 font-medium text-sm md:text-base leading-relaxed pt-2">{pain}</p>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* Решения */}
      <section className="relative py-12 md:py-20 bg-gradient-to-b from-green-50/50 to-transparent">
        <div className="max-w-5xl mx-auto px-4">
          <RevealBlock>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-xs md:text-sm font-bold mb-3">
                <Check size={14} /> {isRu ? 'Наши решения' : 'Биздин чечимдер'}
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
                {isRu ? 'Arzaman помогает так' : 'Arzaman мындай жардам берет'}
              </h2>
            </div>
          </RevealBlock>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.solutions[isRu ? 'ru' : 'kg'].map((s, i) => (
              <RevealBlock key={i} delay={i * 100}>
                <div className="group bg-white border-2 border-green-100 rounded-2xl p-5 md:p-6 flex items-start gap-4 shadow-md hover:shadow-2xl hover:border-green-300 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Check size={24} className="text-white" strokeWidth={3} />
                  </div>
                  <p className="text-gray-800 font-medium text-sm md:text-base leading-relaxed pt-2">{s}</p>
                </div>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* Пошаговая инструкция — интерактивная */}
      <section className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
        <RevealBlock>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-bold mb-3">
              <Rocket size={14} /> {isRu ? 'Пошаговая инструкция' : 'Кадам-кадам көрсөтмө'}
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">
              {isRu ? 'Как начать?' : 'Кантип баштоо?'}
            </h2>
            <p className="text-gray-500 text-sm md:text-lg">
              {isRu ? 'От регистрации до первого дохода — всего несколько шагов' : 'Каттоодон биринчи кирешеге — бир нече кадам'}
            </p>
          </div>
        </RevealBlock>

        {/* Таймлайн-индикатор */}
        <div className="flex items-center justify-center gap-1.5 mb-8">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStepIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === stepIndex ? 'w-12 bg-slate-900' : i < stepIndex ? 'w-8 bg-slate-400' : 'w-8 bg-gray-200'
              }`} />
          ))}
        </div>

        {/* Большой экран с текущим шагом */}
        <RevealBlock>
          <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Левая — описание */}
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <div className="text-xs md:text-sm font-bold text-gray-400 mb-2 tracking-widest">
                  {isRu ? 'ШАГ' : 'КАДАМ'} {stepIndex + 1} / {steps.length}
                </div>
                <div className="text-5xl md:text-7xl mb-4 transition-transform duration-500" key={stepIndex}>
                  <span className="inline-block animate-bounce">{steps[stepIndex].icon}</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3">
                  {steps[stepIndex].title}
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                  {steps[stepIndex].desc}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
                    disabled={stepIndex === 0}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 rounded-xl font-semibold text-sm transition-colors">
                    ← {isRu ? 'Назад' : 'Артка'}
                  </button>
                  <button onClick={() => setStepIndex((stepIndex + 1) % steps.length)}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors">
                    {isRu ? 'Далее' : 'Кийинки'} →
                  </button>
                </div>
              </div>

              {/* Правая — визуализация */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 p-6 md:p-10 min-h-[300px] md:min-h-[400px] flex items-center justify-center overflow-hidden">
                {/* Мок экрана */}
                <div className="relative w-full max-w-xs mx-auto bg-white rounded-3xl shadow-2xl p-4 transition-all duration-500" key={stepIndex}>
                  <div className="bg-gray-100 rounded-full w-16 h-1.5 mx-auto mb-3" />
                  {steps[stepIndex].mock ? steps[stepIndex].mock(isRu) : (
                    <div className="py-10 text-center">
                      <div className="text-5xl mb-2">{steps[stepIndex].icon}</div>
                      <div className="text-sm text-gray-600 font-medium">{steps[stepIndex].title}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </RevealBlock>

        {/* Все шаги в одну линию (миниатюры) */}
        <div className="mt-8 grid grid-cols-5 gap-2 md:gap-3">
          {steps.map((step, i) => (
            <button key={i} onClick={() => setStepIndex(i)}
              className={`p-3 md:p-4 rounded-xl transition-all ${
                i === stepIndex
                  ? 'bg-slate-900 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              <div className="text-2xl mb-1">{step.icon}</div>
              <div className="text-[10px] md:text-xs font-semibold leading-tight line-clamp-2">
                {step.title}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Цифры */}
      <section className="relative max-w-5xl mx-auto px-4 py-12 md:py-20">
        <RevealBlock>
          <div className={`relative bg-gradient-to-br ${current.color} rounded-3xl p-8 md:p-14 text-white overflow-hidden shadow-2xl`}>
            {/* Декор */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-bold text-center mb-2">
                {isRu ? 'Что вы получаете' : 'Сиз эмне аласыз'}
              </h2>
              <p className="text-center text-white/80 mb-10 text-sm md:text-lg">
                {isRu ? 'Конкретные цифры без воды' : 'Так конкреттүү цифралар'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {current.numbers.map((n, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl md:text-6xl font-extrabold mb-2 drop-shadow-lg">
                      {typeof n.value === 'string' && /^\d/.test(n.value)
                        ? <AnimatedNumber value={n.value} suffix={n.value.replace(/^\d+/, '')} />
                        : n.value}
                    </div>
                    <div className="text-xs md:text-sm text-white/90 font-medium uppercase tracking-wider">
                      {isRu ? n.labelRu : n.labelKg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </RevealBlock>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
        <RevealBlock>
          <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-3xl p-8 md:p-14 text-white overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute text-8xl opacity-5" style={{top: '-20%', right: '-10%'}}>{current.emoji}</div>
            </div>
            <div className="relative">
              <Sparkles size={40} className="text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                {isRu ? 'Готовы начать?' : 'Баштоого даярсызбы?'}
              </h2>
              <p className="text-slate-300 mb-8 text-sm md:text-lg max-w-xl mx-auto">
                {isRu ? current.ctaDescRu : current.ctaDescKg}
              </p>
              <Link href={current.ctaHref}
                className="inline-flex items-center gap-2 px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white rounded-2xl font-bold text-lg md:text-xl shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-105 group">
                {isRu ? current.ctaBtnRu : current.ctaBtnKg}
                <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </RevealBlock>

        {/* Поделиться */}
        <RevealBlock delay={200}>
          <div className="mt-8 bg-white rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100">
            <p className="text-sm text-gray-600 mb-4 flex items-center justify-center gap-2">
              <Share2 size={16} /> {isRu ? 'Поделитесь с друзьями:' : 'Досторуңуз менен бөлүшүңүз:'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <ShareButton platform="whatsapp" lang={lang} />
              <ShareButton platform="telegram" lang={lang} />
              <ShareButton platform="copy" lang={lang} />
            </div>
          </div>
        </RevealBlock>
      </section>
    </div>
  );
}

function ShareButton({ platform, lang }) {
  const isRu = lang === 'ru';
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/mama-marketplace/how-it-works`
    : 'https://cursorgenesis.github.io/mama-marketplace/how-it-works';
  const text = isRu
    ? 'Arzaman — B2B маркетплейс Кыргызстана. Посмотрите как работает:'
    : 'Arzaman — Кыргызстандын B2B маркетплейси. Кантип иштээрин көрүңүз:';

  const handlers = {
    whatsapp: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank'),
    telegram: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'),
    copy: () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); },
  };

  const labels = {
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    copy: copied ? (isRu ? 'Скопировано!' : 'Көчүрүлдү!') : (isRu ? 'Копировать' : 'Көчүрүү'),
  };

  const colors = {
    whatsapp: 'bg-green-500 hover:bg-green-600',
    telegram: 'bg-blue-500 hover:bg-blue-600',
    copy: copied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-800',
  };

  return (
    <button onClick={handlers[platform]}
      className={`${colors[platform]} text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-md`}>
      {labels[platform]}
    </button>
  );
}

// Мок-компоненты для визуализации шагов
const MockRegister = (isRu) => (
  <div className="space-y-2 text-xs">
    <div className="text-center font-bold text-gray-800 mb-3">{isRu ? 'Регистрация' : 'Каттоо'}</div>
    <div className="bg-gray-100 rounded-lg px-3 py-2 text-gray-500">👤 {isRu ? 'Имя' : 'Аты'}</div>
    <div className="bg-gray-100 rounded-lg px-3 py-2 text-gray-500">📱 +996 555 123 456</div>
    <div className="bg-gray-100 rounded-lg px-3 py-2 text-gray-500">🏙 {isRu ? 'Город' : 'Шаар'}</div>
    <button className="w-full bg-green-500 text-white rounded-lg py-2 font-bold animate-pulse">
      {isRu ? 'Зарегистрироваться' : 'Катталуу'}
    </button>
  </div>
);

const MockCatalog = (isRu) => (
  <div className="space-y-2">
    <div className="text-center font-bold text-gray-800 text-xs mb-2">{isRu ? 'Каталог' : 'Каталог'}</div>
    <div className="grid grid-cols-3 gap-1.5">
      {['🍞', '🥛', '🥩', '🥦', '🍬', '🥤'].map((e, i) => (
        <div key={i} className={`bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-2 text-center ${i === 0 ? 'ring-2 ring-green-500' : ''}`}>
          <div className="text-xl">{e}</div>
        </div>
      ))}
    </div>
  </div>
);

const MockCart = (isRu) => (
  <div className="space-y-1.5 text-xs">
    <div className="text-center font-bold text-gray-800 mb-2">{isRu ? 'Корзина' : 'Корзина'}</div>
    <div className="bg-green-50 border border-green-200 rounded-lg px-2 py-1.5 text-green-700 text-[10px]">
      🚚 {isRu ? 'Доставка: завтра' : 'Жеткирүү: эртең'}
    </div>
    <div className="flex justify-between bg-gray-50 rounded px-2 py-1.5">
      <span>🍞 x5</span><span className="font-bold">250 сом</span>
    </div>
    <div className="flex justify-between bg-gray-50 rounded px-2 py-1.5">
      <span>🥛 x10</span><span className="font-bold">680 сом</span>
    </div>
    <div className="flex justify-between font-bold pt-1 border-t">
      <span>{isRu ? 'Итого' : 'Жалпы'}</span><span className="text-green-600">930 сом</span>
    </div>
  </div>
);

const MockOrder = (isRu) => (
  <div className="space-y-2 text-xs text-center">
    <div className="text-5xl animate-bounce">✅</div>
    <div className="font-bold text-green-600">{isRu ? 'Заказ отправлен!' : 'Заказ жөнөтүлдү!'}</div>
    <div className="text-gray-500 text-[10px]">{isRu ? 'Поставщик свяжется с вами' : 'Жеткирүүчү байланышат'}</div>
  </div>
);

const MockCoins = (isRu) => (
  <div className="space-y-2 text-xs text-center">
    <div className="text-5xl animate-bounce">🎁</div>
    <div className="font-bold text-amber-600">+2 🪙</div>
    <div className="bg-amber-50 rounded-lg px-3 py-2">
      <div className="text-amber-800 font-semibold">{isRu ? 'Ваш баланс' : 'Балансыңыз'}</div>
      <div className="text-2xl font-bold text-amber-600">15 🪙</div>
    </div>
    <div className="text-[10px] text-gray-500">{isRu ? 'Розыгрыш скидок через 30 дней!' : 'Арзандатуу розыгрышы 30 күндөн кийин!'}</div>
  </div>
);

const MockProducts = (isRu) => (
  <div className="space-y-1.5">
    <div className="text-center font-bold text-gray-800 text-xs mb-2">{isRu ? 'Мои товары' : 'Менин товарларым'}</div>
    {['Рис 25кг', 'Мука 50кг', 'Сахар 10кг'].map((p, i) => (
      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5 text-xs">
        <span>{p}</span>
        <span className="text-green-600 font-bold">+</span>
      </div>
    ))}
    <button className="w-full bg-blue-500 text-white rounded-lg py-1.5 text-xs font-bold animate-pulse">
      + {isRu ? 'Добавить' : 'Кошуу'}
    </button>
  </div>
);

const MockSchedule = (isRu) => (
  <div className="text-xs">
    <div className="text-center font-bold text-gray-800 mb-2">{isRu ? 'График доставки' : 'Жеткирүү графиги'}</div>
    <table className="w-full text-[10px]">
      <thead><tr className="text-gray-500"><td></td><td className="text-center">Пн</td><td className="text-center">Вт</td><td className="text-center">Ср</td><td className="text-center">Чт</td><td className="text-center">Пт</td></tr></thead>
      <tbody>
        <tr><td className="font-semibold">Бишкек</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td><td className="text-center">✅</td></tr>
        <tr><td className="font-semibold">Ош</td><td className="text-center">·</td><td className="text-center">✅</td><td className="text-center">·</td><td className="text-center">·</td><td className="text-center">✅</td></tr>
      </tbody>
    </table>
  </div>
);

const MockTelegram = (isRu) => (
  <div className="space-y-2 text-xs">
    <div className="flex items-center gap-2 bg-blue-500 text-white rounded-t-lg p-2">
      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-500 font-bold">🤖</div>
      <div className="font-bold">Arzaman Bot</div>
    </div>
    <div className="bg-blue-50 rounded-lg p-2 space-y-1">
      <div className="font-bold text-blue-800">🛒 {isRu ? 'Новый заказ!' : 'Жаңы заказ!'}</div>
      <div>🏪 {isRu ? 'Магазин:' : 'Дүкөн:'} "Береке"</div>
      <div>💰 {isRu ? 'Сумма:' : 'Сумма:'} 5 000 сом</div>
    </div>
  </div>
);

const MockMoney = (isRu) => (
  <div className="text-center">
    <div className="text-5xl mb-2">💰</div>
    <div className="text-xs text-gray-500 mb-1">{isRu ? 'Ваш доход' : 'Кирешеңиз'}</div>
    <div className="text-3xl font-extrabold text-green-600">
      <AnimatedNumber value="15000" />
      <span className="text-sm ml-1">сом</span>
    </div>
    <div className="text-[10px] text-gray-500 mt-1">{isRu ? 'За этот месяц' : 'Бул айда'}</div>
  </div>
);

const MockLink = (isRu) => (
  <div className="space-y-2 text-xs">
    <div className="text-center font-bold text-gray-800 mb-2">{isRu ? 'Ваша ссылка' : 'Шилтемеңиз'}</div>
    <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-[10px] text-green-700 font-mono break-all">
      arzaman.kg/?ref=AGT-AB12
    </div>
    <button className="w-full bg-green-500 text-white rounded-lg py-1.5 text-xs font-bold animate-pulse">
      📤 {isRu ? 'Поделиться' : 'Бөлүшүү'}
    </button>
  </div>
);

const MockShops = (isRu) => (
  <div className="space-y-1.5 text-xs">
    <div className="text-center font-bold text-gray-800 mb-2">{isRu ? 'Мои магазины' : 'Менин дүкөндөрүм'}</div>
    {['Береке', 'Ырыс', 'Достук'].map((s, i) => (
      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-2 py-1.5">
        <span>🏪 {s}</span>
        <span className="text-green-600 font-bold">+1%</span>
      </div>
    ))}
  </div>
);

const CONTENT = {
  client: {
    emoji: '🛒',
    color: 'from-blue-600 to-blue-900',
    pains: {
      ru: [
        'Агент не пришёл, а товар нужен срочно',
        'Только открываете магазин — не знаете всех поставщиков',
        'Хочется быстро заказать, а не тратить день на звонки',
        'Не знаете когда приедет заказ — ждёте весь день',
      ],
      kg: [
        'Агент келген жок, бирок товар тез керек',
        'Дүкөндү жаңы ачасыз — бардык жеткирүүчүлөрдү билбейсиз',
        'Тез заказ кылгыңыз келет, күн бою чалып отурбай',
        'Заказ качан келерин билбейсиз — күн бою күтөсүз',
      ],
    },
    solutions: {
      ru: [
        'Заказ за 1 минуту через платформу',
        'Все поставщики в одном месте — сравниваешь и выбираешь',
        'Заказывай и участвуй в розыгрышах призов',
        'Видно дату доставки сразу — не нужно звонить',
      ],
      kg: [
        'Платформа аркылуу 1 мүнөттө заказ',
        'Бардык жеткирүүчүлөр бир жерде — салыштырып тандайсыз',
        'Заказ кыл жана сыйлык розыгрыштарына катыш',
        'Жеткирүү күнү дароо көрүнөт — чалуунун кереги жок',
      ],
    },
    steps: {
      ru: [
        { icon: '📝', title: 'Регистрация', desc: 'Укажите имя, телефон, город — один раз за 30 секунд', mock: MockRegister },
        { icon: '🔍', title: 'Выбор товаров', desc: 'Каталог с сотнями позиций от проверенных поставщиков', mock: MockCatalog },
        { icon: '🛒', title: 'В корзину', desc: 'Увидите ближайшую дату доставки автоматически', mock: MockCart },
        { icon: '✅', title: 'Заказ отправлен', desc: 'Поставщик получает уведомление и связывается с вами', mock: MockOrder },
        { icon: '🎁', title: 'Получайте монетки', desc: 'За каждые 500 сом — 1 монетка. Участвуйте в розыгрышах!', mock: MockCoins },
      ],
      kg: [
        { icon: '📝', title: 'Каттоо', desc: 'Аты, телефон, шаар — 30 секундда бир жолу', mock: MockRegister },
        { icon: '🔍', title: 'Товар тандоо', desc: 'Текшерилген жеткирүүчүлөрдөн жүздөгөн товарлар', mock: MockCatalog },
        { icon: '🛒', title: 'Корзинага', desc: 'Жакынкы жеткирүү күнүн автоматтык көрөсүз', mock: MockCart },
        { icon: '✅', title: 'Заказ жөнөтүлдү', desc: 'Жеткирүүчү билдирүү алат жана сиз менен байланышат', mock: MockOrder },
        { icon: '🎁', title: 'Монеталар', desc: 'Ар 500 сом — 1 монета. Розыгрышка катышыңыз!', mock: MockCoins },
      ],
    },
    numbers: [
      { value: '1 мин', labelRu: 'На заказ', labelKg: 'Бир заказга' },
      { value: '0 сом', labelRu: 'Для клиента', labelKg: 'Кардар үчүн' },
      { value: '50+', labelRu: 'Поставщиков', labelKg: 'Жеткирүүчү' },
      { value: '🎁', labelRu: 'Розыгрыши', labelKg: 'Розыгрыштар' },
    ],
    ctaHref: '/auth',
    ctaBtnRu: 'Зарегистрироваться бесплатно',
    ctaBtnKg: 'Акысыз катталуу',
    ctaDescRu: 'Начните заказывать уже сегодня — это займёт 30 секунд',
    ctaDescKg: 'Бүгүн заказ кылып баштаңыз — 30 секунд кетет',
  },

  supplier: {
    emoji: '📦',
    color: 'from-slate-700 to-slate-900',
    pains: {
      ru: [
        'Агент поленился / заболел — заказы ушли к конкуренту',
        'Новые точки открываются — агенты их ещё не знают',
        'Недобор продаж — нужно больше клиентов',
        'Новая компания без штата — как начать продавать?',
      ],
      kg: [
        'Агент жалкоолук кылды / ооруп калды — заказдар атаандашка',
        'Жаңы дүкөндөр ачылат — агенттер аларды билбейт',
        'Сатуулар жетишсиз — көбүрөөк кардар керек',
        'Жаңы компания — кантип сатууну баштоо?',
      ],
    },
    solutions: {
      ru: [
        'Дополнительный канал продаж — агенты остаются как есть',
        'Новые точки сами находят вас через платформу',
        'Заказы приходят в Telegram — не теряются',
        'Для новых компаний — быстрый старт без вложений',
      ],
      kg: [
        'Кошумча сатуу каналы — агенттер калат',
        'Жаңы дүкөндөр өздөрү платформа аркылуу табат',
        'Заказдар Telegramга келет — жоголбойт',
        'Жаңы компаниялар үчүн — салымсыз тез баштоо',
      ],
    },
    steps: {
      ru: [
        { icon: '📝', title: 'Регистрация компании', desc: 'Укажите ИНН, адрес, контакты — один раз', mock: MockRegister },
        { icon: '📦', title: 'Загрузите товары', desc: 'Добавьте каталог с ценами и фото', mock: MockProducts },
        { icon: '🚚', title: 'График доставки', desc: 'Отметьте куда и когда возите — система посчитает сама', mock: MockSchedule },
        { icon: '📲', title: 'Получайте заказы', desc: 'Уведомления в Telegram сразу после нового заказа', mock: MockTelegram },
        { icon: '💰', title: 'Зарабатывайте', desc: 'Первый месяц без абонплаты — только 5% с продаж', mock: MockMoney },
      ],
      kg: [
        { icon: '📝', title: 'Компанияны каттоо', desc: 'ИНН, дарек, байланыш — бир жолу', mock: MockRegister },
        { icon: '📦', title: 'Товарлар', desc: 'Баасы жана сүрөтү менен каталог', mock: MockProducts },
        { icon: '🚚', title: 'Жеткирүү графиги', desc: 'Кайда качан жеткиресиз — система эсептейт', mock: MockSchedule },
        { icon: '📲', title: 'Заказдар', desc: 'Telegramга дароо билдирүү', mock: MockTelegram },
        { icon: '💰', title: 'Киреше', desc: 'Биринчи ай абоненттик төлөмсүз — 5% гана', mock: MockMoney },
      ],
    },
    numbers: [
      { value: '5%', labelRu: 'Комиссия', labelKg: 'Комиссия' },
      { value: '0 сом', labelRu: 'Первый месяц', labelKg: 'Биринчи ай' },
      { value: '24/7', labelRu: 'Заказы', labelKg: 'Заказдар' },
      { value: '0', labelRu: 'Вложений', labelKg: 'Салым' },
    ],
    ctaHref: '/auth',
    ctaBtnRu: 'Стать поставщиком',
    ctaBtnKg: 'Жеткирүүчү болуу',
    ctaDescRu: 'Первый месяц только 5% комиссия — без абонентской платы',
    ctaDescKg: 'Биринчи ай 5% комиссия гана — абоненттик төлөмсүз',
  },

  agent: {
    emoji: '🤝',
    color: 'from-green-600 to-green-900',
    pains: {
      ru: [
        'Хочется дополнительный доход без лишней работы',
        'Хожу по точкам, но можно зарабатывать больше',
        'Нет возможности подрабатывать без вложений',
      ],
      kg: [
        'Кошумча иш жасабай кошумча киреше алгыңыз келет',
        'Дүкөндөргө барам, бирок көбүрөөк акча табууга болот',
        'Салымсыз кошумча иштөөгө мүмкүнчүлүк жок',
      ],
    },
    solutions: {
      ru: [
        'Ходишь по тем же точкам — получаешь +1% сверху',
        'Работа через телефон — всё просто',
        'Без вложений, без офиса, свободный график',
        'Доход растёт пока магазины заказывают через тебя',
      ],
      kg: [
        'Ошол эле дүкөндөргө — +1% аласыз',
        'Телефон аркылуу иш — баары жөнөкөй',
        'Салымсыз, офисcиз, эркин график',
        'Дүкөндөр сиз аркылуу заказ кылганча киреше өсөт',
      ],
    },
    steps: {
      ru: [
        { icon: '📝', title: 'Регистрация', desc: 'Укажите ИНН — нужен для выплат', mock: MockRegister },
        { icon: '🔗', title: 'Ваша ссылка', desc: 'Уникальная реферальная ссылка в кабинете', mock: MockLink },
        { icon: '🤝', title: 'Подключите магазины', desc: 'Отправляйте ссылку — магазины регистрируются через вас', mock: MockShops },
        { icon: '🛒', title: 'Магазин заказывает', desc: 'Каждый заказ через платформу = +1% вам', mock: MockTelegram },
        { icon: '💰', title: 'Получайте выплаты', desc: 'Заработок копится и автоматически выплачивается', mock: MockMoney },
      ],
      kg: [
        { icon: '📝', title: 'Каттоо', desc: 'ИНН — төлөмдөр үчүн керек', mock: MockRegister },
        { icon: '🔗', title: 'Шилтемеңиз', desc: 'Уникалдуу реф шилтеме', mock: MockLink },
        { icon: '🤝', title: 'Дүкөндөрдү туташтырыңыз', desc: 'Шилтемени жөнөтүңүз', mock: MockShops },
        { icon: '🛒', title: 'Дүкөн заказ кылат', desc: 'Ар бир заказ = +1% сизге', mock: MockTelegram },
        { icon: '💰', title: 'Төлөмдөр', desc: 'Киреше чогулуп автоматтык төлөнөт', mock: MockMoney },
      ],
    },
    numbers: [
      { value: '1%', labelRu: 'С каждого заказа', labelKg: 'Ар бир заказдан' },
      { value: '0 сом', labelRu: 'Вложений', labelKg: 'Салым' },
      { value: '24/7', labelRu: 'Свой график', labelKg: 'Өз графиги' },
      { value: '∞', labelRu: 'Магазинов', labelKg: 'Дүкөндөр' },
    ],
    ctaHref: '/agents',
    ctaBtnRu: 'Стать агентом',
    ctaBtnKg: 'Агент болуу',
    ctaDescRu: 'Дополнительный доход без вложений — начни сегодня',
    ctaDescKg: 'Салымсыз кошумча киреше — бүгүн баштаңыз',
  },
};
