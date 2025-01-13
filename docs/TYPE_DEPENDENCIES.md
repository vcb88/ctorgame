# Type Dependencies in Shared Module

## Type Files Hierarchy

```mermaid
graph TD
    coordinates[coordinates.ts]
    basics[basic-types.ts]
    base[base.ts]
    moves[moves.ts]
    state[state.ts]
    game[game.ts]
    events[events.ts]
    payloads[payloads.ts]
    redis[redis.ts]
    replay[replay.ts]

    coordinates --> state
    coordinates --> moves
    coordinates --> game
    coordinates --> payloads
    basics --> base
    basics --> moves
    basics --> state
    basics --> game
    basics --> payloads
    base --> state
    base --> payloads
    base --> events
    base --> redis
    moves --> state
    moves --> game
    moves --> payloads
    moves --> replay
    state --> game
    state --> payloads
    state --> redis
    state --> events
    game --> redis
    game --> replay
    game --> events
```

## Module Organization

1. **basic-types.ts - Core Types**
   - Contains the most fundamental types with no dependencies
   - Includes Player enum, IPosition, IBoardSize, and GameStatus
   - Used throughout the application
   - Never imports from other type files

2. **base.ts - Common Types**
   - Imports basic types from basic-types.ts
   - Contains game phases, error types, and constants
   - Provides common types used across the application
   - Only depends on basic-types.ts

3. **moves.ts - Move Types**
   - Imports only from basic-types.ts
   - Defines basic move structure
   - Contains move validation types
   - Used by game and state modules

4. **state.ts - State Types**
   - Imports from basic-types.ts, base.ts, and moves.ts
   - Contains game state interfaces
   - Manages board and score types
   - Central to game state management

5. **game.ts - Game Entity Types**
   - Imports from basic-types.ts, state.ts, and moves.ts
   - Defines game room and player structures
   - Handles game metadata and details
   - Connects players with game state

6. **payloads.ts - Communication Types**
   - Imports from multiple modules
   - Contains WebSocket message types
   - Defines client-server communication structure
   - Used by events module

7. **events.ts - Event Types**
   - Top-level module for WebSocket events
   - Imports from base.ts, state.ts, and moves.ts
   - Defines event handlers and callbacks
   - Handles WebSocket communication types

8. **coordinates.ts - Coordinate System Types**
   - No external dependencies (foundational module)
   - Contains core types for board representation (IPosition, IBoardSize, IBoard)
   - Used extensively throughout the application
   - Essential for game state and move validation

9. **redis.ts - Redis Storage Types**
   - Imports from state.ts, game.ts, and base.ts
   - Contains Redis-specific data structures
   - Defines interfaces for data persistence
   - Handles game state storage types

10. **replay.ts - Game Replay Types**
    - Imports from game.ts and moves.ts
    - Contains types for game replay functionality
    - Manages game history and playback
    - Handles replay state management

## Type Dependency Guidelines

1. **Dependency Direction**
   - Types should flow from basic-types.ts outward
   - Each module should only import from modules "below" it in hierarchy
   - No circular dependencies allowed
   - Events module should be the final consumer

2. **Import Organization**
   - Import from basic-types.ts first
   - Group imports by source module
   - Use explicit imports
   - Avoid deep imports from nested structures

3. **Type Placement**
   - Place new types in the most appropriate module
   - Consider dependencies when choosing module
   - Keep related types together
   - Avoid creating new dependencies

4. **Breaking Changes**
   - Changes to basic-types.ts affect all modules
   - Consider impact on dependent modules
   - Update all affected modules
   - Maintain backward compatibility where possible

## Detailed Type Dependencies

### Basic Types (basic-types.ts)
```mermaid
graph TD
    subgraph Basic Types
        Player[Player enum]
        IPosition[IPosition]
        IBoardSize[IBoardSize]
        GameStatus[GameStatus type]
        style Player fill:#f9f,stroke:#333
        style IPosition fill:#f9f,stroke:#333
        style IBoardSize fill:#f9f,stroke:#333
        style GameStatus fill:#f9f,stroke:#333
    end
```

### Common Types (base.ts)
```mermaid
graph TD
    subgraph Common Types
        GamePhase[GamePhase enum]
        GameOutcome[GameOutcome enum]
        OperationType[OperationType enum]
        ErrorCode[ErrorCode enum]
        ErrorSeverity[ErrorSeverity enum]
        ConnectionState[ConnectionState enum]
        RecoveryStrategy[RecoveryStrategy enum]
        GameError[GameError]
        style GamePhase fill:#f9f,stroke:#333
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

### payloads.ts - WebSocket Communication Types
```mermaid
graph TD
    subgraph Basic Payload Types
        BasicPosition[BasicPosition]
        BasicMove[BasicMove]
        BaseGamePayload[BaseGamePayload]
        style BasicPosition fill:#f9f,stroke:#333
        style BasicMove fill:#f9f,stroke:#333
        style BaseGamePayload fill:#f9f,stroke:#333
    end

    subgraph Server Response Payloads
        GameCreatedPayload[GameCreatedPayload]
        GameJoinedPayload[GameJoinedPayload]
        GameStartedPayload[GameStartedPayload]
        GameStateUpdatedPayload[GameStateUpdatedPayload]
        GameOverPayload[GameOverPayload]
        PlayerPayloads[Player*Payloads]
        ErrorPayload[ErrorPayload]
        style GameCreatedPayload fill:#f9f,stroke:#333
        style GameJoinedPayload fill:#f9f,stroke:#333
        style GameStartedPayload fill:#f9f,stroke:#333
        style GameStateUpdatedPayload fill:#f9f,stroke:#333
        style GameOverPayload fill:#f9f,stroke:#333
        style PlayerPayloads fill:#f9f,stroke:#333
        style ErrorPayload fill:#f9f,stroke:#333
    end

    subgraph Client Request Payloads
        JoinGamePayload[JoinGamePayload]
        MakeMovePayload[MakeMovePayload]
        EndTurnPayload[EndTurnPayload]
        ReconnectPayload[ReconnectPayload]
        style JoinGamePayload fill:#f9f,stroke:#333
        style MakeMovePayload fill:#f9f,stroke:#333
        style EndTurnPayload fill:#f9f,stroke:#333
        style ReconnectPayload fill:#f9f,stroke:#333
    end

    BasicPosition --> BasicMove
    BaseGamePayload --> GameCreatedPayload
    BaseGamePayload --> GameJoinedPayload
    BaseGamePayload --> GameStartedPayload
    BaseGamePayload --> GameStateUpdatedPayload
    BaseGamePayload --> GameOverPayload
    BasicMove --> MakeMovePayload
```

The payloads.ts file contains types specifically for WebSocket communication between client and server. It helps break circular dependencies by separating communication-specific types from core game types. The file is organized into three main sections:

1. **Basic Payload Types**: Foundation types used by other payload types
   - BasicPosition: Simple x,y coordinates
   - BasicMove: Basic move structure without game-specific details
   - BaseGamePayload: Common fields for game-related messages

2. **Server Response Payloads**: Types for server->client messages
   - Game state updates
   - Player connection events
   - Error responses

3. **Client Request Payloads**: Types for client->server messages
   - Game actions
   - Connection management

This separation allows for cleaner type dependencies and better maintainability.