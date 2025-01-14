# Redis TTL Strategy

## Overview

The TTL (Time To Live) strategy is designed to manage the lifecycle of cached data in Redis based on the game state and activity. This documentation describes the TTL configuration, implementation, and best practices.

## TTL Configuration

### Base TTL Values
Default TTL values for game-related data:
```typescript
{
    gameState: 3600,     // 1 hour
    playerSession: 7200, // 2 hours
    gameRoom: 3600,     // 1 hour
    events: 86400       // 24 hours
}
```

### Active Game TTL Values
Extended TTL values for active games:
```typescript
{
    gameState: 14400,    // 4 hours
    playerSession: 14400,// 4 hours
    gameRoom: 14400     // 4 hours
}
```

### Finished Game TTL Values
Shortened TTL values for finished games:
```typescript
{
    gameState: 900,     // 15 minutes
    playerSession: 900, // 15 minutes
    gameRoom: 900      // 15 minutes
}
```

## Environment Variables

TTL values can be configured using environment variables:

```env
# Base TTL values
CACHE_TTL_GAME_STATE=3600
CACHE_TTL_PLAYER_SESSION=7200
CACHE_TTL_GAME_ROOM=3600
CACHE_TTL_EVENTS=86400

# Active game TTL values
CACHE_TTL_ACTIVE_GAME_STATE=14400
CACHE_TTL_ACTIVE_PLAYER_SESSION=14400
CACHE_TTL_ACTIVE_GAME_ROOM=14400

# Finished game TTL values
CACHE_TTL_FINISHED_GAME_STATE=900
CACHE_TTL_FINISHED_PLAYER_SESSION=900
CACHE_TTL_FINISHED_GAME_ROOM=900
```

## Implementation

### TTL Strategy Interface
```typescript
interface TTLStrategy {
    getTTL(key: keyof TTLConfig['base'], status: GameStatus): number;
    updateGameTTLs(gameId: string, status: GameStatus): Promise<void>;
    extendGameTTLs(gameId: string): Promise<void>;
}
```

### Usage Examples

1. Getting TTL value:
```typescript
const ttl = ttlStrategy.getTTL('gameState', 'playing');
```

2. Updating TTLs for all game-related keys:
```typescript
await ttlStrategy.updateGameTTLs(gameId, 'finished');
```

3. Extending TTLs for active game:
```typescript
await ttlStrategy.extendGameTTLs(gameId);
```

## Cache Invalidation

### Game State Changes
When game state changes:
1. Update game state TTL
2. Update related entities TTL
3. Update events TTL

```typescript
await ttlStrategy.updateGameTTLs(gameId, newStatus);
```

### Active Game Extensions
For active games, extend TTLs on:
- Player activity
- Game state updates
- Turn changes

```typescript
await ttlStrategy.extendGameTTLs(gameId);
```

### Game Completion
When game ends:
1. Update TTLs to shorter values
2. Schedule cleanup after TTL expiration

```typescript
await ttlStrategy.updateGameTTLs(gameId, 'finished');
```

## Best Practices

1. Always update related entities TTL together:
   ```typescript
   // Example: Updating game state
   await redisClient.multi()
       .set(gameStateKey, JSON.stringify(state))
       .expire(gameStateKey, ttl)
       .exec();
   ```

2. Extend TTLs on significant events:
   ```typescript
   // Example: Player activity
   async function handlePlayerActivity(gameId: string) {
       await ttlStrategy.extendGameTTLs(gameId);
   }
   ```

3. Use appropriate TTL based on game state:
   ```typescript
   // Example: Game completion
   async function handleGameEnd(gameId: string) {
       await ttlStrategy.updateGameTTLs(gameId, 'finished');
   }
   ```

## Error Handling

1. TTL Update Failures:
   ```typescript
   try {
       await ttlStrategy.updateGameTTLs(gameId, status);
   } catch (error) {
       logger.error('Failed to update TTLs', {
           component: 'TTLStrategy',
           context: { gameId, status },
           error
       });
   }
   ```

2. Recovery Strategy:
   - Log failures
   - Use default TTL values
   - Schedule retry for critical updates

## Monitoring

Monitor TTL-related metrics:
1. TTL update success/failure rates
2. Key expiration events
3. Cache hit/miss ratios
4. Memory usage patterns

## Future Improvements

1. Dynamic TTL Adjustment
   - Based on player activity patterns
   - Based on game complexity
   - Based on server load

2. Batch TTL Updates
   - Group related TTL updates
   - Optimize Redis commands
   - Reduce network overhead

3. TTL Monitoring
   - Add TTL monitoring endpoints
   - Track TTL statistics
   - Alert on anomalies