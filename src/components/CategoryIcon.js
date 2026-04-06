'use client';

// Стильные 3D иконки продуктов из Flaticon (как в Lalafo)
const CATEGORY_IMAGES = {
  confectionery: 'https://cdn-icons-png.flaticon.com/128/3081/3081967.png',   // торт/сладости 3D
  drinks: 'https://cdn-icons-png.flaticon.com/128/3050/3050131.png',          // сок/напиток 3D
  grocery: 'https://cdn-icons-png.flaticon.com/128/3514/3514155.png',         // пакет продуктов 3D
  dairy: 'https://cdn-icons-png.flaticon.com/128/3050/3050158.png',           // молоко 3D
  meat: 'https://cdn-icons-png.flaticon.com/128/3143/3143643.png',            // мясо/стейк 3D
  fruits: 'https://cdn-icons-png.flaticon.com/128/3194/3194591.png',          // фрукты корзина 3D
  frozen: 'https://cdn-icons-png.flaticon.com/128/3082/3082035.png',          // мороженое 3D
  snacks: 'https://cdn-icons-png.flaticon.com/128/3081/3081903.png',          // печенье/снеки 3D
  household: 'https://cdn-icons-png.flaticon.com/128/3163/3163010.png',       // чистящее средство 3D
  other: 'https://cdn-icons-png.flaticon.com/128/3081/3081986.png',           // коробка 3D
};

export default function CategoryIcon({ categoryId, size = 20, className = '' }) {
  const src = CATEGORY_IMAGES[categoryId] || CATEGORY_IMAGES.other;
  const px = typeof size === 'number' ? size : 20;

  return (
    <img
      src={src}
      alt={categoryId}
      width={px}
      height={px}
      className={`inline-block ${className}`}
      style={{ width: px, height: px }}
      loading="lazy"
    />
  );
}
