import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { redisService } from '../RedisService';
import { redisClient, REDIS_KEYS, REDIS_EVENTS } from '../../config/redis';
import { GameLogicService } from '../GameLogicService';
import { IGameState, IPlayer, Player, IScores, IGameEvent, GameEventType } from '../../shared';

// Мокаем Redis и GameLogicService
jest.mock('../../config/redis', () => {
    const mockRedisClient = {
        set: jest.fn(() => Promise.resolve('OK')),
        get: jest.fn(() => Promise.resolve(null)),
        setex: jest.fn(() => Promise.resolve('OK' as const)),
        sadd: jest.fn(() => Promise.resolve(1)),
        srem: jest.fn(() => Promise.resolve(1)),
        smembers: jest.fn(() => Promise.resolve(['game1', 'game2'])),
        del: jest.fn(() => Promise.resolve(1)),
        lrange: jest.fn(() => Promise.resolve([])),
        multi: jest.fn(() => ({
            set: jest.fn().mockReturnThis(),
            del: jest.fn().mockReturnThis(),
            lpush: jest.fn().mockReturnThis(),
            expire: jest.fn().mockReturnThis(),
            exec: jest.fn(() => Promise.resolve(['OK' as const])),
            publish: jest.fn().mockReturnThis(),
            srem: jest.fn().mockReturnThis()
        })),
        publish: jest.fn(() => Promise.resolve(1))
    };

    return {
        redisClient: mockRedisClient,
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
        withLock: jest.fn((_: string, fn: () => Promise<unknown>) => Promise.resolve(fn()))
    };
});

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
            [Player.First]: 0,
            [Player.Second]: 0
        } as IScores,
        gameOver: false,
        winner: null,
        isFirstTurn: true,
        currentPlayer: Player.First
    };

    const mockPlayer: IPlayer = {
        id: 'test-socket',
        number: Player.First
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
            jest.mocked(redisClient.get).mockResolvedValue(JSON.stringify(mockGameState));

            const state = await redisService.getGameState('test-game');

            expect(redisClient.get).toHaveBeenCalledWith(REDIS_KEYS.GAME_STATE('test-game'));
            expect(state).toEqual(mockGameState);
        });

        it('should update game state with move validation', async () => {
            jest.mocked(GameLogicService.isValidMove).mockReturnValue(true);
            jest.mocked(GameLogicService.applyMove).mockReturnValue(mockGameState);
            jest.mocked(redisClient.get).mockResolvedValue(JSON.stringify(mockGameState));

            await redisService.updateGameState('test-game', Player.First, { x: 0, y: 0 });

            expect(GameLogicService.isValidMove).toHaveBeenCalled();
            expect(GameLogicService.applyMove).toHaveBeenCalled();
        });
    });

    describe('Player Session Management', () => {
        const mockSession = { gameId: 'test-game', playerNumber: Player.First };

        it('should save player session', async () => {
            await redisService.setPlayerSession('test-socket', 'test-game', Player.First);

            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should get player session', async () => {
            jest.mocked(redisClient.get).mockResolvedValue(JSON.stringify(mockSession));

            const session = await redisService.getPlayerSession('test-socket');

            expect(redisClient.get).toHaveBeenCalled();
            expect(session).toEqual(mockSession);
        });

        it('should remove player session', async () => {
            jest.mocked(redisClient.get).mockResolvedValue(JSON.stringify(mockSession));

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
            jest.mocked(redisClient.get).mockResolvedValue(JSON.stringify([mockPlayer]));

            const room = await redisService.getGameRoom('test-game');

            expect(redisClient.get).toHaveBeenCalled();
            expect(room).toEqual([mockPlayer]);
        });

        it('should add player to room', async () => {
            jest.mocked(redisClient.get).mockResolvedValue(JSON.stringify([mockPlayer]));

            await redisService.addPlayerToRoom('test-game', { ...mockPlayer, number: Player.Second });

            expect(redisClient.setex).toHaveBeenCalled();
        });

        it('should throw error when room is full', async () => {
            jest.mocked(redisClient.get).mockResolvedValue(
                JSON.stringify([mockPlayer, { ...mockPlayer, number: Player.Second }])
            );

            await expect(
                redisService.addPlayerToRoom('test-game', { ...mockPlayer, number: Player.None })
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
            jest.mocked(redisClient.smembers).mockResolvedValue(mockGames);

            const games = await redisService.getActiveGames();

            expect(redisClient.smembers).toHaveBeenCalledWith(REDIS_KEYS.ACTIVE_GAMES);
            expect(games).toEqual(mockGames);
        });
    });

    describe('Game Events', () => {
        it('should add game event', async () => {
            const event = {
                type: GameEventType.Move,
                gameId: 'test-game',
                playerId: 'test-player',
                data: {},
                timestamp: Date.now()
            } as const;

            await redisService.addGameEvent(event);

            expect(redisClient.multi).toHaveBeenCalled();
            expect(redisClient.multi().lpush).toHaveBeenCalled();
            expect(redisClient.multi().expire).toHaveBeenCalled();
        });

        it('should get game events', async () => {
            const mockEvents = ['event1', 'event2'].map(e => JSON.stringify(e));
            jest.mocked(redisClient.lrange).mockResolvedValue(mockEvents);

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