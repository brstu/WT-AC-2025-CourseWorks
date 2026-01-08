# R1 — ERD (диаграмма сущностей)

Диаграмма и минимальный SQL DDL, адаптированы к фактическим моделям проекта.

## Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ METRIC : owns
    METRIC ||--o{ GOAL : has
    METRIC ||--o{ ENTRY : records

    USER {
      id int PK
      email varchar
      password_hash varchar
      created_at datetime
    }
    METRIC {
      id int PK
      user_id int FK
      name varchar
      unit varchar
      target_value float
      color varchar
    }
    GOAL {
      id int PK
      metric_id int FK
      target_value float
      period varchar
      start_date date
      end_date date
    }
    ENTRY {
      id int PK
      metric_id int FK
      value float
      date date
      note varchar
      created_at datetime
    }
```

## ASCII-эскиз

```
User 1---* Metric 1---* Goal
               \
                \-*- Entry (many by date)
```

## Минимальный SQL DDL (пример, SQLite/Postgres)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP
);

CREATE TABLE metrics (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit TEXT,
    target_value REAL,
    color TEXT
);

CREATE INDEX idx_metrics_user_id ON metrics(user_id);

CREATE TABLE goals (
    id INTEGER PRIMARY KEY,
    metric_id INTEGER NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
    target_value REAL NOT NULL,
    period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE
);

CREATE TABLE entries (
    id INTEGER PRIMARY KEY,
    metric_id INTEGER NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
    value REAL NOT NULL,
    date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMP
);

CREATE INDEX idx_entries_metric_date ON entries(metric_id, date);
```
