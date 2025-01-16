# Type System Structure

This document describes the organization of the type system in the project.

## Directory Structure

```
shared/src/types/
├── common/           # Common types used across all domains
│   ├── enums.ts     # Common enums (error types, etc.)
│   └── index.ts     # Common interfaces (Position, Error, etc.)
├── game/            # Game domain types
│   ├── enums.ts     # Game-specific enums
│   ├── types.ts     # Game-specific interfaces
│   └── index.ts     # Re-exports
├── network/         # Network communication types
│   ├── events.ts    # Event types and validators
│   ├── websocket.ts # WebSocket types
│   └── index.ts     # Re-exports
└── storage/         # Data storage types
    ├── redis.ts     # Redis-specific types
    ├── mongo.ts     # MongoDB-specific types
    └── index.ts     # Re-exports
```

## Domain Organization

### Common Types (common/)
- Basic geometric types (Position, Size)
- Error types and enums
- Common utility types (Timestamp, Identifiable)

### Game Domain (game/)
- Game state and board types
- Player and move types
- Game-specific enums
- Action types

### Network Domain (network/)
- Event types for communication
- WebSocket message types
- Network error types

### Storage Domain (storage/)
- Database entity types
- Cache types
- Storage-specific configurations

## Type Naming Conventions

- Enums: Suffix with 'Enum' (e.g., GameStatusEnum)
- Interfaces: Clear, descriptive names without 'I' prefix
- No type aliases except for simple unions
- Clear, domain-specific prefixes

## Type Design Principles

1. Flat Structure
   - Avoid deep nesting
   - Use composition over inheritance
   - Keep types simple and focused

2. Immutability
   - Use readonly for all properties
   - Use ReadonlyArray where appropriate
   - Prevent runtime modifications

3. Validation
   - Co-locate validation with types
   - Use simple validation rules
   - Validate at domain boundaries

4. Documentation
   - Document all types
   - Include usage examples
   - Explain domain context

## Examples

Good type definition:
```typescript
export interface GameState {
    readonly id: string;
    readonly status: GameStatusEnum;
    readonly board: readonly (readonly CellValueEnum[])[];
    readonly currentPlayer: PlayerNumberEnum;
    readonly players: readonly Player[];
    readonly scores: readonly [number, number];
    readonly lastMoveTimestamp: number;
}
```

Bad type definition:
```typescript
// Avoid this style
export type IGameState = {
    id: string;
    status: 'waiting' | 'playing' | 'finished';
    board: number[][];
    currentPlayer: 1 | 2;
    players: IPlayer[];
    scores: number[];
    lastMoveTimestamp: number;
} & IBaseState;
```