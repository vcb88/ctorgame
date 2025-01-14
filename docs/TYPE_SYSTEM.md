# Type System Documentation

## Current Migration Status

This document combines the current type system migration status and dependency analysis to provide a comprehensive view of the type system state and planned changes.

### Recent Completions

✅ Server Components:
- EventService
- RedisService
- GameService
- GameLogicService
- GameStorageService
- WebSocket Layer (in progress)

✅ Shared Types:
- network/events.ts (migrated from events.new.ts)
- storage/metadata.ts (updated to use new types)

## Type Dependencies Structure

### Core Layer
1. Primitive Types (core/primitives.js)
   - ITimestamp
   - IIdentifiable
   - IVersioned
   - IExpiration
   - IData

2. Geometry Types (geometry/types.js)
   - IBoardSize
   - IPosition
   - Dependencies: none

### Game Layer
1. Game Types (game/types.js)
   - PlayerNumber
   - GameStatus
   - MoveType

2. Players (game/players.new.ts)
   - IPlayer
   - IGameRoom
   - Dependencies: IGameState

3. State (game/state.new.ts)
   - IBoard
   - IGameScores
   - ITurnState
   - IGameState
   - Dependencies: IBoardSize, PlayerNumber, IGameMove

4. Moves (game/moves.new.ts)
   - IGameMove
   - IGameMoveComplete
   - Dependencies: IPosition, PlayerNumber, ITimestamp

### Network Layer
1. Network Base
   - Dependencies: IGameState, IGameMoveComplete, PlayerNumber, GameStatus

2. WebSocket
   - Dependencies: IGameState, IGameMove, PlayerNumber, GameStatus

3. Events
   - Dependencies: Game types, ITimestamped, IIdentifiable

### Storage Layer
1. Redis State
   - Dependencies: IGameState, IPlayer, GameStatus

2. Storage Metadata
   - Dependencies: GameStatus, PlayerNumber, IGameMove, IBoardSize

## Pending Migration Tasks

### High Priority
1. WebSocket Layer
   - gameHandlers.new.ts
   - gameHandlers.ts
   - replayHandlers.ts
   - types/events.ts

2. Client Types
   - types/game.d.ts
   - types/animations.ts
   - types/errors.new.ts
   - types/gameManager.ts

### Medium Priority
1. Client Hooks
   - useMultiplayerGameNew.ts
   - useGame.ts
   - useMultiplayerGame.ts
   - useReplay.ts
   - useGameHistory.ts

2. Client Services
   - GameStateManager.ts
   - ActionQueue.new.ts
   - ActionQueue.ts
   - ai/index.ts

3. Client Validation
   - validation/game.ts
   - validation/stateValidation.ts

### Low Priority
1. Tests
   - All disabled tests in client/src/hooks/__tests__/
   - All disabled tests in client/src/services/ai/__tests__/
   - All disabled tests in client/src/validation/__tests__/
   - src/game/__tests__/rules.test.ts

2. Backup Files
   - backup/shared/src/**/*

## Migration Guidelines

### Key Changes Required
1. Replace enum types with string literals/union types
2. Update state management (remove currentTurn, use new game state structure)
3. Update score handling (use player1/player2 instead of indexed access)
4. Make interfaces immutable (add readonly)
5. Use proper typing for moves and game state
6. Update validation logic to match new type system
7. Ensure all files use consistent import paths
8. Remove timestamp from moves
9. Update board access (direct array instead of cells property)

### Dependency Resolution Plan
1. Break Circular Dependencies:
   - Move shared types to game/types.js
   - Update all imports to use centralized type definitions

2. Import Order (to prevent circular dependencies):
   1. core/primitives.js
   2. geometry/types.js
   3. game/types.js
   4. game/moves.js
   5. game/state.js
   6. game/players.js
   7. network/* files
   8. validation/* files

## Open Questions

1. Verify if .new and .next files should be merged or replaced
2. Check if any files in backup are still needed
3. Verify if all disabled tests should be updated or removed
4. Consider updating file organization to better reflect new type system