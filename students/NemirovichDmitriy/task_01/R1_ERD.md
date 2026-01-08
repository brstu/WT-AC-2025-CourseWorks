# Вариант 35 — ERD (диаграмма сущностей) — Поездки «Поехали!»

Файл содержит: 1) mermaid-диаграмму ERD; 2) ASCII-эскиз; 3) минимальный SQL DDL-скетч для создания таблиц.

## Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ TRIP : owns
    TRIP ||--o{ STOP : has
    TRIP ||--o{ NOTE : has
    TRIP ||--o{ EXPENSE : has
    USER ||--o{ NOTE : writes
    USER ||--o{ EXPENSE : adds
    TRIP ||--o{ TRIP_PARTICIPANT : has
    USER ||--o{ TRIP_PARTICIPANT : participates

    USER {
        id int PK
        username varchar
        email varchar
        password_hash varchar
        role varchar
        created_at datetime
        updated_at datetime
    }
    TRIP {
        id int PK
        title varchar
        description text
        start_date date
        end_date date
        budget float
        owner_id int FK
        created_at datetime
        updated_at datetime
    }
    STOP {
        id int PK
        trip_id int FK
        name varchar
        address varchar
        latitude float
        longitude float
        arrival_date datetime
        departure_date datetime
        order int
        created_at datetime
        updated_at datetime
    }
    NOTE {
        id int PK
        trip_id int FK
        author_id int FK
        content text
        created_at datetime
        updated_at datetime
    }
    EXPENSE {
        id int PK
        trip_id int FK
        author_id int FK
        amount float
        category varchar
        description text
        date date
        created_at datetime
        updated_at datetime
    }
    TRIP_PARTICIPANT {
        id int PK
        trip_id int FK
        user_id int FK
        joined_at datetime
    }
```

## ASCII-эскиз

```text
User 1---* Trip 1---* Stop
     \           \
      \           \-* Note
       \          \-* Expense
        \
         \-*- TripParticipant (User many-to-many Trip)
```

## Минимальный SQL DDL (пример, PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE trips (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DOUBLE PRECISION,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE stops (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    arrival_date TIMESTAMP WITH TIME ZONE,
    departure_date TIMESTAMP WITH TIME ZONE,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE notes (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    category TEXT,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE trip_participants (
    id UUID PRIMARY KEY,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(trip_id, user_id)
);

-- Индексы для производительности
CREATE INDEX idx_trips_owner ON trips(owner_id);
CREATE INDEX idx_stops_trip ON stops(trip_id);
CREATE INDEX idx_stops_order ON stops(trip_id, "order");
CREATE INDEX idx_notes_trip ON notes(trip_id);
CREATE INDEX idx_notes_author ON notes(author_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);
CREATE INDEX idx_expenses_author ON expenses(author_id);
CREATE INDEX idx_trip_participants_trip ON trip_participants(trip_id);
CREATE INDEX idx_trip_participants_user ON trip_participants(user_id);
```
