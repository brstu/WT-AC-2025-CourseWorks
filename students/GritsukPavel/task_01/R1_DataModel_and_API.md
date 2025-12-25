# Вариант 32 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - username: string (unique)
  - email: string (unique)
  - password_hash: string
  - role: enum [admin, user]

- Company
  - id: UUID
  - name: string
  - description: string
  - user_id: reference -> User.id

- Job
  - id: UUID
  - title: string
  - company_id: reference -> Company.id
  - user_id: reference -> User.id
  - current_stage_id: reference -> Stage.id
  - salary: string
  - location: string
  - url: string
  - created_at: datetime
  - updated_at: datetime

- Stage
  - id: UUID
  - job_id: reference -> Job.id
  - name: string
  - order: integer
  - date: datetime

- Note
  - id: UUID
  - job_id: reference -> Job.id
  - content: text
  - created_at: datetime

- Reminder
  - id: UUID
  - job_id: reference -> Job.id
  - title: string
  - date: datetime
  - completed: boolean
  - created_at: datetime

Связи (ER-эскиз)

- User 1..* Company (пользователь создаёт компании)
- User 1..* Job (пользователь отслеживает вакансии)
- Company 1..* Job (компания имеет вакансии)
- Job 1..* Stage (вакансия проходит этапы)
- Job 1..* Note (вакансия имеет заметки)
- Job 1..* Reminder (вакансия имеет напоминания)

Обязательные поля и ограничения (кратко)

- unique(User.username, User.email)
- Job.user_id → User.id (FK, not null)
- Job.company_id → Company.id (FK, not null)
- Stage.job_id → Job.id (FK, not null)
- Note.job_id → Job.id (FK, not null)
- Reminder.job_id → Job.id (FK, not null)

API — верхнеуровневые ресурсы и операции

- /users
  - GET /users (admin)
  - POST /users (admin)
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id}

- /companies
  - GET /companies (list, filter by user)
  - POST /companies
  - GET /companies/{id}
  - PUT /companies/{id}
  - DELETE /companies/{id}

- /jobs
  - GET /jobs (filter by user, company, stage)
  - POST /jobs
  - GET /jobs/{id}
  - PUT /jobs/{id}
  - DELETE /jobs/{id}

- /stages
  - GET /stages (filter by job)
  - POST /stages
  - GET /stages/{id}
  - PUT /stages/{id}
  - DELETE /stages/{id}

- /notes
  - GET /notes (filter by job)
  - POST /notes
  - GET /notes/{id}
  - PUT /notes/{id}
  - DELETE /notes/{id}

- /reminders
  - GET /reminders (filter by job, date, completed)
  - POST /reminders
  - PUT /reminders/{id}
  - DELETE /reminders/{id}

Дополнительно (бонусы)

- WebSocket /ws/reminders — уведомления о напоминаниях в реальном времени
- Документация API (OpenAPI/Swagger)
- Тесты: unit + интеграционные

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

- POST `/auth/register` — `{email, password, username}` → `201 {id, email, username, role}`
- POST `/auth/login` — `{email, password}` → `200 {accessToken, refreshToken, user}`
- POST `/auth/refresh` — `{refreshToken}` → `200 {accessToken}`

Users

- GET `/users?limit=&offset=` — Admin
- GET `/users/{id}` — Admin или self
- POST `/users` — Admin (payload: `{username,email,password,role?}`)
- PUT `/users/{id}` — Admin или self (частичное обновление)
- DELETE `/users/{id}` — Admin

Companies

- GET `/companies?userId=&limit=&offset=` — список
- POST `/companies` — User (payload: `{name,description?}`)
- GET `/companies/{id}` — детали
- PUT `/companies/{id}` — User (owner)
- DELETE `/companies/{id}` — User (owner)

Jobs

- POST `/jobs` — User `{title,companyId,salary?,location?,url?}` → `201 {id}`
- GET `/jobs?userId=&companyId=&stageId=` — список вакансий
- GET `/jobs/{id}` — детали вакансии, включая этапы и заметки
- PUT `/jobs/{id}` — User (owner)
- DELETE `/jobs/{id}` — User (owner)

Stages

- POST `/stages` — User `{jobId, name, order, date?}` → `201 {id}`
- GET `/stages?jobId=` — список этапов для вакансии
- GET `/stages/{id}` — детали этапа
- PUT `/stages/{id}` — User (owner)
- DELETE `/stages/{id}` — User (owner)

Notes

- POST `/notes` — User `{jobId, content}` → `201 {id}`
- GET `/notes?jobId=` — список заметок для вакансии
- GET `/notes/{id}` — детали заметки
- PUT `/notes/{id}` — User (owner)
- DELETE `/notes/{id}` — User (owner)

Reminders

- POST `/reminders` — User `{jobId, title, date}` → `201 {id}`
- GET `/reminders?jobId=&completed=&from=&to=` — список напоминаний
- GET `/reminders/{id}` — детали напоминания
- PUT `/reminders/{id}` — User (owner, можно отметить completed)
- DELETE `/reminders/{id}` — User (owner)

Канбан

- GET `/kanban` — специальный endpoint для получения всех вакансий сгруппированных по этапам для канбан-доски
  - Response: `{ stages: [ {id, name, order, jobs: [...]} ] }`

Валидация

- Job.title: не пустое, макс 200 символов
- Company.name: не пустое, макс 100 символов
- Stage.name: не пустое, макс 50 символов
- Note.content: не пустое, макс 5000 символов
- Reminder.title: не пустое, макс 200 символов
- Reminder.date: не раньше текущей даты
