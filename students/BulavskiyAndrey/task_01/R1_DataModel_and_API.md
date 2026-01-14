# Вариант 33 — Органайзер «Без лишних чатов» — Ключевые сущности, связи и API (эскиз)

Сущности (основные): `User`, `Group`, `Membership`, `Announcement`, `File`, `Event`, `Poll`, `Choice`, `Vote`, `Chat`, `Message`.  
Основные API‑ресурсы по условию: `/announcements`, `/files`, `/calendar`, `/polls`, `/chats`.  
Фокус R1: согласованность модели данных, прав доступа и API.

---

## 1. Сущности и атрибуты

### 1.1. User

- `id: UUID`
- `name: string` — отображаемое имя.
- `email: string` — уникальный.
- `password_hash: string`
- `created_at: datetime`

> Роли (`admin`, `moderator`, `member`, `guest`) привязаны к пользователю **в контексте группы**, через `Membership`.

### 1.2. Group

- `id: UUID`
- `name: string` — название группы (например, «АС‑63 учебная группа», «Команда проекта X»).
- `description: string`
- `is_private: boolean` — открытая/закрытая группа.
- `created_at: datetime`
- `created_by: reference -> User.id`

### 1.3. Membership (связь User ↔ Group + роль)

- `id: UUID`
- `user_id: reference -> User.id`
- `group_id: reference -> Group.id`
- `role: enum [admin, moderator, member, guest]`
- `joined_at: datetime`
- `is_active: boolean`

Ограничения:

- `unique (user_id, group_id)` — один пользователь не должен иметь дубликаты членства.

### 1.4. Announcement

- `id: UUID`
- `group_id: reference -> Group.id`
- `author_id: reference -> User.id` — через `Membership` проверяются права.
- `title: string`
- `content: text`
- `is_pinned: boolean` — закреплённое объявление.
- `is_public: boolean` — доступно гостям (если группа не полностью закрыта).
- `published_at: datetime` — время публикации.
- `created_at: datetime`
- `updated_at: datetime`

Связи:

- `Announcement` может ссылаться на файлы и события через отдельные таблицы связи (например, `announcement_files`, `announcement_events`) или через ссылки в тексте — деталь реализации остаётся на проект.

### 1.5. File

- `id: UUID`
- `group_id: reference -> Group.id`
- `uploader_id: reference -> User.id`
- `name: string` — отображаемое имя.
- `description: string`
- `file_path: string` — внутренний путь/ключ в хранилище, не управляется клиентом.
- `file_size: integer`
- `mime_type: string`
- `category: string` — лекции, задания, отчёты и т. п.
- `created_at: datetime`

Ограничения:

- Максимальный размер файла и суммарный размер по группе/пользователю — бизнес‑ограничение (можно зафиксировать в AC, но не обязательно в схеме).

### 1.6. Event (календарь)

- `id: UUID`
- `group_id: reference -> Group.id`
- `creator_id: reference -> User.id`
- `title: string`
- `description: text`
- `start_at: datetime`
- `end_at: datetime`
- `location: string` — аудитория/ссылка.
- `type: enum [lecture, deadline, exam, meeting, other]`
- `created_at: datetime`

Дополнительно (бонус):

- `remind_at: datetime` — напоминание.
- `is_all_day: boolean`

### 1.7. Poll / Choice / Vote

## Poll

- `id: UUID`
- `group_id: reference -> Group.id`
- `creator_id: reference -> User.id`
- `question: string`
- `is_anonymous: boolean`
- `is_multiple_choice: boolean`
- `expires_at: datetime` — дедлайн голосования.
- `created_at: datetime`

## Choice

- `id: UUID`
- `poll_id: reference -> Poll.id`
- `text: string`
- `order: integer`

## Vote

- `id: UUID`
- `poll_id: reference -> Poll.id`
- `choice_id: reference -> Choice.id`
- `voter_id: reference -> User.id`
- `created_at: datetime`

Ограничения:

- `unique (poll_id, voter_id)` — один голос на пользователя при одиночном выборе.
- Для `is_multiple_choice = true` можно разрешить несколько записей `Vote` на одного пользователя (по разным `choice_id`).

### 1.8. Chat / Message

## Chat

- `id: UUID`
- `group_id: reference -> Group.id`
- `title: string`
- `type: enum [group, private, topic]`
- `is_read_only: boolean` — только админ/модераторы могут писать.
- `created_by: reference -> User.id`
- `created_at: datetime`

## Message

- `id: UUID`
- `chat_id: reference -> Chat.id`
- `author_id: reference -> User.id`
- `content: text`
- `attachments: JSON` — ссылки на файлы (или отдельная таблица).
- `created_at: datetime`
- `edited_at: datetime (nullable)`
- `is_deleted: boolean`

Ограничения:

- Удалённые сообщения могут храниться с флагом `is_deleted = true` для журнала модерации.

---

## 2. Связи (ER‑эскиз)

- `User 1..* Membership *..1 Group`
- `Group 1..* Announcement`
- `Group 1..* File`
- `Group 1..* Event`
- `Group 1..* Poll 1..* Choice`
- `Poll 1..* Vote` (через `Choice` и `User`)
- `Group 1..* Chat 1..* Message`
- `User 1..* Message`
- `User 1..* Announcement`
- `User 1..* Event`
- `User 1..* Poll`

Ключевые уникальные ограничения:

- `unique (user_id, group_id)` в `Membership`.
- `unique (poll_id, voter_id)` (или `(poll_id, voter_id, choice_id)` для multiple choice).

---

## 3. Верхнеуровневые ресурсы API

### 3.1. Общие принципы

- Все запросы к API выполняются в контексте группы:  
  `GET /groups/{groupId}/...`
- Аутентификация: `Authorization: Bearer <jwt>`.
- Ответы:

```json
{
  "status": "ok",
  "data": { /* ... */ }
}
```

или

```json
{
  "status": "error",
  "error": { "code": "validation_failed", "message": "Validation failed", "fields": { "title": "required" } }
}
```

Пагинация: параметры `limit` и `offset` (по умолчанию `limit = 50`).

---

### 3.2. /announcements

- `GET /groups/{groupId}/announcements?limit=&offset=&pinned=&authorId=`  
  Список объявлений группы (с учётом прав: гостю — только публичные, участнику — все для группы).

- `POST /groups/{groupId}/announcements` — (Admin/Moderator)  
  Payload:

```json
{
  "title": "Новый дедлайн по курсовой",
  "content": "Сдача до 15 апреля...",
  "isPinned": true,
  "isPublic": false
}
```

- `GET /groups/{groupId}/announcements/{id}` — детали объявления.

- `PUT /groups/{groupId}/announcements/{id}` — редактирование (админ или автор/модератор).

- `DELETE /groups/{groupId}/announcements/{id}` — удаление (админ, модератор — по политике).

---

### 3.3. /files

- `GET /groups/{groupId}/files?category=&uploaderId=&limit=&offset=`  
  Список файлов.

- `POST /groups/{groupId}/files` — загрузка файла (multipart/form-data)  
  Поля:
  - `file` — бинарный файл;
  - `name`, `description`, `category`.

Ответ:

```json
{
  "status": "ok",
  "data": {
    "id": "uuid",
    "name": "Лекция 1.pdf",
    "fileSize": 123456,
    "mimeType": "application/pdf"
  }
}
```

- `GET /groups/{groupId}/files/{id}` — метаданные файла.
- `GET /groups/{groupId}/files/{id}/download` — скачивание (binary).
- `DELETE /groups/{groupId}/files/{id}` — удаление (админ, модератор, владелец — по политике).

---

### 3.4. /calendar (events)

API может быть реализован как `/events`, но по условию — `/calendar`.

- `GET /groups/{groupId}/calendar?from=&to=&type=`  
  Список событий в интервале.

- `POST /groups/{groupId}/calendar` — создание события (Admin/Moderator)

```json
{
  "title": "Защита курсовых",
  "description": "Аудитория 101, начало в 10:00",
  "startAt": "2025-06-01T10:00:00Z",
  "endAt": "2025-06-01T12:00:00Z",
  "type": "exam",
  "location": "ауд. 101"
}
```

- `GET /groups/{groupId}/calendar/{id}` — детали события.
- `PUT /groups/{groupId}/calendar/{id}` — изменение события (Admin/Moderator).
- `DELETE /groups/{groupId}/calendar/{id}` — удаление события.

---

### 3.5. /polls

- `GET /groups/{groupId}/polls?active=&creatorId=` — список опросов.
- `POST /groups/{groupId}/polls` — создание опроса (Admin/Moderator)

```json
{
  "question": "Когда удобно провести консультацию?",
  "isAnonymous": true,
  "isMultipleChoice": true,
  "choices": [
    { "text": "Пн 18:00" },
    { "text": "Ср 18:00" },
    { "text": "Сб 12:00" }
  ],
  "expiresAt": "2025-03-20T18:00:00Z"
}
```

- `GET /groups/{groupId}/polls/{id}` — детали опроса (с вариантами и, при правах, с результатами).
- `POST /groups/{groupId}/polls/{id}/votes` — голосование (Member)

```json
{
  "choiceIds": ["uuid-choice-1", "uuid-choice-2"]
}
```

- `GET /groups/{groupId}/polls/{id}/results` — результаты (Admin/Moderator, участник — если разрешено настройками опроса).

---

### 3.6. /chats

- `GET /groups/{groupId}/chats` — список чатов, доступных пользователю.
- `POST /groups/{groupId}/chats` — создание чата (Admin/Moderator)

```json
{
  "title": "Подгруппа 1",
  "type": "group",
  "isReadOnly": false
}
```

- `GET /groups/{groupId}/chats/{chatId}/messages?limit=&offset=` — лента сообщений.
- `POST /groups/{groupId}/chats/{chatId}/messages` — отправка сообщения

```json
{
  "content": "Коллеги, напомните, пожалуйста, дедлайн?",
  "attachments": []
}
```

- `PUT /groups/{groupId}/chats/{chatId}/messages/{messageId}` — редактирование своего сообщения.
- `DELETE /groups/{groupId}/chats/{chatId}/messages/{messageId}` — удаление (своё — участник; чужое — модератор/админ).

---

## 4. Дополнительно (бонусы)

- **Роли и права**:
  - RBAC на уровне API: middleware проверяют роль участника в `Membership`.
- **Дайджест**:
  - `POST /groups/{groupId}/digest/preview` — сформировать дайджест за период.
  - `POST /groups/{groupId}/digest/send` — отправить дайджест (только admin).
- **Документация API**:
  - OpenAPI/Swagger‑спецификация для всех указанных эндпоинтов.
- **Тесты**:
  - unit‑тесты для бизнес‑логики (ограничения голосований, прав в чатах и т. д.).
  - интеграционные тесты для ключевых потоков: объявление → файловое хранилище → событие → опрос → чат.
