# Вариант 39 — «Список дел»  — R1 Data Model & API

Питч: дедлайны догонят — успей раньше.

**MVP:** задачи, подзадачи, календарь, файлы, теги, напоминания.  
**API:** `/tasks`, `/subtasks`, `/calendar`, `/files`, `/tags`.  
**Данные:** `Task`, `SubTask`, `Tag`, `File`, `Reminder`, `User`.  
**Приёмка (MVP):** повторяющиеся задачи.

---

## 1 Сущности

### User

- `id`: int/uuid
- `username`: string (unique, 3–50)
- `email`: string (unique, email)
- `password_hash`: string
- `role`: enum (`user`, `admin`)
- `created_at`: datetime

### Task

- `id`: int/uuid
- `owner_id`: FK → `User.id`
- `title`: string (1–200)
- `description`: string (0–5000, optional)
- `is_done`: boolean
- `due_at`: datetime (optional)
- `repeat_interval_minutes`: int (optional, `>= 1`)
- `created_at`: datetime
- `updated_at`: datetime

### SubTask

- `id`: int/uuid
- `task_id`: FK → `Task.id`
- `title`: string (1–200)
- `is_done`: boolean
- `created_at`: datetime

### Tag

- `id`: int/uuid
- `owner_id`: FK → `User.id`
- `name`: string (1–32, unique per user)
- `color`: string (optional, hex `#RRGGBB`)
- `created_at`: datetime

### TaskTag (M:N)

- `task_id`: FK → `Task.id`
- `tag_id`: FK → `Tag.id`
- `unique(task_id, tag_id)`

### File

- `id`: int/uuid
- `task_id`: FK → `Task.id`
- `filename`: string (safe name)
- `mime_type`: string
- `size_bytes`: int
- `storage_path`: string (server generated)
- `uploaded_at`: datetime

### Reminder

- `id`: int/uuid
- `task_id`: FK → `Task.id`
- `remind_at`: datetime
- `message`: string (1–200)
- `created_at`: datetime

---

## 2 Общие принципы API

- Auth: `Authorization: Bearer <jwt>`
- Пагинация: `limit`, `offset` (по умолчанию `limit=50`)
- Ошибки: `4xx/5xx` + `detail` (человекочитаемое сообщение)
- Scope: `user` работает только с ресурсами владельца

---

## 3 Auth

### POST `/register`

```json
{
  "username": "anton",
  "email": "anton@example.com",
  "password": "secret123"
}
````

### POST `/login`

```json
{
  "email": "anton@example.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "access_token": "jwt...",
  "token_type": "bearer"
}
```

### GET `/profile`

**Response:**

```json
{
  "id": 1,
  "username": "anton",
  "email": "anton@example.com",
  "role": "user"
}
```

---

## 4 Tasks

### GET `/tasks`

Параметры: `limit`, `offset`, `q`, `is_done`, `tag`, `due_from`, `due_to`.

### POST `/tasks` (создание + подзадачи + теги)

```json
{
  "title": "Подготовить R1",
  "description": "Документы по спринту",
  "due_at": "2026-01-12T18:00:00",
  "repeat_interval_minutes": null,
  "subtasks": [
    { "title": "R1_ERD" },
    { "title": "R1_WBS" }
  ],
  "tags": ["учёба", "срочно"]
}
```

**Правило по тегам:** если `tags[]` содержит новые имена, сервер создаёт их для пользователя и привязывает к задаче.

### GET `/tasks/{id}`

### PUT `/tasks/{id}`

### DELETE `/tasks/{id}`

### POST `/tasks/{id}/generate-next`

Создаёт следующую задачу для повторяющейся (`repeat_interval_minutes`).

---

## 5 Subtasks

* GET `/tasks/{id}/subtasks`
* POST `/tasks/{id}/subtasks`
* PUT `/subtasks/{id}`
* DELETE `/subtasks/{id}`

---

## 6 Tags

* GET `/tags`
* POST `/tags`
* PUT `/tags/{id}`
* DELETE `/tags/{id}`

---

## 7 Files

* POST `/tasks/{id}/files` (multipart/form-data, поле `file`)
* GET `/tasks/{id}/files`
* GET `/files/{id}` (download)
* DELETE `/files/{id}`

---

## 8 Reminders

* GET `/tasks/{id}/reminders`
* POST `/tasks/{id}/reminders`
* DELETE `/reminders/{id}`

---

## 9 Calendar

### GET `/calendar`

Параметры: `from=YYYY-MM-DD`, `to=YYYY-MM-DD`, `tag` (optional).
Возвращает задачи с `due_at` в диапазоне; группировка по дням — на клиенте.

---

## 10 NLU (заглушка)

### POST `/tasks/nlu`

```json
{
  "text": "завтра 18:00 купить молоко #дом"
}
```

**Response (пример):**

```json
{
  "title": "купить молоко",
  "due_at": "2026-01-10T18:00:00",
  "tags": ["дом"],
  "subtasks": []
}
```
