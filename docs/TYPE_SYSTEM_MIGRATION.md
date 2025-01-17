# Type System Migration Guide

## Overview

This document describes the migration process from the old type system to the new one, focusing on common patterns and required changes. It serves as a practical guide for updating server-side code to work with the new type system.

## Key Changes

1. **Removal of 'I' Prefix**
   ```typescript
   // Old
   interface IGameState { ... }
   
   // New
   type GameState = { ... }
   ```

2. **Tuple Types Instead of Interfaces**
   ```typescript
   // Old
   interface IPosition {
       x: number;
       y: number;
   }
   
   // New
   type Position = [number, number];
   ```

3. **Union Types Instead of Enums**
   ```typescript
   // Old
   enum GameStatus {
       WAITING = 'waiting',
       ACTIVE = 'active',
       FINISHED = 'finished'
   }
   
   // New
   type GameStatus = 'waiting' | 'active' | 'finished';
   ```

## Import Changes

1. **Core Type Imports**
   ```typescript
   // Old
   import { IGameState } from '@ctor-game/shared/types/game/types';
   
   // New
   import { GameState } from '@ctor-game/shared/types/core';
   ```

2. **Path Updates**
   - Remove '/src/' from import paths
   - Add '.js' extension to imports
   - All shared types now come from 'core.js'

## Common Migration Patterns

### 1. Event Types
```typescript
// Old
interface IGameEvent {
    type: string;
    timestamp: number;
}

// New
type GameEvent = {
    type: WebSocketEvent;
    timestamp: Timestamp;
};
```

### 2. Error Handling
```typescript
// Old
import { toErrorWithStack, IErrorWithStack } from '@ctor-game/shared/utils/errors';

// New 
import { ErrorWithStack } from '@ctor-game/shared/utils/errors';
```

### 3. WebSocket Events
```typescript
// Old
import { IWebSocketEvent } from '@ctor-game/shared/types/network/websocket';

// New
import { WebSocketEvent } from '@ctor-game/shared/types/core';
```

## Required Updates by Module

### Game Service
- Use GameStatus from core.ts instead of enum
- Update event type definitions
- Use tuple types for positions and scores

### Redis Service
- Update to use new Redis types
- Ensure correct error handling types
- Update validation methods

### WebSocket Handlers
- Update event type definitions
- Use proper error response types
- Update move validation logic

## Type Mapping Reference

| Old Type | New Type | Notes |
|----------|----------|-------|
| IGameState | GameState | In core.ts |
| IPosition | Position | Now [number, number] |
| IGameMove | GameMove | Simplified structure |
| IPlayer | Player | Removed interface |
| IGameScores | Scores | Now [number, number] |
| IErrorWithStack | ErrorWithStack | Simplified error type |
| IWebSocketEvent | WebSocketEvent | In core.ts |
| IRedisGameState | RedisGameState | Updated for new types |

## Validation Updates

1. Move Validation
```typescript
// Old
import { validateGameMove } from '@ctor-game/shared/validation/game';

// New
import { validateMove } from '@ctor-game/shared/validation/game';
```

2. State Validation
```typescript
// Old
import { validateGameState } from '@ctor-game/shared/validation/game';

// New
import { validateState } from '@ctor-game/shared/validation/game';
```

## Error Handling Updates

1. Error Creation
```typescript
// Old
import { createErrorResponse } from '@ctor-game/shared/utils/errors';

// New
import { createGameError } from '@ctor-game/shared/utils/errors';
```

## Testing Implications

When updating types:
1. Check all test files for old type usage
2. Update mock objects to match new type structures
3. Verify error handling in tests
4. Check event handling test cases

## Common Gotchas

1. Type-only imports cannot be used as values
2. Tuple types require exact length matching
3. Union types need exhaustive checking
4. Error types have required and optional fields

## Migration Checklist

- [ ] Update import paths
- [ ] Replace interface usage with types
- [ ] Update error handling
- [ ] Validate WebSocket events
- [ ] Check Redis types
- [ ] Update validation calls
- [ ] Verify test cases