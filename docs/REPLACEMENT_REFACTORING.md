# Replacement Logic Refactoring

## Analysis Update
After analyzing the replacement mechanism, we discovered that it exhibits deterministic cascade behavior:
- Each replacement only adds player's pieces, never removes them
- The process continues until no more replacements are possible
- The final state is independent of the replacement order

This discovery eliminates the need for replacement prioritization, as the final board state will be the same regardless of the order in which replacements are processed.

## Current Status

### Completed Changes
1. Unified player identifiers using Player enum
2. Standardized board cell access with [y][x] convention
3. Added helper functions for safe cell access
4. Improved coordinate normalization for toroidal board

### Identified Issues in Replacement Logic

1. **Recursive Replacements**
   - Current implementation uses do-while loop for cascading replacements
   - State changes during replacement validation
   - Potential order dependency issues
   ```typescript
   do {
     replacementsFound = false;
     const availableReplaces = this.getAvailableReplaces(newState, playerNumber);
     // ...
   } while (replacementsFound);
   ```

2. **Arbitrary Replacement Order**
   - Replacements executed in board traversal order
   - No priority system for replacements
   - Order can affect final board state

3. **Validation Gaps**
   - Missing null checks in some comparisons
   - No comprehensive validation of board state
   - Potential edge cases in toroidal board handling

## Proposed Solutions

### 1. Enhanced Replacement Validation

```typescript
interface ReplaceCandidate {
    position: IPosition;
    adjacentCount: number;
    adjacentPositions: IPosition[];
    priority: number;
}

function validateReplacement(
    board: IBoard,
    position: IPosition,
    playerNumber: Player
): ReplaceCandidate | null;
```

Key improvements:
- Comprehensive cell state validation
- Adjacent pieces classification
- Priority calculation
- Clear validation result structure

### 2. Priority-based Replacement System

```typescript
function calculateReplacePriority(adjacent: {
    player: IPosition[],
    opponent: IPosition[],
    empty: IPosition[]
}): number;
```

Priority factors:
- Number of adjacent player pieces (primary)
- Opponent piece configuration (blocking)
- Empty cell opportunities (potential)
- Strategic position value

### 3. Deterministic Replacement Application

```typescript
function applyReplacements(
    state: IGameState,
    playerNumber: Player
): IGameState;
```

Features:
- Collection of all valid replacements
- Priority-based sorting
- Atomic state updates
- Validation of final state

## Implementation Plan

### Phase 1: Types and Interfaces
- [ ] Add ReplaceCandidate interface
- [ ] Update IReplaceValidation
- [ ] Add priority calculation types
- [ ] Add validation result types

### Phase 2: Core Logic Implementation
- [ ] Implement validateReplacement function
- [ ] Implement calculateReplacePriority
- [ ] Create applyReplacements function
- [ ] Add helper functions for validation

### Phase 3: Integration
- [ ] Update GameLogicService
- [ ] Modify existing replacement code
- [ ] Update state management
- [ ] Add new validation checks

### Phase 4: Testing
- [ ] Unit tests for new functions
- [ ] Edge case testing
- [ ] Toroidal board scenarios
- [ ] Priority system verification
- [ ] State consistency checks

## Testing Scenarios

1. **Basic Replacement Validation**
   - Valid replacement configurations
   - Invalid positions
   - Edge cases for adjacent counts

2. **Priority System**
   - Multiple possible replacements
   - Competing priorities
   - Strategic position evaluation

3. **Toroidal Board Scenarios**
   - Replacements across board edges
   - Corner cases
   - Wraparound adjacency

4. **Complex Game States**
   - Multiple simultaneous replacements
   - Cascading effects
   - Full board scenarios

## Code Examples

### Replacement Validation
```typescript
const validation = validateReplacement(board, position, Player.First);
if (validation) {
    console.log(`Valid replacement with priority ${validation.priority}`);
    console.log(`Adjacent pieces: ${validation.adjacentCount}`);
}
```

### Priority Calculation
```typescript
const priority = calculateReplacePriority({
    player: playerPositions,
    opponent: opponentPositions,
    empty: emptyPositions
});
```

### Applying Replacements
```typescript
const newState = applyReplacements(currentState, Player.First);
// Verify state consistency
assert(validateGameState(newState));
```

## Notes for Review

1. **Performance Considerations**
   - Priority calculation overhead
   - State cloning frequency
   - Validation complexity

2. **Edge Cases**
   - Board size limits
   - Maximum possible replacements
   - Corner and edge positions
   - Full board scenarios

3. **Future Improvements**
   - Machine learning for priority calculation
   - Performance optimizations
   - Additional strategic factors

## References

- Game rules documentation
- Original replacement implementation
- Board geometry specifications
- State management documentation