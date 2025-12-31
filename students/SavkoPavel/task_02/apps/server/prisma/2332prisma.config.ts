import { defineConfig } from 'prisma';
import * as dotenv from 'dotenv';

dotenv.config();  // Явно загружаем переменные окружения

export default defineConfig({
  schema: './schema.prisma',
  datasource: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,  // используем переменную из .env
  },
});
