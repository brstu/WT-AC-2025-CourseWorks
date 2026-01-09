# client/Dockerfile (исправленный)
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Копируем package.json отдельно
COPY package*.json ./

# 2. Устанавливаем ВСЕ зависимости
RUN npm install

# 3. Копируем остальные файлы
COPY . .

# 4. Собираем проект
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]