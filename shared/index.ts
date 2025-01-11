// Re-export everything
export * from './types/game.js';
export * from './types/player.js';
export * from './types/coordinates.js';
export * from './types/websocket.js';
export * from './types/replay.js';
export * from './types/redis.js';
export * from './types/events.js';
export * from './types/storage.js';
export * from './types/ai.js';
export * from './validation/game.js';

// Export utility types and functions
export type { ReplaceCandidate } from './src/index.js';