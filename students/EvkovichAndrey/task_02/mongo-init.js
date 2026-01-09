db = db.getSiblingDB('admin');

// Создаем админа
db.createUser({
    user: 'admin',
    pwd: 'password123',
    roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }, 'readWriteAnyDatabase']
});

// Создаем базу данных и пользователя для приложения
db = db.getSiblingDB('habit-tracker');

db.createUser({
    user: 'habittracker',
    pwd: 'habittracker123',
    roles: [
        {
            role: 'readWrite',
            db: 'habit-tracker'
        }
    ]
});

// Создаем коллекции и индексы
db.createCollection('users');
db.createCollection('habits');
db.createCollection('entries');
db.createCollection('goals');
db.createCollection('reminders');

// Создаем индексы
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.entries.createIndex({ user: 1, habit: 1, date: 1 }, { unique: true });

console.log('✅ MongoDB initialized successfully!');