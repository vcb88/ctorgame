# GameBoard Component

## Overview
The GameBoard component is responsible for rendering the game board and handling cell interactions. It integrates with the new state management system, supporting operation queueing and error handling.

## Features
- Interactive game board with 10x10 grid
- Cell state visualization
- Move validation
- Loading states
- Error handling
- Cell highlighting
- Last move indication
- Capture animations

## Props Interface
```typescript
interface GameBoardProps {
  board: (Player | null)[][];              // Current board state
  onCellClick?: (row: number, col: number) => void; // Cell click handler
  disabled?: boolean;                      // Whether the board is disabled
  lastMove?: IPosition;                    // Last move coordinates
  error?: GameError;                       // Current error state
  loading?: boolean;                       // Loading state
  operationInProgress?: GameActionType;    // Current operation
  isValidMove?: (row: number, col: number) => boolean; // Move validation function
  onRetry?: () => void;                   // Error retry handler
  currentPlayer?: Player;                  // Current player
  highlightedCells?: IPosition[];         // Cells to highlight
}
```

## State Management
The component handles several states:
- Loading state during operations
- Error state with retry options
- Move validation state
- Cell capture animations

## Error Handling
Errors are displayed with retry options when applicable:
```tsx
if (error) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg">
      <div className="text-red-600 mb-4">{error.message}</div>
      {onRetry && error.retryable && (
        <button onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
```

## Cell Click Handling
Cell clicks are validated and processed through several stages:
1. Basic validation (move possible)
2. Operation state check (no operation in progress)
3. Custom validation function (if provided)
4. Callback execution

## Visual Features
- Cell highlighting for valid moves
- Last move indication
- Player-specific colors
- Capture animations
- Loading state visualization
- Error state display
- Toroidal board visualization

## Usage Example
```tsx
<GameBoard
  board={gameState.board}
  onCellClick={handleCellClick}
  disabled={!isMyTurn || loading}
  lastMove={lastMove}
  error={error}
  loading={loading}
  operationInProgress={currentOperation}
  isValidMove={(row, col) => isValidMoveFunction(row, col)}
  onRetry={handleRetry}
  currentPlayer={currentPlayer}
  highlightedCells={availableMoves}
/>
```

## Integration
The component integrates with:
- GameStateManager for state updates
- ActionQueue for operation management
- ErrorRecoveryManager for error handling
- GameCell for cell rendering

## Performance Considerations
- Cell re-renders are minimized using proper key props
- Animations are handled efficiently
- State updates are batched
- Heavy calculations are memoized

## Limitations
- Basic error recovery only
- Simple animation system
- Limited move validation
- No advanced game features

## Future Improvements
- Add advanced animations
- Improve error handling
- Add move history visualization
- Add state snapshots
- Add advanced validation