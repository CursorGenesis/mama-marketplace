'use client';

// Стильные 3D иконки продуктов из Flaticon (как в Lalafo)
// Используем эмодзи как надёжные иконки — не зависят от внешних CDN
const CATEGORY_EMOJI = {
  confectionery: '🍫',
  drinks: '🧃',
  grocery: '🛒',
  dairy: '🥛',
  meat: '🍖',
  fruits: '🍎',
  frozen: '❄️',
  snacks: '🥨',
  bakery: '🍞',
  oils: '🫒',
  eggs: '🥚',
  tea_coffee: '☕',
  canned: '🥫',
  spices: '🌶️',
  baby: '🍼',
  tobacco: '🚬',
  disposable: '🥤',
  pet_food: '🐾',
  alcohol: '🍷',
  hardware: '🧹',
  stationery: '✏️',
  textile: '🧵',
  hygiene: '🧻',
  honey: '🍯',
  dried_fruits: '🌰',
  household: '🧴',
  other: '📦',
};

export default function CategoryIcon({ categoryId, size = 20, className = '' }) {
  const emoji = CATEGORY_EMOJI[categoryId] || CATEGORY_EMOJI.other;
  const px = typeof size === 'number' ? size : 20;

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: px * 0.75, width: px, height: px, lineHeight: 1 }}
      role="img"
      aria-label={categoryId}
    >
      {emoji}
    </span>
  );
}
