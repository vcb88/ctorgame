# WebSocket API Documentation (v2)

## Overview

This document describes the WebSocket events and protocols used in the CTORGame application.

## System Limitations
- Maximum concurrent games: 50
- Room lifetime: 30 minutes of inactivity
- Connection code format: 4 digits (0000-9999)

## Connection Setup

### Client Connection
```typescript
import { io } from 'socket.io-client';

const socket = io('ws://server-url', {
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
```

## Game Events

### Event Types
```typescript
export enum WebSocketEvents {
  // Client -> Server
  CREATE_GAME = 'createGame',
  JOIN_GAME = 'joinGame',
  MAKE_MOVE = 'makeMove',
  LEAVE_GAME = 'leaveGame',
  RECONNECT = 'reconnect',

  // Server -> Client
  GAME_CREATED = 'gameCreated',
  GAME_JOINED = 'gameJoined',
  GAME_STARTED = 'gameStarted',
  GAME_UPDATED = 'gameStateUpdated',
  GAME_OVER = 'gameOver',
  PLAYER_DISCONNECTED = 'playerDisconnected',
  ERROR = 'error',
  GAME_EXPIRED = 'gameExpired'
}
```

### Event Payloads

#### Create Game
```typescript
// Client -> Server
socket.emit(WebSocketEvents.CREATE_GAME);

// Server -> Client
interface GameCreatedPayload {
  gameId: string;      // Internal game ID
  code: string;        // 4-digit connection code
  playerNumber: 1 | 2; // 1 for first player, 2 for second
  expiresAt: number;   // Timestamp when game expires
}
```

#### Join Game
```typescript
// Client -> Server
interface JoinGamePayload {
  code: string;        // 4-digit connection code
}

// Server -> Client
interface GameJoinedPayload {
  gameId: string;
  playerNumber: 1 | 2;
  gameState: GameState;
  expiresAt: number;   // Timestamp when game expires
}
```

#### Make Move
```typescript
// Client -> Server
interface MakeMovePayload {
  gameId: string;
  x: number;
  y: number;
  playerNumber: 1 | 2;
}

// Server -> Client
interface GameUpdatedPayload {
  gameState: GameState;
  lastMove: {
    playerNumber: 1 | 2;
    x: number;
    y: number;
    timestamp: number;
  };
  expiresAt: number;   // Updated expiration time
}
```

## Game State Types

### Game State
```typescript
interface GameState {
  board: number[][];   // Game board state
  currentPlayer: 1 | 2;
  opsRemaining: number;// Operations remaining in current turn
  status: GameStatus;
  lastMoveAt: number;  // Last activity timestamp
}

type GameStatus = 'waiting' | 'playing' | 'finished';
```

### Room State
```typescript
interface GameRoom {
  id: string;          // Internal game ID
  code: string;        // 4-digit connection code
  players: {
    first?: string;    // First player connection ID
    second?: string;   // Second player connection ID
  };
  state: GameState;
  createdAt: number;   // Room creation timestamp
  lastActivityAt: number; // Last activity timestamp
  expiresAt: number;   // Room expiration timestamp
}
```

## Error Handling

### Error Types
```typescript
enum GameError {
  INVALID_MOVE = 'INVALID_MOVE',
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  GAME_FULL = 'GAME_FULL',
  NOT_YOUR_TURN = 'NOT_YOUR_TURN',
  GAME_OVER = 'GAME_OVER',
  INVALID_CODE = 'INVALID_CODE',
  GAME_EXPIRED = 'GAME_EXPIRED',
  TOO_MANY_GAMES = 'TOO_MANY_GAMES'
}

interface ErrorPayload {
  code: GameError;
  message: string;
  details?: any;
}
```

## Example Flows

### Game Creation Flow
```mermaid
sequenceDiagram
    participant Client
    participant Server
    
    Client->>Server: CREATE_GAME
    alt Too Many Games
        Server-->>Client: ERROR {code: TOO_MANY_GAMES}
    else Success
        Server-->>Client: GAME_CREATED
        Note over Client,Server: {gameId: "123", code: "1234", playerNumber: 1}
    end
```

### Game Join Flow with Code
```mermaid
sequenceDiagram
    participant Player1
    participant Server
    participant Player2
    
    Player2->>Server: JOIN_GAME {code: "1234"}
    alt Game Not Found
        Server-->>Player2: ERROR {code: INVALID_CODE}
    else Game Expired
        Server-->>Player2: ERROR {code: GAME_EXPIRED}
    else Success
        Server-->>Player2: GAME_JOINED
        Server-->>Player1: GAME_STARTED
        Note over Player1,Player2: Both players receive initial game state
    end
```

### Game Expiration Flow
```mermaid
sequenceDiagram
    participant Player1
    participant Server
    participant Player2
    
    Note over Player1,Server,Player2: No activity for 30 minutes
    Server-->>Player1: GAME_EXPIRED
    Server-->>Player2: GAME_EXPIRED
    Note over Player1,Server,Player2: Players must create new game
```

### Reconnection Flow
```mermaid
sequenceDiagram
    participant Player
    participant Server
    participant OtherPlayer
    
    Note over Player,Server: Player disconnects
    Server-->>OtherPlayer: PLAYER_DISCONNECTED
    
    alt Within 5 minutes
        Player->>Server: RECONNECT {gameId}
        alt Valid Session
            Server-->>Player: PLAYER_RECONNECTED
            Server-->>OtherPlayer: PLAYER_RECONNECTED
            Note over Player,OtherPlayer: Game continues
        else Invalid or Expired
            Server-->>Player: GAME_EXPIRED
            Server-->>OtherPlayer: GAME_EXPIRED
            Note over Player,OtherPlayer: Game ends
        end
    else After 5 minutes
        Server-->>OtherPlayer: GAME_EXPIRED
        Note over Player,Server: Game ends, other player wins
    end
```

## Connection Management

### Connection Recovery
```typescript
/**
 * Connection recovery flow:
 * 1. Client detects disconnection
 * 2. Client attempts to reconnect using stored gameId
 * 3. Server validates reconnection request
 * 4. Server restores game state
 * 5. All players get updated state
 */

// Client implementation
interface ReconnectPayload {
  gameId: string;
}

// Store game information before disconnection
localStorage.setItem('gameData', JSON.stringify({
  gameId: currentGame.id,
  playerNumber: currentPlayer.number
}));

// Reconnection attempt
const reconnectToGame = (socket: Socket) => {
  const gameData = JSON.parse(localStorage.getItem('gameData'));
  if (gameData) {
    socket.emit(WebSocketEvents.Reconnect, { gameId: gameData.gameId });
  }
};

// Handle socket events
socket.on('connect', () => {
  reconnectToGame(socket);
});

socket.on(WebSocketEvents.PlayerReconnected, (data) => {
  // Update game state with received data
  updateGameState(data.gameState);
  setCurrentPlayer(data.currentPlayer);
});

socket.on(WebSocketEvents.GameExpired, ({ gameId, reason }) => {
  // Handle game expiration (timeout, disconnection, etc.)
  handleGameExpiration(reason);
  localStorage.removeItem('gameData');
});
```

#### Reconnection Timeouts
- Player reconnection window: 5 minutes
- Game session expiration: 30 minutes of inactivity

#### Reconnection States
```typescript
interface ReconnectionState {
  gameId: string;
  playerNumber: number;
  disconnectTime: number;
}

interface PlayerReconnectedPayload {
  gameState: GameState;
  currentPlayer: number;
  playerNumber: number;
}

interface GameExpiredPayload {
  gameId: string;
  reason: string;
}
```

## Game History

### Move History
```typescript
interface GameMove {
  playerNumber: 1 | 2;
  x: number;
  y: number;
  timestamp: number;
}

interface GameHistory {
  gameId: string;
  code: string;
  players: {
    first: string;
    second: string;
  };
  moves: GameMove[];
  startedAt: number;
  finishedAt: number;
  winner?: 1 | 2;
  finalState: GameState;
}
```

## Best Practices

### 1. Security
- Validate all incoming payloads
- Check game existence and expiration before operations
- Verify player identity and turns
- Monitor for suspicious activity patterns

### 2. Performance
- Clean up expired games regularly
- Implement move rate limiting
- Use efficient board state representation
- Minimize payload sizes

### 3. User Experience
- Provide clear error messages
- Handle reconnection gracefully
- Show game expiration countdown
- Notify players of opponent disconnection