import { prisma } from "../../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET_NOT_CONFIGURED");
  }
  return secret;
}

export async function register(email: string, password: string) {
  if (!email || !password) {
    throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
  }

  if (password.length < 6) {
    throw new Error("PASSWORD_TOO_SHORT");
  }

  const hash = await bcrypt.hash(password, 10);

  const usersCount = await prisma.user.count();
  const role = usersCount === 0 ? "ADMIN" : "USER";

  try {
    return await prisma.user.create({
      data: {
        email,
        password: hash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      throw new Error("USER_ALREADY_EXISTS");
    }
    throw err; // ❗ НЕ затираем
  }
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("EMAIL_AND_PASSWORD_REQUIRED");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), {
    expiresIn: "1d",
  });

  return { token };
}
