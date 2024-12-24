# Component Testing Guide

## Overview

This guide covers best practices and patterns for testing React components in the CTORGame project using Vitest and React Testing Library.

## Test Structure

### Basic Component Test

```typescript
import { render, screen } from '../test/test-utils';
import { GameBoard } from './GameBoard';

describe('GameBoard', () => {
  it('renders empty board correctly', () => {
    const emptyState = {
      board: Array(3).fill(Array(3).fill(null)),
      gameOver: false,
      winner: null
    };

    render(<GameBoard state={emptyState} />);
    
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });
});
```

## Common Testing Patterns

### 1. User Interactions

```typescript
import { render, screen, fireEvent } from '../test/test-utils';

it('handles cell click', () => {
  const onMove = vi.fn();
  render(<GameBoard onMove={onMove} />);

  fireEvent.click(screen.getByTestId('cell-0-0'));
  
  expect(onMove).toHaveBeenCalledWith({ row: 0, col: 0 });
});
```

### 2. Async Operations

```typescript
it('loads game state asynchronously', async () => {
  render(<GameLoader code="ABC123" />);

  // Wait for loading state
  expect(screen.getByText('Loading...')).toBeInTheDocument();

  // Wait for content
  await screen.findByTestId('game-board');
  expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
});
```

### 3. Context Providers

```typescript
const customRender = (ui: React.ReactElement, gameState = initialState) => {
  return render(
    <GameContext.Provider value={gameState}>
      {ui}
    </GameContext.Provider>
  );
};

it('uses game context', () => {
  customRender(<GameStatus />);
  expect(screen.getByText('Player 1\'s turn')).toBeInTheDocument();
});
```

### 4. Component State Changes

```typescript
it('updates player turn indicator', async () => {
  const { result } = renderHook(() => useGameState());

  act(() => {
    result.current.makeMove({ row: 0, col: 0 });
  });

  expect(result.current.currentPlayer).toBe(1);
});
```

## Testing Complex Components

### Modal Components

```typescript
it('shows and hides modal', () => {
  render(<GameEndModal />);
  
  // Initial state
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  // Show modal
  fireEvent.click(screen.getByText('End Game'));
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // Hide modal
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

### Forms

```typescript
it('submits game code form', async () => {
  const onSubmit = vi.fn();
  render(<JoinGameForm onSubmit={onSubmit} />);

  // Fill form
  fireEvent.change(screen.getByLabelText('Game Code'), {
    target: { value: 'ABC123' }
  });

  // Submit form
  fireEvent.click(screen.getByText('Join Game'));

  expect(onSubmit).toHaveBeenCalledWith('ABC123');
});
```

## Testing Custom Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

it('manages game state correctly', () => {
  const { result } = renderHook(() => useGameState());

  act(() => {
    result.current.makeMove({ row: 0, col: 0 });
  });

  expect(result.current.board[0][0]).toBe(0);
  expect(result.current.currentPlayer).toBe(1);
});
```

## Testing WebSocket Integration

```typescript
import { createMockSocket } from '../test/test-utils';

it('handles socket events in components', () => {
  const mockSocket = createMockSocket();
  render(<GameRoom socket={mockSocket} />);

  // Simulate receiving game state
  const callback = mockSocket.mockOn.mock.calls.find(
    call => call[0] === 'gameStateUpdated'
  )?.[1];

  act(() => {
    callback?.({
      gameState: {
        board: [[0, null, null], [null, null, null], [null, null, null]],
        currentPlayer: 1
      }
    });
  });

  expect(screen.getByText('Player 2\'s turn')).toBeInTheDocument();
});
```

## Best Practices

1. **Use Data Attributes**
```typescript
// In component
<div data-testid="game-board">

// In test
screen.getByTestId('game-board')
```

2. **Prefer User-Centric Queries**
```typescript
// Good
screen.getByRole('button', { name: 'Start Game' })

// Avoid
screen.getByTestId('start-button')
```

3. **Test User Behavior**
```typescript
// Good
it('starts a new game when clicked', () => {
  render(<NewGameButton />);
  fireEvent.click(screen.getByText('New Game'));
});

// Avoid testing implementation details
it('calls startGame function', () => {
  const startGame = vi.fn();
  render(<NewGameButton onClick={startGame} />);
});
```

4. **Mock Complex Dependencies**
```typescript
vi.mock('../services/gameService', () => ({
  createGame: vi.fn(() => Promise.resolve({ code: 'ABC123' }))
}));
```

## Common Issues and Solutions

### 1. Act Warnings

```typescript
// Problem
act(() => {/* warning */});

// Solution
await act(async () => {
  await result.current.asyncOperation();
});
```

### 2. State Updates

```typescript
// Problem
fireEvent.click(button);
expect(newState).toBe(true);

// Solution
await waitFor(() => {
  expect(newState).toBe(true);
});
```

### 3. Async Renders

```typescript
// Problem
render(<AsyncComponent />);
expect(screen.getByText('Loaded')).toBeInTheDocument();

// Solution
render(<AsyncComponent />);
await screen.findByText('Loaded');
```