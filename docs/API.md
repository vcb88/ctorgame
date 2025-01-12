# Game State Management API

## Overview
This document describes the client-side API for game state management.

## GameStateManager

The `GameStateManager` class provides a singleton interface for managing game state and socket communication.

### Methods

#### `getInstance(): GameStateManager`
Returns the singleton instance of GameStateManager.

#### `subscribe(subscriber: StateSubscriber): () => void`
Subscribe to state changes. Returns an unsubscribe function.

- Parameters:
  - `subscriber`: Function that receives state updates

#### `getState(): ExtendedGameManagerState`
Get current game state.

#### `createGame(): void`
Create a new game.

#### `joinGame(gameId: string): Promise<JoinGameResult>`
Join an existing game.

- Parameters:
  - `gameId`: The ID of the game to join

- Returns: Promise that resolves when join operation succeeds
  ```typescript
  interface JoinGameResult {
    gameId: string;
    playerNumber: Player;
  }
  ```

- Errors:
  ```typescript
  interface JoinGameError {
    code: string;        // Error code
    message: string;     // Error message
    operation: 'join';   // Operation type
    gameId: string;      // Game ID that failed to join
    details?: any;       // Additional error details
  }
  ```

- Error Codes:
  - `CONNECTION_ERROR`: Socket not initialized
  - `OPERATION_CANCELLED`: Previous join operation cancelled
  - `TIMEOUT`: Join operation timed out (10 seconds)
  - `CONNECTION_LOST`: Connection lost during join operation

#### `disconnect(): void`
Disconnect from the game server.

#### `makeMove(move: IGameMove): void`
Make a game move.

- Parameters:
  - `move`: Move details (see shared types)

#### `endTurn(): void`
End the current turn.

### Types

#### `ExtendedGameManagerState`
```typescript
interface ExtendedGameManagerState {
  phase: GamePhase;
  gameId: string | null;
  playerNumber: Player | null;
  error: GameError | null;
  connectionState: ConnectionState;
  gameState: IGameState | null;
  currentPlayer: Player;
  availableReplaces: IGameMove[];
}
```

## State Updates
The game state is updated through WebSocket events. All subscribers are notified when state changes occur.

## Error Handling
Errors are propagated through both the state updates (state.error) and Promise rejections for async operations.