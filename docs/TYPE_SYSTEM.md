# Type System

## Core Types

### GameState
The main game state type is defined in `shared/src/types/state/game.ts`. It contains all possible fields that might be needed to represent game state. Different parts of the application may use only the fields they need, without creating specialized subtypes.

The single source of truth for GameState helps to:
- Maintain consistency across the application
- Avoid type duplications
- Make changes to the state structure more manageable
- Keep the type system simpler Documentation

## Overview

This document describes the core principles and practices for the type system in our MVP-focused development. The key goals are:
- Keep the type system simple and maintainable
- Have a single source of truth for shared types
- Minimize type complexity and inheritance
- Support essential functionality without overengineering

## Core Principles

1. **Single Source of Truth**
   - All shared types must be defined in core.ts
   - Import types from core.ts instead of creating local variants
   - Only domain-specific types should live outside core.ts

2. **Simplicity First**
   - Use simple TypeScript types instead of interfaces where possible
   - Keep type definitions minimal and close to their usage
   - Use tuple types where appropriate ([number, number] vs {x: number, y: number})
   - Avoid adding complexity without clear necessity

3. **Union Types Over Enums**
   ```typescript
   // ❌ Don't use enums
   enum GameStatus {
       ACTIVE = 'active',
       FINISHED = 'finished'
   }

   // ✅ Use union types instead
   type GameStatus = 'active' | 'finished';
   ```

4. **Minimal Type Inheritance**
   - Avoid creating base/abstract types without clear necessity
   - Prefer composition over inheritance
   - Keep type hierarchies flat and simple
   - Use intersection types (&) when needed instead of extends

## Core Types (core.ts)

These fundamental types serve as the single source of truth:

### Basic Types
- `type Size = [number, number]` - Represents width and height
- `type Position = [number, number]` - Represents x, y coordinates
- `type UUID = string` - Unique identifier
- `type Timestamp = number` - Unix timestamp in milliseconds

### Game Types
- `type CellValue = 0 | 1 | 2` - Cell state (0 = empty, 1 = player1, 2 = player2)
- `type PlayerNumber = 1 | 2` - Player identifier
- `type GameStatus = 'waiting' | 'active' | 'finished'` - Game status
- `type MoveType = 'place' | 'replace' | 'skip'` - Available move types

## Type Usage Guidelines

1. **Type Location**
   - Core/shared types go in core.ts
   - Domain-specific types stay close to their domain
   - No duplicate type definitions

2. **Type Definition Style**
   ```typescript
   // ✅ Preferred way
   type GameError = {
       code: string;
       message: string;
   };

   type ErrorCode = 
       | 'CONNECTION_ERROR'
       | 'OPERATION_FAILED'
       | 'GAME_NOT_FOUND';

   // ❌ Avoid this
   interface IGameError {
       readonly code: string;
       readonly message: string;
   }

   enum ErrorCode {
       CONNECTION_ERROR = 'CONNECTION_ERROR',
       OPERATION_FAILED = 'OPERATION_FAILED'
   }
   ```

3. **Type Composition**
   ```typescript
   // ✅ Use type intersection when needed
   type BaseState = {
       status: GameStatus;
   };

   type GameState = BaseState & {
       players: Player[];
   };
   ```

## Common Mistakes

1. **Creating Unnecessary Interfaces**
   ```typescript
   // ❌ Don't do this
   interface IPosition {
       x: number;
       y: number;
   }
   ```

2. **Duplicating Core Types**
   ```typescript
   // ❌ Don't create variants of core types
   type PlayerType = 1 | 2; // Already defined as PlayerNumber in core.ts
   ```

3. **Deep Type Hierarchies**
   ```typescript
   // ❌ Avoid inheritance chains
   interface BaseEntity {
       id: string;
   }
   interface BaseGameEntity extends BaseEntity {
       timestamp: number;
   }
   interface GameMove extends BaseGameEntity {
       type: MoveType;
   }
   ```

## When to Update Types

1. When adding new game features that require new data structures
2. When modifying existing game mechanics
3. When fixing bugs related to type mismatches

## Type Migration Process

1. Always check core.ts first for existing types
2. If a type doesn't exist in core.ts and is needed in multiple places, add it there
3. Keep domain-specific types close to their domain unless they become widely used

## MVPs and Types

For MVP development:
- Keep types as simple as possible while maintaining type safety
- Add complexity only when it provides clear benefits
- Focus on essential type definitions that support core functionality
- Avoid premature type system optimization