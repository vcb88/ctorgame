# CTORGame - Multiplayer Online Game

A multiplayer online version of the classic tic-tac-toe game, supporting real-time gameplay between two players.

## Project Overview

CTORGame transforms the original hotseat tic-tac-toe implementation into a full-fledged online multiplayer game using client-server architecture. Players can create game rooms, share room codes with opponents, and play in real-time over the internet.

## User Stories

### As a Player, I want to:
- Create a new game room and receive a unique room code
- Join an existing game using a room code
- See the game board update in real-time when my opponent makes a move
- Know when it's my turn to play
- See the game status (win/lose/draw)
- Be notified if my opponent disconnects
- Start a new game after completion

### As a Developer, I want to:
- Have clear separation between client and server code
- Use type-safe communication between client and server
- Handle edge cases (disconnections, invalid moves, etc.)
- Scale the application for multiple concurrent games

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Real-time Communication**: Socket.IO
- **Styling**: Tailwind CSS

### Project Structure
```
ctorgame/
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   └── types/        # TypeScript types
├── server/                # Backend application
│   ├── src/
│   │   ├── websocket/    # WebSocket handlers
│   │   └── types/        # Server-side types
└── shared/                # Shared types and utilities
    └── types/            # Common TypeScript interfaces
```

## Client-Server Communication

### WebSocket Events

#### Client to Server
- `createGame`: Request to create a new game room
- `joinGame`: Request to join an existing game room
- `makeMove`: Send a move to the server
- `disconnect`: Handle player disconnection

#### Server to Client
- `gameCreated`: New game room created with room code
- `gameStarted`: Both players joined, game can begin
- `gameStateUpdated`: Game state changed (after moves)
- `playerDisconnected`: Opponent left the game
- `error`: Error messages (invalid moves, etc.)

### Data Models

```typescript
interface GameState {
  board: (number | null)[][];  // Game board state
  gameOver: boolean;           // Is game finished
  winner: number | null;       // Winner's player number (0/1/null)
}

interface Move {
  row: number;    // Row index
  col: number;    // Column index
}

interface Player {
  id: string;     // Socket ID
  number: number; // Player number (0/1)
}
```

## Game Flow

1. Player 1 creates a game room
   - Server generates unique room code
   - Returns code to Player 1

2. Player 2 joins with room code
   - Server validates room exists
   - Adds Player 2 to room
   - Notifies both players game can start

3. Gameplay
   - Server maintains game state
   - Validates all moves
   - Broadcasts updates to both players
   - Checks for win/draw conditions

4. Game End
   - Server notifies both players of result
   - Players can start new game

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development servers:
   ```bash
   # Start both client and server
   npm run dev

   # Start individually
   npm run dev:client
   npm run dev:server
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Production Deployment

The application can be deployed using Docker:

```bash
# Build Docker image
docker build -t ctorgame .

# Run container
docker run -p 3000:3000 ctorgame
```

## Testing

Run tests:
```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## Future Improvements

- Add user authentication
- Implement game history
- Add spectator mode
- Support custom board sizes
- Add chat functionality
- Add player rankings

## License

This project is licensed under the MIT License - see the LICENSE file for details.
