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
   - [ ] gameHandlers.new.ts → gameHandlers.ts
   - [ ] replayHandlers.ts
   - [ ] types/events.ts

2. Client Hooks (Priority: Medium)
   - [ ] useMultiplayerGameNew.ts
   - [ ] useGame.ts
   - [ ] useMultiplayerGame.ts
   - [ ] useReplay.ts
   - [ ] useGameHistory.ts

3. Client Services (Priority: Medium)
   - [ ] GameStateManager.ts
   - [ ] ActionQueue.new.ts
   - [ ] ActionQueue.ts
   - [ ] ai/index.ts

4. Client Types (Priority: High)
   - [ ] types/game.d.ts
   - [ ] types/animations.ts
   - [ ] types/errors.new.ts
   - [ ] types/gameManager.ts

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
   - [ ] Document type system architecture

## Notes

- When migrating files, always make backups first
- Test compilation after each file migration
- Check for circular dependencies
- Update documentation as you go
- Keep both old and new versions until testing is complete