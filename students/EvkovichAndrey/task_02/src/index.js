const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { errorHandler, logger } = require('./middleware/errorHandler');
const { initializeAdmin, initializeTestData } = require('./init/adminInit');

// Загружаем переменные окружения
dotenv.config();

// Импортируем маршруты
const authRoutes = require('./routes/auth');
const habitRoutes = require('./routes/habits');
const entryRoutes = require('./routes/entries');
const goalRoutes = require('./routes/goals');
const reminderRoutes = require('./routes/reminders');

const app = express();

// Подключаемся к базе данных
connectDB();

// Инициализация данных при запуске
async function initializeApp() {
    try {
        // Ждем подключения к БД
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Создаем администратора по умолчанию
        await initializeAdmin();

        // Создаем тестовые данные (только для разработки)
        if (process.env.NODE_ENV === 'development') {
            await initializeTestData();
        }

        console.log('✅ Инициализация данных завершена');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error.message);
    }
}

// Запускаем инициализацию
initializeApp();

// Безопасность
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

// Ограничение запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100 // максимум 100 запросов
});
app.use('/api/', limiter);

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/admin', require('./routes/admin'));

// Тестовый маршрут
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Обработка 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Маршрут не найден'
    });
});

// Обработка ошибок
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 Режим: ${process.env.NODE_ENV}`);
    console.log(`🔗 API доступно по адресу: http://localhost:${PORT}/api`);
    console.log(`👑 Администратор: ${process.env.ADMIN_EMAIL || 'admin@habittracker.com'}`);
});