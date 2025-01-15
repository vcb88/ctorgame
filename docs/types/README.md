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

interface GameError {
    code: GameErrorCode;
    message: string;
    details?: Record<string, unknown>;
}

// Specialized error types
interface NetworkError extends GameError {
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
interface Player {
    id: string;
    number: PlayerNumber;
}

interface GameRoom {
    gameId: string;
    players: Player[];
    currentState: GameState;
    currentPlayer: PlayerNumber;
}

interface GameSummary {
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
function isNetworkError(error: GameError): error is NetworkError;
function isDataError(error: GameError): error is DataError;
function isGameStateError(error: GameError): error is GameStateError;
```

## Recent Updates

### January 2025
- Refactored type names to remove 'I' prefix for better consistency
- Updated GameSummary and related interfaces
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
   - Uses GameRoom interface
   - Adds MongoDB-specific fields (_id, timestamps)

2. Game History
   - Based on GameSummary
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