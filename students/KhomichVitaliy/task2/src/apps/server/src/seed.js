import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.comment.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.project.deleteMany();
  await prisma.label.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      avatarUrl: faker.image.avatar(),
    },
  });

  const users = await Promise.all(
    Array.from({ length: 5 }).map(async (_, i) => {
      return prisma.user.create({
        data: {
          email: `user${i + 1}@example.com`,
          username: `user${i + 1}`,
          password: hashedPassword,
          name: faker.person.fullName(),
          role: 'USER',
          avatarUrl: faker.image.avatar(),
        },
      });
    })
  );

  const allUsers = [admin, ...users];

  const labels = await Promise.all([
    { name: 'bug', color: '#ef4444' },
    { name: 'feature', color: '#10b981' },
    { name: 'documentation', color: '#3b82f6' },
    { name: 'enhancement', color: '#8b5cf6' },
    { name: 'question', color: '#f59e0b' },
  ].map(label => 
    prisma.label.create({ data: label })
  ));

  const projects = await Promise.all(
    Array.from({ length: 3 }).map(async (_, i) => {
      return prisma.project.create({
        data: {
          name: faker.company.name(),
          description: faker.lorem.paragraph(),
          color: faker.color.rgb(),
          creatorId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
        },
      });
    })
  );

  const issues = [];
  for (const project of projects) {
    for (let i = 0; i < 10; i++) {
      const issue = await prisma.issue.create({
        data: {
          title: faker.hacker.phrase(),
          description: faker.lorem.paragraphs(2),
          status: faker.helpers.arrayElement(['TODO', 'IN_PROGRESS', 'DONE', 'BLOCKED']),
          priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
          dueDate: faker.date.future(),
          projectId: project.id,
          creatorId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
          assigneeId: Math.random() > 0.3 ? 
            allUsers[Math.floor(Math.random() * allUsers.length)].id : null,
        },
      });
      issues.push(issue);
    }
  }

  for (const issue of issues) {
    const issueLabels = faker.helpers.arrayElements(labels, { min: 1, max: 3 });
    await prisma.issue.update({
      where: { id: issue.id },
      data: {
        labels: {
          connect: issueLabels.map(label => ({ id: label.id })),
        },
      },
    });
  }

  for (const issue of issues) {
    const commentCount = faker.number.int({ min: 0, max: 5 });
    for (let i = 0; i < commentCount; i++) {
      await prisma.comment.create({
        data: {
          content: faker.lorem.paragraph(),
          issueId: issue.id,
          authorId: allUsers[Math.floor(Math.random() * allUsers.length)].id,
        },
      });
    }
  }

  console.log('✅ Database seeded successfully');
  console.log(`👥 Users: ${allUsers.length}`);
  console.log(`🏷️ Labels: ${labels.length}`);
  console.log(`📁 Projects: ${projects.length}`);
  console.log(`📝 Issues: ${issues.length}`);
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });