# Вариант 39 — «Список дел» — R1 ERD

## Mermaid ERD

```mermaid
erDiagram
  USER ||--o{ TASK : owns
  TASK ||--o{ SUBTASK : contains
  TASK ||--o{ FILE : attaches
  TASK ||--o{ REMINDER : schedules
  USER ||--o{ TAG : owns
  TASK ||--o{ TASK_TAG : links
  TAG  ||--o{ TASK_TAG : links

  USER {
    int id PK
    string username
    string email
    string password_hash
    string role
    datetime created_at
  }

  TASK {
    int id PK
    int owner_id FK
    string title
    string description
    bool is_done
    datetime due_at
    int repeat_interval_minutes
    datetime created_at
    datetime updated_at
  }

  SUBTASK {
    int id PK
    int task_id FK
    string title
    bool is_done
    datetime created_at
  }

  TAG {
    int id PK
    int owner_id FK
    string name
    string color
    datetime created_at
  }

  TASK_TAG {
    int task_id FK
    int tag_id FK
  }

  FILE {
    int id PK
    int task_id FK
    string filename
    string mime_type
    int size_bytes
    string storage_path
    datetime uploaded_at
  }

  REMINDER {
    int id PK
    int task_id FK
    datetime remind_at
    string message
    datetime created_at
  }
````

## ASCII-эскиз

```text
User 1---* Task 1---* SubTask
   \          \
    \          *---* TaskTag *---1 Tag
     \
      *---* Tag (owner)
Task 1---* File
Task 1---* Reminder

Calendar = VIEW(Task by due_at)
```
