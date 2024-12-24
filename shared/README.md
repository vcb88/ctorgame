# @ctor-game/shared

Shared types and utilities for the CTORGame project.

## Overview

This package contains common TypeScript types, interfaces, and utilities used by both the client and server packages. It ensures type consistency across the entire application.

## Installation

The package is installed automatically as part of the workspace dependencies. For manual installation:

```bash
pnpm add @ctor-game/shared --workspace
```

## Usage

```typescript
// Import types
import { GameState, WebSocketEvents } from '@ctor-game/shared/types';

// Use in type definitions
interface Props {
  gameState: GameState;
}

// Use in event handlers
socket.emit(WebSocketEvents.MakeMove, { row: 0, col: 0 });
```

## Building

Build the package before using it in client/server:

```bash
pnpm build
```

## Structure

```
shared/
├── types/              # Shared TypeScript types
│   ├── index.ts       # Main types export
│   ├── game.ts        # Game-related types
│   └── events.ts      # WebSocket event types
├── package.json        # Package configuration
└── tsconfig.json      # TypeScript configuration
```

## Types

### Game Types

```typescript
interface GameState {
  board: (number | null)[][];
  gameOver: boolean;
  winner: number | null;
}

interface Move {
  row: number;
  col: number;
}
```

### WebSocket Events

```typescript
enum WebSocketEvents {
  CreateGame = 'createGame',
  JoinGame = 'joinGame',
  MakeMove = 'makeMove',
  GameCreated = 'gameCreated',
  GameStateUpdated = 'gameStateUpdated',
  // ...more events
}
```

## Development

1. Make changes in `types/` directory
2. Build package: `pnpm build`
3. Rebuild dependent packages:
   ```bash
   cd ../client && pnpm build
   cd ../server && pnpm build
   ```

## Testing

Types are tested through usage in client and server tests. Ensure both packages pass their test suites after making changes:

```bash
# From root directory
pnpm test
```

## Version Control

This package follows the main project's versioning. Update the version in `package.json` when making breaking changes.

## Contributing

1. Create feature branch
2. Make changes
3. Build and test
4. Create pull request

See main project's [CONTRIBUTING.md](../CONTRIBUTING.md) for more details.