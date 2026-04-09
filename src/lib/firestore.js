import { db, storage } from './firebase';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { DEMO_SUPPLIERS, DEMO_PRODUCTS } from './demoData';

// Режим демо — если Firebase не настроен, показываем демо-данные
const IS_DEMO = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'demo-key';

// =============================================
//  КАТЕГОРИИ
// =============================================
export const CATEGORIES = [
  { id: 'confectionery', name: 'Кондитерка', icon: '🍫' },
  { id: 'drinks', name: 'Напитки', icon: '🧃' },
  { id: 'grocery', name: 'Бакалея', icon: '🛒' },
  { id: 'dairy', name: 'Молочные продукты', icon: '🧀' },
  { id: 'meat', name: 'Мясо и птица', icon: '🍗' },
  { id: 'fruits', name: 'Фрукты и овощи', icon: '🥬' },
  { id: 'frozen', name: 'Заморозка', icon: '❄️' },
  { id: 'snacks', name: 'Снеки', icon: '🥜' },
  { id: 'bakery', name: 'Хлеб и выпечка', icon: '🍞' },
  { id: 'oils', name: 'Масла и соусы', icon: '🫒' },
  { id: 'eggs', name: 'Яйца', icon: '🥚' },
  { id: 'tea_coffee', name: 'Чай и кофе', icon: '☕' },
  { id: 'canned', name: 'Консервы', icon: '🥫' },
  { id: 'spices', name: 'Специи и приправы', icon: '🌶️' },
  { id: 'baby', name: 'Детское питание', icon: '🍼' },
  { id: 'tobacco', name: 'Табак', icon: '🚬' },
  { id: 'disposable', name: 'Одноразовая посуда', icon: '🥤' },
  { id: 'pet_food', name: 'Корма для животных', icon: '🐾' },
  { id: 'alcohol', name: 'Алкоголь', icon: '🍷' },
  { id: 'hardware', name: 'Хозтовары', icon: '🧹' },
  { id: 'stationery', name: 'Канцтовары', icon: '✏️' },
  { id: 'textile', name: 'Текстиль', icon: '🧵' },
  { id: 'hygiene', name: 'Гигиена', icon: '🧻' },
  { id: 'honey', name: 'Мёд и варенье', icon: '🍯' },
  { id: 'dried_fruits', name: 'Сухофрукты и орехи', icon: '🌰' },
  { id: 'household', name: 'Бытовая химия', icon: '🫧' },
  { id: 'other', name: 'Другое', icon: '🏷️' },
];

// Подкатегории
export const SUBCATEGORIES = {
  confectionery: { ru: ['Конфеты шоколадные', 'Карамель', 'Печенье', 'Торты', 'Пахлава', 'Вафли'], kg: ['Шоколад конфеталар', 'Карамель', 'Печенье', 'Торттор', 'Пахлава', 'Вафли'] },
  drinks: { ru: ['Максым', 'Чалап', 'Бозо', 'Квас', 'Компот', 'Минеральная вода', 'Чай'], kg: ['Максым', 'Чалап', 'Бозо', 'Квас', 'Компот', 'Минералдык суу', 'Чай'] },
  grocery: { ru: ['Мука', 'Рис', 'Макароны', 'Сахар', 'Масло растительное', 'Гречка', 'Соль'], kg: ['Ун', 'Күрүч', 'Макарон', 'Кант', 'Өсүмдүк майы', 'Гречка', 'Туз'] },
  dairy: { ru: ['Молоко', 'Кефир', 'Сметана', 'Творог', 'Масло сливочное', 'Айран', 'Йогурт'], kg: ['Сүт', 'Кефир', 'Каймак', 'Быштак', 'Сары май', 'Айран', 'Йогурт'] },
  meat: { ru: ['Говядина', 'Баранина', 'Курица', 'Колбаса', 'Фарш'], kg: ['Уй эти', 'Кой эти', 'Тоок', 'Колбаса', 'Фарш'] },
  fruits: { ru: ['Яблоки', 'Картофель', 'Морковь', 'Помидоры', 'Огурцы', 'Лук'], kg: ['Алма', 'Картошка', 'Сабиз', 'Помидор', 'Бадыраң', 'Пияз'] },
  frozen: { ru: ['Пельмени', 'Манты', 'Самса', 'Овощные смеси', 'Мороженое'], kg: ['Пельмендер', 'Манты', 'Самса', 'Жашылча аралашма', 'Балмуздак'] },
  snacks: { ru: ['Чипсы', 'Орехи', 'Сухофрукты', 'Семечки', 'Сухарики'], kg: ['Чипсы', 'Жаңгак', 'Кургатылган жемиш', 'Чечек', 'Сухарилер'] },
  household: { ru: ['Стиральный порошок', 'Мыло', 'Средство для посуды', 'Шампунь'], kg: ['Кир жуугуч порошок', 'Сабын', 'Идиш жуугуч', 'Шампунь'] },
  bakery: { ru: ['Лепёшки', 'Хлеб белый', 'Хлеб чёрный', 'Самса', 'Боорсоки', 'Лаваш'], kg: ['Нан', 'Ак нан', 'Кара нан', 'Самса', 'Боорсок', 'Лаваш'] },
  oils: { ru: ['Подсолнечное масло', 'Кетчуп', 'Майонез', 'Соевый соус', 'Томатная паста', 'Уксус'], kg: ['Күнөсткан майы', 'Кетчуп', 'Майонез', 'Соя соусу', 'Томат пастасы', 'Сирке'] },
  eggs: { ru: ['Куриные', 'Перепелиные'], kg: ['Тоок жумурткасы', 'Бөдөнө жумурткасы'] },
  tea_coffee: { ru: ['Чай чёрный', 'Чай зелёный', 'Кофе молотый', 'Кофе растворимый', 'Какао'], kg: ['Кара чай', 'Жашыл чай', 'Тартылган кофе', 'Ыкчам кофе', 'Какао'] },
  canned: { ru: ['Тушёнка', 'Рыбные консервы', 'Овощные консервы', 'Горошек', 'Кукуруза'], kg: ['Тушёнка', 'Балык консервасы', 'Жашылча консервасы', 'Буурчак', 'Жүгөрү'] },
  spices: { ru: ['Перец чёрный', 'Зира', 'Куркума', 'Лавровый лист', 'Паприка', 'Корица'], kg: ['Кара мурч', 'Зира', 'Куркума', 'Лавр жалбырагы', 'Паприка', 'Даарчын'] },
  baby: { ru: ['Детские смеси', 'Пюре', 'Каши', 'Соки детские'], kg: ['Балдар аралашмалары', 'Пюре', 'Ботко', 'Балдар ширеси'] },
  tobacco: { ru: ['Сигареты', 'Табак'], kg: ['Тамеки', 'Табак'] },
  disposable: { ru: ['Стаканы', 'Тарелки', 'Контейнеры', 'Вилки/ложки', 'Пакеты'], kg: ['Стакандар', 'Табактар', 'Контейнерлер', 'Вилка/кашык', 'Пакеттер'] },
  pet_food: { ru: ['Корм для собак', 'Корм для кошек', 'Наполнитель'], kg: ['Ит тоюту', 'Мышык тоюту', 'Толтургуч'] },
  alcohol: { ru: ['Пиво', 'Вино', 'Водка', 'Коньяк', 'Шампанское'], kg: ['Пиво', 'Шарап', 'Водка', 'Коньяк', 'Шампан'] },
  hardware: { ru: ['Вёдра', 'Щётки', 'Мешки', 'Плёнка', 'Перчатки'], kg: ['Чалектер', 'Щёткалар', 'Баштыктар', 'Плёнка', 'Кол каптар'] },
  stationery: { ru: ['Бумага А4', 'Ручки', 'Тетради', 'Скотч', 'Папки'], kg: ['А4 кагаз', 'Калемдер', 'Дептерлер', 'Скотч', 'Папкалар'] },
  textile: { ru: ['Полотенца', 'Салфетки тканевые', 'Скатерти', 'Фартуки'], kg: ['Сүлгүлөр', 'Кездеме салфеткалар', 'Дасторкон', 'Алжапкычтар'] },
  hygiene: { ru: ['Туалетная бумага', 'Подгузники', 'Прокладки', 'Влажные салфетки'], kg: ['Даараткана кагазы', 'Подгузниктер', 'Тамбалар', 'Нымдуу салфеткалар'] },
  honey: { ru: ['Мёд горный', 'Мёд цветочный', 'Джем', 'Варенье', 'Повидло'], kg: ['Тоо балы', 'Гүл балы', 'Джем', 'Варенье', 'Повидло'] },
  dried_fruits: { ru: ['Курага', 'Изюм', 'Чернослив', 'Грецкий орех', 'Миндаль', 'Фисташки'], kg: ['Кайыса кургаты', 'Мейиз', 'Кара өрүк', 'Жаңгак', 'Бадам', 'Фисташка'] },
  other: { ru: ['Салфетки', 'Пакеты', 'Прочее'], kg: ['Салфеткалар', 'Пакеттер', 'Башкалар'] },
};

// Города Кыргызстана с координатами
export const CITIES = [
  { id: 'bishkek', name: 'Бишкек', lat: 42.8746, lng: 74.5698 },
  { id: 'osh', name: 'Ош', lat: 40.5283, lng: 72.7985 },
  { id: 'jalalabad', name: 'Джалал-Абад', lat: 40.9333, lng: 73.0017 },
  { id: 'karakol', name: 'Каракол', lat: 42.4907, lng: 78.3936 },
  { id: 'tokmok', name: 'Токмок', lat: 42.7631, lng: 75.0014 },
  { id: 'naryn', name: 'Нарын', lat: 41.4287, lng: 75.9911 },
  { id: 'batken', name: 'Баткен', lat: 40.0563, lng: 70.8194 },
  { id: 'talas', name: 'Талас', lat: 42.5228, lng: 72.2426 },
  { id: 'balykchy', name: 'Балыкчы', lat: 42.4600, lng: 76.1869 },
  { id: 'kyzylkiya', name: 'Кызыл-Кия', lat: 40.2567, lng: 72.1281 },
];

// =============================================
//  ПОСТАВЩИКИ
// =============================================
export async function getSuppliers(filters = {}) {
  if (IS_DEMO) {
    let result = [...DEMO_SUPPLIERS];
    if (filters.city) result = result.filter(s => s.city === filters.city);
    if (filters.category) result = result.filter(s => s.categories?.includes(filters.category));
    return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  let q = collection(db, 'suppliers');
  const constraints = [];

  if (filters.city) constraints.push(where('city', '==', filters.city));
  if (filters.category) constraints.push(where('categories', 'array-contains', filters.category));

  q = constraints.length > 0
    ? query(q, ...constraints, orderBy('rating', 'desc'))
    : query(q, orderBy('rating', 'desc'));

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getSupplier(id) {
  if (IS_DEMO) return DEMO_SUPPLIERS.find(s => s.id === id) || null;

  const snap = await getDoc(doc(db, 'suppliers', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createSupplier(data) {
  return addDoc(collection(db, 'suppliers'), {
    ...data,
    rating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  });
}

export async function updateSupplier(id, data) {
  return updateDoc(doc(db, 'suppliers', id), data);
}

// =============================================
//  ТОВАРЫ
// =============================================
export async function getProducts(filters = {}) {
  if (IS_DEMO) {
    let result = [...DEMO_PRODUCTS];
    if (!filters.includeHidden) result = result.filter(p => !p.hidden);
    if (filters.supplierId) result = result.filter(p => p.supplierId === filters.supplierId);
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.city) result = result.filter(p => p.city === filters.city);
    return result;
  }

  let constraints = [];

  if (filters.supplierId) constraints.push(where('supplierId', '==', filters.supplierId));
  if (filters.category) constraints.push(where('category', '==', filters.category));
  if (filters.city) constraints.push(where('city', '==', filters.city));

  const q = constraints.length > 0
    ? query(collection(db, 'products'), ...constraints, orderBy('createdAt', 'desc'))
    : query(collection(db, 'products'), orderBy('createdAt', 'desc'));

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getProduct(id) {
  if (IS_DEMO) return DEMO_PRODUCTS.find(p => p.id === id) || null;

  const snap = await getDoc(doc(db, 'products', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createProduct(data) {
  return addDoc(collection(db, 'products'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateProduct(id, data) {
  return updateDoc(doc(db, 'products', id), data);
}

export async function deleteProduct(id) {
  return deleteDoc(doc(db, 'products', id));
}

// =============================================
//  ЗАКАЗЫ
// =============================================
export const ORDER_STATUSES = {
  new: { label: 'Новый', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'В работе', color: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Завершён', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменён', color: 'bg-red-100 text-red-800' },
};

export async function createOrder(data) {
  return addDoc(collection(db, 'orders'), {
    ...data,
    status: 'new',
    agentId: null,
    createdAt: serverTimestamp(),
  });
}

export async function getOrders(filters = {}) {
  let constraints = [];
  if (filters.supplierId) constraints.push(where('supplierId', '==', filters.supplierId));
  if (filters.buyerId) constraints.push(where('buyerId', '==', filters.buyerId));
  if (filters.status) constraints.push(where('status', '==', filters.status));

  const q = constraints.length > 0
    ? query(collection(db, 'orders'), ...constraints, orderBy('createdAt', 'desc'))
    : query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateOrderStatus(id, status, agentId = null) {
  const data = { status };
  if (agentId) data.agentId = agentId;
  return updateDoc(doc(db, 'orders', id), data);
}

// =============================================
//  ЗАГРУЗКА ИЗОБРАЖЕНИЙ
// =============================================
export async function uploadImage(file, path) {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}

// =============================================
//  ПОЛЬЗОВАТЕЛИ
// =============================================
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createUserProfile(uid, data) {
  const { setDoc } = await import('firebase/firestore');
  return setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function updateUserProfile(uid, data) {
  return updateDoc(doc(db, 'users', uid), data);
}

// =============================================
//  РЕЙТИНГ
// =============================================
export async function addReview(supplierId, data) {
  await addDoc(collection(db, 'suppliers', supplierId, 'reviews'), {
    ...data,
    createdAt: serverTimestamp(),
  });

  // Пересчитываем средний рейтинг
  const reviewsSnap = await getDocs(collection(db, 'suppliers', supplierId, 'reviews'));
  const reviews = reviewsSnap.docs.map(d => d.data());
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await updateDoc(doc(db, 'suppliers', supplierId), {
    rating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });
}
