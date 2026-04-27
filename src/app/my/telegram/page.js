'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Send, Loader2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';

const BOT_USERNAME = 'arzaman_kg_bot';
const BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;

export default function MyTelegramPage() {
  const router = useRouter();
  const { user, profile, updateProfile, loading: authLoading } = useAuth();
  const { lang } = useLang();
  const isRu = lang === 'ru';

  const [fetchingId, setFetchingId] = useState(false);
  const [idSuggestion, setIdSuggestion] = useState(null);
  const [manualId, setManualId] = useState('');
  const [saving, setSaving] = useState(false);

  const startToken = user?.uid
    ? `u${user.uid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30)}`
    : '';

  if (authLoading) return <div className="text-center py-20 text-gray-400">{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</div>;
  if (!user) {
    router.push('/auth');
    return null;
  }

  const currentChatId = profile?.telegramChatId;

  const fetchChatIdAuto = async () => {
    if (!BOT_TOKEN) {
      toast.error(isRu ? 'Telegram-бот не настроен' : 'Telegram бот жөндөлгөн эмес');
      return;
    }
    setFetchingId(true);
    setIdSuggestion(null);
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`);
      const data = await res.json();
      if (!data.ok) throw new Error('Telegram API error');
      const updates = data.result || [];

      const expected = `/start ${startToken}`;
      const exactMatch = startToken
        ? updates.find(u =>
            u.message?.from && !u.message.from.is_bot && u.message.text === expected
          )
        : null;

      if (exactMatch) {
        const from = exactMatch.message.from;
        setIdSuggestion({
          id: from.id,
          name: [from.first_name, from.last_name].filter(Boolean).join(' ') || (isRu ? 'Без имени' : 'Атсыз'),
          username: from.username || '',
          confident: true,
        });
        return;
      }

      const lastUserMsg = [...updates].reverse().find(u =>
        u.message?.from && !u.message.from.is_bot
      );

      if (!lastUserMsg) {
        toast.error(isRu
          ? 'Не нашли ваше сообщение. Откройте бота кнопкой выше и нажмите /start.'
          : 'Кабарыңыз табылган жок. Жогорудагы кнопка менен ботту ачып /start басыңыз.');
        return;
      }

      const from = lastUserMsg.message.from;
      setIdSuggestion({
        id: from.id,
        name: [from.first_name, from.last_name].filter(Boolean).join(' ') || (isRu ? 'Без имени' : 'Атсыз'),
        username: from.username || '',
        confident: false,
      });
    } catch (e) {
      toast.error(isRu ? 'Ошибка соединения с Telegram' : 'Telegram байланыш катасы');
      console.error('Telegram getUpdates error:', e);
    } finally {
      setFetchingId(false);
    }
  };

  const saveChatId = async (chatId) => {
    if (!chatId) return;
    setSaving(true);
    try {
      await updateProfile({ telegramChatId: String(chatId) });
      toast.success(isRu ? 'Telegram подключён!' : 'Telegram туташтырылды!');
      setIdSuggestion(null);
      setManualId('');
    } catch (e) {
      toast.error(isRu ? 'Не удалось сохранить' : 'Сактоо ишке ашпады');
      console.warn('Save telegramChatId failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    if (!confirm(isRu ? 'Отключить Telegram-уведомления?' : 'Telegram билдирүүлөрүн өчүрөбү?')) return;
    setSaving(true);
    try {
      await updateProfile({ telegramChatId: '' });
      toast.success(isRu ? 'Telegram отключён' : 'Telegram өчүрүлдү');
    } catch (e) {
      toast.error(isRu ? 'Не удалось отключить' : 'Өчүрүү ишке ашпады');
      console.warn('Disconnect telegramChatId failed:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/my" className="flex items-center gap-1 text-slate-600 hover:text-slate-800 mb-4 font-medium text-sm">
        <ArrowLeft size={18} /> {isRu ? 'Назад в профиль' : 'Профилге кайтуу'}
      </Link>

      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
        <MessageCircle size={24} className="text-blue-500" />
        {isRu ? 'Telegram-уведомления' : 'Telegram билдирүүлөрү'}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {isRu
          ? 'Получайте подтверждение заказа, смену статуса доставки и начисление монеток прямо в Telegram.'
          : 'Заказдын ырастоосун, жеткирүү статусун жана монета чегерүүсүн Telegramга алыңыз.'}
      </p>

      {currentChatId ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-4">
          <p className="text-green-800 font-semibold mb-2 flex items-center gap-2">
            ✅ {isRu ? 'Telegram подключён' : 'Telegram туташтырылды'}
          </p>
          <p className="text-sm text-green-700 mb-3">Chat ID: <span className="font-mono">{currentChatId}</span></p>
          <button
            onClick={disconnect}
            disabled={saving}
            className="text-sm text-green-700 underline hover:text-green-900 disabled:opacity-50"
          >
            {isRu ? 'Отключить' : 'Өчүрүү'}
          </button>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-4">
          <p className="text-blue-800 font-semibold mb-3">
            {isRu ? '📲 Подключить — 2 шага:' : '📲 Туташтыруу — 2 кадам:'}
          </p>
          <ol className="text-sm text-blue-700 space-y-3">
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <div className="flex-1">
                <p className="mb-2">
                  {isRu ? 'Откройте нашего бота и нажмите' : 'Биздин ботту ачып басыңыз'} <b>/start</b>
                </p>
                <a
                  href={startToken ? `https://t.me/${BOT_USERNAME}?start=${startToken}` : `https://t.me/${BOT_USERNAME}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Send size={14} /> {isRu ? `Открыть @${BOT_USERNAME}` : `@${BOT_USERNAME} ачуу`}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <div className="flex-1">
                <p className="mb-2">
                  {isRu ? 'Вернитесь сюда и нажмите кнопку — мы найдём ваш ID автоматически' : 'Бул жерге кайтып келип кнопканы басыңыз'}
                </p>
                <button
                  type="button"
                  onClick={fetchChatIdAuto}
                  disabled={fetchingId}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {fetchingId
                    ? <><Loader2 size={14} className="animate-spin" /> {isRu ? 'Ищем...' : 'Изделүүдө...'}</>
                    : <><MessageCircle size={14} /> {isRu ? 'Получить мой ID автоматически' : 'IDны автоматтык алуу'}</>}
                </button>
              </div>
            </li>
          </ol>
        </div>
      )}

      {idSuggestion && (
        <div className={`rounded-xl p-4 mb-4 border ${idSuggestion.confident ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`font-semibold mb-2 ${idSuggestion.confident ? 'text-green-800' : 'text-amber-800'}`}>
            {idSuggestion.confident
              ? (isRu ? '✅ Ваш Telegram найден' : '✅ Telegramыңыз табылды')
              : (isRu ? '🔍 Возможно это вы — проверьте имя' : '🔍 Балким бул сизсиз')}
          </p>
          <div className={`bg-white rounded-lg p-3 mb-3 border ${idSuggestion.confident ? 'border-green-200' : 'border-amber-200'}`}>
            <p className="text-sm">
              <b>{idSuggestion.name}</b>
              {idSuggestion.username && <span className="text-gray-500"> · @{idSuggestion.username}</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1">Chat ID: <span className="font-mono">{idSuggestion.id}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => saveChatId(idSuggestion.id)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Check size={14} /> {idSuggestion.confident ? (isRu ? 'Использовать' : 'Колдонуу') : (isRu ? 'Да, это я' : 'Ооба, бул мен')}
            </button>
            <button
              type="button"
              onClick={() => setIdSuggestion(null)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <X size={14} /> {isRu ? 'Не я' : 'Мен эмес'}
            </button>
          </div>
        </div>
      )}

      {!currentChatId && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? 'Или введите Chat ID вручную' : 'Же Chat IDны кол менен'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              placeholder={isRu ? 'Например: 6067853905' : 'Мисалы: 6067853905'}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => saveChatId(manualId.trim())}
              disabled={saving || !manualId.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {isRu ? 'Сохранить' : 'Сактоо'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {isRu
              ? 'Если автопоиск не сработал — узнайте свой ID через @userinfobot'
              : 'Автопоиск иштебесе — IDыңызды @userinfobot аркылуу билиңиз'}
          </p>
        </div>
      )}
    </div>
  );
}
