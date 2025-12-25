# Что посмотреть? (Вариант 29)

## Описание проекта

Это full-stack приложение для трекинга кино и сериалов, реализующее вариант №29 курсовой работы по дисциплине "Веб-Технологии". Приложение позволяет пользователям добавлять тайтлы (фильмы/сериалы) в списки с статусами (смотрю, буду смотреть, просмотрено, брошено), оставлять отзывы и рейтинги, искать и фильтровать контент.
**Питч:** Советует лучше друга — управляйте своими списками просмотра, оценивайте и обсуждайте.

## MVP (обязательный минимум)

- Аутентификация: регистрация, логин, логаут (JWT).
- Роли: user (просмотр/добавление в списки/отзывы/рейтинги), admin (CRUD тайтлов).
- API: CRUD для тайтлов, списков, отзывов, рейтингов.
- Фильтры: по имени, жанру, году, статусу.
- Пагинация: на списках тайтлов.
- Frontend: Простой интерфейс на HTML/JS/CSS (vanilla JS с Fetch API).
- БД: PostgreSQL с SQLAlchemy.
- Валидация: Pydantic на backend, базовая на frontend.
- Нефункциональные: CORS, логирование ошибок, базовая a11y (семантика HTML, контраст).

## Бонусы (реализованные для +баллов)

- Документация API: В этом README (можно расширить на Swagger).
- Тестирование: Базовые unit-тесты с pytest (в tests/).
- Деплой в Kubernetes: Манифесты в k8s/ (Deployment, Service, Ingress, ConfigMap, Secret; пробы, ресурсы).
- CI: GitHub Actions в .github/workflows/ci.yml (lint, test, build Docker).
- Оптимизации: Пагинация, фильтры, сериализация данных.

## Требования

- Python 3.11+
- PostgreSQL
- Зависимости: pip install -r requirements.txt

## Установка и запуск

1) Скопируйте `.env.example` в `.env` и заполните: `DATABASE_URL=postgresql://user:password@localhost:5432/what_to_watch JWT_SECRET_KEY=your_secret_key_here`
2) Создайте БД (если нужно): Запустите `python` и импортируйте `from app import db; db.create_all()` (или вручную).
3) Запуск локально: `python app.py` (сервер на <http://localhost:5000>).
4) Docker: `docker-compose up` (включает Flask + Postgres).

Работа с загрузчиком фильмов:

- Создайте переменную окружения `TMDB_API_KEY` в `.env` или в окружении, например: `TMDB_API_KEY=your_tmdb_api_key`.
- При необходимости укажите `DATABASE_URL` (docker-compose уже передаёт `postgresql://user:password@db:5432/what_to_watch`).
- Пример запуска загрузки: `python load_movies_to_db.py --page 1 --limit 50`.
- Для проверки без записи в БД: `python load_movies_to_db.py --limit 5 --dry-run`.

Если `DATABASE_URL` не задан, скрипт создаст локальный SQLite файл `movies.db` и вставит туда записи.

Запуск в Docker контейнере

- Запустить загрузчик в контейнере (однократно):
  - docker-compose run --rm web python load_movies_to_db.py --page 1 --limit 50
  - или, если контейнер уже запущен: docker-compose exec web python load_movies_to_db.py --page 1 --limit 50

API endpoint для загрузки (админ):

- POST /admin/load_movies (требует JWT, роль admin)
  - JSON body: { "page": 1, "limit": 50, "dry_run": false, "async": false }
  - Если `async` = true — задача запускается в фоне и возвращает 202 Job started.
  - Пример: curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"limit":50}' http://localhost:5000/admin/load_movies

Примечание: при использовании Docker Compose `DATABASE_URL` уже настроен на `postgresql://user:password@db:5432/what_to_watch` и загрузчик будет писать в Postgres контейнер.

## API Документация

Все endpoints требуют JWT в заголовке `Authorization: Bearer <token>` (кроме /register и /login).

- Auth:
  - `/register` (POST): `{ "username": "str", "password": "str" }` → { "message": "Registered" }
  - `/login` (POST): `{ "username": "str", "password": "str" }` → { "token": "str" }

- Titles:
  - `/titles` (GET): Фильтры: ?name=..., ?genre=..., ?year=..., ?status=..., ?page=1&per_page=10 → { "items": [...], "total": int, "pages": int }
  - `/titles` (POST, admin): `{ "name": "str", "type": "str", "genre": "str?", "year": "int?" }` → { "id": int }
  - `/titles/<id>` (GET): → { ...title data... }
  - `/titles/<id>` (PUT, admin): Обновление полей.
  - `/titles/<id>` (DELETE, admin): Удаление.

- Lists:
  - `/lists` (GET): Списки пользователя → [...]
  - `/lists` (POST): `{ "title_id": int, "status": "str" }` → { "message": "Added/Updated" }

- Reviews:
  - `/reviews` (GET): ?title_id=... → [...]
  - `/reviews` (POST): `{ "title_id": int, "text": "str" }` → { "id": int }

- Ratings:
  - `/ratings` (GET): ?title_id=... → [...]
  - `/ratings` (POST): `{ "title_id": int, "score": int (1-10) }` → { "message": "Rated/Updated" }

## Frontend

`index.html`: Основная страница с формами аутентификации, поиском, списками, модальным окном для деталей.
`main.js`: Логика взаимодействия с API (fetch, рендеринг).
`styles.css`: Базовые стили, dark mode, адаптивность.

## Тестирование

`pytest tests/` — проверяет регистрацию, логин, CRUD.

## Деплой в Kubernetes

1) Push образ в registry (e.g., Docker Hub).
2) `kubectl apply -f k8s/configmap.yaml`
3) `kubectl apply -f k8s/secret.yaml`
4) `kubectl apply -f k8s/deployment.yaml`
5) `kubectl apply -f k8s/service.yaml`
6) `kubectl apply -f k8s/ingress.yaml`
Для DB: Добавьте StatefulSet для Postgres (см. пример в ответе).

## Структура репозитория

```file-structure
textwhat-to-watch/
├── app.py
├── config.py
├── models.py
├── schemas.py
├── utils.py
├── tests/
│   └── test_api.py
├── static/
│   ├── main.js
│   └── styles.css
├── templates/
│   └── index.html
├── Dockerfile
├── docker-compose.yml
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secret.yaml
├── .github/workflows/ci.yml
├── .env.example
├── requirements.txt
└── README.md
```
