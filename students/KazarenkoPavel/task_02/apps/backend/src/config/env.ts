import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  FRONTEND_ORIGIN: z.string().url(),
  REFRESH_TOKEN_COOKIE_NAME: z.string().default("refreshToken"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(10)
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === "production";
