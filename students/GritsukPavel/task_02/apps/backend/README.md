# Backend (Express + Prisma)

API для варианта «Оффер где?» (компании, вакансии, этапы, заметки, напоминания, канбан). JWT-аутентификация с access+refresh, роли `user` и `admin`, проверка ownership.

## Что реализовано

- Модели: User, Company, Job, Stage, Note, Reminder, RefreshToken.
- Эндпоинты: /api/auth, /api/users, /api/companies, /api/jobs, /api/stages, /api/notes, /api/reminders, /api/kanban.
- Роли: admin (CRUD для пользователей, read-only чужие ресурсы), user (CRUD только свои ресурсы).
- Безопасность: bcrypt пароли, refresh в httpOnly cookie, ротация refresh, CORS с `credentials: true`, helmet, валидация Zod.
- Rate limiting: /api/auth/register (3/час), /api/auth/login (5/мин) per IP.

## Требования и подготовка

- Node.js 18+, PostgreSQL.
- Из корня проекта: `npm install`.
- Скопировать и заполнить env: `cp apps/backend/.env.example apps/backend/.env`.
  - `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — обязательны.
  - `JWT_ACCESS_TTL` можно временно уменьшить (например, `15s`) для демонстрации авто-refresh.
  - `CORS_ORIGIN` — origin фронтенда (например, <http://localhost:5173>), `COOKIE_DOMAIN` — домен для cookie.
- Миграции (из корня): `npm run prisma:migrate`.
- Dемо-данные (опционально):

  ```cmd
  cd apps\backend
  npx prisma db seed
  cd ../..
  ```

Тестовые аккаунты (после seed):

- <admin@example.com> / Admin123! (admin)
- <alice@example.com> / User123! (user)
- <bob@example.com> / User123! (user)

## Запуск

- Только backend (из корня):

  ```bash
  npm run dev:backend
  ```

- Healthcheck: GET <http://localhost:3000/health>
- Prisma Studio: `npm run prisma:studio`

## Auth flow (коротко)

- `POST /api/auth/register` и `POST /api/auth/login` возвращают access и ставят refresh в httpOnly cookie.
- `POST /api/auth/refresh` проверяет cookie, ревокирует старый refresh, выдаёт новую пару (access в ответе, refresh в cookie).
- `POST /api/auth/logout` очищает refresh cookie и помечает сессию revoked.

## Примеры PowerShell (curl)

Логин (сохраняет refresh cookie в cookies.txt):

```powershell
$login = curl -s -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@example.com\",\"password\":\"Admin123!\"}" `
  -c cookies.txt | ConvertFrom-Json
$ACCESS = $login.data.accessToken
```

Получить текущего пользователя:

```powershell
curl -s http://localhost:3000/api/users/me -H "Authorization: Bearer $ACCESS"
```

Обновить access по refresh cookie (ротация):

```powershell
$refresh = curl -s -X POST http://localhost:3000/api/auth/refresh -b cookies.txt -c cookies.txt | ConvertFrom-Json
$ACCESS = $refresh.data.accessToken
```

Защищённый запрос (вакансии текущего пользователя):

```powershell
curl -s http://localhost:3000/api/jobs -H "Authorization: Bearer $ACCESS"
```

Выход:

```powershell
curl -s -X POST http://localhost:3000/api/auth/logout -b cookies.txt -c cookies.txt
```
