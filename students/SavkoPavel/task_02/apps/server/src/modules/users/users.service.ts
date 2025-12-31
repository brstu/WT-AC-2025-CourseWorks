import { prisma } from "../../lib/prisma";

export function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export function updateUserRole(id: string, role: "USER" | "ADMIN" | "AGENT") {
  return prisma.user.update({
    where: { id },
    data: { role },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN" | "AGENT";
}) {
  return prisma.user.create({
    data: {
      email: params.email,
      password: params.passwordHash,
      role: params.role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(id: string, data: { email?: string; role?: "USER" | "ADMIN" | "AGENT" }) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}
