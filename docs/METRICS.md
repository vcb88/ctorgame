# Project Metrics

This document contains various metrics for the ctorgame project as of January 4, 2025.

## Code Base Metrics

### Lines of Code by Language
| Language    | Files | Blank Lines | Comment Lines | Code Lines |
|------------|-------|-------------|---------------|------------|
| YAML       | 11    | 4,649      | 9             | 16,594     |
| Markdown   | 34    | 1,392      | 0             | 6,669      |
| TypeScript | 108   | 1,024      | 460           | 6,569      |
| JSON       | 18    | 1          | 0             | 5,324      |
| JavaScript | 6     | 17         | 14            | 367        |
| HTML       | 4     | 27         | 0             | 365        |
| CSS        | 3     | 53         | 2             | 227        |
| Dockerfile | 6     | 59         | 44            | 82         |
| INI        | 1     | 0          | 0             | 5          |
| **Total**  | 191   | 7,222      | 529           | 36,202     |

### Key Metrics
- Total Files: 191
- Total Lines of Code: 36,202
- Total Lines (including blanks and comments): 43,953
- Comment Ratio: ~1.46%
- Average Lines per File: 189.5

## Testing Metrics
- Number of Test Files: 57
- Test Coverage: To be measured with coverage tool

## Git Repository Metrics

### Contribution Statistics
| Author          | Commits |
|-----------------|---------|
| Claude AI       | 174     |
| vcb88          | 79      |
| Slava Karpizin | 26      |
| **Total**      | 279     |

### Change Volume
- Total Files Changed: 677
- Total Lines Inserted: 68,517
- Total Lines Deleted: 24,594
- Net Line Change: +43,923

## Project Structure
- Frontend (client/): React application with TypeScript
- Backend (server/): Node.js/Express server with TypeScript
- Shared (shared/): Common types and utilities
- Documentation (docs/): Project documentation
- Tests: Distributed across components

## Architecture Highlights
- Microservices architecture
- WebSocket-based real-time communication
- Docker containerization
- MongoDB for persistent storage
- Redis for state management
- TypeScript throughout the stack

## Development Infrastructure
- CI/CD Pipeline: GitHub Actions
- Containerization: Docker & Docker Compose
- Package Management: pnpm
- Type Checking: TypeScript
- Testing Framework: Jest/Vitest
- Code Quality: ESLint, Prettier

## Notes
- The project shows a healthy balance between code and documentation
- Strong TypeScript adoption across the codebase
- Significant test coverage with dedicated test files
- Active development with regular contributions
- Comprehensive documentation in Markdown