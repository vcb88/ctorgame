# useMultiplayerGame Hook

React hook for managing multiplayer game state and interactions. Uses GameStateManager for state management and error handling.

## Usage

```typescript
import { useMultiplayerGame } from '../hooks/useMultiplayerGame';

function GameComponent() {
  const {
    // Game state
    gameId,
    playerNumber,
    gameState,
    currentPlayer,
    isMyTurn,
    availableReplaces,
    
    // Connection state
    connectionState,
    error,

    // Operation state
    loading,
    operationInProgress,
    
    // Actions
    createGame,
    joinGame,
    makeMove,
    endTurn,
    
    // Computed
    isConnected,
    isConnecting,
    isError,
    canRetry,
    canRecover
  } = useMultiplayerGame();

  // Use the hook...
}
```

## Returns

### Game State

- `gameId: string | null` - Current game identifier
- `playerNumber: Player | null` - Current player's number (1 or 2)
- `gameState: GameState | null` - Current game state
- `currentPlayer: Player` - The player whose turn it is
- `isMyTurn: boolean` - Whether it's the current player's turn
- `availableReplaces: GameMove[]` - Available replacement moves

### Connection State

- `connectionState: ConnectionState` - Current connection state ('connected', 'connecting', 'reconnecting', 'disconnected', 'error')
- `error: GameError | null` - Current error state

### Operation State

- `loading: boolean` - Whether any operation is in progress
- `operationInProgress: GameActionType | null` - Type of current operation if any

### Actions

- `createGame(): Promise<void>` - Create a new game
- `joinGame(gameId: string): Promise<void>` - Join an existing game
- `makeMove(x: number, y: number, type?: OperationType): Promise<void>` - Make a move at the specified position
- `endTurn(): Promise<void>` - End the current turn

### Computed Properties

- `isConnected: boolean` - Whether currently connected to the server
- `isConnecting: boolean` - Whether currently connecting or reconnecting
- `isError: boolean` - Whether in an error state
- `canRetry: boolean` - Whether the current error state supports retry
- `canRecover: boolean` - Whether the current error state supports recovery

## Error Handling

The hook uses an improved error handling system with retry and recovery capabilities:

1. Retry support for:
   - Connection errors
   - Connection timeouts
   - Operation timeouts

2. Recovery support for:
   - Lost connections
   - State validation errors

Example error handling:
```typescript
try {
  await makeMove(x, y);
} catch (error) {
  const gameError = error as GameError;
  if (gameError.canRetry) {
    // Operation can be retried
  } else if (gameError.canRecover) {
    // State can be recovered
  }
  // Handle error based on gameError.code, gameError.severity
}
```

## State Management

The hook uses GameStateManager singleton for state management. State changes are automatically synchronized with the server and other components using the same hook instance.

## Dependencies

- `@ctor-game/shared/src/types/core.js` - All core types (game, network, errors)
- `@ctor-game/shared/src/utils/validation.js` - Validation utilities
- `GameStateManager` - For state management and server communication
- `useGame` - Hook for basic game state management

## MVP Status

This hook is part of the MVP and currently:
- ✅ Uses consolidated type system from core.js
- ✅ Integrates with GameStateManager and useGame
- ✅ Supports advanced error handling with retry/recovery
- ✅ Provides operation progress tracking
- ✅ Includes basic move validation
- ✅ Manages connection and game state
- ✅ Provides all necessary game actions

## Recent Changes

- ✅ Renamed from useMultiplayerGameNew to useMultiplayerGame
- ✅ Improved type imports to include GameMove type
- ✅ Improved error creation using createGameError utility
- ✅ Simplified generic type in handleOperation
- ✅ Updated logging component name
- ✅ Added improved error handling with createGameError utility
- ✅ Added more detailed operation logging for debugging