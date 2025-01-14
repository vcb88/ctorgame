# Event System Documentation

## Overview

The event system is a core component of the game, handling all state changes and communication between different parts of the application. It uses a type-safe event system with discriminated unions and strict validation.

## Architecture

### Event Flow
```
Client <-> WebSocket <-> EventService <-> Redis
                            |
                            v
                        Persistence
```

1. Events are created through EventService
2. Stored in Redis with TTL
3. Distributed via WebSocket to clients
4. Persisted for game history

## Event Types

All events extend the `IBaseEvent` interface:
```typescript
interface IBaseEvent {
    readonly id: string;        // Unique event identifier
    readonly timestamp: number; // Event creation timestamp
    readonly gameId: string;    // Associated game ID
    readonly playerId?: string; // Optional player identifier
}
```

### Game State Events

1. Game Created
```typescript
interface IGameCreatedEvent extends IBaseEvent {
    readonly type: 'game_created';
    readonly data: {
        readonly gameId: string;
        readonly status: GameStatus;
        readonly createdAt: number;
    };
}
```

2. Game Started
```typescript
interface IGameStartedEvent extends IBaseEvent {
    readonly type: 'game_started';
    readonly data: {
        readonly state: IGameState;
        readonly startedAt: number;
    };
}
```

3. Game Move
```typescript
interface IGameMoveEvent extends IBaseEvent {
    readonly type: 'game_move';
    readonly data: {
        readonly move: IGameMove;
        readonly state: IGameState;
    };
}
```

4. Game Ended
```typescript
interface IGameEndedEvent extends IBaseEvent {
    readonly type: 'game_ended';
    readonly data: {
        readonly winner: PlayerNumber | null;
        readonly finalState: IGameState;
        readonly endedAt: number;
    };
}
```

5. Game Expired
```typescript
interface IGameExpiredEvent extends IBaseEvent {
    readonly type: 'game_expired';
    readonly data: {
        readonly expiredAt: number;
    };
}
```

### Player Events

1. Player Connected
```typescript
interface IPlayerConnectedEvent extends IBaseEvent {
    readonly type: 'player_connected';
    readonly data: {
        readonly playerId: string;
        readonly playerNumber: PlayerNumber;
        readonly connectedAt: number;
    };
}
```

2. Player Disconnected
```typescript
interface IPlayerDisconnectedEvent extends IBaseEvent {
    readonly type: 'player_disconnected';
    readonly data: {
        readonly playerId: string;
        readonly playerNumber: PlayerNumber;
        readonly disconnectedAt: number;
    };
}
```

### Error Events

```typescript
interface IGameErrorEvent extends IBaseEvent {
    readonly type: 'error';
    readonly data: ErrorResponse;
}
```

## Type Safety

### Discriminated Unions
All event types are combined into a `GameEvent` union type:
```typescript
type GameEvent =
    | IGameCreatedEvent
    | IGameStartedEvent
    | IGameMoveEvent 
    | IGameEndedEvent
    | IGameExpiredEvent
    | IPlayerConnectedEvent
    | IPlayerDisconnectedEvent
    | IGameErrorEvent;
```

### Type Guards
Each event type has its type guard for runtime type checking:
```typescript
const isGameCreatedEvent = (event: GameEvent): event is IGameCreatedEvent => {
    return event.type === 'game_created';
};
// Similar guards for other event types...
```

## Validation

Each event type has its validation function:
```typescript
const validateGameCreatedEvent = (event: IGameCreatedEvent): boolean => {
    return (
        typeof event.gameId === 'string' &&
        typeof event.data.gameId === 'string' &&
        typeof event.data.status === 'string' &&
        typeof event.data.createdAt === 'number' &&
        ['waiting', 'playing', 'finished'].includes(event.data.status)
    );
};
// Similar validators for other event types...
```

## Storage

Events are stored in Redis with automatic expiration:
- Key format: `event:{eventId}`
- TTL: 1 hour (3600 seconds)
- Game events list: `game:events:{gameId}`

### Storage Format
```typescript
// Event storage
{
    id: string;
    type: string;
    gameId: string;
    playerId?: string;
    data: object;
    timestamp: number;
}

// Game events list
[
    { id: string, type: string, timestamp: number }
]
```

## Usage Examples

### Creating Events
```typescript
// Create game created event
const event = await eventService.createGameCreatedEvent(
    gameId,
    'waiting'
);

// Create move event
const moveEvent = await eventService.createGameMoveEvent(
    gameId,
    playerId,
    move,
    newState
);
```

### Retrieving Events
```typescript
// Get single event
const event = await eventService.getEvent(eventId);

// Get all game events
const events = await eventService.getGameEvents(gameId);

// Get events after timestamp
const newEvents = await eventService.getGameEvents(gameId, timestamp);
```

### Event Cleanup
```typescript
// Clean up all events for a game
await eventService.cleanupGameEvents(gameId);
```

## Best Practices

1. Always use type guards when handling events
```typescript
if (isGameMoveEvent(event)) {
    // TypeScript knows event is IGameMoveEvent
    const { move, state } = event.data;
}
```

2. Validate events before processing
```typescript
if (!validateGameEvent(event)) {
    throw new Error('Invalid event data');
}
```

3. Use readonly properties to prevent accidental modifications

4. Include all required timestamps for event ordering and replay

5. Handle event expiration and cleanup

## Error Handling

1. Event Creation Errors
```typescript
try {
    await eventService.createGameMoveEvent(...);
} catch (error) {
    // Handle creation failure
}
```

2. Invalid Event Data
```typescript
if (!validateGameEvent(event)) {
    logger.error('Invalid event data', { event });
    return null;
}
```

3. Missing Events
```typescript
const event = await eventService.getEvent(eventId);
if (!event) {
    // Handle missing event
}
```

## Limitations and Future Improvements

1. Event Persistence
   - Currently limited by Redis TTL
   - Future: Consider permanent storage for game history

2. Event Ordering
   - Simple timestamp-based ordering
   - Future: Consider vector clocks or sequence numbers

3. Event Schema Evolution
   - No built-in versioning
   - Future: Add schema version handling

4. Performance
   - Event validation on every read
   - Future: Consider caching validated events