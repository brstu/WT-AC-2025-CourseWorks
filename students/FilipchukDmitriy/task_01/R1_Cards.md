# Вариант 16 — Карточки (обязательные поля и валидации)

1. Форма аутентификации

- username: string, только алфавит и цифры, не пустое → ошибка: «Введите корректное имя пользователя.»
- password: string, не пустое → ошибка: «Введите пароль.»

1. Карточка тетради (Notebook)

- id: UUID, автогенерируется
- title: string, не пустое → ошибка: «Введите название тетради.»
- description: string, опционально
- owner_id: reference -> User.id, не пустое → ошибка: «Владелец не указан.»

1. Карточка заметки (Note)

- id: UUID
- notebook_id: reference -> Notebook.id, не пустое → ошибка: «Выберите тетрадь.»
- title: string, не пустое → ошибка: «Введите заголовок заметки.»
- content: text, опционально

1. Карточка метки (Label)

- id: UUID
- name: string, не пустое → ошибка: «Введите название метки.»
- color: string, опционально (формат HEX)
- owner_id: reference -> User.id, не пустое

1. Карточка доступа (Share)

- id: UUID
- notebook_id: reference -> Notebook.id, не пустое → ошибка: «Выберите тетрадь.»
- user_id: reference -> User.id, не пустое → ошибка: «Выберите пользователя.»
- permission: enum [read, write], не пустое → ошибка: «Укажите уровень доступа.»
- created_at: datetime

1. Связь заметки и метки (NoteLabel)

- note_id: reference -> Note.id, не пустое
- label_id: reference -> Label.id, не пустое
