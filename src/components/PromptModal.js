'use client';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// Замена window.prompt() — нативный prompt блокируется на iOS PWA и выглядит
// как Browser-Default. Этот компонент использует обычный модальный диалог,
// который работает на всех устройствах и подходит к стилю платформы.
export default function PromptModal({
  open,
  title,
  description,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  multiline = false,
  onConfirm,
  onCancel,
}) {
  const [value, setValue] = useState(defaultValue);

  // Сбрасываем значение при каждом открытии
  useEffect(() => {
    if (open) setValue(defaultValue);
  }, [open, defaultValue]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const trimmed = value.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-800 flex-1">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 -mr-2 -mt-2 p-2"
          >
            <X size={18} />
          </button>
        </div>

        {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}

        <form onSubmit={handleSubmit}>
          {multiline ? (
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          ) : (
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
          )}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
