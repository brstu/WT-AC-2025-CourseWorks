# 🤝 Мини-CRM «Фриланс без паники»

**Вариант 06** — полнофункциональная система управления фриланс-проектами для того, чтобы клиенты были довольны, а дедлайны живы.

## 📋 Содержание

- Описание
- Основные возможности
- Архитектура
- Стек технологий
- Установка и запуск
- Структура проекта
- API
- Данные

## 📝 Описание

Мини-CRM для управления фриланс-проектами с поддержкой множественных клиентов, сделок, этапов выполнения и задач. Система позволяет отслеживать весь жизненный цикл проекта от предложения до счета.

### MVP (Минимальный жизнеспособный продукт)

- ✅ Управление клиентами
- ✅ Управление сделками (Deal Pipeline)
- ✅ Этапы выполнения сделок
- ✅ Задачи и доска для управления
- ✅ Счета (Invoices)
- ✅ Система коммуникации
- ✅ Управление пользователями и ролями

## 🎯 Основные возможност

### Интерфейс

- **Воронка сделок** — визуализация всех сделок по этапам
- **Доска задач** — управление задачами в реальном времени
- **Детали клиента** — полная информация о каждом клиенте
- **Управление счетами** — создание и отслеживание счетов

### Функционал

- 👤 Аутентификация и авторизация (JWT)
- 🔐 Система ролей и прав доступа
- 📊 REST API для всех сущностей
- 🗄️ PostgreSQL база данных
- 🐳 Docker контейнеризация
- 📝 Миграция БД через Liquibase

## 🏗️ Архитектура

### Многоуровневая архитектура

```
┌─────────────────────┐
│   Web Frontend      │ (React + TypeScript + Vite)
│   Port: 3000        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   REST API Server   │ (Spring Boot 4.0.1)
│   Port: 8080        │ Java 17 + JPA + Liquibase
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   PostgreSQL DB     │ (v15)
│   Port: 5432        │
└─────────────────────┘
```

## 🛠️ Стек технологий

Backend Server:

- **Language**: Java 17
- **Database**: PostgreSQL 15
- **ORM**: Spring Data JPA
- **Migrations**: Liquibase
- **Mapping**: MapStruct
- **DI**: Spring Dependency Injection
- **Security**: Spring Security + JWT
- **API Documentation**: SpringDoc OpenAPI

Frontend Client:

- **Framework**: React 18.2.0
- **Language**: TypeScript 5.2.2
- **Build Tool**: Vite 4.4.9
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS Modules

DevOps:

- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Build**: Maven (Backend), NPM (Frontend)

## 📦 Установка и запуск

### Быстрый запуск с Docker

переименовать ю

```bash
cd apps
docker-compose up --build
```

Приложение будет доступно:

- 🌐 Frontend: http://localhost:3000
- 📡 API: http://localhost:8080
- 🗄️ Database: localhost:5432

### Локальный запуск

#### Требования

- Java 17+
- Node.js 18+
- PostgreSQL 15
- Maven 3.6+
- npm 8+

#### Backend Server

```bash
cd apps/server

# Установка зависимостей и сборка
./mvnw clean package -DskipTests

# Запуск
./mvnw spring-boot:run
```

API запустится на `http://localhost:8080`

#### Frontend Client

```bash
cd apps/web

# Установка зависимостей
npm install

# Разработка
npm run dev

# Сборка продакшена
npm run build
```

Frontend доступен на `http://localhost:5173` (Vite dev server)

### Переменные окружения

Файл `.env` в корне `apps/`:

```env
# Database
POSTGRES_DB=postgres
POSTGRES_USER=postgres
POSTGRES_PASSWORD=1111
POSTGRES_URL=jdbc:postgresql://localhost:5432/postgres
POSTGRES_USERNAME=postgres
POSTGRES_USER_PASSWORD=1111

# Server
SERVER_PORT=8080

# JWT
JWT_SECRET=jwt-secret
JWT_EXPIRATION_MS=86400000
```

## 📂 Структура проекта

```
apps/
├── docker-compose.yml       # Docker сервисы
├── .env                     # Переменные окружения
├── .env.example            # Пример переменных
│
├── server/                 # Backend (Spring Boot)
│   ├── pom.xml
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/vladislaukuzhyr/server/
│       │   ├── ServerApplication.java
│       │   ├── config/          # Конфигурация (OpenAPI, Security)
│       │   ├── controller/      # REST контроллеры
│       │   ├── dto/             # Data Transfer Objects
│       │   ├── entity/          # JPA сущности
│       │   ├── mapper/          # MapStruct маперы
│       │   ├── repository/      # JPA репозитории
│       │   ├── security/        # JWT и авторизация
│       │   └── service/         # Бизнес-логика
│       └── resources/
│           ├── application.yaml # Конфигурация Spring
│           └── db/changelog/    # Liquibase миграции
│
└── web/                    # Frontend (React + TypeScript)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── Dockerfile
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── api/                 # API интеграция
        ├── components/          # React компоненты
        │   ├── UI/             # UI компоненты
        │   └── Layout/         # Лейауты
        ├── contexts/           # React Context
        ├── pages/              # Страницы приложения
        ├── styles/             # CSS стили
        └── types/              # TypeScript типы
```

## 🔌 API

## 📋 Таблица API

| -------------------- | -------- | --------------------------- |
| `/api/auth/login` | POST | Вход в систему |
| `/api/auth/register` | POST | Регистрация |
| `/api/clients` | GET/POST | Получение/создание клиентов |
| `/api/deals` | GET/POST | Получение/создание сделок |
| `/api/stages` | GET/POST | Получение/создание этапов |
| `/api/tasks` | GET/POST | Получение/создание задач |
| `/api/invoices` | GET/POST | Получение/создание счетов |
| `/api/users` | GET/POST | Управление пользователями |

### Сущности API

- **AuthController** — аутентификация и авторизация
- **ClientController** — управление клиентами
- **DealController** — управление сделками
- **StageController** — управление этапами
- **TaskController** — управление задачами
- **InvoiceController** — управление счетами
- **UserController** — управление пользователями

## 🗄️ Данные

```
User (Пользователь)
├── id
├── email
├── password
├── fullName
├── role
└── createdAt

Client (Клиент)
├── id
├── name
├── email
├── phone
├── company
└── createdAt

Deal (Сделка)
├── id
├── title
├── description
├── clientId
├── stageId
├── amount
├── probability
└── createdAt

Stage (Этап)
├── id
├── name
├── order
└── dealsCount

Task (Задача)
├── id
├── title
├── description
├── dealId
├── assignedTo
├── status
├── dueDate
└── createdAt

Invoice (Счет)
├── id
├── number
├── dealId
├── amount
├── status
├── issuedDate
└── dueDate
```

### Роли и права

- **ADMIN** — полный доступ
- **MANAGER** — управление сделками и клиентами
- **EMPLOYEE** — просмотр и выполнение задач

## 🚀 Развертывание

### Docker Compose

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Пересборка образов
docker-compose up --build
```

### Структура сервисов

1. **db** — PostgreSQL база данных

   - Образ: `postgres:15`
   - Порт: 5432
   - Том: `db-data`

2. **server** — Backend API

   - Образ: собирается из `server/Dockerfile`
   - Порт: 8080
   - Зависит от: `db`

3. **web** — Frontend приложение
   - Образ: собирается из `web/Dockerfile`
   - Порт: 3000
   - Зависит от: `server`

## 📊 Примеры использования

### Создание клиента

```bash
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Компания XYZ",
    "email": "contact@xyz.com",
    "phone": "+1234567890",
    "company": "XYZ Inc"
  }'
```

### Создание сделки

```bash
curl -X POST http://localhost:8080/api/deals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Разработка веб-сайта",
    "description": "Landing page для XYZ",
    "clientId": 1,
    "stageId": 1,
    "amount": 5000,
    "probability": 80
  }'
```

## 🔍 Тестирование

```bash
# Backend тесты
cd apps/server
./mvnw test

# Frontend тесты (при наличии)
cd apps/web
npm test
```

## 📖 Документация API

После запуска сервера, документация OpenAPI доступна:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## 🎨 Интерфейс

### Главные страницы

- **Dashboard** — обзор информации
- **Clients** — список и управление клиентами
- **Deals Pipeline** — визуальная воронка сделок
- **Tasks Board** — доска Kanban для задач
- **Invoices** — управление счетами
- **Stages** — управление этапами

## 🔐 Безопасность

- JWT токены для аутентификации
- HTTPS в продакшене
- Role-Based Access Control (RBAC)
- Шифрование паролей (BCrypt)
- CORS настройки для фронтенда

## 🛣️ Роадмап

### Реализовано ✅

- MVP функционал (клиенты, сделки, задачи, счета)
- REST API со всеми CRUD операциями
- Система аутентификации (JWT)
- Docker контейнеризация
- Миграция БД (Liquibase)
- Frontend интерфейс

## 👨‍💻 Разработчик

Кухир Владислав
