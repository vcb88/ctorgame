# Redis Service Documentation

## Overview

The Redis Service is responsible for managing game state, player sessions, game rooms, and events in Redis. It provides a type-safe interface with optimized TTL management and atomic operations support.

## Key Features

1. Type-safe Redis operations
2. Automatic TTL management
3. Atomic operations with locks
4. Event queue management
5. Reconnection handling
6. Error handling and logging

## Architecture

### Data Types

```typescript
// Game State
export type RedisGameState = GameState & {
    lastUpdate: number;    // Last update timestamp
    version: number;       // State version for optimistic locking
    ttl?: number;         // Time-to-live in seconds
    boardState?: string;  // Optional serialized board state
};

// Game Event
export type RedisGameEvent = GameEvent & {
    eventId?: UUID;                          // Optional event identifier
    data?: Record<string, unknown>;          // Optional event data
    ttl?: number;                            // Time-to-live in seconds
};

// Player Session
interface IRedisPlayerSession {
    gameId: UUID;
    playerNumber: PlayerNumber;
    lastActivity: number;
    reconnectUntil?: number;
}

// Game Room
interface IRedisGameRoom {
    gameId: UUID;
    status: GameStatus;
    players: Array<{
        id: UUID;
        number: PlayerNumber;
    }>;
    lastUpdate: number;
}
```

### Redis Keys Structure

```typescript
const REDIS_KEYS = {
    GAME_STATE: (gameId: UUID) => `game:${gameId}:state`,
    GAME_ROOM: (gameId: UUID) => `game:${gameId}:room`,
    PLAYER_SESSION: (socketId: UUID) => `player:${socketId}:session`,
    GAME_EVENTS: (gameId: UUID) => `game:${gameId}:events`
};
```

## Usage Examples

### Game State Management

```typescript
// Create game state
await redisService.setGameState(gameId, initialState);

// Get game state
const state = await redisService.getGameState(gameId);

// Update game state with move
const newState = await redisService.updateGameState(
    gameId,
    playerNumber,
    move
);
```

### Player Session Management

```typescript
// Create player session
await redisService.setPlayerSession(
    socketId,
    gameId,
    playerNumber,
    reconnectTimeout
);

// Get player session
const session = await redisService.getPlayerSession(socketId);
```

### Game Room Management

```typescript
// Create game room
await redisService.createGameRoom(gameId, playerId, playerNumber);

// Join game room
await redisService.joinGameRoom(gameId, playerId, playerNumber);

// Get game room
const room = await redisService.getGameRoom(gameId);
```

### Event Management

```typescript
// Add game event
await redisService.addGameEvent({
    id: crypto.randomUUID(),
    gameId,
    type: 'move',
    timestamp: Date.now(),
    playerNumber,
    data: { move, state }
});

// Get game events
const events = await redisService.getGameEvents(gameId, 10);
```

## Data Consistency

### Atomic Operations

The service uses Redis locks for atomic operations:

```typescript
private async withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const acquired = await this.lock.acquire(key);
    if (!acquired) throw new Error('Failed to acquire lock');

    try {
        return await fn();
    } finally {
        await this.lock.release(key);
    }
}
```

### Version Control

Game states include version tracking:

```typescript
export type RedisGameState = GameState & {
    version: number;       // For optimistic locking
    lastUpdate: number;    // Last update timestamp
    ttl?: number;         // Time-to-live in seconds
};
```

## Configuration

### TTL Configuration

```typescript
interface IRedisTTL {
    gameState: number;    // Game state TTL
    playerSession: number;// Player session TTL
    gameRoom: number;     // Game room TTL
    eventQueue: {
        default: number;  // Default event TTL
        extended: number; // Extended event TTL
    };
}
```

### Redis Configuration

```typescript
interface IRedisConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    retryStrategy?: (times: number) => number | void;
    maxRetriesPerRequest?: number;
    enableReadyCheck?: boolean;
}
```

## Error Handling

1. Operation Errors
```typescript
try {
    await redisService.setGameState(gameId, state);
} catch (error) {
    logger.error('Failed to set game state', {
        component: 'RedisService',
        context: { gameId },
        error
    });
}
```

2. Lock Errors
```typescript
if (!acquired) {
    throw new Error('Failed to acquire lock');
}
```

## Best Practices

1. Always use locks for compound operations
2. Include version control for state updates
3. Set appropriate TTL values based on game status
4. Handle Redis errors gracefully
5. Clean up resources properly

## Performance Considerations

1. Event Queue Management
   - Limited to last 100 events
   - Automatic cleanup with TTL

2. Connection Management
   - Automatic reconnection
   - Connection pooling
   - Error resilience

3. Memory Usage
   - TTL on all keys
   - Event queue size limits
   - Automatic cleanup

## Monitoring

Important metrics to monitor:

1. Operation latency
2. Lock acquisition success rate
3. Cache hit/miss ratio
4. Memory usage
5. Connection status
6. Error rates

## Future Improvements

1. Cache Layer
   - Add local cache for frequently accessed data
   - Implement cache invalidation strategy

2. Batch Operations
   - Batch updates for related data
   - Pipeline commands for better performance

3. Resilience
   - Circuit breaker pattern
   - Fallback mechanisms
   - Better error recovery

4. Monitoring
   - Add performance metrics
   - Implement health checks
   - Add debugging tools