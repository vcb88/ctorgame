# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Work in Progress

### Added
- Enhanced CI/CD automation:
  - Automatic tests on every commit
  - Docker image builds after successful merge
  - Dual image publishing to GHCR (client and server)
  - Improved test coverage reporting
  - Slack notifications for builds
- Development tooling:
  - Husky pre-commit hooks
  - Commitlint for conventional commits
  - Lint-staged for pre-commit checks
  - Enhanced TypeScript type checking
- Documentation improvements:
  - Detailed CI/CD process documentation
  - Updated development workflow
  - Container registry usage guide
  - Testing and deployment guides

### Added
- Comprehensive testing infrastructure:
  - Integration tests for game flow and WebSocket communication
  - E2E tests with Cypress for full user scenarios
  - Performance tests using k6 for load testing
  - Unit tests for React hooks and game logic
  - Custom Cypress commands for game testing
    - Game flow automation
    - State verification
    - Network condition simulation
    - Reconnection handling
- CI/CD pipeline with GitHub Actions:
  - Automated testing
  - Docker image building
  - Staging and production deployments
- Docker configuration improvements:
  - Development environment with hot reload
  - Production-ready multi-stage builds
  - Nginx reverse proxy setup
  - Database and cache services
- Test utilities and helpers:
  - Database management for tests
  - Redis utilities for test environment
  - WebSocket testing helpers
  - React testing utilities

### Added
- Database integration started:
  - TypeORM and PostgreSQL setup
  - Game and Move entities defined
  - Basic GameService implementation
  - Integration with WebSocket server (in progress)
- Real-time multiplayer functionality
- Game room creation and joining
- Move validation and game state management
- Win/draw detection
- Basic error handling
- Comprehensive documentation
- Development environment setup
- WebSocket event system
- Game state management

### Changed
- Server codebase from ESM to CommonJS
- Improved type definitions
- Better project structure
- Enhanced documentation

### Fixed
- Module system conflicts
- TypeScript configuration
- Development setup issues

## [0.1.0] - 2024-12-23

### Added
- Initial project setup
- Basic game logic
- Client-server communication
- Project documentation
- Development configuration