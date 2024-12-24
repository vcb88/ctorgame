# Testing Strategy

## Overview

This document outlines the testing strategy for the CTORGame project, including test types, coverage requirements, and implementation guidelines.

## Testing Pyramid

Our testing strategy follows the testing pyramid approach:

```
     ╱  E2E  ╲
    ╱─────────╲
   ╱Integration╲
  ╱─────────────╲
 ╱    Unit      ╲
╱───────────────╲
```

### 1. Unit Tests (Base Layer)
- **Coverage Target**: 80%
- **Tools**: Vitest, React Testing Library
- **Focus**: Individual components, hooks, and utilities
- **Location**: `__tests__` directories alongside source files

### 2. Integration Tests (Middle Layer)
- **Coverage Target**: 70%
- **Tools**: Vitest, React Testing Library
- **Focus**: Component interactions, data flow
- **Location**: `tests/integration/`

### 3. E2E Tests (Top Layer)
- **Coverage Target**: Critical user paths
- **Tools**: Cypress
- **Location**: `tests/e2e/`

## Test Categories

### 1. Component Tests
```typescript
describe('GameBoard', () => {
  it('renders empty board', () => {
    render(<GameBoard />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('handles player moves', () => {
    render(<GameBoard />);
    fireEvent.click(screen.getByTestId('cell-0-0'));
    expect(screen.getByTestId('cell-0-0')).toHaveTextContent('X');
  });
});
```

### 2. Hook Tests
```typescript
describe('useGameState', () => {
  it('manages game state', () => {
    const { result } = renderHook(() => useGameState());
    act(() => {
      result.current.makeMove({ row: 0, col: 0 });
    });
    expect(result.current.currentPlayer).toBe(1);
  });
});
```

### 3. Socket Tests
```typescript
describe('Socket Integration', () => {
  const mockSocket = createMockSocket();
  
  it('handles game events', () => {
    render(<Game socket={mockSocket} />);
    mockSocket.emit('gameStateUpdated', { /* state */ });
    expect(screen.getByText('Player 2\'s turn')).toBeInTheDocument();
  });
});
```

### 4. API Tests
```typescript
describe('API Integration', () => {
  it('creates game', async () => {
    const response = await createGame();
    expect(response.gameCode).toMatch(/^[A-Z0-9]{6}$/);
  });
});
```

## Testing Configurations

### 1. Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      threshold: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
```

### 2. Cypress Configuration
```javascript
// cypress.config.ts
export default {
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false
  }
};
```

## Code Coverage Requirements

| Component Type | Statements | Branches | Functions | Lines |
|---------------|------------|----------|-----------|-------|
| UI Components | 80%        | 80%      | 80%       | 80%   |
| Hooks         | 90%        | 85%      | 90%       | 90%   |
| Utils         | 95%        | 90%      | 95%       | 95%   |
| API Services  | 85%        | 80%      | 85%       | 85%   |

## Testing Guidelines

### 1. Naming Conventions
```typescript
// Component tests
describe('ComponentName', () => {
  it('should render successfully', () => {});
  it('should handle user interaction', () => {});
  it('should update state correctly', () => {});
});
```

### 2. Test Structure
```typescript
describe('Feature', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  // Happy path
  it('works with valid input', () => {});

  // Edge cases
  it('handles empty input', () => {});
  it('handles invalid input', () => {});

  // Error cases
  it('handles network errors', () => {});
});
```

### 3. Mock Guidelines
```typescript
// Prefer mock functions
const mockCallback = vi.fn();

// Mock modules when necessary
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket)
}));

// Mock API responses
vi.mock('../api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: 'test' }))
}));

// For function matchers in assertions, use expect.any() instead of vi.any()
expect(mockFunction).toHaveBeenCalledWith(expect.any(Function));
// NOT: expect(mockFunction).toHaveBeenCalledWith(vi.any(Function));
```

## CI/CD Integration

### 1. Pull Request Checks
```yaml
# .github/workflows/pr-check.yml
- name: Run tests
  run: |
    pnpm test
    pnpm test:e2e
    pnpm test:coverage
```

### 2. Coverage Reports
- Generate coverage reports in CI
- Upload reports as artifacts
- Fail builds if coverage thresholds not met

### 3. Test Matrix
```yaml
strategy:
  matrix:
    node-version: [16.x, 18.x, 20.x]
    test-type: ['unit', 'integration', 'e2e']
```

## Performance Testing

### 1. Load Tests
```typescript
// k6 load test
export default function() {
  const response = http.post('http://api.test/games');
  check(response, {
    'status is 200': (r) => r.status === 200
  });
}
```

### 2. Component Performance
```typescript
import { bench } from 'vitest';

bench('GameBoard rendering', () => {
  render(<GameBoard />);
});
```

## Test Environment Setup

### 1. Development
```bash
# Start dev environment
pnpm dev

# Run tests in watch mode
pnpm test:watch
```

### 2. CI Environment
```bash
# Install dependencies
pnpm install --frozen-lockfile

# Build shared package
cd shared && pnpm build

# Run tests
pnpm test
```

## Maintenance and Reviews

### 1. Regular Reviews
- Weekly code coverage review
- Monthly test suite optimization
- Quarterly E2E scenario updates

### 2. Documentation
- Keep test documentation updated
- Document complex test scenarios
- Maintain testing patterns guide

### 3. Quality Checks
- Regular test cleanup
- Remove redundant tests
- Update outdated assertions