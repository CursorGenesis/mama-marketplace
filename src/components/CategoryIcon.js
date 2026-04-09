'use client';

const CATEGORY_IMAGES = {
  confectionery: 'https://img.icons8.com/fluency/96/chocolate-bar.png',
  drinks: 'https://img.icons8.com/fluency/96/juice.png',
  grocery: 'https://img.icons8.com/fluency/96/grocery-bag.png',
  dairy: 'https://img.icons8.com/fluency/96/milk-bottle.png',
  meat: 'https://img.icons8.com/fluency/96/steak.png',
  fruits: 'https://img.icons8.com/fluency/96/group-of-fruits.png',
  frozen: 'https://img.icons8.com/fluency/96/snowflake.png',
  snacks: 'https://img.icons8.com/fluency/96/chips.png',
  bakery: 'https://img.icons8.com/fluency/96/bread.png',
  oils: 'https://img.icons8.com/fluency/96/olive-oil.png',
  eggs: 'https://img.icons8.com/fluency/96/egg.png',
  tea_coffee: 'https://img.icons8.com/fluency/96/coffee-cup.png',
  canned: 'https://img.icons8.com/fluency/96/canned-food.png',
  spices: 'https://img.icons8.com/fluency/96/chili-pepper.png',
  baby: 'https://img.icons8.com/fluency/96/baby-bottle.png',
  tobacco: 'https://img.icons8.com/fluency/96/cigarette.png',
  disposable: 'https://img.icons8.com/fluency/96/paper-cup.png',
  pet_food: 'https://img.icons8.com/fluency/96/dog-bowl.png',
  alcohol: 'https://img.icons8.com/fluency/96/wine-glass.png',
  hardware: 'https://img.icons8.com/fluency/96/broom.png',
  stationery: 'https://img.icons8.com/fluency/96/pencil.png',
  textile: 'https://img.icons8.com/fluency/96/towel.png',
  hygiene: 'https://img.icons8.com/fluency/96/toilet-paper.png',
  honey: 'https://img.icons8.com/fluency/96/honey.png',
  dried_fruits: 'https://img.icons8.com/fluency/96/almond.png',
  household: 'https://img.icons8.com/fluency/96/cleaning.png',
  other: 'https://img.icons8.com/fluency/96/box.png',
};

const CATEGORY_EMOJI = {
  confectionery: '🍫', drinks: '🧃', grocery: '🛒', dairy: '🥛', meat: '🍖',
  fruits: '🍎', frozen: '❄️', snacks: '🥨', bakery: '🍞', oils: '🫒',
  eggs: '🥚', tea_coffee: '☕', canned: '🥫', spices: '🌶️', baby: '🍼',
  tobacco: '🚬', disposable: '🥤', pet_food: '🐾', alcohol: '🍷', hardware: '🧹',
  stationery: '✏️', textile: '🧵', hygiene: '🧻', honey: '🍯', dried_fruits: '🌰',
  household: '🧴', other: '📦',
};

export default function CategoryIcon({ categoryId, size = 20, className = '' }) {
  const src = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES.other;
  const emoji = CATEGORY_EMOJI[categoryId] || CATEGORY_EMOJI.other;
  const px = typeof size === 'number' ? size : 20;

  return (
    <span className={`inline-flex items-center justify-center ${className}`} style={{ width: px, height: px, fontSize: px * 0.65 }}>
      <img
        src={src}
        alt={categoryId}
        width={px}
        height={px}
        style={{ width: px, height: px }}
        loading="lazy"
        onError={(e) => {
          e.target.outerHTML = emoji;
        }}
      />
    </span>
  );
}
