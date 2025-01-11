# State Management Migration Plan

## Overview
This document outlines the plan for migrating the current state management approach to a hybrid solution using a centralized GameStateManager for core game state while maintaining component-local state for UI concerns.

## Goals
- Improve state management predictability
- Reduce state-related bugs
- Maintain simple debugging capabilities
- Keep the codebase maintainable
- Minimize impact on existing functionality

## Migration Phases

### Phase 1: Infrastructure Setup (Foundation)
1. Create base GameStateManager class
   - Implement singleton pattern
   - Add basic state structure
   - Setup connection management
   ```typescript
   class GameStateManager {
     private static instance: GameStateManager;
     private state = {
       connectionState: 'CONNECTING',
       gameId: null,
       playerNumber: null,
       gamePhase: 'INITIAL'
     };

     public static getInstance() {
       if (!GameStateManager.instance) {
         GameStateManager.instance = new GameStateManager();
       }
       return GameStateManager.instance;
     }
   }
   ```

2. Implement basic socket handling
   - Move socket initialization to GameStateManager
   - Setup basic connection events
   ```typescript
   private setupBaseSocketHandlers() {
     this.socket.on('connect', this.handleConnect);
     this.socket.on('disconnect', this.handleDisconnect);
     this.socket.on('error', this.handleError);
   }
   ```

3. Create useGame hook
   - Basic state subscription
   - Essential game actions
   ```typescript
   function useGame() {
     const [gameState, setGameState] = useState(null);
     const manager = useMemo(() => GameStateManager.getInstance(), []);

     useEffect(() => {
       return manager.subscribe(setGameState);
     }, []);

     return {
       gameState,
       createGame: manager.createGame.bind(manager),
       joinGame: manager.joinGame.bind(manager)
     };
   }
   ```

### Phase 2: Component Migration (Iterative)
1. WaitingRoom Component Migration
   - Move game creation/joining logic to GameStateManager
   - Keep UI-specific state in component
   - Update component to use useGame hook
   ```typescript
   function WaitingRoom() {
     const { gameState, createGame, joinGame } = useGame();
     const [copied, setCopied] = useState(false);
     // UI-specific logic remains in component
   }
   ```

2. GameBoard Component Migration
   - Move game state management to GameStateManager
   - Keep animation and selection state in component
   - Update event handlers to use manager methods

3. Update other components following the same pattern

### Phase 3: State Synchronization
1. Implement proper state updates
   - Add validation
   - Handle race conditions
   - Implement proper error handling
   ```typescript
   class GameStateManager {
     private updateState(newState: Partial<State>) {
       // Validate state update
       if (!this.isValidStateTransition(newState)) {
         throw new Error('Invalid state transition');
       }
       
       this.state = { ...this.state, ...newState };
       this.notifySubscribers();
     }
   }
   ```

2. Add state persistence where needed
   - Implement localStorage backup
   - Add state recovery logic
   ```typescript
   class GameStateManager {
     private persistState() {
       localStorage.setItem('gameState', JSON.stringify(this.state));
     }

     private restoreState() {
       const saved = localStorage.getItem('gameState');
       if (saved) {
         this.state = JSON.parse(saved);
       }
     }
   }
   ```

### Phase 4: Testing & Documentation
1. Add unit tests for GameStateManager
   ```typescript
   describe('GameStateManager', () => {
     let manager: GameStateManager;

     beforeEach(() => {
       manager = GameStateManager.getInstance();
     });

     it('should handle game creation', () => {
       manager.createGame();
       expect(manager.getState().gamePhase).toBe('WAITING');
     });
   });
   ```

2. Add integration tests for components with new state management
3. Update component tests to use mocked GameStateManager
4. Document new patterns and best practices

## Success Criteria
- All game-related state managed through GameStateManager
- Component tests passing
- No regressions in existing functionality
- Improved debugging capabilities
- Reduced number of state-related bugs

## Rollback Plan
Each phase can be rolled back independently by:
1. Reverting the specific component changes
2. Restoring original state management
3. Removing GameStateManager class
4. Reverting to original socket handling

## Timeline
- Phase 1: 1-2 days
- Phase 2: 2-3 days (per component)
- Phase 3: 2-3 days
- Phase 4: 2-3 days

## Testing Strategy
1. Unit Tests
   - GameStateManager core functionality
   - State transitions
   - Event handling

2. Integration Tests
   - Component interaction with GameStateManager
   - State synchronization
   - Error handling

3. End-to-End Tests
   - Full game flow
   - Connection handling
   - State persistence

## Monitoring & Metrics
1. Track state-related errors
2. Monitor performance impacts
3. Track state transition timings
4. Monitor memory usage

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| State desynchronization | Implement validation and recovery mechanisms |
| Performance degradation | Monitor and optimize state updates |
| Breaking changes | Comprehensive testing before each phase |
| Memory leaks | Proper cleanup in useGame hook |

## Development Guidelines
1. State Updates
   ```typescript
   // Do: Use manager methods
   gameManager.makeMove(move);
   
   // Don't: Modify state directly
   gameState.moves.push(move);
   ```

2. Component State
   ```typescript
   // Do: Keep UI state in components
   const [isAnimating, setAnimating] = useState(false);
   
   // Don't: Put UI state in manager
   gameManager.setAnimating(true);
   ```

3. Event Handling
   ```typescript
   // Do: Use manager methods
   const handleClick = () => gameManager.handleCellClick(cell);
   
   // Don't: Handle game logic in components
   const handleClick = () => setGameState({ ...gameState, selected: cell });
   ```

## Migration Status Tracking
| Component | Status | Notes |
|-----------|--------|-------|
| WaitingRoom | Pending | |
| GameBoard | Pending | |
| GameControls | Pending | |

## Future Considerations
1. State persistence improvements
2. Performance optimizations
3. Additional debugging tools
4. State replay capabilities
5. Time-travel debugging

## References
- Current architecture documentation
- React state management best practices
- Socket.IO documentation
- Testing strategies