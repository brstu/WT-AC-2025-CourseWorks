# R1 — Data Model & API (ЗОЖ-трекер)

Описание подготовлено на основе исходного кода проекта (Flask + SQLAlchemy). В проекте присутствуют сущности: `User`, `Metric`, `Goal`, `Entry`.

## Сущности (основные)

- User
  - id: integer (PK)
  - email: string (unique, not null)
  - password_hash: string (not null)
  - created_at: datetime

- Metric
  - id: integer (PK)
  - user_id: integer (FK -> user.id, not null)
  - name: string (not null)
  - unit: string (nullable)
  - target_value: float (nullable)
  - color: string (nullable)

- Goal
  - id: integer (PK)
  - metric_id: integer (FK -> metric.id, not null)
  - target_value: float (not null)
  - period: string (daily|weekly|monthly)
  - start_date: date
  - end_date: date (nullable)

- Entry
  - id: integer (PK)
  - metric_id: integer (FK -> metric.id, not null)
  - value: float (not null)
  - date: date (indexed)
  - note: string (nullable)
  - created_at: datetime

## Связи (ER)

- User 1..* Metric
- Metric 1..* Goal
- Metric 1..* Entry

## Ограничения и индексы

- unique(User.email)
- FK Metric.user_id → User.id (ON DELETE CASCADE)
- FK Goal.metric_id → Metric.id (ON DELETE CASCADE)
- FK Entry.metric_id → Metric.id (ON DELETE CASCADE)
- Индексы: Metric.user_id, Entry.metric_id, Entry.date

---

## API (верхнеуровневые ресурсы и операции)

API регистрируется под префиксом `/api/v1`.
Аутентификация: JWT (Flask-JWT-Extended). Заголовок: `Authorization: Bearer <token>`.

Auth
- POST /api/v1/auth/register — регистрация
  - Вход: `{ "email": "user@example.com", "password": "..." }`
  - Возврат: `201 { access_token, user: {id,email}, metrics: [...] }` (по коду создаются дефолтные метрики)
- POST /api/v1/auth/login — логин
  - Вход: `{ "email": "...", "password": "..." }`
  - Возврат: `200 { access_token, user: {id,email} }`
- GET /api/v1/auth/me — профиль (JWT required)
  - Возврат: `{ id, email }`

Metrics
- GET /api/v1/metrics — список метрик пользователя (JWT required)
  - Возврат: `[{id,name,unit,target_value,color}, ...]`
- POST /api/v1/metrics — создать метрику (JWT required)
  - Body: `{ name, unit?, target_value?, color? }` → `201 {id,name}`
- GET /api/v1/metrics/{id} — детали (JWT required)
- PUT /api/v1/metrics/{id} — обновление (JWT required)
- DELETE /api/v1/metrics/{id} — удаление (каскадно удаляет записи)

Entries
- GET /api/v1/metrics/{id}/entries?date_from=&date_to= — список записей для метрики (JWT required)
- POST /api/v1/entries — создать запись
  - Body: `{ metric_id, value, date?, note? }` → `201 {id,value,date}`
- PUT /api/v1/entries/{id} — редактировать запись (JWT required, владелец)
- DELETE /api/v1/entries/{id} — удалить запись (JWT required, владелец)

Dashboard & Reports
- GET /api/v1/dashboard — сводка за сегодня (JWT required)
  - Возврат: `{ date, metrics: [{id,name,unit,total_today,target,progress}, ...] }`
- GET /api/v1/reports?metric_id=&date_from=&date_to= — исторические данные для графика (JWT required)

---

## Поведение и контракты

- Ответы ошибок: `{ "msg": "..." }` с соответствующим HTTP-кодом.
- Валидация: входящие данные проверяются на уровне эндпоинтов (см. `app.auth.routes`, `app.api.routes`).
- Seed: во время регистрации пользователя создаются примерные метрики (Вода/Сон/Шаги).

---

## Acceptance criteria (MVP)

- Регистрация и вход работают; токен используется для всех защищённых вызовов.
- Пользователь может CRUD метрики и CRUD записей только в своих данных.
- Dashboard и Reports возвращают ожидаемые агрегаты.
