# Import Structure Guide

## Overview

The project uses direct imports from specific shared module paths. We explicitly avoid re-exports to maintain clear dependency paths and prevent potential issues with enums and type exports.

### Direct Imports Policy

We use direct imports from @ctor-game/shared paths for several reasons:
1. Clear and explicit dependencies
2. Proper handling of both type and value imports (especially for enums)
3. Better TypeScript module resolution
4. Easier debugging and dependency tracking

Example of correct imports:
```typescript
// Types only
import type { IGameState, IGameMove } from '@ctor-game/shared/types/game/types.js';

// Enums (need both type and value)
import { ErrorCode, ErrorCategory } from '@ctor-game/shared/types/network/errors.js';

// Utilities
import { validateGameEvent } from '@ctor-game/shared/validation/game.js';
```

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

### Before (pre-NodeNext)
```typescript
import { IGameState, GameMove } from '@ctor-game/shared/game';
```

### After (with NodeNext)
```typescript
// Game related types
import { IGameState, GameMove } from '@ctor-game/shared/game.js';

// Redis specific types
import { IRedisGameState } from '@ctor-game/shared/redis.js';

// Type-only imports
import type { IPlayer } from '@ctor-game/shared/game.js';
```

## Benefits

1. More explicit dependencies
2. Better tree-shaking
3. Reduced risk of circular dependencies
4. Faster compilation when changing specific domains
5. Better code organization and maintainability

## Best Practices

1. Always include .js extension for imports in NodeNext mode
2. Use type-only imports when possible
3. Group imports by domain and add comments
4. Keep related types in the same import statement
5. Place runtime imports before type imports

## NodeNext Module Resolution

The project uses TypeScript's NodeNext module resolution, which requires:

1. Always including the .js extension in imports
2. Using ESM-style imports
3. Separating runtime and type imports when possible

### Common Patterns

```typescript
// Runtime imports first
import { GameStatus, validateMove } from '@ctor-game/shared/game.js';
import { EventCache } from '@ctor-game/shared/cache.js';

// Type imports second
import type { IGameState } from '@ctor-game/shared/game.js';
import type { IEventConfig } from '@ctor-game/shared/cache.js';
```

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