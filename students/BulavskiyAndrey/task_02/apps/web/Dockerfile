# Multi-stage build for React SPA with nginx

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /repo
# hadolint ignore=DL3008
RUN corepack enable

# Copy monorepo configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/ ./apps/
COPY packages/ ./packages/

# Install dependencies
# hadolint ignore=DL3008
RUN pnpm install --frozen-lockfile

# Build argument for API URL
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the web app
# hadolint ignore=DL3008
RUN pnpm --filter @app/web build

# Stage 2: Serve with nginx
FROM nginx:alpine AS production

# Copy built files
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html

# Copy nginx configuration
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

