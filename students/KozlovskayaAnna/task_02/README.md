# Zafid

- **Backend**: Node.js + Express
- **Frontend**: Next.js

---

## 1) Требования

- **Node.js**: v18+ (желательно v20+)
- **npm** (или yarn/pnpm)

---

## 2) Установка зависимостей

### Backend (Express)

Перейдите в папку сервера и установите зависимости:

```bash
cd backend
npm install
````

### Frontend (Next.js)

Перейдите в папку фронтенда и установите зависимости:

```bash
cd ../frontend
npm install
```

---

## 3) Переменные окружения (env)

### env - Backend

в файле ```secrets.txt``` найти

```bash
=== BACKEND ===

MONGO_URI=***
PORT=***
JWT_SECRET=***
JWT_EXPIRES_IN=***
...
```

### env - Frontend

```bash
=== FRONTEND ===

NEXT_PUBLIC_API_BASE_URL=***
NEXT_PUBLIC_API_ADMIN_BASE_URL=***
NODE_ENV=***
NEXT_PUBLIC_S3_PUBLIC_URL=***
```

---

## 4) Запуск проекта

Открой два терминала.

### Терминал 1 - Backend

```bash
cd backend
npm run dev
```

Обычно сервер запускается на:

- `http://localhost:3001` (или другой порт из `.env`)

### Терминал 2 - Frontend

```bash
cd frontend
npm run dev
```

Фронт обычно доступен на:

- `http://localhost:3000`

---
