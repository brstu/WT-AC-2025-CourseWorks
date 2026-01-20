# Вариант 17 — Доставка «Где моя посылка?» — Модель данных и API

## 1) Сущности (MVP)

- User — пользователь системы (user/admin)
- Country / City — справочники географии
- Location — логистическая точка (склад, сорт-центр, ПВЗ…); в терминах варианта — «Address»
- Order — заказ/посылка
- Event — событие трекинга (TrackingEvent)

## 2) Статусы

### Order Status (OS) — `Order.status`

- 0 — created
- 1 — shipped
- 2 — delivered
- 3 — at_pickup_point
- 5 — returned

### Event Status (ES) — `Event.status`

- 0 — created
- 1 — shipped
- 2 — in_transit
- 3 — out_for_delivery
- 4 — delivered
- 5 — at_pickup_point
- 6 — returned

> В текущей реализации при создании заказа автоматически создаётся первое событие `ES=0 created`.

## 3) Связи

- User 1 → * Order (по `Order.userId`)
- Order 1 → * Event (по `Event.orderId`)
- Country 1 → * City (по `City.countryId`)
- City 1 → * Location (по `Location.cityId`)
- Location используется в:
  - `Order.pickupLocation` и `Order.currentLocation`
  - `Event.location`

## 4) Общий формат ответов

API возвращает JSON с полями:

- `status`: `'ok' | 'error'`
- `code`: HTTP code
- `message?`: строка ошибки (только при error)

Дополнительно:

- для списков: `page, limit, total, pages, data: []`
- для сущности: `user | country | city | location | order | event`
- для трекинга: `order` + `events`

## 5) Client API (публичные/пользовательские)

### 5.1 Health

- `GET /api/health`

### 5.2 User

- `POST /api/user/signup`
  - body: `{ email, password, firstname }`
  - response: `{ status, code, user }` + set cookie `jwt`

- `POST /api/user/signin`
  - body: `{ email, password }`
  - response: `{ status, code, user }` + set cookie `jwt`

- `GET /api/user/profile` (auth: cookie `jwt`)
  - response: `{ status, code, user }`

### 5.3 My Orders

- `GET /api/orders/my` (auth: cookie `jwt`)

Query params:

- `page` (default 1)
- `limit` (default 20, max 100)
- `sort` (default `-createdAt`)
- `search` (по `name` или `orderCode`)

Response:

```json
{
  "status": "ok",
  "code": 200,
  "page": 1,
  "limit": 20,
  "total": 2,
  "pages": 1,
  "data": [
    {
      "_id": "...",
      "name": "Phone",
      "orderCode": "ORD-AB12CD34",
      "status": 1,
      "pickupLocation": { "label": "Warsaw Hub", "locationCode": "PL-WAW-HB1", "cityId": { "name": "Warsaw", "countryId": { "name": "Poland" } } },
      "currentLocation": { "label": "Berlin Sort", "locationCode": "DE-BER-SC1", "cityId": { "name": "Berlin", "countryId": { "name": "Germany" } } }
    }
  ]
}
```

### 5.4 Public Tracking (приёмка MVP)

- `GET /api/tracking/:code`

Response (упрощённо):

```json
{
  "status": "ok",
  "code": 200,
  "order": {
    "_id": "...",
    "name": "Phone",
    "orderCode": "ORD-AB12CD34",
    "status": 2,
    "pickupLocation": { "label": "Warsaw Hub", "locationCode": "PL-WAW-HB1", "cityId": { "name": "Warsaw", "countryId": { "name": "Poland" } } },
    "currentLocation": { "label": "Warsaw Hub", "locationCode": "PL-WAW-HB1", "cityId": { "name": "Warsaw", "countryId": { "name": "Poland" } } }
  },
  "events": [
    {
      "_id": "...",
      "orderId": "...",
      "status": 0,
      "description": "",
      "location": { "label": "Warsaw Hub", "locationCode": "PL-WAW-HB1", "cityId": { "name": "Warsaw", "countryId": { "name": "Poland" } } },
      "createdAt": "2026-01-20T00:00:00.000Z"
    }
  ]
}
```

Ошибки:

- если код пустой/не найден: `400 { status:'error', message:'This order was not found!' }`

## 6) Admin API

> Все `/api/admin/*` требуют cookie `jwt` + роль `admin`.

### 6.1 Admin Signin

- `POST /api/admin/signin`
  - body: `{ email, password }`
  - response: `{ status, code, user }` + set cookie `jwt`

### 6.2 Users (admin)

- `GET /api/admin/users?page&limit&sort&search` → paged list (`data: users[]`)
- `GET /api/admin/users/:id` → `{ user }`
- `POST /api/admin/users` → `{ user }`
- `PATCH /api/admin/users/:id` → `{ user }`
- `DELETE /api/admin/users/:id` → `{ user }`
- `POST /api/admin/users/:id/reset-password` → `{ user }`

### 6.3 Countries / Cities / Locations (admin)

- `GET /api/admin/country` (paged), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
- `GET /api/admin/city` (paged), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`
- `GET /api/admin/location` (paged), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`

### 6.4 Orders (admin)

- `POST /api/admin/order`
  - body: `{ name, userId, pickupLocation, currentLocation? }`
  - response: `{ order, events:[firstEvent] }`

- `GET /api/admin/order?page&limit&sort&search&status&userId&pickupLocation&currentLocation` → paged list
- `GET /api/admin/order/:id` → `{ order, events }`
- `PATCH /api/admin/order/:id` → `{ order }`
- `DELETE /api/admin/order/:id` → `{ order, deletedEventsCount }`

#### Events nested under Order (admin)

- `POST /api/admin/order/:oid/event`
  - body: `{ location, status, description? }`
  - response: `{ order, event }` (Order синхронизируется с новым событием)

- `GET /api/admin/order/:oid/event` → `{ events }`
- `GET /api/admin/order/:oid/event/:id` → `{ event }`
- `PATCH /api/admin/order/:oid/event/:id` → `{ event, order }` (Order пересчитывается по последнему событию)
- `DELETE /api/admin/order/:oid/event/:id` → `{ event, order }` (Order пересчитывается по последнему событию)

## 7) Бонусы (если успеваешь)

- Webhooks: POST в сторонний URL на каждое новое событие
- Уведомления: email/telegram/push по триггерам (например `at_pickup_point`)
- Карта: расширить Location координатами (lat/lng) и рисовать путь по events
- Документация: OpenAPI/Swagger
- Тесты: unit на генерацию кода + интеграционные на трекинг
- CI/CD + Docker + Kubernetes
