# GameNew Component

## Overview
The GameNew component is the main game interface component that handles game creation, joining, and gameplay. It uses the new state management system with operation queueing and error handling.

## Features
- Game creation and joining
- Real-time game state display
- Move validation and execution
- Loading states for operations
- Error handling and recovery
- Game state visualization

## Dependencies
- useMultiplayerGameNew hook
- GameStateManager
- ActionQueue
- ErrorRecoveryManager

## State Management
The component uses several state management systems:
```typescript
const {
  // Game state
  gameId,
  playerNumber,
  gameState,
  error,
  isMyTurn,

  // Operation state
  loading,
  operationInProgress,
  
  // Operations
  createGame,
  joinGame,
  makeMove,
  
  // Error handling
  canRetry,
  canRecover
} = useMultiplayerGameNew();
```

## Operation States
The component handles different operation states:
- Create game
- Join game
- Make move
- End turn

Each operation has its own loading state and error handling.

## Error Handling
Errors are handled at multiple levels:
1. Component level (UI feedback)
2. Hook level (operation retry)
3. GameStateManager level (state recovery)

Available error recovery options:
- Retry operation
- Recover game state
- Start new game

## Loading States
Loading states are displayed for:
- Game creation
- Game joining
- Move execution
- Turn ending

## View States
The component has several view states:
1. Initial (game creation/joining)
2. Waiting for opponent
3. Game in progress
4. Game over

### Initial State
```tsx
if (!gameId) {
  return (
    <div>
      <button onClick={handleCreateGame} disabled={loading}>
        {loading ? 'Creating...' : 'Create New Game'}
      </button>
      <input value={joinGameId} onChange={...} />
      <button onClick={handleJoinGame} disabled={loading}>
        {loading ? 'Joining...' : 'Join Game'}
      </button>
    </div>
  );
}
```

### Waiting State
```tsx
if (!gameState) {
  return (
    <div>
      <h2>{loading ? 'Connecting...' : 'Waiting for opponent...'}</h2>
      <div>Game ID: {gameId}</div>
    </div>
  );
}
```

### Game Progress State
```tsx
return (
  <div>
    <div>Game ID: {gameId}</div>
    <div>Player: {playerNumber}</div>
    <div>
      {loading ? 'Making move...' : isMyTurn ? 'Your turn' : "Opponent's turn"}
    </div>
    <GameBoard {...boardProps} disabled={loading} />
  </div>
);
```

## Error Display
Error states are displayed with appropriate recovery options:
```tsx
if (error) {
  return (
    <div>
      <div>{error.message}</div>
      {canRetry && <button>Retry</button>}
      {canRecover && <button>Recover Game</button>}
      <button>Start New Game</button>
    </div>
  );
}
```

## Move Validation
Moves are validated at multiple levels:
1. Component level (basic checks)
2. Hook level (board validation)
3. GameStateManager level (state validation)
4. Server level (final validation)

## Operation Flow
1. User initiates action
2. Action is queued in ActionQueue
3. Loading state is shown
4. Operation is executed
5. Success/error is handled
6. State is updated
7. UI is refreshed

## Performance Considerations
- Operations are queued to prevent race conditions
- State updates are batched
- UI updates are debounced
- Loading states prevent multiple operations

## Usage Example
```tsx
<GameNew />
```

## Future Improvements
- Add offline support
- Improve error recovery strategies
- Add move animations
- Add sound effects
- Add game statistics
- Add player profiles
- Add game replay
- Add spectator mode