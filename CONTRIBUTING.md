# Contributing to CTORGame

Thank you for your interest in contributing to CTORGame! This document provides guidelines and instructions for contributing to the project.

## ⚠️ Shared Types Synchronization

This project uses a special approach for handling shared TypeScript types:

1. **Main Source** (`/shared/`):
   - Contains the original, split type definitions
   - Should be updated first when changing shared types
   - Serves as the source of truth

2. **Client Copy** (`/client/src/shared.ts`):
   - Aggregated types for client usage
   - Must be manually synchronized

3. **Server Copy** (`/server/src/shared.ts`):
   - Aggregated types for server usage
   - Must be manually synchronized

### Required Steps When Modifying Types

Before committing any changes:
1. Update `/shared/` directory first
2. Synchronize both client and server shared.ts files
3. Verify type consistency across all three locations
4. In case of conflicts, use the most recently updated version

## Shared Types Organization

The project uses a specific approach for managing shared TypeScript types between client and server:

### Structure

1. **Source Package** (`@ctor-game/shared`):
   - Located in `/shared` directory
   - Contains all shared types split across multiple files
   - Built and packaged as a workspace dependency
   - Source of truth for all shared types

2. **Server Types** (`server/src/shared.ts`):
   ```typescript
   // Re-export all shared types
   export * from '@ctor-game/shared';

   // Additional server-specific types and exports
   export * from './validation/game';
   export * from './types/connection';

   // Server-only type extensions
   export interface ServerSpecificType {
     // ...
   }
   ```

3. **Client Types** (`client/src/shared.ts`):
   ```typescript
   // Re-export all shared types
   export * from '@ctor-game/shared';

   // Additional client-specific types
   export interface ClientSpecificType {
     // ...
   }
   ```

### Key Principles

1. **Single Source of Truth**:
   - All shared types are defined in `@ctor-game/shared` package
   - Never duplicate shared type definitions in client or server
   - Always import shared types from `@ctor-game/shared`

2. **Clean Dependencies**:
   - No direct imports between client and server
   - No circular dependencies
   - Clear separation of concerns

3. **Type Extension**:
   - Client and server can extend shared types
   - Extensions should be kept in respective shared.ts files
   - Extensions should not modify shared type behavior

### Making Changes

When modifying shared types:

1. Update `@ctor-game/shared` package first
2. Build the shared package:
   ```bash
   cd shared && pnpm build
   ```
3. Update imports in client/server if needed
4. Verify type consistency across the project
5. Run type checks:
   ```bash
   pnpm type-check      # Root project
   cd client && pnpm type-check
   cd server && pnpm type-check
   ```

### Common Pitfalls

1. **Avoid Direct Module Imports**:
   ```typescript
   // WRONG: Importing directly from shared module
   import { SomeType } from '../../../shared/types/something';

   // CORRECT: Import from package
   import { SomeType } from '@ctor-game/shared';
   ```

2. **Prevent Circular Dependencies**:
   ```typescript
   // WRONG: Circular dependency
   // server/src/types/game.ts
   import { SharedType } from '../shared';
   export class ServerType extends SharedType {}

   // server/src/shared.ts
   import { ServerType } from './types/game';

   // CORRECT: Keep all types in shared.ts
   // server/src/shared.ts
   import { SharedType } from '@ctor-game/shared';
   export class ServerType extends SharedType {}
   ```

3. **Type Synchronization**:
   ```typescript
   // WRONG: Duplicating shared types
   // server/src/types/game.ts
   export interface GameState { ... } // Duplicate of shared type

   // CORRECT: Re-export from shared package
   // server/src/shared.ts
   export { GameState } from '@ctor-game/shared';
   ```

### Checking for Circular Dependencies

The project includes two tools for detecting circular dependencies:

1. **dependency-cruiser**:
   ```bash
   # Generate a visual dependency graph
   pnpm exec depcruise --include-only "^shared" --output-type dot shared | dot -T svg > dependency-analysis.svg

   # Check for circular dependencies
   pnpm exec depcruise --validate .dependency-cruiser.js shared/
   ```

2. **madge**:
   ```bash
   # Find circular dependencies
   pnpm exec madge --circular shared/

   # Generate a visual dependency graph
   pnpm exec madge --image dependency-graph.svg shared/
   ```

Regular dependency checks should be performed:
- Before committing changes to shared types
- When refactoring module imports
- If TypeScript compilation shows stack size errors
- As part of code review for PRs affecting module structure

If circular dependencies are found:
1. Identify the cycle in the dependency graph
2. Consider these solutions:
   - Move shared types to a common module
   - Use interface segregation
   - Implement dependency inversion
   - Restructure the code to break the cycle
3. Verify the fix with both tools
4. Run TypeScript compilation to confirm

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   # Install pnpm if not installed
   npm install -g pnpm

   # Install project dependencies
   pnpm install
   cd server && pnpm install
   cd ../client && pnpm install
   ```

3. Start development servers:
   ```bash
   # Terminal 1 - Server
   cd server && pnpm dev

   # Terminal 2 - Client
   cd client && pnpm dev
   ```

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend
- `shared/` - Shared TypeScript types
- `docs/` - Project documentation

## Code Style

- Use TypeScript for all new code
- Follow existing code style
- Use ESLint and Prettier configurations
- Write meaningful commit messages following conventional commits

## Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes, following our coding standards

3. Update documentation:
   - Add/modify relevant docs in `/docs`
   - Update README.md if needed
   - Document all new features/APIs

4. Run tests and ensure all pass:
   ```bash
   # Run all tests
   pnpm test              # Unit tests
   pnpm test:integration  # Integration tests
   pnpm test:e2e         # End-to-end tests
   pnpm test:perf        # Performance tests

   # Development testing
   pnpm test:watch       # Watch mode for unit tests
   pnpm test:e2e:open   # Interactive E2E testing

   # Coverage report
   pnpm test:coverage
   ```

   Ensure your changes:
   - Maintain or improve test coverage (minimum 80%)
   - Include tests for new features
   - Don't break existing tests
   - Follow test naming conventions

5. Create a Pull Request:
   - Describe your changes
   - Reference any related issues
   - Update CHANGELOG.md

## Documentation

- Keep documentation up to date with code changes
- Document all WebSocket events and their payloads
- Add debugging tips for common issues
- Update API documentation for new features

## Development Workflow

1. Create a feature branch from develop:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit following conventional commits:
   ```
   feat: add new game feature
   fix: resolve connection issue
   docs: update API documentation
   refactor: improve code structure
   ```

3. Automatic checks on commit:
   - Pre-commit hooks will run:
     - Linting
     - Type checking
     - Unit tests for changed files
     - Code formatting
   - Commit message validation

4. Push and create PR:
   ```bash
   git push origin feature/your-feature-name
   ```

5. CI/CD Process:
   - All tests run automatically
   - Code coverage is reported to Codecov
   - Security scanning with Snyk
   - Build verification

6. After PR approval and merge:
   - Docker images are automatically built
   - Images are pushed to GitHub Container Registry:
     - ghcr.io/[org]/ctorgame/client:latest
     - ghcr.io/[org]/ctorgame/server:latest
   - Slack notification is sent

7. Deployment:
   - Images are automatically deployed to staging
   - After testing, manual promotion to production

## Version Control Guidelines

1. Branch Strategy:
   - main: production-ready code
   - develop: integration branch
   - feature/*: new features
   - fix/*: bug fixes
   - release/*: release preparation

2. Commit Messages:
   - Follow Conventional Commits specification
   - Include scope when relevant
   - Reference issues where appropriate
   - Keep commits focused and atomic

3. Pull Requests:
   - Create PR to develop branch
   - Wait for all checks to pass
   - Get required reviews
   - Keep PR size manageable

## Need Help?

Check our documentation:
- [Development Guide](./docs/development.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Testing Guide](./docs/testing.md)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.