# Вариант 43 — Карточки (обязательные поля и валидации)

1. Форма аутентификации

- username: string, только алфавит, не пустое → ошибка: «Введите корректное имя пользователя (только буквы).»
- email: string, формат email, не пустое → ошибка: «Введите корректный email.»
- password: string, минимум 6 символов, не пустое → ошибка: «Введите пароль (минимум 6 символов).»

1. Карточка категории (Category)

- id: UUID, автогенерируется
- name: string, не пустое → ошибка: «Введите название категории.»
- description: string, опционально
- icon: string, опционально

1. Карточка запроса помощи (HelpRequest)

- id: UUID, автогенерируется
- user_id: reference -> User.id, не пустое → ошибка: «Пользователь не определён.»
- category_id: reference -> Category.id, не пустое → ошибка: «Выберите категорию помощи.»
- title: string, не пустое, минимум 5 символов → ошибка: «Введите заголовок (минимум 5 символов).»
- description: string, не пустое, минимум 10 символов → ошибка: «Введите описание (минимум 10 символов).»
- status: enum [new, assigned, in_progress, completed, cancelled], default: new
- location_lat: number, опционально
- location_lng: number, опционально
- location_address: string, не пустое → ошибка: «Укажите адрес или локацию.»

1. Карточка профиля волонтёра (VolunteerProfile)

- id: UUID, автогенерируется
- user_id: reference -> User.id, не пустое → ошибка: «Пользователь не определён.»
- bio: string, опционально, максимум 500 символов
- rating: number, автоматически рассчитывается
- total_helps: number, default: 0
- categories: array, опционально
- location_lat: number, опционально
- location_lng: number, опционально

1. Карточка назначения (Assignment)

- id: UUID, автогенерируется
- request_id: reference -> HelpRequest.id, не пустое → ошибка: «Запрос помощи не определён.»
- volunteer_id: reference -> User.id, не пустое → ошибка: «Волонтёр не определён.»
- status: enum [assigned, in_progress, completed, cancelled], default: assigned
- assigned_at: datetime, автогенерируется
- completed_at: datetime, опционально

1. Карточка отзыва (Review)

- id: UUID, автогенерируется
- assignment_id: reference -> Assignment.id, не пустое → ошибка: «Назначение не определено.»
- user_id: reference -> User.id, не пустое
- volunteer_id: reference -> User.id, не пустое
- rating: number, диапазон 1-5, не пустое → ошибка: «Укажите оценку от 1 до 5.»
- comment: string, опционально, максимум 1000 символов
- created_at: datetime, автогенерируется

1. Сообщение в чате (заглушка)

- id: UUID, автогенерируется
- assignment_id: reference -> Assignment.id, не пустое
- sender_id: reference -> User.id, не пустое
- message: string, не пустое, максимум 500 символов → ошибка: «Введите сообщение (максимум 500 символов).»
- created_at: datetime, автогенерируется
