# «Оффер где?» — Job Search Tracker

MVP full-stack приложение для трекинга вакансий (Вариант 32 — Поиск работы).

## 🚀 Возможности

- **Kanban-доска** — визуальный трекинг вакансий по этапам
- **Компании** — управление списком компаний
- **Вакансии** — CRUD операции с полной информацией
- **Этапы** — отслеживание прогресса по каждой вакансии
- **Заметки** — личные заметки к вакансиям
- **Напоминания** — напоминания о важных датах
- **Аутентификация** — JWT с refresh-токенами (httpOnly cookie)
- **Роли** — user и admin

## 🛠 Стек

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **БД**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod

## 📋 Требования

- Node.js >= 18
- PostgreSQL >= 14
- npm >= 9

## ⚡ Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Скопируйте `.env.example` в `.env` для backend:

```bash
cp apps/backend/.env.example apps/backend/.env
```

Отредактируйте `apps/backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jobtracker?schema=public"
PORT=3000
ACCESS_TOKEN_SECRET=your-secure-access-token-secret
REFRESH_TOKEN_SECRET=your-secure-refresh-token-secret
```

### 3. Миграции и seed

```bash
# Применить миграции
npm run prisma:migrate

# Заполнить тестовыми данными
npm run seed
```

### 4. Запуск

```bash
# Backend (http://localhost:3000)
npm run dev:backend

# Frontend (http://localhost:5173) - в другом терминале
npm run dev:frontend
```

## 👥 Тестовые пользователи

После запуска `npm run seed`:

| Роль  | Email              | Пароль    |
|-------|--------------------|-----------|
| Admin | <admin@example.com>  | Admin123! |
| User  | <alice@example.com>  | User123!  |
| User  | <bob@example.com>    | User123!  |

## 📁 Структура проекта

```
task_02/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Модели БД
│   │   │   ├── seed.ts         # Демо-данные
│   │   │   └── migrations/     # SQL миграции
│   │   └── src/
│   │       ├── routes/         # API эндпоинты
│   │       ├── lib/            # Утилиты (auth, validation)
│   │       └── index.ts        # Entry point
│   └── frontend/
│       └── src/
│           ├── api/            # HTTP-клиент
│           ├── components/     # React-компоненты
│           ├── context/        # Auth context
│           ├── pages/          # Страницы приложения
│           └── types/          # TypeScript типы
├── task_01/                    # Документация R1
└── package.json                # Workspace scripts
```

## 🔧 Скрипты

| Команда              | Описание                        |
|----------------------|---------------------------------|
| `npm run dev:backend`  | Запуск backend (dev mode)     |
| `npm run dev:frontend` | Запуск frontend (dev mode)    |
| `npm run prisma:migrate` | Применить миграции          |
| `npm run prisma:generate` | Сгенерировать Prisma Client|
| `npm run prisma:studio` | Открыть Prisma Studio        |
| `npm run seed`         | Заполнить БД тестовыми данными|

## 🔐 API Endpoints

### Auth

- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Вход
- `POST /api/auth/logout` — Выход
- `POST /api/auth/refresh` — Обновление токена
- `GET /api/auth/me` — Текущий пользователь

### Resources (требуют авторизации)

- `GET/POST /api/companies` — Компании
- `GET/PUT/DELETE /api/companies/:id`
- `GET/POST /api/jobs` — Вакансии
- `GET/PUT/DELETE /api/jobs/:id`
- `GET/POST /api/stages` — Этапы
- `GET/PUT/DELETE /api/stages/:id`
- `GET/POST /api/notes` — Заметки
- `GET/PUT/DELETE /api/notes/:id`
- `GET/POST /api/reminders` — Напоминания
- `GET/PUT/DELETE /api/reminders/:id`
- `GET /api/kanban` — Kanban-данные

### Admin

- `GET /api/users` — Список пользователей (admin only)
- `DELETE /api/users/:id` — Удаление пользователя (admin only)

## 📝 Лицензия

Курсовой проект — "Веб-Технологии" 2025
