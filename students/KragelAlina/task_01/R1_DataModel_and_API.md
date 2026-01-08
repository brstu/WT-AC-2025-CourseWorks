# Вариант 29 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: integer (primary key)
  - username: string (unique, min 3 chars)
  - password: string (min 6 chars)
  - role: enum [user, admin] (default: user)

- Title (фильм/сериал)
  - id: integer (primary key)
  - name: string (not null)
  - type: enum [movie, series]
  - genre: string (optional)
  - year: integer (optional)
  - persons: relationship → Person (one-to-many)

- Person (актёр, режиссёр)
  - id: integer (primary key)
  - name: string (not null)
  - role: enum [actor, director]
  - title_id: integer (foreign key → Title.id)

- List (запись в списке просмотра пользователя)
  - id: integer (primary key)
  - user_id: integer (foreign key → User.id, not null)
  - title_id: integer (foreign key → Title.id, not null)
  - status: enum [watching, planned, completed, dropped] (default: planned)
  - unique(user_id, title_id)

- Review (рецензия пользователя)
  - id: integer (primary key)
  - user_id: integer (foreign key → User.id, not null)
  - title_id: integer (foreign key → Title.id, not null)
  - text: string (not null, max 5000 chars)
  - created_at: datetime (default: utcnow())
  - unique(user_id, title_id)

- Rating (оценка фильма от пользователя)
  - id: integer (primary key)
  - user_id: integer (foreign key → User.id, not null)
  - title_id: integer (foreign key → Title.id, not null)
  - score: integer (1-10, not null)
  - unique(user_id, title_id)

Связи (ER-эскиз)

- User 1..* List (пользователь может добавить много фильмов в список)
- User 1..* Review (пользователь может написать много рецензий)
- User 1..* Rating (пользователь может поставить много оценок)
- Title 1..* List (фильм может быть в списках многих пользователей)
- Title 1..* Review (фильм может получить много рецензий)
- Title 1..* Rating (фильм может получить много оценок)
- Title 1..* Person (фильм может иметь много персон)

Обязательные поля и ограничения (кратко)

- unique(User.username)
- User.password: min 6 chars
- List.user_id → User.id (FK, not null)
- List.title_id → Title.id (FK, not null)
- unique(List.user_id, List.title_id)
- Review.title_id → Title.id (FK, not null)
- Review.user_id → User.id (FK, not null)
- Review.text: not null
- unique(Review.user_id, Review.title_id)
- Rating.title_id → Title.id (FK, not null)
- Rating.user_id → User.id (FK, not null)
- Rating.score ∈ {1, 2, ..., 10}
- unique(Rating.user_id, Rating.title_id)
- Person.title_id → Title.id (FK, not null)

API — верхнеуровневые ресурсы и операции

Auth:

- POST `/register` — {username, password} → 201 {message}
- POST `/login` — {username, password} → 200 {token}

Titles:

- GET `/titles?name=&genre=&year=&page=&per_page=` — список фильмов с фильтрацией и пагинацией (требует JWT)
- POST `/titles` — create (admin only, payload: {name, type, genre?, year?}) (требует JWT)
- GET `/titles/{id}` — детали фильма (требует JWT)
- PUT `/titles/{id}` — update (admin only) (требует JWT)
- DELETE `/titles/{id}` — delete (admin only) (требует JWT)

Lists:

- GET `/lists?page=&per_page=` — список фильмов в личной библиотеке пользователя (требует JWT)
- POST `/lists` — add/update title in list (payload: {title_id, status}) (требует JWT)
- DELETE `/lists/{id}` — remove film from list (требует JWT)

Reviews:

- GET `/reviews?title_id=&user_id=&page=&per_page=` — рецензии (требует JWT)
- POST `/reviews` — write/update review (payload: {title_id, text}) (требует JWT)
- DELETE `/reviews/{id}` — delete review (author only) (требует JWT)

Ratings:

- GET `/ratings?title_id=&user_id=&page=&per_page=` — оценки (требует JWT)
- POST `/ratings` — rate/update rating (payload: {title_id, score}) (требует JWT)
- DELETE `/ratings/{id}` — delete rating (author only) (требует JWT)

Admin:

- POST `/admin/load_movies` — load movies from TMDB (admin only) (требует JWT)

Дополнительно (реализовано)

- Фильтрация фильмов по названию, жанру, году
- Пагинация для всех списков (страница, кол-во на странице)
- Flasgger документация API (Swagger UI доступна на /apidocs)
- Тесты: unit + интеграционные (в папке tests/)
- Загрузка фильмов из TMDB через /admin/load_movies

---

## Общие принципы API

- Аутентификация: `Authorization: Bearer <jwt_token>` (в заголовке)
- Все эндпоинты требуют JWT (кроме /register и /login)
- Роли: `user` (по умолчанию), `admin` (полные права)
- Ошибки возвращаются как JSON с сообщением
- Пагинация: параметры `page` (начиная с 1) и `per_page` (по умолчанию 10)
- Ответы содержат `items` (массив), `total` (всего записей), `pages` (количество страниц)

---

## Примеры использования API

### Регистрация

``` POST /register
Content-Type: application/json
{ "username": "user1", "password": "pass123" }
```

### Вход

``` POST /login
Content-Type: application/json
{ "username": "user1", "password": "pass123" }
Response: { "token": "eyJ0eXAi..." }
```

### Просмотр фильмов с фильтром

``` GET /titles?name=Inception&genre=sci-fi&page=1&per_page=10
Authorization: Bearer <token>
```

### Добавление фильма в список

``` POST /lists
Authorization: Bearer <token>
Content-Type: application/json
{ "title_id": 123, "status": "planned" }
```

### Написание рецензии

``` POST /reviews
Authorization: Bearer <token>
Content-Type: application/json
{ "title_id": 123, "text": "Отличный фильм!" }
```

### Оценка фильма

``` POST /ratings
Authorization: Bearer <token>
Content-Type: application/json
{ "title_id": 123, "score": 8 }
```

---

AC — критерии приёмки для функционала (MVP)

- AC1: Пользователь может зарегистрироваться и войти в систему.
- AC2: Пользователь может просмотреть каталог фильмов/сериалов с фильтрацией по названию, жанру, году.
- AC3: Пользователь может добавить фильм в свой список просмотра и изменить статус (planned, watching, completed, dropped).
- AC4: Пользователь может написать рецензию на фильм (только одну на фильм).
- AC5: Пользователь может оценить фильм (только одну оценку на фильм, 1-10).
- AC6: Администратор может добавлять, редактировать и удалять фильмы в каталоге.
- AC7: Администратор может загружать фильмы из TMDB через /admin/load_movies.
