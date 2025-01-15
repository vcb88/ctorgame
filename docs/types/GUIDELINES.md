# Type System Guidelines

## Core Principles

In our MVP-focused development, we follow these principles for the type system:

1. **Simplicity First**
   - Use simple TypeScript types instead of interfaces where possible
   - Avoid complex type hierarchies and inheritance
   - Keep type definitions close to their usage

2. **Union Types Over Enums**
   ```typescript
   // ❌ Don't use enums
   enum GameStatus {
       ACTIVE = 'active',
       FINISHED = 'finished'
   }

   // ✅ Use union types instead
   type GameStatus = 'active' | 'finished';
   ```

3. **Single Source of Truth**
   - Keep core types in core.ts
   - Avoid duplicating type definitions
   - Use type exports/imports instead of extending/implementing

4. **Minimal Type Definitions**
   ```typescript
   // ❌ Don't overcomplicate with interfaces and inheritance
   interface IBaseError {
       code: string;
   }
   interface IExtendedError extends IBaseError {
       message: string;
   }

   // ✅ Use simple type definitions
   type GameError = {
       code: string;
       message: string;
   };
   ```

5. **Type Composition Over Inheritance**
   ```typescript
   // ❌ Don't use interface inheritance
   interface IBaseGameState {
       status: GameStatus;
   }
   interface IGameState extends IBaseGameState {
       players: Player[];
   }

   // ✅ Use type intersection if needed
   type BaseGameState = {
       status: GameStatus;
   };
   type GameState = BaseGameState & {
       players: Player[];
   };
   ```

## Examples of Good Type Usage

### Simple Value Types
```typescript
type PlayerNumber = 1 | 2;
type GamePhase = 'setup' | 'play' | 'end';
type Position = [number, number];
```

### Object Types
```typescript
type Player = {
    id: string;
    num: PlayerNumber;
    connected: boolean;
};

type GameMove = {
    type: MoveType;
    pos?: Position;
};
```

### Error Types
```typescript
type ErrorCode = 
    | 'CONNECTION_ERROR'
    | 'OPERATION_FAILED'
    | 'GAME_NOT_FOUND';

type GameError = {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
};
```

## Common Mistakes to Avoid

1. ❌ Creating unnecessary type hierarchies
2. ❌ Using enums instead of union types
3. ❌ Creating interfaces without clear need
4. ❌ Duplicating type definitions
5. ❌ Over-engineering type system with generics or complex types

## When to Update Types

1. When adding new game features that require new data structures
2. When modifying existing game mechanics
3. When fixing bugs related to type mismatches
4. When improving type safety in critical parts of the code

Remember: Keep types as simple as possible while maintaining type safety. Add complexity only when it provides clear benefits.