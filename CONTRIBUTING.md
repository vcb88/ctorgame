# Contributing to CTORGame

Thank you for your interest in contributing to CTORGame! This document provides guidelines and instructions for contributing to the project.

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