# Вариант 09 — Ключевые сущности, связи и API (эскиз)

## Сущности (основные)

- **User**

  - id: int (PK, autoincrement)
  - email: string (unique)
  - password: string (hashed)
  - name: string
  - role: enum ['user', 'admin']

- **Post**

  - id: int (PK, autoincrement)
  - title: string
  - content: string (markdown)
  - published: boolean (default: false)
  - authorId: int (FK → User.id)
  - createdAt: datetime
  - updatedAt: datetime

- **Tag**

  - id: int (PK, autoincrement)
  - name: string (unique)

- **Comment**

  - id: int (PK, autoincrement)
  - content: string
  - postId: int (FK → Post.id)
  - authorId: int (FK → User.id)
  - createdAt: datetime

- **Like**

  - id: int (PK, autoincrement)
  - postId: int (FK → Post.id)
  - userId: int (FK → User.id)
  - unique(postId, userId)

- **PostTag** (связующая таблица)

  - postId: int (FK → Post.id)
  - tagId: int (FK → Tag.id)
  - @@id([postId, tagId])

## Связи (ER-эскиз)

- User 1..* Post (автор → посты)
- Post *..* Tag (многие-ко-многим через PostTag)
- Post 1..* Comment (пост → комментарии)
- Post 1..* Like (пост → лайки)
- User 1..* Comment (автор → комментарии)
- User 1..* Like (пользователь → лайки)

## Обязательные поля и ограничения (кратко)

- unique(User.email)
- Post.authorId → User.id (FK, not null)
- Comment.postId → Post.id (FK, not null)
- Comment.authorId → User.id (FK, not null)
- Like.postId → Post.id (FK, not null)
- Like.userId → User.id (FK, not null)
- unique(Like.postId, Like.userId)

## API — верхнеуровневые ресурсы и операции

- **/auth**

  - POST /auth/login `{email, password}` → `{token}`
  - POST /auth/register `{email, password, name}` → `{token}`

- **/posts**

  - GET /posts (список опубликованных)
  - POST /posts (создать, auth)
  - GET /posts/{id}
  - PUT /posts/{id} (owner/admin)
  - DELETE /posts/{id} (owner/admin)

- **/comments**

  - GET /comments/post/{postId}
  - POST /comments `{postId, content}` (auth)

- **/likes**

  - GET /likes/post/{postId}
  - POST /likes `{postId}` (auth)

- **/tags**

  - GET /tags (admin)
  - POST /tags `{name}` (admin)
  - DELETE /tags/{id} (admin)

- **/users** (admin only)

  - GET /users
  - DELETE /users/{id}
  - PUT /users/{id}/role `{role}`

## Подробные операции API, схемы и поведение

### Общие принципы

- Ответы в формате: `{data: ..., error?: {code, message}}`
- Аутентификация: `Authorization: Bearer <jwt>`
- Роли: `user`, `admin`

### Примеры ошибок (JSON)

```
{
  "error": {
    "code": "validation_failed",
    "message": "Validation failed",
    "fields": { "title": "required" }
  }
}
```

### Auth

- POST `/auth/register` — `{email, password, name}` → `201 {id, email, name, role, token}`
- POST `/auth/login` — `{email, password}` → `200 {token}`

### Users (admin)

- GET `/users?limit=&offset=` — список пользователей
- GET `/users/{id}` — профиль пользователя
- PUT `/users/{id}/role` — `{role}` → смена роли

### Posts

- GET `/posts` → `[{id, title, content[:200], author{name}, tags{name[]}, likesCount, commentsCount}]`
- POST `/posts` `{title, content, published?, tagIds[]}` → `201 {post}`
- GET `/posts/{id}` → полный пост с author, tags, comments

### Comments

- POST `/comments` `{postId, content}` → `201 {comment}`
- GET `/comments/post/{postId}` → `[{id, content, author{name, id}, createdAt}]`

### Likes

- POST `/likes` `{postId}` → `201 {like}` | `400 {error: "Already liked"}`
- GET `/likes/post/{postId}` → `[{id, userId, postId}]`

### Tags (admin)

- POST `/tags` `{name}` → `201 {id, name}`
- GET `/tags` → `[{id, name, postsCount}]`
- DELETE `/tags/{id}`
