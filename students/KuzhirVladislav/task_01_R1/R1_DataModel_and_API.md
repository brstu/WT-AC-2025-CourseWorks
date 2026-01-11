# Вариант 06 — Мини-CRM «Фриланс без паники» — Ключевые сущности, связи и API

## Сущности (основные)

### User

- `id: Long` (PK, auto-increment)
- `username: String` (unique, required)
- `email: String` (required)
- `password: String` (hashed, required)
- `roles: String` (default: "ROLE_USER", enum: [ROLE_USER, ROLE_ADMIN])

### Client

- `id: Long` (PK)
- `name: String` (required) → ошибка: "Введите название клиента"
- `email: String` (required) → ошибка: "Введите email"
- `phone: String` (optional)
- `user_id: Long` (FK → User.id, required)

### Deal

- `id: Long` (PK)
- `title: String` (required) → ошибка: "Введите название сделки"
- `amount: BigDecimal` (optional) → для суммы проекта
- `description: String` (optional)
- `client_id: Long` (FK → Client.id, required)
- `stage_id: Long` (FK → Stage.id, required)
- `user_id: Long` (FK → User.id, required)

### Stage

- `id: Long` (PK)
- `name: String` (required, example: "Лид", "Предложение", "Договор", "Счёт", "Закрыто")
- `stageOrder: Integer` (порядок в воронке, example: 1,2,3,4,5)
- `user_id: Long` (FK → User.id, optional) — для пользовательских этапов

### Task

- `id: Long` (PK)
- `title: String` (required) → ошибка: "Введите название задачи"
- `description: String` (optional)
- `dueDate: LocalDateTime` (required) → ошибка: "Выберите дату"
- `completed: Boolean` (default: false)
- `deal_id: Long` (FK → Deal.id, required)
- `user_id: Long` (FK → User.id, required) — исполнитель

### Invoice

- `id: Long` (PK)
- `number: String` (required, unique, example: "INV-001") → ошибка: "Введите номер счета"
- `amount: Double` (required) → ошибка: "Введите сумму"
- `status: String` (enum: ["draft", "sent", "paid"], default: "draft")
- `issueDate: LocalDateTime` (required)
- `deal_id: Long` (FK → Deal.id, required)
- `user_id: Long` (FK → User.id, required)

---

## Связи (Entity Relationship)

- User 1---\* Client (пользователь создаёт клиентов)
- User \*---\* Deal (пользователь создаёт сделки)
- Deal \*---\* Task (сделка имеет задачи)
- Deal \*---\* Invoice (сделка имеет счета)
- Client 1---\* Deal (клиент имеет сделки)
- Stage 1---\* Deal (этап содержит сделки)

## Обязательные поля и ограничения

- `unique(User.username)` — имя пользователя уникально
- `unique(Client.email)` — email клиента уникален
- `unique(Invoice.number)` — номер счета уникален
- `Client.user_id` → User.id (FK, not null)
- `Deal.client_id` → Client.id (FK, not null)
- `Deal.stage_id` → Stage.id (FK, not null)
- `Deal.user_id` → User.id (FK, not null)
- `Task.deal_id` → Deal.id (FK, not null, cascade delete)
- `Task.user_id` → User.id (FK, not null)
- `Invoice.deal_id` → Deal.id (FK, not null, cascade delete)
- `Invoice.user_id` → User.id (FK, not null)

---

## API — Ресурсы и операции

### Auth

- `POST /auth/register` — `{username, email, password}` → `201 {id, username, email, roles}`
- `POST /auth/login` — `{email, password}` → `200 {token, user}`

### Users (Admin only)

- `GET /api/v1/users` — список всех пользователей
- `GET /api/v1/users/{id}` — деталь пользователя
- `POST /api/v1/users` — создать пользователя
- `PUT /api/v1/users/{id}` — редактировать пользователя
- `DELETE /api/v1/users/{id}` — удалить пользователя

### Clients

- `GET /api/v1/clients?search=` — список клиентов (с поиском по имени)
- `GET /api/v1/clients/{id}` — детали клиента
- `POST /api/v1/clients` — создать клиента (payload: `{name, email, phone}`)
- `PUT /api/v1/clients/{id}` — редактировать клиента
- `DELETE /api/v1/clients/{id}` — удалить клиента
- `GET /api/v1/clients/{id}/count-related` — количество связанных сделок, задач, счетов

### Deals

- `GET /api/v1/deals?search=` — список сделок (с фильтром по названию)
- `GET /api/v1/deals/{id}` — детали сделки (включает: client, stage, tasks, invoices)
- `POST /api/v1/deals` — создать сделку (payload: `{title, amount, description, clientId, stageId}`)
- `PUT /api/v1/deals/{id}` — редактировать сделку
- `DELETE /api/v1/deals/{id}` — удалить сделку
- `GET /api/v1/deals/{id}/count-related` — количество задач и счетов

### Stages

- `GET /api/v1/stages` — список всех этапов (отсортирован по stageOrder)
- `GET /api/v1/stages/{id}` — детали этапа
- `POST /api/v1/stages` — создать этап (payload: `{name, stageOrder}`, только Admin)
- `PUT /api/v1/stages/{id}` — редактировать этап (только Admin)
- `DELETE /api/v1/stages/{id}` — удалить этап (только Admin)

### Tasks

- `GET /api/v1/tasks` — список задач
- `GET /api/v1/tasks/{id}` — детали задачи
- `POST /api/v1/tasks` — создать задачу (payload: `{title, description, dueDate, dealId, userId}`)
- `PUT /api/v1/tasks/{id}` — редактировать задачу (включая toggle completed)
- `DELETE /api/v1/tasks/{id}` — удалить задачу

### Invoices

- `GET /api/v1/invoices?status=` — список счетов (фильтр по статусу)
- `GET /api/v1/invoices/{id}` — детали счета
- `POST /api/v1/invoices` — создать счет (payload: `{number, amount, issueDate, dealId}`)
- `PUT /api/v1/invoices/{id}` — редактировать счет (только Draft) или менять статус
- `DELETE /api/v1/invoices/{id}` — удалить счет (только Draft)

---

## Примеры запросов и ответов

### Создание клиента

```http
POST /api/v1/clients
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "ООО Рога и Копыта",
  "email": "info@example.com",
  "phone": "+7-900-123-45-67"
}

// Response 201:
{
  "id": 1,
  "name": "ООО Рога и Копыта",
  "email": "info@example.com",
  "phone": "+7-900-123-45-67",
  "userId": 42,
  "createdAt": "2025-01-10T15:30:00Z"
}
```

### Создание сделки

```http
POST /api/v1/deals
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Разработка сайта",
  "amount": 50000,
  "description": "Лендинг из 5 страниц",
  "clientId": 1,
  "stageId": 1
}

// Response 201:
{
  "id": 1,
  "title": "Разработка сайта",
  "amount": 50000.00,
  "description": "Лендинг из 5 страниц",
  "clientId": 1,
  "stageId": 1,
  "userId": 42,
  "client": { "id": 1, "name": "ООО Рога и Копыта" },
  "stage": { "id": 1, "name": "Лид", "stageOrder": 1 },
  "createdAt": "2025-01-10T15:30:00Z"
}
```

### Обновление статуса сделки (переместить на другой этап)

```http
PUT /api/v1/deals/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "stageId": 2  // переместить на следующий этап
}

// Response 200: {id, title, stageId: 2, ...}
```

### Создание счета

```http
POST /api/v1/invoices
Content-Type: application/json
Authorization: Bearer <token>

{
  "number": "INV-001",
  "amount": 50000,
  "issueDate": "2025-01-10T15:30:00Z",
  "dealId": 1
}

// Response 201:
{
  "id": 1,
  "number": "INV-001",
  "amount": 50000,
  "status": "draft",
  "issueDate": "2025-01-10T15:30:00Z",
  "dealId": 1,
  "userId": 42
}
```

### Обновление статуса счета

```http
PUT /api/v1/invoices/1
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "sent"  // draft → sent → paid
}

// Response 200: {id, number, status: "sent", ...}
```

---

## Общие принципы API

- **Формат ответа**: стандартный REST (HTTP статусы 200, 201, 400, 403, 404, 500)
- **Аутентификация**: `Authorization: Bearer <JWT token>`
- **Пагинация**: `?limit=20&offset=0` (где необходимо)
- **Фильтрация**: `?search=` для текстового поиска, `?status=` для фильтра по статусу
- **Сортировка**: по умолчанию по дате создания (desc)
- **Scope**: User видит только свои данные; Admin видит все

---

## Бонусы (опционально)

- WebSocket `/ws/deals` — события обновления сделок в реальном времени
- Документация API (OpenAPI/Swagger) — доступна на `/swagger-ui.html`
- Тесты: unit + интеграционные для всех сервисов
- Docker контейнеризация (доступна)
- CI/CD pipeline (GitHub Actions)
