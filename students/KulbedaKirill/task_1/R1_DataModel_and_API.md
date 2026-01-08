# Вариант 34 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User

  - id: ObjectId
  - firstname: string (required)
  - lastname: string (required)
  - email: string (required)
  - password: string (required)
  - role: string (required) — enum [admin, agent, user]

- Agent

  - id: ObjectId
  - user_id: ObjectId → User.id (required, unique)
  - level: string (required, lowercase, default: 'junior') — enum [junior, middle, senior, lead]
  - capacity: number (default: 5)

- Queue

  - id: ObjectId
  - title: string (required)

- Ticket

  - id: ObjectId
  - queue_id: ObjectId → Queue.id (required)
  - title: string (required)
  - user_id: ObjectId → User.id (required)
  - agent_id: ObjectId → Agent.id (optional, default: null)
  - isClose: boolean (default: false)
  - messages: Message[] (embedded)
  - created_at: datetime (auto)
  - updated_at: datetime (auto)

- Message (embedded в Ticket.messages)

  - from: string (required) — enum [user, agent]
  - text: string (required, trim)
  - created_at: datetime (auto)
  - updated_at: datetime (auto)

- Rating

  - id: ObjectId
  - ticket_id: ObjectId → Ticket.id (required)
  - agent_id: ObjectId → Agent.id (required)
  - user_id: ObjectId → User.id (required)
  - score: number (required, 1..5)
  - comment: string (optional, max: 500, default: '')
  - created_at: datetime (auto)
  - updated_at: datetime (auto)

API — верхнеуровневые ресурсы и операции

- /admin

  - GET /users (admin)
  - POST /users (admin)
  - PATCH /users/{id} (admin)
  - DELETE /users/{id} (admin)

  - GET /agents (admin)
  - POST /agents (admin)
  - PATCH /agents/{id} (admin)
  - DELETE /agents/{id} (admin)

  - GET /queue (admin)
  - POST /queue (admin)
  - PATCH /queue/{id} (admin)
  - DELETE /queue/{id} (admin)

- /agent

  - GET /
  - GET /tickets/
  - POST /tickets/{id}/claim
  - POST /tickets/{id}/close

- /queues

  - GET /

- /rating

  - POST /

- /tickets

  - POST /{id}/messages/
  - GET /{id}/rating/
  - GET /{id}/stream/

- /user

  - POST /login
  - POST /register
  - GET /tickets
  - POST /tickets

---

## Подробные операции API, схемы и поведение

Общие принципы

- Ответы в формате: `{ "status": "ok" | "error", "data"?: ..., "message"?: {code, message, fields?} }`
- Аутентификация: `Authorization: Bearer <jwt>`; роли: `admin`, `user`, `agent`.

Примеры ошибок (JSON)

```json
{
  "status": "ok",
  "data": {
    "_id": "68f4e53fcddae647b319bee4",
    "title": "queue 1",
    "__v": 0
  }
}
```

Auth

- POST `/user/login` — `{email, password}` → `201 {token, firstname, lastname, role, email}`
- POST `/user/register` — `{email, password, firstname, lastname}` → `201 {token, firstname, lastname, role, email}`

Users

- GET `/admin/users?page=&limit=` — Admin
- GET `/admin/users/{id}` — Admin или self
- POST `/admin/users` — Admin (payload: `{firstname,email,password,lastname}`)
- PATCH `/admin/users/{id}` — Admin или self (частичное обновление)
- DELETE `/admin/users/{id}` — Admin

Agent

- GET `/admin/agents?page=&limit=` — Admin
- GET `/admin/agents/{id}` — Admin или self
- POST `/admin/agents` — Admin (payload: `{firstname, lastname, email, password, level, capacity}`)
- PATCH `/admin/agents/{id}` — Admin или self (частичное обновление)
- DELETE `/admin/agents/{id}` — Admin

Readings (ingest и чтение)

- GET `/queus` — загрузка очередей

  - Payload (пример):

  ```json
  [
    {
      "_id": "68f4e53fcddae647b319bee4",
      "title": "queue 1",
      "__v": 0
    },
    {
      "_id": "68f4e543cddae647b319bee8",
      "title": "queue 2",
      "__v": 0
    },
    {
      "_id": "68f4e545cddae647b319beec",
      "title": "queue 3",
      "__v": 0
    }
  ]
  ```

  - Response: `200`

Tickets (заявки)

- POST `/tickets` — создать Тикет

  ```json
  { "title": "Test", "queue": "68f4e543cddae647b319bee8", "message": "Test" }
  ```

- GET `/tickets`
- GET `/tickets/{id}` — карточка тикета

---

## ERD (диаграмма сущностей)

Mermaid-диаграмма (если рендер поддерживается):

```
erDiagram
    USER ||--o| AGENT : "has 0..1"
    USER ||--o{ TICKET : "creates"
    AGENT ||--o{ TICKET : "assigned_to"
    QUEUE ||--o{ TICKET : "routes"
    TICKET ||--o{ MESSAGE : "has (embedded)"
    USER ||--o{ RATING : "writes"
    AGENT ||--o{ RATING : "receives"
    TICKET ||--o{ RATING : "for"

    USER {
      ObjectId _id PK
      string firstname
      string lastname
      string email
      string password
      string role "admin|agent|user"
    }

    AGENT {
      ObjectId _id PK
      ObjectId user FK "-> USER._id (unique)"
      string level "junior|middle|senior|lead"
      number capacity "default=5"
    }

    QUEUE {
      ObjectId _id PK
      string title
    }

    TICKET {
      ObjectId _id PK
      ObjectId queue FK "-> QUEUE._id"
      string title
      ObjectId user FK "-> USER._id"
      ObjectId agent FK "-> AGENT._id (nullable)"
      boolean isClose "default=false"
      [MESSAGE] messages "embedded subdocs"
      createdAt datetime
      updatedAt datetime
    }

    MESSAGE {
      string from "enum: user|agent"
      string text
      createdAt datetime
      updatedAt datetime
    }

    RATING {
      ObjectId _id PK
      ObjectId ticket FK "-> TICKET._id"
      ObjectId agent  FK "-> AGENT._id"
      ObjectId user   FK "-> USER._id"
      number score "1..5"
      string comment "≤500, optional"
      createdAt datetime
      updatedAt datetime
    }

```

```
User 1---0..1 Agent
 |  \                 \
 |   \                 * Ratings -> Agent
 *----* Tickets -------^
        | (in Queue)
        * Messages (embedded)
```

---

AC — критерии приёмки для функционала Alerts (MVP)

- AC1: При ingest Reading, если правило превышено, создаётся запись в `/alerts` со статусом `new` и привязкой к `readingId`.
- AC2: GET `/alerts?deviceId=` возвращает алерты только для устройств, которыми владеет запрашивающий пользователь (scope).
- AC3: POST `/alerts/{id}/ack` переводит состояние в `acknowledged` и добавляет запись в audit log (кто и когда).
