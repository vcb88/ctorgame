# Type System Errors Analysis

This document provides a structured analysis of current TypeScript errors in the project, grouping them by category and suggesting solutions.

## Error Categories

### 1. Module Resolution Errors [✅ FIXED]
These errors were related to incorrect paths and missing modules:
```typescript
Cannot find module '@/components/backgrounds/*' or its corresponding type declarations
Cannot find module '@/hooks/*' or its corresponding type declarations
Cannot find module '@/*services/*' or its corresponding type declarations
```
**Solution implemented**: Updated path aliases in tsconfig.json with explicit paths for components, hooks, and services. Changed moduleResolution to "Bundler" for better Vite compatibility.

### 2. Type Compatibility Errors
Errors related to incompatible types between shared module and client implementation:

#### GameMove vs GameMoveBase [✅ FIXED]
```typescript
Type 'GameMoveBase' is not assignable to type 'GameMove'.
Missing properties: player, timestamp
```
**Solution implemented**: Updated HistoryEntry type to properly extend GameMoveBase with required GameMove fields.

#### Player vs PlayerNumber [⌛ IN PROGRESS]
```typescript
Type 'PlayerNumber | null' is not assignable to type 'Player'.
Type 'number' is not comparable to type 'Player'.
```
**Proposed solution**: Implement proper type conversion utility to convert PlayerNumber to Player type.

### 3. Enum and Constant Type Errors
Issues with enum values and constants not matching their type definitions:

#### ConnectionState
```typescript
Types 'ConnectionState.CONNECTED | ConnectionState.DISCONNECTED' and 'ConnectionState.CONNECTING' have no overlap
```
**Solution**: Update connection state handling to use proper enum values.

#### GamePhase
```typescript
Type '"setup"' is not assignable to type 'GamePhase'
```
**Solution**: Use proper enum values from shared types instead of string literals.

### 4. Error Handling Issues
Problems with error type definitions and handling:

#### NetworkError Structure
```typescript
Property 'category' is missing but required in type 'BaseError'
Object literal may only specify known properties
```
**Solution**: Ensure all error objects follow the BaseError structure.

### 5. State Management Issues
Problems with state handling and validation:

#### StateStorage Implementation
```typescript
Class 'StateStorageImpl' incorrectly implements interface 'StateStorage'
Missing properties: get, set, delete
```
**Solution**: Implement all required interface methods.

#### Optional Properties
```typescript
Type 'undefined' is not assignable to type 'string'
Object is possibly 'undefined'
```
**Solution**: Add proper null checks and default values.

## Priority Order for Fixes

1. Module Resolution (Critical)
   - Prevents proper compilation
   - Affects development workflow
   - Blocks other fixes

2. Type Compatibility (High)
   - Core functionality issues
   - Data consistency problems
   - Potential runtime errors

3. Error Handling (Medium)
   - Important for production stability
   - User experience impact
   - Error recovery functionality

4. Enum/Constants (Medium)
   - Type safety issues
   - Maintenance concerns
   - Code consistency

5. State Management (Low)
   - Implementation details
   - Internal consistency
   - Can be temporarily worked around

## Implementation Strategy

### Phase 1: Infrastructure
1. Fix tsconfig.json path mappings
2. Update module resolution
3. Clean up import paths

### Phase 2: Core Types
1. Update GameMove/GameMoveBase usage
2. Fix Player/PlayerNumber conversions
3. Implement proper enum usage

### Phase 3: Error System
1. Update error type definitions
2. Implement proper error creation
3. Fix error handling

### Phase 4: State System
1. Complete StateStorage implementation
2. Add proper null checks
3. Fix optional properties

## Notes for Implementation

- Each fix should be in a separate commit
- Update tests along with type fixes
- Keep changes minimal and focused
- Document any workarounds
- Maintain backwards compatibility where possible
- Consider performance implications

## Current Progress

- ✅ PlaybackSpeed type implementation
- ✅ Connection state enum usage
- ✅ Basic error structure
- ✅ Module resolution for backgrounds and components
- ✅ GameMoveBase and GameMove compatibility in Replay components
- ❌ Player/PlayerNumber compatibility
- ❌ ConnectionState comparisons
- ❌ Error handling system
- ❌ State management

## Next Steps

1. Create separate ticket for each error category
2. Prioritize fixes based on impact
3. Implement solutions group by group
4. Test each fix thoroughly
5. Document changes in CHANGELOG.md