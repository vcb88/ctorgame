# Client Architecture Documentation

## Overview

The client architecture is built around React with TypeScript, focusing on type safety, error handling, and state management.

## Type System

### Core Types

All core types are imported from the shared package:
```typescript
import { GameState, Player, GameAction } from '@ctor-game/shared/types/game';
import { Position } from '@ctor-game/shared/types/game/geometry';
import { OperationType } from '@ctor-game/shared/types/enums';
import { NetworkError } from '@ctor-game/shared/types/network';
```

### Client-Specific Types

1. Error Handling (using shared NetworkError)
```typescript
interface NetworkError {
    readonly code: ErrorCode;
    readonly message: string;
    readonly severity: ErrorSeverity;
    readonly timestamp: number;
    readonly retryable?: boolean;
    readonly retryCount?: number;
    readonly details?: Record<string, unknown>;
}
```

2. Error Recovery Config
```typescript
interface ErrorRecoveryConfig {
    readonly maxRetries?: number;
    readonly retryDelay?: number;
    readonly useBackoff?: boolean;
    readonly recover?: (error: NetworkError) => Promise<void>;
}
```
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
    gameState: GameState | null;
    currentPlayer: Player;
    isMyTurn: boolean;

    // Connection state
    connectionState: ConnectionState;
    error: NetworkError | null;

    // Operation state
    loading: boolean;
    operationInProgress: GameActionType | null;

    // Recovery state
    canRetry: boolean;
    canRecover: boolean;

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
interface GameManagerState {
    readonly phase: GamePhase;
    readonly gameId: string | null;
    readonly playerNumber: Player | null;
    readonly error: NetworkError | null;
    readonly connectionState: ConnectionState;
    readonly gameState: GameState | null;
    readonly currentPlayer: Player;
    readonly availableMoves: Position[];
    readonly timestamp: number;
}

class GameStateManager {
    // State management
    private state: GameManagerState;
    private subscribers: Set<(state: GameManagerState) => void>;
    
    // Service dependencies
    private socket: WebSocketService | null;
    private storage: StorageService;
    private errorManager: ErrorRecoveryManager;
    private actionQueue: ActionQueueService;

    // Methods
    subscribe(subscriber: (state: GameManagerState) => void): () => void;
    getState(): GameManagerState;
    createGame(): Promise<void>;
    joinGame(gameId: string): Promise<JoinGameResult>;
    makeMove(position: Position, type: OperationType): Promise<void>;
    endTurn(): Promise<void>;
    disconnect(): void;
    
    // State recovery
    canRetryOperation(error: NetworkError): boolean;
    canRecoverState(): boolean;
    retryLastOperation(): Promise<void>;
    recoverState(): Promise<void>;
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

### Socket Types
```typescript
// Strongly typed socket
type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

// Server to client events
interface ServerToClientEvents {
    'game_created': (event: GameEvent & {
        readonly gameId: string;
        readonly initialState: GameState;
    }) => void;

    'game_joined': (event: GameEvent & {
        readonly gameId: string;
        readonly state: GameState;
        readonly player: Player;
    }) => void;

    'game_updated': (event: GameEvent & {
        readonly gameId: string;
        readonly state: GameState;
        readonly action?: GameAction;
    }) => void;

    'game_error': (event: GameEvent & {
        readonly gameId: string;
        readonly error: NetworkError;
    }) => void;
}

// Client to server events
interface ClientToServerEvents {
    'create_game': () => void;
    'join_game': (data: { readonly gameId: string }) => void;
    'make_move': (data: {
        readonly gameId: string;
        readonly position: Position;
        readonly type: OperationType;
    }) => void;
    'end_turn': (data: { readonly gameId: string }) => void;
    'retry_operation': (data: { 
        readonly gameId: string;
        readonly actionId: string;
    }) => void;
}
```

### Socket Configuration
```typescript
interface IWebSocketServerConfig {
    readonly cors: {
        readonly origin: string;
        readonly methods: string[];
    };
    readonly path: string;
    readonly transports: string[];
    readonly pingTimeout: number;
    readonly pingInterval: number;
    readonly maxHttpBufferSize: number;
}

// Client socket config extends server config
export const socketConfig: Partial<IWebSocketServerConfig> & {
    autoConnect: boolean;
    reconnection: boolean;
    reconnectionAttempts: number;
    reconnectionDelay: number;
    reconnectionDelayMax: number;
    forceNew: boolean;
} = {
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    path: '/socket.io/',
    forceNew: true,
    pingTimeout: 10000,
    pingInterval: 5000
};
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
1. Use shared types from @ctor-game/shared
2. Leverage TypeScript's strict mode
3. Implement proper type guards for runtime checks
4. Validate all incoming network data
5. Use UUID type for all identifiers

### Error Handling
1. Use INetworkError for all errors
2. Include timestamps in all error objects
3. Implement proper error recovery strategies
4. Track error recovery attempts
5. Provide detailed error context
6. Handle both recoverable and non-recoverable errors

### State Management
1. Keep all state immutable using readonly properties
2. Implement proper state validation
3. Use type-safe state updates via GameStateManager
4. Handle all state transitions atomically
5. Maintain state consistency during errors
6. Use proper cleanup for subscriptions

### Action Queue Management
1. Handle operation conflicts properly
2. Implement proper action validation
3. Maintain action order consistency
4. Track action timestamps
5. Handle action timeouts gracefully

### WebSocket Communication
1. Use strongly typed events
2. Implement proper reconnection handling
3. Maintain socket state consistency
4. Handle all socket events properly
5. Include proper error context in events
6. Track event timestamps

### Performance
1. Optimize state updates
2. Handle cleanup properly
3. Implement efficient event handling
4. Use proper socket connection management
5. Implement proper state storage strategy

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