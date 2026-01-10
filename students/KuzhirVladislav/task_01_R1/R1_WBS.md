# Вариант 06 — WBS (эпики → фичи → задачи)

- **Эпик A. Модель данных и миграции**

  - Фичи: схемы User/Client/Deal/Stage/Task/Invoice; миграции Liquibase
  - Задачи:
    - A1. Описать ER-диаграмму и связи между сущностями
    - A2. Написать миграции Liquibase для всех таблиц
    - A3. Подготовить демо-данные

- **Эпик B. API и интеграция данных**

  - Фичи: REST API (/clients, /deals, /stages, /tasks, /invoices); JWT аутентификация
  - Задачи:
    - B1. Реализовать endpoints CRUD для всех сущностей
    - B2. Добавить JWT аутентификацию и авторизацию
    - B3. Реализовать фильтрацию, поиск и пагинацию
    - B4. Написать unit-тесты для API

- **Эпик C. UI / компоненты**

  - Фичи: Dashboard, DealsPipeline (Kanban), ClientsList, TaskBoard, InvoicesList
  - Задачи:
    - C1. Компоненты аутентификации (Login/Register)
    - C2. Dashboard с метриками и статистикой
    - C3. Kanban-доска для сделок с drag-and-drop
    - C4. CRUD компоненты для Client, Task, Invoice

- **Эпик D. Безопасность и роли**

  - Фичи: RBAC (Role-Based Access Control), scope доступа
  - Задачи:
    - D1. Реализовать Spring Security с JWT
    - D2. Реализовать scope-ограничения (User видит только свои данные)
    - D3. Тесты доступа и авторизации

- **Эпик E. Интеграция и полировка**
  - Фичи: контейнеризация, документация, интеграционные тесты
  - Задачи:
    - E1. Docker контейнеризация (server + web + PostgreSQL)
    - E2. OpenAPI/Swagger документация
    - E3. Интеграционные и e2e тесты
