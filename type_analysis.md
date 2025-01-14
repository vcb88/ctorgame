# Type System Migration Status

## Completed Files

- ✅ server/src/services/EventService.ts
- ✅ server/src/services/RedisService.ts
- ✅ server/src/services/GameService.ts
- ✅ server/src/services/GameLogicService.ts
- ✅ server/src/services/GameStorageService.ts
- ✅ shared/src/types/network/events.ts (migrated from events.new.ts)
- ✅ shared/src/types/storage/metadata.ts (updated to use new types)

## Files Requiring Migration

### Server Services (Priority High)
✅ GameService migration completed:
- Migrated GameService.next.ts to new type system
- Added new methods to GameStorageService and RedisService
- Combined functionality from old and new versions

✅ WebSocket Layer migration in progress:
- Migrated GameServer.events.ts to new type system
- Migrated GameServer.ts to new type system
- Removed obsolete GameServer.new.ts

TODO: Add tests for:
1. GameService:
   - Test game code generation and uniqueness
   - Test state management with Redis
   - Test proper cleanup and expiration
   - Test interaction with EventService
2. GameStorageService:
   - Test new findGameByCode method
   - Test markGameExpired method
3. RedisService:
   - Test expireGameState method
   - Test deleteGameState method
4. WebSocket Layer:
   - Test reconnection handling
   - Test game code functionality
   - Test event validation
   - Test error handling

### WebSocket Layer Still Requiring Migration (Priority High)
1. ./server/src/websocket/handlers/gameHandlers.new.ts
2. ./server/src/websocket/handlers/gameHandlers.ts
3. ./server/src/websocket/handlers/replayHandlers.ts
4. ./server/src/types/events.ts

### Client Hooks (Priority Medium)
11. ./client/src/hooks/useMultiplayerGameNew.ts
12. ./client/src/hooks/useGame.ts
13. ./client/src/hooks/useMultiplayerGame.ts
14. ./client/src/hooks/useReplay.ts
15. ./client/src/hooks/useGameHistory.ts

### Client Services (Priority Medium)
16. ./client/src/services/GameStateManager.ts
17. ./client/src/services/ActionQueue.new.ts
18. ./client/src/services/ActionQueue.ts
19. ./client/src/services/ai/index.ts

### Client Types (Priority High)
20. ./client/src/types/game.d.ts
21. ./client/src/types/animations.ts
22. ./client/src/types/errors.new.ts
23. ./client/src/types/gameManager.ts

### Client Validation (Priority Medium)
24. ./client/src/validation/game.ts
25. ./client/src/validation/stateValidation.ts

### Tests (Priority Low)
26. ./client/src/hooks/__tests__/disabled.useReplay.test.ts
27. ./client/src/hooks/__tests__/disabled.useGameHistory.test.ts
28. ./client/src/hooks/disabled.useMultiplayerGame.test.ts
29. ./client/src/services/ai/__tests__/disabled.index.test.ts
30. ./client/src/validation/__tests__/disabled.stateValidation.test.ts
31. ./src/game/__tests__/rules.test.ts

### Backup Files (Priority Low)
32. ./backup/shared/src/**/*

### Other Files
33. ./src/hooks/useSocket.ts
34. ./src/types/socket.ts
35. ./src/game/rules.ts

## Migration Tasks and Notes

1. First Priority: Complete server services migration (.new and .next files)
2. Second Priority: WebSocket layer and server types
3. Third Priority: Client types and core functionality
4. Fourth Priority: Client features and validation
5. Final Priority: Tests and backup files

## Key Changes Required

1. Replace enum types with string literals/union types
2. Update state management (remove currentTurn, use new game state structure)
3. Update score handling (use player1/player2 instead of indexed access)
4. Make interfaces immutable (add readonly)
5. Use proper typing for moves and game state
6. Update validation logic to match new type system
7. Ensure all files use consistent import paths
8. Remove timestamp from moves
9. Update board access (direct array instead of cells property)

## Questions and Dependencies

1. Verify if .new and .next files should be merged or replaced
2. Check if any files in backup are still needed
3. Verify if all disabled tests should be updated or removed
4. Consider updating file organization to better reflect new type system