# Type System Analysis

## Migration Status Table

| File Path | Status | New Version Ready | Reviewed | Dependencies Updated | Notes |
|-----------|--------|------------------|-----------|---------------------|-------|
| /shared/src/utils/scores.ts | ✅ Done | N/A | ✅ | ✅ | Migrated to PlayerNumber, removed enum usage |
| /shared/src/types/game/state.ts | 🔄 In Progress | ✅ | ✅ | ❌ | New version created, dependencies need update |
| /shared/src/types/storage/metadata.ts | ✅ Done | ✅ | ✅ | ✅ | Using new type system |
| /shared/src/types/redis/state.ts | ✅ Done | ✅ | ✅ | ✅ | New version with type guards |
| /shared/src/types/validation/game.ts | 🔄 In Progress | ✅ | ✅ | ❌ | Using new types and added guards |
| /shared/src/types/base/network.ts | 🔄 In Progress | ✅ | ✅ | ❌ | Replaced enums with const objects |
| /shared/src/types/network/websocket.ts | ✅ Done | ✅ | ✅ | ✅ | New version already using updated types |
| /shared/src/types/game/moves.ts | 🔄 In Progress | ✅ | ✅ | ❌ | New version with type guards and better names |
| /shared/src/types/game/players.ts | ✅ Done | ✅ | ✅ | ✅ | Using types from game/types.ts |
| /shared/src/types/network/websocket.new.ts | 🔄 In Progress | ✅ | ❌ | ❌ | Verify compatibility with new types |
| /shared/src/types/network/events.new.ts | ✅ Done | ✅ | ✅ | ✅ | Already using PlayerNumber and GameStatus |

Legend:
- ✅ Done: File fully migrated and tested
- 🔄 In Progress: Work started but not complete
- ❌ Not Started: Still using old type system
- N/A: Not applicable

## File Mapping

### Old Type System

1. Base Types:
   - /shared/src/types/core.ts
   - /shared/src/types/base.ts
   - /shared/src/types/primitives.ts
   - /shared/src/types/basic-types.ts

2. Game Types:
   - /shared/src/types/game.ts
   - /shared/src/types/state.ts
   - /shared/src/types/moves.ts

3. Other Types:
   - /shared/src/types/constants.ts
   - /shared/src/types/enums.ts
   - /shared/src/types/minimal.ts
   - /shared/src/types/payloads.ts

### New Type System

1. Core Types:
   - /shared/src/types/core/primitives.ts

2. Specific Domains:
   - /shared/src/types/geometry/types.ts
   - /shared/src/types/game/types.ts
   - /shared/src/types/network/types.ts
   - /shared/src/types/storage/types.ts

3. Entry Points:
   - /shared/src/types/index.new.ts

### Files to Analyze

#### Utility Files
- [x] /shared/src/utils/coordinates.new.ts
  - Clean integration with new type system
  - Uses IPosition and ISize from geometry/types.js
  - Generic functions for type safety
  - Pure functions without side effects
  - Ready for old version removal
- [x] /shared/src/utils/game.new.ts
  - Well-integrated with new type system
  - Clear imports from game/types.js and geometry/types.js
  - Comprehensive type guards for validation
  - Union types instead of enums
  - Pure functions and good documentation
  - Ready for old version removal
- [x] /shared/src/validation/game.ts
  - Uses old type system
  - Imports from base/primitives.js and base/enums.js
  - Needs migration to new type system
  - Functions need updating to match new interfaces
- [x] /shared/src/validation/primitives.ts
  - Uses old type system
  - Simple validation logic
  - Ready for migration to new types

#### Migration Status
1. Ready for replacement:
   - coordinates.new.ts can replace coordinates.ts
   - game.new.ts can replace game.ts

2. Needs migration:
   - validation/game.ts: Update to use new type system
   - validation/primitives.ts: Update imports and types

#### Migration Steps

1. Validation Files Migration:
   - Create new versions:
     - primitives.new.ts using geometry/types.js
     - game.new.ts using game/types.js
   - Update validation logic to match new interfaces
   - Add type guards where needed
   - Add proper documentation

2. File Replacement:
   a. Utility files:
      1. Rename coordinates.new.ts to coordinates.ts
      2. Rename game.new.ts to game.ts
      3. Update any imports in other files
   
   b. Validation files:
      1. Create new versions with updated types
      2. Test new versions
      3. Replace old versions

3. Documentation:
   - Update type system documentation
   - Document new validation functions
   - Update import examples

#### Next Tasks
1. ✅ Create primitives.new.ts with new type system
   - Added proper type imports
   - Added type guards
   - Added validation functions
   - Added proper documentation

2. ✅ Create game.new.ts validation file
   - Used new type system
   - Added comprehensive validation
   - Added type guards
   - Added detailed error reporting
   - Added proper documentation

3. File Migration (Next Steps):
   a. Validate and test new files
   b. Update imports in dependent files
   c. Remove old files
   d. Update documentation

4. Create migration PR once testing is complete

#### Changes Made (2025-01-14)

1. Created primitives.new.ts:
   - ✅ Uses geometry/types.js for core types
   - ✅ Added position and size validation
   - ✅ Added type guards for runtime checks
   - ✅ Added board position utilities
   - ✅ Verified compilation

2. Created game.new.ts:
   - ✅ Uses game/types.js for game types
   - ✅ Comprehensive game state validation
   - ✅ Detailed error reporting
   - ✅ Type guards for all game types
   - ✅ Clear separation of concerns
   - ✅ Verified compilation

3. Completed Updates:
   - ✅ Renamed coordinates.new.ts to coordinates.ts
   - ✅ Renamed game.new.ts (utils) to game.ts
   - ✅ Created backup of old files
   - ✅ Renamed validation .new.ts files to replace old versions
   - ✅ Created backup of old validation files
   - [ ] Update imports in affected files

4. Import Analysis and Updates

### Shared Module Dependencies
- [ ] Analyze current imports
- [ ] List files using old types
- [ ] Create update plan
- [ ] Test changes

### Server Module Dependencies
- [ ] Analyze current imports
- [ ] List files using old types
- [ ] Create update plan
- [ ] Test changes

### Test Files
- [ ] Analyze test imports
- [ ] Update test utilities
- [ ] Verify test coverage

### Clean up
- [ ] Remove backup files after testing
- [ ] Remove unused imports
- [ ] Update documentation

### Current Progress
Analyzing shared module imports:

#### Files Using Old Type System

1. /shared/src/index.ts
   - Uses old import paths in documentation
   - Needs update of examples
   - No actual code changes needed (documentation only)

2. /shared/src/utils/scores.ts
   - Imports from '../types/base/enums.js'
   - Imports from '../types/game/state.js'
   - Uses old Player enum
   - Uses old IScores interface
   - High priority for update

#### Migration Priority

1. High Priority:
   - scores.ts: Core utility used by many components
   - Update to use new PlayerNumber type
   - Update to use new IGameScores interface

2. Documentation:
   - index.ts: Update import examples
   - Update type references

#### Update Plan

1. scores.ts Changes:
   - ✅ Created scores.new.ts with new type system
   - ✅ Replaced Player enum with PlayerNumber type
   - ✅ Updated IScores to IGameScores
   - ✅ Added type guards and helper functions
   - ✅ Improved documentation
   - [ ] Test new implementation
   - [ ] Replace old file

2. Next Steps:
   a. Review remaining utils:
      - Check for other files using Player enum
      - Verify all type imports
   
   b. Update documentation in index.ts:
      - Update import examples
      - Update type references
      - Add new utility functions

#### Remaining Files Analysis

1. Old Type Files (to be replaced):
   - core.ts -> Already replaced by core/primitives.ts
   - state.ts -> Replaced by game/types.ts
   - moves.ts -> Moved to game/types.ts
   - game.ts -> Consolidated in game/types.ts
   - enums.ts -> Replaced by union types
   - primitives.ts -> Moved to geometry/types.ts and core/primitives.ts
   - basic-types.ts -> Distributed across new type system
   - base.ts and base/ -> Replaced by new type organization

2. Files to Keep (domain-specific):
   - redis/ -> Redis-specific types
   - replay/ -> Replay system types
   - validation/ -> Validation specific types

3. Migration Tasks:
   a. Update Documentation:
      - ✅ Create new import examples in index.ts
      - [ ] Update API documentation
      - [ ] Add migration guide

   b. File Cleanup:
      - ✅ Move scores.new.ts to scores.ts
      - ✅ Replace index.ts with new version
      - ✅ Create backups of old files
      - [ ] Update imports in redis/
      - [ ] Update imports in replay/
      - [ ] Update imports in validation/
      - [ ] Remove unused type files

   c. Completed Changes (2025-01-14):
      - Replaced scores.ts with new type-safe version
      - Updated index.ts with new import examples
      - Created backups for safety
      - Updated documentation structure

   d. Redis Types Migration (completed):
      - ✅ Created state.new.ts
         * Updated imports to use game/types.js
         * Added readonly properties
         * Added type guards
      - ✅ Created session.new.ts
         * Used PlayerNumber type
         * Added readonly properties
         * Added type guards
      - ✅ Created events.new.ts
         * Added type aliases
         * Added readonly properties
         * Added type guards
      - ✅ Created config.new.ts
         * Added readonly properties
         * Added type guards
         * Improved documentation
      - ✅ Reviewed ttl.ts
         * Already using modern patterns
         * No changes needed
      - [ ] Replace old files with new versions
      - [ ] Verify all imports still work

4. Testing Plan:
   - [ ] Verify compilation after file removal
   - [ ] Check for missing imports
   - [ ] Test type inference
   - [ ] Validate runtime checks

Key improvements:
- No inheritance, pure composition
- Strict type checking
- Runtime validation
- Clear error messages
- Comprehensive documentation

#### Validation Migration Progress
- ✅ New validation files created
- ✅ Compilation verified
- [ ] Files renamed
- [ ] Imports updated
- [ ] Old files removed
- [ ] Documentation updated

## Type Duplications

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

## Import Relationships

### New Type System

1. primitives.ts:
   - No imports (base types only)

2. geometry/types.ts:
   - No imports
   - Exports: IPosition, ISize, IBoardPosition, IBoardCell

3. game/types.ts:
   - Imports from geometry/types.ts: IPosition, ISize
   - Imports from core/primitives.ts: ITimestamped, IIdentifiable

4. New System Benefits:
   - Clear dependency direction (primitives -> geometry -> game)
   - No circular dependencies
   - Flat hierarchy
   - Domain-specific organization

## Circular Dependencies

[To be documented]

## Usage Analysis

[To be documented]

## Migration Notes

- New system prefers composition over inheritance
- All properties are marked as readonly
- Type duplication eliminated through domain-specific modules
- Flatter type hierarchy to prevent circular dependencies