/**
 * AI Помощник для генерации описаний и подбора фото товаров
 * Работает оффлайн — без API ключей, на основе шаблонов
 */

// Шаблоны описаний по категориям
const DESCRIPTION_TEMPLATES = {
  dairy: [
    '{name}. Натуральный молочный продукт высшего качества. Произведено в Кыргызстане из свежего молока. Срок годности 14 дней. Хранить при температуре +2...+6°C.',
    '{name}. Свежий молочный продукт от лучших производителей Кыргызстана. Без консервантов и добавок. Идеально подходит для ежедневного употребления.',
    '{name}. Молочная продукция из натурального сырья. Высокое качество, проверено. Подходит для магазинов, кафе и ресторанов.',
  ],
  drinks: [
    '{name}. Натуральный напиток без искусственных красителей и консервантов. Произведено в Кыргызстане. Хранить в прохладном месте.',
    '{name}. Освежающий напиток из натуральных ингредиентов. Отличный выбор для розничных магазинов и точек общепита.',
    '{name}. Качественный напиток кыргызского производства. Натуральный состав, приятный вкус.',
  ],
  grocery: [
    '{name}. Бакалейный продукт высшего сорта. Произведено/фасовано в Кыргызстане. Подходит для розничной и оптовой продажи.',
    '{name}. Качественный продукт для вашего магазина. Проверенный производитель, стабильное качество. Длительный срок хранения.',
    '{name}. Бакалея от надёжного поставщика. Сертифицировано, соответствует стандартам качества.',
  ],
  meat: [
    '{name}. Свежее мясо высшего качества. Халяль. Ветеринарный контроль пройден. Хранить при температуре 0...+4°C.',
    '{name}. Мясная продукция от проверенных фермерских хозяйств Кыргызстана. Халяль. Ежедневная доставка.',
  ],
  fruits: [
    '{name}. Свежие фрукты и овощи от фермеров Кыргызстана. Натурально выращенные, без химикатов. Поставки каждый день.',
    '{name}. Фермерская продукция из экологически чистых районов Кыргызстана. Свежий урожай.',
  ],
  confectionery: [
    '{name}. Кондитерское изделие от лучших мастеров. Натуральные ингредиенты, ручная работа. Идеально для розничных магазинов.',
    '{name}. Вкусная кондитерская продукция. Произведено из качественного сырья. Подходит для чаепития и подарков.',
  ],
  frozen: [
    '{name}. Замороженный продукт. Халяль. Быстрая заморозка сохраняет все полезные свойства. Хранить при -18°C.',
    '{name}. Замороженные полуфабрикаты ручной лепки. Натуральный состав, без добавок. Халяль.',
  ],
  snacks: [
    '{name}. Вкусная закуска для любого случая. Качественные ингредиенты, удобная упаковка.',
    '{name}. Снеки и закуски от проверенного поставщика. Свежая продукция, отличный вкус.',
  ],
  household: [
    '{name}. Эффективное средство для дома. Безопасный состав. Подходит для ежедневного использования.',
    '{name}. Бытовая химия от надёжного производителя. Качество подтверждено сертификатами.',
  ],
};

// Фото из Unsplash по категориям (бесплатные)
const CATEGORY_PHOTOS = {
  dairy: [
    'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
  ],
  drinks: [
    'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed514?w=400&h=400&fit=crop',
  ],
  grocery: [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=400&h=400&fit=crop',
  ],
  meat: [
    'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop',
  ],
  fruits: [
    'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592681814168-6df0fa93161b?w=400&h=400&fit=crop',
  ],
  confectionery: [
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop',
  ],
  frozen: [
    'https://images.unsplash.com/photo-1587049016823-69ef9d68bd44?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1625398407796-82650a8c9285?w=400&h=400&fit=crop',
  ],
  snacks: [
    'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&h=400&fit=crop',
  ],
  household: [
    'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&h=400&fit=crop',
    'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&h=400&fit=crop',
  ],
};

/**
 * Генерирует описание товара по названию и категории
 */
export function generateDescription(name, category, unit) {
  const templates = DESCRIPTION_TEMPLATES[category] || DESCRIPTION_TEMPLATES.grocery;
  const template = templates[Math.floor(Math.random() * templates.length)];
  let desc = template.replace('{name}', name);

  // Добавляем единицу измерения
  if (unit && unit !== 'шт') {
    desc += ` Цена указана за 1 ${unit}.`;
  }

  return desc;
}

/**
 * Подбирает фото из бесплатной базы по категории
 */
export function getAutoPhoto(category) {
  const photos = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS.grocery;
  return photos[Math.floor(Math.random() * photos.length)];
}

/**
 * Умное определение категории по названию товара
 */
export function detectCategory(name) {
  const lower = name.toLowerCase();

  if (lower.match(/молок|кефир|сметан|творог|масло слив|айран|ряженк|каймак|йогурт|сүт|быштак/)) return 'dairy';
  if (lower.match(/максым|чалап|бозо|компот|сок|вода|квас|чай|кофе|напит|суусундук/)) return 'drinks';
  if (lower.match(/мука|рис|гречк|макарон|сахар|масло подсолн|масло раст|соль|крупа|ун|күрүч/)) return 'grocery';
  if (lower.match(/говяд|баран|курица|мясо|колбас|сосис|эт|тоок/)) return 'meat';
  if (lower.match(/яблок|картоф|морков|помидор|огурц|лук|капуст|фрукт|овощ|жемиш|жашылча/)) return 'fruits';
  if (lower.match(/конфет|печень|торт|пахлав|шоколад|карамел|вафл|кондитер/)) return 'confectionery';
  if (lower.match(/пельмен|мант|самс|замороз|мороже|тоңдур/)) return 'frozen';
  if (lower.match(/чипс|орех|курага|семечк|сухар|снек/)) return 'snacks';
  if (lower.match(/порошок|мыло|средство|шампунь|чистящ|моющ|стирал/)) return 'household';

  return '';
}
