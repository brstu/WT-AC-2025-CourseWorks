# Frontend — Оффер где? 📮

React SPA для трекинга откликов: канбан, компании, вакансии, этапы, заметки, напоминания, управление пользователями (admin).

## Стек

- React 18, TypeScript, Vite
- react-router-dom, react-hook-form, zod

## Установка и запуск

```bash
# из корня монорепозитория
npm install
npm run dev:frontend
```

Фронтенд: http://localhost:5173 (backend должен быть запущен на http://localhost:3000).

## Переменные окружения

`apps/frontend/.env.example`:
```
VITE_API_BASE_URL=http://localhost:3000
```
Скопируйте в `.env` и при необходимости укажите другой backend origin.

## Что реализовано

- Страницы: Login, Register, Kanban (главная), Companies, Jobs, Job Detail (этапы, заметки, напоминания), Reminders, Users (admin).
- Действия по ролям: user работает со своими компаниями/вакансиями/этапами/заметками/напоминаниями; admin дополнительно видит список пользователей и может удалять их.
- UX: индикаторы загрузки, сообщения об ошибках, подтверждения удаления, адаптивная верстка.

## Как работает аутентификация

- `accessToken` хранится в памяти (AuthContext).
- `refreshToken` хранится в httpOnly cookie; все запросы отправляются с `credentials: 'include'`.
- При 401 на защищенном запросе клиент выполняет `POST /api/auth/refresh`, сохраняет новый access и повторяет запрос.
- При загрузке страницы пытается восстановить сессию через refresh.
- Logout вызывает `POST /api/auth/logout`, очищает cookie и контекст.

## Быстрый сценарий проверки

1. Зарегистрироваться на `/register` или войти на `/login` (можно использовать seed-аккаунты из backend README).
2. Для демонстрации авто-refresh временно уменьшите `JWT_ACCESS_TTL` в backend `.env`, перезапустите backend, дождитесь истечения access и выполните любой запрос — фронт отправит `POST /api/auth/refresh` с cookie и продолжит работу.
3. Создать компанию → создать вакансию → добавить этапы, заметки, напоминания → убедиться, что карточка появляется на канбане.
4. Выйти через Logout; повторный `POST /api/auth/refresh` вернёт 401, защищённые страницы потребуют входа.

## Структура

```
src/
├── api/              # HTTP-клиент, auth + CRUD функции
├── components/       # Layout, ProtectedRoute
├── context/          # AuthContext
├── pages/            # Экранны приложения
├── types/            # Общие типы
├── App.tsx           # Роутинг
└── main.tsx          # Точка входа
```
