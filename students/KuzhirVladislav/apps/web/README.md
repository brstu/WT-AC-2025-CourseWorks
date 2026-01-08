# Frontend - Freelance CRM

React + TypeScript приложение для управления CRM фрилансера.

## 📋 Содержание

- [Особенности](#особенности)
- [Требования](#требования)
- [Установка](#установка)
- [Запуск](#запуск)
- [Структура проекта](#структура-проекта)
- [Компоненты](#компоненты)
- [Страницы](#страницы)
- [API интеграция](#api-интеграция)
- [Стили и дизайн](#стили-и-дизайн)
- [Аутентификация](#аутентификация)
- [Build и Deploy](#build-и-deploy)

## ✨ Особенности

### Основные возможности

- 🔐 Аутентификация с JWT
- 📊 Kanban доска для сделок (воронка)
- ✓ Kanban доска для задач
- 👥 Управление клиентами
- 💼 Управление сделками
- 📄 Управление инвойсами
- 📈 Интерактивный дашборд
- 🌙 Темная тема с glassmorphism эффектом
- 📱 Адаптивный дизайн
- ⚡ Fast refresh (HMR) в режиме разработки

### MVP Компоненты

| Компонент | Статус | Описание |
|-----------|--------|----------|
| Dashboard | ✅ Готов | Главная страница с метриками |
| DealsPipeline | ✅ Готов | Kanban для сделок по этапам |
| TasksBoard | ✅ Готов | Kanban для задач по статусам |
| ClientsList | ✅ Готов | Список и управление клиентами |
| StagesList | ✅ Готов | Управление этапами |
| InvoicesList | ✅ Готов | Список счетов |
| DealForm | ✅ Готов | Форма создания/редактирования сделки |
| InvoiceForm | ✅ Готов | Форма создания/редактирования инвойса |
| Auth | ✅ Готов | Регистрация и вход |

## 📦 Требования

```
- Node.js: >= 16.0.0
- npm: >= 8.0.0
- Современный браузер (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
```

## 🚀 Установка

### 1. Клонирование (если еще не сделано)

```bash
git clone <repository-url>
cd students/KuzhirVladislav/apps/web
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## 🏃 Запуск

### Режим разработки

```bash
npm run dev
```

Откройте браузер на `http://localhost:5173`

Изменения в коде будут автоматически перезагружены (HMR).

### Build для production

```bash
npm run build
```

Результат в папке `dist/`

### Предпросмотр production build

```bash
npm run preview
```

## 📁 Структура проекта

```
src/
├── api/                      # API клиенты
│   ├── auth.ts              # Аутентификация
│   ├── client.ts            # Axios конфиг
│   ├── clients.ts           # CRUD клиентов
│   ├── deals.ts             # CRUD сделок
│   ├── invoices.ts          # CRUD инвойсов
│   ├── stages.ts            # CRUD этапов
│   └── tasks.ts             # CRUD задач
│
├── components/              # React компоненты
│   ├── DealsPipeline.tsx    # Воронка сделок
│   ├── TasksBoard.tsx       # Доска задач
│   ├── RequireAuth.tsx      # Guard для приватных маршрутов
│   ├── Layout/              # Макет приложения
│   │   ├── Layout.tsx       # Основной контейнер
│   │   ├── Header.tsx       # Шапка с логотипом и поиском
│   │   └── Sidebar.tsx      # Боковая навигация
│   └── UI/                  # UI компоненты
│       ├── FormField.tsx    # Поле формы
│       ├── PageTransition.tsx # Анимации переходов
│       └── Skeleton.tsx     # Skeleton loader
│
├── contexts/                # React контексты
│   ├── AuthContext.tsx      # Контекст аутентификации
│   └── ModalContext.tsx     # Контекст модальных окон
│
├── pages/                   # Страницы приложения
│   ├── Dashboard.tsx        # Главная страница
│   ├── NotFound.tsx         # 404 страница
│   ├── Auth/                # Страницы аутентификации
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── Clients/             # Страницы клиентов
│   │   ├── ClientsList.tsx
│   │   ├── ClientForm.tsx
│   │   ├── ClientDetails.tsx
│   │   └── index.ts
│   ├── Deals/               # Страницы сделок
│   │   ├── DealsList.tsx
│   │   ├── DealForm.tsx
│   │   └── index.ts
│   ├── Tasks/               # Страницы задач
│   │   ├── TasksList.tsx
│   │   └── index.ts
│   ├── Invoices/            # Страницы инвойсов
│   │   ├── InvoicesList.tsx
│   │   ├── InvoiceForm.tsx
│   │   └── index.ts
│   └── Stages/              # Страницы этапов
│       ├── StagesList.tsx
│       └── index.ts
│
├── styles/                  # CSS стили
│   ├── board.css           # Стили доски задач
│   ├── pipeline.css        # Стили воронки сделок
│   └── styles.css          # Глобальные стили
│
├── types/                   # TypeScript типы
│   └── models.ts           # Модели данных
│
├── assets/                  # Статические файлы
│   └── logo.svg
│
├── App.tsx                  # Корневой компонент с маршрутами
├── main.tsx                 # Точка входа
├── custom.d.ts             # Custom типы
└── index.ts                # Экспорты

public/                      # Публичные файлы
├── favicon.ico
└── ...

index.html                   # HTML шаблон
package.json                 # Зависимости
tsconfig.json               # TypeScript конфиг
vite.config.ts              # Vite конфиг
```

## 🎨 Компоненты

### DealsPipeline

Kanban доска для сделок, группирует сделки по этапам.

```tsx
import DealsPipeline from './components/DealsPipeline'

// Использование
<DealsPipeline />
```

**Особенности:**
- Загрузка этапов и сделок
- Группировка по этапам
- Отображение сумм сделок
- Информация о клиентах
- Сортировка по порядку этапов

### TasksBoard

Kanban доска для задач с тремя статусами: todo, in_progress, done.

```tsx
import TasksBoard from './components/TasksBoard'

// Использование
<TasksBoard />
```

**Особенности:**
- Три колонки по статусам
- Отметить как выполненную (чекбокс)
- Отображение дедлайнов
- Счетчик задач по статусам
- Выделение просроченных

## 📄 Страницы

### Dashboard
**Маршрут:** `/`

Главная страница с:
- Основными метриками (клиенты, сделки, задачи, инвойсы)
- Финансовыми данными (сумма сделок, оплачено)
- Последними сделками
- Просроченными задачами
- Быстрыми действиями

### Clients
**Маршруты:**
- `/clients` - список клиентов
- `/clients/new` - создание
- `/clients/:id` - детали/редактирование

### Deals
**Маршруты:**
- `/deals` - воронка сделок
- `/deals/new` - создание сделки
- `/deals/:id` - редактирование сделки

### Tasks
**Маршрут:** `/tasks` - доска задач

### Invoices
**Маршруты:**
- `/invoices` - список инвойсов
- `/invoices/new` - создание инвойса
- `/invoices/:id` - редактирование инвойса

### Stages
**Маршрут:** `/stages` - управление этапами

### Auth
**Маршруты:**
- `/auth/login` - вход
- `/auth/register` - регистрация

## 🔌 API интеграция

### Axios конфигурация

```tsx
// api/client.ts
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

// Автоматическое добавление токена к запросам
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
```

### API функции

```tsx
// Пример: api/clients.ts
export default {
  list: async (params?: { search?: string }): Promise<Client[]> => {
    const res = await api.get('/api/v1/clients', { params })
    return res.data || []
  },
  
  get: async (id: string) => {
    const res = await api.get(`/api/v1/clients/${id}`)
    return res.data as Client
  },
  
  create: async (payload: Partial<Client>) => {
    const res = await api.post('/api/v1/clients', payload)
    return res.data
  },
  
  update: async (id: string, payload: Partial<Client>) => {
    const res = await api.put(`/api/v1/clients/${id}`, payload)
    return res.data
  },
  
  remove: async (id: string) => {
    const res = await api.delete(`/api/v1/clients/${id}`)
    return res.data
  }
}
```

### Использование в компонентах

```tsx
import clientsApi from '../api/clients'

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    clientsApi.list()
      .then(data => setClients(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    // JSX
  )
}
```

## 🎨 Стили и дизайн

### CSS переменные

```css
:root {
  --bg: #071023;              /* Основной фон */
  --surface: #0f1724;         /* Surface цвет */
  --muted: #9fb0c8;           /* Приглушенный текст */
  --accent: #15545e;          /* Основной акцент (бирюза) */
  --accent-2: #1f0461;        /* Вторичный акцент */
  --accent-3: #ffb020;        /* Теплый акцент (оранжевый) */
  --card: #0b1220;            /* Цвет карточек */
  --text: #e6eef8;            /* Основной текст */
  --glass: rgba(255,255,255,0.03);   /* Glassmorphism */
}
```

### Основные классы

```css
.card         /* Контейнер с фоном */
.button       /* Первичная кнопка */
.button.secondary  /* Вторичная кнопка */
.list         /* Контейнер списка */
.item         /* Элемент списка */
.input        /* Поле ввода */
.form-row     /* Строка формы */
.field        /* Поле в форме */
.label        /* Метка поля */
.skeleton     /* Skeleton loader */
```

## 🔐 Аутентификация

### AuthContext

```tsx
// contexts/AuthContext.tsx
const auth = useAuth()

auth.token       // JWT токен
auth.user        // Данные пользователя
auth.login()     // Функция входа
auth.logout()    // Функция выхода
auth.register()  // Функция регистрации
```

### Приватные маршруты

```tsx
<Route path="/deals" element={
  <RequireAuth>
    <DealsList />
  </RequireAuth>
} />
```

## 🏗️ Build и Deploy

### Production build

```bash
npm run build
```

Результат в папке `dist/` готов к развертыванию.

### Оптимизации в build

- Minification JS/CSS
- Tree shaking
- Code splitting
- Asset optimization
- Source maps для отладки

### Deploy на статический хостинг

```bash
# Vercel
npm install -g vercel
vercel

# Netlify
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# GitHub Pages
npm run build
# Затем push в gh-pages ветку
```

### Deploy с Docker

```bash
docker build -t crm-frontend:latest .
docker run -p 3000:80 crm-frontend:latest
```

## 📊 Типы данных

```typescript
// types/models.ts
export type User = {
  id: string
  name: string
  email?: string
}

export type Client = {
  id: string
  name: string
  email?: string
  phone?: string
  createdAt?: string
}

export type Stage = {
  id: string
  name: string
  order?: number
}

export type Deal = {
  id: string
  title: string
  amount?: number
  stageId?: string
  clientId?: string
  client?: Client
  stage?: Stage
  description?: string
  createdAt?: string
  updatedAt?: string
}

export type Task = {
  id: string
  title: string
  description?: string
  dueDate?: string
  done?: boolean
  dealId?: string
  deal?: Deal
  status?: 'todo' | 'in_progress' | 'done'
  createdAt?: string
  updatedAt?: string
}

export type Invoice = {
  id: string
  number: string
  amount: number
  clientId?: string
  status?: 'draft' | 'sent' | 'paid'
  client?: Client
  createdAt?: string
  updatedAt?: string
}
```

## 🔧 Полезные команды

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Предпросмотр build
npm run preview

# Линтинг (если настроено)
npm run lint

# Форматирование кода (если настроено)
npm run format
```

## 🆘 Troubleshooting

### CORS ошибка
- Убедитесь, что backend запущен на http://localhost:8080
- Проверьте переменную `VITE_API_BASE_URL`
- Проверьте CORS настройку в backend

### API 401 Unauthorized
- Проверьте, что token сохранен в localStorage
- Попробуйте перезайти

### Компоненты не загружаются
- Проверьте, что backend возвращает данные
- Откройте DevTools > Network для проверки запросов

### Port 5173 занят
```bash
# Использовать другой port
npm run dev -- --port 3000
```

## 📚 Дополнительные ресурсы

- [React документация](https://react.dev)
- [TypeScript документация](https://www.typescriptlang.org)
- [Vite документация](https://vitejs.dev)
- [React Router](https://reactrouter.com)
- [Axios документация](https://axios-http.com)

## 📝 Лицензия

Проект входит в курсовую работу. Использование только в учебных целях.

---

**Версия**: 0.1.0
**Последнее обновление**: 2026-01-03
**Автор**: Кузьир Владислав

