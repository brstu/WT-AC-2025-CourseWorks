import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { User } from './models/user'
import { Speaker } from './models/speaker'
import { Event } from './models/event'
import { Atendee } from './models/atendee'
import { Ticket } from './models/ticket'
import { Invitation } from './models/invitation'
import { generateUniqueTicketCode } from './utils/generate-unique-ticket-code'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/event-management-system'

// Тестовые данные
const usersData = [
    {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Администратор',
        role: 'admin',
    },
    {
        email: 'user1@example.com',
        password: 'user123',
        name: 'Иван Петров',
        role: 'user',
    },
    {
        email: 'user2@example.com',
        password: 'user123',
        name: 'Мария Сидорова',
        role: 'user',
    },
    {
        email: 'user3@example.com',
        password: 'user123',
        name: 'Алексей Смирнов',
        role: 'user',
    },
]

const speakersData = [
    {
        name: 'Дмитрий Коваленко',
        bio: 'Эксперт в области веб-разработки с 10-летним опытом. Специализируется на React и Node.js.',
        contacts: {
            email: 'dmitry@example.com',
            phone: '+375291234567',
        },
        photo: {
            name: 'default-speaker.jpg',
            alt: 'Фото Дмитрия Коваленко',
        },
    },
    {
        name: 'Анна Волкова',
        bio: 'UX/UI дизайнер, спикер международных конференций. Автор книги "Дизайн-мышление".',
        contacts: {
            email: 'anna@example.com',
            phone: '+375297654321',
        },
        photo: {
            name: 'default-speaker.jpg',
            alt: 'Фото Анны Волковой',
        },
    },
    {
        name: 'Сергей Николаев',
        bio: 'DevOps инженер, специалист по облачным технологиям AWS и Azure.',
        contacts: {
            email: 'sergey@example.com',
            phone: '+375291112233',
        },
        photo: {
            name: 'default-speaker.jpg',
            alt: 'Фото Сергея Николаева',
        },
    },
]

async function seed() {
    try {
        console.log('🌱 Начало заполнения базы данных...')

        // Подключение к MongoDB
        await mongoose.connect(MONGO_URI)
        console.log('✅ Подключение к MongoDB установлено')

        // Очистка существующих данных
        console.log('🗑️  Очистка существующих данных...')
        await Promise.all([
            User.deleteMany({}),
            Speaker.deleteMany({}),
            Event.deleteMany({}),
            Atendee.deleteMany({}),
            Ticket.deleteMany({}),
            Invitation.deleteMany({}),
        ])
        console.log('✅ Данные очищены')

        // Создание пользователей
        console.log('👥 Создание пользователей...')
        const users = []
        for (const userData of usersData) {
            const user = await User.createUser(userData)
            users.push(user)
            console.log(`   ✓ Создан пользователь: ${user.email} (${user.role})`)
        }

        // Создание спикеров
        console.log('🎤 Создание спикеров...')
        const speakers = []
        for (const speakerData of speakersData) {
            const speaker = await Speaker.createSpeaker(speakerData)
            speakers.push(speaker)
            console.log(`   ✓ Создан спикер: ${speaker.name}`)
        }

        // Создание событий
        console.log('📅 Создание событий...')
        const events = []

        const event1 = await Event.createEvent({
            title: 'Web Development Summit 2026',
            venue: 'Минск, IT-парк, зал "Инновации"',
            startsAt: new Date('2026-02-15T10:00:00'),
            endsAt: new Date('2026-02-15T18:00:00'),
            capacity: 100,
            speakers: [speakers[0]._id, speakers[1]._id],
            cover: {
                name: 'default-cover.jpg',
                alt: 'Web Development Summit 2026',
            },
            content: {
                html: '<h2>О мероприятии</h2><p>Главная конференция года по веб-разработке. Узнайте о последних трендах в React, Next.js, и современных веб-технологиях.</p>',
                md: '## О мероприятии\n\nГлавная конференция года по веб-разработке. Узнайте о последних трендах в React, Next.js, и современных веб-технологиях.',
            },
        })
        events.push(event1)
        console.log(`   ✓ Создано событие: ${event1.title}`)

        const event2 = await Event.createEvent({
            title: 'UX/UI Design Meetup',
            venue: 'Минск, Коворкинг "Хаб"',
            startsAt: new Date('2026-02-20T19:00:00'),
            endsAt: new Date('2026-02-20T22:00:00'),
            capacity: 50,
            speakers: [speakers[1]._id],
            cover: {
                name: 'default-cover.jpg',
                alt: 'UX/UI Design Meetup',
            },
            content: {
                html: '<h2>О встрече</h2><p>Встреча дизайнеров для обмена опытом и обсуждения лучших практик в дизайне интерфейсов.</p><h2>Программа</h2><p>19:00 - Регистрация<br>19:30 - Доклады<br>21:00 - Networking</p>',
                md: '## О встрече\n\nВстреча дизайнеров для обмена опытом и обсуждения лучших практик в дизайне интерфейсов.\n\n## Программа\n\n19:00 - Регистрация\n19:30 - Доклады\n21:00 - Networking',
            },
        })
        events.push(event2)
        console.log(`   ✓ Создано событие: ${event2.title}`)

        const event3 = await Event.createEvent({
            title: 'DevOps Workshop: Kubernetes на практике',
            venue: 'Минск, Образовательный центр',
            startsAt: new Date('2026-03-01T14:00:00'),
            endsAt: new Date('2026-03-01T18:00:00'),
            capacity: 30,
            speakers: [speakers[2]._id],
            cover: {
                name: 'default-cover.jpg',
                alt: 'DevOps Workshop',
            },
            content: {
                html: '<h2>О воркшопе</h2><p>Практический воркшоп по развертыванию приложений в Kubernetes.</p><h2>Что вы узнаете</h2><ul><li>Основы Kubernetes</li><li>Деплой приложений</li><li>Мониторинг</li></ul>',
                md: '## О воркшопе\n\nПрактический воркшоп по развертыванию приложений в Kubernetes.\n\n## Что вы узнаете\n\n- Основы Kubernetes\n- Деплой приложений\n- Мониторинг',
            },
        })
        events.push(event3)
        console.log(`   ✓ Создано событие: ${event3.title}`)

        // Регистрация пользователей на события
        console.log('🎫 Регистрация пользователей на события...')

        // Пользователь 1 регистрируется на событие 1
        const atendee1 = await Atendee.registerToEvent({
            event_id: event1._id.toString(),
            user_id: users[1]._id.toString(),
        })
        const ticketCode1 = await generateUniqueTicketCode(Ticket, 8)
        await Ticket.createTicket({
            atendee_id: atendee1._id.toString(),
            user_id: users[1]._id.toString(),
            event: event1._id,
            code: ticketCode1,
        })
        console.log(`   ✓ ${users[1].name} зарегистрирован на "${event1.title}"`)

        // Пользователь 2 регистрируется на событие 2
        const atendee2 = await Atendee.registerToEvent({
            event_id: event2._id.toString(),
            user_id: users[2]._id.toString(),
        })
        const ticketCode2 = await generateUniqueTicketCode(Ticket, 8)
        await Ticket.createTicket({
            atendee_id: atendee2._id.toString(),
            user_id: users[2]._id.toString(),
            event: event2._id,
            code: ticketCode2,
        })
        console.log(`   ✓ ${users[2].name} зарегистрирована на "${event2.title}"`)

        // Пользователь 3 регистрируется на события 1 и 3
        const atendee3 = await Atendee.registerToEvent({
            event_id: event1._id.toString(),
            user_id: users[3]._id.toString(),
        })
        const ticketCode3 = await generateUniqueTicketCode(Ticket, 8)
        await Ticket.createTicket({
            atendee_id: atendee3._id.toString(),
            user_id: users[3]._id.toString(),
            event: event1._id,
            code: ticketCode3,
        })
        console.log(`   ✓ ${users[3].name} зарегистрирован на "${event1.title}"`)

        const atendee4 = await Atendee.registerToEvent({
            event_id: event3._id.toString(),
            user_id: users[3]._id.toString(),
        })
        const ticketCode4 = await generateUniqueTicketCode(Ticket, 8)
        await Ticket.createTicket({
            atendee_id: atendee4._id.toString(),
            user_id: users[3]._id.toString(),
            event: event3._id,
            code: ticketCode4,
        })
        console.log(`   ✓ ${users[3].name} зарегистрирован на "${event3.title}"`)

        // Создание приглашений
        console.log('✉️  Создание приглашений...')
        await Invitation.createInvitation({
            user_invited: users[2]._id.toString(),
            invited_by: users[1]._id.toString(),
            event: event1._id.toString(),
        })
        console.log(`   ✓ ${users[1].name} пригласил ${users[2].name} на "${event1.title}"`)

        console.log('\n✨ Заполнение базы данных завершено успешно!\n')
        console.log('📊 Статистика:')
        console.log(`   👥 Пользователей: ${users.length}`)
        console.log(`   🎤 Спикеров: ${speakers.length}`)
        console.log(`   📅 Событий: ${events.length}`)
        console.log(`   🎫 Билетов: 4`)
        console.log(`   ✉️  Приглашений: 1`)
        console.log('\n🔐 Данные для входа:')
        console.log('   Администратор: admin@example.com / admin123')
        console.log('   Пользователь 1: user1@example.com / user123')
        console.log('   Пользователь 2: user2@example.com / user123')
        console.log('   Пользователь 3: user3@example.com / user123')

        process.exit(0)
    } catch (error) {
        console.error('❌ Ошибка при заполнении базы данных:', error)
        process.exit(1)
    }
}

seed()
