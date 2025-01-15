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
    
    // Actions
    createGame,
    joinGame,
    makeMove,
    endTurn,
    
    // Computed
    isConnected,
    isConnecting,
    isError
  } = useMultiplayerGame();

  // Use the hook...
}
```

## Returns

### Game State

- `gameId: UUID | null` - Current game identifier
- `playerNumber: PlayerNumber | null` - Current player's number (1 or 2)
- `gameState: IGameState | null` - Current game state
- `currentPlayer: PlayerNumber` - The player whose turn it is
- `isMyTurn: boolean` - Whether it's the current player's turn
- `availableReplaces: IGameMove[]` - Available replacement moves

### Connection State

- `connectionState: ConnectionState` - Current connection state ('connected', 'connecting', 'reconnecting', 'disconnected', 'error')
- `error: INetworkError | null` - Current error state

### Actions

- `createGame(): Promise<void>` - Create a new game
- `joinGame(gameId: UUID): Promise<IJoinGameResult>` - Join an existing game
- `makeMove(x: number, y: number): Promise<void>` - Make a move at the specified position
- `endTurn(): Promise<void>` - End the current turn

### Computed Properties

- `isConnected: boolean` - Whether currently connected to the server
- `isConnecting: boolean` - Whether currently connecting or reconnecting
- `isError: boolean` - Whether in an error state

## Error Handling

The hook uses GameStateManager's error handling system. All action methods (createGame, joinGame, makeMove, endTurn) can throw INetworkError.

Example error handling:
```typescript
try {
  await makeMove(x, y);
} catch (error) {
  const networkError = error as INetworkError;
  // Handle error based on networkError.code, networkError.severity
}
```

## State Management

The hook uses GameStateManager singleton for state management. State changes are automatically synchronized with the server and other components using the same hook instance.

## Dependencies

- `@ctor-game/shared/src/types/game/types.js` - Game-related types
- `@ctor-game/shared/src/types/network/websocket.js` - Network-related types
- `@ctor-game/shared/src/types/network/errors.js` - Error types
- `GameStateManager` - For state management and server communication

## MVP Status

This hook is part of the MVP and currently:
- ✅ Uses consolidated type system
- ✅ Integrates with GameStateManager
- ✅ Supports error handling
- ✅ Manages connection state
- ✅ Provides basic game actions