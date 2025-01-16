# TypeScript Type System Principles

This document outlines the principles we follow for the type system in our project to maintain simplicity and predictability.

## Core Principles

### 1. Type Definition Unification
- Use interfaces as the primary way to define types
- Avoid duplicating types with I- prefix and without it
- Avoid type aliases where interfaces can be used
- Keep type definitions simple and straightforward

### 2. Type System Simplification
- Prefer composition over inheritance
- Avoid type redefinition during export (no "export type X as Y")
- Minimize the use of generic types
- Prefer enums or string literals over union types where possible

### 3. Shared Type Definitions
- Define all fields needed by the server in shared types
- Avoid extending types in the server
- Avoid redefining types in the server
- Keep shared types as the single source of truth

### 4. Data Structure Simplification
- Minimize object nesting
- Use flat data structures where possible
- Avoid optional fields when possible
- Keep data structures predictable and straightforward

### 5. Module Organization
- Keep related types in one file
- Minimize re-exports
- Clear domain separation (game, network, storage, etc.)
- Each module should have a clear, single responsibility

### 6. Predictability Improvements
- Use readonly only when immutability is required
- Avoid null/undefined unions, use explicit values
- Prefer primitive types over complex objects
- Keep type definitions explicit and clear

### 7. Documentation and Naming
- Consistent naming conventions (e.g., all enums end with 'Enum')
- Document each type with usage examples
- Group related types together
- Clear and meaningful type names

### 8. Validation
- Keep validators simple and straightforward
- Co-locate validation with type definitions
- Use simple checks instead of complex conditions
- Make validation rules obvious and explicit

### 9. Error Handling
- Unified error structure
- Use enums for error codes
- Minimal error hierarchy
- Clear error categorization

### 10. Versioning
- Maintain backward compatibility for type changes
- Add new fields only at the end of interfaces
- Support single stable API version
- Document breaking changes clearly

## Implementation Guidelines

1. When creating new types:
   - Start with an interface unless you absolutely need a type alias
   - Keep the structure flat and simple
   - Add all fields that might be needed by any part of the system

2. When modifying existing types:
   - Avoid breaking changes
   - Don't create type hierarchies
   - Keep modifications backward compatible

3. When using types:
   - Import types directly from their source
   - Avoid type assertions
   - Use explicit type annotations

4. When organizing types:
   - Group by domain
   - Keep related types close
   - Maintain clear boundaries between domains

## Examples

Good:
```typescript
interface GameState {
    board: number[][];
    currentPlayer: number;
    status: GameStatusEnum;
}

enum GameStatusEnum {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished'
}
```

Avoid:
```typescript
// Avoid inheritance
interface BaseState {
    status: string;
}

interface GameState extends BaseState {
    board: number[][];
    currentPlayer: number;
}

// Avoid type aliases with union types
type GameStatus = 'waiting' | 'playing' | 'finished';
```

## Migration Strategy

When migrating existing code to follow these principles:
1. Start with shared types
2. Move from bottom to top in the dependency tree
3. Update one module at a time
4. Maintain backward compatibility
5. Document all changes