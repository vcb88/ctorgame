# Type System Analysis

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
   - Uses geometry/types.js for core types
   - Added position and size validation
   - Added type guards for runtime checks
   - Added board position utilities

2. Created game.new.ts:
   - Uses game/types.js for game types
   - Comprehensive game state validation
   - Detailed error reporting
   - Type guards for all game types
   - Clear separation of concerns

Key improvements:
- No inheritance, pure composition
- Strict type checking
- Runtime validation
- Clear error messages
- Comprehensive documentation

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