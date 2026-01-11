# Вариант 03 — Ключевые сущности, связи и API (эскиз)

## Проект: Mini-LMS «Учись, не болей»

---

## Сущности (основные)

### User (пользователь)

- id: integer (primary key)
- name: string (not null)
- email: string (unique, not null)
- password: string (min 6 chars, not null)
- role: enum [student, teacher, admin] (default: student)
- created_at: datetime (default: utcnow)

---

### Course (курс)

- id: integer (primary key)
- title: string (not null)
- description: string (optional)
- category: string (optional)
- difficulty_level: enum [beginner, intermediate, advanced] (optional)
- is_published: boolean (default: false)
- author_id: integer (foreign key → User.id, not null)
- created_at: datetime (default: utcnow)

---

### Module (модуль курса)

- id: integer (primary key)
- title: string (not null)
- course_id: integer (foreign key → Course.id, not null)
- order_index: integer (optional)

---

### Lesson (урок)

- id: integer (primary key)
- title: string (not null)
- content: string (optional)
- module_id: integer (foreign key → Module.id, not null)
- order_index: integer (optional)

---

### Assignment (задание)

- id: integer (primary key)
- title: string (not null)
- description: string (optional)
- lesson_id: integer (foreign key → Lesson.id, not null)
- points_possible: integer (0–100, default: 100)
- due_date: datetime (optional)

---

### Submission (сдача задания)

- id: integer (primary key)
- assignment_id: integer (foreign key → Assignment.id, not null)
- user_id: integer (foreign key → User.id, not null)
- status: enum [pending, submitted, graded, late] (default: pending)
- created_at: datetime (default: utcnow)
- submitted_at: datetime (optional)
- graded_at: datetime (optional)
- unique(user_id, assignment_id)

---

### Grade (оценка)

- id: integer (primary key)
- submission_id: integer (foreign key → Submission.id, not null, unique)
- points_earned: integer (0–100, not null)
- points_possible: integer (default: 100)
- percentage: float (computed: points_earned / points_possible * 100)
- feedback: string (optional)
- created_at: datetime (default: utcnow)

---

### Enrollment (запись на курс)

- id: integer (primary key)
- user_id: integer (foreign key → User.id, not null)
- course_id: integer (foreign key → Course.id, not null)
- enrolled_at: datetime (default: utcnow)
- progress_percentage: float (default: 0)
- unique(user_id, course_id)

---

## Связи (ER-эскиз)

- User 1..* Course (преподаватель создаёт курсы)
- Course 1..* Module
- Module 1..* Lesson
- Lesson 1..* Assignment
- User 1..* Submission
- Assignment 1..* Submission
- Submission 1..1 Grade
- User 1..* Enrollment
- Course 1..* Enrollment

---

## Обязательные поля и ограничения (кратко)

- User.email: уникальное
- User.password: минимум 6 символов
- Course.title: not null
- Module.course_id → Course.id (FK, not null)
- Lesson.module_id → Module.id (FK, not null)
- Assignment.lesson_id → Lesson.id (FK, not null)
- Submission: уникальная пара (user_id, assignment_id)
- Grade.submission_id: уникальное (одна оценка на сдачу)
- Grade.points_earned ∈ [0..100]
- Enrollment: уникальная пара (user_id, course_id)

---

## API — верхнеуровневые ресурсы и операции

### Auth

- POST `/register` — регистрация пользователя  
  Payload: `{ name, email, password }`
- POST `/login` — вход в систему  
  Payload: `{ email, password }`
- GET `/profile` — данные текущего пользователя
- GET `/profile/stats` — статистика обучения студента

---

### Courses

- GET `/courses` — список курсов
- POST `/courses` — создать курс (teacher/admin)
- GET `/courses/{id}` — детали курса
- PATCH `/courses/{id}` — редактировать курс (teacher/admin)
- DELETE `/courses/{id}` — удалить курс (teacher/admin)

---

### Modules / Lessons

- POST `/courses/{course_id}/modules` — создать модуль
- POST `/modules/{module_id}/lessons` — создать урок
- GET `/modules/{id}` — детали модуля
- GET `/lessons/{id}` — детали урока

---

### Assignments

- POST `/lessons/{lesson_id}/assignments` — создать задание
- GET `/assignments/{id}` — детали задания
- POST `/assignments/{id}/start` — начать задание (student)
- POST `/assignments/{id}/submit-simple` — сдать задание
- GET `/assignments/my` — задания студента
- GET `/teaching/assignments` — задания преподавателя

---

### Submissions / Grades

- GET `/assignments/{id}/submissions` — сдачи студентов (teacher)
- POST `/submissions/{id}/grade` — выставить оценку (teacher)
- GET `/my/submissions` — сдачи студента
- GET `/grades/detailed` — оценки студента

---

### Enrollment

- POST `/courses/{id}/enroll` — записаться на курс
- GET `/enrollments/my` — курсы студента

---

### Admin

- GET `/admin/stats` — статистика платформы и последняя активность

---

## Общие принципы API

- Аутентификация: `Authorization: Bearer <jwt_token>`
- Все эндпоинты (кроме `/register`, `/login`) требуют JWT
- Роли доступа:
  - student — обучение и сдачи
  - teacher — управление курсами и оценивание
  - admin — агрегированная статистика
- Ошибки возвращаются в формате JSON `{ detail: "..." }`
- Валидация выполняется на уровне Pydantic и БД

---

## AC — критерии приёмки (MVP)

- AC1: Пользователь может зарегистрироваться и войти в систему.
- AC2: Студент может просматривать курсы и записываться на них.
- AC3: Преподаватель может создавать курсы, модули, уроки и задания.
- AC4: Студент может начать и сдать задание.
- AC5: Преподаватель может оценить задание (0–100 баллов).
- AC6: Студент видит свои оценки и прогресс обучения.
- AC7: Администратор видит статистику платформы и последнюю активность.
