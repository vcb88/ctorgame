# Type System Updates

## Recent Changes

### Core Types Implementation
- All components now use core types from `@ctor-game/shared/src/types/core.js`
- Position type changed from object to tuple notation `[x, y]`
- PlayerNumber and Timestamp types are used consistently
- GameError type is used for error handling

### Interface Replacements
- All interfaces replaced with type aliases for better consistency
- Improved type composition and reusability
- Better type inference and safety

### Component Updates

#### Pages:
1. GameBoard:
   - Uses Position, CellValue, GamePhase types
   - Improved board state handling
   - Better move validation typing

2. WaitingRoom / WaitingRoomNew:
   - PlayerNumber and GamePhase integration
   - Enhanced error handling with GameError
   - Better connection state typing

3. GameHistory:
   - Timestamp implementation for dates
   - Enhanced player and game status typing
   - Improved error handling

#### Replay Components:
1. MoveTimeline:
   - Uses Position and MoveType
   - Enhanced move history typing
   - Timestamp for move recording

2. ReplayControls:
   - Added PlaybackSpeed type
   - Improved control state typing
   - Better event handling

3. ReplayView:
   - Uses GameState from core
   - Enhanced replay state management
   - Better error and event typing

### Error Handling Improvements
- Consistent use of GameError type
- Better error typing in async operations
- Enhanced error display and handling

### State Management Updates
- Better typing for game state
- Enhanced null safety
- Improved state transitions

### Future Plans
1. Additional components to update:
   - CreateGame page
   - JoinGame page
   - Modal components

2. Pending improvements:
   - Test updates for new types
   - Documentation updates
   - Example code updates

## Migration Guidelines

### For Component Updates:
1. Import types from core.ts
2. Replace interfaces with type aliases
3. Update type usage in components
4. Enhance error handling
5. Add helper functions for formatting

### For New Components:
1. Use core types directly
2. Implement type aliases
3. Follow error handling patterns
4. Add proper documentation

### Type Usage Examples:
```typescript
// Position
type Position = [number, number];

// Player
type PlayerNumber = 1 | 2;

// Game Phase
type GamePhase = 'setup' | 'play' | 'end';

// Error Handling
type GameError = {
    code: string;
    message: string;
    details?: Record<string, unknown>;
};
```

## Best Practices

1. Type Imports:
   - Always import from core.ts
   - Use type import syntax
   - Group related types

2. Error Handling:
   - Use GameError consistently
   - Add error context
   - Handle all error cases

3. State Management:
   - Use strict typing
   - Add null checks
   - Handle loading states

4. Documentation:
   - Document type changes
   - Update examples
   - Keep status current