# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy workspace configuration files first
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Copy shared module
COPY shared/ ./shared/

# Copy server package files
COPY server/ ./server/

# Install all dependencies
RUN pnpm install

# Build server
WORKDIR /app/server
RUN pnpm build

# Production stage
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace config and package files
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/tsconfig.base.json ./

# Copy shared module (needed for types)
COPY --from=builder /app/shared ./shared

# Copy server package and built files
COPY --from=builder /app/server/package.json ./server/
COPY --from=builder /app/server/dist ./server/dist

# Install production dependencies only
WORKDIR /app/server
RUN pnpm install --prod

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]