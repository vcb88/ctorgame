# Testing Guide

## Overview

CTORGame uses a comprehensive testing strategy that includes:
- Unit Tests: Individual components and functions
- Integration Tests: Communication between services
- End-to-End Tests: Full user scenarios
- Performance Tests: Load testing and scalability

## Getting Started

### Prerequisites
```bash
# Install dependencies
pnpm install

# Install global tools
npm install -g k6     # For performance testing
```

### Test Environment Setup

1. Development Environment:
```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Install test dependencies
cd tests && pnpm install
```

2. Test Database:
```bash
# Create test database
docker exec -it ctorgame-postgres createdb -U postgres ctorgame_test

# Run migrations
cd server && pnpm typeorm migration:run -- -d test
```

## Running Tests

### Unit Tests
```bash
# Run all unit tests
pnpm test

# Run with watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage
```

### Integration Tests
```bash
# Run all integration tests
pnpm test:integration

# Run specific test suite
pnpm test:integration -g "Game Flow"
```

### End-to-End Tests
```bash
# Run in headless mode
pnpm test:e2e

# Open Cypress UI
pnpm test:e2e:open
```

### Performance Tests
```bash
# Run load tests
pnpm test:perf
```

## Test Structure

### Unit Tests
Located in `__tests__` directories next to source files:
```
src/
  components/
    GameBoard/
      GameBoard.tsx
      __tests__/
        GameBoard.test.tsx
  hooks/
    __tests__/
      useGame.test.tsx
```

### Integration Tests
Located in `tests/integration`:
```
tests/
  integration/
    game.test.ts      # Game flow tests
    matchmaking.test.ts  # Matchmaking tests
    persistence.test.ts  # Database tests
```

### E2E Tests
Located in `tests/e2e`:
```
tests/
  e2e/
    specs/
      game.cy.ts      # Game flow
      errors.cy.ts    # Error handling
```

### Performance Tests
Located in `tests/perf`:
```
tests/
  perf/
    load-test.js      # Basic load test
    scenarios/
      matchmaking.js  # Matchmaking stress test
      gameplay.js     # Gameplay stress test
```

## Writing Tests

### Unit Test Example
```typescript
describe('GameBoard Component', () => {
  it('should render empty board', () => {
    const { getAllByTestId } = render(<GameBoard />);
    const cells = getAllByTestId(/cell-/);
    expect(cells).toHaveLength(9);
    cells.forEach(cell => {
      expect(cell).toBeEmpty();
    });
  });
});
```

### Integration Test Example
```typescript
describe('Game Flow', () => {
  it('should handle complete game', async () => {
    const [player1, player2] = await connectPlayers();
    await playFullGame(player1, player2);
    const gameState = await getGameState(player1);
    expect(gameState.gameOver).toBe(true);
    expect(gameState.winner).toBe(0);
  });
});
```

### E2E Test Example
```typescript
describe('Game Flow', () => {
  it('should play complete game', () => {
    cy.createGame();
    cy.getByTestId('room-code').then(code => {
      cy.joinGame(code);
      cy.playWinningMoves();
      cy.getByTestId('game-status')
        .should('contain', 'Player 1 wins!');
    });
  });
});
```

## Test Helpers

### Integration Test Helpers
```typescript
// tests/integration/utils/test-helpers.ts
export async function connectPlayers() {
  const player1 = createSocketClient();
  const player2 = createSocketClient();
  const roomCode = await createGame(player1);
  await joinGame(player2, roomCode);
  return [player1, player2];
}
```

### E2E Test Commands
```typescript
// tests/e2e/support/commands.ts
Cypress.Commands.add('createGame', () => {
  cy.visit('/');
  cy.getByTestId('create-game-btn').click();
  return cy.getByTestId('room-code')
    .invoke('text')
    .should('match', /^[A-Z0-9]{6}$/);
});

// Доступные команды:
// - createGame(): создает новую игру и возвращает код комнаты
// - joinGame(code: string): присоединяется к игре по коду
// - makeMove(row: number, col: number): делает ход
// - playWinningMoves(): выполняет последовательность ходов для победы
// - checkGameState(state: GameState): проверяет состояние игры
// - waitForTurn(): ожидает своего хода
// - reconnectToGame(code: string): переподключается к игре
// - simulateDisconnect(): симулирует отключение

interface GameState {
  currentPlayer?: number;
  gameOver?: boolean;
  winner?: number | null;
  board?: Array<Array<number | null>>;
}

// Пример использования:
describe('Game Flow', () => {
  it('should handle complete game with reconnection', () => {
    cy.createGame().then(code => {
      cy.joinGame(code);
      cy.makeMove(0, 0);
      cy.waitForTurn();
      cy.simulateDisconnect();
      cy.reconnectToGame(code);
      cy.checkGameState({
        currentPlayer: 1,
        board: [
          [0, null, null],
          [null, null, null],
          [null, null, null]
        ]
      });
    });
  });
});
```

## CI/CD Integration

Tests are run automatically in GitHub Actions:
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: |
          pnpm install
          pnpm test
          pnpm test:integration
          pnpm test:e2e
```

## Coverage Requirements

- Unit Tests: 80% coverage
- Integration Tests: Critical paths covered
- E2E Tests: Main user flows covered
- Performance Tests: Response times under 200ms

## Debugging Tests

### Unit Tests
```bash
# Debug specific test
pnpm test:debug testName
```

### Integration Tests
```bash
# Run with debug logging
DEBUG=app:* pnpm test:integration
```

### E2E Tests
```bash
# Open Cypress UI for debugging
pnpm test:e2e:open
```

## Best Practices

1. Test Organization:
   - Keep tests close to source code
   - Use descriptive test names
   - Group related tests

2. Test Data:
   - Use factories for test data
   - Avoid sharing state between tests
   - Clean up after tests

3. Assertions:
   - Test one thing per test
   - Use meaningful assertions
   - Check edge cases

4. Performance:
   - Mock expensive operations
   - Clean up resources
   - Parallelize when possible

## Troubleshooting

Common issues and solutions:

1. Tests timing out:
   - Increase timeout in config
   - Check async operations
   - Verify test environment

2. WebSocket connection issues:
   - Check server is running
   - Verify ports are available
   - Check network configuration

3. Database issues:
   - Verify test database exists
   - Check connection string
   - Ensure migrations are run

## Future Improvements

1. Test Infrastructure:
   - Visual regression testing
   - API contract testing
   - Browser compatibility testing

2. Automation:
   - Automated performance benchmarks
   - Test data generation
   - Test result analytics

3. Documentation:
   - Test patterns catalog
   - Common scenarios guide
   - Troubleshooting guide