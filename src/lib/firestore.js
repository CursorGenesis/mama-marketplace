import { db, storage } from './firebase';
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc,
  query, where, orderBy, limit, serverTimestamp, runTransaction
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
  // Продовольственные
  { id: 'bakery', name: 'Хлеб и выпечка', nameKg: 'Нан жана токоч', icon: '🍞' },
  { id: 'dairy', name: 'Молочные продукты', nameKg: 'Сүт азыктары', icon: '🥛' },
  { id: 'meat', name: 'Мясо и птица', nameKg: 'Эт жана канаттуу', icon: '🥩' },
  { id: 'fish', name: 'Рыба и морепродукты', nameKg: 'Балык жана деңиз азыктары', icon: '🐟' },
  { id: 'fruits', name: 'Овощи и фрукты', nameKg: 'Жашылча жана мөмө', icon: '🥦' },
  { id: 'grocery', name: 'Крупы и бакалея', nameKg: 'Жармалар жана бакалея', icon: '🌾' },
  { id: 'oils', name: 'Масло и жиры', nameKg: 'Май жана майлар', icon: '🫙' },
  { id: 'confectionery', name: 'Сладости и кондитерка', nameKg: 'Таттуулар', icon: '🍬' },
  { id: 'gum', name: 'Жвачки и леденцы', nameKg: 'Сагыз жана леденец', icon: '🫧' },
  { id: 'drinks', name: 'Напитки', nameKg: 'Суусундуктар', icon: '🥤' },
  { id: 'alcohol', name: 'Алкоголь', nameKg: 'Алкоголь', icon: '🍺' },
  { id: 'tea_coffee', name: 'Чай и кофе', nameKg: 'Чай жана кофе', icon: '☕' },
  { id: 'canned', name: 'Консервы и соленья', nameKg: 'Консерва жана туздалган', icon: '🥫' },
  { id: 'spices', name: 'Соусы, специи, приправы', nameKg: 'Соустар, даамдар', icon: '🧂' },
  { id: 'snacks', name: 'Снеки и чипсы', nameKg: 'Снектер жана чипстер', icon: '🍿' },
  { id: 'frozen', name: 'Заморозка', nameKg: 'Тоңдурулган', icon: '🧊' },
  { id: 'eggs', name: 'Яйца', nameKg: 'Жумуртка', icon: '🥚' },
  { id: 'ice_cream', name: 'Мороженое и десерты', nameKg: 'Балмуздак жана десерт', icon: '🍦' },
  { id: 'honey', name: 'Мёд и варенье', nameKg: 'Бал жана варенье', icon: '🍯' },
  { id: 'dried_fruits', name: 'Сухофрукты и орехи', nameKg: 'Кургатылган мөмө жана жаңгак', icon: '🌰' },
  { id: 'baby', name: 'Детское питание', nameKg: 'Балдар тамагы', icon: '👶' },
  // Табак
  { id: 'tobacco', name: 'Табачные изделия', nameKg: 'Тамеки буюмдары', icon: '🚬' },
  // Непродовольственные
  { id: 'household', name: 'Бытовая химия', nameKg: 'Тиричилик химиясы', icon: '🧹' },
  { id: 'hygiene', name: 'Личная гигиена', nameKg: 'Жеке гигиена', icon: '🧴' },
  { id: 'cosmetics', name: 'Косметика', nameKg: 'Косметика', icon: '💄' },
  { id: 'disposable', name: 'Одноразовая и бумажная', nameKg: 'Бир жолку жана кагаз', icon: '🧻' },
  { id: 'hardware', name: 'Хозтовары и инвентарь', nameKg: 'Чарба товарлары', icon: '🪣' },
  { id: 'kitchen', name: 'Кухонные товары', nameKg: 'Ашкана товарлары', icon: '🍽️' },
  { id: 'electric', name: 'Электротовары и батарейки', nameKg: 'Электр товарлар', icon: '💡' },
  { id: 'stationery', name: 'Канцтовары', nameKg: 'Канцтоварлар', icon: '✏️' },
  { id: 'textile', name: 'Текстиль', nameKg: 'Текстиль', icon: '🧦' },
  { id: 'pet_food', name: 'Товары для животных', nameKg: 'Жаныбарлар үчүн', icon: '🐾' },
  { id: 'toys', name: 'Игрушки и подарки', nameKg: 'Оюнчуктар жана белектер', icon: '🎁' },
  { id: 'packaging', name: 'Упаковка для торговли', nameKg: 'Соода таңгактары', icon: '📦' },
  { id: 'catering', name: 'Для кафе и ресторанов', nameKg: 'Кафе жана ресторан үчүн', icon: '🍴' },
  { id: 'other', name: 'Другое', nameKg: 'Башкалар', icon: '🏷️' },
];

// Подкатегории
export const SUBCATEGORIES = {
  bakery: { ru: ['Хлеб белый', 'Хлеб серый/ржаной', 'Лаваш', 'Лепёшки (нан)', 'Боорсоки', 'Самса', 'Булочки', 'Пирожки', 'Торты', 'Пирожные', 'Печенье', 'Вафли', 'Сушки и баранки', 'Хлебцы'], kg: ['Ак нан', 'Кара нан', 'Лаваш', 'Нан', 'Боорсоктор', 'Самса', 'Булочкалар', 'Пирожкилер', 'Торттор', 'Пирожныйлер', 'Бисквиттер', 'Вафлилер', 'Сушки жана баранкалар', 'Нан тилкелери'] },
  dairy: { ru: ['Молоко', 'Кефир', 'Ряженка', 'Сметана', 'Творог', 'Йогурт', 'Масло сливочное', 'Сыр твёрдый', 'Сыр плавленый', 'Айран', 'Кумыс', 'Чалап', 'Курут', 'Сгущёнка', 'Сливки', 'Мороженое'], kg: ['Сүт', 'Кефир', 'Ряженка', 'Каймак', 'Творог', 'Йогурт', 'Сары май', 'Катуу быштак', 'Эриген быштак', 'Айран', 'Кымыз', 'Чалап', 'Курут', 'Конденсацияланган сүт', 'Каймак суусу', 'Балмуздак'] },
  meat: { ru: ['Говядина', 'Баранина', 'Конина', 'Курица', 'Куриные части', 'Субпродукты', 'Фарш', 'Колбаса варёная', 'Колбаса копчёная', 'Сосиски', 'Казы', 'Карта', 'Чучук'], kg: ['Уй эти', 'Кой эти', 'Жылкы эти', 'Тоок', 'Тоок бөлүктөрү', 'Ички органдар', 'Фарш', 'Бышырылган колбаса', 'Ысталган колбаса', 'Сосискалар', 'Казы', 'Карта', 'Чучук'] },
  fish: { ru: ['Рыба свежая', 'Рыба замороженная', 'Рыба солёная/копчёная', 'Сельдь', 'Консервы рыбные', 'Шпроты', 'Икра', 'Минтай', 'Скумбрия', 'Сушёная рыба'], kg: ['Жаңы балык', 'Тоңдурулган балык', 'Туздалган/ысталган балык', 'Силдер', 'Балык консервасы', 'Шпрот', 'Икра', 'Минтай', 'Скумбрия', 'Кургатылган балык'] },
  fruits: { ru: ['Картофель', 'Морковь', 'Лук', 'Чеснок', 'Капуста', 'Огурцы', 'Помидоры', 'Перец болгарский', 'Баклажаны', 'Зелень', 'Яблоки', 'Груши', 'Виноград', 'Бананы', 'Цитрусовые', 'Арбузы/дыни', 'Абрикосы', 'Клубника', 'Грибы'], kg: ['Картошка', 'Сабиз', 'Пияз', 'Сарымсак', 'Капуста', 'Кыяр', 'Помидор', 'Болгар калемпири', 'Баклажан', 'Жашылчалар', 'Алма', 'Груша', 'Жүзүм', 'Банан', 'Цитрустуулар', 'Карбыз/коон', 'Өрүк', 'Кулпунай', 'Козу карын'] },
  grocery: { ru: ['Мука в/с', 'Мука 1 сорт', 'Рис', 'Гречка', 'Пшено', 'Овсянка', 'Перловка', 'Макароны', 'Вермишель', 'Лапша б/п', 'Сахар', 'Соль', 'Горох', 'Фасоль', 'Нут', 'Маш', 'Чечевица', 'Крахмал', 'Манка'], kg: ['Жогорку сорт ун', '1-сорт ун', 'Күрүч', 'Гречка', 'Тары', 'Сулу', 'Арпа', 'Макарон', 'Вермишель', 'Тез бышчу лапша', 'Кант', 'Туз', 'Горох', 'Бурчак', 'Нут', 'Маш', 'Мерчимек', 'Крахмал', 'Манная'] },
  oils: { ru: ['Масло подсолнечное', 'Масло оливковое', 'Масло хлопковое', 'Масло кукурузное', 'Маргарин', 'Курдючный жир', 'Масло льняное', 'Спред'], kg: ['Күн карама майы', 'Зайтун майы', 'Пахта майы', 'Жүгөрү майы', 'Маргарин', 'Куйрук майы', 'Зыгыр майы', 'Спред'] },
  confectionery: { ru: ['Конфеты шоколадные', 'Карамель', 'Шоколад', 'Мармелад', 'Зефир', 'Халва', 'Пахлава', 'Ирис', 'Пастила', 'Драже', 'Шоколадная паста', 'Вафли', 'Нуга', 'Козинаки'], kg: ['Шоколад конфеталар', 'Карамель', 'Шоколад', 'Мармелад', 'Зефир', 'Алва', 'Пахлава', 'Ирис', 'Пастила', 'Драже', 'Шоколад пастасы', 'Вафлилер', 'Нуга', 'Козинаки'] },
  gum: { ru: ['Жвачка мятная', 'Жвачка фруктовая', 'Жвачка без сахара', 'Чупа-чупс', 'Маршмеллоу', 'Леденцы', 'Леденцы на палочке', 'Жевательные конфеты', 'Мятные пастилки', 'Освежающие драже'], kg: ['Жалбыз сагыз', 'Мөмөлүү сагыз', 'Кантсыз сагыз', 'Чупа-чупс', 'Маршмеллоу', 'Леденецтер', 'Таякчалуу леденец', 'Чайнар конфеталар', 'Жалбыз пастилкалары', 'Жаңыртуучу драже'] },
  drinks: { ru: ['Вода негазированная', 'Вода газированная', 'Газировка (Cola, Fanta)', 'Соки', 'Нектары', 'Компот', 'Морс', 'Квас', 'Максым', 'Боза', 'Жарма', 'Энергетики', 'Лимонад', 'Холодный чай', 'Молочные коктейли'], kg: ['Газсыз суу', 'Газдалган суу', 'Газдалган суусундуктар', 'Ширелер', 'Нектарлар', 'Компот', 'Морс', 'Квас', 'Максым', 'Боза', 'Жарма', 'Энергетикалар', 'Лимонад', 'Муздак чай', 'Сүт коктейлдери'] },
  alcohol: { ru: ['Пиво бутылочное', 'Пиво разливное', 'Вино', 'Шампанское', 'Водка', 'Коньяк', 'Виски', 'Слабоалкогольные', 'Арак'], kg: ['Бөтөлкөдөгү пиво', 'Чоңкурдан пиво', 'Шарап', 'Шампан', 'Арак (водка)', 'Коньяк', 'Виски', 'Алсыз алкоголь', 'Боз арак'] },
  tea_coffee: { ru: ['Чай чёрный листовой', 'Чай пакетированный', 'Чай зелёный', 'Чай травяной', 'Кофе молотый', 'Кофе в зёрнах', 'Кофе растворимый', 'Кофе 3-в-1', 'Какао', 'Цикорий'], kg: ['Жалбырактуу кара чай', 'Баштыкчалуу чай', 'Жашыл чай', 'Чөп чайы', 'Тартылган кофе', 'Дандагы кофе', 'Эрий турган кофе', '3-де-1 кофе', 'Какао', 'Цикорий'] },
  canned: { ru: ['Тушёнка', 'Рыбные консервы', 'Паштеты', 'Горошек', 'Кукуруза', 'Фасоль', 'Огурцы солёные', 'Помидоры маринованные', 'Оливки', 'Грибы маринованные', 'Лечо', 'Аджика', 'Томатная паста'], kg: ['Тушёнка', 'Балык консервасы', 'Паштеттер', 'Жашыл буурчак', 'Жүгөрү', 'Бурчак', 'Туздалган кыяр', 'Маринаддалган помидор', 'Зейтун', 'Маринаддалган козу карын', 'Лечо', 'Аджика', 'Помидор пастасы'] },
  spices: { ru: ['Соль', 'Перец чёрный', 'Перец красный', 'Зира', 'Куркума', 'Корица', 'Лавровый лист', 'Уксус', 'Горчица', 'Майонез', 'Кетчуп', 'Соевый соус', 'Приправа для плова', 'Дрожжи', 'Разрыхлитель', 'Ванилин'], kg: ['Туз', 'Кара калемпир', 'Кызыл калемпир', 'Зире', 'Куркума', 'Дарчын', 'Дарак жалбырагы', 'Сирке', 'Горчица', 'Майонез', 'Кетчуп', 'Соя соусу', 'Палоо татымы', 'Ачытка', 'Бажы порошок', 'Ванилин'] },
  snacks: { ru: ['Чипсы', 'Сухарики', 'Попкорн', 'Орешки солёные', 'Семечки', 'Кукуруза жареная', 'Нут жареный', 'Рыбные снеки', 'Крекеры'], kg: ['Чипсы', 'Сухарикилер', 'Попкорн', 'Туздалган жаңгактар', 'Кууруган үрөн', 'Кууруган жүгөрү', 'Кууруган нут', 'Балык снектери', 'Крекерлер'] },
  frozen: { ru: ['Пельмени', 'Манты', 'Хинкали', 'Вареники', 'Самса замороженная', 'Котлеты/наггетсы', 'Овощные смеси', 'Ягоды замороженные', 'Тесто замороженное', 'Пицца замороженная'], kg: ['Пельмени', 'Манты', 'Хинкали', 'Вареники', 'Тоңдурулган самса', 'Котлет/наггетс', 'Жашылча аралашмалары', 'Тоңдурулган жидектер', 'Тоңдурулган камыр', 'Тоңдурулган пицца'] },
  eggs: { ru: ['Яйца куриные С0', 'Яйца куриные С1', 'Яйца куриные С2', 'Яйца перепелиные'], kg: ['Тоок жумуртка С0', 'Тоок жумуртка С1', 'Тоок жумуртка С2', 'Бөдөнө жумуртка'] },
  ice_cream: { ru: ['Мороженое в стаканчике', 'Мороженое на палочке', 'Мороженое в рожке', 'Фруктовый лёд', 'Торт-мороженое', 'Желе', 'Пудинг'], kg: ['Стакандагы балмуздак', 'Таякчалуу балмуздак', 'Мүйүздөгү балмуздак', 'Мөмөлүү муз', 'Балмуздактуу торт', 'Желе', 'Пуддинг'] },
  honey: { ru: ['Мёд горный', 'Мёд цветочный', 'Джем', 'Варенье', 'Повидло', 'Сироп'], kg: ['Тоо балы', 'Гүл балы', 'Джем', 'Варенье', 'Повидло', 'Сироп'] },
  dried_fruits: { ru: ['Курага', 'Изюм', 'Чернослив', 'Инжир', 'Грецкий орех', 'Арахис', 'Миндаль', 'Фисташки', 'Кешью', 'Семечки тыквенные'], kg: ['Кайыса кургаты', 'Мейиз', 'Кара өрүк', 'Инжир', 'Жаңгак', 'Арахис', 'Бадам', 'Фисташка', 'Кешью', 'Ашкабак үрөнү'] },
  baby: { ru: ['Смеси молочные', 'Каши детские', 'Пюре овощные', 'Пюре фруктовые', 'Соки детские', 'Печенье детское', 'Вода детская'], kg: ['Сүт аралашмалары', 'Балдар боткалары', 'Жашылча пюреси', 'Мөмө пюреси', 'Балдар ширеси', 'Балдар бисквити', 'Балдар суусу'] },
  tobacco: { ru: ['Сигареты пачка', 'Сигареты блок', 'Табак для кальяна', 'Насвай', 'Снюс', 'Электронные сигареты', 'Жидкости для вейпа', 'Зажигалки', 'Спички'], kg: ['Темеки (пачка)', 'Темеки (блок)', 'Кальян темекиси', 'Насвай', 'Снюс', 'Электрондук темеки', 'Вейп суюктугу', 'Отко', 'Шыбыртмак'] },
  household: { ru: ['Стиральный порошок', 'Жидкое средство для стирки', 'Средство для посуды', 'Средство для пола', 'Чистящее для туалета', 'Средство для стёкол', 'Отбеливатель', 'Освежитель воздуха', 'Средство от тараканов', 'Средство от грызунов'], kg: ['Кир жуугуч порошок', 'Суюк кир жуугуч', 'Идиш жуугуч', 'Жер жуугуч', 'Туалет тазалоочу', 'Айнек тазалоочу', 'Агарткыч', 'Аба жаңыртуучу', 'Таракан каршы', 'Чычкан каршы'] },
  hygiene: { ru: ['Шампунь', 'Гель для душа', 'Мыло туалетное', 'Мыло хозяйственное', 'Зубная паста', 'Зубные щётки', 'Дезодорант', 'Прокладки', 'Подгузники', 'Влажные салфетки', 'Ватные диски', 'Туалетная бумага', 'Бумажные полотенца', 'Бритвенные станки'], kg: ['Шампунь', 'Душ гели', 'Туалет сабыны', 'Чарчы сабын', 'Тиш пастасы', 'Тиш щёткасы', 'Дезодорант', 'Прокладкалар', 'Памперс', 'Нымдуу салфеткалар', 'Пахта дискилери', 'Туалет кагазы', 'Кагаз сүлгүлөр', 'Устара'] },
  cosmetics: { ru: ['Помада', 'Тушь', 'Тени', 'Тональный крем', 'Лак для ногтей', 'Крем для рук', 'Крем для лица', 'Краска для волос', 'Парфюм масляный', 'Средство для укладки'], kg: ['Эрин помада', 'Кирпик каралдысы', 'Көз көлөкөсү', 'Тон крем', 'Тырмак лагы', 'Кол кремы', 'Жүз кремы', 'Чач боёгу', 'Май атыр', 'Чач жасоо каражаты'] },
  disposable: { ru: ['Стаканы', 'Тарелки', 'Вилки/ложки/ножи', 'Контейнеры', 'Пакеты фасовочные', 'Пакеты мусорные', 'Пищевая плёнка', 'Фольга', 'Бумага для выпечки', 'Зубочистки', 'Трубочки', 'Перчатки одноразовые', 'Салфетки бумажные'], kg: ['Стакандар', 'Табактар', 'Вилка/кашык/бычак', 'Контейнерлер', 'Таңгактоо баштыктары', 'Таштанды баштыктары', 'Тамак плёнкасы', 'Фольга', 'Бышыруу кагазы', 'Тиш таякчасы', 'Түтүкчөлөр', 'Бир жолку колчоптор', 'Кагаз салфеткалар'] },
  hardware: { ru: ['Вёдра', 'Тазы', 'Швабры', 'Тряпки', 'Губки', 'Щётки', 'Метлы и совки', 'Верёвки', 'Прищепки', 'Перчатки резиновые', 'Мусорные вёдра', 'Сушилки для посуды'], kg: ['Челектер', 'Жаактар', 'Швабралар', 'Чүпүрөктөр', 'Губкалар', 'Щёткалар', 'Шымтооч жана совок', 'Жиптер', 'Кысмактар', 'Резина колчоп', 'Таштанды челеги', 'Идиш кургаткыч'] },
  kitchen: { ru: ['Кастрюли', 'Сковороды', 'Казан', 'Тарелки', 'Кружки', 'Столовые приборы', 'Разделочные доски', 'Ножи кухонные', 'Тёрки', 'Термосы', 'Контейнеры для хранения', 'Чайники'], kg: ['Кастрюлялар', 'Сковорода', 'Казан', 'Табактар', 'Кружкалар', 'Кашык/вилка', 'Кесүү тактасы', 'Ашкана бычактары', 'Сүрткүчтөр', 'Термостор', 'Сактоо контейнерлери', 'Чайнектер'] },
  electric: { ru: ['Лампочки LED', 'Лампочки накаливания', 'Батарейки AA/AAA', 'Батарейки C/D', 'Удлинители', 'Изолента', 'Кабели USB', 'Зарядные устройства', 'Фонарики', 'Ночники'], kg: ['LED чырактар', 'Кадимки чырактар', 'AA/AAA батарейкалар', 'C/D батарейкалар', 'Удлинителдер', 'Изолента', 'USB кабелдер', 'Зарядтагычтар', 'Фонарикилер', 'Түнкү чырактар'] },
  stationery: { ru: ['Ручки', 'Карандаши', 'Тетради', 'Блокноты', 'Бумага А4', 'Папки', 'Скотч', 'Клей', 'Ножницы', 'Маркеры', 'Ценники', 'Кассовая лента', 'Этикетки'], kg: ['Калемдер', 'Карандаштар', 'Дептерлер', 'Блокноттор', 'А4 кагаз', 'Папкалар', 'Скотч', 'Желим', 'Кайчылар', 'Маркерлер', 'Баа этикеткалары', 'Кассалык лента', 'Этикеткалар'] },
  textile: { ru: ['Носки мужские', 'Носки женские', 'Носки детские', 'Колготки', 'Нижнее бельё', 'Полотенца', 'Простыни', 'Платки', 'Перчатки рабочие'], kg: ['Эркек байпак', 'Аял байпак', 'Бала байпак', 'Колготка', 'Ич кийим', 'Сүлгүлөр', 'Жаздыктын каптары', 'Платок', 'Жумушчу колчоп'] },
  pet_food: { ru: ['Корм для кошек сухой', 'Корм для кошек влажный', 'Корм для собак сухой', 'Корм для собак влажный', 'Лакомства для животных', 'Наполнитель для туалета', 'Поводки и ошейники', 'Игрушки для животных'], kg: ['Мышык куруку тамагы', 'Мышык нымдуу тамагы', 'Ит куруку тамагы', 'Ит нымдуу тамагы', 'Жаныбарлар таттуулары', 'Туалет толтургучу', 'Жетектер жана моюнтумшук', 'Жаныбар оюнчуктары'] },
  toys: { ru: ['Игрушки мягкие', 'Игрушки пластиковые', 'Куклы', 'Машинки', 'Настольные игры', 'Воздушные шары', 'Открытки', 'Подарочные пакеты', 'Свечи праздничные', 'Украшения для праздника'], kg: ['Жумшак оюнчуктар', 'Пластик оюнчуктар', 'Куурчактар', 'Унаачалар', 'Стол оюндары', 'Аба шарлары', 'Открыткалар', 'Белек баштыктары', 'Майрам шамдары', 'Майрам жасалгалары'] },
  packaging: { ru: ['Пакеты-майка', 'Пакеты фасовочные', 'Пакеты крафт', 'Коробки картонные', 'Стрейч-плёнка', 'Скотч упаковочный', 'Ценники', 'Этикетки', 'Термоусадочная плёнка'], kg: ['Майка баштыктар', 'Таңгактоо баштыктары', 'Крафт баштыктар', 'Картон кутулар', 'Стрейч плёнка', 'Таңгактоо скотчу', 'Баа этикеткалары', 'Этикеткалар', 'Термоусадочная плёнка'] },
  catering: { ru: ['Сиропы для кофе (ваниль, карамель, лесной орех)', 'Сиропы фруктовые (роза, мята, облепиха)', 'Топпинги (шоколад, карамель)', 'Стаканы для кофе бумажные', 'Крышки для стаканов', 'Размешиватели деревянные', 'Сахар в стиках', 'Сливки порционные', 'Чай в пакетиках (HoReCa)', 'Кофе в зёрнах (HoReCa)', 'Упаковка для доставки', 'Контейнеры для супа', 'Контейнеры для салатов', 'Пакеты для выпечки', 'Бумага обёрточная', 'Фартуки поварские', 'Шапочки для повара', 'Перчатки кухонные', 'Подносы', 'Диспенсеры для соусов', 'Салфетницы', 'Меловые доски для меню', 'Зубочистки в упаковке', 'Влажные полотенца для рук', 'Коктейльные трубочки'], kg: ['Кофе сироптору (ваниль, карамель)', 'Мөмө сироптору (роза, мята)', 'Топпингдер (шоколад, карамель)', 'Кагаз кофе стакандары', 'Стакан капкактары', 'Жыгач аралаштыргычтар', 'Стиктердеги кант', 'Порциялуу каймак', 'HoReCa чай баштыктары', 'HoReCa кофе дандары', 'Жеткирүү таңгагы', 'Суп контейнерлери', 'Салат контейнерлери', 'Бышыруу баштыктары', 'Ороо кагазы', 'Ашпоз алжапкычтары', 'Ашпоз баш кийими', 'Ашкана колчоптору', 'Подностор', 'Соус диспенсерлери', 'Салфетницалар', 'Меню бор тактасы', 'Таңгактагы тиш таякча', 'Кол аарчыгыч', 'Коктейль түтүкчөлөрү'] },
  other: { ru: ['Салфетки', 'Пакеты', 'Прочее'], kg: ['Салфеткалар', 'Пакеттер', 'Башкалар'] },
};

// Города Кыргызстана с координатами
export const CITIES = [
  { id: 'aydarken', name: 'Айдаркен', lat: 39.9500, lng: 71.3400 },
  { id: 'at_bashy', name: 'Ат-Башы', lat: 41.1700, lng: 75.7900 },
  { id: 'balykchy', name: 'Балыкчы', lat: 42.4600, lng: 76.1869 },
  { id: 'batken', name: 'Баткен', lat: 40.0563, lng: 70.8194 },
  { id: 'bishkek', name: 'Бишкек', lat: 42.8746, lng: 74.5698 },
  { id: 'jalalabad', name: 'Манас', lat: 40.9333, lng: 73.0017 },
  { id: 'isfana', name: 'Исфана', lat: 39.8400, lng: 69.5300 },
  { id: 'kazarman', name: 'Казарман', lat: 41.4000, lng: 74.0200 },
  { id: 'kant', name: 'Кант', lat: 42.8900, lng: 74.8500 },
  { id: 'karabalta', name: 'Кара-Балта', lat: 42.8142, lng: 73.8489 },
  { id: 'kara_kul', name: 'Кара-Куль', lat: 41.6200, lng: 72.7100 },
  { id: 'karasu', name: 'Кара-Суу', lat: 40.7100, lng: 72.8600 },
  { id: 'karakol', name: 'Каракол', lat: 42.4907, lng: 78.3936 },
  { id: 'kemin', name: 'Кемин', lat: 42.7800, lng: 75.6900 },
  { id: 'kerben', name: 'Кербен', lat: 41.4900, lng: 71.7500 },
  { id: 'kochkor', name: 'Кочкор', lat: 42.2200, lng: 75.7500 },
  { id: 'kyzylkiya', name: 'Кызыл-Кия', lat: 40.2567, lng: 72.1281 },
  { id: 'kyzyl_suu', name: 'Кызыл-Суу', lat: 42.3400, lng: 78.0100 },
  { id: 'mailuu_suu', name: 'Майлуу-Суу', lat: 41.2700, lng: 72.4500 },
  { id: 'naryn', name: 'Нарын', lat: 41.4287, lng: 75.9911 },
  { id: 'nookat', name: 'Ноокат', lat: 40.2600, lng: 72.6200 },
  { id: 'osh', name: 'Ош', lat: 40.5283, lng: 72.7985 },
  { id: 'suluktu', name: 'Сулюкта', lat: 39.9400, lng: 69.5700 },
  { id: 'talas', name: 'Талас', lat: 42.5228, lng: 72.2426 },
  { id: 'tash_kumyr', name: 'Таш-Кумыр', lat: 41.3500, lng: 72.2200 },
  { id: 'tokmok', name: 'Токмок', lat: 42.7631, lng: 75.0014 },
  { id: 'uzgen', name: 'Узген', lat: 40.7700, lng: 73.3000 },
  { id: 'cholpon_ata', name: 'Чолпон-Ата', lat: 42.6500, lng: 77.0800 },
  { id: 'shopokov', name: 'Шопоков', lat: 42.8300, lng: 74.1200 },
];

// =============================================
//  ПОСТАВЩИКИ
// =============================================
// Поставщик доставляет в город, если:
// - в deliverySchedule[city] есть хотя бы один день, ИЛИ
// - расписания нет вовсе (backwards compat) — считаем, что работает только в своём city
const deliversTo = (supplier, city) => {
  const schedule = supplier?.deliverySchedule;
  if (schedule && Object.keys(schedule).length > 0) {
    return (schedule[city]?.length || 0) > 0;
  }
  return supplier?.city === city;
};

export async function getSuppliers(filters = {}) {
  if (IS_DEMO) {
    let result = [...DEMO_SUPPLIERS];
    if (filters.city) result = result.filter(s => deliversTo(s, filters.city));
    if (filters.category) result = result.filter(s => s.categories?.includes(filters.category));
    return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  try {
    const checkQ = query(collection(db, 'suppliers'), limit(1));
    const checkSnap = await getDocs(checkQ);

    if (checkSnap.docs.length > 0) {
      let q = collection(db, 'suppliers');
      const constraints = [];
      if (filters.category) constraints.push(where('categories', 'array-contains', filters.category));

      q = constraints.length > 0
        ? query(q, ...constraints, orderBy('rating', 'desc'))
        : query(q, orderBy('rating', 'desc'));

      const snap = await getDocs(q);
      let result = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filters.city) result = result.filter(s => deliversTo(s, filters.city));
      return result;
    }
  } catch (e) {
    console.log('Firebase suppliers fallback to demo:', e.message);
  }

  let result = [...DEMO_SUPPLIERS];
  if (filters.city) result = result.filter(s => deliversTo(s, filters.city));
  if (filters.category) result = result.filter(s => s.categories?.includes(filters.category));
  return result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
}

export async function getSupplier(id) {
  if (IS_DEMO) return DEMO_SUPPLIERS.find(s => s.id === id) || null;

  try {
    const snap = await getDoc(doc(db, 'suppliers', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (e) {
    console.log('Firebase getSupplier fallback to demo:', e.message);
  }
  return DEMO_SUPPLIERS.find(s => s.id === id) || null;
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
//  БАЛАНС ПОСТАВЩИКА
// =============================================
export async function getSupplierBalance(supplierId) {
  const docRef = doc(db, 'suppliers', supplierId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return { balance: 0, deposit: 0 };
  const data = snap.data();
  return {
    balance: data.balance || 0,
    deposit: data.deposit || 0,
    blocked: data.blocked || false,
  };
}

export async function addToBalance(supplierId, amount, description, type = 'deposit') {
  const docRef = doc(db, 'suppliers', supplierId);

  const newBalance = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(docRef);
    const currentBalance = snap.exists() ? (snap.data().balance || 0) : 0;
    const updated = currentBalance + amount;

    transaction.update(docRef, {
      balance: updated,
      blocked: updated > 0 ? false : snap.data()?.blocked || false,
    });

    return updated;
  });

  // Запись транзакции в историю (вне основной транзакции — не критично)
  await addDoc(collection(db, 'suppliers', supplierId, 'transactions'), {
    amount,
    balance: newBalance,
    description,
    type,
    createdAt: serverTimestamp(),
  });

  return newBalance;
}

export async function deductFromBalance(supplierId, amount, description, type = 'commission') {
  const docRef = doc(db, 'suppliers', supplierId);

  const newBalance = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(docRef);
    if (!snap.exists()) throw new Error('Supplier not found');

    const currentBalance = snap.data().balance || 0;
    const updated = currentBalance - amount;

    const updateData = { balance: updated };
    if (updated <= 0) updateData.blocked = true;

    transaction.update(docRef, updateData);

    return updated;
  });

  // Запись транзакции в историю
  await addDoc(collection(db, 'suppliers', supplierId, 'transactions'), {
    amount: -amount,
    balance: newBalance,
    description,
    type,
    createdAt: serverTimestamp(),
  });

  return newBalance;
}

export async function getTransactions(supplierId) {
  const q = query(
    collection(db, 'suppliers', supplierId, 'transactions'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    if (filters.city) {
      const allowedIds = new Set(DEMO_SUPPLIERS.filter(s => deliversTo(s, filters.city)).map(s => s.id));
      result = result.filter(p => allowedIds.has(p.supplierId));
    }
    return result;
  }

  try {
    // Сначала проверяем есть ли вообще товары в Firebase
    const checkQ = query(collection(db, 'products'), limit(1));
    const checkSnap = await getDocs(checkQ);

    if (checkSnap.docs.length > 0) {
      // Фильтры по supplier/category — через Firestore; city — после получения по deliverySchedule поставщика
      let constraints = [];
      if (filters.supplierId) constraints.push(where('supplierId', '==', filters.supplierId));
      if (filters.category) constraints.push(where('category', '==', filters.category));

      const q = constraints.length > 0
        ? query(collection(db, 'products'), ...constraints, orderBy('createdAt', 'desc'))
        : query(collection(db, 'products'), orderBy('createdAt', 'desc'));

      const snap = await getDocs(q);
      let result = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (filters.city) {
        const allowedIds = new Set((await getSuppliers({ city: filters.city })).map(s => s.id));
        result = result.filter(p => allowedIds.has(p.supplierId));
      }
      return result;
    }
  } catch (e) {
    console.log('Firebase products fallback to demo:', e.message);
  }

  // Фоллбэк на демо-данные
  let result = [...DEMO_PRODUCTS];
  if (!filters.includeHidden) result = result.filter(p => !p.hidden);
  if (filters.supplierId) result = result.filter(p => p.supplierId === filters.supplierId);
  if (filters.category) result = result.filter(p => p.category === filters.category);
  if (filters.city) {
    const allowedIds = new Set(DEMO_SUPPLIERS.filter(s => deliversTo(s, filters.city)).map(s => s.id));
    result = result.filter(p => allowedIds.has(p.supplierId));
  }
  return result;
}

export async function getProduct(id) {
  if (IS_DEMO) return DEMO_PRODUCTS.find(p => p.id === id) || null;

  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (e) {
    console.log('Firebase getProduct fallback to demo:', e.message);
  }
  // Фоллбэк на демо
  return DEMO_PRODUCTS.find(p => p.id === id) || null;
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
//  АКЦИИ ПОСТАВЩИКОВ
// =============================================
export async function createPromotion(data) {
  return addDoc(collection(db, 'promotions'), {
    ...data,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function getPromotions(filters = {}) {
  try {
    let constraints = [where('active', '==', true)];
    if (filters.supplierId) constraints.push(where('supplierId', '==', filters.supplierId));

    const q = query(collection(db, 'promotions'), ...constraints, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const now = new Date();
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => !p.endDate || new Date(p.endDate) >= now);
  } catch (e) {
    console.log('Firebase promotions error:', e.message);
    return [];
  }
}

export async function updatePromotion(id, data) {
  return updateDoc(doc(db, 'promotions', id), data);
}

export async function deletePromotion(id) {
  return deleteDoc(doc(db, 'promotions', id));
}

// =============================================
//  ЗАКАЗЫ
// =============================================
export const ORDER_STATUSES = {
  new: { label: 'Новый', labelKg: 'Жаңы', color: 'bg-red-100 text-red-800' },
  packed: { label: 'Собран', labelKg: 'Чогултулду', color: 'bg-yellow-100 text-yellow-800' },
  delivering: { label: 'В доставке', labelKg: 'Жеткирүүдө', color: 'bg-blue-100 text-blue-800' },
  received: { label: 'Получено', labelKg: 'Алынды', color: 'bg-green-100 text-green-800' },
  not_received: { label: 'Не получено', labelKg: 'Алынган жок', color: 'bg-gray-100 text-gray-800' },
  cancelled: { label: 'Отменён', labelKg: 'Жокко чыгарылды', color: 'bg-red-100 text-red-800' },
};

export async function createOrder(data) {
  // Сначала проверяем поставщика и считаем комиссию
  let commission = 0;
  let commissionRate = 0.05;
  let supplierChatId = null;
  let supplierExists = false;

  if (data.supplierId && data.totalPrice) {
    try {
      const supplierDoc = await getDoc(doc(db, 'suppliers', data.supplierId));
      if (supplierDoc.exists()) {
        supplierExists = true;
        commissionRate = supplierDoc.data().commissionRate || 0.05;
        supplierChatId = supplierDoc.data().telegramChatId || null;
      }
      commission = Math.ceil(data.totalPrice * commissionRate);
    } catch (e) {
      console.error('Error reading supplier:', e);
    }
  }

  // Подготавливаем данные (убираем undefined и конвертируем массивы)
  const orderData = {
    orderNumber: data.orderNumber || '',
    buyerId: data.buyerId || null,
    buyerName: data.buyerName || '',
    buyerPhone: data.buyerPhone || '',
    shopName: data.shopName || '',
    address: data.address || '',
    comment: data.comment || '',
    supplierId: data.supplierId || '',
    supplierName: data.supplierName || '',
    items: data.items || [],
    totalPrice: data.totalPrice || 0,
    total: data.totalPrice || data.total || 0,
    agentRef: data.agentRef || null,
    status: 'new',
    commission,
    commissionRate,
    createdAt: serverTimestamp(),
  };

  // Сохраняем координаты как объект (не массив)
  if (data.deliveryMarker && Array.isArray(data.deliveryMarker)) {
    orderData.deliveryLat = data.deliveryMarker[0];
    orderData.deliveryLng = data.deliveryMarker[1];
  }

  // Создаём заказ
  const orderRef = await addDoc(collection(db, 'orders'), orderData);

  // Списываем комиссию только если поставщик существует в Firebase
  if (supplierExists && data.supplierId && commission > 0) {
    try {
      await deductFromBalance(
        data.supplierId,
        commission,
        `Комиссия ${(commissionRate * 100).toFixed(0)}% с заказа #${orderRef.id.slice(0, 6)} (${data.shopName || ''})`,
        'commission'
      );
    } catch (e) {
      // Если списание не удалось — обновляем заказ с пометкой
      console.error('Commission deduction error:', e);
      await updateDoc(doc(db, 'orders', orderRef.id), {
        commissionError: true,
        commissionErrorMessage: e.message,
      });
    }
  }

  // Монетки клиенту и комиссия агенту НЕ начисляются при создании заказа.
  // Они начисляются только после подтверждения получения заказа (status='received')
  // в функции updateOrderStatus — чтобы не платить за отменённые заказы.
  // Реальная сумма монеток и комиссии агента рассчитывается там же на основе order.totalPrice.

  return { orderRef, supplierChatId };
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
  // Читаем заказ ДО смены статуса — чтобы все начисления/откаты прошли на правильных данных
  const orderSnap = await getDoc(doc(db, 'orders', id));
  if (!orderSnap.exists()) {
    throw new Error('Order not found');
  }
  const order = orderSnap.data();
  const totalPrice = Number(order.totalPrice || order.total || 0);

  // =============================================
  // НАЧИСЛЕНИЯ при подтверждении получения
  // =============================================
  if (status === 'received' && !order.coinsAwarded && totalPrice > 0) {
    // Монетки клиенту — начисляются ТОЛЬКО после подтверждения получения
    if (order.buyerId) {
      try {
        const coins = Math.floor(totalPrice / 500);
        if (coins > 0) {
          const buyerRef = doc(db, 'users', order.buyerId);
          await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(buyerRef);
            if (!snap.exists()) return;
            const currentCoins = snap.data().coins || 0;
            const totalOrders = snap.data().totalOrders || 0;
            const newCoins = currentCoins + coins;
            const coinStatus = newCoins >= 150 ? 'gold' : newCoins >= 50 ? 'silver' : 'bronze';
            transaction.update(buyerRef, {
              coins: newCoins,
              coinStatus,
              totalOrders: totalOrders + 1,
            });
          });
        }
      } catch (e) {
        console.warn('Coins award failed:', e.code || e.message);
      }
    }
    // Комиссия агента начисляется админским batch-процессом (см. project_pending_bugfixes.md пакет D).
    // Здесь только помечаем что заказ требует начисления.
  }

  // =============================================
  // ОТКАТ при отказе (not_received)
  // Важно: сначала делаем возвраты, потом меняем статус, чтобы при сбое статус НЕ изменился
  // =============================================
  if (status === 'not_received') {
    // 1. Возврат комиссии поставщику — используем commission из заказа (а не пересчёт!)
    if (order.supplierId && order.commission && order.commission > 0) {
      try {
        await addToBalance(
          order.supplierId,
          order.commission,
          `Возврат комиссии за отменённый заказ #${id.slice(0, 6)}`,
          'refund'
        );
      } catch (e) {
        console.warn('Supplier refund failed:', e.code || e.message);
        throw new Error('Не удалось вернуть комиссию поставщику — статус не изменён');
      }
    }

    // 2. Откат монеток клиента — только если они были начислены (coinsAwarded)
    if (order.buyerId && order.coinsAwarded) {
      try {
        const coins = Math.floor(totalPrice / 500);
        if (coins > 0) {
          const buyerRef = doc(db, 'users', order.buyerId);
          await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(buyerRef);
            if (!snap.exists()) return;
            const currentCoins = snap.data().coins || 0;
            const newCoins = Math.max(0, currentCoins - coins);
            const coinStatus = newCoins >= 150 ? 'gold' : newCoins >= 50 ? 'silver' : 'bronze';
            transaction.update(buyerRef, { coins: newCoins, coinStatus });
          });
        }
      } catch (e) {
        console.warn('Coins refund failed:', e.code || e.message);
      }
    }
    // Откат комиссии агенту делается админским batch-процессом (см. пакет D).
  }

  // =============================================
  // Смена статуса — ТОЛЬКО если все финансовые операции прошли
  // =============================================
  const updateData = { status };
  if (agentId) updateData.agentId = agentId;
  if (status === 'received') updateData.coinsAwarded = true;
  if (status === 'not_received') {
    updateData.refunded = true;
    updateData.refundedAt = new Date();
  }
  await updateDoc(doc(db, 'orders', id), updateData);
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
