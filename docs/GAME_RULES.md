# CTOR Game Rules

## Game Overview
CTOR (Circular TORus) is a two-player strategic board game played on a toroidal surface (a board where top connects to bottom and left connects to right).

## Game Board
- 10x10 grid
- Topologically equivalent to a torus:
  - Top edge connects to bottom edge
  - Left edge connects to right edge
- Each cell can be empty or contain a piece belonging to either player

## Players
- Two players take turns
- Players are typically represented as:
  - Player 1 (Blue)
  - Player 2 (Red)

## Turn Structure
Each turn consists of operations that a player can perform:

### Operations Types
1. **Place Operation**
   - Player can place a piece on any empty cell
   - Maximum of two place operations per turn

2. **Replace Operation**
   - Can be performed when a player's pieces surround an opponent's piece
   - Requirement: 5 or more adjacent cells (out of 8 neighboring cells) must contain the player's pieces
   - Can perform multiple replace operations in one turn
   - Replace operations don't count against the two-operation limit

### Turn Flow
1. Player can perform up to two place operations
2. After each place operation, player can perform any number of valid replace operations
3. Turn ends when:
   - Player has used both place operations
   - Player manually ends their turn

## Game End
- Game ends when all cells on the board are occupied
- Winner is the player with the most pieces on the board at game end

## Strategic Elements
- Board's toroidal nature means edges are connected, creating unique strategic opportunities
- Balance between placing new pieces and setting up future replacements
- Position control is critical for enabling replace operations
- Long-term planning required for optimal piece placement

## Implementation Notes
- Board coordinates wrap around both horizontally and vertically
- Adjacent cell calculation must account for board wrapping
- Replace operations must be checked after each piece placement
- Piece counting must be maintained for win condition checking