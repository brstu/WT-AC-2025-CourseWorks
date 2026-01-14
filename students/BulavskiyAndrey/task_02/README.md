# Курсовой проект «Веб-Технологии» — Вариант 33

**Органайзер группы «Без лишних чатов»** — система для учебной/рабочей группы с объявлениями, файлами, календарём, опросами и чатами.  
Этот код реализует основные идеи из `task_01` (R1\_Routes, R1\_DataModel_and_API и др.) в виде full‑stack приложения.

## Описание проекта

Минимальный функционал (MVP):

- Объявления по группе (`/groups/:groupId/announcements`)
- Библиотека файлов (`/groups/:groupId/files`)
- Календарь событий (`/groups/:groupId/calendar`)
- Опросы (`/groups/:groupId/polls`)
- Чаты (`/groups/:groupId/chats`)

## Стек технологий

**Backend:**
- Node.js 20+ с Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT аутентификация (access + refresh tokens)
- Роли и права доступа через Membership

**Frontend:**
- React 18 + TypeScript
- Vite
- React Router
- Axios для API запросов

## Структура проекта

```text
task_02/
├── apps/
│   ├── server/          # Backend (Express + Prisma)
│   │   ├── src/         # Исходники TypeScript
│   │   ├── prisma/      # Схема БД, миграции, seed
│   │   └── package.json
│   └── web/             # Frontend (React + Vite)
│       ├── src/         # Компоненты, страницы, API клиент
│       └── package.json
├── package.json         # Корневой package.json
└── pnpm-workspace.yaml  # Конфигурация монорепозитория
```

## Требования

- Node.js 20 или выше
- pnpm 8.15+ (установить: `npm install -g pnpm`)
- PostgreSQL 14+ (запущен и доступен)

## Быстрый старт

### 1. Установка зависимостей

```bash
cd students/BulavskiyAndrey/task_02
pnpm install
```

### 2. Настройка backend

Создайте файл `apps/server/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/group_organizer_db?schema=public"

# JWT Secrets (генерируйте случайные строки для production!)
JWT_ACCESS_SECRET="dev_access_secret_change_in_prod"
JWT_REFRESH_SECRET="dev_refresh_secret_change_in_prod"

# JWT TTL
JWT_ACCESS_TTL="15m"
JWT_REFRESH_TTL="7d"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Server
SERVER_PORT=3000
NODE_ENV=development
```

### 3. Инициализация базы данных

```bash
# Генерация Prisma клиента
pnpm --filter @app/server prisma:generate

# Применение миграций
pnpm --filter @app/server prisma:migrate

# Заполнение тестовыми данными
pnpm --filter @app/server prisma:seed
```

### 4. Настройка frontend

Создайте файл `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 5. Запуск приложения

**Запустить всё одной командой:**

```bash
pnpm dev
```

Это запустит:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

**Или запускать раздельно:**

```bash
# Terminal 1 - Backend
pnpm dev:server

# Terminal 2 - Frontend
pnpm dev:web
```

## Тестовые пользователи (seed-данные)

После выполнения `prisma:seed` доступны следующие аккаунты:

| Email                    | Пароль       | Роль в группе |
|--------------------------|--------------|---------------|
| admin@example.com        | admin123!    | admin         |
| user1@example.com        | user123!     | member        |
| user2@example.com        | user123!     | member        |

**Group ID для тестирования:** `demo-group-id`

## API эндпоинты

Все эндпоинты требуют аутентификации (Bearer token) и доступа к группе:

- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `POST /api/auth/refresh` - Обновление токена
- `POST /api/auth/logout` - Выход
- `GET /api/groups/:groupId/announcements` - Список объявлений
- `POST /api/groups/:groupId/announcements` - Создать объявление
- `GET /api/groups/:groupId/files` - Список файлов
- `POST /api/groups/:groupId/files` - Загрузить файл
- `GET /api/groups/:groupId/calendar` - Список событий
- `POST /api/groups/:groupId/calendar` - Создать событие
- `GET /api/groups/:groupId/polls` - Список опросов
- `POST /api/groups/:groupId/polls` - Создать опрос
- `POST /api/groups/:groupId/polls/:pollId/votes` - Голосовать
- `GET /api/groups/:groupId/chats` - Список чатов
- `POST /api/groups/:groupId/chats` - Создать чат
- `GET /api/groups/:groupId/chats/:chatId/messages` - Сообщения чата
- `POST /api/groups/:groupId/chats/:chatId/messages` - Отправить сообщение

API эндпоинты и модель данных согласованы с `R1_DataModel_and_API.md` (вариант 33).
