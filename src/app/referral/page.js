'use client';
import { useLang } from '@/context/LangContext';
import { useAuth } from '@/context/AuthContext';
import { Gift, Share2, Crown, Percent, MessageCircle, Copy, CheckCircle, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ReferralPage() {
  const { lang } = useLang();
  const { user, profile } = useAuth();
  const isRu = lang === 'ru';
  const [copied, setCopied] = useState(false);

  // Генерируем реферальный код из uid или рандомный для демо
  const refCode = user ? user.uid.slice(0, 6).toUpperCase() : 'DEMO01';
  const refLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth?ref=${refCode}`;

  // Готовое сообщение для поставщика
  const messageRu = `Здравствуйте! Приглашаю вас на MarketKG — B2B маркетплейс поставщиков Кыргызстана.

✅ Бесплатная регистрация
✅ Готовые клиенты по всей стране
✅ Удобное управление заказами
✅ Связь через WhatsApp/Telegram

🎁 При регистрации по моей ссылке вы получите бесплатное ТОП-размещение на 7 дней!

А я как ваш первый клиент получу скидку 5% на первый заказ — выгодно обоим!

Регистрация: ${refLink}`;

  const messageKg = `Саламатсызбы! Сизди MarketKG га чакырамын — Кыргызстандын B2B жеткирүүчүлөр маркетплейси.

✅ Акысыз каттоо
✅ Бүт өлкө боюнча даяр кардарлар
✅ Буйрутмаларды ыңгайлуу башкаруу
✅ WhatsApp/Telegram аркылуу байланыш

🎁 Менин шилтемем менен катталсаңыз 7 күнгө акысыз ТОП-жайгашуу аласыз!

Мен биринчи кардарыңыз катары биринчи заказга 5% арзандатуу алам — экөөбүзгө тең пайдалуу!

Каттоо: ${refLink}`;

  const message = isRu ? messageRu : messageKg;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(isRu ? 'Скопировано!' : 'Көчүрүлдү!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'MarketKG', text: message, url: refLink });
    } else {
      handleCopy(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-green-900 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            {isRu ? 'Пригласи поставщика — получи скидку!' : 'Жеткирүүчүнү чакыр — арзандатуу ал!'}
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto">
            {isRu
              ? 'Отправьте ссылку поставщику. Он получит бесплатный ТОП, а вы — скидку 5% на первый заказ'
              : 'Жеткирүүчүгө шилтеме жөнөтүңүз. Ал акысыз ТОП алат, сиз — биринчи заказга 5% арзандатуу'}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">

        {/* Выгоды для обоих */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <Percent size={20} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{isRu ? 'Вам — скидка 5%' : 'Сизге — 5% арзандатуу'}</h3>
            <p className="text-sm text-gray-500">
              {isRu
                ? 'На первый заказ у приглашённого поставщика. Скидку предоставляет сам поставщик'
                : 'Чакырылган жеткирүүчүдөгү биринчи заказга. Арзандатууну жеткирүүчү өзү берет'}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
              <Crown size={20} className="text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{isRu ? 'Поставщику — ТОП 7 дней' : 'Жеткирүүчүгө — 7 күн ТОП'}</h3>
            <p className="text-sm text-gray-500">
              {isRu
                ? 'Бесплатное размещение в разделе «Топ поставщики» на главной странице'
                : 'Башкы беттеги «Топ жеткирүүчүлөр» бөлүмүндө акысыз жайгашуу'}
            </p>
          </div>
        </div>

        {/* Готовое сообщение */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <h2 className="font-bold text-lg text-gray-800 mb-1">
            {isRu ? 'Готовое сообщение для поставщика' : 'Жеткирүүчү үчүн даяр кабар'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {isRu ? 'Отправьте через WhatsApp или Telegram — текст уже составлен' : 'WhatsApp же Telegram аркылуу жөнөтүңүз — текст даяр'}
          </p>

          {/* Превью сообщения */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 whitespace-pre-line border border-gray-200 max-h-64 overflow-y-auto">
            {message}
          </div>

          {/* Кнопки отправки */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
            <button
              onClick={handleTelegram}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-semibold"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
            <button
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-semibold"
            >
              <Share2 size={18} />
              {isRu ? 'Поделиться' : 'Бөлүшүү'}
            </button>
          </div>
        </div>

        {/* Ваша ссылка */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h3 className="font-bold text-gray-800 mb-3">{isRu ? 'Ваша реферальная ссылка' : 'Сиздин реферал шилтемеңиз'}</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={refLink}
              readOnly
              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600"
            />
            <button
              onClick={() => handleCopy(refLink)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
              {copied ? (isRu ? 'Готово!' : 'Даяр!') : (isRu ? 'Копировать' : 'Көчүрүү')}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {isRu ? 'Код: ' : 'Код: '}<span className="font-mono font-bold">{refCode}</span>
          </p>
        </div>

        {/* Как это работает */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-8">
          <h2 className="font-bold text-lg text-gray-800 mb-6">
            {isRu ? 'Как это работает' : 'Кантип иштейт'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { step: 1, emoji: '📤', titleRu: 'Отправьте ссылку', titleKg: 'Шилтеме жөнөтүңүз', descRu: 'Нажмите WhatsApp или Telegram — сообщение уже готово', descKg: 'WhatsApp же Telegram басыңыз — кабар даяр' },
              { step: 2, emoji: '📝', titleRu: 'Поставщик регистрируется', titleKg: 'Жеткирүүчү катталат', descRu: 'Переходит по ссылке и создаёт аккаунт', descKg: 'Шилтемеден өтүп аккаунт түзөт' },
              { step: 3, emoji: '👑', titleRu: 'Он получает ТОП', titleKg: 'Ал ТОП алат', descRu: 'Бесплатное размещение в ТОП на 7 дней', descKg: '7 күнгө акысыз ТОП жайгашуу' },
              { step: 4, emoji: '🎉', titleRu: 'Вы получаете скидку', titleKg: 'Сиз арзандатуу аласыз', descRu: '5% скидка на первый заказ у этого поставщика', descKg: 'Бул жеткирүүчүдөн биринчи заказга 5%' },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-2">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{isRu ? s.titleRu : s.titleKg}</h3>
                <p className="text-xs text-gray-500">{isRu ? s.descRu : s.descKg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 mb-12">
          <h2 className="font-bold text-lg text-gray-800 mb-4">
            {isRu ? 'Частые вопросы' : 'Көп берилген суроолор'}
          </h2>
          <div className="space-y-4">
            {[
              {
                qRu: 'Кто даёт скидку 5%?',
                aRu: 'Поставщик сам предоставляет скидку первому клиенту, который его пригласил. Это указано в сообщении-приглашении.',
                qKg: 'Ким 5% арзандатуу берет?',
                aKg: 'Жеткирүүчү аны чакырган биринчи кардарга арзандатууну өзү берет. Бул чакыруу кабарында көрсөтүлгөн.',
              },
              {
                qRu: 'Как поставщик получит бесплатный ТОП?',
                aRu: 'После регистрации по вашей ссылке мы автоматически активируем ТОП-размещение на 7 дней.',
                qKg: 'Жеткирүүчү акысыз ТОП кантип алат?',
                aKg: 'Сиздин шилтемеңиз менен катталгандан кийин 7 күнгө ТОП-жайгашууну автоматтык түрдө иштетебиз.',
              },
              {
                qRu: 'Сколько поставщиков можно пригласить?',
                aRu: 'Без ограничений! Чем больше пригласите — тем больше скидок получите.',
                qKg: 'Канча жеткирүүчү чакырса болот?',
                aKg: 'Чектөөсүз! Канчалык көп чакырсаңыз — ошончолук көп арзандатуу аласыз.',
              },
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-3 last:border-0">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">{isRu ? faq.qRu : faq.qKg}</h4>
                <p className="text-sm text-gray-500">{isRu ? faq.aRu : faq.aKg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
