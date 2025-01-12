# Testing Setup and Shared Package Documentation

## Table of Contents
1. [Project Structure Changes](#project-structure-changes)
2. [Shared Package](#shared-package)
3. [Testing Setup](#testing-setup)
4. [CI/CD Integration](#cicd-integration)
5. [Best Practices](#best-practices)
6. [Migration Notes](#migration-notes)
7. [Dependency Management](#dependency-management)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

## Project Structure Changes

### Monorepo Setup
The project has been restructured as a monorepo with three main packages:
- `client`: Frontend React application
- `server`: Backend Node.js server
- `shared`: Shared types and utilities

```
ctorgame/
├── client/         # Frontend React application
├── server/         # Backend Node.js server
├── shared/         # Shared types and utilities
├── docs/           # Documentation
└── package.json    # Root package.json for monorepo management
```

## Shared Package

### Purpose
The shared package contains common types, interfaces, and utilities used by both client and server packages. This ensures type consistency across the entire application.

### Structure
```
shared/
├── types/         # Shared TypeScript types and interfaces
├── package.json   # Package configuration
└── tsconfig.json  # TypeScript configuration
```

### Usage
The shared package is referenced in both client and server packages as a workspace dependency:
```json
{
  "dependencies": {
    "@ctor-game/shared": "workspace:*"
  }
}
```

### Working with Shared Types

#### Organization Structure
The project maintains shared types in three locations:
1. `shared/types/` - source of truth, contains original type definitions
2. `client/src/shared.ts` - copy of types for client
3. `server/src/shared.ts` - copy of types for server

#### Important Rules
1. Do NOT use direct imports from shared module in client or server (e.g., `import { Type } from '../../shared/types'`).
2. All required types should be copied into local `shared.ts` files.
3. When adding or modifying types:
   - First update the types in `shared/types/`
   - Then copy the changes to both `client/src/shared.ts` and `server/src/shared.ts`
   - Maintain identical type definitions across all three locations
   - Before committing, verify type consistency between all files

#### Type Synchronization
- After any changes in shared types, sync the changes across all three locations
- Consider the most recent version as the source of truth in case of discrepancies
- Remove duplicate type definitions to prevent confusion
- Keep consistent naming and structure across all locations

#### Best Practices
1. Minimize changes to type signatures to reduce maintenance overhead
2. When modifying a type used in client-server communication:
   - Update all three locations simultaneously
   - Check all usage locations for potential breaking changes
   - Update related validation and test code
3. Document type changes in commit messages and update relevant documentation

#### Example Workflow
```typescript
// 1. First update in shared/types/game.ts
export interface IGameMove {
    type: OperationType;
    position: IPosition;
    timestamp?: number; // New field
}

// 2. Update in client/src/shared.ts
export interface IGameMove {
    type: OperationType;
    position: IPosition;
    timestamp?: number; // Copy the change
}

// 3. Update in server/src/shared.ts
export interface IGameMove {
    type: OperationType;
    position: IPosition;
    timestamp?: number; // Copy the change
}
```

## Testing Setup

### Technology Stack
- Vitest: Test runner
- React Testing Library: Component testing
- @testing-library/jest-dom: DOM matchers
- @testing-library/react-hooks: Hook testing utilities

### Test Configuration

#### Vitest Configuration (client/vitest.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        'test/**',
        'tests/**',
        '**/*.config.{js,ts}',
      ],
    },
    deps: {
      inline: [/@testing-library\/react/],
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  }
})
```

### Test Utils

#### Test Setup (client/src/test/setup.ts)
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Global setup
window.vi = vi;
expect.extend(matchers);

// Setup for each test
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});
```

#### Custom Test Utilities (client/src/test/test-utils.tsx)
```typescript
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Custom render for components with providers
const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });

// Socket.IO mock creator
export const createMockSocket = () => ({
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
  close: vi.fn(),
});

export * from '@testing-library/react';
export { customRender as render };
```

### Writing Tests

#### Example Test (client/src/hooks/useMultiplayerGame.test.ts)
```typescript
import { renderHook } from '@testing-library/react';
import { createMockSocket } from '../test/test-utils';

describe('useMultiplayerGame', () => {
  const mockSocket = createMockSocket();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle game state updates', () => {
    const { result } = renderHook(() => useMultiplayerGame());
    
    // Test implementation
    const updateCallback = mockSocket.mockOn.mock.calls.find(
      call => call[0] === WebSocketEvents.GameStateUpdated
    )?.[1];
    
    if (updateCallback) {
      updateCallback({ gameState: testGameState, currentPlayer: 1 });
    }

    expect(result.current.gameState).toEqual(testGameState);
  });
});
```

## CI/CD Integration

### GitHub Actions Configuration
```yaml
- name: Install dependencies and build shared
  run: |
    pnpm install -r
    cd shared && pnpm build

- name: Run linter and type check
  run: |
    cd client && pnpm lint && pnpm type-check
    cd ../server && pnpm lint && pnpm type-check
```

## Best Practices

### Testing
1. Use `createMockSocket()` for consistent Socket.IO mocking
2. Clear mocks in `beforeEach` hooks
3. Use type-safe mocks with proper TypeScript types
4. Implement proper error handling and null checks in tests
5. Use shared types from the @ctor-game/shared package

### Shared Package
1. Keep shared types minimal and focused
2. Ensure proper versioning of shared package
3. Build shared package before running client/server
4. Use TypeScript path aliases for cleaner imports
5. Maintain backward compatibility when updating shared types

## Dependency Management

### pnpm Workspaces
The project uses pnpm workspaces to manage dependencies across packages. This is configured in the root `pnpm-workspace.yaml`:

```yaml
packages:
  - 'client'
  - 'server'
  - 'shared'
```

### Package Dependencies

#### Root Dependencies
```json
{
  "devDependencies": {
    "typescript": "^5.6.3",
    "prettier": "^3.3.3"
  }
}
```

#### Shared Package Dependencies
```json
{
  "name": "@ctor-game/shared",
  "devDependencies": {
    "typescript": "^5.6.3"
  }
}
```

### Version Management
- Use workspace protocol (`workspace:*`) for internal dependencies
- Keep shared package versions in sync with client/server
- Update all packages together to maintain compatibility

### Installing Dependencies
```bash
# Install all dependencies
pnpm install

# Add dependency to specific package
pnpm add <package> --filter @ctor-game/client

# Add shared package to client/server
pnpm add @ctor-game/shared --filter @ctor-game/client --workspace
```

## Common Patterns

### Socket.IO Testing
```typescript
// Mock Setup
const mockSocket = createMockSocket();
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket)
}));

// Test Example
it('handles socket events', () => {
  const { result } = renderHook(() => useSocket());
  
  // Trigger socket event
  const callback = mockSocket.mockOn.mock.calls.find(
    call => call[0] === 'event'
  )?.[1];
  callback?.({ data: 'test' });
  
  expect(result.current.data).toBe('test');
});
```

### Shared Types Usage
```typescript
// In client code
import { GameState } from '@ctor-game/shared/types';

// Type-safe socket events
socket.emit('gameUpdate', {
  state: GameState,
  timestamp: Date.now()
});
```

### Testing React Components
```typescript
// Component Test Example
import { render, screen } from '../test/test-utils';

it('renders game board', () => {
  render(<GameBoard state={mockGameState} />);
  
  expect(screen.getByTestId('game-board')).toBeInTheDocument();
  expect(screen.getAllByRole('button')).toHaveLength(9);
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Type Resolution Issues
```bash
# Problem: Cannot find module '@ctor-game/shared/types'
# Solution: Rebuild shared package
cd shared && pnpm build

# Verify tsconfig paths in client/server
{
  "compilerOptions": {
    "paths": {
      "@ctor-game/shared/*": ["../shared/*"]
    }
  }
}
```

#### 2. Test Failures
```bash
# Problem: Jest globals not found
# Solution: Update test setup
import { expect, vi } from 'vitest';
globalThis.expect = expect;
globalThis.vi = vi;

# Problem: Act warnings
# Solution: Wrap state updates
await act(async () => {
  result.current.updateState();
});
```

#### 3. Workspace Dependencies
```bash
# Problem: Workspace packages not linking
# Solution: Check pnpm-workspace.yaml and package.json
{
  "dependencies": {
    "@ctor-game/shared": "workspace:*"
  }
}

# Rebuild workspace
pnpm install --force
```

#### 4. CI/CD Issues
```bash
# Problem: Shared package not built before tests
# Solution: Update CI workflow
- name: Build shared package
  run: cd shared && pnpm build

# Problem: Test timeouts
# Solution: Adjust timeout in vitest.config.ts
{
  test: {
    testTimeout: 10000
  }
}
```

## Migration Notes

### From Jest to Vitest
1. Replace Jest.mock with vi.mock
2. Use vi.fn() instead of jest.fn()
3. Update test configuration for Vitest
4. Add proper TypeScript support for Vitest
5. Implement custom test utilities for common testing patterns