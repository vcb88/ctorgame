# Legacy Features Documentation

This document describes valuable features and components from the original version of the game that can be reused or integrated into the current version.

## AI Implementation

Located in `/src/ai/index.ts`, the AI module provides a sophisticated computer player implementation with several key features:

### Position Evaluation System
```typescript
evalDanger(board, x, y, player): number
```
- Evaluates how dangerous a position is for a given piece
- Counts surrounding opponent pieces
- Returns higher scores for positions with more opponent pieces nearby
- Useful for defensive play

```typescript
evalBlock(board, x, y, player): number
```
- Evaluates potential blocking moves
- Identifies positions that prevent opponent captures
- Considers opponent's piece configurations
- Important for strategic play

```typescript
evalGroup(board, x, y, player): number
```
- Evaluates the strength of piece groups
- Counts connected friendly pieces
- Considers empty spaces around groups
- Crucial for territory control

### Move Finding Algorithm
```typescript
findMove(board, player): Move | null
```
- Implements minimax-like evaluation
- Considers multiple factors:
  - Territory control
  - Piece safety
  - Blocking potential
  - Group formation
- Returns optimal move with score

## Position Analysis System

Located in `/src/utils/analysis.ts`, provides detailed position analysis:

### Territory Analysis
```typescript
type PositionStrength = {
  pieces: number;      // Count of player's pieces
  territory: number;   // Percentage of controlled territory
  influence: number;   // Influence score (0-100)
  groupsStrength: number; // Combined strength of groups
  total: number;      // Overall position evaluation
}
```

### Analysis Features
- Territory control calculation
- Influence mapping
- Group strength evaluation
- Neighbor analysis with toroidal board handling

## Flexible Board Implementation

Located in `/src/utils/board.ts`, provides support for variable board sizes:

### Key Features
- Configurable board dimensions via constants
- Toroidal board implementation
- Efficient coordinate normalization
- Replacement rules implementation

### Important Functions
```typescript
nX(x: number): number  // Normalize X coordinate for toroidal board
nY(y: number): number  // Normalize Y coordinate for toroidal board
replace(board: Board, max: number): Board  // Implement replacement rules
```

## Enhanced Visualization Components

### ExtendedGrid Component
Located in `/src/components/ExtendedGrid.tsx`:
- Supports variable board sizes
- Displays position evaluation heatmap
- Handles toroidal board visualization
- Shows virtual cells for toroidal wrapping

### PositionStats Component
Located in `/src/components/PositionStats.tsx`:
- Displays detailed position statistics
- Shows territory control
- Visualizes influence scores
- Presents group strength metrics

## Integration Guidelines

### AI Integration
1. Port the AI module as a service
2. Maintain evaluation functions separately
3. Add difficulty levels
4. Consider async execution for heavy calculations

### Analysis Integration
1. Port position analysis as a separate service
2. Add real-time position evaluation
3. Integrate with the replay system
4. Add position comparison features

### Board Size Support
1. Make board size configurable in game settings
2. Update UI components to handle variable sizes
3. Ensure game rules support different dimensions
4. Add board size validation

### Visualization Integration
1. Port heatmap visualization as an overlay
2. Add toggleable position statistics
3. Integrate with the new UI theme
4. Maintain accessibility features

## Migration Notes

When integrating these features into the current version:

1. **Maintain Type Consistency**
   - Use shared types from `@ctor-game/shared`
   - Update type definitions as needed
   - Ensure proper TypeScript validation

2. **Performance Considerations**
   - AI calculations should be async
   - Use Web Workers for heavy computations
   - Implement proper memoization
   - Add calculation timeouts

3. **Testing Requirements**
   - Port existing tests
   - Add performance tests
   - Verify toroidal logic
   - Test different board sizes

4. **Documentation Updates**
   - Update API documentation
   - Add usage examples
   - Document configuration options
   - Include performance guidelines

## Future Improvements

Potential enhancements when integrating legacy features:

1. **AI Improvements**
   - Add machine learning capabilities
   - Implement different AI personalities
   - Add position pattern recognition
   - Improve evaluation speed

2. **Analysis Enhancements**
   - Add more statistical metrics
   - Implement move suggestion system
   - Add position comparison tools
   - Improve visualization options

3. **Board Features**
   - Add custom board shapes
   - Implement different wrapping rules
   - Add board templates
   - Support board obstacles

4. **Visualization Updates**
   - Add 3D visualization option
   - Implement animation system
   - Add interactive tutorials
   - Improve accessibility