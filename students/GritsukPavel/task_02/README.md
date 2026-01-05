# Оффер где? — Вариант 32

MVP трекер откликов на вакансии (канбан, компании, вакансии, этапы, заметки, напоминания) на стеке React + Express + PostgreSQL.

## Требования

- Node.js 18+ (npm 9+)
- PostgreSQL 14+

## Запуск всего проекта одной командой

1) Установить зависимости:

 ```bash
 npm install
 ```

1) Настроить переменные окружения для backend (см. `apps/backend/.env.example`):

 ```bash
 # bash
 cp apps/backend/.env.example apps/backend/.env
 # или в Windows cmd
 copy apps\backend\.env.example apps\backend\.env
 ```

 Обязательные поля: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` (origin фронтенда), `COOKIE_DOMAIN` (в dev можно оставить `localhost`).

1) Применить миграции:

 ```bash
 npm run prisma:migrate
 ```

1) (Опционально) заполнить демо-данные:

 ```bash
 cd apps/backend
 npx prisma db seed
 cd ../..
 ```

1) Запустить backend и frontend вместе из корня:

 ```bash
 npm run dev
 ```

- Backend: <http://localhost:3000>

- Frontend: <http://localhost:5173>

## Как проверить работоспособность

1. Регистрация: на фронтенде перейдите на `/register`, создайте пользователя. Access выдаётся сразу, refresh сохраняется в httpOnly cookie.
2. Вход: `/login` с существующим пользователем.
3. Обновление access через refresh (ротация):

- В `.env` можно временно уменьшить `JWT_ACCESS_TTL` (например, `15s`) и перезапустить backend.
- Дождитесь истечения access, сделайте любой запрос из фронтенда. Клиент выполнит `POST /api/auth/refresh` с cookie, обновит access и повторит запрос.

1. Выход: кнопка Logout отправляет `POST /api/auth/logout`, refresh cookie очищается. Повторный `POST /api/auth/refresh` вернёт 401.
1. Основной сценарий (под авторизованным пользователем): создать компанию → создать вакансию → добавлять этапы, заметки, напоминания → проверить канбан.

## Структура монорепозитория

- apps/backend — Express + Prisma API
- apps/frontend — React SPA (Vite)
- task_01 — документация R1 по варианту

Подробности по запуску и сценариям см. в `apps/backend/README.md` и `apps/frontend/README.md`.
