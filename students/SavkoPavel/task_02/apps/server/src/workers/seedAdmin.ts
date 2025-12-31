import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

export async function ensureSeedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  if (password.length < 6) {
    console.warn("SEED_ADMIN_PASSWORD is too short; skipping seed admin");
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // ensure role
    if (existing.role !== "ADMIN") {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`👤 Seed admin promoted: ${email}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role: "ADMIN",
    },
    select: { id: true },
  });

  console.log(`👤 Seed admin created: ${email}`);
}
