# Import Structure Guide

## Overview

The project now uses a modular import system for shared types and utilities. Instead of importing everything from the main `@ctor-game/shared` entry point, we use specific domain imports to make dependencies more explicit and reduce the risk of circular dependencies.

## Available Import Paths

- `@ctor-game/shared`: Basic types and utilities used across all domains
- `@ctor-game/shared/base`: Basic primitive types and enums
- `@ctor-game/shared/game`: Game-related types (state, moves, players)
- `@ctor-game/shared/network`: Network communication types
- `@ctor-game/shared/storage`: Database and storage types
- `@ctor-game/shared/validation`: Validation-related types
- `@ctor-game/shared/replay`: Game replay and history types
- `@ctor-game/shared/redis`: Redis-specific types
- `@ctor-game/shared/utils`: Utility functions and helpers

## Examples

### Before
```typescript
import { 
    IGameState, 
    IPlayer, 
    IRedisGameState,
    GameMove 
} from '@ctor-game/shared';
```

### After
```typescript
// Game related types
import { IGameState, GameMove } from '@ctor-game/shared/game';
import { IPlayer } from '@ctor-game/shared/game';

// Redis specific types
import { IRedisGameState } from '@ctor-game/shared/redis';
```

## Benefits

1. More explicit dependencies
2. Better tree-shaking
3. Reduced risk of circular dependencies
4. Faster compilation when changing specific domains
5. Better code organization and maintainability

## Best Practices

1. Import only from specific domains
2. Group imports by domain
3. Add comments to clarify import groups
4. Keep related types in the same import statement
5. Use basic types from main entry point (`@ctor-game/shared`)

## Migration Guide

1. Identify the domain for each imported type
2. Group imports by domain
3. Update import paths to use specific domain imports
4. Add descriptive comments for import groups
5. Update any build configurations if necessary

## Type Locations

Here's where to find specific types:

### Game Domain (`@ctor-game/shared/game`)
- `IGameState`
- `GameMove`
- `IPlayer`
- `Player` (enum)

### Redis Domain (`@ctor-game/shared/redis`)
- `IRedisGameState`
- `IRedisPlayerSession`
- `IRedisGameRoom`
- `IRedisGameEvent`

### Network Domain (`@ctor-game/shared/network`)
- `IWebSocketEvent`
- `INetworkMessage`
- Socket events and types

### Storage Domain (`@ctor-game/shared/storage`)
- `IStorageConfig`
- Database schemas
- Storage-related types

### Base Domain (`@ctor-game/shared/base`)
- Basic types
- Common interfaces
- Primitive types

## Note on Circular Dependencies

If you encounter any circular dependencies while migrating, consider:
1. Moving shared types to the base domain
2. Splitting types into more specific domains
3. Refactoring the type structure to eliminate cycles