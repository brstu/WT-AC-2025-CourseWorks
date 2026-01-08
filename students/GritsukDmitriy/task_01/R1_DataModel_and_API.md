# Вариант 24 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - username: string (unique)
  - email: string (unique)
  - password_hash: string
  - role: enum [admin, user]
  - created_at: datetime
  - updated_at: datetime

- Roadmap
  - id: UUID
  - title: string
  - description: string
  - category: string
  - difficulty: enum [beginner, intermediate, advanced]
  - is_published: boolean
  - created_at: datetime
  - updated_at: datetime

- Step
  - id: UUID
  - roadmap_id: reference -> Roadmap.id
  - title: string
  - description: string
  - order: number
  - created_at: datetime
  - updated_at: datetime

- Resource
  - id: UUID
  - step_id: reference -> Step.id
  - title: string
  - url: string
  - type: enum [article, video, course]
  - created_at: datetime
  - updated_at: datetime

- Progress
  - id: UUID
  - user_id: reference -> User.id
  - step_id: reference -> Step.id
  - completed: boolean
  - completed_at: datetime

Связи (ER-эскиз)

- Roadmap 1..* Step (дорожная карта содержит шаги)
- Step 1..* Resource (шаг содержит ресурсы)
- User 1..* Progress (пользователь имеет прогресс)
- Step 1..* Progress (шаг может быть пройден многими пользователями)

Обязательные поля и ограничения (кратко)

- unique(User.username)
- unique(User.email)
- Step.roadmap_id → Roadmap.id (FK, not null)
- Resource.step_id → Step.id (FK, not null)
- Progress.user_id → User.id (FK, not null)
- Progress.step_id → Step.id (FK, not null)
- unique(Progress.user_id, Progress.step_id)

API — верхнеуровневые ресурсы и операции

- /users
  - GET /users (admin)
  - POST /users (admin)
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id}

- /roadmaps
  - GET /roadmaps (list)
  - POST /roadmaps (admin)
  - GET /roadmaps/{id}
  - PUT /roadmaps/{id} (admin)
  - DELETE /roadmaps/{id} (admin)

- /steps
  - GET /steps?roadmap_id= (filter by roadmap)
  - POST /steps (admin)
  - GET /steps/{id}
  - PUT /steps/{id} (admin)
  - DELETE /steps/{id} (admin)

- /resources
  - GET /resources?step_id= (filter by step)
  - POST /resources (admin)
  - GET /resources/{id}
  - PUT /resources/{id} (admin)
  - DELETE /resources/{id} (admin)

- /progress
  - GET /progress?user_id=&roadmap_id= (filter)
  - POST /progress (mark step as completed)
  - DELETE /progress/{id} (unmark)

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

- POST `/auth/register` — `{username, email, password}` → `201 {id, username, email, role}` (роль по умолчанию: `user`)
- POST `/auth/login` — `{username, password}` → `200 {accessToken, refreshToken, user}`
- POST `/auth/refresh` — `{refreshToken}` → `200 {accessToken}`

**Безопасность auth:**

- Rate limiting: максимум 5 попыток входа в минуту с одного IP
- Password requirements: минимум 8 символов, минимум 1 цифра, минимум 1 буква
- JWT expiration: accessToken — 15 минут, refreshToken — 7 дней

Users

- GET `/users?limit=&offset=` — Admin
- GET `/users/{id}` — Admin или self (пользователь может просматривать свой профиль)
- POST `/users` — Admin (payload: `{username, email, password, role?}`) — можно создавать admin
- PUT `/users/{id}` — Admin или self (пользователь может редактировать свой профиль: username, email, password)
- DELETE `/users/{id}` — Admin

**Scope-правила:**

- Пользователь может только GET/PUT свой профиль (проверка: `user_id` из JWT === `{id}`)
- Пользователь не может изменять поле `role`
- Admin имеет полный доступ ко всем операциям

Roadmaps

- GET `/roadmaps?limit=&offset=&category=&difficulty=&is_published=` — список дорожных карт (пользователи видят только published, admin — все)
- POST `/roadmaps` — Admin (payload: `{title, description, category?, difficulty?, is_published?}`) — по умолчанию `is_published=false`
- GET `/roadmaps/{id}` — детали, включает список шагов (пользователи видят только published)
- PUT `/roadmaps/{id}` — Admin
- DELETE `/roadmaps/{id}` — Admin (soft delete: устанавливает `deleted_at`)

**Фильтры:**

- `category` — строка (например, "Frontend", "Backend", "DevOps")
- `difficulty` — enum: beginner | intermediate | advanced
- `is_published` — boolean (только для admin)

Steps

- GET `/steps?roadmap_id=&limit=&offset=` — список шагов для roadmap
- POST `/steps` — Admin `{roadmap_id, title, description, order}` → `201 {id}`
- GET `/steps/{id}` — детали шага, включает ресурсы
- PUT `/steps/{id}` — Admin
- DELETE `/steps/{id}` — Admin

Resources

- GET `/resources?step_id=&limit=&offset=` — список ресурсов для шага
- POST `/resources` — Admin `{step_id, title, url, type}` → `201 {id}`
- GET `/resources/{id}` — детали ресурса
- PUT `/resources/{id}` — Admin
- DELETE `/resources/{id}` — Admin

Progress (трекинг прогресса)

- GET `/progress?user_id=&roadmap_id=` — прогресс пользователя

  - **Scope:** пользователи видят только свой прогресс (проверка: `user_id` из JWT === query `user_id`), admin видит любой
  - Response: `{completed_steps: [...], total_steps: n, percentage: x}`

- POST `/progress` — отметить шаг как выполненный

  - Payload: `{step_id}` — **user_id автоматически берётся из JWT-токена**
  - Response: `201 {id, step_id, user_id, completed: true, completed_at}`
  - Проверка: нельзя отметить шаг из неопубликованной roadmap (если `is_published=false`)

- DELETE `/progress/{id}` — снять отметку о выполнении
  - **Scope:** только владелец прогресса (проверка: `user_id` из JWT === `progress.user_id`) или admin
