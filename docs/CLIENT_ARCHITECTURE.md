# Client Architecture Documentation

## Overview

The client architecture is built around React with TypeScript, focusing on type safety, error handling, and state management.

## Type System

### Core Types

All core types are imported from the shared package:
```typescript
import type { Player, OperationType } from '@ctor-game/shared/types/base/enums';
import type { IGameState } from '@ctor-game/shared/types/game';
import type { ConnectionState } from '@ctor-game/shared/types/network';
```

### Client-Specific Types

1. Error Handling
```typescript
interface ClientError {
    readonly code: ErrorCode;
    readonly message: string;
    readonly severity: ErrorSeverity;
    readonly details?: Record<string, unknown>;
    readonly stack?: string;
}
```

2. Error Recovery
```typescript
interface ErrorRecoveryStrategy {
    readonly codes: ErrorCode[];
    readonly shouldRetry: boolean;
    readonly shouldRecover: boolean;
    readonly retryConfig?: {
        readonly maxRetries?: number;
        readonly retryDelay?: number;
    };
    readonly recover?: () => Promise<void>;
}
```

## Component Architecture

### Game Components

1. GameNew
   - Main game component
   - Uses new type system
   - Includes error handling
   - Supports state recovery

2. Game Controls
   - Move controls
   - Turn management
   - Player actions

3. Game State Display
   - Board visualization
   - Score tracking
   - Turn information

### Hooks

1. useMultiplayerGameNew
```typescript
interface UseMultiplayerGameReturn {
    // Game state
    gameId: string | null;
    playerNumber: Player | null;
    gameState: IGameState | null;
    currentPlayer: Player;
    isMyTurn: boolean;

    // Connection state
    connectionState: ConnectionState;
    error: ClientError | null;

    // Operation state
    loading: boolean;
    operationInProgress: GameActionType | null;

    // Actions
    createGame: () => Promise<void>;
    joinGame: (gameId: string) => Promise<void>;
    makeMove: (x: number, y: number, type?: OperationType) => Promise<void>;
    endTurn: () => Promise<void>;
}
```

## State Management

### Game State Manager
```typescript
class GameStateManager {
    private state: {
        gameId: string | null;
        gameState: IGameState | null;
        playerNumber: Player | null;
        connectionState: ConnectionState;
        error: ClientError | null;
    }

    // Methods
    createGame(): Promise<void>;
    joinGame(gameId: string): Promise<void>;
    makeMove(move: GameMove): Promise<void>;
    endTurn(): Promise<void>;
}
```

## Error Handling

### Error Recovery Flow
1. Error occurs
2. Error is converted to ClientError
3. Recovery strategy is selected
4. Recovery action is attempted
5. State is updated based on result

### Recovery Strategies
```typescript
const defaultRecoveryStrategies: ErrorRecoveryStrategy[] = [
    {
        codes: [ErrorCode.CONNECTION_ERROR, ...],
        shouldRetry: true,
        shouldRecover: false,
        retryConfig: {
            maxRetries: 3,
            retryDelay: 1000
        }
    },
    // ...
];
```

## WebSocket Integration

### Socket Management
```typescript
class SocketManager {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    emit<T>(event: string, data?: T): Promise<void>;
    on<T>(event: string, handler: (data: T) => void): void;
    reconnect(): Promise<void>;
}
```

### Event Handling
```typescript
interface WebSocketHandlers {
    onConnect: () => void;
    onDisconnect: () => void;
    onError: (error: ClientError) => void;
    onGameState: (state: IGameState) => void;
    onGameEvent: (event: GameEvent) => void;
}
```

## Validation

### Client-Side Validation
1. Move validation
2. State validation
3. User input validation

### Error Prevention
1. Type guards
2. Runtime checks
3. State consistency checks

## Best Practices

### Type Safety
1. Use shared types when available
2. Add client-specific type extensions
3. Implement type guards
4. Validate network data

### Error Handling
1. Convert all errors to ClientError
2. Use appropriate error recovery strategies
3. Provide user feedback
4. Log errors for debugging

### State Management
1. Keep state immutable
2. Use type-safe state updates
3. Validate state transitions
4. Handle race conditions

### Performance
1. Optimize re-renders
2. Use memoization
3. Implement debouncing
4. Handle cleanup

## Testing

### Component Tests
1. Render tests
2. User interaction tests
3. State updates
4. Error handling

### Hook Tests
1. State management
2. Side effects
3. Error cases
4. Recovery scenarios

### Integration Tests
1. WebSocket communication
2. State synchronization
3. Error recovery
4. Game flow

## Future Improvements

1. State Management
   - Consider Redux/MobX
   - Improve state persistence
   - Add state time-travel

2. Error Handling
   - Add more recovery strategies
   - Improve error reporting
   - Add error analytics

3. Performance
   - Add component code-splitting
   - Implement virtual scrolling
   - Optimize WebSocket usage

4. Testing
   - Add E2E tests
   - Improve test coverage
   - Add performance tests