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

**Безопасность:**

- Все операции CRUD на ресурсах (Job, Company, Stage, Note, Reminder) требуют проверки ownership: `resource.user_id === req.user.id`.
- Admin имеет read-only доступ ко всем ресурсам (кроме Users), но НЕ может редактировать/удалять чужие данные.
- refreshToken хранится в httpOnly cookie, accessToken — в памяти клиента (не localStorage для защиты от XSS).
- Rate limiting на /auth/login и /auth/register (например, 5 попыток/минуту).

Примеры ошибок (JSON)

```json
{
  "status": "error",
  "error": { "code": "validation_failed", "message": "Validation failed", "fields": { "title": "required" } }
}
```

Коды ошибок:

- `validation_failed` — ошибка валидации полей
- `unauthorized` — не авторизован (нет токена или токен невалиден)
- `forbidden` — нет прав на операцию (например, попытка редактировать чужой Job)
- `not_found` — ресурс не найден

Auth

- POST `/auth/register` — `{email, password, username}` → `201 {id, email, username, role}` (пароль хешируется bcrypt/argon2)
- POST `/auth/login` — `{email, password}` → `200 {accessToken, user}` + httpOnly cookie с refreshToken
- POST `/auth/refresh` — читает refreshToken из cookie → `200 {accessToken}`
- POST `/auth/logout` — очищает httpOnly cookie с refreshToken

Users

- GET `/users?limit=&offset=` — Admin
- GET `/users/{id}` — Admin или self
- POST `/users` — Admin (payload: `{username,email,password,role?}`)
- PUT `/users/{id}` — Admin или self (частичное обновление)
- DELETE `/users/{id}` — Admin

Companies

- GET `/companies?userId=&limit=&offset=` — список компаний (только свои для user, все для admin)
- POST `/companies` — User (payload: `{name,description?}`) → `201 {id}`
- GET `/companies/{id}` — детали компании (ownership проверка)
- PUT `/companies/{id}` — User (только owner может редактировать)
- DELETE `/companies/{id}` — User (только owner, проверка: нет связанных Jobs или каскадное удаление с предупреждением)

Jobs

- POST `/jobs` — User `{title,companyId,salary?,location?,url?}` → `201 {id}` (проверка: companyId принадлежит user)
- GET `/jobs?userId=&companyId=&stageId=` — список вакансий (user видит только свои, admin — все)
- GET `/jobs/{id}` — детали вакансии, включая этапы и заметки (ownership проверка)
- PUT `/jobs/{id}` — User (только owner)
- DELETE `/jobs/{id}` — User (только owner, каскадно удаляет Stages, Notes, Reminders)

Stages

- POST `/stages` — User `{jobId, name, order, date?}` → `201 {id}` (проверка: Job принадлежит user)
- GET `/stages?jobId=` — список этапов для вакансии (ownership проверка через Job)
- GET `/stages/{id}` — детали этапа (ownership проверка)
- PUT `/stages/{id}` — User (только owner Job'а)
- DELETE `/stages/{id}` — User (только owner Job'а)

Notes

- POST `/notes` — User `{jobId, content}` → `201 {id}` (проверка: Job принадлежит user)
- GET `/notes?jobId=` — список заметок для вакансии (ownership проверка)
- GET `/notes/{id}` — детали заметки (ownership проверка)
- PUT `/notes/{id}` — User (только owner Job'а)
- DELETE `/notes/{id}` — User (только owner Job'а)

Reminders

- POST `/reminders` — User `{jobId, title, date}` → `201 {id}` (проверка: Job принадлежит user)
- GET `/reminders?jobId=&completed=&from=&to=` — список напоминаний (только свои)
- GET `/reminders/{id}` — детали напоминания (ownership проверка)
- PUT `/reminders/{id}` — User (только owner Job'а, можно отметить completed)
- DELETE `/reminders/{id}` — User (только owner Job'а)

Канбан

- GET `/kanban` — специальный endpoint для получения всех вакансий сгруппированных по этапам для канбан-доски
  - Response: `{ stages: [ {id, name, order, jobs: [...]} ] }`

Валидация

- Job.title: не пустое, макс 200 символов
- Company.name: не пустое, макс 100 символов
- Stage.name: не пустое, макс 50 символов
- Note.content: не пустое, макс 5000 символов
- Reminder.title: не пустое, макс 200 символов
- Reminder.date: не раньше текущей даты (только при создании, не при редактировании)
- User.username: только алфавит и цифры, уникальное
- User.email: формат email, уникальное
- User.password: минимум 6 символов (при регистрации/изменении)

---

## Требования безопасности (обязательно к реализации)

1. **Аутентификация:**
   - JWT с accessToken (короткое время жизни, 15 мин) + refreshToken (долгое время жизни, 7 дней).
   - refreshToken хранится в httpOnly cookie (защита от XSS).
   - Хеширование паролей: bcrypt или argon2 (не хранить plaintext).

2. **Авторизация и проверка прав:**
   - Middleware для проверки ownership: перед любой операцией на Job/Company/Stage/Note/Reminder проверять `resource.user_id === req.user.id`.
   - Admin имеет read-only доступ к чужим данным (кроме Users, где полный CRUD).
   - Запрещено редактировать/удалять чужие ресурсы даже для admin.

3. **Rate Limiting:**
   - /auth/login: максимум 5 попыток в минуту с одного IP.
   - /auth/register: максимум 3 регистрации в час с одного IP.

4. **CORS и Helmet:**
   - CORS: разрешить только конкретный origin фронтенда (не `*`).
   - Helmet для защиты от XSS, clickjacking, MIME sniffing.

5. **Валидация:**
   - Zod-схемы на сервере для всех входящих данных.
   - Человекочитаемые ошибки с кодами (validation_failed, unauthorized, forbidden, not_found).

6. **Логирование:**
   - Логи всех неудачных попыток аутентификации.
   - Логи попыток доступа к чужим ресурсам (для аудита).

7. **Удаление данных:**
   - При удалении Company с Job'ами — показать предупреждение на фронтенде, но разрешить каскадное удаление.
   - При удалении Job — каскадно удалять Stages, Notes, Reminders (FK с ON DELETE CASCADE).
