import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { redisService } from '../RedisService';
import { redisClient, REDIS_KEYS, REDIS_EVENTS } from '../../config/redis';
import { GameLogicService } from '../GameLogicService';
import { IGameState, IPlayer } from '@ctor-game/shared/types';
import { IGameEvent, GameEventType } from '@ctor-game/shared/types/events';

// Мокаем Redis и GameLogicService
jest.mock('../../config/redis', () => ({
    redisClient: {
        set: jest.fn(),
        get: jest.fn(),
        setex: jest.fn(),
        sadd: jest.fn(),
        srem: jest.fn(),
        smembers: jest.fn(),
        del: jest.fn(),
        multi: jest.fn(() => ({
            set: jest.fn().mockReturnThis(),
            del: jest.fn().mockReturnThis(),
            lpush: jest.fn().mockReturnThis(),
            expire: jest.fn().mockReturnThis(),
            exec: jest.fn()
        })),
        publish: jest.fn()
    },
    REDIS_KEYS: {
        GAME_STATE: (id: string) => `game:${id}:state`,
        GAME_ROOM: (id: string) => `game:${id}:room`,
        PLAYER_SESSION: (id: string) => `player:${id}:session`,
        GAME_EVENTS: (id: string) => `game:${id}:events`,
        ACTIVE_GAMES: 'games:active'
    },
    REDIS_EVENTS: {
        GAME_STATE_UPDATED: 'game:state:updated',
        PLAYER_DISCONNECTED: 'player:disconnected'
    },
    withLock: jest.fn((_, fn) => fn())
}));

jest.mock('../GameLogicService', () => ({
    GameLogicService: {
        isValidMove: jest.fn(),
        applyMove: jest.fn()
    }
}));

describe('RedisService', () => {
    const mockGameState: IGameState = {
        board: {
            cells: Array(10).fill(null).map(() => Array(10).fill(null)),
            size: { width: 10, height: 10 }
        },
        currentTurn: {
            placeOperationsLeft: 2,
            moves: []
        },
        scores: {
            player1: 0,
            player2: 0
        },
        gameOver: false,
        winner: null,
        isFirstTurn: true,
        currentPlayer: 0
    };

    const mockPlayer: IPlayer = {
        id: 'test-socket',
        number: 0
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Game State Management', () => {
        it('should save game state', async () => {
            await redisService.setGameState('test-game', mockGameState);

            expect(redisClient.multi).toHaveBeenCalled();
            expect(redisClient.multi().set).toHaveBeenCalled();
            expect(redisClient.multi().publish).toHaveBeenCalled();
        });

        it('should get game state', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockGameState));

            const state = await redisService.getGameState('test-game');

            expect(redisClient.get).toHaveBeenCalledWith(REDIS_KEYS.GAME_STATE('test-game'));
            expect(state).toEqual(mockGameState);
        });

        it('should update game state with move validation', async () => {
            (GameLogicService.isValidMove as jest.Mock).mockReturnValue(true);
            (GameLogicService.applyMove as jest.Mock).mockReturnValue(mockGameState);
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockGameState));

            await redisService.updateGameState('test-game', 0, { x: 0, y: 0 });

            expect(GameLogicService.isValidMove).toHaveBeenCalled();
            expect(GameLogicService.applyMove).toHaveBeenCalled();
        });
    });

    describe('Player Session Management', () => {
        it('should save player session', async () => {
            await redisService.setPlayerSession('test-socket', 'test-game', 0);

            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should get player session', async () => {
            const mockSession = { gameId: 'test-game', playerNumber: 0 };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

            const session = await redisService.getPlayerSession('test-socket');

            expect(redisClient.get).toHaveBeenCalled();
            expect(session).toEqual(mockSession);
        });

        it('should remove player session', async () => {
            const mockSession = { gameId: 'test-game', playerNumber: 0 };
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify(mockSession));

            await redisService.removePlayerSession('test-socket');

            expect(redisClient.multi).toHaveBeenCalled();
            expect(redisClient.multi().del).toHaveBeenCalled();
            expect(redisClient.multi().publish).toHaveBeenCalled();
        });
    });

    describe('Game Room Management', () => {
        it('should save game room', async () => {
            await redisService.setGameRoom('test-game', [mockPlayer]);

            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should get game room', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify([mockPlayer]));

            const room = await redisService.getGameRoom('test-game');

            expect(redisClient.get).toHaveBeenCalled();
            expect(room).toEqual([mockPlayer]);
        });

        it('should add player to room', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify([mockPlayer]));

            await redisService.addPlayerToRoom('test-game', { ...mockPlayer, number: 1 });

            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should throw error when room is full', async () => {
            (redisClient.get as jest.Mock).mockResolvedValue(
                JSON.stringify([mockPlayer, { ...mockPlayer, number: 1 }])
            );

            await expect(
                redisService.addPlayerToRoom('test-game', { ...mockPlayer, number: 2 })
            ).rejects.toThrow('Room is full');
        });
    });

    describe('Active Games Management', () => {
        it('should add active game', async () => {
            await redisService.addActiveGame('test-game');

            expect(redisClient.sadd).toHaveBeenCalledWith(
                REDIS_KEYS.ACTIVE_GAMES,
                'test-game'
            );
        });

        it('should remove active game', async () => {
            await redisService.removeActiveGame('test-game');

            expect(redisClient.srem).toHaveBeenCalledWith(
                REDIS_KEYS.ACTIVE_GAMES,
                'test-game'
            );
        });

        it('should get active games', async () => {
            const mockGames = ['game1', 'game2'];
            (redisClient.smembers as jest.Mock).mockResolvedValue(mockGames);

            const games = await redisService.getActiveGames();

            expect(redisClient.smembers).toHaveBeenCalledWith(REDIS_KEYS.ACTIVE_GAMES);
            expect(games).toEqual(mockGames);
        });
    });

    describe('Game Events', () => {
        it('should add game event', async () => {
            const event: IGameEvent = {
                type: GameEventType.MOVE,
                gameId: 'test-game',
                playerId: 'test-player',
                data: {},
                timestamp: Date.now()
            };

            await redisService.addGameEvent(event);

            expect(redisClient.multi).toHaveBeenCalled();
            expect(redisClient.multi().lpush).toHaveBeenCalled();
            expect(redisClient.multi().expire).toHaveBeenCalled();
        });

        it('should get game events', async () => {
            const mockEvents = ['event1', 'event2'].map(e => JSON.stringify(e));
            (redisClient.lrange as jest.Mock).mockResolvedValue(mockEvents);

            const events = await redisService.getGameEvents('test-game', 2);

            expect(redisClient.lrange).toHaveBeenCalled();
            expect(events).toHaveLength(2);
        });
    });

    describe('Cleanup', () => {
        it('should cleanup game data', async () => {
            await redisService.cleanupGame('test-game');

            expect(redisClient.multi).toHaveBeenCalled();
            expect(redisClient.multi().del).toHaveBeenCalled();
            expect(redisClient.multi().srem).toHaveBeenCalled();
        });
    });
});