# Backend — Notes "Пишем вдвоём"

Stack: Express + TypeScript + Prisma + PostgreSQL. JWT (access + refresh с ротацией), bcrypt, Zod, CORS с credentials.

## Что реализовано

- Модели: User, Notebook, Note, Label, Share, RefreshToken, NoteHistory.
- Эндпоинты: auth (register/login/refresh/logout), users, notebooks, notes (+history/restore), labels, shares, health.
- Роли: user, admin; проверки доступа на роуты и ресурсы.
- JWT: короткий access + refresh в HttpOnly cookie, ротация и отзыв при reuse.
- Валидация входящих данных (Zod), читаемые ошибки.

## Требования

- Node.js 18+
- PostgreSQL

## Установка и запуск (локально)

1) Из корня: `npm install`
2) Настроить окружение: копия apps/backend/.env.example → apps/backend/.env, заполнить:
   - DATABASE_URL
   - JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
   - JWT_ACCESS_TTL, JWT_REFRESH_TTL (в секундах; для демонстрации можно уменьшить access TTL)
   - CORS_ORIGIN (пример: <http://localhost:5173>)
   - BCRYPT_SALT_ROUNDS
3) Генерация Prisma Client: `npm run prisma:generate -w backend`
4) Миграции и seed:
   - `npm run prisma:migrate -w backend`
   - `npm exec --workspace backend prisma db seed`
5) Запуск dev-сервера: `npm run dev:backend`

## Seed данные (dev)

- Пользователи:
  - admin / Admin123! (admin)
  - alice / User123! (user, владелец 2 тетрадей)
  - bob / User234! (user, владелец 1 тетради, write-доступ к тетради Alice)
  - charlie / User345! (user, владелец 1 тетради, read-доступ к тетради Alice)
- Создаётся: 4 пользователя, 4 тетради, 10 заметок, 6 меток (Важно, Срочно, Личное, Работа, Совместно, Идеи), 3 share, 4 записи истории.

## Примеры curl (PowerShell)

1. Register:

```powershell
curl.exe -s -X POST http://localhost:4000/auth/register -H "Content-Type: application/json" -d "{\"username\":\"demo\",\"password\":\"Demo123!\"}"
```

1. Login (refresh-cookie сохраняется в файл):

```powershell
$resp = curl.exe -s -X POST http://localhost:4000/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"Admin123!\"}" -c cookies.txt | ConvertFrom-Json
$access = $resp.data.accessToken
```

1. Проверить /users/me:

```powershell
curl.exe -s http://localhost:4000/users/me -H "Authorization: Bearer $access"
```

1. Refresh (ротация, пишет новый cookie):

```powershell
$resp = curl.exe -s -X POST http://localhost:4000/auth/refresh -b cookies.txt -c cookies.txt | ConvertFrom-Json
$access = $resp.data.accessToken
```

1. Защищённый ресурс:

```powershell
curl.exe -s "http://localhost:4000/notebooks" -H "Authorization: Bearer $access"
```

1. Logout (очистит refresh-cookie):

```powershell
curl.exe -X POST http://localhost:4000/auth/logout -b cookies.txt
```

1. Refresh после logout (ожидаемый 401):

```powershell
curl.exe -i -X POST http://localhost:4000/auth/refresh -b cookies.txt
```

## Эндпоинты (MVP)

- Auth: POST /auth/register, POST /auth/login, POST /auth/refresh, POST /auth/logout
- Users: GET /users/me; admin — GET/POST/GET|PUT|DELETE /users/:id (self-GET/PUT разрешены, роль меняет только admin)
- Notebooks: GET /notebooks (own/shared), POST /notebooks, GET|PUT|DELETE /notebooks/:id (owner/admin)
- Notes: GET /notes?notebookId&labelId, POST /notes, GET|PUT|DELETE /notes/:id, GET /notes/:id/history, POST /notes/:id/history/:historyId/restore (write)
- Labels: GET /labels (свои + системные), POST /labels (system — только admin), PUT/DELETE /labels/:id
- Shares: GET /shares (admin; owner по notebookId; user по userId=self), POST /shares (owner/admin), PUT /shares/:id (owner/admin), DELETE /shares/:id (owner/admin/recipient)
- Health: GET /health

## Безопасность

- bcrypt-хеширование паролей (salt rounds из env)
- Access JWT в Authorization (короткий TTL)
- Refresh JWT в HttpOnly cookie (sameSite=lax, secure в prod), хранение jti-hash в БД, ротация и отзыв на reuse
- CORS origin из env, credentials: true (для cookie)
- helmet + morgan логирование

## Полезные команды

- Prisma Studio: `npm exec --workspace backend prisma studio`
- Сборка: `npm run build:backend`
