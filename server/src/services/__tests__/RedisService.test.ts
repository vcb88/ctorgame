import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { RedisService } from '../RedisService.new.js';
import { redisClient, REDIS_KEYS, REDIS_EVENTS } from '../../config/redis.js';
import { GameLogicService } from '../GameLogicService.js';
import type { 
    GameState, 
    PlayerNumber, 
    Player,
    GameStatus
} from '@ctor-game/shared/types/game/types.js';

// Mock Redis client
jest.mock('../../config/redis', () => ({
    redisClient: {
        get: jest.fn(),
        set: jest.fn(),
        setex: jest.fn(),
        del: jest.fn(),
        sadd: jest.fn(),
        srem: jest.fn(),
        smembers: jest.fn(),
        multi: jest.fn(() => ({
            set: () => ({ publish: () => ({ exec: jest.fn() }) }),
            del: () => ({ srem: () => ({ exec: jest.fn() }) }),
            lpush: () => ({ expire: () => ({ exec: jest.fn() }) }),
            hset: () => ({ expire: () => ({ exec: jest.fn() }) })
        }))
    },
    REDIS_KEYS: {
        GAME_STATE: (id: string) => `game:${id}:state`,
        PLAYER_SESSION: (id: string) => `player:${id}:session`,
        GAME_ROOM: (id: string) => `game:${id}:room`,
        GAME_EVENTS: (id: string) => `game:${id}:events`,
        GAME_STATS: 'game:stats',
        ACTIVE_GAMES: 'games:active'
    },
    REDIS_EVENTS: {
        GAME_STATE_UPDATED: 'game:state:updated',
        PLAYER_DISCONNECTED: 'player:disconnected'
    },
    withLock: jest.fn((key, callback) => callback())
}));

describe('RedisService', () => {
    let service: RedisService;
    let mockState: GameState;
    let mockPlayer: Player;

    beforeEach(() => {
        service = new RedisService();
        mockState = GameLogicService.createInitialState();
        mockPlayer = {
            id: 'test-socket-id',
            name: 'Test Player',
            number: 1 as PlayerNumber,
            connected: true
        };
        jest.clearAllMocks();
    });

    describe('Game State Management', () => {
        it('should save game state', async () => {
            await service.setGameState('test-game', mockState);
            expect(redisClient.multi).toHaveBeenCalled();
        });

        it('should retrieve game state', async () => {
            const mockRedisState = {
                ...mockState,
                lastUpdate: Date.now()
            };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRedisState));

            const state = await service.getGameState('test-game');
            expect(state).toBeDefined();
            expect(state?.currentPlayer).toBe(mockState.currentPlayer);
        });

        it('should return null for non-existent game state', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(null);

            const state = await service.getGameState('non-existent');
            expect(state).toBeNull();
        });
    });

    describe('Player Session Management', () => {
        it('should save player session', async () => {
            await service.setPlayerSession('test-socket', 'test-game', 1);
            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should retrieve player session', async () => {
            const mockSession = {
                gameId: 'test-game',
                playerNumber: 1,
                lastActivity: Date.now()
            };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

            const session = await service.getPlayerSession('test-socket');
            expect(session).toBeDefined();
            expect(session?.gameId).toBe('test-game');
        });

        it('should update player activity', async () => {
            const mockSession = {
                gameId: 'test-game',
                playerNumber: 1,
                lastActivity: Date.now()
            };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

            await service.updatePlayerActivity('test-socket');
            expect(redisClient.setex).toHaveBeenCalled();
        });
    });

    describe('Game Room Management', () => {
        it('should create game room with correct status', async () => {
            await service.setGameRoom('test-game', [mockPlayer]);
            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should add player to room', async () => {
            const mockRoom = {
                players: [mockPlayer],
                status: 'waiting' as GameStatus,
                lastUpdate: Date.now()
            };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRoom));

            const newPlayer: Player = {
                id: 'player-2',
                name: 'Player 2',
                number: 2 as PlayerNumber,
                connected: true
            };

            await service.addPlayerToRoom('test-game', newPlayer);
            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should remove player from room', async () => {
            const mockRoom = {
                players: [mockPlayer],
                status: 'waiting' as GameStatus,
                lastUpdate: Date.now()
            };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRoom));

            await service.removePlayerFromRoom('test-game', mockPlayer.id);
            expect(redisClient.del).toHaveBeenCalled();
        });
    });

    describe('Game Management', () => {
        it('should create new game', async () => {
            await service.createGame('test-game', mockPlayer, mockState);
            expect(redisClient.multi).toHaveBeenCalled();
            expect(redisClient.sadd).toHaveBeenCalled();
        });

        it('should join existing game', async () => {
            const mockRoom = {
                players: [mockPlayer],
                status: 'waiting' as GameStatus,
                lastUpdate: Date.now()
            };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockRoom));

            const player2: Player = {
                id: 'player-2',
                name: 'Player 2',
                number: 2 as PlayerNumber,
                connected: true
            };

            await service.joinGame('test-game', player2);
            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should get correct current player', () => {
            expect(service.getCurrentPlayer(mockState)).toBe(1);
            mockState.currentTurn.moves.push({
                type: 'place',
                position: [0, 0],
                player: 1,
                timestamp: Date.now()
            });
            expect(service.getCurrentPlayer(mockState)).toBe(2);
        });
    });
});