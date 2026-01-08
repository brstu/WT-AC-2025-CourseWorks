# Вариант 1 — ERD (диаграмма сущностей) — Task Manager

```mermaid
erDiagram
    USER ||--o{ TASK : creates
    USER ||--o{ TASK : assigned
    TASK ||--o{ COMMENT : has
    TASK ||--o{ ATTACHMENT : has
    USER ||--o{ NOTIFICATION : receives

    USER {
        id UUID PK
        email string
        username string
        password_hash string
        role string
    }

    TASK {
        id UUID PK
        title string
        description text
        status string
        priority string
        assignee_id UUID FK
        creator_id UUID FK
        due_date date
        created_at datetime
        updated_at datetime
    }

    COMMENT {
        id UUID PK
        task_id UUID FK
        author_id UUID FK
        content text
        created_at datetime
    }

    ATTACHMENT {
        id UUID PK
        task_id UUID FK
        filename string
        filepath string
        uploaded_by UUID FK
        created_at datetime
    }

    NOTIFICATION {
        id UUID PK
        type string
        recipient_id UUID FK
        task_id UUID FK
        read boolean
        created_at datetime
    }