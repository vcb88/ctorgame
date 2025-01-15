# Type System Documentation

## Overview

The type system is designed to provide type safety and consistency across the entire application. Types are shared between client and server to ensure data consistency and prevent runtime errors.

## Core Types

### Game Types (core.ts)

Basic types used throughout the application:

```typescript
type Position = [number, number];         // Board position coordinates
type Size = [number, number];             // Size dimensions
type PlayerNumber = 1 | 2;                // Player identifier
type Scores = [number, number];           // Player scores
type Timestamp = number;                  // Unix timestamp
type CellValue = PlayerNumber | null;     // Game board cell value
```

### Error System (errors.ts)

Comprehensive error handling system with typed errors and recovery strategies:

```typescript
enum GameErrorCode {
    NETWORK_ERROR = 'NETWORK_ERROR',
    CONNECTION_LOST = 'CONNECTION_LOST',
    GAME_NOT_FOUND = 'GAME_NOT_FOUND',
    INVALID_GAME_STATE = 'INVALID_GAME_STATE',
    // ... other error codes
}

interface IGameError {
    code: GameErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

// Specialized error types
interface INetworkError extends IGameError {
    code: GameErrorCode.NETWORK_ERROR | GameErrorCode.CONNECTION_LOST;
    details?: {
        statusCode?: number;
        endpoint?: string;
    };
}

// ... other specialized error interfaces
```

### Game Data Types (game.ts)

Types for game data structures:

```typescript
interface IPlayer {
    id: string;
    number: Player;
}

interface IGameRoom {
    gameId: string;
    players: IPlayer[];
    currentState: IGameState;
    currentPlayer: Player;
}

interface IGameSummary {
    gameCode: string;
    createdAt: Timestamp;
    completedAt: Timestamp | null;
    winner: PlayerNumber | null;
    players: Player[];
}
```

## Type Guards and Utilities

The system includes type guards for runtime type checking:

```typescript
function isNetworkError(error: IGameError): error is INetworkError;
function isDataError(error: IGameError): error is IDataError;
function isGameStateError(error: IGameError): error is IGameStateError;
```

## Recent Updates

### January 2025
- Added IGameSummary interface for game history
- Enhanced error handling with specific error types
- Improved type guards for error handling
- Added factory functions for creating typed errors

## Best Practices

1. Always use shared types from @ctor-game/shared instead of defining local types
2. Use type guards when narrowing error types
3. Keep interfaces and types focused and single-purpose
4. Document complex types with JSDoc comments
5. Use enums for fixed sets of values

## Database Types

All database models should align with the shared types. Key collections:

1. Games Collection
   - Uses IGameRoom interface
   - Adds MongoDB-specific fields (_id, timestamps)

2. Game History
   - Based on IGameSummary
   - Includes additional metadata for querying

## Future Improvements

1. Planned Enhancements
   - Add validation decorators
   - Improve error type coverage
   - Add runtime type checking utilities

2. Technical Debt
   - Some local types still need migration to shared
   - Need to improve connection error types
   - Consider adding branded types for better type safety

## See Also

- [Error Handling Guide](../error-handling/README.md)
- [API Documentation](../api/README.md)
- [Database Schema](../database/README.md)