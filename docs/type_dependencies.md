# Type System Dependencies Analysis

## Core Dependencies

### Primitive Types (core/primitives.js)
- ITimestamp
- IIdentifiable
- IVersioned
- IExpiration
- IData

### Geometry Types (geometry/types.js)
- IBoardSize
- IPosition
- Dependencies: none

## Game Types

### Players (game/players.new.ts)
- PlayerNumber
- IPlayer
- IGameRoom
Dependencies:
- Uses IGameState from game/state.new.ts

### State (game/state.new.ts)
- IBoard
- IGameScores
- ITurnState
- IGameState
Dependencies:
- IBoardSize from geometry/types.js
- PlayerNumber from game/players.js
- IGameMove from game/moves.js

### Moves (game/moves.new.ts)
- IGameMove
- IGameMoveComplete
Dependencies:
- IPosition from geometry/types.js
- PlayerNumber from game/players.js
- ITimestamp from core/primitives.js

## Network Types

### Network Base (base/network.new.ts)
Dependencies:
- IGameState from game/state.js
- IGameMoveComplete from game/moves.js
- PlayerNumber from game/players.js
- GameStatus from game/types.js

### WebSocket (network/websocket.new.ts)
Dependencies:
- IGameState from game/types.js
- IGameMove from game/types.js
- PlayerNumber from game/types.js
- GameStatus from game/types.js

### Events (network/events.new.ts)
Dependencies:
- IGameState, IGameMove, GameStatus, PlayerNumber from game/types.js
- ITimestamped, IIdentifiable from core/primitives.js

## Storage Types

### Redis State (redis/state.new.ts)
Dependencies:
- IGameState, IPlayer, GameStatus from game/types.js

### Storage Metadata (storage/metadata.new.ts)
Dependencies:
- GameStatus, PlayerNumber, IGameMove, IBoardSize from game/types.js

## Validation Types

### Game Validation (validation/game.new.ts)
Dependencies:
- IPosition, IBoardSize from geometry/types.js
- PlayerNumber from game/players.js
- IGameMoveComplete from game/moves.js
- IGameState from game/state.js

## Circular Dependencies Found

1. game/players.new.ts ↔ game/state.new.ts:
   - players imports IGameState from state
   - state uses PlayerNumber from players

## Resolution Plan

1. Break Circular Dependencies:
   - Move PlayerNumber type to a new file game/types.js
   - This file will serve as a central point for shared game types
   - Update all imports to use game/types.js for common types

2. Consolidate Common Types:
   Create new game/types.js with:
   ```typescript
   export type PlayerNumber = 1 | 2;
   export type GameStatus = 'waiting' | 'playing' | 'finished';
   export type MoveType = 'place' | 'replace' | 'end_turn';
   ```

3. Update Import Order:
   1. core/primitives.js
   2. geometry/types.js
   3. game/types.js
   4. game/moves.js
   5. game/state.js
   6. game/players.js
   7. network/* files
   8. validation/* files