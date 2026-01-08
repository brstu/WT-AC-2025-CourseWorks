# R1 — WBS (Work Breakdown Structure) — MVP

Цель R1: завершить набор документации и минимальный функционал для демонстрации MVP (регистрация, метрики, записи, дашборд).

1. Документация (this R1)
   - R1_DataModel_and_API.md ✅
   - R1_ERD.md ✅
   - R1_Roles_and_Actions.md ✅
   - R1_Matrix_of_Rights.md ✅
   - R1_Routes.md ✅
   - R1_Cards.md ✅
   - R1_WBS.md ✅

2. Backend
   - Настроить модели и миграции (Flask-Migrate) ✅ (models уже в коде)
   - Реализовать API эндпоинты (auth, metrics, entries, dashboard, reports) ✅
   - Добавить тесты: auth, metrics CRUD, entries (unit/integration)

3. Frontend
   - Страницы: login/register, dashboard, metric, reports
   - Формы: create metric, create entry
   - Графики: Chart.js для метрик

4. DevOps / CI
   - Dockerfile / docker-compose (готово) ✅
   - GitHub Actions: тесты и lint (опционально)

5. Дополнительно (бонусы)
   - Документация API (OpenAPI/Swagger)
   - E2E тесты и деплой

Вехи и критерии приёмки:
- V1 (демо): регистрация/login, создание метрики, добавление записи, дашборд — работают и покрыты базовыми тестами.
- V2: графики, экспорт, дополнительные тесты и документация API.
