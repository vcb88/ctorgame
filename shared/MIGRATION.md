# Type System Migration Guide

## Overview

We are simplifying our type system to:
1. Remove type duplication
2. Replace inheritance with composition
3. Use discriminated unions for better type safety
4. Centralize core types

## New Structure

```
src/types/
├── core/
│   └── base.ts      # Core primitive types and interfaces
├── game/
│   └── core.ts      # Game-related types
└── network/
    └── core.ts      # Network and WebSocket types
```

## Migration Steps

### 1. Update Imports

Old:
```typescript
import { IGameState, IGameMove } from '@ctor-game/shared/types';
```

New:
```typescript
import type { IGameState, IGameMove } from '@ctor-game/shared/types/game/core.js';
```

### 2. Type Changes

#### Position Type

Old:
```typescript
interface IPositionBase extends IXCoordinate, IYCoordinate {}
interface IPosition extends IPositionBase {}
```

New:
```typescript
interface IPosition {
    x: number;
    y: number;
}
```

#### Game State

Old:
```typescript
interface IGameStateBase {
    board: number[][];
    currentPlayer: number;
}

interface IGameState extends IGameStateBase, ITimestamp {
    id: string;
    status: GameStatus;
}
```

New:
```typescript
interface IGameState {
    id: UUID;
    board: Array<Array<number | null>>;
    size: ISize;
    turn: ITurnState;
    scores: IScores;
    status: GameStatus;
    timestamp: Timestamp;
    isFirstTurn: boolean;
}
```

#### Events

Old:
```typescript
interface IGameEvent extends ITimestamp {
    type: string;
    gameId: string;
}
```

New:
```typescript
type GameEventPayload =
    | {
        type: 'game_created';
        gameId: UUID;
        player: IPlayer;
      }
    | {
        type: 'game_move';
        gameId: UUID;
        move: IGameMove;
        state: IGameState;
      };
```

## Benefits

1. **Type Safety**: Using discriminated unions provides better type checking
2. **Simplicity**: Composition is easier to understand than inheritance
3. **Maintainability**: No duplicate types to keep in sync
4. **Performance**: Simpler type system means faster compilation

## Timeline

1. Current types are marked as deprecated but still available
2. Next major version will remove deprecated types
3. Migration should be completed before updating to the next major version