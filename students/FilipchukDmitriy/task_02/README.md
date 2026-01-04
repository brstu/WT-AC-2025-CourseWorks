# Заметки «Пишем вдвоём» — Вариант 16

Full-stack монорепозиторий (Express + PostgreSQL + Prisma + React + Vite). Минимальный MVP по курсовому варианту 16: тетради, заметки, метки, шеры, история.

## Требования

- Node.js 18+
- PostgreSQL (доступен для Prisma)

## Быстрый старт (из корня)

1) Установить зависимости:

```
npm install
```

1) Настроить переменные окружения:

- Скопировать apps/backend/.env.example → apps/backend/.env и заполнить (DATABASE_URL, JWT_* , CORS_ORIGIN, TTL, SALT_ROUNDS).
- Скопировать apps/frontend/.env.example → apps/frontend/.env и указать VITE_API_URL (например <http://localhost:4000>).

1) Применить миграции и заполнить демо-данными:

```
npm run prisma:migrate
npm exec --workspace backend prisma db seed
```

1) Запустить frontend и backend одной командой:

```
npm run dev
```

- Backend: <http://localhost:4000>
- Frontend: <http://localhost:5173>

## Проверка работоспособности (UI)

1) Зарегистрировать нового пользователя (страница Register).
2) Войти (Login).
3) Подождать истечения access (можно временно уменьшить JWT_ACCESS_TTL в apps/backend/.env для dev) — фронт автоматически вызовет POST /auth/refresh с cookie и обновит access.
4) Выполнить действия: создать тетрадь, заметку, поставить метку, посмотреть историю, поделиться тетрадью.
5) Выйти (Logout) — refresh-cookie очистится, повторный POST /auth/refresh вернёт 401.

## Структура

- apps/backend — API, Prisma, JWT. Подробнее: [apps/backend/README.md](apps/backend/README.md)
- apps/frontend — SPA на React/Vite. Подробнее: [apps/frontend/README.md](apps/frontend/README.md)
- task_01 — материалы варианта

## Быстрые команды

- Генерация Prisma Client: `npm run prisma:generate`
- Миграции: `npm run prisma:migrate`
- Открыть Prisma Studio: `npm exec --workspace backend prisma studio`

## Важное по безопасности

- CORS origin задаётся в env, `credentials: true` включено.
- Refresh токен только в HttpOnly cookie (sameSite=lax, secure в prod).
- Access токен хранится в памяти фронта.
- Не коммитьте файлы .env.
