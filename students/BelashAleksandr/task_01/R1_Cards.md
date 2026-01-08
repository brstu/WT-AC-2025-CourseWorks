# Вариант 37 — Карточки (обязательные поля и валидации)

1. Форма аутентификации

- username: string, буквы и цифры, не пустое → ошибка: «Введите корректное имя пользователя.»
- password: string, не пустое → ошибка: «Введите пароль.»

2. Карточка источника (Source)

- id: UUID, автогенерируется
- name: string, не пустое → ошибка: «Введите название источника.»
- url: string, не пустое, валидный URL → ошибка: «Введите корректный URL источника.»
- description: string, опционально

3. Карточка статьи (Article)

- id: UUID
- source_id: reference -> Source.id, не пустое → ошибка: «Выберите источник.»
- title: string, не пустое → ошибка: «Введите заголовок статьи.»
- content: text, опционально
- url: string, опционально
- published_at: datetime, не пустое → ошибка: «Выберите дату публикации.»

4. Карточка тега (Tag)

- id: UUID
- name: string, не пустое, уникальное → ошибка: «Введите название тега.»

5. Карточка избранного (Favorite)

- id: UUID
- user_id: reference -> User.id, не пустое
- article_id: reference -> Article.id, не пустое → ошибка: «Выберите статью.»
- created_at: datetime

6. Карточка жалобы (Report)

- id: UUID
- user_id: reference -> User.id, не пустое
- article_id: reference -> Article.id, не пустое → ошибка: «Выберите статью для жалобы.»
- reason: string, не пустое → ошибка: «Укажите причину жалобы.»
- status: enum [new, reviewed, closed], default: new
- created_at: datetime
