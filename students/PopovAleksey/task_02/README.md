# Room Booking (MVP)

Full-stack SPA: Express + PostgreSQL (Prisma) + React/Vite.

## Требования

- Node.js 18+
- PostgreSQL (доступный `DATABASE_URL`)

## Структура

- `apps/backend` — API, JWT, Prisma
- `apps/frontend` — SPA (React + Vite)

## Быстрый старт (dev, одна команда)

```bash
# из корня
npm install
npm run dev
```

Скрипт поднимет backend на `http://localhost:3001` и frontend на `http://localhost:5173` через `concurrently`.

## Настройка окружения

1) Скопируйте `apps/backend/.env.example` → `apps/backend/.env`
2) Заполните:

- `DATABASE_URL` (PostgreSQL)
- `CORS_ORIGIN` (например `http://localhost:5173`, список через запятую если нужно)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (минимум 32 символа)
- Для проверки ротации access можно временно уменьшить `JWT_ACCESS_TTL` до `10s` в dev.

## Проверка работоспособности

1) **Health**: `GET http://localhost:3001/health` → `{ "status": "ok" }`
2) **Регистрация**: в UI `/register` (или POST `/auth/register`) — получить access + refresh-cookie.
3) **Вход**: `/login` — access в памяти, refresh в HttpOnly cookie.
4) **Ротация access**:

- Установите короткий `JWT_ACCESS_TTL` (напр. `10s`) и перезапустите backend.
- Выполните защищённый запрос с истекшим access: фронт сам вызовет `POST /auth/refresh` (с `credentials: include`) и повторит исходный запрос.
- Если refresh вернёт 401, фронт разлогинит и покажет сообщение.

5) **Logout**: кнопка «Выйти» или POST `/auth/logout` — refresh-cookie очищается; повторный `/auth/refresh` отдаст 401.
2) **Основной сценарий**:

- Создать аудиторию (admin) → `POST /rooms`
- Создать бронирование → `POST /bookings`
- Проверить расписание → `GET /schedule`
- Отменить/перенести бронирование (в пределах прав) → `DELETE /bookings/:id` / `PUT /bookings/:id`

## CORS и cookies

- Backend: `credentials: true`, origin берётся из `CORS_ORIGIN` (не `*`).
- Frontend: все запросы идут с `credentials: 'include'` там, где нужен refresh cookie; JWT access хранится только в памяти (context), не в localStorage.
