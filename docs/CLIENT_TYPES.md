# Client Types Documentation

## Overview
This document describes the type system used in the client part of the application after the refactoring. The main goal was to simplify types, eliminate duplication with shared types, and improve type safety.

## Core Principles
- Use types from `@ctor-game/shared/src/types/core.js` wherever possible
- Prefer type aliases over interfaces
- Use composition over inheritance
- Keep client-specific types minimal
- Maintain strict type safety
- Document all types thoroughly

## Type Structure

### Game Types (`game.d.ts`)
```typescript
type TurnState = {
    placeOperations: number;
    replaceOperations: number;
    player: PlayerNumber;
};

type GameStateWithTurn = GameState & {
    currentTurn: TurnState;
    isFirstTurn: boolean;
};

type GameHistoryEntry = {
    moveNumber: number;
    player: PlayerNumber;
    move: GameMove;
    timestamp: Timestamp;
};
```
The game types extend the core game state with client-specific turn information and history tracking.

### Error Handling (`errors.ts`)
```typescript
type ClientError = GameError & {
    severity: ErrorSeverity;
    stack?: string;
};

type ErrorHandlerConfig = {
    maxRetries: number;
    retryDelay: number;
    maxRetryDelay: number;
    maxRecoveryAttempts: number;
};

type ErrorRecoveryStrategy = {
    codes: ErrorCode[];
    shouldRetry: boolean;
    shouldRecover: boolean;
    retryConfig?: {
        maxRetries?: number;
        retryDelay?: number;
    };
    recover?: () => Promise<void>;
};
```
Error handling system extends core GameError with client-specific severity levels and recovery strategies.

### Animations (`animations.ts`)
```typescript
type AnimationType = MoveType | 'capture';

type AnimationState = {
    type: AnimationType;
    startTime: Timestamp;
    duration: number;
    positions: Position[];
    data?: AnimationData;
};

type AnimationData = {
    previousValue?: PlayerNumber | null;
    newValue?: PlayerNumber | null;
    captureChain?: Position[];
};

type CellAnimationState = {
    isAnimating: boolean;
    type?: AnimationType;
    startTime?: Timestamp;
    data?: AnimationData;
};
```
Animation system uses core types for positions and moves, adding client-specific animation metadata.

### Game Manager (`gameManager.ts`)
```typescript
type GameManagerState = {
    gameState: GameState | null;
    currentPlayer: PlayerNumber | null;
    availableReplaces: GameMove[];
    isConnected: boolean;
    isLoading: boolean;
    error: GameError | null;
};

type JoinGameResult = {
    gameId: GameId;
    playerNumber: PlayerNumber;
};

type JoinGameError = GameError & {
    operation: 'join';
    gameId: GameId;
};
```
Game manager handles the client-side game state and operations, using core types for game data.

### Network Types (`connection.ts` and `actions.ts`)
These files re-export types from shared library:
- `connection.ts`: network state and error types
- `actions.ts`: game action types

## Type Dependencies

### Core Types Used
From `@ctor-game/shared/src/types/core.js`:
- `GameState`: Base game state
- `PlayerNumber`: Player identifier (1 | 2)
- `Position`: Board coordinates [number, number]
- `GameMove`: Move description
- `Timestamp`: Time representation
- `GameError`: Base error type
- `MoveType`: Available move types
- `GameId`: Game identifier

### Network Types Used
From `@ctor-game/shared/src/types/network`:
- `ErrorCode`: Network error codes
- `ErrorSeverity`: Error severity levels
- `ConnectionState`: Connection status
- `WebSocketErrorCode`: WebSocket specific errors

## Found Issues and Inconsistencies

1. **Type Inconsistencies**
   - Mixed usage of `PlayerNumber` type and `Player` enum
   - Different player representations in UI (X/O vs First/Second vs 1/2)
   - Some files still import from old paths (e.g., '@ctor-game/shared/types/base/enums')

2. **Import Path Issues**
   - Old import paths still in use:
     - '@ctor-game/shared/types/game'
     - '@ctor-game/shared/types/base/enums'
     - '@ctor-game/shared/types/base/primitives'
   - Need to update to use '@ctor-game/shared/src/types/core.js'

3. **UI Inconsistencies**
   - Player representation varies across components:
     - GameBoard.tsx: 'X' / 'O'
     - GameControls.tsx: "First" / "Second"
     - Other places: 1 / 2
   - Need to standardize player representation in UI

4. **Type Usage Problems**
   - Some components still use object notation for positions instead of tuples
   - Inconsistent null handling in some state types
   - Mixed usage of readonly modifiers

## Potential Issues to Check

1. **Type Alignment**
   - [ ] Verify that `PlayerNumber` usage is consistent (no mixing with old Player enum)
   - [ ] Check that all Position usages are [number, number] tuples
   - [ ] Ensure GameState structure matches between client and shared

2. **Nullable Fields**
   - [ ] Review null handling in GameManagerState
   - [ ] Check optional fields in animation types
   - [ ] Verify error state handling

3. **Type Safety**
   - [ ] Validate union type handling for AnimationType
   - [ ] Check exhaustive handling of MoveType values
   - [ ] Verify error type discrimination

4. **Import Paths**
   - [ ] Ensure all imports use '.js' extension
   - [ ] Check for any remaining imports from old paths
   - [ ] Verify no circular dependencies

## Migration Guide

1. **For Component Updates**
   ```typescript
   // Old way
   interface Props {
       position: IPosition;
       player: Player;
   }

   // New way
   type Props = {
       position: Position; // [number, number]
       player: PlayerNumber; // 1 | 2
   }
   ```

2. **For State Management**
   ```typescript
   // Old way
   const [gameState, setGameState] = useState<IGameState | null>(null);

   // New way
   const [gameState, setGameState] = useState<GameState | null>(null);
   ```

## Future Improvements

1. **Type Safety**
   - Consider adding branded types for GameId
   - Add more specific error subtypes
   - Implement strict validation for network payloads

2. **Documentation**
   - Add more code examples
   - Document type guard functions
   - Create flow diagrams for type relationships

3. **Testing**
   - Add type testing with dtslint
   - Create test cases for type edge cases
   - Validate type inference in common use cases