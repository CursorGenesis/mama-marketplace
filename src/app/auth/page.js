'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import toast from 'react-hot-toast';
import { Suspense } from 'react';
import { sendTelegramNotification } from '@/lib/telegram';

function AuthForm() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('buyer');
  const [shopName, setShopName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inn, setInn] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptLicense, setAcceptLicense] = useState(false);
  const [deliverAllKg, setDeliverAllKg] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle } = useAuth();
  const { t, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const isRu = lang === 'ru';

  // Сохраняем реферальный код чтобы не потерять
  if (refCode && typeof window !== 'undefined') {
    localStorage.setItem('marketkg_ref', refCode);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && (role === 'supplier' || role === 'agent' || role === 'driver') && inn.length !== 14) {
      toast.error(isRu ? 'ИНН должен содержать ровно 14 цифр' : 'ИНН так 14 сандан турушу керек');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        toast.success(isRu ? 'Добро пожаловать!' : 'Кош келиңиз!');
      } else {
        const KG_CITIES = ['Бишкек', 'Ош', 'Манас', 'Каракол', 'Токмок', 'Нарын', 'Баткен', 'Талас', 'Балыкчы', 'Кызыл-Кия'];
        const deliverySchedule = role === 'supplier' && deliverAllKg
          ? Object.fromEntries(KG_CITIES.map(c => [c, [1, 2, 3, 4, 5]]))
          : undefined;
        await register(email, password, name, phone, role, {
          shopName, companyName, inn, city, address, whatsapp,
          category: category === 'other' ? customCategory : category,
          licenseConfirmed: role === 'supplier' ? acceptLicense : undefined,
          agentRef: refCode || null,
          deliverySchedule,
        });
        toast.success(isRu ? 'Регистрация прошла успешно!' : 'Каттоо ийгиликтүү!');
        sendTelegramNotification('new_registration', {
          email, name, phone, role,
          companyName: companyName || '',
          shopName: shopName || '',
          inn: inn || '',
          city: city || '',
          address: address || '',
          whatsapp: whatsapp || '',
          category: category === 'other' ? customCategory : category,
          refCode: refCode || '',
        }).catch(() => {});
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
            <p className="text-gray-500 mt-1 text-sm">Arzaman.kg — {isRu ? 'маркетплейс поставщиков' : 'жеткирүүчүлөр маркетплейси'}</p>
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
                    <button type="button" onClick={() => setRole('agent')}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        role === 'agent' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      🤝 {isRu ? 'Агент' : 'Агент'}
                    </button>
                    <button type="button" onClick={() => setRole('driver')}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        role === 'driver' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                      🚚 {isRu ? 'Экспедитор' : 'Экспедитор'}
                    </button>
                  </div>
                </div>

                {/* Поля для покупателя */}
                {role === 'buyer' && (
                  <>
                    <input
                      type="text" value={shopName} onChange={e => setShopName(e.target.value)}
                      placeholder={isRu ? 'Название магазина / кафе' : 'Дүкөн / кафенин аты'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <input
                      type="text" value={address} onChange={e => setAddress(e.target.value)}
                      placeholder={isRu ? 'Адрес доставки' : 'Жеткирүү дареги'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <select value={city} onChange={e => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                      <option value="">{isRu ? 'Выберите город' : 'Шаар тандаңыз'}</option>
                      <option value="Бишкек">Бишкек</option>
                      <option value="Ош">Ош</option>
                      <option value="Манас">Манас</option>
                      <option value="Каракол">Каракол</option>
                      <option value="Токмок">Токмок</option>
                      <option value="Нарын">Нарын</option>
                      <option value="Баткен">Баткен</option>
                      <option value="Талас">Талас</option>
                    </select>
                  </>
                )}

                {/* Дополнительные поля для поставщика */}
                {role === 'supplier' && (
                  <>
                    <input
                      type="text" value={companyName} onChange={e => setCompanyName(e.target.value)}
                      placeholder={isRu ? 'Название компании' : 'Компаниянын аты'}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <div>
                      <input
                        type="text" value={inn} onChange={e => setInn(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder={isRu ? 'ИНН компании (14 цифр)' : 'Компаниянын ИНН (14 сан)'}
                        required minLength={14} maxLength={14}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1 px-1">{isRu ? 'Укажите ИНН из свидетельства ИП или ОСОО. Будет проверен.' : 'ИП же ОСОО күбөлүгүнөн ИНН жазыңыз. Текшерилет.'}</p>
                    </div>
                    <input
                      type="text" value={address} onChange={e => setAddress(e.target.value)}
                      placeholder={isRu ? 'Адрес склада/офиса' : 'Кампа/офис дареги'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <input
                      type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                      placeholder={isRu ? 'WhatsApp номер +996...' : 'WhatsApp номер +996...'}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <div>
                      <select value={city} onChange={e => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                        <option value="">{isRu ? 'Город (склад/офис)' : 'Шаар (кампа/офис)'}</option>
                        <option value="Бишкек">Бишкек</option>
                        <option value="Ош">Ош</option>
                        <option value="Манас">Манас</option>
                        <option value="Каракол">Каракол</option>
                        <option value="Токмок">Токмок</option>
                        <option value="Нарын">Нарын</option>
                        <option value="Баткен">Баткен</option>
                        <option value="Талас">Талас</option>
                        <option value="Балыкчы">Балыкчы</option>
                        <option value="Кызыл-Кия">Кызыл-Кия</option>
                      </select>
                      <label className="flex items-start gap-2 cursor-pointer mt-2 px-1">
                        <input type="checkbox" checked={deliverAllKg} onChange={e => setDeliverAllKg(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-500 shrink-0" />
                        <span className="text-xs text-gray-600">
                          {isRu
                            ? 'Доставляем по всему Кыргызстану (пн–пт). График по городам можно уточнить в кабинете.'
                            : 'Кыргызстан боюнча жеткиребиз (дш–жм). Шаарлар боюнча график кабинетте тактала алат.'}
                        </span>
                      </label>
                    </div>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                      <option value="">{isRu ? 'Категория товаров' : 'Товар категориясы'}</option>
                      <option value="confectionery">{isRu ? 'Кондитерка' : 'Кондитердик'}</option>
                      <option value="drinks">{isRu ? 'Напитки' : 'Суусундуктар'}</option>
                      <option value="grocery">{isRu ? 'Бакалея' : 'Бакалея'}</option>
                      <option value="dairy">{isRu ? 'Молочные продукты' : 'Сүт азыктары'}</option>
                      <option value="meat">{isRu ? 'Мясо и птица' : 'Эт жана канаттуулар'}</option>
                      <option value="fruits">{isRu ? 'Фрукты и овощи' : 'Жемиштер жана жашылчалар'}</option>
                      <option value="frozen">{isRu ? 'Заморозка' : 'Тоңдурулган'}</option>
                      <option value="snacks">{isRu ? 'Снеки' : 'Снектер'}</option>
                      <option value="bakery">{isRu ? 'Хлеб и выпечка' : 'Нан жана токоч'}</option>
                      <option value="oils">{isRu ? 'Масла и соусы' : 'Май жана соустар'}</option>
                      <option value="eggs">{isRu ? 'Яйца' : 'Жумуртка'}</option>
                      <option value="tea_coffee">{isRu ? 'Чай и кофе' : 'Чай жана кофе'}</option>
                      <option value="canned">{isRu ? 'Консервы' : 'Консерва'}</option>
                      <option value="spices">{isRu ? 'Специи и приправы' : 'Даамдоочтор'}</option>
                      <option value="baby">{isRu ? 'Детское питание' : 'Балдар тамагы'}</option>
                      <option value="tobacco">{isRu ? 'Табак' : 'Тамеки'}</option>
                      <option value="disposable">{isRu ? 'Одноразовая посуда' : 'Бир жолку идиштер'}</option>
                      <option value="pet_food">{isRu ? 'Корма для животных' : 'Жаныбарлар тоюту'}</option>
                      <option value="alcohol">{isRu ? 'Алкоголь' : 'Алкоголь'}</option>
                      <option value="hardware">{isRu ? 'Хозтовары' : 'Чарба товарлары'}</option>
                      <option value="stationery">{isRu ? 'Канцтовары' : 'Канцтоварлар'}</option>
                      <option value="textile">{isRu ? 'Текстиль' : 'Текстиль'}</option>
                      <option value="hygiene">{isRu ? 'Гигиена' : 'Гигиена'}</option>
                      <option value="honey">{isRu ? 'Мёд и варенье' : 'Бал жана варенье'}</option>
                      <option value="dried_fruits">{isRu ? 'Сухофрукты и орехи' : 'Кургатылган жемиш жана жаңгак'}</option>
                      <option value="household">{isRu ? 'Бытовая химия' : 'Тиричилик химиясы'}</option>
                      <option value="other">{isRu ? 'Другое' : 'Башка'}</option>
                    </select>
                    {category === 'other' && (
                      <input
                        type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)}
                        placeholder={isRu ? 'Укажите вашу категорию' : 'Категорияңызды жазыңыз'}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    )}
                  </>
                )}

                {/* ИНН для агента и экспедитора */}
                {(role === 'agent' || role === 'driver') && (
                  <div>
                    <input
                      type="text" value={inn} onChange={e => setInn(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder={isRu ? 'Ваш личный ИНН (14 цифр)' : 'Жеке ИНН (14 сан)'}
                      required minLength={14} maxLength={14}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1 px-1">{isRu ? 'Укажите ваш личный ИНН. Используется для начисления выплат и проверки личности.' : 'Жеке ИНН жазыңыз. Төлөмдөрдү эсептөө жана инсандыкты текшерүү үчүн колдонулат.'}</p>
                  </div>
                )}
              </>
            )}

            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder={isRu ? 'Пароль' : 'Сырсөз'} required minLength={6}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {mode === 'register' && (
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-500 shrink-0" />
                  <span className="text-xs text-gray-600">{isRu ? 'Я принимаю условия ' : 'Мен '}<Link href="/terms" className="text-slate-800 underline font-medium" target="_blank">{isRu ? 'Пользовательского соглашения' : 'Колдонуучу келишиминин'}</Link>{!isRu && ' шарттарын кабыл алам'}</span>
                </label>
                {role === 'supplier' && (
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={acceptLicense} onChange={e => setAcceptLicense(e.target.checked)} className="mt-0.5 w-4 h-4 accent-green-500 shrink-0" />
                    <span className="text-xs text-gray-600">{isRu ? 'Я подтверждаю, что имею все необходимые лицензии для реализации товаров, включая алкогольную и табачную продукцию (при необходимости)' : 'Мен товарларды сатуу үчүн бардык зарыл лицензиялардын бар экенин ырастайм, анын ичинде алкоголь жана тамеки продукциясы (зарыл болгон учурда)'}</span>
                  </label>
                )}
              </div>
            )}

            <button type="submit" disabled={loading || (mode === 'register' && (!acceptTerms || (role === 'supplier' && !acceptLicense)))}
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
            ? 'Входя, вы соглашаетесь с условиями использования Arzaman.kg'
            : 'Кирүү менен Arzaman.kg колдонуу шарттарына макулдугуңузду билдиресиз'}
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
