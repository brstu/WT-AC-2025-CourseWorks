# Вариант 35 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - username: string (unique)
  - password_hash: string
  - email: string (unique)
  - role: enum [admin, user]

- Trip
  - id: UUID
  - title: string
  - description: string
  - start_date: date
  - end_date: date
  - budget: number
  - owner_id: reference -> User.id
  - created_at: datetime

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

- Note
  - id: UUID
  - trip_id: reference -> Trip.id
  - author_id: reference -> User.id
  - content: text
  - created_at: datetime

- Expense
  - id: UUID
  - trip_id: reference -> Trip.id
  - author_id: reference -> User.id
  - amount: number
  - category: string
  - description: string
  - date: date

- TripParticipant
  - id: UUID
  - trip_id: reference -> Trip.id
  - user_id: reference -> User.id
  - role: enum [owner, participant]

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

- GET `/trips?ownerId=&participantId=&status=&limit=&offset=` — список поездок
- POST `/trips` — User (payload: `{title,description,startDate,endDate,budget?}`)
- GET `/trips/{id}` — детали поездки, включает список остановок
- PUT `/trips/{id}` — Owner или Admin
- DELETE `/trips/{id}` — Owner или Admin
- POST `/trips/{id}/share` — Owner (payload: `{userId}`) → добавить участника
- DELETE `/trips/{id}/participants/{userId}` — Owner

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
- PUT `/notes/{id}` — Author или Admin
- DELETE `/notes/{id}` — Author или Admin

Expenses

- POST `/expenses` — Participant или Owner (payload: `{tripId,amount,category,description,date}`)
- GET `/expenses?tripId=&category=&limit=&offset=` — список расходов для поездки
- GET `/expenses/{id}` — детали расхода
- PUT `/expenses/{id}` — Author или Admin
- DELETE `/expenses/{id}` — Author или Admin

Dashboards / Aggregates

- GET `/trips/{id}/summary` — возвращает: totalExpenses, remainingBudget, stopsCount, participantsCount

Администрирование

- GET `/system/stats` — Admin (общая статистика: количество пользователей, поездок, etc.)

WebSocket (опционально)

- `ws://host/trips/{id}?token=...` — события: `noteAdded`, `expenseAdded`, `stopAdded`, `participantJoined`.
