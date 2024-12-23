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

4. Run tests (when implemented)
   ```bash
   pnpm test
   ```

5. Create a Pull Request:
   - Describe your changes
   - Reference any related issues
   - Update CHANGELOG.md

## Documentation

- Keep documentation up to date with code changes
- Document all WebSocket events and their payloads
- Add debugging tips for common issues
- Update API documentation for new features

## Git Workflow

1. Commit messages should follow conventional commits:
   ```
   feat: add new game feature
   fix: resolve connection issue
   docs: update API documentation
   refactor: improve code structure
   ```

2. Keep commits focused and atomic

3. Rebase feature branches on main before PR

## Need Help?

Check our documentation:
- [Development Guide](./docs/development.md)
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [Testing Guide](./docs/testing.md)

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.