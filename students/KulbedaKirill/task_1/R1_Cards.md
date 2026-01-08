# Вариант 34 — Карточки (обязательные поля и валидации)

1 Форма Регистрации

- firstname: string, не пустое → ошибка: «Enter your name»
- lastname: string, не пустое → ошибка: «Enter your surname»
- email: string, уникальное, не пустое → ошибка: «Enter your email», неверный формат → «Invalid Email»
- password: string, не пустое → ошибка: «Enter your password»

2 Форма Логина

- email: string, не пустое → ошибка: «Enter your email», неверный формат → «Invalid Email»
- password: string, не пустое → ошибка: «Enter your email»

3 Карточка пользователя (User)

- id: ObjectId (Mongo), автогенерируется
- firstname: string, не пустое → ошибка: «Enter your name»
- lastname: string, не пустое → ошибка: «Enter your surname»
- role: enum [admin | agent | user], не пустое → ошибка: «Select your role»
- password: string, не пустое → ошибка: «Enter your password»

4 Карточка очереди (Queue)

- id: ObjectId (Mongo), автогенерируется
- title: string, не пустое → «Enter title»

5 Карточка агента (Agent)

- id: ObjectId (Mongo), автогенерируется
- user: reference → User.id, не пустое
- level: enum [junior | middle | senior | lead]
- capacity: number, целое

6 Карточка тикета (Ticket)

- title: string, не пустое → «Enter title»
- user: reference → User.id, не пустое
- agent: reference → Agent.id, не пустое
- queue: reference → Queue.id, не пустое
- isClose: boolean, default: false
- createdAt: datetime, автогенерируется
- updatedAt: datetime, автогенерируется

7 Карточка рейтинга (Rating)

- id: ObjectId (Mongo), автогенерируется
- ticket: reference → Ticker.id, не пустое
- agent: reference → Agent.id, не пустое
- queue: reference → Queue.id, не пустое
- capacity: number, целое
- title: string, не пустое
