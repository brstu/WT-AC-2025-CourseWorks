# Вариант 35 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - username: string (unique)
  - password_hash: string
  - email: string (unique)
  - role: enum [admin, user]
  - created_at: datetime
  - updated_at: datetime

- Trip
  - id: UUID
  - title: string
  - description: string
  - start_date: date
  - end_date: date
  - budget: number
  - owner_id: reference -> User.id
  - created_at: datetime
  - updated_at: datetime

- Stop
  - id: UUID
  - trip_id: reference -> Trip.id
  - name: string
  - address: string
  - latitude: number
  - longitude: number
  - arrival_date: datetime
  - departure_date: datetime
  - order: integer
  - created_at: datetime
  - updated_at: datetime

- Note
  - id: UUID
  - trip_id: reference -> Trip.id
  - author_id: reference -> User.id
  - content: text
  - created_at: datetime
  - updated_at: datetime

- Expense
  - id: UUID
  - trip_id: reference -> Trip.id
  - author_id: reference -> User.id
  - amount: number
  - category: string
  - description: string
  - date: date
  - created_at: datetime
  - updated_at: datetime

- TripParticipant
  - id: UUID
  - trip_id: reference -> Trip.id
  - user_id: reference -> User.id
  - joined_at: datetime

Связи (ER-эскиз)

- User 1..* Trip (пользователь создаёт поездки)
- Trip 1..* Stop (поездка имеет остановки)
- Trip 1..* Note (поездка имеет заметки)
- Trip 1..* Expense (поездка имеет расходы)
- User 1..* Note (пользователь пишет заметки)
- User 1..* Expense (пользователь добавляет расходы)
- Trip *..* User через TripParticipant (поездка имеет участников)

Обязательные поля и ограничения (кратко)

- unique(User.username)
- unique(User.email)
- Trip.owner_id → User.id (FK, not null)
- Stop.trip_id → Trip.id (FK, not null)
- Note.trip_id → Trip.id (FK, not null)
- Note.author_id → User.id (FK, not null)
- Expense.trip_id → Trip.id (FK, not null)
- Expense.author_id → User.id (FK, not null)

Политика каскадного удаления

- При удалении Trip → удаляются все Stop, Note, Expense, TripParticipant (CASCADE)
- При удалении User:
  - **MVP подход:** Запрет удаления, если у пользователя есть активные поездки (Trip.owner_id)
  - Альтернатива (для будущих версий): Перевод владения или каскадное удаление с предупреждением
- При удалении участника из поездки (TripParticipant) → Note/Expense остаются с author_id

API — верхнеуровневые ресурсы и операции

- /users
  - GET /users (admin)
  - POST /users (admin)
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id}

- /trips
  - GET /trips (list, filter by owner/participant)
  - POST /trips
  - GET /trips/{id}
  - PUT /trips/{id}
  - DELETE /trips/{id}
  - POST /trips/{id}/share (add participant)
  - DELETE /trips/{id}/participants/{userId}

- /stops
  - GET /stops?tripId=
  - POST /stops
  - GET /stops/{id}
  - PUT /stops/{id}
  - DELETE /stops/{id}

- /notes
  - GET /notes?tripId=
  - POST /notes
  - GET /notes/{id}
  - PUT /notes/{id}
  - DELETE /notes/{id}

- /expenses
  - GET /expenses?tripId=
  - POST /expenses
  - GET /expenses/{id}
  - PUT /expenses/{id}
  - DELETE /expenses/{id}

Дополнительно (бонусы)

- WebSocket /ws/trips/{id} — обновления в реальном времени для участников
- Документация API (OpenAPI/Swagger)
- Тесты: unit + интеграционные для шаринга поездок

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

Trips

- GET `/trips?ownerId=&participantId=&limit=&offset=` — список поездок
  - `ownerId`: фильтр по владельцу
  - `participantId`: фильтр по участнику
  - По умолчанию возвращает поездки, где текущий пользователь является владельцем или участником
- POST `/trips` — User (payload: `{title,description,startDate,endDate,budget?}`)
- GET `/trips/{id}` — детали поездки, включает список остановок
  - Доступ: Owner, Participant или Admin
- PUT `/trips/{id}` — Owner или Admin
- DELETE `/trips/{id}` — Owner или Admin
- POST `/trips/{id}/share` — Owner (payload: `{userId}`)
  - Добавляет пользователя в участники поездки
  - Ответ: `201 Created` при успехе, `409 Conflict` если уже участник, `404 Not Found` если пользователь не найден
- DELETE `/trips/{id}/participants/{userId}` — Owner
  - Удаляет участника из поездки
  - Участник может сам покинуть поездку (DELETE `/trips/{id}/participants/{selfUserId}`)
  - Note/Expense, созданные участником, остаются в поездке

Stops

- POST `/stops` — Participant или Owner (payload: `{tripId,name,address,latitude,longitude,arrivalDate,departureDate,order}`)
- GET `/stops?tripId=` — список остановок для поездки
- GET `/stops/{id}` — детали остановки
- PUT `/stops/{id}` — Participant или Owner
- DELETE `/stops/{id}` — Participant или Owner

Notes

- POST `/notes` — Participant или Owner (payload: `{tripId,content}`)
- GET `/notes?tripId=&limit=&offset=` — список заметок для поездки
- GET `/notes/{id}` — детали заметки
- PUT `/notes/{id}` — Author
- DELETE `/notes/{id}` — Author или TripOwner или Admin

Expenses

- POST `/expenses` — Participant или Owner (payload: `{tripId,amount,category,description,date}`)
- GET `/expenses?tripId=&category=&limit=&offset=` — список расходов для поездки
- GET `/expenses/{id}` — детали расхода
- PUT `/expenses/{id}` — Author
- DELETE `/expenses/{id}` — Author или TripOwner или Admin

Dashboards / Aggregates

- GET `/trips/{id}/summary` — возвращает: totalExpenses, remainingBudget, stopsCount, participantsCount

Администрирование

- GET `/system/stats` — Admin (общая статистика: количество пользователей, поездок, etc.)

---

## Требования безопасности (обязательные для MVP)

### Аутентификация и авторизация

- **JWT токены:** Access token (короткий TTL: 15 мин) + Refresh token (длинный TTL: 7 дней)
- **Refresh token storage:** Хранение на клиенте (httpOnly cookie или localStorage для MVP)
- **RBAC:** Role-Based Access Control на основе User.role (admin/user)
- **Владение ресурсами:** Проверка Trip.owner_id и TripParticipant для доступа к контенту поездки

### Валидация данных

- **Server-side валидация (Zod):**
  - Email: валидный формат
  - Password: минимум 8 символов, содержит буквы и цифры
  - Latitude: [-90, 90]
  - Longitude: [-180, 180]
  - Amount (Expense): > 0
  - Budget (Trip): >= 0
  - Date ranges: start_date <= end_date

- **Client-side валидация:** Дублирование валидации на фронтенде для UX

### Защита от атак

- **Rate Limiting (express-rate-limit):**
  - `/auth/*`: 5 запросов/минуту на IP
  - API endpoints: 100 запросов/минуту на пользователя

- **XSS Protection:**
  - Хранение Note.content и Trip.description как plain text
  - Sanitization на клиенте при рендеринге (DOMPurify или экранирование)
  - Content Security Policy headers

- **SQL Injection:** Использование Prisma ORM (параметризованные запросы)

- **CORS:** Настройка allowed origins (не использовать wildcard `*` в продакшене)

- **Helmet.js:** HTTP security headers (X-Frame-Options, X-Content-Type-Options, etc.)

### Безопасное хранение

- **Пароли:** bcrypt или argon2 для хеширования (минимум 10 rounds для bcrypt)
- **Секреты:** .env файл для JWT_SECRET, DATABASE_URL (не коммитить в git)
- **.env.example:** Шаблон без реальных значений

### Логирование и мониторинг

- **Базовое логирование:**
  - Успешные/неудачные попытки входа
  - Изменения критичных данных (создание/удаление Trip)
  - Ошибки сервера (500)

- **Не логировать:** Пароли, JWT токены, персональные данные в plaintext

### Проверка прав доступа

- **Middleware для проверки:**
  - Пользователь аутентифицирован (JWT валиден)
  - Пользователь имеет доступ к ресурсу (owner/participant/admin)
  - Пример: При GET `/trips/{id}` проверить, что `req.user.id === trip.owner_id` ИЛИ `TripParticipant.exists(trip_id, user_id)` ИЛИ `req.user.role === 'admin'`

### Человекочитаемые ошибки

- **Не раскрывать технические детали:**
  - ❌ "TypeError: Cannot read property 'id' of undefined"
  - ✅ "Поездка не найдена"

- **Структурированные ошибки:**

  ```json
  {
    "status": "error",
    "error": {
      "code": "validation_failed",
      "message": "Ошибка валидации",
      "fields": {
        "email": "Введите корректный email",
        "password": "Пароль должен содержать минимум 8 символов"
      }
    }
  }
  ```

---

## Дополнительные возможности (бонусы, не обязательно для MVP)

### WebSocket для реального времени

- `ws://host/trips/{id}?token=...` — подключение к поездке для получения обновлений в реальном времени
- События: `noteAdded`, `expenseAdded`, `stopAdded`, `participantJoined`, `tripUpdated`
- Требует дополнительной аутентификации через JWT в query параметре

### Документация API

- OpenAPI/Swagger спецификация для автоматической генерации документации
- Интерактивный UI для тестирования endpoints

### Тестирование

- Unit тесты для бизнес-логики
- Интеграционные тесты для API endpoints
- E2E тесты для критичных user flows (регистрация, создание поездки, шаринг)
