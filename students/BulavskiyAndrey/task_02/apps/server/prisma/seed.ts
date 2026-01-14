import { PrismaClient, MembershipRole, EventType, ChatType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Создаем пользователей
  const adminPassword = await bcrypt.hash("admin123!", 10);
  const userPassword = await bcrypt.hash("user123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      passwordHash: adminPassword
    }
  });

  const user1 = await prisma.user.upsert({
    where: { email: "user1@example.com" },
    update: {},
    create: {
      email: "user1@example.com",
      name: "Test User 1",
      passwordHash: userPassword
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: "user2@example.com" },
    update: {},
    create: {
      email: "user2@example.com",
      name: "Test User 2",
      passwordHash: userPassword
    }
  });

  // Создаем группу
  const group = await prisma.group.upsert({
    where: { id: "demo-group-id" },
    update: {},
    create: {
      id: "demo-group-id",
      name: "Demo Group",
      description: "Тестовая группа для демонстрации",
      isPrivate: false,
      createdById: admin.id
    }
  });

  // Создаем членства
  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: admin.id,
        groupId: group.id
      }
    },
    update: {},
    create: {
      userId: admin.id,
      groupId: group.id,
      role: MembershipRole.admin,
      isActive: true
    }
  });

  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: user1.id,
        groupId: group.id
      }
    },
    update: {},
    create: {
      userId: user1.id,
      groupId: group.id,
      role: MembershipRole.member,
      isActive: true
    }
  });

  await prisma.membership.upsert({
    where: {
      userId_groupId: {
        userId: user2.id,
        groupId: group.id
      }
    },
    update: {},
    create: {
      userId: user2.id,
      groupId: group.id,
      role: MembershipRole.member,
      isActive: true
    }
  });

  // Создаем объявление
  await prisma.announcement.create({
    data: {
      groupId: group.id,
      authorId: admin.id,
      title: "Добро пожаловать в группу!",
      content: "Это тестовое объявление для демонстрации функционала.",
      isPinned: true,
      isPublic: true,
      publishedAt: new Date()
    }
  });

  // Создаем событие
  await prisma.event.create({
    data: {
      groupId: group.id,
      creatorId: admin.id,
      title: "Встреча группы",
      description: "Планируемая встреча для обсуждения проектов",
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // через неделю
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 часа
      location: "Аудитория 101",
      type: EventType.meeting
    }
  });

  // Создаем опрос
  const poll = await prisma.poll.create({
    data: {
      groupId: group.id,
      creatorId: admin.id,
      question: "Какой формат встречи предпочитаете?",
      isAnonymous: false,
      isMultipleChoice: false,
      choices: {
        create: [
          { text: "Онлайн", order: 0 },
          { text: "Офлайн", order: 1 },
          { text: "Гибридный", order: 2 }
        ]
      }
    }
  });

  // Создаем чат
  const chat = await prisma.chat.create({
    data: {
      groupId: group.id,
      createdById: admin.id,
      title: "Общий чат",
      type: ChatType.group,
      isReadOnly: false
    }
  });

  // Создаем сообщение
  await prisma.message.create({
    data: {
      chatId: chat.id,
      authorId: admin.id,
      content: "Привет! Это тестовое сообщение в чате.",
      attachments: []
    }
  });

  console.log("Seed data created successfully!");
  console.log("Group ID:", group.id);
  console.log("Admin:", admin.email);
  console.log("Users:", user1.email, user2.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

