import { PrismaClient, Role, BookingStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function hash(password: string) {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  // Чистка данных в корректном порядке (учитываем связи)
  await prisma.auditLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();

  // Пользователи
  const [admin, teacher, student] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@example.com",
        username: "admin",
        role: Role.admin,
        passwordHash: await hash("Admin123!")
      }
    }),
    prisma.user.create({
      data: {
        email: "teacher@example.com",
        username: "teacher",
        role: Role.teacher,
        passwordHash: await hash("Teacher123!")
      }
    }),
    prisma.user.create({
      data: {
        email: "student@example.com",
        username: "student",
        role: Role.student,
        passwordHash: await hash("Student123!")
      }
    })
  ]);

  // Аудитории
  const [room101, room102] = await prisma.$transaction([
    prisma.room.create({
      data: {
        name: "Room 101",
        description: "Проектор, 30 мест",
        capacity: 30,
        equipment: "Projector, Whiteboard",
        location: "Корпус A"
      }
    }),
    prisma.room.create({
      data: {
        name: "Room 102",
        description: "Компьютерный класс",
        capacity: 20,
        equipment: "PC x20, Projector",
        location: "Корпус A"
      }
    })
  ]);

  // Бронирования (без конфликтов)
  await prisma.booking.createMany({
    data: [
      {
        roomId: room101.id,
        userId: student.id,
        startTime: new Date("2025-01-15T10:00:00Z"),
        endTime: new Date("2025-01-15T11:30:00Z"),
        purpose: "Подготовка к экзамену",
        status: BookingStatus.active
      },
      {
        roomId: room102.id,
        userId: teacher.id,
        startTime: new Date("2025-01-15T12:00:00Z"),
        endTime: new Date("2025-01-15T14:00:00Z"),
        purpose: "Лекция по алгоритмам",
        status: BookingStatus.active
      }
    ]
  });

  console.log("Seed completed: users, rooms, bookings created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
