# Task Manager System — Финальный исходный код

**Вариант 1** — Task Manager»

---

## О проекте

Full-stack Система управления задачами.

### Ключевые возможности

- **Аутентификация и авторизация** — JWT токены, роли (user, admin)
- **Создание новых пользователей, устройств, метрик** — администратор управляет умным домом
- **Просмотр данных** — удобное отображение в виде графика
- **Экспорт данных** — данные экспортируются в файлы CSV
- **Безопасность** — в проекте используются CORS, Helmet
- **Кэширование** — для оптимизации используется Redis
- **Мониторинг** — реализованы логи и метрики

---

## Инструкция по запуску

### Требования

- **Node.js**: 18.x или выше
- **Docker** и **Docker Compose**: последняя версия (для запуска PostgreSQL и Redis)
- **npm**

### Вариант 1: Быстрый запуск с Docker Compose (рекомендуется)

Этот способ автоматически запускает все компоненты приложения (frontend, backend, PostgreSQL, Redis):

```bash
# 1. Перейти в папку проекта
cd students/StelmashukIvan/task_02

# 2. Запустить все сервисы
docker-compose up --build -d

# 3. Дождаться готовности всех сервисов (примерно 30-60 секунд)
```

**Приложение доступно по адресам:**

- **Frontend**: <http://localhost:80>
- **Backend API**: <http://localhost:3000>
- **Swagger документация**: <http://localhost:3000/api-docs>

### Вариант 2: Ручной запуск (для разработки)

#### Шаг 1: Установка зависимостей

```bash
# Установить зависимости для всего проекта (из корня task_02/)
npm install
```

#### Шаг 2: Настройка базы данных (Backend)

```bash
# Перейти в папку сервера
cd src/apps/server

# Сгенерировать Prisma Client
npm run prisma:generate

# Применить схему к базе данных
npm run prisma:push

# (Опционально) Наполнить базу тестовыми данными
npm run seed
```

#### Шаг 3: Запуск Backend

```bash
# Из папки src/apps/server
npm run dev
```

Backend будет доступен на <http://localhost:3000>

#### Шаг 4: Запуск Frontend

```bash
# Перейти в папку frontend (из корня проекта)
cd src/apps/web

# Запустить dev-сервер
npm start
```

Frontend будет доступен на <http://localhost:80>

---

```text
task_02/
├── src/                    # Исходный код приложения
│   ├── apps/              # Приложения
│   │   ├── server/        # Backend (Express + Prisma)
│   │   └── web/           # Frontend (React + TypeScript)
│   ├── docs/              # Документация
│   └── k8s/               # Конфигурация Kubernetes
├── docker-compose.yaml    # Конфигурация Docker Compose
├── package.json           # Зависимости проекта
└── README.md              # Описание
```

---

## 🛠️ Технологический стек

| Компонент | Технологии |
| **Frontend**     | React 18, Vite, TypeScript, React Router v6 |
| **Backend**      | Node.js 18, Express, Prisma ORM             |
| **Database**     | PostgreSQL 14                               |
| **Auth**         | JWT, bcrypt                                 |
| **Security**     | Helmet, CORS                                |
| **Logging**      | Morgan (HTTP‑логи)                         |
| **Metrics**      | Базовые метрики через Prometheus (опционально)
| **Testing**      | Jest / Vitest, Playwright (опционально)     |
| **Container**    | Docker, Docker Compose                      |
| **Orchestration**| Kubernetes (бонус)                          |

---

## Основные функции

**Аутентификация** — регистрация, вход, JWT‑токены, базовая авторизация (роли user/admin)

**Управление проектами** — создание и просмотр проектов, привязка задач к проектам

**CRUD задач** — создание, редактирование, удаление и просмотр задач со статусами (TODO / IN_PROGRESS / DONE)

**Фильтрация задач** — фильтры по статусу, меткам, исполнителям, проектам

**Назначение исполнителей** — привязка пользователей к задачам (Assignment) 

**Комментарии** — добавление и просмотр комментариев к задачам

**Метки и дедлайны** — создание меток, назначение их задачам, установка сроков выполнения

**Административная панель** — управление пользователями и ролями (доступно только admin)

---

## Переменные окружения

При необходимости можно настроить переменные окружения в `src/apps/server/.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smarthome?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-development-jwt-secret"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
LOG_LEVEL="debug"
```

---

## Примечания

- Проект использует **Node.js 18** — убедитесь, что у вас установлена правильная версия
- При первом запуске сборка Docker может занять несколько минут
- Для production-деплоя смотрите [документацию Kubernetes](src/k8s/)
