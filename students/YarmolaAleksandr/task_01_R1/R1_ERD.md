# Вариант 09 — ERD (диаграмма сущностей) — Блог «Лонгрид? Коротко!»

Файл содержит: 1) mermaid-диаграмму ERD; 2) ASCII-эскиз; 3) минимальный SQL DDL-скетч для создания таблиц.

## Mermaid ERD

```
erDiagram
USER ||--o{ POST : creates
POST ||--o{ COMMENT : has
POST }o--o{ TAG : tagged
POST ||--o{ LIKE : has
USER ||--o{ COMMENT : writes
USER ||--o{ LIKE : gives
```

```
USER {
    id int PK
    email varchar
    password_hash varchar
    name varchar
    role varchar
}
POST {
    id int PK
    title varchar
    content text
    published boolean
    author_id int FK
    created_at datetime
}
TAG {
    id int PK
    name varchar
}
COMMENT {
    id int PK
    content text
    post_id int FK
    author_id int FK
    created_at datetime
}
LIKE {
    id int PK
    post_id int FK
    user_id int FK
}
```

## ASCII-эскиз

User 1---* Post --- Comment
| |
--- Like --- Tag (many-to-many)

## Минимальный SQL DDL (пример, PostgreSQL)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','user')),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT false,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE post_tags (
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE likes (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id),
    created_at TIMESTAMP DEFAULT now()
);
```
