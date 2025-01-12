# Game State Transitions Documentation

This document describes the game state transitions and synchronization between server and client in the CTor Game.

## Game Phases

The game has five main phases:

1. `INITIAL` - Initial state before any connection
2. `CONNECTING` - Connection establishment phase
3. `WAITING` - Waiting for the second player
4. `PLAYING` - Active gameplay
5. `GAME_OVER` - Game has ended

## State Transition Flow

### 1. Game Creation (First Player)

Client side:
```
INITIAL → CONNECTING → WAITING
```

Server side actions:
1. Generates unique game code
2. Creates initial game state
3. Saves state in Redis and MongoDB
4. Sends `GameCreated` event to first player

Events flow:
```
Client → Server: CreateGame
Server → Client: GameCreated
```

### 2. Second Player Joining

Client side (second player):
```
INITIAL → CONNECTING → PLAYING
```

Server side actions:
1. Validates game existence
2. Adds second player
3. Sends individual confirmation
4. Broadcasts game start to all players

Events flow:
```
Client → Server: JoinGame
Server → Client: GameJoined
Server → All: GameStarted (with initial game state)
```

### 3. Active Gameplay

Client side:
```
PLAYING (maintains state)
```

Server side actions:
1. Validates moves
2. Updates game state
3. Broadcasts state updates
4. Calculates and sends available moves

Events flow:
```
Client → Server: MakeMove
Server → All: GameStateUpdated
Server → Current Player: AvailableReplaces (when applicable)
```

### 4. Game End

Client side:
```
PLAYING → GAME_OVER
```

Server side actions:
1. Detects game end condition
2. Saves final state
3. Broadcasts game over
4. Cleans up Redis data

Events flow:
```
Server → All: GameOver
```

### 5. Error Handling

Client side:
```
Any State → ERROR or INITIAL
```

Server side actions:
1. Sends error notifications
2. Maintains reconnection window
3. Cleans up expired games

Events flow:
```
Server → Client: Error
Server → All: PlayerDisconnected (when applicable)
```

## State Validation

- All state transitions are validated on both client and server
- Server is the source of truth for game state
- Clients cannot modify state directly
- All updates go through validation pipeline

## Error Recovery

1. Connection Loss:
   - Client maintains last known state
   - Server keeps game alive for reconnection period
   - Automatic state recovery on reconnect

2. State Validation Errors:
   - Attempt to recover using last valid state
   - Fallback to INITIAL state if recovery fails
   - Notify user of state reset

## State Transition Diagram

```
┌─────────┐      ┌───────────┐      ┌─────────┐      ┌─────────┐      ┌───────────┐
│ INITIAL │ ───► │CONNECTING │ ───► │ WAITING │ ───► │ PLAYING │ ───► │ GAME_OVER │
└─────────┘      └───────────┘      └─────────┘      └─────────┘      └───────────┘
     ▲                 │                 │                 │
     │                 │                 │                 │
     └─────────────────┴─────────────────┴─────────────────┘
                 (ERROR state recovery)
```

## Synchronization Details

1. **Data Storage**:
   - Redis: Active game states, sessions, rooms
   - MongoDB: Game history, statistics, completed games

2. **State Updates**:
   - Atomic operations in Redis
   - Event-driven updates to all clients
   - Validation before state changes

3. **Connection Management**:
   - WebSocket for real-time updates
   - Reconnection handling
   - Session tracking

## Important Notes

1. All state changes must go through the server
2. Client-side predictions are not implemented
3. Server validates all transitions
4. Error recovery prioritizes consistency over availability
5. All game events are logged for debugging