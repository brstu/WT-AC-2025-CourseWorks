FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

RUN npx prisma generate

FROM node:18-alpine
    
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

COPY src ./src
COPY tsconfig.json ./

RUN chown -R nodejs:nodejs /app

USER nodejs

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:${PORT}/health', (r) => {if(r.statusCode !== 200) throw new Error()})"

EXPOSE 3001

CMD ["node", "src/index.js"]