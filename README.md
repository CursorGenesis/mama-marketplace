# MarketKG — B2B маркетплейс поставщиков Кыргызстана

## Что это

Полноценный маркетплейс для поставщиков продуктов питания B2B.
Ориентирован на Кыргызстан (Бишкек, Ош, Джалал-Абад и все регионы).

## Технологии

- **Frontend:** Next.js 14 (App Router) + React
- **UI:** Tailwind CSS
- **Backend:** Firebase (Firestore + Authentication + Storage)
- **Карта:** Leaflet (OpenStreetMap)
- **Иконки:** Lucide React

## Функционал

### Для всех (без регистрации):
- Просмотр каталога товаров и поставщиков
- Поиск по товарам и поставщикам
- Фильтры: город, категория, цена
- Сортировка: по цене, по новизне, по названию
- Карта поставщиков Кыргызстана
- Страница поставщика с контактами и товарами

### Для покупателей (после регистрации):
- Корзина (добавление товаров, подсчёт суммы)
- Оформление заявки (через систему или WhatsApp)
- Оставление отзывов и рейтингов

### Для поставщиков:
- Личный кабинет
- Добавление / редактирование / удаление товаров
- Загрузка фото товаров
- Просмотр заказов и управление статусами
- Связь с покупателями через WhatsApp / Telegram

### Админ-панель (CRM):
- Статистика: поставщики, товары, заказы
- Управление поставщиками (CRUD)
- Просмотр всех заказов
- Статусы: НОВЫЙ → В РАБОТЕ → ЗАВЕРШЁН
- Назначение заказов на агентов
- Отмена заказов

## Структура базы данных (Firestore)

```
users/          — пользователи (email, name, phone, role)
suppliers/      — поставщики (name, city, email, phone, whatsapp, telegram, lat, lng, rating)
  └─ reviews/   — отзывы
products/       — товары (name, price, category, description, imageUrl, supplierId)
orders/         — заказы (buyerId, supplierId, items, total, status, agentId)
```

## Категории

Кондитерка, Напитки, Бакалея, Молочные продукты, Мясо и птица,
Фрукты и овощи, Заморозка, Снеки, Бытовая химия, Другое

## Города

Бишкек, Ош, Джалал-Абад, Каракол, Токмок, Нарын, Баткен, Талас, Балыкчы, Кызыл-Кия

---

## Как запустить

### 1. Установи Node.js

Скачай и установи с https://nodejs.org (версия LTS)

### 2. Установи зависимости

Открой терминал в папке проекта и выполни:

```bash
npm install
```

### 3. Настрой Firebase

1. Зайди на https://console.firebase.google.com
2. Создай проект (например: `marketkg`)
3. На главной нажми иконку `</>` (Web) → зарегистрируй приложение
4. Скопируй показанные ключи

### 4. Создай файл .env.local

Скопируй файл `.env.local.example` → `.env.local` и заполни ключами из Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=твой_ключ
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=твой_домен
NEXT_PUBLIC_FIREBASE_PROJECT_ID=твой_проект
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=твой_бакет
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=твой_id
NEXT_PUBLIC_FIREBASE_APP_ID=твой_app_id

NEXT_PUBLIC_ADMIN_EMAIL=твой_email@gmail.com
```

### 5. Включи сервисы Firebase

В консоли Firebase (меню слева):

- **Authentication** → Get Started → включи "Email/Password"
- **Firestore Database** → Create Database → режим "test"
- **Storage** → Get Started → режим "test"

### 6. Запусти проект

```bash
npm run dev
```

Открой http://localhost:3000

---

## Где менять данные

| Что                        | Где                            |
|----------------------------|--------------------------------|
| Ключи Firebase             | `.env.local`                   |
| Email админа               | `.env.local` (ADMIN_EMAIL)     |
| Категории товаров          | `src/lib/firestore.js`         |
| Города Кыргызстана         | `src/lib/firestore.js`         |
| Стили и цвета              | `tailwind.config.js`           |
| Компоненты (карточки и тд) | `src/components/`              |
| Страницы                   | `src/app/`                     |

## Роли пользователей

| Роль        | Как получить                                    |
|-------------|------------------------------------------------|
| Покупатель  | Регистрация с ролью "Покупатель"               |
| Поставщик   | Регистрация с ролью "Поставщик" + админ добавляет email в поставщики |
| Админ       | Email совпадает с NEXT_PUBLIC_ADMIN_EMAIL       |
