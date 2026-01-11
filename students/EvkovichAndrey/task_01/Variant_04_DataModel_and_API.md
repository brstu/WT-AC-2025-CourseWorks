# Вариант 04 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - username: string (unique)
  - password_hash: string
  - role: enum [admin, user]
  - email: string (unique)

- Habit
  - id: UUID
  - user_id: reference -> User.id
  - title: string
  - description: string
  - frequency: enum [daily, weekly, custom]
  - category: string
  - is_public: boolean
  - created_at: datetime

- Goal
  - id: UUID
  - habit_id: reference -> Habit.id
  - target_value: number
  - deadline: date
  - unit: string

- Entry
  - id: UUID
  - habit_id: reference -> Habit.id
  - date: date
  - value: number
  - comment: string
  - created_at: datetime

- Reminder
  - id: UUID
  - habit_id: reference -> Habit.id
  - time: time
  - days_of_week: array of enum [mon, tue, wed, thu, fri, sat, sun]
  - is_active: boolean

- Streak (может быть вычисляемым, но можно хранить для производительности)
  - habit_id: reference -> Habit.id
  - current_streak: integer
  - longest_streak: integer
  - last_entry_date: date

- Category (опционально)
  - id: UUID
  - user_id: reference -> User.id
  - name: string
  - color: string

Связи (ER-эскиз)

- User 1..* Habit (пользователь создаёт привычки)
- Habit 1..* Goal (у привычки могут быть цели)
- Habit 1..* Entry (привычка имеет отметки выполнения)
- Habit 1..* Reminder (привычка может иметь напоминания)
- Habit 0..1 Streak (привычка имеет текущую серию)

Обязательные поля и ограничения (кратко)

- unique(User.username)
- unique(User.email)
- Habit.user_id → User.id (FK, not null)
- Goal.habit_id → Habit.id (FK, not null)
- Entry.habit_id → Habit.id (FK, not null)
- Reminder.habit_id → Habit.id (FK, not null)

API — верхнеуровневые ресурсы и операции

- /auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh

- /users
  - GET /users (admin)
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id} (admin)

- /habits
  - GET /habits (list, filter by user/category/public)
  - POST /habits
  - GET /habits/{id}
  - PUT /habits/{id}
  - DELETE /habits/{id}

- /goals
  - GET /goals?habit_id= (list)
  - POST /goals
  - GET /goals/{id}
  - PUT /goals/{id}
  - DELETE /goals/{id}

- /entries
  - POST /entries (отметка выполнения)
  - GET /entries?habit_id=&from=&to=&limit=&offset=
  - GET /entries/{id}
  - PUT /entries/{id}
  - DELETE /entries/{id}

- /reminders
  - GET /reminders?habit_id=
  - POST /reminders
  - PUT /reminders/{id}
  - DELETE /reminders/{id}

- /stats
  - GET /stats/habits/{id}/streaks (текущая и самая длинная серия)
  - GET /stats/habits/{id}/calendar?year=&month= (календарь выполнения)
  - GET /stats/user/summary (общая статистика по пользователю)

- /admin (бонус)
  - GET /admin/users
  - GET /admin/habits
  - POST /admin/broadcast (рассылка уведомлений)

Дополнительно (бонусы)

- WebSocket /ws/reminders — поток напоминаний в реальном времени
- WebSocket /ws/updates — обновления прогресса
- Документация API (OpenAPI/Swagger)
- Тесты: unit + интеграционные для логики streaks
---
- Auth
    POST /auth/register — {username, email, password} → 201 {id, username, email, role, token}
    POST /auth/login — {email, password} → 200 {accessToken, refreshToken, user}
    POST /auth/refresh — {refreshToken} → 200 {accessToken}

- Users
    GET /users?limit=&offset= — Admin
    GET /users/{id} — Admin или self
    PUT /users/{id} — Admin или self (частичное обновление)
    DELETE /users/{id} — Admin

- Habits
    GET /habits?user_id=&category=&is_public=&limit=&offset= — список
    POST /habits — {title, description?, frequency, category?, is_public?} → 201 {id}
    GET /habits/{id} — детали, включает последние отметки и текущий streak
    PUT /habits/{id} — владелец или admin
    DELETE /habits/{id} — владелец или admin

- Goals
    POST /goals — {habit_id, target_value, deadline?, unit?} → 201 {id}
    GET /goals?habit_id= — список целей для привычки
    GET /goals/{id} — детали цели
    PUT /goals/{id} — владелец привычки или admin
    DELETE /goals/{id} — владелец привычки или admin

-Entries (отметки выполнения)
    POST /entries — массовая или единичная загрузка

Payload (пример):

```json
[
{"habit_id": "uuid", "date": "2025-10-13", "value": 1, "comment": "Сделано!"},
{"habit_id": "uuid", "date": "2025-10-12", "value": 0.5, "comment": "Наполовину"}
]
```

- Reminders (напоминания)
    POST /reminders — {habit_id, time, days_of_week, is_active?} → 201 {id}
    GET /reminders?habit_id= — список напоминаний для привычки
    PUT /reminders/{id} — изменение времени/дней/активности
    DELETE /reminders/{id} — удаление напоминания

- Stats и аналитика
    GET /stats/habits/{id}/streaks — возвращает {current_streak, longest_streak, last_entry_date}
    GET /stats/habits/{id}/calendar?year=2025&month=10 — календарь выполнения за месяц (дни с отметками)
    GET /stats/user/summary — сводка: {total_habits, completed_today, total_streaks, goals_progress}
