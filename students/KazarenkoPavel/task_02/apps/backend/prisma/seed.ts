import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { PrismaClient, Role, TaskPriority, TaskStatus, SessionType, SessionStatus } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

async function clearData() {
  await prisma.refreshToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.notificationSettings.deleteMany();
  await prisma.user.deleteMany();
}

async function createUser(params: {
  email: string;
  username: string;
  password: string;
  role: Role;
}) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const passwordHash = await bcrypt.hash(params.password, saltRounds);
  return prisma.user.create({
    data: {
      email: params.email,
      username: params.username,
      passwordHash,
      role: params.role
    }
  });
}

async function seed() {
  console.log("Seeding database...");
  await clearData();

  const admin = await createUser({
    email: "admin@example.com",
    username: "admin",
    password: "Admin123!",
    role: Role.admin
  });

  const alice = await createUser({
    email: "alice@example.com",
    username: "alice",
    password: "User123!",
    role: Role.user
  });

  const bob = await createUser({
    email: "bob@example.com",
    username: "bob",
    password: "User123!",
    role: Role.user
  });

  await prisma.notificationSettings.createMany({
    data: [admin, alice, bob].map((u) => ({ userId: u.id }))
  });

  const aliceTags = await prisma.$transaction([
    prisma.tag.create({ data: { name: "Work", color: "#2563eb", userId: alice.id } }),
    prisma.tag.create({ data: { name: "Focus", color: "#16a34a", userId: alice.id } })
  ]);

  const workTag = aliceTags[0];
  const focusTag = aliceTags[1];

  const taskPlanning = await prisma.task.create({
    data: {
      title: "Plan sprint backlog",
      description: "Outline tasks for the week and estimate effort",
      priority: TaskPriority.high,
      status: TaskStatus.in_progress,
      userId: alice.id,
      tags: {
        create: [
          { tag: { connect: { id: workTag.id } } },
          { tag: { connect: { id: focusTag.id } } }
        ]
      }
    }
  });

  const taskStudy = await prisma.task.create({
    data: {
      title: "Study TypeScript generics",
      description: "Watch tutorial and refactor sample code",
      priority: TaskPriority.medium,
      status: TaskStatus.pending,
      userId: alice.id,
      tags: {
        create: [{ tag: { connect: { id: focusTag.id } } }]
      }
    }
  });

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const thirtyMins = 30 * 60 * 1000;

  await prisma.session.createMany({
    data: [
      {
        userId: alice.id,
        taskId: taskPlanning.id,
        startTime: oneHourAgo,
        endTime: new Date(oneHourAgo.getTime() + thirtyMins),
        duration: 30,
        status: SessionStatus.completed,
        sessionType: SessionType.pomodoro,
        totalPausedSeconds: 0
      },
      {
        userId: alice.id,
        taskId: taskStudy.id,
        startTime: new Date(now.getTime() - 25 * 60 * 1000),
        endTime: null,
        duration: 25,
        status: SessionStatus.running,
        sessionType: SessionType.pomodoro,
        totalPausedSeconds: 60
      }
    ]
  });

  console.log("Seed complete. Admin and users created with sample data.");
}

seed()
  .catch((e) => {
    console.error("Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
