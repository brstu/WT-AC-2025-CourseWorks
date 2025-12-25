# Frontend (Room Booking SPA)

## Требования

- Node.js 18+
- Backend запущен (по умолчанию `http://localhost:3001`)

## Настройка

1. Скопируйте `.env.example` → `.env`
2. При необходимости поменяйте `VITE_API_URL` на URL backend.

## Скрипты

- `npm run dev -w frontend` — запуск в dev-режиме (Vite)
- `npm run build -w frontend` — сборка
- `npm run preview -w frontend` — предпросмотр собранной версии

## Реализовано

- SPA на React + TypeScript + Vite
- Маршруты: `/login`, `/register`, `/` (dashboard), `/rooms`, `/bookings`, `/schedule`
- JWT access в памяти; refresh только в HttpOnly cookie (запросы с `credentials: 'include'`)
- Авто-refresh при 401 и повтор исходного запроса; при неудаче — разлогин
- Формы на `react-hook-form` + `zod` с валидацией и понятными ошибками
- Ролевая логика: admin видит/меняет аудитории, может управлять любыми бронированиями; остальные — только свои
- UI состояния: loading / error / empty, без `alert`

## Быстрый старт

```bash
# из корня монорепо
npm install
npm run dev -w backend   # запустить API
npm run dev -w frontend  # открыть SPA (по умолчанию http://localhost:5173)
```

## Сценарии

- Логин/регистрация → получение access + refresh-cookie
- Список аудиторий, создание/редактирование/удаление (admin)
- Список бронирований, создание, перенос, отмена (в рамках прав)
- Просмотр расписания по аудитории + фильтр по дате

Backend — единственный источник правды: все данные грузятся через REST API. Refresh/access не сохраняются в localStorage/sessionStorage.
