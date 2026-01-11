# Вариант 44 — ERD (диаграмма сущностей) — Учебные квизы «Проверим быстро»

## Mermaid ERD

```bash

erDiagram
    USER ||--o{ QUIZ : creates
    USER ||--o{ QUIZ_ATTEMPT : attempts
    QUIZ ||--o{ QUESTION : contains
    QUESTION ||--o{ OPTION : has
    QUIZ_ATTEMPT ||--o{ ATTEMPT_ANSWER : includes
    
    USER {
        id int PK
        email varchar
        username varchar
        full_name varchar
        hashed_password varchar
        role varchar
        is_active boolean
        created_at datetime
    }
    
    QUIZ {
        id int PK
        title varchar
        description text
        time_limit_minutes int
        creator_id int FK
        is_active boolean
        created_at datetime
    }
    
    QUESTION {
        id int PK
        quiz_id int FK
        text text
        explanation text
        points int
        order_index int
    }
    
    OPTION {
        id int PK
        question_id int FK
        text text
        is_correct boolean
        order_index int
    }
    
    QUIZ_ATTEMPT {
        id int PK
        user_id int FK
        quiz_id int FK
        started_at datetime
        finished_at datetime
        time_spent_seconds int
        total_points int
        max_points int
        is_completed boolean
    }
    
    ATTEMPT_ANSWER {
        id int PK
        attempt_id int FK
        question_id int FK
        option_id int FK
        is_correct boolean
        points_earned int
        answered_at datetime
    }

    ASCII-эскиз
```

User 1---*Quiz (creator)    User 1---* QuizAttempt (participant)
       \                              |
        \                             |
         *---* QuizAttempt ---* AttemptAnswer
                |
                *--- Quiz
                     |
                     *---* Question ---* Option

SQL DDL (PostgreSQL)

```bash

-- Пользователи

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(200),
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Квизы
CREATE TABLE quizzes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER DEFAULT 5,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Вопросы
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    explanation TEXT,
    points INTEGER DEFAULT 1 CHECK (points >= 1 AND points <= 10),
    order_index INTEGER DEFAULT 0
);

-- Варианты ответов
CREATE TABLE options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0
);

-- Попытки прохождения
CREATE TABLE quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER,
    total_points INTEGER DEFAULT 0,
    max_points INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false
);

-- Ответы на вопросы в попытке
CREATE TABLE attempt_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_id INTEGER REFERENCES options(id) ON DELETE SET NULL,
    is_correct BOOLEAN DEFAULT false,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX idx_quizzes_creator_id ON quizzes(creator_id);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX idx_attempt_answers_attempt_id ON attempt_answers(attempt_id);
CREATE INDEX idx_attempt_answers_question_id ON attempt_answers(question_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```
