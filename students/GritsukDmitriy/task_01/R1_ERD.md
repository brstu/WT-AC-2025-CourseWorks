# Вариант 24 — ERD (диаграмма сущностей) — Roadmaps «Как стать джуном»

Файл содержит: 1) mermaid-диаграмму ERD; 2) ASCII-эскиз; 3) минимальный SQL DDL-скетч для создания таблиц.

## Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ PROGRESS : tracks
    ROADMAP ||--o{ STEP : contains
    STEP ||--o{ RESOURCE : has
    STEP ||--o{ PROGRESS : completed_by

    USER {
        id int PK
        username varchar
        email varchar
        password_hash varchar
        role varchar
        created_at datetime
        updated_at datetime
    }
    ROADMAP {
        id int PK
        title varchar
        description text
        category varchar
        difficulty varchar
        is_published boolean
        created_at datetime
        updated_at datetime
    }
    STEP {
        id int PK
        roadmap_id int FK
        title varchar
        description text
        order int
        created_at datetime
        updated_at datetime
    }
    RESOURCE {
        id int PK
        step_id int FK
        title varchar
        url varchar
        type varchar
        created_at datetime
        updated_at datetime
    }
    PROGRESS {
        id int PK
        user_id int FK
        step_id int FK
        completed boolean
        completed_at datetime
    }
```

## ASCII-эскиз

```text
Roadmap 1---* Step 1---* Resource
                  \
                   \---* Progress *---1 User
```

## Минимальный SQL DDL (пример, PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE roadmaps (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE steps (
    id UUID PRIMARY KEY,
    roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE resources (
    id UUID PRIMARY KEY,
    step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('article','video','course')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE progress (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    step_id UUID NOT NULL REFERENCES steps(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, step_id)
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_roadmaps_category ON roadmaps(category);
CREATE INDEX idx_roadmaps_difficulty ON roadmaps(difficulty);
CREATE INDEX idx_roadmaps_is_published ON roadmaps(is_published);
CREATE INDEX idx_steps_roadmap_id ON steps(roadmap_id);
CREATE INDEX idx_resources_step_id ON resources(step_id);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_step_id ON progress(step_id);
```
