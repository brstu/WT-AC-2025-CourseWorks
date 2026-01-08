# Вариант 36 — WBS (эпики → фичи → задачи) — Spring Backend

- Эпик A. Модель данных и миграции
  - Фичи: JPA-сущности, миграции Flyway/Liquibase
  - Задачи: A1. Описать Entity-классы; A2. Настроить миграции; A3. Создать демо-данные; A4. Настроить связи и каскады

- Эпик B. Spring Boot API
  - Фичи: REST Controllers, DTO, Service Layer, Spring Security
  - Задачи: B1. Реализовать REST endpoints; B2. Настроить Spring Security; B3. Добавить пагинацию (Pageable); B4. Валидация DTO

- Эпик C. Бизнес-логика и сервисы
  - Фичи: Spring Services, транзакции, расчет рейтинга
  - Задачи: C1. Сервис голосования и рейтинга; C2. Сервис модерации; C3. Кэширование (Redis); C4. Асинхронные задачи (@Async)

- Эпик D. Веб-сокеты и реальное время
  - Фичи: WebSocket/STOMP для обновления рейтинга
  - Задачи: D1. Настроить WebSocket конфигурацию; D2. Реализовать broadcast обновлений; D3. Интеграция с сервисом рейтинга

- Эпик E. Безопасность и авторизация
  - Фичи: Spring Security, JWT, RBAC
  - Задачи: E1. JWT аутентификация; E2. @PreAuthorize аннотации; E3. Кастомные Security выражения; E4. Тесты безопасности

- Эпик F. Документация и тестирование
  - Фичи: Spring REST Docs, Swagger, Unit/Integration tests
  - Задачи: F1. Настроить Spring REST Docs; F2. Интеграционные тесты (@DataJpaTest, @WebMvcTest); F3. Тесты безопасности

- Эпик G. Деплой и инфраструктура
  - Фичи: Docker, Spring profiles, CI/CD
  - Задачи: G1. Dockerfile multi-stage; G2. Настройка профилей (dev/prod); G3. GitHub Actions pipeline; G4. Health checks

- Эпик H. Мониторинг и логирование
  - Фичи: Spring Boot Actuator, метрики, логи
  - Задачи: H1. Настроить Actuator endpoints; H2. Кастомные метрики рейтинга; H3. Structured logging
