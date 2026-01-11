# Вариант 27 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - username: string (unique)
  - email: string (unique)
  - password_hash: string
  - role: enum [admin, user]

- Task
  - id: UUID
  - user_id: reference -> User.id
  - title: string
  - description: string
  - priority: enum [low, medium, high]
  - status: enum [pending, in_progress, completed]
  - created_at: datetime

- Tag
  - id: UUID
  - user_id: reference -> User.id
  - name: string
  - color: string

- TaskTag (связь many-to-many)
  - task_id: reference -> Task.id
  - tag_id: reference -> Tag.id

- Session
  - id: UUID
  - user_id: reference -> User.id
  - task_id: reference -> Task.id (optional)
  - start_time: datetime
  - end_time: datetime
  - paused_at: datetime (nullable, время последней паузы)
  - total_paused_seconds: integer (общее время пауз в секундах, default 0)
  - duration: integer (minutes)
  - status: enum [running, paused, completed, interrupted]
  - session_type: enum [pomodoro, short_break, long_break]

- NotificationSettings
  - id: UUID
  - user_id: reference -> User.id (unique)
  - notify_push: boolean (default true)
  - notify_email: boolean (default false)
  - notify_sound: boolean (default true)

Связи (ER-эскиз)

- User 1..* Task (пользователь владеет задачами)
- User 1..* Tag (пользователь владеет тегами)
- User 1..* Session (пользователь проводит сессии)
- User 1..1 NotificationSettings (настройки уведомлений пользователя)
- Task *..\* Tag (задача может иметь несколько тегов)
- Task 1..* Session (задача может иметь несколько сессий)

Обязательные поля и ограничения (кратко)

- unique(User.username), unique(User.email)
- Task.user_id → User.id (FK, not null)
- Tag.user_id → User.id (FK, not null)
- Session.user_id → User.id (FK, not null)
- Session.task_id → Task.id (FK, nullable)
- NotificationSettings.user_id → User.id (FK, not null, unique)

API — верхнеуровневые ресурсы и операции

- /auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh

- /users
  - GET /users (admin)
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id}

- /tasks
  - GET /tasks (list, filter by status/tag)
  - POST /tasks
  - GET /tasks/{id}
  - PUT /tasks/{id}
  - DELETE /tasks/{id}

- /tags
  - GET /tags
  - POST /tags
  - PUT /tags/{id}
  - DELETE /tags/{id}

- /sessions
  - GET /sessions (filter by date/task)
  - POST /sessions (start session)
  - PATCH /sessions/{id}/pause (приостановить сессию)
  - PATCH /sessions/{id}/resume (возобновить сессию)
  - PUT /sessions/{id} (update/complete session)
  - DELETE /sessions/{id} (user — свои, admin — все)

- /reports
  - GET /reports/daily
  - GET /reports/weekly
  - GET /reports/monthly
  - GET /reports/by-tag
  - GET /reports/export

- /settings (настройки пользователя)
  - GET /settings/notifications (получить настройки уведомлений)
  - PUT /settings/notifications (обновить настройки уведомлений)

Дополнительно (бонусы)

- WebSocket /ws/timer — real-time обновления таймера
- Уведомления (push/email) при завершении сессии
- Документация API (OpenAPI/Swagger)
- Тесты: unit + интеграционные для таймера и отчетов

---

## Подробные операции API, схемы и поведение

Общие принципы

- Ответы в формате: `{ "status": "ok" | "error", "data"?: ..., "error"?: {code, message, fields?} }`
- Пагинация: `limit` и `offset` (по умолчанию limit=50).
- Аутентификация: `Authorization: Bearer <jwt>`; роли: `admin`, `user`.

Примеры ошибок (JSON)

```json
{
  "status": "error",
  "error": { "code": "validation_failed", "message": "Validation failed", "fields": { "title": "required" } }
}
```

Auth

- POST `/auth/register` — `{username, email, password}` → `201 {id, username, email, role}`
- POST `/auth/login` — `{email, password}` → `200 {accessToken, refreshToken, user}`
- POST `/auth/refresh` — `{refreshToken}` → `200 {accessToken}`

Users

- GET `/users?limit=&offset=` — Admin
- GET `/users/{id}` — Admin или self
- PUT `/users/{id}` — Admin или self (частичное обновление)
- DELETE `/users/{id}` — Admin

Tasks

- GET `/tasks?status=&tag=&priority=&limit=&offset=` — список задач пользователя
- POST `/tasks` — `{title, description?, priority?, tags?}` → `201 {id, ...}`
- GET `/tasks/{id}` — детали задачи
- PUT `/tasks/{id}` — `{title?, description?, priority?, status?, tags?}`
- DELETE `/tasks/{id}`

Tags

- GET `/tags` — список тегов пользователя
- POST `/tags` — `{name, color?}` → `201 {id, name, color}`
- PUT `/tags/{id}` — `{name?, color?}`
- DELETE `/tags/{id}`

Sessions

- POST `/sessions` — начать сессию

  - Payload:

  ```json
  {"taskId": "uuid", "sessionType": "pomodoro"}
  ```

  - Response: `201 {id, startTime, duration, status}`

- PUT `/sessions/{id}` — обновить/завершить сессию

  - Payload:

  ```json
  {"status": "completed" | "interrupted", "endTime": "2025-01-06T10:25:00Z"}
  ```

- GET `/sessions?taskId=&from=&to=&status=&limit=&offset=` — история сессий
- DELETE `/sessions/{id}` — удалить сессию (user — свои, admin — все)

- PATCH `/sessions/{id}/pause` — приостановить активную сессию
  - Условие: `status === 'running'`
  - Действие: устанавливает `status = 'paused'`, `paused_at = now()`
  - Response: `200 {id, status, pausedAt}`

- PATCH `/sessions/{id}/resume` — возобновить приостановленную сессию
  - Условие: `status === 'paused'`
  - Действие: вычисляет время паузы, добавляет к `total_paused_seconds`, очищает `paused_at`, `status = 'running'`
  - Response: `200 {id, status, totalPausedSeconds}`

Reports

- GET `/reports/daily?date=2025-01-06` — статистика за день

  - Response: `{totalSessions, totalMinutes, completedTasks, byTag: {...}}`

- GET `/reports/weekly?weekStart=2025-01-01` — статистика за неделю
- GET `/reports/monthly?month=2025-01` — статистика за месяц
- GET `/reports/by-tag?from=&to=` — распределение времени по тегам
- GET `/reports/export?from=&to=&format=csv|json&userId=` — экспорт данных
  - `userId` — опциональный параметр, доступен только для admin; если не указан, экспортируются данные текущего пользователя

Settings (уведомления)

- GET `/settings/notifications` — получить настройки уведомлений текущего пользователя
  - Response: `{notifyPush, notifyEmail, notifySound}`
- PUT `/settings/notifications` — обновить настройки
  - Payload: `{notifyPush?, notifyEmail?, notifySound?}`

---

## Безопасность и авторизация

Общие правила middleware:

1. **Аутентификация** — все защищённые эндпоинты требуют валидный JWT в заголовке `Authorization: Bearer <token>`.
2. **Проверка владельца** — для ресурсов Task, Tag, Session обязательна проверка `resource.user_id === currentUser.id` (или `role === admin`).
3. **Роль admin** — назначается вручную через seed-скрипт или прямое обновление в БД (`UPDATE users SET role='admin' WHERE email='...'`). В MVP нет UI для назначения админа.
4. **Rate limiting** — рекомендуется ограничить частоту запросов (например, 100 req/min на пользователя).
5. **Валидация входных данных** — все payload проверяются на соответствие схеме; невалидные запросы возвращают 400.
