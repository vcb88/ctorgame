# Type System Documentation

## Core Types

These are the fundamental types used throughout the application. They should be defined in `shared/src/types/base/primitives.ts` and imported where needed.

### Basic Types
- `type Size = [number, number]` - Represents width and height as a tuple
- `type Position = [number, number]` - Represents x, y coordinates as a tuple
- `type UUID = string` - Unique identifier
- `type Timestamp = number` - Unix timestamp in milliseconds

### Game-Specific Types
- `type CellValue = 0 | 1 | 2` - Cell state (0 = empty, 1 = player1, 2 = player2)
- `type PlayerNumber = 1 | 2` - Player identifier
- `type Scores = [number, number]` - Game scores as [player1Score, player2Score]

### Status and Phase Types
- `type GameStatus = 'waiting' | 'active' | 'finished'` - Current game status
- `type GamePhase = 'setup' | 'play' | 'end'` - Game phase
- `type ConnectionStatus = 'connected' | 'disconnected' | 'error'` - Connection state

### Operation Types
- `type MoveType = 'place' | 'replace' | 'skip'` - Available move types
- `type OperationType = MoveType` - Alias for MoveType

### Common Types
- `type ValidationResult = { valid: boolean; message?: string }` - Basic validation result
- `type Collection<T> = Array<T>` - Array type wrapper
- `type WithMetadata<T> = { data: T; timestamp: Timestamp; version?: string }` - Metadata wrapper

## Type System Principles

1. **Single Source of Truth**
   - Each type should be defined exactly once
   - Use the types defined in base/primitives.ts
   - Don't create interface variants of primitive types

2. **Type Composition over Inheritance**
   - Build complex types through composition
   - Use intersection types (&) for combining
   - Avoid deep inheritance hierarchies

3. **Simplicity First**
   - Use simple tuple types where appropriate ([number, number] vs {x: number, y: number})
   - Prefer union types for finite sets of values
   - Avoid unnecessary type wrapping

4. **Naming Conventions**
   - No 'I' prefix for interfaces
   - Use clear, domain-specific names
   - Be consistent with similar types

5. **Import Organization**
   - Import base types directly from primitives
   - Don't create local variants of existing types
   - Use named imports for clarity

## Type Location Guidelines

1. **Base Types** (`shared/src/types/base/primitives.ts`)
   - Fundamental type definitions
   - Primitive type aliases
   - Common utility types

2. **Domain Types** (`shared/src/types/<domain>/types.ts`)
   - Domain-specific interfaces
   - Complex type compositions
   - Extended type definitions

3. **Enums** (`shared/src/types/<domain>/enums.ts`)
   - All enum definitions
   - String literal unions
   - Constant type definitions

## Examples

Good:
```typescript
import { Size, Position, CellValue } from '../base/primitives';

interface Board {
    size: Size;
    cells: CellValue[][];
}

interface Move {
    type: MoveType;
    position: Position;
}
```

Bad:
```typescript
// Don't do this!
interface Size {
    width: number;
    height: number;
}

type IPosition = {
    x: number;
    y: number;
}

type CellValueType = PlayerNumber | null; // Don't create variants
```

## Migration Notes

When working with types:
1. Check primitives.ts first for existing types
2. If type doesn't exist, add it to primitives.ts
3. Update all references to use the centralized type
4. Remove duplicate definitions