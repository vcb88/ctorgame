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
Each turn consists of placement operations and automatic replacements:

### Operations Types
1. **Place Operation**
   - Player can place a piece on any empty cell
   - Maximum of two place operations per turn
   - First player's first turn is limited to one place operation only

2. **Replace Operation** (Automatic)
   - Occurs automatically when a player's pieces surround an opponent's piece
   - Requirement: 5 or more adjacent cells (out of 8 neighboring cells) must contain the player's pieces
   - All possible replacements are performed automatically after each placement
   - Multiple replacements can occur from a single placement

### Turn Flow
1. Player performs placement operations:
   - Two place operations per turn (except first player's first turn - only one operation)
   - After each placement, all possible replacements occur automatically
2. Turn ends when:
   - Player has used all available place operations
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