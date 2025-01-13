# Type Dependencies in Shared Module

## Type Files Hierarchy

```mermaid
graph TD
    base[base.ts]
    moves[moves.ts]
    state[state.ts]
    game[game.ts]
    events[events.ts]

    base --> moves
    base --> state
    moves --> state
    base --> game
    moves --> game
    state --> game
    base --> events
    state --> events
    game --> events
```

## Detailed Type Dependencies

### base.ts - Foundation Types
```mermaid
graph TD
    subgraph Base Types
        Player[Player enum]
        GamePhase[GamePhase enum]
        GameOutcome[GameOutcome enum]
        OperationType[OperationType enum]
        ErrorCode[ErrorCode enum]
        ErrorSeverity[ErrorSeverity enum]
        ConnectionState[ConnectionState enum]
        RecoveryStrategy[RecoveryStrategy enum]
    end

    subgraph Basic Interfaces
        IPosition[IPosition]
        IBoardSize[IBoardSize]
        GameError[GameError]
        style IPosition fill:#f9f,stroke:#333
        style IBoardSize fill:#f9f,stroke:#333
        style GameError fill:#f9f,stroke:#333
    end

    subgraph Constants
        BOARD_SIZE[BOARD_SIZE]
        MIN_ADJACENT[MIN_ADJACENT_FOR_REPLACE]
        MAX_PLACE_OPS[MAX_PLACE_OPERATIONS]
        style BOARD_SIZE fill:#ff9,stroke:#333
        style MIN_ADJACENT fill:#ff9,stroke:#333
        style MAX_PLACE_OPS fill:#ff9,stroke:#333
    end

    ErrorCode --> GameError
    ErrorSeverity --> GameError
```

### moves.ts - Move Types
```mermaid
graph TD
    subgraph Moves
        IBasicMove[IBasicMove]
        GameMove[GameMove]
        style IBasicMove fill:#f9f,stroke:#333
        style GameMove fill:#f9f,stroke:#333
    end

    IPosition[IPosition from base.ts]
    Player[Player from base.ts]

    IPosition --> IBasicMove
    IBasicMove --> GameMove
    Player --> GameMove
```

### state.ts - State Types
```mermaid
graph TD
    subgraph State Types
        IBoard[IBoard]
        IScores[IScores]
        ITurnState[ITurnState]
        IGameState[IGameState]
        GameManagerState[GameManagerState]
        StoredState[StoredState]
        IStateStorage[IStateStorage]
        style IBoard fill:#f9f,stroke:#333
        style IScores fill:#f9f,stroke:#333
        style ITurnState fill:#f9f,stroke:#333
        style IGameState fill:#f9f,stroke:#333
        style GameManagerState fill:#f9f,stroke:#333
        style StoredState fill:#f9f,stroke:#333
        style IStateStorage fill:#f9f,stroke:#333
    end

    IBoardSize[IBoardSize from base.ts]
    Player[Player from base.ts]
    GamePhase[GamePhase from base.ts]
    IBasicMove[IBasicMove from moves.ts]

    IBoardSize --> IBoard
    Player --> IScores
    IBasicMove --> ITurnState
    IBoard --> IGameState
    IScores --> IGameState
    ITurnState --> IGameState
    Player --> IGameState
    GamePhase --> GameManagerState
    Player --> GameManagerState
```

### game.ts - Game Entity Types
```mermaid
graph TD
    subgraph Game Types
        IPlayer[IPlayer]
        IGameRoom[IGameRoom]
        GameDetails[GameDetails]
        GameMetadata[GameMetadata]
        style IPlayer fill:#f9f,stroke:#333
        style IGameRoom fill:#f9f,stroke:#333
        style GameDetails fill:#f9f,stroke:#333
        style GameMetadata fill:#f9f,stroke:#333
    end

    Player[Player from base.ts]
    GameStatus[GameStatus from base.ts]
    GameMove[GameMove from moves.ts]
    IGameState[IGameState from state.ts]

    Player --> IPlayer
    IPlayer --> IGameRoom
    IGameState --> IGameRoom
    Player --> IGameRoom
    GameMove --> GameDetails
    GameStatus --> GameMetadata
    IGameState --> GameMetadata
    Player --> GameMetadata
```

### events.ts - Event Types
```mermaid
graph TD
    subgraph Event Types
        WebSocketEvents[WebSocketEvents enum]
        WebSocketPayloads[WebSocketPayloads]
        IGameEvent[IGameEvent]
        ReconnectionData[ReconnectionData]
        ErrorResponse[ErrorResponse]
        style WebSocketEvents fill:#f9f,stroke:#333
        style WebSocketPayloads fill:#f9f,stroke:#333
        style IGameEvent fill:#f9f,stroke:#333
        style ReconnectionData fill:#f9f,stroke:#333
        style ErrorResponse fill:#f9f,stroke:#333
    end

    GamePhase[GamePhase from base.ts]
    IGameState[IGameState from state.ts]
    WebSocketErrorCode[WebSocketErrorCode from base.ts]

    WebSocketEvents --> WebSocketPayloads
    GamePhase --> WebSocketPayloads
    IGameState --> WebSocketPayloads
    WebSocketErrorCode --> ErrorResponse
```

## Additional Types

### Redis Types
```mermaid
graph TD
    subgraph Redis Types
        IRedisGameState[IRedisGameState]
        IRedisPlayerSession[IRedisPlayerSession]
        IRedisGameRoom[IRedisGameRoom]
        IRedisGameEvent[IRedisGameEvent]
        ICacheConfig[ICacheConfig]
        style IRedisGameState fill:#f9f,stroke:#333
        style IRedisPlayerSession fill:#f9f,stroke:#333
        style IRedisGameRoom fill:#f9f,stroke:#333
        style IRedisGameEvent fill:#f9f,stroke:#333
        style ICacheConfig fill:#f9f,stroke:#333
    end

    IGameState[IGameState from state.ts]
    IPlayer[IPlayer from game.ts]
    GameStatus[GameStatus from base.ts]

    IGameState --> IRedisGameState
    IPlayer --> IRedisGameRoom
    GameStatus --> IRedisGameRoom
```

## Type Organization Guidelines

1. **Base Types (base.ts)**
   - Contains fundamental enums, interfaces and constants
   - No dependencies on other type files
   - Used throughout the application

2. **Move Types (moves.ts)**
   - Contains move-related types
   - Depends only on base.ts
   - Separates basic move structure from game-specific moves

3. **State Types (state.ts)**
   - Contains game state related interfaces
   - Depends on base.ts and moves.ts
   - Manages game state and turn information

4. **Game Types (game.ts)**
   - Contains game entity interfaces
   - Depends on base.ts, moves.ts, and state.ts
   - Defines game-specific structures

5. **Event Types (events.ts)**
   - Contains WebSocket and event-related types
   - Can depend on all other type files
   - Handles communication between client and server

## Rules for Adding New Types

1. **Dependency Direction**
   - Types should follow the hierarchy: base → moves → state → game → events
   - No circular dependencies allowed
   - If a type could belong to multiple files, place it in the earlier file in the hierarchy

2. **File Organization**
   - Group related types together
   - Use explicit exports
   - Document complex type relationships
   - Keep interfaces focused and single-purpose

3. **Type Sharing**
   - Share types through the main index.ts
   - Use explicit imports rather than deep imports
   - Maintain backward compatibility when modifying shared types

4. **Validation**
   - Validate type changes across both client and server
   - Update documentation when adding or modifying types
   - Consider impact on existing type relationships