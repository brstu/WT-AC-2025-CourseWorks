# Вариант 03 — Cards (обязательные поля и валидации)

## Проект: Mini-LMS «Учись, не болей»

---

## 1. Карточка пользователя (User)

- id: integer, автогенерация (primary key)
- name: string, не пустое, мин. 2 символа → «Введите имя»
- email: string, не пустое, уникальное, формат email → «Некорректный email» / «Пользователь уже существует»
- password: string, мин. 6 символов → «Пароль слишком короткий»
- role: enum [student, teacher, admin], default: student
- created_at: datetime, default: текущее время (UTC)

---

## 2. Карточка курса (Course)

- id: integer, автогенерация (primary key)
- title: string, не пустое → «Введите название курса»
- description: string, опционально
- category: string, опционально
- difficulty_level: enum [beginner, intermediate, advanced], опционально
- is_published: boolean, default: false
- author_id: reference User.id, обязательное (foreign key)
- created_at: datetime, default: текущее время (UTC)

---

## 3. Карточка модуля курса (Module)

- id: integer, автогенерация (primary key)
- title: string, не пустое → «Введите название модуля»
- course_id: reference Course.id, обязательное (foreign key)
- order_index: integer, опционально (порядок отображения)

---

## 4. Карточка урока (Lesson)

- id: integer, автогенерация (primary key)
- title: string, не пустое → «Введите название урока»
- content: string, опционально
- module_id: reference Module.id, обязательное (foreign key)
- order_index: integer, опционально

---

## 5. Карточка задания (Assignment)

- id: integer, автогенерация (primary key)
- title: string, не пустое → «Введите название задания»
- description: string, опционально
- lesson_id: reference Lesson.id, обязательное (foreign key)
- points_possible: integer, от 0 до 100, default: 100
- due_date: datetime, опционально

---

## 6. Карточка сдачи задания (Submission)

- id: integer, автогенерация (primary key)
- assignment_id: reference Assignment.id, обязательное (foreign key)
- user_id: reference User.id, обязательное (foreign key)
- status: enum [pending, submitted, graded, late], default: pending
- created_at: datetime, default: текущее время (UTC)
- submitted_at: datetime, опционально
- graded_at: datetime, опционально

---

## 7. Карточка оценки (Grade)

- id: integer, автогенерация (primary key)
- submission_id: reference Submission.id, обязательное (foreign key)
- points_earned: integer, от 0 до 100 → «Баллы должны быть от 0 до 100»
- points_possible: integer, default: 100
- percentage: float, вычисляемое поле (points_earned / points_possible * 100)
- feedback: string, опционально
- created_at: datetime, default: текущее время (UTC)

---

## 8. Карточка записи на курс (Enrollment)

- id: integer, автогенерация (primary key)
- user_id: reference User.id, обязательное (foreign key)
- course_id: reference Course.id, обязательное (foreign key)
- enrolled_at: datetime, default: текущее время (UTC)
- progress_percentage: float, default: 0

---

## Ограничения и валидации

- User.email: уникальное значение
- User.password: минимум 6 символов
- Course.title: не пустое
- Module.course_id: обязательное (модуль всегда принадлежит курсу)
- Lesson.module_id: обязательное
- Assignment.lesson_id: обязательное
- Submission: уникальная пара (user_id, assignment_id)
  → студент может иметь только одну сдачу на задание
- Grade.submission_id: уникальное
  → одна сдача может быть оценена только один раз
- Grade.points_earned: значение от 0 до 100 включительно
- Enrollment: уникальная пара (user_id, course_id)
  → пользователь не может записаться на курс повторно
