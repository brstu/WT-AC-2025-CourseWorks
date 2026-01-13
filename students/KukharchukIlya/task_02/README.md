<!-- markdownlint-disable-file MD029 MD031 MD009 MD024 -->
# Микро-шоп «Добавь в корзину»

Full-stack веб-приложение для электронной коммерции (вариант 13 курсового проекта).

## Технологический стек

- **Frontend**: React + TypeScript + Vite
- **Backend**: Java Spring Boot 3.2 + Hibernate
- **БД**: PostgreSQL
- **Кэш**: Redis
- **Документация API**: Swagger/OpenAPI
- **Контейнеризация**: Docker + Docker Compose

## Быстрый старт

### Требования

- Docker и Docker Compose
- Java 17+ (для локальной разработки backend)
- Node.js 18+ (для локальной разработки frontend)

### Запуск через Docker Compose

1. Клонируйте репозиторий и перейдите в директорию проекта:

   ```bash
   cd students/KukharchukIlya/task_02
   ```

2. Запустите все сервисы:

   ```bash
   docker-compose up -d
   ```

3. Приложение будет доступно:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8081
   - Swagger UI: http://localhost:8081/swagger-ui.html

### Локальная разработка

#### Backend

1. Убедитесь, что PostgreSQL и Redis запущены (или используйте Docker Compose только для БД):

   ```bash
   docker-compose up -d postgres redis
   ```

2. Настройте переменные окружения в `src/apps/backend/src/main/resources/application.yml`

3. Запустите приложение:

   ```bash
   cd src/apps/backend
   mvn spring-boot:run
   ```

#### Frontend

1. Установите зависимости:

   ```bash
   cd src/apps/frontend
   npm install
   ```

2. Запустите dev сервер:

   ```bash
   npm run dev
   ```

   Frontend будет доступен на http://localhost:5173

## Тестовые данные

После запуска доступны следующие тестовые аккаунты:

- **Администратор**:
  - Email: `admin@microshop.com`
  - Password: `admin123`

- **Пользователь**:
  - Email: `user@microshop.com`
  - Password: `user123`

## API Документация

После запуска backend, Swagger UI доступен по адресу:
http://localhost:8081/swagger-ui.html

## Структура проекта

```
task_02/
├── src/
│   ├── apps/
│   │   ├── backend/          # Spring Boot приложение
│   │   └── frontend/         # React приложение
│   ├── k8s/                  # Kubernetes манифесты
│   └── .github/workflows/    # CI/CD
├── docker-compose.yml
└── README.md
```

## Основные функции

- ✅ Аутентификация и авторизация (JWT)
- ✅ Каталог товаров с фильтрами и поиском
- ✅ Корзина покупок
- ✅ Оформление заказов
- ✅ Применение купонов
- ✅ Админ-панель для управления товарами и заказами
- ✅ История заказов

## Разработка

### Backend разработка

- Модели данных: `src/apps/backend/src/main/java/com/microshop/model/`
- Контроллеры: `src/apps/backend/src/main/java/com/microshop/controller/`
- Сервисы: `src/apps/backend/src/main/java/com/microshop/service/`
- Миграции БД: `src/apps/backend/src/main/resources/db/migration/`

### Frontend разработка

- Страницы: `src/apps/frontend/src/pages/`
- Компоненты: `src/apps/frontend/src/components/`
- API клиент: `src/apps/frontend/src/api/`

## Лицензия

Курсовая работа по дисциплине "Веб-Технологии"
