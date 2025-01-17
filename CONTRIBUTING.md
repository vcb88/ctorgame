# Contributing to CTORGame

## MVP Development Focus

Currently, the project is in MVP phase with focus on core functionality and basic reliability. This affects how we handle contributions:

1. Priority Areas:
   - Core gameplay functionality
   - Basic error handling
   - Essential connection management
   - Critical path testing
   - Minimal documentation

2. Postponed Areas:
   - Advanced features
   - Comprehensive testing
   - Performance optimization
   - Advanced monitoring
   - Complex error recovery

## Development Guidelines

### Type System Notes

The project maintains shared types in three locations:
1. `/shared` - Source of truth
2. `/client/src/shared.ts` - Client copy
3. `/server/src/shared.ts` - Server copy

**Important**: 
1. During MVP phase, these files must be manually synchronized when making changes to shared types.
2. All types are defined in core.ts and should be imported directly from there.
3. Do not use type aliases with 'as' keyword in imports unless absolutely necessary (e.g. for resolving name conflicts).
4. Keep type naming consistent across the codebase.

### Development Workflow

1. Basic Setup
```bash
# Clone repository
git clone https://github.com/vcb88/ctorgame.git
cd ctorgame

# Install dependencies
pnpm install
cd server && pnpm install
cd ../client && pnpm install

# Start development
cd server && pnpm dev
cd client && pnpm dev
```

2. Making Changes
```bash
# Create feature branch
git checkout stable-v0.1.0
git checkout -b feature/your-feature

# After changes
git add .
git commit -m "type: brief description"
git push origin feature/your-feature
```

### MVP Guidelines

1. Code Changes
   - Keep changes minimal
   - Focus on critical paths
   - Maintain basic reliability
   - Avoid premature optimization
   - Simplify error handling

2. Testing
   - Test critical paths only
   - Basic error scenarios
   - Essential integration tests
   - Simple E2E tests
   - Skip advanced test cases

3. Documentation
   - Document core features
   - Keep API docs current
   - Basic setup instructions
   - Essential troubleshooting
   - Skip advanced scenarios

## Project Structure

```
ctorgame/
├── client/          # Frontend application
├── server/          # Backend application
├── shared/          # Shared types and utilities
└── docs/           # Documentation
```

## Making Changes

### 1. Type System Changes

Before making changes:
```bash
# Update shared types
cd shared
# Edit types
# Build shared package
pnpm build

# Update client types
cd ../client
# Sync shared.ts

# Update server types
cd ../server
# Sync shared.ts

# Verify types
pnpm type-check
```

### 2. Code Changes

Follow MVP priorities:
```typescript
// GOOD - Simple error handling
if (error) {
    logger.error('Operation failed', { error });
    return { success: false, error: 'Operation failed' };
}

// BAD - Over-engineered error handling
if (error instanceof CustomError) {
    await errorTracking.capture(error);
    await retryStrategy.execute(operation);
    return new ErrorResponse(error);
}
```

### 3. Documentation

Focus on essentials:
```markdown
## Feature X

Basic usage:
```typescript
// Simple example
const result = await featureX(input);
```

Common errors:
- Invalid input
- Connection failed
- Timeout
```

## Pull Request Process

1. Create PR to stable-v0.1.0 branch
2. Include:
   - Minimal feature description
   - Critical test cases
   - Basic documentation
   - Simple examples

3. Review checklist:
   - Core functionality works
   - Critical paths tested
   - Types synchronized
   - Basic docs updated

## Testing

Focus on critical paths:
```bash
# Run essential tests
pnpm test:critical    # Core functionality
pnpm test:integration # Basic integration
```

## Documentation

Keep it simple:
1. Update relevant docs in /docs
2. Focus on:
   - Core features
   - Basic setup
   - Common issues
   - Essential APIs

## Version Control

### Branch Strategy
- stable-v0.1.0: current MVP branch
- feature/*: new features
- fix/*: critical fixes

### Commit Messages
```
feat: add basic error handling
fix: resolve critical connection issue
docs: update core API documentation
```

## Need Help?

Check key documentation:
- [Current Status](docs/CURRENT_STATUS.md)
- [Database Structures](docs/DATABASE_STRUCTURES.md)
- [WebSocket API V2](docs/WEBSOCKET_API_V2.md)
- [Environment Config](docs/ENVIRONMENT_CONFIG.md)

Last updated: January 14, 2025