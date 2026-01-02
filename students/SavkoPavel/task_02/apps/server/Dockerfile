# Используем более легкий образ
FROM node:20-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем Prisma схемы
COPY prisma ./prisma

# Генерация Prisma Client
RUN npx prisma generate

# Копируем оставшиеся файлы
COPY tsconfig.json ./
COPY src ./src

# Указываем команду для старта приложения
CMD ["npm", "run", "dev"]
