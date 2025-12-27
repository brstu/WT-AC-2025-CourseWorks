# Вариант 1 — WBS (эпики → фичи → задачи)

- Эпик A. Модель данных и база данных
  - Фичи: схемы User, Task, Comment, Attachment, Notification; миграции
  - Задачи: A1. Описать таблицы и связи; A2. Написать миграции; A3. Наполнить тестовыми данными

- Эпик B. Backend API
  - Фичи: REST API (/tasks, /users, /comments, /attachments); аутентификация JWT
  - Задачи: B1. Реализовать CRUD для задач; B2. Реализовать систему комментариев; B3. Реализовать загрузку файлов

- Эпик C. Frontend интерфейс
  - Фичи: доска Kanban, форма создания задачи, список пользователей
  - Задачи: C1. Компонент доски задач; C2. Форма создания/редактирования задачи; C3. Компонент комментариев

- Эпик D. Система уведомлений
  - Фичи: WebSocket уведомления, иконка непрочитанных уведомлений
  - Задачи: D1. Настроить Socket.io; D2. Реализовать отправку уведомлений; D3. Компонент списка уведомлений

- Эпик E. Роли и безопасность
  - Фичи: RBAC, middleware проверки прав, scope доступа
  - Задачи: E1. Реализовать middleware проверки ролей; E2. Тесты безопасности; E3. Настройка прав доступа

- Эпик F. Деплой и инфраструктура
  - Фичи: Docker-контейнеризация, CI/CD pipeline, тесты
  - Задачи: F1. Dockerfile для backend и frontend; F2. Настройка GitHub Actions; F3. Написание unit-тестов

Технологии проекта:
- Backend: Node.js, Express, PostgreSQL, JWT, Socket.io, Multer
- Frontend: React, TypeScript, Redux Toolkit, Material-UI, Socket.io-client
- DevOps: Docker, GitHub Actions, Nginx