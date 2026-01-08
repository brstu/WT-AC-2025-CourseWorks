# Вариант 36 — Карточки (обязательные поля и валидации)

## 1) Форма аутентификации

- **username**: string, только алфавит и цифры, не пустое → ошибка: «Введите корректное имя пользователя (только буквы и цифры).»
- **password**: string, не пустое → ошибка: «Введите пароль.»

## 2) Карточка идеи (Idea)

- **id**: UUID, автогенерируется
- **title**: string, не пустое, max 200 → ошибка: «Введите заголовок идеи (до 200 символов).»
- **description**: string, не пустое, max 5000 → ошибка: «Введите описание идеи (до 5000 символов).»
- **author_id**: reference -> User.id, не пустое → ошибка: «Не указан автор.»
- **status**: enum [draft, pending, approved, rejected], default: pending
- **created_at**: datetime
- **updated_at**: datetime

## 3) Карточка тега (Tag)

- **id**: UUID
- **name**: string, не пустое, уникальное → ошибка: «Введите название тега.»
- **color**: string, hex-формат → ошибка: «Неверный формат цвета.»

## 4) Карточка голоса (Vote)

- **id**: UUID
- **idea_id**: reference -> Idea.id, не пустое → ошибка: «Выберите идею.»
- **user_id**: reference -> User.id, не пустое → ошибка: «Не указан пользователь.»
- **value**: enum [up, down], не пустое → ошибка: «Укажите тип голоса.»
- **created_at**: datetime

## 5) Карточка комментария (Comment)

- **id**: UUID
- **idea_id**: reference -> Idea.id, не пустое → ошибка: «Выберите идею.»
- **author_id**: reference -> User.id, не пустое → ошибка: «Не указан автор.»
- **text**: string, не пустое, max 2000 → ошибка: «Текст комментария не может быть пустым (до 2000 символов).»
- **status**: enum [active, deleted], default: active
- **created_at**: datetime

## 6) Карточка пользователя (User)

- **id**: UUID
- **username**: string, уникальное, не пустое
- **email**: string, валидный email, не пустое → ошибка: «Введите корректный email.»
- **role**: enum [user, admin], default: user
- **status**: enum [active, banned], default: active
- **created_at**: datetime
