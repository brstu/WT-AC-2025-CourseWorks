# Вариант 38 — ERD (диаграмма сущностей) — Датчики «Умный дом lite»

Файл содержит: 1) mermaid-диаграмму ERD; 2) ASCII-эскиз; 3) минимальный SQL DDL-скетч для создания таблиц.

## Mermaid ERD

```mermaid
erDiagram
    USER ||--o| AGENT : "has 0..1"
    USER ||--o{ TICKET : "creates"
    AGENT ||--o{ TICKET : "assigned_to"
    QUEUE ||--o{ TICKET : "routes"
    TICKET ||--o{ MESSAGE : "has (embedded)"
    USER ||--o{ RATING : "writes"
    AGENT ||--o{ RATING : "receives"
    TICKET ||--o{ RATING : "for"

    USER {
      ObjectId _id PK
      string firstname
      string lastname
      string email
      string password
      string role "admin|agent|user"
    }

    AGENT {
      ObjectId _id PK
      ObjectId user FK "-> USER._id (unique)"
      string level "junior|middle|senior|lead"
      number capacity "default=5"
    }

    QUEUE {
      ObjectId _id PK
      string title
    }

    TICKET {
      ObjectId _id PK
      ObjectId queue FK "-> QUEUE._id"
      string title
      ObjectId user FK "-> USER._id"
      ObjectId agent FK "-> AGENT._id (nullable)"
      boolean isClose "default=false"
      [MESSAGE] messages "embedded subdocs"
      createdAt datetime
      updatedAt datetime
    }

    MESSAGE {
      string from "enum: user|agent"
      string text
      createdAt datetime
      updatedAt datetime
    }

    RATING {
      ObjectId _id PK
      ObjectId ticket FK "-> TICKET._id"
      ObjectId agent  FK "-> AGENT._id"
      ObjectId user   FK "-> USER._id"
      number score "1..5"
      string comment "≤500, optional"
      createdAt datetime
      updatedAt datetime
    }

```

## ASCII-эскиз

```
User 1---0..1 Agent
 |  \                 \
 |   \                 * Ratings -> Agent
 *----* Tickets -------^
        | (in Queue)
        * Messages (embedded)

```

## Минимальный SQL DDL (пример, PostgreSQL)

```sql
const { status, data } = request('POST', '/tickets', {
  auth: USER_TOKEN,
  body: {
    queueId: '66ff1e2b9a1c2a0012ab3456',
    title: 'Не приходит письмо с подтверждением',
    message: 'Указал верный email, писем нет уже 2 часа'
  }
})

// Ожидаем:
status === 201
data.ticket = {
  _id, queue, title, user, agent: null, isClose: false,
  messages: [{ from: 'user', text: '...', createdAt }],
  createdAt, updatedAt
}
const res = request('GET', '/tickets?limit=20&offset=0', { auth: USER_TOKEN })

// Ожидаем: только тикеты текущего пользователя
res.status === 200
res.data = { tickets: [ /* ... */ ], page: { limit: 20, offset: 0, total } }

const res = request('GET', `/tickets/${ticketId}`, { auth: AGENT_TOKEN /* или USER/ADMIN */ })

res.status === 200
res.data.ticket._id === ticketId

const res = request('POST', `/tickets/${ticketId}/messages`, {
  auth: USER_OR_AGENT_TOKEN,
  body: { text: 'Готов предоставить логи, какие нужны?' }
})

// Если тикет не закрыт:
res.status === 200
res.data.message = { from: 'user' | 'agent', text: '...', createdAt }

// Если тикет закрыт:
res.status === 409
res.data.message === 'Ticket is closed'

const res = request('POST', `/tickets/${ticketId}/assign`, {
  auth: ADMIN_TOKEN,
  body: { agentId: '6700c09dfb3f0b00127d0aaa' }
})

// Если у агента есть вместимость:
res.status === 200
res.data.ticket.agent === '6700c09dfb3f0b00127d0aaa'

// Если лимит превышен:
res.status === 409
res.data.message === 'Agent capacity exceeded'

const res = request('POST', `/tickets/${ticketId}/close`, { auth: USER_OR_AGENT_OR_ADMIN })

res.status === 200
res.data.ticket.isClose === true

const res = request('POST', '/ratings', {
  auth: USER_TOKEN,
  body: {
    ticketId: ticketId,   // тикет должен быть закрыт и иметь назначенного агента
    score: 5,             // 1..5
    comment: 'Быстро помогли, спасибо!'
  }
})

// Успех:
res.status === 201
res.data.rating = {
  _id, ticket: ticketId, agent, user, score: 5, comment: '...', createdAt, updatedAt
}

const res1 = request('GET', '/ratings?agentId=<currentAgentId>&limit=10', { auth: AGENT_TOKEN })
res1.status === 200
res1.data.ratings.every(r => r.agent === <currentAgentId>)

// пользователь смотрит только свои
const res2 = request('GET', '/ratings', { auth: USER_TOKEN })
res2.status === 200
res2.data.ratings.every(r => r.user === <currentUserId>)

request('GET', '/tickets') -> { status: 401, data: { message: 'Unauthorized' } }

// Нет доступа по скоупу:
request('GET', `/tickets/${foreignTicketId}`, { auth: USER_TOKEN })
-> { status: 403, data: { message: 'Forbidden' } }

// Валидация:
request('POST', '/tickets', { auth: USER_TOKEN, body: { queueId: null, title: '' } })
-> { status: 400, data: { message: 'Validation error', fields: { queueId: 'required', title: 'required' } } }

```
