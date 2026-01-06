# Backend (Express + Prisma)

API для Pomodoro: JWT (access/refresh), роли `user`/`admin`, PostgreSQL через Prisma.

## Что реализовано

- Модели: User, Task, Tag, Session, Settings
- JWT: access (Authorization: Bearer) + refresh (HttpOnly cookie, rotation)
- Роли и права: user (свои данные), admin (расширенный доступ)
- Валидация Zod, bcrypt, helmet, cors (credentials: true, origin из `FRONTEND_ORIGIN`)

## Требования

- Node.js 18+
- PostgreSQL

## Установка и запуск

1. Установить зависимости:

```bash
npm install
```

1. Настроить окружение:

```bash
cp .env.example .env
# заполнить DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, FRONTEND_ORIGIN
```

1. Миграции и Prisma Client:

```bash
npm run prisma:migrate
npm run prisma:generate
```

1. Запуск backend (отдельно):

```bash
npm run dev
# порт: 4000 (по умолчанию)
```

1. Seed (dev):

```bash
npm run seed
```

Dev-пользователи:

- <admin@example.com> / Admin123!
- <alice@example.com> / User123!
- <bob@example.com> / User123!

## Примеры curl (PowerShell)

```powershell
# Register
curl.exe -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test123!\",\"name\":\"Test\"}"

# Login (получить access, refresh cookie -> cookies.txt)
curl.exe -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"alice@example.com\",\"password\":\"User123!\"}" -c cookies.txt

# Сохранить access
$token = (curl.exe -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"alice@example.com\",\"password\":\"User123!\"}" -c cookies.txt | ConvertFrom-Json).data.accessToken

# Защищённый запрос
curl.exe http://localhost:4000/users/me -H "Authorization: Bearer $token"

# Refresh (rotation, HttpOnly cookie)
curl.exe -X POST http://localhost:4000/auth/refresh -b cookies.txt -c cookies.txt

# Logout (очистит refresh cookie)
curl.exe -X POST http://localhost:4000/auth/logout -b cookies.txt -c cookies.txt

# Создание задачи
curl.exe -X POST http://localhost:4000/tasks -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "{\"title\":\"New task\",\"priority\":\"medium\"}"

# Список задач
curl.exe http://localhost:4000/tasks?limit=10 -H "Authorization: Bearer $token"
```

## Полезное

- Prisma Studio: `npm run prisma:studio`
- CORS: `origin = FRONTEND_ORIGIN`, `credentials = true` — для работы HttpOnly refresh cookie
- Доступ к API: access token в `Authorization: Bearer`, refresh вращается на каждом `/auth/refresh` (reuse → 401)

## Основные эндпоинты

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Users: `GET /users/me`
- Tasks: `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id`
- Tags: `GET/POST /tags`, `PUT/DELETE /tags/:id`
- Sessions: `GET/POST /sessions`, `PUT /sessions/:id`, `PATCH /sessions/:id/pause`, `PATCH /sessions/:id/resume`, `DELETE /sessions/:id`
- Reports: `GET /reports/daily`, `GET /reports/weekly`, `GET /reports/monthly`, `GET /reports/by-tag`, `GET /reports/export`
- Settings: `GET /settings/notifications`, `PUT /settings/notifications`
- Health: `GET /health`
