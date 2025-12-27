# Вариант 1 — Ключевые сущности, связи и API (эскиз)

Сущности (основные)

- User
  - id: UUID
  - email: string (unique)
  - username: string
  - password_hash: string
  - role: enum [admin, manager, user]

- Task
  - id: UUID
  - title: string
  - description: string
  - status: enum [new, in_progress, review, completed]
  - priority: enum [low, medium, high]
  - assignee_id: reference -> User.id
  - creator_id: reference -> User.id
  - due_date: date
  - created_at: datetime
  - updated_at: datetime

- Comment
  - id: UUID
  - task_id: reference -> Task.id
  - author_id: reference -> User.id
  - content: string
  - created_at: datetime

- Attachment
  - id: UUID
  - task_id: reference -> Task.id
  - filename: string
  - filepath: string
  - uploaded_by: reference -> User.id
  - created_at: datetime

- Notification
  - id: UUID
  - type: enum [task_assigned, task_updated, comment_added]
  - recipient_id: reference -> User.id
  - task_id: reference -> Task.id
  - read: boolean
  - created_at: datetime

Связи (ER-эскиз)

- User 1..* Task (creator)
- User 1..* Task (assignee)
- Task 1..* Comment
- Task 1..* Attachment
- User 1..* Notification

API — верхнеуровневые ресурсы и операции

- /auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout

- /users
  - GET /users (admin)
  - POST /users (admin)
  - GET /users/{id}
  - PUT /users/{id}
  - DELETE /users/{id}

- /tasks
  - GET /tasks (list, filter by status/priority/assignee)
  - POST /tasks
  - GET /tasks/{id}
  - PUT /tasks/{id}
  - DELETE /tasks/{id}
  - GET /tasks/user/{userId}

- /comments
  - GET /tasks/{id}/comments
  - POST /tasks/{id}/comments
  - DELETE /comments/{id}

- /attachments
  - POST /tasks/{id}/attachments
  - GET /attachments/{id}
  - DELETE /attachments/{id}

- /notifications
  - GET /notifications
  - PUT /notifications/{id}/read

Технологии
- Backend: Node.js, Express, PostgreSQL
- Frontend: React, TypeScript, Redux Toolkit
- Аутентификация: JWT
- Хранение файлов: Multer, локальное хранилище
- Уведомления: WebSocket (Socket.io)