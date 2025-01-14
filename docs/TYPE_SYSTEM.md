# Type System Documentation

## Overview

The project is in the middle of a major type system refactoring effort. The main goals are:
- ✅ Simplify type hierarchy
- ✅ Remove type duplication
- ✅ Move from inheritance to composition
- 🔄 Improve type safety (in progress)
- 🔄 Make the system more maintainable (in progress)

## Migration Status

### Recent Completions

#### Server Components
- ✅ EventService
- ✅ RedisService
- ✅ GameService
- ✅ GameLogicService
- ✅ GameStorageService
- ✅ WebSocket Layer (in progress)

#### Shared Types
- ✅ network/events.ts (migrated from events.new.ts)
- ✅ storage/metadata.ts (updated to use new types)

### Type Dependencies Structure

#### Core Layer
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

#### Game Layer
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

### Migration Status Table

| Component | Status | Description |
|-----------|--------|-------------|
| Core Types | ✅ Complete | Base types migrated and documented |
| Event System | ✅ Complete | Full event type system implemented |
| EventService | ✅ Complete | Service implemented and integrated |
| GameService | ✅ Complete | Migrated to new type system |
| WebSocket Handlers | 🔄 90% | Base handlers updated, some pending |
| Client Integration | ✅ Complete | New hooks and types implemented |
| Testing | 🔄 10% | Basic structure only |
| Documentation | 🔄 50% | Core docs updated, details pending |
| Validation | 🔄 30% | Basic validation implemented |

### Success Metrics

1. Type Safety
   - ✅ No any types in new code
   - ✅ Full type coverage for events
   - ✅ Runtime type checking in validation
   - ✅ Comprehensive type guards

2. Code Quality
   - ✅ Clear type hierarchy
   - ✅ Minimal type duplication
   - ✅ Consistent patterns
   - 🔄 Test coverage (pending)

3. Developer Experience
   - ✅ Improved type inference
   - ✅ Better error messages
   - 🔄 Documentation (in progress)
   - 🔄 Development tools (pending)

## Type System Architecture

### Principles
- Composition over inheritance
- Immutable interfaces (readonly properties)
- Domain-driven design
- Single source of truth for types
- Clear dependency hierarchy

### Import Order
1. core/primitives.js
2. geometry/types.js
3. game/types.js
4. game/moves.js
5. game/state.js
6. game/players.js
7. network/* files
8. validation/* files

## Known Issues and Type Duplications

### Critical Issues

1. Type System Compilation
   - Maximum call stack size exceeded error during compilation
   - Potential circular dependencies in type resolution
   - Mixed usage of old and new type systems
   - Duplicate type definitions causing conflicts

2. Testing Coverage
   - Limited test coverage for new types
   - Missing integration tests
   - Event validation needs testing

3. Documentation
   - Some sections need updating
   - Missing examples for new features
   - Migration guides incomplete

4. Validation
   - Runtime validation incomplete
   - Missing schema validation
   - Error messages need improvement

### Type Duplications Being Resolved

1. Position/Coordinate Types:
   - Old: IXCoordinate, IYCoordinate (core.ts)
   - New: IPosition (geometry/types.ts)

2. Dimension Types:
   - Old: IWidth, IHeight (core.ts)
   - New: ISize (geometry/types.ts)

3. Game State Types:
   - Old: IGamePhaseBase extends IPhase (base.ts)
   - New: Direct union type GameStatus = 'waiting' | 'playing' | 'finished'

4. Operation Types:
   - Old: IOperationTypeBase extends IOperationType (base.ts)
   - New: Direct union type OperationType = 'place' | 'replace'

5. Validation Types:
   - Old: IValidationResult (core.ts)
   - New: IMoveValidation (game/types.ts)

## Files Status

### Migration Complete
| File Path | Status | Notes |
|-----------|--------|-------|
| /server/src/services/EventService.ts | ✅ Done | Using new type system from events.ts |
| /server/src/services/RedisService.ts | ✅ Done | Using new types and structures |
| /server/src/services/GameService.ts | ✅ Done | Migrated to new type system |
| /server/src/services/GameLogicService.ts | ✅ Done | Updated to use new game state structure |
| /server/src/services/GameStorageService.ts | ✅ Done | Using new metadata types |
| /shared/src/types/game/state.ts | ✅ Done | Using types from game/types.ts |
| /shared/src/types/storage/metadata.ts | ✅ Done | Updated for immutability |
| /shared/src/types/network/events.ts | ✅ Done | Migrated from events.new.ts |

### Pending Migration

1. WebSocket Layer (Priority: High)
   - ✅ gameHandlers.new.ts → gameHandlers.ts (completed)
   - ✅ consolidated in GameServer.events.ts
   - [ ] replayHandlers.ts

2. Client Types (Priority: High)
   - 🔄 types/game.d.ts (ready for review)
     * Created new version with updated imports
     * Replaced Player with PlayerNumber
     * Added readonly properties
     * Renamed interfaces for consistency
     * Updated operation names
   - [ ] types/animations.ts (next in queue)
     * Needs enum to union type conversion
     * Update imports from base/primitives
     * Update Player to PlayerNumber
   - [ ] types/errors.new.ts
     * New version exists with improvements
     * Needs merging with errors.ts
     * Already uses new type system
   - [ ] types/gameManager.ts
     * Needs import path updates
     * Replace Player with PlayerNumber
     * Use new error types

3. Client Hooks (Priority: Medium)
   - [ ] useMultiplayerGameNew.ts
   - [ ] useGame.ts
   - [ ] useMultiplayerGame.ts
   - [ ] useReplay.ts
   - [ ] useGameHistory.ts

4. Client Services (Priority: Medium)
   - [ ] GameStateManager.ts
   - [ ] ActionQueue.new.ts
   - [ ] ActionQueue.ts
   - [ ] ai/index.ts

## Next Actions

1. Complete Integration
   - [ ] Update remaining handlers
   - [ ] Finish WebSocket integration
   - [ ] Update client components
   - [ ] Verify type consistency

2. Testing
   - [ ] Create test plan
   - [ ] Implement basic tests
   - [ ] Add integration tests
   - [ ] Verify type guards

3. Documentation
   - [ ] Update API docs
   - [ ] Add usage examples
   - [ ] Complete migration guides

## Recent Breaking Changes (2025-01-14)

1. WebSocket Layer
   - Removed old gameHandlers.ts and consolidated in GameServer.events.ts
   - Event validation added for all WebSocket events
   - Improved error handling with type-safe codes

2. Game Types
   - Renamed operation properties:
     * placeOperationsLeft → placeOperations
     * replaceOperationsLeft → replaceOperations
   - Added readonly modifiers to interface properties
   - Replaced Player enum with PlayerNumber type

3. Imports
   - Updated import paths to use new type system:
     * @ctor-game/shared/types/base/* → @ctor-game/shared/src/types/game/types.js
     * @ctor-game/shared/types/core/* → @ctor-game/shared/src/types/core/*.js
     * @ctor-game/shared/types/network/* → @ctor-game/shared/src/types/network/*.js

4. Interface Naming
   - Added 'I' prefix to interfaces for consistency
   - Updated related type references across the codebase

## Migration Progress (2025-01-14)

Last PR: Consolidated WebSocket handlers (gameHandlers.ts → GameServer.events.ts)
Current task: Migrating client types, starting with game.d.ts

Dependencies to watch:
1. game.d.ts updates might affect:
   - useGame hook
   - useMultiplayerGame hook
   - GameStateManager
   - Game components using turn state

Next steps:
1. Review and merge game.d.ts changes
2. Migrate animations.ts (remove enum)
3. Merge errors.ts files
4. Update gameManager.ts
   - [ ] Document type system architecture

## Notes

- When migrating files, always make backups first
- Test compilation after each file migration
- Check for circular dependencies
- Update documentation as you go
- Keep both old and new versions until testing is complete