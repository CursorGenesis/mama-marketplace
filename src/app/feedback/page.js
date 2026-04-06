'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/context/LangContext';
import { ThumbsUp, X, Lightbulb, Bug, AlertTriangle, Sparkles, Paperclip, MessageSquarePlus, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

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

function generateAiResponse(type, text) {
  const lower = text.toLowerCase();
  if (type === 'bug') return 'Спасибо за сообщение об ошибке. Наши разработчики уже исследуют проблему.';
  if (type === 'complaint') return 'Приносим извинения за неудобства. Ваша жалоба принята и будет рассмотрена.';
  if (lower.includes('добавить') || lower.includes('сделать') || lower.includes('хочу'))
    return 'Отличная идея! Ваше предложение добавлено в план развития.';
  if (lower.includes('удобн') || lower.includes('улучш'))
    return 'Ваше предложение принято! Мы стремимся сделать платформу удобнее.';
  return 'Спасибо за ваш отзыв! Мы обязательно рассмотрим ваше обращение.';
}

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

export default function FeedbackPage() {
  const { lang, t } = useLang();
  const [feedback, setFeedback] = useState(demoFeedback);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('popular');
  const [showModal, setShowModal] = useState(false);
  const [votedIds, setVotedIds] = useState([]);

  // Form state
  const [formRole, setFormRole] = useState('client');
  const [formType, setFormType] = useState('suggestion');
  const [formText, setFormText] = useState('');
  const [formFile, setFormFile] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('marketkg_votes') || '[]');
      setVotedIds(saved);
    } catch { setVotedIds([]); }
  }, []);

  const handleVote = (id) => {
    if (votedIds.includes(id)) return;
    const newVoted = [...votedIds, id];
    setVotedIds(newVoted);
    localStorage.setItem('marketkg_votes', JSON.stringify(newVoted));
    setFeedback(prev => prev.map(f => f.id === id ? { ...f, votes: f.votes + 1 } : f));
  };

  const handleSubmit = () => {
    if (!formText.trim()) return;
    const newItem = {
      id: Date.now(),
      type: formType,
      status: 'new',
      role: formRole,
      text: formText.trim(),
      votes: 0,
      date: new Date().toISOString().split('T')[0],
      aiResponse: generateAiResponse(formType, formText),
    };
    setFeedback(prev => [newItem, ...prev]);
    toast.success(t('feedback_thanks'));
    setFormText('');
    setFormFile(null);
    setShowModal(false);
  };

  const typeLabel = (type) => {
    const map = { suggestion: t('feedback_type_suggestion'), bug: t('feedback_type_bug'), complaint: t('feedback_type_complaint'), improvement: t('feedback_type_improvement') };
    return map[type] || type;
  };

  const statusLabel = (status) => {
    const map = { new: t('feedback_status_new'), in_progress: t('feedback_status_progress'), implemented: t('feedback_status_done') };
    return map[status] || status;
  };

  const roleLabel = (role) => role === 'client' ? t('feedback_client') : t('feedback_supplier_role');

  const filtered = feedback
    .filter(f => filter === 'all' || f.type === filter)
    .sort((a, b) => sort === 'popular' ? b.votes - a.votes : new Date(b.date) - new Date(a.date));

  const tabs = [
    { key: 'all', label: t('feedback_all') },
    { key: 'suggestion', label: t('feedback_type_suggestion') },
    { key: 'bug', label: t('feedback_type_bug') },
    { key: 'complaint', label: t('feedback_type_complaint') },
    { key: 'improvement', label: t('feedback_type_improvement') },
  ];

  const formTypes = [
    { key: 'suggestion', icon: Lightbulb },
    { key: 'bug', icon: Bug },
    { key: 'complaint', icon: AlertTriangle },
    { key: 'improvement', icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{t('feedback_title')}</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === tab.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSort('popular')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sort === 'popular' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {t('feedback_sort_popular')}
        </button>
        <button
          onClick={() => setSort('newest')}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sort === 'newest' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          {t('feedback_sort_newest')}
        </button>
      </div>

      {/* Feedback list */}
      <div className="space-y-4">
        {filtered.map(item => {
          const TypeIcon = typeConfig[item.type]?.icon || Lightbulb;
          return (
            <div key={item.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig[item.type]?.color}`}>
                  <TypeIcon size={14} />
                  {typeLabel(item.type)}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[item.status]}`}>
                  {statusLabel(item.status)}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {roleLabel(item.role)}
                </span>
              </div>

              <p className="text-gray-800 mb-3">{item.text}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{item.date}</span>
                <button
                  onClick={() => handleVote(item.id)}
                  disabled={votedIds.includes(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${votedIds.includes(item.id) ? 'bg-primary-50 text-primary-600 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'}`}
                >
                  <ThumbsUp size={16} />
                  {item.votes}
                </button>
              </div>

              {/* AI Response */}
              {item.aiResponse && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-start gap-2">
                  <Bot size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-500 italic">{item.aiResponse}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating submit button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-6 z-30 flex items-center gap-2 px-5 py-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:shadow-xl transition-all"
      >
        <MessageSquarePlus size={20} />
        <span className="text-sm font-medium">{t('feedback_submit')}</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>

            <h2 className="text-xl font-bold mb-5">{t('feedback_submit')}</h2>

            {/* Role selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'kg' ? 'Сиздин ролуңуз' : 'Ваша роль'}
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFormRole('client')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${formRole === 'client' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {t('feedback_client')}
                </button>
                <button
                  onClick={() => setFormRole('supplier')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${formRole === 'supplier' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {t('feedback_supplier_role')}
                </button>
              </div>
            </div>

            {/* Type selector */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {lang === 'kg' ? 'Кайрылуу түрү' : 'Тип обращения'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formTypes.map(ft => {
                  const Icon = ft.icon;
                  return (
                    <button
                      key={ft.key}
                      onClick={() => setFormType(ft.key)}
                      className={`flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${formType === ft.key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      <Icon size={16} />
                      {typeLabel(ft.key)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textarea */}
            <div className="mb-4">
              <textarea
                value={formText}
                onChange={e => setFormText(e.target.value)}
                placeholder={t('feedback_placeholder')}
                rows={4}
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            {/* File attach */}
            <div className="mb-5">
              <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-700 transition-colors">
                <Paperclip size={16} />
                <span>{formFile ? formFile.name : t('feedback_attach')}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={e => setFormFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!formText.trim()}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('feedback_submit')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
