# CourseWork MVP — «Помощь рядом» (Вариант 43)

SPA + API для сервиса волонтёрской помощи. Роли: `admin`, `user`; волонтёр — это `user` с созданным `VolunteerProfile`. Проверка доступа на сервере по матрице прав.

## Архитектура

- Backend: Node.js + Express + TypeScript, PostgreSQL + Prisma, JWT, Zod
- Frontend: React + TypeScript + Vite, react-router, react-hook-form + zod, axios
- База: PostgreSQL (Prisma migrations + seed)

## Что умеет приложение

- Регистрация и вход (JWT)
- Категории помощи (CRUD только admin)
- Запросы помощи (создать/редактировать/удалить владелец или admin; удалить только если status=new)
- Волонтёры (user создаёт себе профиль; admin может любому; редактирование/удаление своего или admin)
- Назначения (волонтёр откликается на запрос `new`; admin может назначить любого; смена статуса; удаление admin)
- Отзывы (автор запроса после completed назначения; редактирование/удаление автором или admin)
- UI скрывает недоступные действия, но окончательная проверка на backend

## Требования окружения

- Node.js 18+ (рекомендуется 20+)
- npm 9+
- PostgreSQL локально

## Настройка и запуск

1) Установить зависимости (из корня):

```bash
npm install
```

1) Переменные окружения (раздельно):
 - Backend: скопировать `apps/backend/.env.example` → `apps/backend/.env` и заполнить `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`, `PORT`, TTL.
   - Для проверки ротации можно временно поставить `JWT_ACCESS_TTL=30s`, `JWT_REFRESH_TTL=30d`.
 - Frontend: скопировать `apps/frontend/.env.example` → `apps/frontend/.env`, задать `VITE_API_URL` (например, `http://localhost:4000`).

2) Применить миграции и seed (из корня):

```bash
npm run prisma:migrate -w backend
npm run prisma:seed -w backend
```

1) Запустить dev-сервера одной командой (конкурентно frontend+backend):

```bash
npm run dev
```

 - Backend: <http://localhost:4000>
 - Frontend: <http://localhost:5173>

## Тестовые учётки (seed)

- <admin@example.com> / admin123
- <user@example.com> / user12345
- <volunteer@example.com> / volunteer123 (есть VolunteerProfile)

## Как тестировать сценарии

1) Регистрация/вход: создать нового user либо воспользоваться seed-аккаунтами.
2) Ротация refresh:
 - В dev можно временно установить `JWT_ACCESS_TTL=30s` и перезапустить backend.
 - Залогиниться, выполнить защищённый запрос (например, список запросов).
 - Подождать истечения access (30–40s), выполнить тот же запрос: frontend должен один раз вызвать `POST /auth/refresh` с cookie (видно в network), получить новый access и повторить запрос успешно.
3) Logout: нажать «Выйти» в UI → проверить, что refresh cookie очищена (Set-Cookie с Max-Age=0) и повторный `POST /auth/refresh` даёт 401.
4) Основной пользовательский сценарий:
 - admin: создать/редактировать категории, просмотреть все запросы.
 - user: создать запрос помощи → убедиться, что удалить можно только пока status=new.
 - volunteer: откликнуться на запрос со статусом `new` → сменить статус назначения → вернуться под user и оставить отзыв после `completed`.
5) Проверить, что недоступные действия (например, создание категории под user) возвращают `Forbidden` и UI показывает сообщение.

Полные детали API и примеры curl смотрите в [apps/backend/README.md](apps/backend/README.md), UI сценарии — в [apps/frontend/README.md](apps/frontend/README.md).
