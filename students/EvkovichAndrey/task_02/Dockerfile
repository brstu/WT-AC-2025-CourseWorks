# Dockerfile (в корне)
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код сервера
COPY src/ ./src/

# Создаем папку для логов
RUN mkdir -p logs

# Открываем порт
EXPOSE 5000

# Запускаем приложение
CMD ["node", "src/index.js"]