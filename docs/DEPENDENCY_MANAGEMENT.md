# Dependency Management

This document describes the tools and practices for managing dependencies in the project, with a particular focus on TypeScript module dependencies.

## Tools

### Madge

[Madge](https://github.com/pahen/madge) is our primary tool for analyzing TypeScript dependencies. It helps identify circular dependencies and visualize the dependency graph.

#### Installation

```bash
npm install -D madge
```

#### Common Commands

1. Check for circular dependencies:
```bash
npx madge --extensions ts --circular shared/types/
```

2. Generate dependency graph visualization:
```bash
npx madge --extensions ts --image dependency-graph.png shared/types/
```

3. Get detailed dependency information in DOT format:
```bash
npx madge --extensions ts --dot shared/types/
```

### Dependency Cruiser

[Dependency Cruiser](https://github.com/sverweij/dependency-cruiser) is a more sophisticated tool for dependency analysis and validation.

#### Installation

```bash
npm install -D dependency-cruiser
```

#### Usage

1. Initialize configuration:
```bash
npx depcruise --init
```

2. Validate dependencies:
```bash
npx depcruise --validate .dependency-cruiser.js shared/types/
```

3. Generate visualization:
```bash
npx depcruise --config --output-type dot shared/types/ | dot -T svg > dependency-graph.svg
```

## Best Practices

### 1. Dependency Organization

- Keep dependencies unidirectional where possible
- Group related types in the same module
- Create separate files for shared types
- Use barrel files (index.ts) carefully to avoid circular dependencies

### 2. Module Structure

The project follows a hierarchical module structure:

1. **Core Types** (basic-types.ts, coordinates.ts)
   - No dependencies on other modules
   - Contains fundamental types and interfaces
   - Used throughout the application

2. **Basic Modules** (base.ts, moves.ts)
   - Depend only on core types
   - Provide essential functionality
   - Limited external dependencies

3. **Feature Modules** (game.ts, state.ts)
   - Can depend on core and basic modules
   - Implement specific features
   - Should not create circular dependencies

4. **Integration Modules** (events.ts, web-socket-types.ts)
   - Handle communication between parts
   - May have complex dependencies
   - Should be carefully structured

### 3. Preventing Circular Dependencies

To prevent circular dependencies:

1. **Extract Shared Types**
   - Create separate files for types used in multiple places
   - Example: validation-types.ts for validation-specific types

2. **Use Interface Segregation**
   - Split large interfaces into smaller ones
   - Keep interfaces focused and single-purpose

3. **Maintain Clear Hierarchy**
   - Follow the defined module structure
   - Don't let lower-level modules depend on higher-level ones

### 4. Regular Checks

Implement regular dependency checks in your development workflow:

1. **Pre-commit Hooks**
```json
{
  "hooks": {
    "pre-commit": "npx madge --extensions ts --circular shared/types/"
  }
}
```

2. **CI Pipeline**
```yaml
dependency-check:
  script:
    - npx madge --extensions ts --circular shared/types/
    - npx depcruise --validate .dependency-cruiser.js shared/types/
```

## Example: Breaking Circular Dependencies

Here's an example of how we resolved a circular dependency between index.ts and validation/game.ts:

1. **Original Problem**:
   - index.ts exported validation functions
   - validation/game.ts imported types from index.ts

2. **Solution**:
   - Created validation-types.ts for shared types
   - Updated validation/game.ts to import from validation-types.ts
   - Maintained clean dependency structure

```typescript
// validation-types.ts
export { GameMove, IGameState, IPosition, IBoardSize, Player } from './basic-types';

// validation/game.ts
import { GameMove, IGameState, IPosition, IBoardSize, Player } from '../types/validation-types';
```

## Common Issues and Solutions

### 1. Circular Dependencies

**Problem**: Module A depends on Module B which depends back on Module A

**Solutions**:
- Extract shared types into a separate module
- Use interface segregation
- Restructure modules to maintain hierarchy

### 2. Complex Module Interactions

**Problem**: Modules have too many dependencies

**Solutions**:
- Split into smaller, focused modules
- Create intermediate abstraction layers
- Use composition over inheritance

### 3. Type Re-exports

**Problem**: Barrel files (index.ts) creating dependency cycles

**Solutions**:
- Be selective about re-exports
- Consider direct imports for some cases
- Structure re-exports based on module hierarchy

## Tools Configuration

### Dependency Cruiser

Example .dependency-cruiser.js configuration:

```javascript
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-core-to-features',
      severity: 'error',
      from: {
        path: '^shared/types/(basic-types|coordinates)'
      },
      to: {
        path: '^shared/types/(game|state|events)'
      }
    }
  ]
};
```

## Regular Maintenance

1. **Weekly Tasks**:
   - Run dependency analysis
   - Update dependency documentation
   - Review new dependencies

2. **Per-Feature Tasks**:
   - Check for circular dependencies before merge
   - Update module structure documentation
   - Validate dependency rules

3. **Monthly Review**:
   - Full dependency graph analysis
   - Module structure optimization
   - Documentation updates