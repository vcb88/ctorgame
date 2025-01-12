# Changelog

All notable changes to this project will be documented in this file.

## [0.3.1] - 2025-01-10

### Added
- AI service infrastructure with position evaluation and move analysis
- Legacy features documentation detailing valuable components
- Type definitions for AI and position analysis
- Initial integration of enhanced visualization components
- Comprehensive test suite for AI functionality

## [Unreleased]

### Added
- Enhanced error handling and connection management:
  - Detailed error types and connection states
  - Reconnection mechanism with retries
  - Operation timeouts and validation
  - Improved error reporting with context
  - Recovery and retry capabilities
  - Connection state management
  - Operation tracking with timeouts
  - Event tracking for state recovery
- Game mechanics implementation with capture detection
- Score tracking system
- Enhanced game state management
- Comprehensive game rules documentation
- Updated WebSocket API documentation
- Score visualization component

### Changed
- Migrated to Socket.IO for improved reliability
- Enhanced state management in multiplayer games
- Updated game state interface with proper types

### Fixed
- Proper handling of game end conditions
- Score calculation during captures
- Turn management and operation counting

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
- Connection state handling in GameJoined event
- Replaced deprecated `vi.any()` with `expect.any()` in hook tests for better compatibility with Vitest
- Improved socket testing utilities with better event handling and typing
- Fixed React 18 compatibility issues in tests
- Enhanced test infrastructure:
  * Added proper socket mocking utilities
  * Improved async test handling
  * Better type safety in test files

## [0.1.0] - 2024-12-23

### Added
- Initial project setup
- Basic game logic
- Client-server communication
- Project documentation
- Development configuration