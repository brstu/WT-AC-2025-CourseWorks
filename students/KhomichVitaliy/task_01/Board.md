# Вариант 1 — Карточки (обязательные поля и валидации)

1) Форма аутентификации
    - email: string, email формат, не пустое → ошибка: «Введите корректный email.»
    - password: string, не пустое → ошибка: «Введите пароль.»

2) Карточка задачи (Task)
    - id: UUID, автогенерируется
    - title: string, не пустое → ошибка: «Введите заголовок задачи.»
    - description: string, опционально
    - status: enum [new, in_progress, review, completed], default: new
    - priority: enum [low, medium, high], default: medium
    - assignee_id: reference -> User.id, не пустое → ошибка: «Выберите исполнителя.»
    - creator_id: reference -> User.id, не пустое → ошибка: «Создатель обязателен.»

3) Карточка пользователя (User)
    - id: UUID
    - email: string, unique, email формат → ошибка: «Email уже существует.»
    - username: string, не пустое → ошибка: «Введите имя пользователя.»
    - role: enum [admin, manager, user], default: user
    - password_hash: string, не пустое

4) Карточка комментария (Comment)
    - id: UUID
    - task_id: reference -> Task.id, не пустое → ошибка: «Выберите задачу.»
    - author_id: reference -> User.id, не пустое → ошибка: «Автор обязателен.»
    - content: string, не пустое → ошибка: «Комментарий не может быть пустым.»
    - created_at: datetime

5) Карточка вложения (Attachment)
    - id: UUID
    - task_id: reference -> Task.id, не пустое → ошибка: «Выберите задачу.»
    - filename: string, не пустое → ошибка: «Имя файла обязательно.»
    - filepath: string, не пустое
    - uploaded_by: reference -> User.id, не пустое

6) Карточка уведомления (Notification)
    - type: enum [task_assigned, task_updated, comment_added], не пустое
    - recipient_id: reference -> User.id, не пустое
    - task_id: reference -> Task.id, не пустое
    - read: boolean, default: false