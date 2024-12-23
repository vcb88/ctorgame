# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Work in Progress

### Added
- WebSocket events enum for type-safe event handling
- Strong typing for client-server communication
- Generic types for Socket.IO events
- Improved error handling in GameService
- Game state persistence in database
- Support for game reconnection
- Type-safe event handling in client

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