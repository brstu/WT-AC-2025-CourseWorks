# Backend (Express + Prisma)

## Требования

- Node.js 18+
- PostgreSQL доступен и прописан в `DATABASE_URL`

## Установка

```bash
npm install
```

## Переменные окружения

Скопируйте `.env.example` → `.env` и заполните:

- `PORT` — порт сервера (по умолчанию 3000)
- `DATABASE_URL` — строка подключения PostgreSQL
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — секреты для токенов
- `JWT_ACCESS_TTL` (например `15m`), `JWT_REFRESH_TTL` (например `7d`)
- `CORS_ORIGIN` — origin фронтенда
- `COOKIE_DOMAIN` — домен для cookie (в dev можно оставить `localhost`)

## Prisma

```bash
npm run prisma:generate -w backend
npm run prisma:migrate -w backend
npm run prisma:studio -w backend

```

## Запуск

```bash
npm run dev:backend
```

## Проверка

- Healthcheck: GET <http://localhost:3000/health>
- Auth:
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
  - GET /users/me (Bearer access token)
- Бизнес-API (Bearer access token):
  - /companies (CRUD)
  - /jobs (CRUD)
  - /stages (CRUD, по jobId)
  - /notes (CRUD, по jobId)
  - /reminders (CRUD, фильтры completed/from/to)
  - /kanban (стадии с вакансиями по currentStage)

## Seed данные для разработки

1) Выполните миграции и генерацию клиента, если еще не делали:

```bash
npm run prisma:generate -w backend
npm run prisma:migrate -w backend

```

1) Заполните тестовыми данными (в cmd, чтобы избежать ограничений PowerShell):

```cmd
cd apps\backend
npx prisma db seed
```

Тестовые пользователи (dev-only):

- <admin@example.com> / Admin123! (role: admin)
- <alice@example.com> / User123! (role: user)
- <bob@example.com> / User123! (role: user)

Что создается: компании, вакансии, этапы (с currentStage), заметки и напоминания — достаточно для демонстрации канбана и прав доступа.

### Примеры curl (PowerShell)

Логин (сохраняет refresh cookie в cookies.txt) и получает access:

```powershell
$login = curl -s -X POST http://localhost:3000/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123!\"}" `
  -c cookies.txt | ConvertFrom-Json
$ACCESS = $login.data.accessToken
```

Проверить текущего пользователя:

```powershell
curl -s http://localhost:3000/users/me -H "Authorization: Bearer $ACCESS"
```

Обновить access через refresh cookie:

```powershell
$refresh = curl -s -X POST http://localhost:3000/auth/refresh -b cookies.txt -c cookies.txt | ConvertFrom-Json
$ACCESS = $refresh.data.accessToken
```

Пример защищенного запроса (вакансии текущего пользователя):

```powershell
curl -s http://localhost:3000/jobs -H "Authorization: Bearer $ACCESS"
```

Выход (очистка refresh cookie):

```powershell
curl -s -X POST http://localhost:3000/auth/logout -b cookies.txt -c cookies.txt
```
