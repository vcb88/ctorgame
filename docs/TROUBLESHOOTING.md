# Troubleshooting Guide

## Common Issues and Solutions

### Development Environment Issues

#### 1. Build Failures

##### Problem: TypeScript Compilation Errors
```
Error: Cannot find module '@ctor-game/shared'
```

**Solution:**
1. Build shared package first:
```bash
cd shared && pnpm build
```

2. Check TypeScript configuration:
```json
{
  "compilerOptions": {
    "paths": {
      "@ctor-game/shared/*": ["../shared/*"]
    }
  }
}
```

3. Verify package.json dependencies:
```json
{
  "dependencies": {
    "@ctor-game/shared": "workspace:*"
  }
}
```

##### Problem: ESLint Configuration Errors
```
Error: Cannot use import statement outside a module
```

**Solution:**
1. Check file extension (.js vs .cjs)
2. Verify module type in package.json:
```json
{
  "type": "module"  // or "commonjs"
}
```

#### 2. Runtime Errors

##### Problem: WebSocket Connection Failed
```
WebSocket connection to 'ws://localhost:3000' failed
```

**Solution:**
1. Check server status:
```bash
# Check if server is running
docker-compose ps
# Or for local development
lsof -i :3000
```

2. Verify WebSocket configuration:
```typescript
// Client
const socket = io('ws://localhost:3000', {
  transports: ['websocket'],
  reconnection: true
});

// Server
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
```

#### 3. Test Failures

##### Problem: Jest/Vitest Configuration
```
Error: No test files found
```

**Solution:**
1. Check test file naming:
```bash
# Should be named
Component.test.tsx
useHook.test.ts
```

2. Verify test configuration:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}']
  }
});
```

### Production Issues

#### 1. Deployment Failures

##### Problem: Docker Build Fails
```
Error: COPY failed: no source files were specified
```

**Solution:**
1. Check Dockerfile paths:
```dockerfile
# Ensure context is correct
COPY . .
# Or specify exact paths
COPY package.json ./
COPY src/ ./src/
```

2. Verify .dockerignore:
```
node_modules
dist
*.log
```

#### 2. Database Issues

##### Problem: Connection Failures
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Check database connection string:
```bash
# Environment variable
echo $DATABASE_URL

# Test connection
nc -zv localhost 5432
```

2. Verify database configuration:
```typescript
// TypeORM config
{
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
}
```

#### 3. Performance Issues

##### Problem: Slow Response Times
```
Warning: Request took longer than 5000ms
```

**Solution:**
1. Check Redis caching:
```typescript
// Implement caching
const gameState = await redis.get(`game:${gameId}`);
if (!gameState) {
  const game = await db.games.findOne(gameId);
  await redis.set(`game:${gameId}`, JSON.stringify(game));
  return game;
}
return JSON.parse(gameState);
```

2. Monitor database queries:
```sql
-- Check slow queries
SELECT * FROM pg_stat_activity 
WHERE state = 'active' 
AND now() - query_start > interval '1 second';
```

### Testing Issues

#### 1. Mock Problems

##### Problem: Socket Mock Not Working
```
Error: socket.emit is not a function
```

**Solution:**
1. Use correct mock setup:
```typescript
// test-utils.ts
export const createMockSocket = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  close: vi.fn()
});

// In tests
const mockSocket = createMockSocket();
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket)
}));
```

#### 2. Coverage Issues

##### Problem: Coverage Below Threshold
```
ERROR: Coverage for statements (75.24%) does not meet threshold (80%)
```

**Solution:**
1. Identify uncovered code:
```bash
pnpm test:coverage
```

2. Add missing test cases:
```typescript
describe('edge cases', () => {
  it('handles empty input', () => {
    // Test implementation
  });
  
  it('handles error states', () => {
    // Test implementation
  });
});
```

### CI/CD Issues

#### 1. GitHub Actions Failures

##### Problem: Build Step Failed
```
Error: Process completed with exit code 1
```

**Solution:**
1. Check build steps:
```yaml
- name: Build shared package first
  run: cd shared && pnpm build

- name: Build dependent packages
  run: |
    cd client && pnpm build
    cd ../server && pnpm build
```

2. Verify cache configuration:
```yaml
- uses: actions/cache@v2
  with:
    path: |
      **/node_modules
      ~/.pnpm-store
    key: ${{ runner.os }}-pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
```

### Debug Tools and Techniques

#### 1. Client-Side Debugging

##### Console Logging
```typescript
const debugSocket = (socket: Socket) => {
  socket.onAny((event, ...args) => {
    console.log(`[Socket Event] ${event}:`, args);
  });
};
```

##### Performance Monitoring
```typescript
// Add Performance Marks
performance.mark('moveStart');
// Make move
performance.mark('moveEnd');
performance.measure('moveOperation', 'moveStart', 'moveEnd');
```

#### 2. Server-Side Debugging

##### Request Logging
```typescript
// Middleware for logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
```

##### WebSocket Debug Events
```typescript
io.on('connection', (socket) => {
  socket.onAny((event, ...args) => {
    console.log(`[Socket ${socket.id}] ${event}:`, args);
  });
});
```

### Common Error Messages and Solutions

#### 1. Client-Side Errors

| Error | Solution |
|-------|----------|
| `Cannot read property 'emit' of undefined` | Check socket initialization |
| `Maximum update depth exceeded` | Check for infinite render loops |
| `Invalid hook call` | Ensure hooks are used in components |

#### 2. Server-Side Errors

| Error | Solution |
|-------|----------|
| `EADDRINUSE` | Port already in use, change port or kill process |
| `ER_NOT_SUPPORTED_AUTH_MODE` | Update MySQL authentication method |
| `Connection refused` | Check database/Redis connection settings |

### Emergency Response Guide

#### 1. Production Issues
1. Check logs:
```bash
docker-compose logs -f
```

2. Monitor metrics:
```bash
# Check Prometheus metrics
curl localhost:9464/metrics
```

3. Emergency rollback:
```bash
# Revert to last known good version
docker-compose down
docker-compose -f docker-compose.prod.yml up -d
```

#### 2. Data Recovery
1. Database backup:
```bash
pg_dump -U postgres ctorgame > backup.sql
```

2. Redis backup:
```bash
redis-cli SAVE
```