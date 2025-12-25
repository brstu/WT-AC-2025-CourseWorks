# Backend (Room Booking MVP)

## Требования

- Node.js 18+
- PostgreSQL

## Установка

```bash
npm install
```

## Настройка окружения

1. Скопируйте `.env.example` → `.env`
2. Заполните переменные:
   - `DATABASE_URL`
   - `CORS_ORIGIN`
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`

## Миграции

```bash
# генерация клиента
npm run prisma:generate -w backend
# создание миграции (нужна доступность БД)
npm run prisma:migrate -w backend
# seed данные
npm run prisma:seed -w backend
# Prisma Studio (просмотр данных)
npm run prisma:studio -w backend
```

## Запуск

```bash
npm run dev -w backend
```

## Seed данные для разработки

### Тестовые пользователи (dev-only)

- admin: `admin@example.com` / `Admin123!`
- teacher: `teacher@example.com` / `Teacher123!`
- student: `student@example.com` / `Student123!`

### Примеры запросов (PowerShell)

> Замените `<ACCESS>` на выданный access token. Refresh cookie ставится автоматически при `/auth/login`/`/auth/register`.

Логин (получить access + refresh cookie):

```powershell
curl -Method POST "http://localhost:3001/auth/login" -ContentType "application/json" -Body '{"email":"admin@example.com","password":"Admin123!"}' -UseBasicParsing -SessionVariable sess
```

Refresh (использует refresh cookie из сессии):

```powershell
curl -Method POST "http://localhost:3001/auth/refresh" -WebSession $sess -UseBasicParsing
```

Logout (очистить refresh):

```powershell
curl -Method POST "http://localhost:3001/auth/logout" -WebSession $sess -UseBasicParsing
```

Получить себя (`/users/me`) с access:

```powershell
curl -Method GET "http://localhost:3001/users/me" -Headers @{ "Authorization" = "Bearer <ACCESS>" } -UseBasicParsing
```

Создать бронирование (нужно access, student/teacher/admin):

```powershell
curl -Method POST "http://localhost:3001/bookings" -Headers @{ "Authorization" = "Bearer <ACCESS>" } -ContentType "application/json" -Body '{"roomId":"<room-id>","startTime":"2025-01-20T10:00:00Z","endTime":"2025-01-20T11:30:00Z","purpose":"Meeting"}' -UseBasicParsing
```

## Эндпоинты

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET  /users/me` (Bearer access token)
- `GET  /health`
- `GET  /rooms` (публично), `GET /rooms/:id`, `POST/PUT/DELETE /rooms` (admin)
- `GET  /bookings` (только свои, admin — все), `POST /bookings`, `PUT /bookings/:id`, `DELETE /bookings/:id`
- `GET  /schedule` и `GET /schedule/conflicts` (публично)
- `GET  /statistics/rooms/:id` (admin/teacher), `GET /statistics/users/:id` (admin/self)

## JWT и куки

- Access token: Bearer в `Authorization`
- Refresh token: HttpOnly cookie `refreshToken` (`sameSite=lax`, `secure` в production)
- Ротация refresh: при `/auth/refresh` старый токен отзывается, новый записывается в БД
- Все бизнес-эндпоинты принимают ТОЛЬКО access token в Authorization. Refresh используется только в `/auth/refresh`.

## Проверка

- Health: `curl http://localhost:3001/health`
