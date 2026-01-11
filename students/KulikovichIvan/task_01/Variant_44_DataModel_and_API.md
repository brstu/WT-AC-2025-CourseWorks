# Вариант 44 — Ключевые сущности, связи и API (эскиз)

## Сущности (основные)

### User

- **id**: integer, primary key
- **email**: string (unique)
- **username**: string (unique)
- **full_name**: string
- **hashed_password**: string
- **role**: enum [admin, user]
- **is_active**: boolean
- **created_at**: datetime

### Quiz

- **id**: integer, primary key
- **title**: string
- **description**: string
- **time_limit_minutes**: integer
- **creator_id**: reference → User.id
- **is_active**: boolean
- **created_at**: datetime

### Question

- **id**: integer, primary key
- **quiz_id**: reference → Quiz.id
- **text**: string
- **explanation**: string
- **points**: integer
- **order_index**: integer

### Option

- **id**: integer, primary key
- **question_id**: reference → Question.id
- **text**: string
- **is_correct**: boolean
- **order_index**: integer

### QuizAttempt

- **id**: integer, primary key
- **user_id**: reference → User.id
- **quiz_id**: reference → Quiz.id
- **started_at**: datetime
- **finished_at**: datetime
- **time_spent_seconds**: integer
- **total_points**: integer
- **max_points**: integer
- **is_completed**: boolean

### AttemptAnswer

- **id**: integer, primary key
- **attempt_id**: reference → QuizAttempt.id
- **question_id**: reference → Question.id
- **option_id**: reference → Option.id
- **is_correct**: boolean
- **points_earned**: integer
- **answered_at**: datetime

## Связи (ER-эскиз)

- User 1..* Quiz (пользователь создает квизы, если админ)
- User 1..* QuizAttempt (пользователь проходит попытки)
- Quiz 1..* Question (квиз содержит вопросы)
- Question 1..* Option (вопрос имеет варианты ответов)
- QuizAttempt 1..* AttemptAnswer (попытка содержит ответы на вопросы)
- QuizAttempt 1..1 Quiz (попытка относится к одному квизу)

## Обязательные поля и ограничения

- unique(User.email)
- unique(User.username)
- Quiz.creator_id → User.id (FK, not null)
- Question.quiz_id → Quiz.id (FK, not null)
- Option.question_id → Question.id (FK, not null)
- QuizAttempt.user_id → User.id (FK, not null)
- QuizAttempt.quiz_id → Quiz.id (FK, not null)
- AttemptAnswer.attempt_id → QuizAttempt.id (FK, not null)
- AttemptAnswer.question_id → Question.id (FK, not null)

## API — верхнеуровневые ресурсы и операции

### /auth

- POST `/auth/register` - регистрация пользователя
- POST `/auth/login` - вход в систему
- POST `/auth/refresh` - обновление токена

### /users

- GET `/users/me` - получение профиля текущего пользователя
- GET `/users/me/stats` - статистика пользователя
- GET `/users/me/attempts` - попытки пользователя

### /quizzes

- GET `/quizzes` - список доступных квизов
- GET `/quizzes/{id}` - детали квиза с вопросами
- POST `/quizzes` - создание квиза (админ)
- GET `/quizzes/{id}/stats` - статистика по квизу (админ)

### /questions

- GET `/questions/{id}` - детали вопроса

### /options

- GET `/options/{id}` - детали варианта ответа

### /attempts

- POST `/attempts/start` - начать попытку квиза
- POST `/attempts/{id}/submit` - завершить попытку и отправить ответы
- GET `/attempts/{id}` - детали попытки
- GET `/attempts/{id}/validate-time` - проверка оставшегося времени

### /results

- GET `/results/{attempt_id}` - результаты попытки

### /admin

- POST `/admin/quizzes` - создание квиза (админ)
- GET `/admin/stats` - общая статистика платформы (админ)

## Дополнительно (бонусы)

- WebSocket `/ws/quizzes/{id}/progress` - отслеживание прогресса в реальном времени
- WebSocket `/ws/notifications` - уведомления о новых квизах и результатах
- Экспорт результатов: JSON, CSV, Excel
- Генерация сертификатов об успешном прохождении
- Система рейтингов и достижений
