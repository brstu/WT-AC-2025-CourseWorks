# Вариант 44 — Карточки (обязательные поля и валидации)

## 1. Форма аутентификации

- **email**: string, email формат, не пустое → ошибка: «Введите корректный email.»
- **username**: string, только латинские буквы и цифры, 3-50 символов → ошибка: «Имя пользователя должно содержать 3-50 символов (буквы и цифры).»
- **password**: string, минимум 6 символов → ошибка: «Пароль должен содержать минимум 6 символов.»
- **full_name**: string, опционально, максимум 200 символов

## 2. Карточка квиза (Quiz)

- **id**: integer, primary key, автогенерируется
- **title**: string, не пустое, 3-200 символов → ошибка: «Введите название квиза (3-200 символов).»
- **description**: string, опционально
- **time_limit_minutes**: integer, 1-60 минут → ошибка: «Время должно быть от 1 до 60 минут.»
- **creator_id**: reference → User.id, не пустое
- **is_active**: boolean, default: true

## 3. Карточка вопроса (Question)

- **id**: integer, primary key, автогенерируется
- **quiz_id**: reference → Quiz.id, не пустое → ошибка: «Выберите квиз.»
- **text**: string, не пустое → ошибка: «Введите текст вопроса.»
- **explanation**: string, опционально
- **points**: integer, 1-10 баллов → ошибка: «Количество баллов должно быть от 1 до 10.»

## 4. Карточка варианта ответа (Option)

- **id**: integer, primary key, автогенерируется
- **question_id**: reference → Question.id, не пустое → ошибка: «Выберите вопрос.»
- **text**: string, не пустое → ошибка: «Введите текст варианта ответа.»
- **is_correct**: boolean, default: false

## 5. Карточка попытки (QuizAttempt)

- **id**: integer, primary key, автогенерируется
- **user_id**: reference → User.id, не пустое
- **quiz_id**: reference → Quiz.id, не пустое → ошибка: «Выберите квиз.»
- **started_at**: datetime, автогенерируется
- **finished_at**: datetime, опционально
- **time_spent_seconds**: integer, опционально
- **total_points**: integer, default: 0
- **max_points**: integer, default: 0
- **is_completed**: boolean, default: false

## 6. Карточка ответа на вопрос (AttemptAnswer)

- **id**: integer, primary key, автогенерируется
- **attempt_id**: reference → QuizAttempt.id, не пустое → ошибка: «Выберите попытку.»
- **question_id**: reference → Question.id, не пустое → ошибка: «Выберите вопрос.»
- **option_id**: reference → Option.id, опционально
- **is_correct**: boolean, default: false
- **points_earned**: integer, default: 0

## 7. Карточка результата (Result)

- **id**: integer, primary key, автогенерируется
- **attempt_id**: reference → QuizAttempt.id, уникальное
- **score_percentage**: float, 0-100 → ошибка: «Процент должен быть от 0 до 100.»
- **passed**: boolean, опционально
- **feedback**: string, опционально, максимум 500 символов
- **generated_at**: datetime, автогенерируется
