import { PrismaClient, Role, Permission } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  // Clean existing data to make seed idempotent
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.noteHistory.deleteMany(),
    prisma.noteLabel.deleteMany(),
    prisma.share.deleteMany(),
    prisma.note.deleteMany(),
    prisma.label.deleteMany(),
    prisma.notebook.deleteMany(),
    prisma.user.deleteMany()
  ]);

  const passwords = {
    admin: "Admin123!",
    alice: "User123!",
    bob: "User234!",
    charlie: "User345!"
  };

  const [admin, alice, bob, charlie] = await Promise.all([
    prisma.user.create({
      data: {
        username: "admin",
        passwordHash: await bcrypt.hash(passwords.admin, saltRounds),
        role: Role.admin
      }
    }),
    prisma.user.create({
      data: {
        username: "alice",
        passwordHash: await bcrypt.hash(passwords.alice, saltRounds),
        role: Role.user
      }
    }),
    prisma.user.create({
      data: {
        username: "bob",
        passwordHash: await bcrypt.hash(passwords.bob, saltRounds),
        role: Role.user
      }
    }),
    prisma.user.create({
      data: {
        username: "charlie",
        passwordHash: await bcrypt.hash(passwords.charlie, saltRounds),
        role: Role.user
      }
    })
  ]);

  const systemLabel = await prisma.label.create({
    data: {
      name: "Важно",
      color: "#f59e0b",
      isSystem: true
    }
  });

  const urgentLabel = await prisma.label.create({
    data: {
      name: "Срочно",
      color: "#ef4444",
      isSystem: true
    }
  });

  const personalLabel = await prisma.label.create({
    data: {
      name: "Личное",
      color: "#6366f1",
      ownerId: alice.id
    }
  });

  const workLabel = await prisma.label.create({
    data: {
      name: "Работа",
      color: "#8b5cf6",
      ownerId: alice.id
    }
  });

  const sharedLabel = await prisma.label.create({
    data: {
      name: "Совместно",
      color: "#0ea5e9",
      ownerId: alice.id
    }
  });

  const ideaLabel = await prisma.label.create({
    data: {
      name: "Идеи",
      color: "#10b981",
      ownerId: bob.id
    }
  });

  // Alice's notebooks
  const notebook = await prisma.notebook.create({
    data: {
      title: "Проект заметок",
      description: "Демо-тетрадь для проверки прав и совместного редактирования",
      ownerId: alice.id
    }
  });

  const notebook2 = await prisma.notebook.create({
    data: {
      title: "Рабочие задачи",
      description: "Планирование и отслеживание рабочих задач",
      ownerId: alice.id
    }
  });

  // Bob's notebook
  const bobNotebook = await prisma.notebook.create({
    data: {
      title: "Идеи и мысли",
      description: "Личная тетрадь Bob для креативных идей",
      ownerId: bob.id
    }
  });

  // Charlie's notebook
  const charlieNotebook = await prisma.notebook.create({
    data: {
      title: "Обучение",
      description: "Конспекты и заметки по изучаемым технологиям",
      ownerId: charlie.id
    }
  });

  // Notes in Alice's first notebook
  const note1 = await prisma.note.create({
    data: {
      notebookId: notebook.id,
      title: "Черновик требований",
      content: "## Требования к проекту\n\nНачальный текст заметки. Будет обновлён для демонстрации истории изменений.\n\n- Функция создания тетрадей\n- Совместное редактирование\n- Система меток\n- История версий",
      labels: {
        create: [
          { label: { connect: { id: systemLabel.id } } },
          { label: { connect: { id: workLabel.id } } }
        ]
      }
    }
  });

  const note2 = await prisma.note.create({
    data: {
      notebookId: notebook.id,
      title: "Идеи по совместной работе",
      content: "## Возможности совместной работы\n\nBob имеет доступ по share (write) и может редактировать эту заметку.\n\n**Преимущества:**\n- Реальное время синхронизации\n- Разграничение прав доступа\n- История изменений каждого участника",
      labels: {
        create: [
          { label: { connect: { id: sharedLabel.id } } },
          { label: { connect: { id: urgentLabel.id } } }
        ]
      }
    }
  });

  const note3 = await prisma.note.create({
    data: {
      notebookId: notebook.id,
      title: "Личные мысли",
      content: "Эта заметка доступна только мне (Alice) и админу.",
      labels: {
        create: [{ label: { connect: { id: personalLabel.id } } }]
      }
    }
  });

  // Notes in Alice's second notebook
  const note4 = await prisma.note.create({
    data: {
      notebookId: notebook2.id,
      title: "Задачи на неделю",
      content: "## План задач\n\n1. ✅ Разработать API\n2. ✅ Настроить базу данных\n3. ⏳ Реализовать фронтенд\n4. 📋 Написать документацию\n5. 🧪 Провести тестирование",
      labels: {
        create: [
          { label: { connect: { id: workLabel.id } } },
          { label: { connect: { id: urgentLabel.id } } }
        ]
      }
    }
  });

  const note5 = await prisma.note.create({
    data: {
      notebookId: notebook2.id,
      title: "Встреча с командой",
      content: "**Дата:** 5 января 2026\n**Время:** 14:00\n\n### Повестка дня:\n- Обсуждение прогресса\n- Планирование следующего спринта\n- Вопросы и предложения",
      labels: {
        create: [{ label: { connect: { id: systemLabel.id } } }]
      }
    }
  });

  // Notes in Bob's notebook
  const bobNote1 = await prisma.note.create({
    data: {
      notebookId: bobNotebook.id,
      title: "Новая функция для приложения",
      content: "## Идея: Темная тема\n\nРеализовать переключатель темной/светлой темы для улучшения UX.",
      labels: {
        create: [{ label: { connect: { id: ideaLabel.id } } }]
      }
    }
  });

  const bobNote2 = await prisma.note.create({
    data: {
      notebookId: bobNotebook.id,
      title: "Рефакторинг кода",
      content: "Список участков кода, которые нужно оптимизировать:\n- Модуль авторизации\n- API клиент\n- Валидация форм",
      labels: {
        create: [{ label: { connect: { id: ideaLabel.id } } }]
      }
    }
  });

  // Notes in Charlie's notebook
  const charlieNote1 = await prisma.note.create({
    data: {
      notebookId: charlieNotebook.id,
      title: "Конспект: React Hooks",
      content: "## useState\nИспользуется для хранения локального состояния компонента.\n\n## useEffect\nВыполняет побочные эффекты (API запросы, подписки).\n\n## useContext\nДоступ к контексту без prop drilling.",
      labels: {
        create: []
      }
    }
  });

  const charlieNote2 = await prisma.note.create({
    data: {
      notebookId: charlieNotebook.id,
      title: "Примеры JWT авторизации",
      content: "### Access Token\nХранится в памяти (React Context).\n\n### Refresh Token\nХранится в HttpOnly cookie для безопасности.\n\n### Защита от CSRF\nИспользование SameSite cookie атрибута.",
      labels: {
        create: []
      }
    }
  });

  // Shares: Bob has write access to Alice's first notebook
  await prisma.share.create({
    data: {
      notebookId: notebook.id,
      userId: bob.id,
      permission: Permission.write
    }
  });

  // Charlie has read access to Alice's second notebook
  await prisma.share.create({
    data: {
      notebookId: notebook2.id,
      userId: charlie.id,
      permission: Permission.read
    }
  });

  // Alice has read access to Bob's notebook
  await prisma.share.create({
    data: {
      notebookId: bobNotebook.id,
      userId: alice.id,
      permission: Permission.read
    }
  });

  // Add history versions to demonstrate restore functionality
  await prisma.noteHistory.create({
    data: {
      noteId: note1.id,
      content: "## Требования к проекту\n\nРанняя версия заметки до правок.\n\n- Базовая функциональность",
      editedById: alice.id
    }
  });

  await prisma.noteHistory.create({
    data: {
      noteId: note1.id,
      content: "## Требования к проекту\n\nПромежуточная версия с дополнениями.\n\n- Базовая функциональность\n- Роли и права доступа",
      editedById: alice.id
    }
  });

  await prisma.noteHistory.create({
    data: {
      noteId: note2.id,
      content: "## Возможности совместной работы\n\nПервая версия идеи о совместной работе.",
      editedById: alice.id
    }
  });

  await prisma.noteHistory.create({
    data: {
      noteId: note2.id,
      content: "## Возможности совместной работы\n\nВерсия после редактирования Bob.\n\n**Добавлено:**\n- Комментарии от Bob\n- Предложения по улучшению",
      editedById: bob.id
    }
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📋 Test users:");
  console.log(`   admin   / ${passwords.admin}  (роль: admin)`);
  console.log(`   alice   / ${passwords.alice}  (роль: user, владелец 2 тетрадей)`);
  console.log(`   bob     / ${passwords.bob}  (роль: user, владелец 1 тетради, write доступ к тетради Alice)`);
  console.log(`   charlie / ${passwords.charlie}  (роль: user, владелец 1 тетради, read доступ к тетради Alice)`);
  console.log("\n📊 Created data:");
  console.log(`   Users: 4`);
  console.log(`   Notebooks: 4`);
  console.log(`   Notes: 10`);
  console.log(`   Labels: 6 (2 system + 4 user)`);
  console.log(`   Shares: 3`);
  console.log(`   History entries: 4`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
