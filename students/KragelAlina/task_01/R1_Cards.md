# Вариант 29 — Карточки (обязательные поля и валидации)

1. Карточка пользователя (User)

- id: integer, автогенерация (primary key)
- username: string, не пустое, мин. 3 символа, уникальное → ошибка: «Пользователь уже существует»
- password: string, мин. 6 символов → «Пароль слишком короткий»
- role: enum [user, admin], default: user

1. Карточка названия (Title)

- id: integer, автогенерация (primary key)
- name: string, не пустое → «Введите название фильма/сериала.»
- type: enum [movie, series], обязательное
- genre: string, опционально
- year: integer, опционально
- persons: relationship к Person (один фильм может иметь много персон)

1. Карточка персоны (Person)

- id: integer, автогенерация (primary key)
- name: string, не пустое → «Введите имя персоны.»
- role: enum [actor, director], описание роли
- title_id: reference Title.id, обязательное (foreign key)

1. Карточка списка (List)

- id: integer, автогенерация (primary key)
- user_id: reference User.id, обязательное (foreign key) → «Укажите пользователя.»
- title_id: reference Title.id, обязательное (foreign key) → «Выберите фильм/сериал.»
- status: enum [watching, planned, completed, dropped], default: planned

1. Карточка рецензии (Review)

- id: integer, автогенерация (primary key)
- user_id: reference User.id, обязательное (foreign key)
- title_id: reference Title.id, обязательное (foreign key)
- text: string, не пустое, макс. 5000 символов → «Введите текст рецензии.»
- created_at: datetime, default: текущее время (UTC)

1. Карточка рейтинга (Rating)

- id: integer, автогенерация (primary key)
- user_id: reference User.id, обязательное (foreign key)
- title_id: reference Title.id, обязательное (foreign key)
- score: integer, от 1 до 10, обязательное → «Оценка должна быть от 1 до 10.»

Ограничения и валидации:

- User.username: уникально, мин 3 символа
- User.password: мин 6 символов
- Title.name: не пустое
- Person.title_id: обязательное (каждая персона привязана к фильму)
- List: уникальная пара (user_id, title_id) — пользователь может добавить фильм в список только один раз
- Review: уникальная пара (user_id, title_id) — пользователь может написать только одну рецензию на фильм
- Rating: уникальная пара (user_id, title_id) — пользователь может поставить только одну оценку фильму
- Rating.score: обязательно между 1 и 10 включительно
