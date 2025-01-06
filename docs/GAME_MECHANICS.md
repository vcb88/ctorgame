# Game Mechanics Documentation

## Overview
CTORGame is a two-player strategic board game played on a toroidal surface (a board where edges wrap around). Players take turns placing pieces and can capture opponent's pieces by surrounding them.

## Board
- Size: 10x10 grid
- Topology: Toroidal (edges wrap around)
  - Top edge connects to bottom edge
  - Left edge connects to right edge
- Cell States:
  - Empty (0)
  - Player 1's piece (1)
  - Player 2's piece (2)

## Game Flow

### Turn Structure
1. Player gets 2 operations per turn (except first player's first turn - only 1 operation)
2. Each operation consists of:
   - Placing a piece
   - Automatic capture check and resolution
3. Turn ends when:
   - All operations are used
   - Player manually ends turn

### Move Validation
A move is valid if:
1. It's the player's turn
2. The target cell is empty
3. The player has operations remaining
4. The coordinates are within board bounds (considering wrapping)

## Capture Mechanics

### Capture Conditions
- A piece is captured when it is surrounded by 5 or more opponent pieces
- Surrounding pieces can be:
  - Directly adjacent (horizontally, vertically, diagonally)
  - Including the newly placed piece
- Multiple captures can occur from a single placement

### Capture Process
1. Player places a piece
2. System checks all adjacent opponent pieces
3. For each opponent piece:
   - Count surrounding player pieces
   - If count ≥ 5, piece is captured
4. Captured pieces are converted to capturing player's pieces
5. Score is updated based on captures

### Example Capture Scenarios

```
Before Move (P = Player 1, O = Player 2, X = Empty):
X P P P
P O X
P X X

After Player 1 places at X:
X P P P
P O P  <- Capturing move
P X X
```

## Scoring System

### Points
- Each captured piece adds 1 point to the capturing player's score
- Points are tracked throughout the game
- Final score determines the winner

### Victory Conditions
1. Board Full:
   - All cells are occupied
   - Player with more pieces wins
2. Opponent Disconnection:
   - If player doesn't reconnect within timeout
   - Remaining player wins
3. Draw Conditions:
   - Equal piece count when board is full

## Board Coordinates

### Coordinate System
- X: 0-9 (left to right)
- Y: 0-9 (top to bottom)
- Wrapping examples:
  - (-1, 0) wraps to (9, 0)
  - (10, 0) wraps to (0, 0)
  - (0, -1) wraps to (0, 9)

### Adjacent Cell Calculation
```typescript
function getAdjacentPositions(pos: Position): Position[] {
    const positions: Position[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            positions.push({
                x: ((pos.x + dx + BOARD_SIZE) % BOARD_SIZE),
                y: ((pos.y + dy + BOARD_SIZE) % BOARD_SIZE)
            });
        }
    }
    return positions;
}
```

## State Management

### Game State Structure
```typescript
interface GameState {
    board: Player[][];       // Current board state
    currentPlayer: Player;   // Current active player
    status: GameStatus;      // Game status
    moves: GameMove[];       // Move history
    score: GameScore;        // Current scores
    winner: Player | null;   // Winner (if game over)
    opsRemaining: number;    // Operations left in current turn
}
```

### Score Tracking
```typescript
interface GameScore {
    [Player.First]: number;  // Player 1's score
    [Player.Second]: number; // Player 2's score
}
```

### Move Recording
```typescript
interface GameMove {
    player: Player;
    position: Position;
    timestamp: number;
    captures?: CaptureResult[];
}
```

## Implementation Details

### Capture Detection
```typescript
function findCaptures(state: GameState, pos: Position): CaptureResult[] {
    const captures: CaptureResult[] = [];
    const player = state.currentPlayer;
    const opponent = player === Player.First ? Player.Second : Player.First;

    // Get all adjacent positions
    const adjacent = getAdjacentPositions(pos);
    
    // Check each opponent's piece
    const opponentPositions = adjacent.filter(p => 
        state.board[p.x][p.y] === opponent
    );

    for (const oppPos of opponentPositions) {
        // Count surrounding player's pieces
        const oppAdjacent = getAdjacentPositions(oppPos);
        const surroundingPlayer = oppAdjacent.filter(p => 
            state.board[p.x][p.y] === player || 
            (p.x === pos.x && p.y === pos.y)
        );

        // If 5 or more surrounding pieces, capture
        if (surroundingPlayer.length >= 5) {
            captures.push({
                positions: [oppPos],
                player
            });
        }
    }

    return captures;
}
```

### Move Application
```typescript
function applyMove(state: GameState, pos: Position): MoveResult {
    // Validate move
    const validation = validateMove(state, state.currentPlayer, pos);
    if (!validation.isValid) {
        return {
            isValid: false,
            captures: [],
            nextPlayer: state.currentPlayer,
            opsRemaining: state.opsRemaining,
            isGameOver: false,
            winner: null
        };
    }

    // Apply move and find captures
    const newBoard = state.board.map(row => [...row]);
    newBoard[pos.x][pos.y] = state.currentPlayer;
    const captures = findCaptures({ ...state, board: newBoard }, pos);

    // Apply captures
    captures.forEach(capture => {
        capture.positions.forEach(pos => {
            newBoard[pos.x][pos.y] = capture.player;
        });
    });

    // Update game state
    const opsRemaining = state.opsRemaining - 1;
    const nextPlayer = opsRemaining <= 0 ? 
        (state.currentPlayer === Player.First ? Player.Second : Player.First) : 
        state.currentPlayer;

    return {
        isValid: true,
        captures,
        nextPlayer,
        opsRemaining: opsRemaining <= 0 ? 2 : opsRemaining,
        isGameOver: false,
        winner: null
    };
}
```