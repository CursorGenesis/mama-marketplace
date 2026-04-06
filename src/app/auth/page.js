'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import toast from 'react-hot-toast';
import { Suspense } from 'react';

function AuthForm() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle, loginWithApple } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const isRu = lang === 'ru';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(isRu ? 'Добро пожаловать!' : 'Кош келиңиз!');
      } else {
        await register(email, password, name, phone, role);
        toast.success(isRu ? 'Регистрация прошла успешно!' : 'Каттоо ийгиликтүү!');
      }
      router.push('/');
    } catch (err) {
      const errors = {
        'auth/email-already-in-use': isRu ? 'Этот email уже зарегистрирован' : 'Бул email катталган',
        'auth/invalid-email': isRu ? 'Некорректный email' : 'Туура эмес email',
        'auth/weak-password': isRu ? 'Пароль минимум 6 символов' : 'Сырсөз кеминде 6 белги',
        'auth/user-not-found': isRu ? 'Пользователь не найден' : 'Колдонуучу табылган жок',
        'auth/wrong-password': isRu ? 'Неверный пароль' : 'Туура эмес сырсөз',
        'auth/invalid-credential': isRu ? 'Неверный email или пароль' : 'Туура эмес email же сырсөз',
      };
      toast.error(errors[err.code] || err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      toast.success(isRu ? 'Вход через Google выполнен!' : 'Google аркылуу кирдиңиз!');
      router.push('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(isRu ? 'Ошибка входа через Google' : 'Google аркылуу кирүүдө ката');
      }
    }
    setLoading(false);
  };

  const handleApple = async () => {
    setLoading(true);
    try {
      await loginWithApple();
      toast.success(isRu ? 'Вход через Apple выполнен!' : 'Apple аркылуу кирдиңиз!');
      router.push('/');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast.error(isRu ? 'Ошибка входа через Apple' : 'Apple аркылуу кирүүдө ката');
      }
    }
    setLoading(false);
  };

  const handleWhatsApp = () => {
    const text = isRu
      ? 'Здравствуйте! Хочу войти в MarketKG. Мой телефон: '
      : 'Саламатсызбы! MarketKG ге кирүүнү каалайм. Менин телефоном: ';
    window.open(`https://wa.me/996555000000?text=${encodeURIComponent(text)}`, '_blank');
    toast.success(isRu ? 'Отправьте сообщение в WhatsApp для входа' : 'Кирүү үчүн WhatsApp га кабар жөнөтүңүз');
  };

  const handleTelegram = () => {
    window.open('https://t.me/MarketKG_bot', '_blank');
    toast.success(isRu ? 'Напишите боту в Telegram для входа' : 'Кирүү үчүн Telegram ботуна жазыңыз');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Логотип */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-2xl font-bold">
              {mode === 'login'
                ? (isRu ? 'Вход' : 'Кирүү')
                : (isRu ? 'Регистрация' : 'Каттоо')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">MarketKG — {isRu ? 'маркетплейс поставщиков' : 'жеткирүүчүлөр маркетплейси'}</p>
          </div>

          {/* Реферальный код */}
          {refCode && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4 text-center">
              <span className="text-green-700 text-sm font-medium">
                🎁 {isRu ? `Промокод: ${refCode}` : `Промокод: ${refCode}`}
              </span>
            </div>
          )}

          {/* Кнопки соцсетей */}
          <div className="space-y-2.5 mb-5">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            {/* Apple */}
            <button
              onClick={handleApple}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>

            {/* WhatsApp и Telegram в ряд */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleWhatsApp}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <button
                onClick={handleTelegram}
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium text-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>
            </div>
          </div>

          {/* Разделитель */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400">
                {isRu ? 'или по email' : 'же email менен'}
              </span>
            </div>
          </div>

          {/* Email форма */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={isRu ? 'Ваше имя / компания' : 'Атыңыз / компания'}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder={isRu ? 'Телефон +996...' : 'Телефон +996...'}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRu ? 'Вы:' : 'Сиз:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRole('buyer')}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        role === 'buyer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      🛒 {isRu ? 'Покупатель' : 'Сатып алуучу'}
                    </button>
                    <button type="button" onClick={() => setRole('supplier')}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        role === 'supplier' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      📦 {isRu ? 'Поставщик' : 'Жеткирүүчү'}
                    </button>
                  </div>
                </div>
              </>
            )}

            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder={isRu ? 'Пароль' : 'Сырсөз'} required minLength={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50">
              {loading
                ? (isRu ? 'Подождите...' : 'Күтө туруңуз...')
                : mode === 'login'
                  ? (isRu ? 'Войти' : 'Кирүү')
                  : (isRu ? 'Зарегистрироваться' : 'Катталуу')}
            </button>
          </form>

          {/* Переключатель */}
          <div className="text-center mt-5">
            {mode === 'login' ? (
              <p className="text-gray-500 text-sm">
                {isRu ? 'Нет аккаунта?' : 'Аккаунт жокпу?'}{' '}
                <button onClick={() => setMode('register')} className="text-primary-600 font-semibold hover:underline">
                  {isRu ? 'Зарегистрироваться' : 'Катталуу'}
                </button>
              </p>
            ) : (
              <p className="text-gray-500 text-sm">
                {isRu ? 'Уже есть аккаунт?' : 'Аккаунт барбы?'}{' '}
                <button onClick={() => setMode('login')} className="text-primary-600 font-semibold hover:underline">
                  {isRu ? 'Войти' : 'Кирүү'}
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Подсказка */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {isRu
            ? 'Входя, вы соглашаетесь с условиями использования MarketKG'
            : 'Кирүү менен MarketKG колдонуу шарттарына макулдугуңузду билдиресиз'}
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><p className="text-gray-400">Загрузка...</p></div>}>
      <AuthForm />
    </Suspense>
  );
}
