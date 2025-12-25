# Backend

## Стек

- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- Auth: JWT (короткий access + долгий refresh в HttpOnly cookie с ротацией), bcrypt
- Валидация: Zod
- Без Docker

## Настройка окружения

1) Скопировать `.env.example` в `.env` и задать переменные:

```
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB?schema=public
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=change-access
JWT_REFRESH_SECRET=change-refresh
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
```

## Установка зависимостей

Из корня репо (workspace):

```
npm install
```

## Миграции и Prisma

1) Сгенерировать клиент (после изменения схемы):

```
npm run prisma:generate -w backend
```

1) Применить миграции (создаст/обновит схему БД):

```
npm run prisma:migrate -w backend
```

## Seed данные для разработки

Выполнить после миграций (из корня репо):

```
npm run prisma:seed -w backend
```

Что создаётся:

- admin: <admin@example.com> / admin123
- user: <user@example.com> / user12345
- volunteer: <volunteer@example.com> / volunteer123 (есть VolunteerProfile)
- Категории: Продукты, Медицина
- Запросы: один new (для отклика), один completed с отзывом

## Запуск сервера

Dev-режим:

```
npm run dev -w backend
```

Билд и старт:

```
npm run build -w backend
npm run start -w backend
```

## Проверка

- Healthcheck: `GET http://localhost:4000/health`
- Auth:
  - POST `/auth/register` { email, username, password } → выдаёт access + ставит refresh cookie (HttpOnly)
  - POST `/auth/login` { email, password } → выдаёт access + ставит refresh cookie (HttpOnly)
  - POST `/auth/refresh` без тела (cookie обязателен) → новый access + новый refresh cookie (ротация)
  - POST `/auth/logout` → отзывает текущий refresh, чистит cookie
  - GET `/users/me` c заголовком `Authorization: Bearer <ACCESS_TOKEN>`

## Примеры curl

### Auth: логин, refresh, logout (PowerShell)

```powershell
$API="http://localhost:4000"

# Логин: получаем access в ответе и сохраняем refresh cookie в cookies.txt
curl.exe -i -c cookies.txt -X POST "$API/auth/login" `
  -H "Content-Type: application/json" `
  -d '{"email":"user@example.com","password":"user12345"}'

# Запрос защищенного ресурса (передаем access в заголовке)
curl.exe -i -b cookies.txt "$API/users/me" `
  -H "Authorization: Bearer <ACCESS_TOKEN_FROM_LOGIN>"

# Обновить access по refresh cookie (refresh ротируется)
curl.exe -i -b cookies.txt -X POST "$API/auth/refresh"

# Logout: отзывает текущий refresh и чистит cookie
curl.exe -i -b cookies.txt -X POST "$API/auth/logout"
```

### Отказ в доступе (попытка создать категорию без прав admin)

```bash
curl -X POST http://localhost:4000/categories \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Продукты","description":"Доставка еды"}'
# Ответ: {"status":"error","error":{"message":"Forbidden","code":"forbidden"}}
```

### Регистрация

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","username":"newuser","password":"secret123"}'
```

### Категории (admin)

Создать

```bash
curl -X POST http://localhost:4000/categories \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Продукты","description":"Доставка еды"}'
```

Список

```bash
curl http://localhost:4000/categories
```

Обновить

```bash
curl -X PUT http://localhost:4000/categories/<CATEGORY_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Новая строка"}'
```

Удалить

```bash
curl -X DELETE http://localhost:4000/categories/<CATEGORY_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Запросы помощи (HelpRequest)

Создать (user)

```bash
curl -X POST http://localhost:4000/requests \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Нужна помощь","description":"Купить продукты","categoryId":"<CATEGORY_ID>","locationAddress":"Адрес"}'
```

Список (user видит свои / волонтёр все new / admin все)

```bash
curl "http://localhost:4000/requests?status=new&categoryId=<CATEGORY_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

Получить по id

```bash
curl http://localhost:4000/requests/<REQUEST_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

Обновить описание (владелец или admin)

```bash
curl -X PUT http://localhost:4000/requests/<REQUEST_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"description":"Апдейт"}'
```

Удалить (владелец при status=new или admin)

```bash
curl -X DELETE http://localhost:4000/requests/<REQUEST_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

### Профили волонтёров

Создать себе профиль (user)

```bash
curl -X POST http://localhost:4000/volunteers \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Готов помочь"}'
```

Список

```bash
curl http://localhost:4000/volunteers -H "Authorization: Bearer <TOKEN>"
```

Обновить свой профиль

```bash
curl -X PUT http://localhost:4000/volunteers/<VOLUNTEER_ID> \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Новый био"}'
```

Удалить свой профиль

```bash
curl -X DELETE http://localhost:4000/volunteers/<VOLUNTEER_ID> \
  -H "Authorization: Bearer <USER_TOKEN>"
```

### Назначения (Assignments)

Откликнуться на запрос (волонтёр или admin)

```bash
curl -X POST http://localhost:4000/assignments \
  -H "Authorization: Bearer <VOLUNTEER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"requestId":"<REQUEST_ID>"}'
```

Список (для своих или admin)

```bash
curl "http://localhost:4000/assignments?status=assigned" \
  -H "Authorization: Bearer <TOKEN>"
```

Изменить статус (волонтёр по своей задаче или admin)

```bash
curl -X PUT http://localhost:4000/assignments/<ASSIGNMENT_ID> \
  -H "Authorization: Bearer <VOLUNTEER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress"}'
```

Удалить (admin)

```bash
curl -X DELETE http://localhost:4000/assignments/<ASSIGNMENT_ID> \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Отзывы (Reviews)

Создать (владелец запроса после completed)

```bash
curl -X POST http://localhost:4000/reviews \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"assignmentId":"<ASSIGNMENT_ID>","rating":5,"comment":"Спасибо"}'
```

Список по волонтёру

```bash
curl "http://localhost:4000/reviews?volunteerId=<VOLUNTEER_USER_ID>" \
  -H "Authorization: Bearer <TOKEN>"
```

Обновить (автор или admin)

```bash
curl -X PUT http://localhost:4000/reviews/<REVIEW_ID> \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"rating":4,"comment":"Апдейт"}'
```

Удалить (автор или admin)

```bash
curl -X DELETE http://localhost:4000/reviews/<REVIEW_ID> \
  -H "Authorization: Bearer <USER_TOKEN>"
```
