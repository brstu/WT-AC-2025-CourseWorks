# Вариант 31 — Карточки (обязательные поля и валидации)

## 1. Форма аутентификации

- **username**: string, только алфавит, не пустое → ошибка: «Введите корректное имя пользователя (только буквы).»
- **password**: string, не пустое → ошибка: «Введите пароль.»

## 2. Карточка заявки (Report)

- **id**: UUID, автогенерируется
- **title**: string, не пустое → ошибка: «Введите название заявки.»
- **description**: string, не пустое → ошибка: «Введите описание проблемы.»
- **category_id**: reference -> Category.id, не пустое → ошибка: «Выберите категорию.»
- **location_id**: reference -> Location.id, не пустое → ошибка: «Укажите местоположение.»
- **author_id**: reference -> User.id, не пустое → ошибка: «Укажите автора заявки.»
- **status**: enum [new, in_progress, resolved, rejected], default: new
- **priority**: enum [low, medium, high], default: medium
- **created_at**: datetime
- **updated_at**: datetime

## 3. Карточка категории (Category)

- **id**: UUID
- **name**: string, не пустое → ошибка: «Введите название категории.»
- **description**: string, опционально
- **color**: string, hex-формат → ошибка: «Неверный формат цвета.»

## 4. Карточка комментария (Comment)

- **id**: UUID
- **report_id**: reference -> Report.id, не пустое → ошибка: «Выберите заявку.»
- **author_id**: reference -> User.id, не пустое → ошибка: «Укажите автора комментария.»
- **text**: string, не пустое, max 2000 → ошибка: «Текст комментария не может быть пустым (макс. 2000 символов).»
- **created_at**: datetime
- **is_public**: boolean, default: true

## 5. Карточка местоположения (Location)

- **id**: UUID
- **address**: string, не пустое → ошибка: «Введите адрес.»
- **latitude**: number, -90 to 90 → ошибка: «Неверное значение широты.»
- **longitude**: number, -180 to 180 → ошибка: «Неверное значение долготы.»
- **city**: string, не пустое → ошибка: «Введите город.»

## 6. Карточка модерации (Moderation)

- **id**: UUID
- **report_id**: reference -> Report.id, не пустое → ошибка: «Выберите заявку.»
- **moderator_id**: reference -> User.id, не пустое → ошибка: «Укажите модератора.»
- **action**: enum [approve, reject, request_changes], не пустое → ошибка: «Выберите действие модерации.»
- **comment**: string, max 1000
- **created_at**: datetime

## 7. Карточка пользователя (User)

- **id**: UUID
- **username**: string, уникальный, не пустое
- **email**: string, валидный email → ошибка: «Введите корректный email.»
- **role**: enum [citizen, moderator, admin], default: citizen
- **is_active**: boolean, default: true
