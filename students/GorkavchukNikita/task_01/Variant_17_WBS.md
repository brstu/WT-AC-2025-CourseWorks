# Вариант 17 — WBS (эпики → фичи → задачи)

- Эпик A. Модель данных и сиды
  - Фичи: User, Country, City, Location, Order, Event; связи и справочники
  - Задачи: A1. Описать сущности и статусы OS/ES; A2. Настроить индексы/уникальности (orderCode/locationCode/etc); A3. Подготовить демо‑данные (страны/города/локации)

- Эпик B. API (MVP)
  - Фичи: /tracking (public), /orders (my), /user (auth)
  - Задачи: B1. GET /api/tracking/:code; B2. GET /api/orders/my с пагинацией/поиском; B3. signup/signin/profile + cookie jwt

- Эпик C. Админ‑API и админ‑панель
  - Фичи: CRUD справочников, CRUD заказов, CRUD событий
  - Задачи: C1. /api/admin/country|city|location; C2. /api/admin/order CRUD; C3. /api/admin/order/:oid/event CRUD

- Эпик D. UI (MVP)
  - Фичи: публичный трекер, страница «мои заказы», админ‑страницы
  - Задачи: D1. Компонент OrderTracker (поиск по коду); D2. Страница Orders (таблица); D3. Админ‑таблицы/модалки (create/edit/delete)

- Эпик E. Безопасность и роли
  - Фичи: requireAuth, checkAdmin, RBAC
  - Задачи: E1. Cookie‑auth; E2. Ограничить /api/admin/*; E3. Документировать матрицу прав

- Эпик F. Бонусы
  - Фичи: Webhooks, уведомления, карта, документация API, тесты, CI/CD, Kubernetes
  - Задачи: F1. Webhook dispatcher на new event; F2. Notification channels; F3. Swagger/OpenAPI + тесты + pipeline
