# GameControls Component

## Overview
The GameControls component provides the game control interface, including turn management and move operations. It integrates with the new state management system and supports operation queueing.

## Features
- Turn status display
- Operation counter
- Move undo functionality
- Turn ending
- Error handling
- Loading states
- Move history display

## Props Interface
```typescript
interface GameControlsProps {
  currentTurn: ITurnState;                // Current turn state
  operationInProgress?: GameActionType;    // Current operation
  loading?: boolean;                       // Loading state
  error?: GameError;                       // Error state
  onEndTurn?: () => Promise<void>;        // Turn end handler
  onUndoLastMove?: () => Promise<void>;   // Move undo handler
  canEndTurn: boolean;                    // Whether turn can be ended
  canUndoMove: boolean;                   // Whether move can be undone
  currentPlayer?: Player;                 // Current player
  isFirstTurn?: boolean;                  // First turn flag
}
```

## State Management
The component handles:
- Turn state tracking
- Operation states
- Error states
- Loading states

## Error Handling
Errors are displayed with retry options:
```tsx
if (error) {
  return (
    <div className="flex flex-col items-center space-y-2 p-4 bg-red-50 rounded-lg">
      <div className="text-red-600">{error.message}</div>
      {error.retryable && (
        <button onClick={handleEndTurn}>
          Retry
        </button>
      )}
    </div>
  );
}
```

## Operation Handling
Actions are processed through ActionQueue:
1. Validation check
2. Loading state management
3. Operation execution
4. Error handling
5. State update

## Visual Features
- Turn status indicator
- Operation counter visualization
- Player-specific colors
- Loading animations
- Error state display
- Move history display

## Usage Example
```tsx
<GameControls
  currentTurn={gameState.currentTurn}
  operationInProgress={currentOperation}
  loading={loading}
  error={error}
  onEndTurn={handleEndTurn}
  onUndoLastMove={handleUndoMove}
  canEndTurn={canEndTurnCheck()}
  canUndoMove={canUndoMoveCheck()}
  currentPlayer={currentPlayer}
  isFirstTurn={gameState.isFirstTurn}
/>
```

## Integration
The component integrates with:
- GameStateManager for state updates
- ActionQueue for operation management
- ErrorRecoveryManager for error handling

## Performance Considerations
- Operation queueing prevents race conditions
- State updates are batched
- Loading states prevent multiple operations
- Animations are optimized

## Limitations
- Basic error recovery
- Simple animation system
- Limited move history
- Basic validation

## Future Improvements
- Add advanced animations
- Improve error handling
- Add move replay
- Add state snapshots
- Add operation priorities
- Add operation batching