import { afterAll, beforeAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { buildApp } from "../../src/app.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const createTestApp = () => {
  return buildApp();
};

export const getBaseData = () => {
  return {
    testUser: {
      id: "test-user-id",
      email: "test@example.com",
      name: "Test User",
      passwordHash: bcrypt.hashSync("test123!", 10)
    },
    testGroup: {
      id: "test-group-id",
      name: "Test Group",
      description: "Test group description",
      isPrivate: false
    }
  };
};

export const TEST_PASSWORDS = {
  user: "test123!"
};

beforeAll(async () => {
  // Setup test database if needed
});

afterAll(async () => {
  await prisma.$disconnect();
});

