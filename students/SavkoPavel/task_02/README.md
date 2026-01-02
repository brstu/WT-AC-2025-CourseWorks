# Incident Management System (Variant 26)

Вариант 26 — Инциденты «Сломалось — чиним».

## Запуск

1. Скопируйте `.env.example` → `.env` (при необходимости измените значения).
2. Запустите стек:

`docker-compose up --build`

Сервисы:
- API: http://localhost:3000
- Web (Vite): http://localhost:5173
- Healthcheck: http://localhost:3000/health

## Swagger / OpenAPI (bonus)

- Swagger UI: http://localhost:3000/docs
- OpenAPI JSON: http://localhost:3000/openapi.json

Также есть коллекция запросов для VS Code REST Client: `docs/api.http`.

Примечание: Postgres порт наружу не пробрасывается (чтобы не конфликтовать с уже запущенной БД на хосте).

При старте API автоматически применяет миграции Prisma (`prisma migrate deploy`).

Также при старте API автоматически создаёт дефолтную очередь и SLA (чтобы `USER` мог сразу создавать инциденты):
- Queue: `General`
- SLA: reaction `30` мин, resolution `240` мин

Можно переопределить через env:
- `SEED_DEFAULT_QUEUE_NAME`
- `SEED_DEFAULT_SLA_REACTION_MINUTES`
- `SEED_DEFAULT_SLA_RESOLUTION_MINUTES`

## Важно про роли

- При первой регистрации (когда в БД ещё нет пользователей) первый пользователь автоматически становится `ADMIN`.
- Все последующие регистрации создают пользователей с ролью `USER`.
- `ADMIN` может создавать пользователей с ролью `AGENT` через `POST /users`.

Также можно зафиксировать admin-учётку через env (удобно, если БД уже не пустая):
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## SLA / эскалация (MVP)

На сервере запущен воркер эскалации SLA (период задаётся `SLA_CHECK_INTERVAL_SECONDS`, по умолчанию 60 секунд):
- если инцидент в статусе `open` и превышено `reactionTimeMinutes` → приоритет поднимается до `high` (идемпотентно)
- если инцидент не `resolved` и превышено `resolutionTimeMinutes` → статус становится `escalated`, приоритет `critical`

## API (MVP)

### Auth

- `POST /auth/register` `{ email, password }`
- `POST /auth/login` `{ email, password }` → `{ token }`

Пример логина в PowerShell (чтобы не ловить ошибки парсинга JSON из-за кавычек/экранирования):

```powershell
$body = @{ email = 'admin@test.local'; password = 'password123' } | ConvertTo-Json
$resp = Invoke-RestMethod -Method Post -Uri http://localhost:3000/auth/login -ContentType 'application/json' -Body $body
$token = $resp.data.token
```

### Users (ADMIN)

- `GET /users/me` (любой авторизованный пользователь)
- `GET /users`
- `GET /users/:id`
- `POST /users` `{ email, password, role }`
- `PUT /users/:id` `{ email?, role? }`
- `PATCH /users/:id/role` `{ role }`
- `DELETE /users/:id`

### Queues

- `GET /queues` (ADMIN, USER, AGENT)
- `GET /queues/:id` (ADMIN, USER, AGENT)
- `POST /queues` (ADMIN)
- `PUT /queues/:id` (ADMIN)
- `DELETE /queues/:id` (ADMIN)

#### Agent ↔ Queue (membership)

AGENT видит только те очереди и инциденты, где он назначен в участники очереди.

Управление участниками очереди (только ADMIN):
- `GET /queues/:id/agents`
- `POST /queues/:id/agents` `{ userId }` (user должен иметь роль `AGENT`)
- `DELETE /queues/:id/agents/:userId`

### SLA

- `GET /sla` (ADMIN, AGENT)
- `GET /sla/:id` (ADMIN, AGENT)
- `POST /sla` (ADMIN) `{ queueId, reactionTimeMinutes, resolutionTimeMinutes }`
- `PUT /sla/:id` (ADMIN)

### Incidents

- `GET /incidents` (ADMIN/AGENT — все, USER — только свои)
  - фильтры: `status`, `priority`, `queueId`, `limit`, `offset`
- `POST /incidents` (ADMIN, USER) `{ title, description, priority?, queueId? }`
  - если `queueId` не задан, берётся первая очередь, где есть SLA
  - SLA берётся из очереди (если у очереди нет SLA → ошибка)
- `GET /incidents/:id` (доступ по ролям)
- `PUT /incidents/:id` (ADMIN/AGENT) `{ status?, priority?, take? }`
  - для AGENT: `take: true` назначает инцидент на себя и ставит `in_progress`
- `PATCH /incidents/:id`
  - USER: может менять только свой инцидент и только `{ title?, description?, priority? }`
  - ADMIN: может менять `{ title?, description?, status?, priority?, assignedToId? }`
  - AGENT: может менять `{ status?, priority?, take? }`
- `DELETE /incidents/:id` (только ADMIN)

### Comments

- `GET /incidents/:id/comments`
- `POST /incidents/:id/comments` `{ message }`

## Структура сервера

Сервер разбит на модули (routes/controller/service):
- `apps/server/src/modules/auth`
- `apps/server/src/modules/users`
- `apps/server/src/modules/queues`
- `apps/server/src/modules/sla`
- `apps/server/src/modules/incidents`

Воркер SLA: `apps/server/src/workers/slaEscalation.worker.ts`

## Тесты (bonus)

Интеграционные тесты сервера запускаются в Docker (поднимается отдельная test-БД, без проброса порта):

`docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit`

После завершения:

`docker-compose -f docker-compose.test.yml down -v`
