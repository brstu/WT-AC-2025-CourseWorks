# Вариант 33 — ERD (диаграмма сущностей) — Органайзер «Без лишних чатов»

Файл содержит:

1. Mermaid‑диаграмму ERD.
2. ASCII‑эскиз.
3. Минимальный SQL DDL‑скетч для основных таблиц.

---

## 1. Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ MEMBERSHIP : joins
    GROUP ||--o{ MEMBERSHIP : has

    GROUP ||--o{ ANNOUNCEMENT : has
    GROUP ||--o{ FILE : stores
    GROUP ||--o{ EVENT : schedules
    GROUP ||--o{ POLL : runs
    POLL ||--o{ CHOICE : has
    POLL ||--o{ VOTE : collects
    GROUP ||--o{ CHAT : hosts
    CHAT ||--o{ MESSAGE : contains

    USER ||--o{ ANNOUNCEMENT : creates
    USER ||--o{ FILE : uploads
    USER ||--o{ EVENT : creates
    USER ||--o{ POLL : creates
    USER ||--o{ VOTE : votes
    USER ||--o{ MESSAGE : writes

    USER {
      id UUID PK
      name varchar
      email varchar
      password_hash varchar
      created_at timestamp
    }

    GROUP {
      id UUID PK
      name varchar
      description text
      is_private boolean
      created_at timestamp
      created_by UUID FK
    }

    MEMBERSHIP {
      id UUID PK
      user_id UUID FK
      group_id UUID FK
      role varchar  -- admin, moderator, member, guest
      joined_at timestamp
      is_active boolean
    }

    ANNOUNCEMENT {
      id UUID PK
      group_id UUID FK
      author_id UUID FK
      title varchar
      content text
      is_pinned boolean
      is_public boolean
      published_at timestamp
      created_at timestamp
      updated_at timestamp
    }

    FILE {
      id UUID PK
      group_id UUID FK
      uploader_id UUID FK
      name varchar
      description text
      file_path varchar
      file_size int
      mime_type varchar
      category varchar
      created_at timestamp
    }

    EVENT {
      id UUID PK
      group_id UUID FK
      creator_id UUID FK
      title varchar
      description text
      start_at timestamp
      end_at timestamp
      type varchar
      location varchar
      created_at timestamp
    }

    POLL {
      id UUID PK
      group_id UUID FK
      creator_id UUID FK
      question varchar
      is_anonymous boolean
      is_multiple_choice boolean
      expires_at timestamp
      created_at timestamp
    }

    CHOICE {
      id UUID PK
      poll_id UUID FK
      text varchar
      "order" int
    }

    VOTE {
      id UUID PK
      poll_id UUID FK
      choice_id UUID FK
      voter_id UUID FK
      created_at timestamp
    }

    CHAT {
      id UUID PK
      group_id UUID FK
      title varchar
      type varchar     -- group, private, topic
      is_read_only boolean
      created_by UUID FK
      created_at timestamp
    }

    MESSAGE {
      id UUID PK
      chat_id UUID FK
      author_id UUID FK
      content text
      attachments jsonb
      created_at timestamp
      edited_at timestamp
      is_deleted boolean
    }
```

---

## 2. ASCII‑эскиз

```text
User 1---* Membership *---1 Group

Group 1---* Announcement
Group 1---* File
Group 1---* Event
Group 1---* Poll 1---* Choice
Poll 1---* Vote *---1 User

Group 1---* Chat 1---* Message
User  1---* Message

User 1---* Announcement
User 1---* File
User 1---* Event
User 1---* Poll
```

---

## 3. Минимальный SQL DDL (пример, PostgreSQL)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID NOT NULL REFERENCES users(id)
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'member', 'guest')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (user_id, group_id)
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ,
    type TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    question TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    is_multiple_choice BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    choice_id UUID NOT NULL REFERENCES choices(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (poll_id, voter_id, choice_id)
);

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('group', 'private', 'topic')),
    is_read_only BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Индексы для производительности
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_group_id ON memberships(group_id);
CREATE INDEX idx_announcements_group_id ON announcements(group_id);
CREATE INDEX idx_files_group_id ON files(group_id);
CREATE INDEX idx_events_group_id ON events(group_id);
CREATE INDEX idx_polls_group_id ON polls(group_id);
CREATE INDEX idx_chats_group_id ON chats(group_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
```
