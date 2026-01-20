# Вариант 17 — Доставка «Где моя посылка?» — Маршруты (user flows)

1. Публичный трекинг (приёмка MVP)

- Гость/пользователь открывает главную страницу
- Вводит код `orderCode` (например: `ORD-AB12CD34`)
- Клиент отправляет запрос `GET /api/tracking/:code`
- UI отображает: карточку заказа + таймлайн событий (events)

1. Регистрация и вход

- Регистрация: `POST /api/user/signup` → установка cookie `jwt`
- Вход: `POST /api/user/signin` → установка cookie `jwt`
- Профиль: `GET /api/user/profile` (требует cookie)

1. Просмотр «Мои заказы» (для залогиненного пользователя)

- Пользователь открывает страницу «Orders / My orders»
- Клиент вызывает `GET /api/orders/my?page=1&limit=20&search=`
- UI показывает таблицу заказов (name, orderCode, status, pickup/current location)

1. Админ-панель: подготовка справочников адресов

- Админ входит: `POST /api/admin/signin` (cookie `jwt`)
- Заполняет справочник стран: `/api/admin/country` (CRUD)
- Заполняет справочник городов: `/api/admin/city` (CRUD)
- Создаёт логистические точки (адреса): `/api/admin/location` (CRUD)

1. Админ-панель: создание и управление заказами

- Создать заказ: `POST /api/admin/order`
  - Сервер генерирует `orderCode` и создаёт первое событие `ES=0 created`
- Просмотр списка: `GET /api/admin/order?page=1&limit=20&search=`
- Открыть заказ: `GET /api/admin/order/:id` → order + events
- Обновить заказ: `PATCH /api/admin/order/:id` (например, имя/статус/локации)
- Удалить заказ: `DELETE /api/admin/order/:id` (также удаляются events)

1. Админ-панель: события трекинга (таймлайн)

- Добавить событие: `POST /api/admin/order/:oid/event`
  - Сервер сохраняет event и синхронизирует Order.status + Order.currentLocation
- Изменить/удалить событие: `PATCH/DELETE /api/admin/order/:oid/event/:id`
  - Сервер пересчитывает Order по последнему событию
