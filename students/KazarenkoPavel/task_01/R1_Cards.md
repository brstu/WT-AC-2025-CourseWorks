# Вариант 27 — Карточки (обязательные поля и валидации)

1. Форма аутентификации

   - username: string, не пустое → ошибка: «Введите имя пользователя.»
   - email: string, формат email → ошибка: «Введите корректный email.»
   - password: string, минимум 6 символов → ошибка: «Пароль должен содержать минимум 6 символов.»

2. Карточка задачи (Task)

   - id: UUID, автогенерируется
   - title: string, не пустое, max 200 → ошибка: «Введите название задачи (не более 200 символов).»
   - description: string, опционально, max 2000
   - priority: enum [low, medium, high], default: medium
   - status: enum [pending, in_progress, completed], default: pending
   - user_id: reference -> User.id, не пустое
   - tags: array of Tag.id, опционально

3. Карточка тега (Tag)

   - id: UUID, автогенерируется
   - name: string, не пустое, max 50 → ошибка: «Введите название тега (не более 50 символов).»
   - color: string, hex формат (#RRGGBB), опционально → ошибка: «Введите цвет в формате #RRGGBB.»
   - user_id: reference -> User.id, не пустое

4. Карточка сессии (Session)

   - id: UUID, автогенерируется
   - user_id: reference -> User.id, не пустое
   - task_id: reference -> Task.id, опционально
   - start_time: datetime, не пустое → ошибка: «Укажите время начала сессии.»
   - end_time: datetime, должно быть больше start_time → ошибка: «Время завершения должно быть позже времени начала.»
   - duration: integer (минуты), вычисляется или задаётся → ошибка: «Длительность должна быть положительным числом.»
   - status: enum [completed, interrupted], не пустое
   - session_type: enum [pomodoro, short_break, long_break], default: pomodoro

5. Форма создания отчёта

   - from: date, не пустое → ошибка: «Укажите начальную дату.»
   - to: date, не пустое, должно быть >= from → ошибка: «Конечная дата должна быть не раньше начальной.»
   - format: enum [csv, json], default: json

6. Настройки пользователя (опционально)

   - pomodoro_duration: integer (минуты), default: 25, от 1 до 60
   - short_break_duration: integer (минуты), default: 5, от 1 до 30
   - long_break_duration: integer (минуты), default: 15, от 1 до 60
   - notifications_enabled: boolean, default: true
