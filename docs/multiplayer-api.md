# Multiplayer Game API Documentation

## Overview
This document describes the API endpoints and data formats for the multiplayer game functionality.

## Game Room

### Data Structure
```typescript
interface GameRoom {
    id: string;          // Unique room identifier
    code: string;        // 4-digit connection code
    players: {
        first?: string;  // First player ID
        second?: string; // Second player ID
    };
    state: GameState;    // Current game state
    status: 'waiting' | 'playing' | 'finished';
    lastMove: number;    // Last move timestamp
    createdAt: number;   // Room creation timestamp
}
```

### Limitations
- Maximum concurrent games: 50
- Room lifetime: 30 minutes of inactivity
- Connection code format: 4 digits (0000-9999)

## API Endpoints

### Create Game
Creates a new game room and returns the room details.

```
POST /api/games/create

Request:
{
    "playerId": string  // ID of the player creating the room
}

Response:
{
    "roomId": string,   // Unique room ID
    "code": string,     // 4-digit connection code
    "status": "waiting",
    "createdAt": number // Timestamp
}

Errors:
- 429: Too Many Games (over 50 active games)
```

### Join Game
Join an existing game using the connection code.

```
POST /api/games/join

Request:
{
    "code": string,     // 4-digit room code
    "playerId": string  // ID of the joining player
}

Response:
{
    "roomId": string,   // Room ID
    "status": "playing",
    "playerType": "first" | "second", // Player's role
    "state": GameState  // Current game state
}

Errors:
- 404: Room Not Found
- 409: Room Full
- 410: Room Expired
```

### Get Game State
Get current state of the game.

```
GET /api/games/{roomId}

Response:
{
    "status": "waiting" | "playing" | "finished",
    "state": GameState,
    "currentPlayer": "first" | "second",
    "players": {
        "first": string,
        "second": string
    }
}

Errors:
- 404: Room Not Found
```

### Make Move
Make a move in the game.

```
POST /api/games/{roomId}/move

Request:
{
    "playerId": string,
    "x": number,
    "y": number
}

Response:
{
    "success": boolean,
    "state": GameState,
    "currentPlayer": "first" | "second"
}

Errors:
- 404: Room Not Found
- 403: Not Your Turn
- 400: Invalid Move
```

### Game State Updates
Game state updates are delivered via WebSocket connection.

```typescript
interface GameStateUpdate {
    type: "state_update";
    roomId: string;
    state: GameState;
    currentPlayer: "first" | "second";
    status: "playing" | "finished";
    winner?: "first" | "second";
}
```

## Game History Format
After game completion, the game history is saved in the following format:

```typescript
interface GameHistory {
    roomId: string;
    code: string;
    players: {
        first: string;
        second: string;
    };
    startedAt: number;
    finishedAt: number;
    moves: Array<{
        player: "first" | "second";
        x: number;
        y: number;
        timestamp: number;
    }>;
    winner?: "first" | "second";
    finalState: GameState;
}
```