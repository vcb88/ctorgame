# Visual Effects Documentation

## Game Cell Visual States

The game cells can be in various visual states, each with its own distinct appearance and animation:

### 1. Empty Cell
- Default state with subtle cyan border
- Darkened background
- No special effects

### 2. Valid Move Hint
- Appears when cell is available for placement during player's turn
- Pulsing dashed border
- Color indicates availability:
  - Cyan border for available moves
  - Red border for moves that would be valid but are currently disabled

### 3. Placed Piece
- Shows when a piece is first placed
- Scale-in animation
- Glow effect that pulses softly
- Colors:
  - Player 1: Cyan piece with blue glow
  - Player 2: Red piece with red glow

### 4. Captured Piece
- Triggers when a piece changes ownership
- Rotation and scale animation
- Smooth transition to new color
- Previous piece color fades out as new color fades in

## Animations

### piece-placed
- Purpose: Visual feedback when a new piece is placed
- Duration: 0.5s
- Effect: Scales from 120% to 100% with opacity fade in

### piece-glow
- Purpose: Constant subtle animation for placed pieces
- Duration: 2s, infinite
- Effect: Subtle brightness and shadow pulsing

### piece-capture
- Purpose: Indicates when a piece changes ownership
- Duration: 0.7s
- Effect: 360-degree rotation with scale up/down

## Implementation Notes

### GameCell Props
- `isValidMove`: Controls valid move hint display
- `isBeingCaptured`: Triggers capture animation
- `previousValue`: Used to determine capture animation direction

### CSS Classes
All visual effects are implemented using Tailwind CSS classes and custom animations defined in tailwind.config.js.