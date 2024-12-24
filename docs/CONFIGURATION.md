# Configuration Guide

## Environment Setup

### Development Environment

#### Required Software
- Node.js (v18+)
- pnpm (v8+)
- Docker & Docker Compose (optional)
- Git

#### Environment Variables

```bash
# .env.development
# Client
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
VITE_ENV=development

# Server
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ctorgame
REDIS_URL=redis://localhost:6379
```

### Production Environment

```bash
# .env.production
# Client
VITE_API_URL=https://api.ctorgame.com
VITE_WS_URL=wss://api.ctorgame.com
VITE_ENV=production

# Server
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://user:password@postgres:5432/ctorgame
REDIS_URL=redis://redis:6379
```

## TypeScript Configuration

### Base Configuration (tsconfig.base.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noEmit": false
  }
}
```

### Client Configuration (client/tsconfig.json)
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest/globals", "jest"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@ctor-game/shared/*": ["../shared/*"]
    }
  },
  "include": ["src"]
}
```

### Server Configuration (server/tsconfig.json)
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "./dist",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src"]
}
```

## Docker Configuration

### Development Setup (docker-compose.dev.yml)
```yaml
version: '3.8'

services:
  client:
    build:
      context: .
      dockerfile: client/Dockerfile.dev
    volumes:
      - ./client:/app
      - /app/node_modules
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://localhost:3000
      - VITE_WS_URL=ws://localhost:3000

  server:
    build:
      context: .
      dockerfile: server/Dockerfile.dev
    volumes:
      - ./server:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@postgres:5432/ctorgame
      - REDIS_URL=redis://redis:6379

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ctorgame
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## CI/CD Configuration

### GitHub Actions (ci.yml)
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: ctorgame_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies and build shared
        run: |
          pnpm install -r
          cd shared && pnpm build

      - name: Run tests
        run: |
          cd client && pnpm test
          cd ../server && pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/ctorgame_test
          REDIS_URL: redis://localhost:6379
```

## ESLint Configuration

### Client Configuration (client/eslint.config.js)
```javascript
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-refresh': reactRefreshPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      // ... rules configuration
    }
  }
];
```

### Server Configuration (server/eslint.config.cjs)
```javascript
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

module.exports = [
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      // ... rules configuration
    }
  }
];
```

## Test Configuration

### Vitest Configuration (client/vitest.config.ts)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        'test/**',
        'tests/**',
      ]
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@ctor-game/shared': '/shared'
    }
  }
});
```

### Jest Configuration (server/jest.config.js)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Database Configuration

### TypeORM Configuration (server/src/config/database.ts)
```typescript
import { DataSource } from 'typeorm';
import { Game } from '../entities/Game';
import { Move } from '../entities/Move';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Game, Move],
  migrations: ['src/migrations/*.ts'],
  subscribers: []
});
```

## Monitoring Configuration

### Application Monitoring
```typescript
// server/src/config/monitor.ts
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/metrics';

export const setupMonitoring = () => {
  const exporter = new PrometheusExporter({
    port: 9464,
    startServer: true
  });

  const meterProvider = new MeterProvider({
    exporter,
    interval: 1000
  });

  const meter = meterProvider.getMeter('ctorgame');

  return {
    gameStartCounter: meter.createCounter('game_starts'),
    moveCounter: meter.createCounter('moves_made'),
    activeGamesGauge: meter.createUpDownCounter('active_games')
  };
};
```

## Deployment Configuration

### Nginx Configuration (nginx.conf)
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server server:3000;
    }

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```