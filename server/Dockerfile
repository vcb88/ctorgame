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
COPY server/package.json ./server/

# Install dependencies
RUN pnpm install

# Copy source files
COPY shared/ ./shared/
COPY server/ ./server/

# Build shared package first
WORKDIR /app/shared
RUN pnpm build

# Build server
WORKDIR /app/server
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config and package files
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/shared/package.json ./shared/
COPY --from=builder /app/server/package.json ./server/

# Copy built files
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/server/dist ./server/dist

# Install production dependencies only
WORKDIR /app/server
RUN pnpm install --prod

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]