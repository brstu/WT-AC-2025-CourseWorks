import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // cleanup in dependency order
  await prisma.refreshToken.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.note.deleteMany();
  await prisma.stage.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const user1Password = await bcrypt.hash('User123!', 10);
  const user2Password = await bcrypt.hash('User123!', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.admin,
    },
  });

  const alice = await prisma.user.create({
    data: {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash: user1Password,
      role: Role.user,
    },
  });

  const bob = await prisma.user.create({
    data: {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash: user2Password,
      role: Role.user,
    },
  });

  const acme = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      description: 'Продуктовая компания (frontend вакансия)'.slice(0, 1000),
      userId: alice.id,
    },
  });

  const globex = await prisma.company.create({
    data: {
      name: 'Globex',
      description: 'Консалтинг, backend вакансия'.slice(0, 1000),
      userId: bob.id,
    },
  });

  const frontendJob = await prisma.job.create({
    data: {
      title: 'Frontend Developer',
      companyId: acme.id,
      userId: alice.id,
      status: 'INTERVIEW',
      salary: '2500-3000 USD',
      location: 'Remote',
      url: 'https://example.com/jobs/frontend',
    },
  });

  const backendJob = await prisma.job.create({
    data: {
      title: 'Backend Engineer',
      companyId: globex.id,
      userId: bob.id,
      status: 'SCREENING',
      salary: '2800-3300 USD',
      location: 'Hybrid',
      url: 'https://example.com/jobs/backend',
    },
  });

  // Stages for frontend job (alice)
  const stageApplied = await prisma.stage.create({
    data: {
      jobId: frontendJob.id,
      name: 'Applied',
      order: 0,
      date: new Date(),
    },
  });
  const stageInterview = await prisma.stage.create({
    data: {
      jobId: frontendJob.id,
      name: 'Interview',
      order: 1,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });
  const stageOffer = await prisma.stage.create({
    data: {
      jobId: frontendJob.id,
      name: 'Offer',
      order: 2,
      date: null,
    },
  });

  await prisma.job.update({
    where: { id: frontendJob.id },
    data: { currentStageId: stageInterview.id },
  });

  // Stages for backend job (bob)
  const stagePhone = await prisma.stage.create({
    data: {
      jobId: backendJob.id,
      name: 'Phone screen',
      order: 0,
      date: new Date(),
    },
  });
  await prisma.job.update({
    where: { id: backendJob.id },
    data: { currentStageId: stagePhone.id },
  });

  // Notes
  await prisma.note.create({
    data: {
      jobId: frontendJob.id,
      content: 'Отправил тестовое задание. Жду ответа.',
    },
  });
  await prisma.note.create({
    data: {
      jobId: backendJob.id,
      content: 'Нужно подготовить примеры по Node.js и Prisma.',
    },
  });

  // Reminders
  await prisma.reminder.create({
    data: {
      jobId: frontendJob.id,
      title: 'Фоллоу-ап после интервью',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.reminder.create({
    data: {
      jobId: backendJob.id,
      title: 'Отправить резюме обновлённое',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seed completed. Users:');
  console.log({
    admin: { email: admin.email, password: 'Admin123!' },
    alice: { email: alice.email, password: 'User123!' },
    bob: { email: bob.email, password: 'User123!' },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
