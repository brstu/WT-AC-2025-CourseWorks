# Вариант 04 — Карточки (обязательные поля и валидации)

- Форма аутентификации

- username: string, только алфавит, не пустое → ошибка: «Введите корректное имя пользователя (только буквы).»
- password: string, не пустое → ошибка: «Введите пароль.»

- Карточка привычки (Habit)

- id: UUID, автогенерируется
- user_id: reference -> User.id, не пустое → ошибка: «Привычка должна быть привязана к пользователю.»
- title: string, не пустое → ошибка: «Введите название привычки.»
- description: string, опционально
- frequency: enum [daily, weekly, custom], не пустое → ошибка: «Выберите периодичность.»
- category: string, опционально
- is_public: boolean, default: false

- Карточка цели (Goal)

- id: UUID, автогенерируется
- habit_id: reference -> Habit.id, не пустое → ошибка: «Выберите привычку.»
- target_value: number, не пустое → ошибка: «Введите целевое значение.»
- deadline: date, опционально
- unit: string, опционально (например, «раз», «минут», «страниц»)

- Карточка отметки выполнения (Entry)

- id: UUID, автогенерируется
- habit_id: reference -> Habit.id, не пустое → ошибка: «Выберите привычку.»
- date: date, не пустое → ошибка: «Выберите дату.»
- value: number, не пустое → ошибка: «Введите значение выполнения.»
- comment: string, опционально

- Карточка напоминания (Reminder)

- id: UUID, автогенерируется
- habit_id: reference -> Habit.id, не пустое → ошибка: «Выберите привычку.»
- time: time, не пустое → ошибка: «Укажите время напоминания.»
- days_of_week: array of enum [mon, tue, wed, thu, fri, sat, sun], не пустое → ошибка: «Выберите дни недели.»
- is_active: boolean, default: true

- Карточка статистики/streak (вычисляемая или отдельная сущность)

- habit_id: reference -> Habit.id
- current_streak: integer, default: 0
- longest_streak: integer, default: 0
- last_entry_date: date, опционально

- Карточка категории (опционально)

- id: UUID, автогенерируется
- user_id: reference -> User.id, не пустое
- name: string, не пустое → ошибка: «Введите название категории.»
- color: string, опционально
