# WaitingRoom Component Documentation

## Overview
WaitingRoom is a component that handles the game waiting state, where players are waiting for their opponents to join. It uses the GameStateManager for state management and provides a rich user interface with error handling and retry logic.

## Features
- Auto-retry for failed join attempts
- Proper error handling and display
- Progress indicators for connection status
- Clean component cleanup on unmount
- Game code copying functionality
- Visual feedback for various states

## State Management
The component uses GameStateManager through the useGame hook for game state management:
```typescript
const { state } = useGame();
const { playerNumber, gameState, error } = state;
```

## Props
The component doesn't accept any props. It gets all necessary data through URL parameters and state management.

## URL Parameters
- `gameId`: The ID of the game to join

## Retry Logic
The component implements automatic retry logic for failed join attempts:
```typescript
const MAX_JOIN_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

const joinWithRetry = async (gameId: string, retryCount: number = 0) => {
  try {
    // ... join logic
  } catch (err) {
    if (retryCount < MAX_JOIN_RETRIES) {
      // Retry after delay
      setTimeout(() => {
        joinWithRetry(gameId, retryCount + 1);
      }, RETRY_DELAY);
    } else {
      // Handle final failure
    }
  }
};
```

## Error Handling
The component handles several types of errors:
1. Join operation errors (with retry)
2. Connection errors
3. Global game errors
4. Timeout errors

## Cleanup
The component properly cleans up resources on unmount:
```typescript
useEffect(() => {
  return () => {
    const manager = GameStateManager.getInstance();
    manager.disconnect();
  };
}, []);
```

## UI States
The component shows different UI states:
- Connecting
- Waiting for opponent
- Error state
- Game ready state

## Dependencies
- react
- react-router-dom
- framer-motion
- GameStateManager
- Various UI components

## Example Usage
The component is typically used in routing:
```tsx
<Route path="/waiting/:gameId" element={<WaitingRoom />} />
```

## Lifecycle
1. Component mounts and gets gameId from URL
2. Attempts to join game with retry logic
3. Shows connection status and handles errors
4. Redirects to game when opponent joins
5. Cleans up on unmount

## Notes
- The component assumes GameStateManager is initialized
- Requires proper routing setup
- Uses modern React practices (hooks, effects)