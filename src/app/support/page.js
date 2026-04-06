'use client';
import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { Send, ArrowLeft, Clock, User, Headphones } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const { lang } = useLang();
  const isRu = lang === 'ru';
  const [messages, setMessages] = useState([
    { id: 1, from: 'support', text: isRu ? 'Здравствуйте! Служба поддержки MarketKG. Чем можем помочь?' : 'Саламатсызбы! MarketKG колдоо кызматы. Кандай жардам бере алабыз?', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    // Сообщение пользователя
    setMessages(prev => [...prev, {
      id: Date.now(),
      from: 'user',
      text,
      time: new Date(),
    }]);
    setInput('');

    // Ответ поддержки через 1-2 секунды
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'support',
        text: isRu
          ? 'Спасибо за обращение! Ваше сообщение принято. Оператор ответит в рабочее время (Пн-Сб, 09:00-18:00).'
          : 'Кайрылуу үчүн рахмат! Кабарыңыз кабыл алынды. Оператор иш убактысында жооп берет (Дш-Шб, 09:00-18:00).',
        time: new Date(),
      }]);
    }, 1000 + Math.random() * 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(isRu ? 'ru-RU' : 'ky-KG', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Шапка */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Headphones size={20} className="text-primary-600" />
        </div>
        <div>
          <h1 className="font-bold text-gray-800">{isRu ? 'Поддержка MarketKG' : 'MarketKG колдоо'}</h1>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={10} />
            {isRu ? 'Пн-Сб: 09:00-18:00' : 'Дш-Шб: 09:00-18:00'}
          </p>
        </div>
      </div>

      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[80%]">
              {/* Аватар */}
              {msg.from === 'support' && (
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    <Headphones size={10} className="text-primary-600" />
                  </div>
                  <span className="text-xs text-gray-400">{isRu ? 'Поддержка' : 'Колдоо'}</span>
                </div>
              )}

              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-primary-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}>
                {msg.text}
              </div>
              <p className={`text-[10px] text-gray-400 mt-1 ${msg.from === 'user' ? 'text-right' : ''}`}>
                {formatTime(msg.time)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEnd} />
      </div>

      {/* Ввод */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isRu ? 'Напишите сообщение...' : 'Кабар жазыңыз...'}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-30"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
