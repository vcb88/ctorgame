# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY server/package.json server/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY server/ .

# Build application
RUN pnpm build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files and built app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/dist ./dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "dist/index.js"]