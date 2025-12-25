import { PrismaClient, Role, HelpRequestStatus, AssignmentStatus } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Очистка в корректном порядке внешних ключей
  await prisma.review.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.helpRequest.deleteMany();
  await prisma.volunteerProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Пользователи
  const adminPassword = await hashPassword("admin123");
  const userPassword = await hashPassword("user12345");
  const volunteerPassword = await hashPassword("volunteer123");

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      username: "admin",
      passwordHash: adminPassword,
      role: Role.admin
    }
  });

  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      username: "user1",
      passwordHash: userPassword,
      role: Role.user
    }
  });

  const volunteer = await prisma.user.create({
    data: {
      email: "volunteer@example.com",
      username: "volunteer1",
      passwordHash: volunteerPassword,
      role: Role.user
    }
  });

  // Категории
  const [catFood, catMedicine] = await prisma.$transaction([
    prisma.category.create({ data: { name: "Продукты", description: "Доставка еды" } }),
    prisma.category.create({ data: { name: "Медицина", description: "Аптечные покупки" } })
  ]);

  // Профиль волонтёра
  const volunteerProfile = await prisma.volunteerProfile.create({
    data: {
      userId: volunteer.id,
      bio: "Готов помочь по району",
      rating: 0,
      totalHelps: 0,
      locationLat: 55.751244,
      locationLng: 37.618423
    }
  });

  // Запрос в статусе new (виден волонтёрам)
  const requestNew = await prisma.helpRequest.create({
    data: {
      title: "Нужно купить продукты",
      description: "Купить хлеб и молоко",
      categoryId: catFood.id,
      userId: user.id,
      status: HelpRequestStatus.new,
      locationAddress: "Москва, ул. Пример, 1",
      locationLat: 55.75,
      locationLng: 37.61
    }
  });

  // Запрос с назначением и отзывом
  const requestCompleted = await prisma.helpRequest.create({
    data: {
      title: "Нужна аптечка",
      description: "Купить витамины",
      categoryId: catMedicine.id,
      userId: user.id,
      status: HelpRequestStatus.completed,
      locationAddress: "Москва, ул. Второй Пример, 2",
      locationLat: 55.76,
      locationLng: 37.62
    }
  });

  const assignment = await prisma.assignment.create({
    data: {
      requestId: requestCompleted.id,
      volunteerId: volunteer.id,
      status: AssignmentStatus.completed,
      completedAt: new Date()
    }
  });

  const review = await prisma.review.create({
    data: {
      assignmentId: assignment.id,
      userId: user.id,
      volunteerId: volunteer.id,
      rating: 5,
      comment: "Спасибо за помощь!"
    }
  });

  // Обновляем агрегаты волонтёра
  await prisma.volunteerProfile.update({
    where: { id: volunteerProfile.id },
    data: {
      rating: 5,
      totalHelps: 1
    }
  });

  console.log("Seed complete:");
  console.log({
    admin: { email: admin.email, password: "admin123" },
    user: { email: user.email, password: "user12345" },
    volunteer: { email: volunteer.email, password: "volunteer123" },
    categories: [catFood.name, catMedicine.name],
    requests: [requestNew.title, requestCompleted.title],
    review: { id: review.id, rating: review.rating }
  });
}

main()
  .catch((err) => {
    console.error("Seed failed", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
