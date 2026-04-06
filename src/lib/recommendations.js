/**
 * Система рекомендаций "С этим покупают"
 * Анализирует историю заказов и находит товары, которые часто покупают вместе
 * Работает через localStorage — накапливает данные с каждым заказом
 */

const STORAGE_KEY = 'marketkg_order_history';
const PAIRS_KEY = 'marketkg_product_pairs';

/**
 * Сохранить заказ в историю
 * Вызывается после каждого оформления заказа
 * @param {Array} items - массив товаров из заказа [{id, name, price, supplierId, supplierName, ...}]
 */
export function saveOrderToHistory(items) {
  try {
    // Сохраняем заказ
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    history.push({
      date: new Date().toISOString(),
      productIds: items.map(i => i.id),
    });
    // Храним последние 100 заказов
    if (history.length > 100) history.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // Обновляем пары товаров
    const pairs = JSON.parse(localStorage.getItem(PAIRS_KEY) || '{}');
    const ids = items.map(i => i.id);

    // Для каждой пары товаров в заказе увеличиваем счётчик
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key1 = `${ids[i]}__${ids[j]}`;
        const key2 = `${ids[j]}__${ids[i]}`;
        pairs[key1] = (pairs[key1] || 0) + 1;
        pairs[key2] = (pairs[key2] || 0) + 1;
      }
    }
    localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
  } catch (e) {
    console.error('Error saving order history:', e);
  }
}

/**
 * Получить рекомендации на основе истории заказов
 * @param {Array} cartItemIds - ID товаров в текущей корзине
 * @param {Array} allProducts - все доступные товары
 * @param {number} limit - максимум рекомендаций
 * @returns {Array} - массив рекомендуемых товаров с полем pairCount
 */
export function getSmartRecommendations(cartItemIds, allProducts, limit = 4) {
  try {
    const pairs = JSON.parse(localStorage.getItem(PAIRS_KEY) || '{}');
    const scores = {};

    // Для каждого товара в корзине ищем связанные
    cartItemIds.forEach(cartId => {
      Object.entries(pairs).forEach(([key, count]) => {
        const [from, to] = key.split('__');
        if (from === cartId && !cartItemIds.includes(to)) {
          scores[to] = (scores[to] || 0) + count;
        }
      });
    });

    // Сортируем по количеству совместных покупок
    const sorted = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);

    // Находим полные данные товаров
    return sorted
      .map(([productId, pairCount]) => {
        const product = allProducts.find(p => p.id === productId);
        if (!product) return null;
        return { ...product, pairCount };
      })
      .filter(Boolean);
  } catch (e) {
    console.error('Error getting recommendations:', e);
    return [];
  }
}

/**
 * Получить статистику рекомендаций
 * @returns {Object} - { totalOrders, totalPairs, topPairs }
 */
export function getRecommendationStats() {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const pairs = JSON.parse(localStorage.getItem(PAIRS_KEY) || '{}');

    const topPairs = Object.entries(pairs)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => {
        const [from, to] = key.split('__');
        return { from, to, count };
      });

    return {
      totalOrders: history.length,
      totalPairs: Object.keys(pairs).length,
      topPairs,
    };
  } catch (e) {
    return { totalOrders: 0, totalPairs: 0, topPairs: [] };
  }
}

/**
 * Предзаполнить данные для демо (имитация 50 прошлых заказов)
 */
export function seedDemoHistory() {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (existing.length > 5) return; // Уже есть данные

  // Типичные комбинации покупок в КГ
  const typicalOrders = [
    ['p1', 'p4', 'p5'],          // Мука + Сахар + Масло
    ['p1', 'p2', 'p4'],          // Мука + Рис + Сахар
    ['p10', 'p11', 'p12'],       // Молоко + Сметана + Айран
    ['p10', 'p13', 'p11'],       // Молоко + Творог + Сметана
    ['p6', 'p7', 'p9'],          // Максым + Чалап + Бозо
    ['p6', 'p7'],                // Максым + Чалап
    ['p1', 'p4', 'p2', 'p3'],   // Мука + Сахар + Рис + Макароны
    ['p28', 'p29', 'p30'],       // Пельмени + Манты + Самса
    ['p28', 'p29'],              // Пельмени + Манты
    ['p14', 'p15', 'p17'],       // Печенье + Конфеты + Пахлава
    ['p10', 'p11', 'p33', 'p34'],// Молоко + Сметана + Кефир + Масло
    ['p1', 'p2', 'p5', 'p31'],  // Мука + Рис + Масло + Гречка
    ['p22', 'p23'],              // Говядина + Баранина
    ['p18', 'p19', 'p20'],       // Яблоки + Картофель + Морковь
    ['p6', 'p8'],                // Максым + Компот
    ['p10', 'p12'],              // Молоко + Айран
    ['p1', 'p4'],                // Мука + Сахар
    ['p25', 'p26', 'p27'],       // Чипсы + Орехи + Курага
    ['p14', 'p15'],              // Печенье + Конфеты
    ['p2', 'p3', 'p31'],        // Рис + Макароны + Гречка
  ];

  // Имитируем 50 заказов с разными комбинациями
  const history = [];
  const pairs = {};

  for (let i = 0; i < 50; i++) {
    const order = typicalOrders[i % typicalOrders.length];
    history.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      productIds: order,
    });

    // Считаем пары
    for (let a = 0; a < order.length; a++) {
      for (let b = a + 1; b < order.length; b++) {
        const key1 = `${order[a]}__${order[b]}`;
        const key2 = `${order[b]}__${order[a]}`;
        pairs[key1] = (pairs[key1] || 0) + 1;
        pairs[key2] = (pairs[key2] || 0) + 1;
      }
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  localStorage.setItem(PAIRS_KEY, JSON.stringify(pairs));
}
