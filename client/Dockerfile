# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml ./

# Copy all package.json and pnpm-lock.yaml files
COPY package.json pnpm-lock.yaml ./
COPY shared/package.json ./shared/
COPY client/package.json ./client/

# Install dependencies
RUN pnpm install

# Copy source files
COPY shared/ ./shared/
COPY client/ ./client/

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build client
WORKDIR /app/client

# Build application
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]