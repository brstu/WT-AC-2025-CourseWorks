import { prisma } from "../lib/prisma";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";

async function resetDb() {
  // Order matters because of FK constraints
  await prisma.comment.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.sLA.deleteMany();
  await prisma.queueMember.deleteMany();
  await prisma.queue.deleteMany();
  await prisma.user.deleteMany();
}

beforeEach(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});
