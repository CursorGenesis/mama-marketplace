'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LangContext';
import { useRouter } from 'next/navigation';
import { Bot, MessageSquare, Search, Lightbulb, Bug, AlertTriangle, Sparkles, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const demoFeedback = [
  { id: 1, type: 'suggestion', status: 'implemented', role: 'client', text: 'Добавить фильтр по минимальному заказу', votes: 24, date: '2026-03-15', aiResponse: 'Спасибо! Эта функция уже реализована в каталоге.' },
  { id: 2, type: 'suggestion', status: 'in_progress', role: 'supplier', text: 'Сделать экспорт заказов в Excel', votes: 18, date: '2026-03-20', aiResponse: 'Отличная идея! Мы уже работаем над этим.' },
  { id: 3, type: 'bug', status: 'in_progress', role: 'client', text: 'Карта не загружается на телефоне Samsung', votes: 12, date: '2026-03-22', aiResponse: 'Спасибо за сообщение. Наши разработчики исследуют проблему.' },
  { id: 4, type: 'improvement', status: 'new', role: 'client', text: 'Было бы удобно видеть рейтинг поставщика в каталоге товаров', votes: 15, date: '2026-03-25', aiResponse: 'Ваше предложение принято и добавлено в план развития.' },
  { id: 5, type: 'complaint', status: 'in_progress', role: 'client', text: 'Долго загружаются фотографии товаров', votes: 9, date: '2026-03-26', aiResponse: 'Мы работаем над оптимизацией загрузки изображений.' },
  { id: 6, type: 'suggestion', status: 'new', role: 'supplier', text: 'Добавить возможность массовой загрузки товаров', votes: 21, date: '2026-03-27', aiResponse: 'Ваше предложение принято! 21 пользователь поддержал эту идею.' },
  { id: 7, type: 'improvement', status: 'new', role: 'client', text: 'Добавить push-уведомления о статусе заказа', votes: 16, date: '2026-03-28', aiResponse: 'Отличное предложение! Мы рассмотрим его в следующем обновлении.' },
  { id: 8, type: 'bug', status: 'implemented', role: 'client', text: 'При переключении языка сбрасывается корзина', votes: 7, date: '2026-03-10', aiResponse: 'Ошибка исправлена. Спасибо за сообщение!' },
];

const aiInsights = {
  topProblems: [
    { text: 'Загрузка изображений', count: 8 },
    { text: 'Совместимость с мобильными', count: 5 },
    { text: 'Скорость загрузки страниц', count: 4 },
  ],
  topIdeas: [
    { text: 'Массовая загрузка товаров', votes: 21 },
    { text: 'Фильтр по минимальному заказу', votes: 24 },
    { text: 'Push-уведомления', votes: 16 },
  ],
  recommendations: [
    'Оптимизировать загрузку изображений — 8 жалоб за месяц',
    'Добавить массовый импорт товаров — запрос от 21 поставщика',
    'Улучшить мобильную версию — 5 сообщений о проблемах',
  ],
  generatedTasks: [
    { title: 'Оптимизация изображений', priority: 'Высокий', requests: 8, status: 'new' },
    { title: 'Массовый импорт товаров', priority: 'Высокий', requests: 21, status: 'in_progress' },
    { title: 'Push-уведомления', priority: 'Средний', requests: 16, status: 'new' },
    { title: 'Мобильная адаптация карты', priority: 'Средний', requests: 5, status: 'in_progress' },
  ],
};

const typeConfig = {
  suggestion: { color: 'bg-blue-100 text-blue-700', icon: Lightbulb },
  bug: { color: 'bg-red-100 text-red-700', icon: Bug },
  complaint: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  improvement: { color: 'bg-green-100 text-green-700', icon: Sparkles },
};

const statusConfig = {
  new: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  implemented: 'bg-green-100 text-green-700',
};

const priorityConfig = {
  'Высокий': 'bg-red-100 text-red-700',
  'Средний': 'bg-yellow-100 text-yellow-700',
  'Низкий': 'bg-gray-100 text-gray-600',
};

export default function AdminFeedbackPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { lang, t } = useLang();
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState(demoFeedback);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) { router.push('/'); }
  }, [isAdmin, authLoading]);

  if (authLoading) return <div className="text-center py-20 text-gray-400">{t('loading')}</div>;
  if (!isAdmin) return null;

  const typeLabel = (type) => {
    const map = { suggestion: t('feedback_type_suggestion'), bug: t('feedback_type_bug'), complaint: t('feedback_type_complaint'), improvement: t('feedback_type_improvement') };
    return map[type] || type;
  };

  const statusLabel = (status) => {
    const map = { new: t('feedback_status_new'), in_progress: t('feedback_status_progress'), implemented: t('feedback_status_done') };
    return map[status] || status;
  };

  const changeStatus = (id, newStatus) => {
    setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const filtered = feedbackList
    .filter(f => filterType === 'all' || f.type === filterType)
    .filter(f => filterStatus === 'all' || f.status === filterStatus)
    .filter(f => !searchQuery || f.text.toLowerCase().includes(searchQuery.toLowerCase()));

  const statsTotal = 32;
  const statsNew = 12;
  const statsProgress = 8;
  const statsDone = 12;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">
        {lang === 'kg' ? 'Кайтарым байланыш башкаруу' : 'Управление обратной связью'}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare size={20} className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{statsTotal}</div>
              <div className="text-sm text-gray-500">{lang === 'kg' ? 'Бардык кайрылуулар' : 'Всего обращений'}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <AlertCircle size={20} className="text-gray-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{statsNew}</div>
              <div className="text-sm text-gray-500">{t('feedback_status_new')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{statsProgress}</div>
              <div className="text-sm text-gray-500">{t('feedback_status_progress')}</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{statsDone}</div>
              <div className="text-sm text-gray-500">{t('feedback_status_done')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8 border border-blue-100">
        <div className="flex items-center gap-2 mb-5">
          <Bot size={22} className="text-primary-600" />
          <h2 className="text-lg font-bold">{lang === 'kg' ? 'AI талдоо' : 'AI Аналитика'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Top problems */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-3">
              {lang === 'kg' ? 'Эң көп кездешкен көйгөйлөр' : 'Самые частые проблемы'}
            </h3>
            <div className="space-y-2">
              {aiInsights.topProblems.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                  <span className="text-sm">{p.text}</span>
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top ideas */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-3">
              {lang === 'kg' ? 'Популярдуу идеялар' : 'Популярные идеи'}
            </h3>
            <div className="space-y-2">
              {aiInsights.topIdeas.map((idea, i) => (
                <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                  <span className="text-sm">{idea.text}</span>
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{idea.votes} {lang === 'kg' ? 'добуш' : 'голосов'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="font-semibold text-sm text-gray-500 mb-3">
              {lang === 'kg' ? 'AI сунуштары' : 'Рекомендации AI'}
            </h3>
            <div className="space-y-2">
              {aiInsights.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2 bg-green-50 rounded-lg px-3 py-2">
                  <TrendingUp size={14} className="text-green-600 mt-0.5 shrink-0" />
                  <span className="text-sm">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generated tasks */}
        <div>
          <h3 className="font-semibold text-sm text-gray-500 mb-3">
            {lang === 'kg' ? 'Автоматтык тапшырмалар' : 'Сгенерированные задачи'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">{lang === 'kg' ? 'Тапшырма' : 'Задача'}</th>
                  <th className="pb-2 font-medium">{lang === 'kg' ? 'Приоритет' : 'Приоритет'}</th>
                  <th className="pb-2 font-medium">{lang === 'kg' ? 'Кайрылуулар' : 'Обращений'}</th>
                  <th className="pb-2 font-medium">{lang === 'kg' ? 'Статус' : 'Статус'}</th>
                </tr>
              </thead>
              <tbody>
                {aiInsights.generatedTasks.map((task, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{task.title}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[task.priority] || 'bg-gray-100 text-gray-600'}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-2.5">{task.requests}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[task.status]}`}>
                        {statusLabel(task.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-5 shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'kg' ? 'Издөө...' : 'Поиск...'}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'kg' ? 'Бардык түрлөр' : 'Все типы'}</option>
            <option value="suggestion">{t('feedback_type_suggestion')}</option>
            <option value="bug">{t('feedback_type_bug')}</option>
            <option value="complaint">{t('feedback_type_complaint')}</option>
            <option value="improvement">{t('feedback_type_improvement')}</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{lang === 'kg' ? 'Бардык статустар' : 'Все статусы'}</option>
            <option value="new">{t('feedback_status_new')}</option>
            <option value="in_progress">{t('feedback_status_progress')}</option>
            <option value="implemented">{t('feedback_status_done')}</option>
          </select>
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {filtered.map(item => {
          const TypeIcon = typeConfig[item.type]?.icon || Lightbulb;
          return (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[item.type]?.color}`}>
                  <TypeIcon size={14} />
                  {typeLabel(item.type)}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[item.status]}`}>
                  {statusLabel(item.status)}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {item.role === 'client' ? t('feedback_client') : t('feedback_supplier_role')}
                </span>
                <span className="text-sm text-gray-400 ml-auto">{item.date}</span>
              </div>

              <p className="text-gray-800 mb-3">{item.text}</p>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <TrendingUp size={14} />
                  {item.votes} {lang === 'kg' ? 'добуш' : 'голосов'}
                </div>
                <select
                  value={item.status}
                  onChange={e => changeStatus(item.id, e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="new">{t('feedback_status_new')}</option>
                  <option value="in_progress">{t('feedback_status_progress')}</option>
                  <option value="implemented">{t('feedback_status_done')}</option>
                </select>
              </div>

              {item.aiResponse && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                  <Bot size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-500 italic">{item.aiResponse}</p>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            {lang === 'kg' ? 'Кайрылуулар табылган жок' : 'Обращения не найдены'}
          </div>
        )}
      </div>
    </div>
  );
}
