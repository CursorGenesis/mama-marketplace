'use client';
import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { MessageCircle, X, Send, ChevronDown } from 'lucide-react';

export default function ChatWidget() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(0);
  const messagesEnd = useRef(null);

  // Загрузка из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat_messages');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Приветственное сообщение
      setMessages([{
        id: 1, from: 'support',
        text: isRu ? 'Здравствуйте! Чем можем помочь?' : 'Саламатсызбы! Кандай жардам бере алабыз?',
        time: new Date().toISOString(),
      }]);
      setUnread(1);
    }
  }, []);

  // Сохранение
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Скролл вниз
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), from: 'user', text, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setMessage('');

    // Автоответ через 1-2 секунды
    setTimeout(() => {
      const replies = isRu
        ? [
            'Спасибо за обращение! Мы ответим в ближайшее время.',
            'Ваш вопрос принят. Оператор ответит в рабочее время (Пн-Сб, 09:00-18:00).',
            'Спасибо! Мы уже работаем над вашим вопросом.',
          ]
        : [
            'Кайрылуу үчүн рахмат! Жакын арада жооп беребиз.',
            'Суроонуз кабыл алынды. Оператор иш убактысында жооп берет (Дш-Шб, 09:00-18:00).',
            'Рахмат! Суроонуз боюнча иштеп жатабыз.',
          ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      const supportMsg = { id: Date.now() + 1, from: 'support', text: reply, time: new Date().toISOString() };
      setMessages(prev => [...prev, supportMsg]);
      if (!isOpen) setUnread(prev => prev + 1);
    }, 1000 + Math.random() * 1500);
  };

  const formatTime = (isoStr) => {
    return new Date(isoStr).toLocaleTimeString(isRu ? 'ru-RU' : 'ky-KG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Окно чата */}
      {isOpen && (
        <div className="fixed bottom-20 right-3 md:bottom-24 md:right-6 z-50 w-[320px] md:w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ height: '420px' }}>
          {/* Шапка */}
          <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-sm font-bold">P</div>
              <div>
                <p className="font-semibold text-sm">{isRu ? 'Поддержка' : 'Колдоо'}</p>
                <p className="text-xs text-slate-300">{isRu ? 'Обычно отвечаем за 5 мин' : 'Адатта 5 мүн ичинде жооп беребиз'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Сообщения */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-slate-800 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                }`}>
                  {msg.text}
                  <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-slate-400' : 'text-gray-400'}`}>
                    {formatTime(msg.time)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {/* Ввод */}
          <div className="px-3 py-2 border-t border-gray-200 bg-white shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={isRu ? 'Напишите сообщение...' : 'Кабар жазыңыз...'}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="w-9 h-9 bg-slate-800 text-white rounded-xl flex items-center justify-center hover:bg-slate-700 disabled:opacity-30 shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Кнопка чата */}
      <button
        onClick={() => { setIsOpen(!isOpen); setUnread(0); }}
        className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {isOpen ? <ChevronDown size={24} /> : <MessageCircle size={24} />}
        {unread > 0 && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unread}
          </span>
        )}
      </button>
    </>
  );
}
