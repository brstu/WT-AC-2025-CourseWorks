# Вариант 03 — ERD (диаграмма сущностей)

## Mini-LMS «Учись, не болей»

Файл содержит:

1) Mermaid-диаграмму ERD
2) ASCII-эскиз
3) Модели данных (Python, FastAPI / Pydantic / SQLite)
4) Пример SQL DDL

---

## Mermaid ERD

```mermaid
erDiagram
    USER ||--o{ COURSE : creates
    COURSE ||--o{ MODULE : contains
    MODULE ||--o{ LESSON : contains
    LESSON ||--o{ ASSIGNMENT : contains

    USER ||--o{ ENROLLMENT : enrolls
    COURSE ||--o{ ENROLLMENT : has

    USER ||--o{ SUBMISSION : submits
    ASSIGNMENT ||--o{ SUBMISSION : receives

    SUBMISSION ||--|| GRADE : graded_by

    USER {
        integer id PK
        string name
        string email UK
        string password
        string role
        datetime created_at
    }

    COURSE {
        integer id PK
        string title
        string category
        string difficulty_level
        boolean is_published
        integer author_id FK
        datetime created_at
    }

    MODULE {
        integer id PK
        string title
        integer course_id FK
        integer order_index
    }

    LESSON {
        integer id PK
        string title
        string content
        integer module_id FK
        integer order_index
    }

    ASSIGNMENT {
        integer id PK
        string title
        string description
        integer lesson_id FK
        integer points_possible
        datetime due_date
    }

    SUBMISSION {
        integer id PK
        integer assignment_id FK
        integer user_id FK
        string status
        datetime created_at
        datetime submitted_at
        datetime graded_at
    }

    GRADE {
        integer id PK
        integer submission_id FK
        integer points_earned
        integer points_possible
        float percentage
        string feedback
        datetime created_at
    }

    ENROLLMENT {
        integer id PK
        integer user_id FK
        integer course_id FK
        datetime enrolled_at
        float progress_percentage
    }
````

---

## ASCII-эскиз

```bash
User 1---* Course
Course 1---* Module 1---* Lesson 1---* Assignment
User 1---* Enrollment *---1 Course
User 1---* Submission *---1 Assignment 1---1 Grade
```

---

## Модели данных (Python, FastAPI)

```python
class User:
    id: int
    name: str
    email: str
    password: str
    role: str
    created_at: datetime

class Course:
    id: int
    title: str
    description: str
    category: str
    difficulty_level: str
    is_published: bool
    author_id: int
    created_at: datetime

class Module:
    id: int
    title: str
    course_id: int
    order_index: int

class Lesson:
    id: int
    title: str
    content: str
    module_id: int
    order_index: int

class Assignment:
    id: int
    title: str
    description: str
    lesson_id: int
    points_possible: int
    due_date: datetime

class Submission:
    id: int
    assignment_id: int
    user_id: int
    status: str
    created_at: datetime
    submitted_at: datetime
    graded_at: datetime

class Grade:
    id: int
    submission_id: int
    points_earned: int
    points_possible: int
    percentage: float
    feedback: str
    created_at: datetime

class Enrollment:
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    progress_percentage: float
```

---

## SQL DDL (пример для SQLite / PostgreSQL)

```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('student','teacher','admin')) DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE course (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty_level TEXT CHECK(difficulty_level IN ('beginner','intermediate','advanced')),
    is_published BOOLEAN DEFAULT 0,
    author_id INTEGER NOT NULL REFERENCES user(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE module (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    course_id INTEGER NOT NULL REFERENCES course(id),
    order_index INTEGER
);

CREATE TABLE lesson (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    module_id INTEGER NOT NULL REFERENCES module(id),
    order_index INTEGER
);

CREATE TABLE assignment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    lesson_id INTEGER NOT NULL REFERENCES lesson(id),
    points_possible INTEGER DEFAULT 100,
    due_date DATETIME
);

CREATE TABLE submission (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL REFERENCES assignment(id),
    user_id INTEGER NOT NULL REFERENCES user(id),
    status TEXT CHECK(status IN ('pending','submitted','graded','late')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME,
    graded_at DATETIME,
    UNIQUE(user_id, assignment_id)
);

CREATE TABLE grade (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL UNIQUE REFERENCES submission(id),
    points_earned INTEGER CHECK(points_earned BETWEEN 0 AND 100),
    points_possible INTEGER DEFAULT 100,
    percentage REAL,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES user(id),
    course_id INTEGER NOT NULL REFERENCES course(id),
    enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    progress_percentage REAL DEFAULT 0,
    UNIQUE(user_id, course_id)
);
