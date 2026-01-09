const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Инициализация администратора по умолчанию
 * Вызывается при запуске сервера
 */
async function initializeAdmin() {
    try {
        console.log('🔍 Проверка администратора по умолчанию...');

        // Конфигурация администратора по умолчанию
        const defaultAdmin = {
            username: process.env.ADMIN_USERNAME || 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@habittracker.com',
            password: process.env.ADMIN_PASSWORD || 'admin123',
            role: 'admin',
            settings: {
                timezone: process.env.ADMIN_TIMEZONE || 'Europe/Moscow',
                dailyReminderTime: '09:00',
                notificationsEnabled: true
            }
        };

        // Проверяем, существует ли уже администратор
        const existingAdmin = await User.findOne({
            $or: [
                { email: defaultAdmin.email },
                { username: defaultAdmin.username },
                { role: 'admin' }
            ]
        });

        if (existingAdmin) {
            console.log('✅ Администратор уже существует:', existingAdmin.email);
            return existingAdmin;
        }

        // Создаем нового администратора
        const admin = new User(defaultAdmin);
        await admin.save();

        console.log('🎉 Администратор создан успешно!');
        console.log('📧 Логин:', defaultAdmin.email);
        console.log('🔑 Пароль:', defaultAdmin.password);
        console.log('⚠️  Не забудьте изменить пароль после первого входа!');

        return admin;
    } catch (error) {
        console.error('❌ Ошибка создания администратора:', error.message);
        // Не прерываем запуск сервера из-за этой ошибки
        return null;
    }
}

/**
 * Проверка и создание тестовых данных (для разработки)
 */
async function initializeTestData() {
    if (process.env.NODE_ENV !== 'development') {
        return;
    }

    try {
        console.log('🔍 Инициализация тестовых данных...');

        // Создаем тестового пользователя если нет
        const testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            const user = new User({
                username: 'testuser',
                email: 'test@example.com',
                password: 'test123',
                role: 'user',
                settings: {
                    timezone: 'Europe/Moscow',
                    dailyReminderTime: '08:00',
                    notificationsEnabled: true
                }
            });
            await user.save();
            console.log('✅ Тестовый пользователь создан: test@example.com / test123');
        }

    } catch (error) {
        console.error('❌ Ошибка создания тестовых данных:', error.message);
    }
}

module.exports = {
    initializeAdmin,
    initializeTestData
};