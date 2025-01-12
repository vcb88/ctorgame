# Action Queue System

## Overview
The Action Queue system prevents race conditions and ensures proper ordering of game operations. It's implemented as a simple sequential queue for MVP, with basic conflict detection.

## Components

### ActionQueue
Main queue manager that handles operation sequencing:
```typescript
class ActionQueue {
  private queue: QueuedAction[] = [];
  private processing: boolean = false;

  public enqueue<T>(action: GameActionUnion): Promise<T>;
  public clear(): void;
  public isActionPending(type: GameActionType): boolean;
}
```

### Action Types
```typescript
enum GameActionType {
  MAKE_MOVE = 'MAKE_MOVE',
  END_TURN = 'END_TURN',
  JOIN_GAME = 'JOIN_GAME',
  CREATE_GAME = 'CREATE_GAME',
  RECONNECT = 'RECONNECT'
}
```

### Operation Flow
1. Action is enqueued
2. Queue processes actions sequentially
3. Conflicts are checked
4. Action is executed
5. Result is returned
6. Next action is processed

## MVP Implementation

### Features Included
- Basic sequential queue
- Simple conflict detection
- Operation timestamps
- Queue clearing
- Error handling
- Operation status tracking

### Conflict Detection
For MVP, we check for:
- Duplicate operations
- Move during move
- End turn during move

```typescript
private canProcessAction(action: GameActionUnion): boolean {
  // Check for duplicates
  const duplicates = this.queue.filter(qa => 
    qa.action.type === action.type &&
    qa.action.gameId === action.gameId
  );

  // Check for conflicts
  const conflicts = this.queue.some(qa => {
    if (qa.action.type === GameActionType.MAKE_MOVE && 
        action.type === GameActionType.MAKE_MOVE) {
      return true;
    }
    if (qa.action.type === GameActionType.MAKE_MOVE && 
        action.type === GameActionType.END_TURN) {
      return true;
    }
    return false;
  });

  return !conflicts;
}
```

### Error Handling
Errors are handled through ErrorRecoveryManager:
```typescript
try {
  // Process action
} catch (error) {
  const gameError = error as GameError;
  this.errorManager.handleError(gameError);
  reject(gameError);
} finally {
  this.processing = false;
}
```

## Integration

### With GameStateManager
```typescript
public async makeMove(move: IGameMove): Promise<void> {
  await this.actionQueue.enqueue({
    type: GameActionType.MAKE_MOVE,
    move,
    timestamp: Date.now()
  });
  
  this.socket.emit(WebSocketEvents.MakeMove, { move });
}
```

### With Components
```typescript
const handleMove = async () => {
  try {
    setLoading(true);
    await makeMove(x, y);
  } finally {
    setLoading(false);
  }
};
```

## Future Improvements

### Planned for Post-MVP
- Priority queue
- Parallel safe operations
- Operation cancellation
- Operation timeouts
- Queue persistence
- Operation batching
- Queue analytics
- Performance monitoring

### Not Included in MVP
- Complex conflict resolution
- Operation dependencies
- Queue optimization
- Operation replay
- State rollback
- Operation validation rules
- Queue compression

## Configuration
Current MVP configuration:
```typescript
const DEFAULT_QUEUE_CONFIG = {
  maxQueueSize: 100,
  operationTimeout: 10000,
  cleanupInterval: 60000
};
```

## Error Handling
Errors that can occur:
- Queue full
- Operation timeout
- Operation conflict
- Invalid operation
- Queue processing error

## Monitoring
For MVP we track:
- Queue length
- Operation status
- Error rates
- Processing time

## Recovery
Basic recovery mechanisms:
- Queue clearing
- Operation retry
- Error notification

## Limitations in MVP
- No complex conflict resolution
- No operation priorities
- No parallel processing
- Basic error handling
- Simple queue cleanup
- No persistence
- No analytics