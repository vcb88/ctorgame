import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GameService } from '../GameService.new';
import { GameLogicService } from '../GameLogicService';
import type { 
    IGameState, 
    PlayerNumber, 
    IPlayer,
    GameMove,
    GameStatus 
} from '@ctor-game/shared/types/game/types';

// Mock MongoDB
jest.mock('mongodb', () => {
    return {
        MongoClient: jest.fn().mockImplementation(() => ({
            connect: jest.fn(),
            db: jest.fn(() => ({
                collection: jest.fn(() => ({
                    createIndex: jest.fn(),
                    findOne: jest.fn(),
                    insertOne: jest.fn(),
                    findOneAndUpdate: jest.fn(),
                    find: jest.fn(() => ({
                        sort: jest.fn(() => ({
                            limit: jest.fn(() => ({
                                toArray: jest.fn()
                            }))
                        }))
                    })),
                    updateOne: jest.fn()
                }))
            })),
            close: jest.fn()
        }))
    };
});

describe('GameService', () => {
    let service: GameService;
    let mockPlayer: IPlayer;
    let initialState: IGameState;

    beforeEach(() => {
        service = new GameService('mongodb://test');
        mockPlayer = {
            id: 'test-player',
            number: 1 as PlayerNumber
        };
        initialState = GameLogicService.createInitialState();
        jest.clearAllMocks();
    });

    describe('createGame', () => {
        it('should create new game with correct initial state', async () => {
            const game = await service.createGame('test-game', mockPlayer, initialState);
            expect(game).toBeDefined();
            expect(game.status).toBe('waiting');
            expect(game.players.first).toBe(mockPlayer.id);
        });
    });

    describe('joinGame', () => {
        it('should add second player to existing game', async () => {
            const mockGame = {
                gameId: 'test-game',
                code: '1234',
                status: 'waiting' as GameStatus,
                players: { first: 'player1' }
            };
            
            const mockResult = {
                ...mockGame,
                status: 'playing',
                players: { first: 'player1', second: 'player2' }
            };

            const player2: IPlayer = {
                id: 'player2',
                number: 2 as PlayerNumber
            };

            const collection = service['gamesCollection'];
            (collection.findOneAndUpdate as jest.Mock).mockResolvedValue(mockResult);

            const result = await service.joinGame('test-game', player2);
            expect(result.status).toBe('playing');
            expect(result.players.second).toBe('player2');
        });
    });

    describe('makeMove', () => {
        it('should apply move and update game state', async () => {
            const mockGame = {
                gameId: 'test-game',
                code: '1234',
                status: 'playing' as GameStatus,
                currentState: initialState,
                startTime: new Date().toISOString()
            };

            const move: GameMove = {
                type: 'place',
                position: { x: 0, y: 0 },
                player: 1,
                timestamp: Date.now()
            };

            const collection = service['gamesCollection'];
            (collection.findOne as jest.Mock).mockResolvedValue(mockGame);
            (collection.findOneAndUpdate as jest.Mock).mockResolvedValue({
                ...mockGame,
                currentState: {
                    ...initialState,
                    board: {
                        ...initialState.board,
                        cells: initialState.board.cells.map((row, y) =>
                            row.map((cell, x) => (x === 0 && y === 0 ? 1 : cell))
                        )
                    }
                }
            });

            const result = await service.makeMove('test-game', 1, move);
            expect(result).toBeDefined();
            expect(result.currentState.board.cells[0][0]).toBe(1);
        });

        it('should reject move in finished game', async () => {
            const mockGame = {
                gameId: 'test-game',
                status: 'finished' as GameStatus,
                currentState: initialState
            };

            const move: GameMove = {
                type: 'place',
                position: { x: 0, y: 0 },
                player: 1,
                timestamp: Date.now()
            };

            const collection = service['gamesCollection'];
            (collection.findOne as jest.Mock).mockResolvedValue(mockGame);

            await expect(service.makeMove('test-game', 1, move))
                .rejects
                .toThrow('Game is already completed');
        });
    });

    describe('getPlayer', () => {
        it('should return player info for valid player id', async () => {
            const mockGame = {
                gameId: 'test-game',
                players: {
                    first: 'player1',
                    second: 'player2'
                }
            };

            const collection = service['gamesCollection'];
            (collection.findOne as jest.Mock).mockResolvedValue(mockGame);

            const player = await service.getPlayer('test-game', 'player1');
            expect(player).toBeDefined();
            expect(player?.number).toBe(1);
        });

        it('should return null for invalid player id', async () => {
            const mockGame = {
                gameId: 'test-game',
                players: {
                    first: 'player1',
                    second: 'player2'
                }
            };

            const collection = service['gamesCollection'];
            (collection.findOne as jest.Mock).mockResolvedValue(mockGame);

            const player = await service.getPlayer('test-game', 'invalid-player');
            expect(player).toBeNull();
        });
    });

    describe('finishGame', () => {
        it('should update game status to finished', async () => {
            const mockGame = {
                gameId: 'test-game',
                status: 'playing' as GameStatus,
                startTime: new Date().toISOString()
            };

            const collection = service['gamesCollection'];
            (collection.findOne as jest.Mock).mockResolvedValue(mockGame);

            await service.finishGame('test-game', 1, { 1: 5, 2: 3 });

            expect(collection.updateOne).toHaveBeenCalled();
            const updateCall = (collection.updateOne as jest.Mock).mock.calls[0];
            expect(updateCall[1].$set.status).toBe('finished');
            expect(updateCall[1].$set.winner).toBe(1);
        });
    });
});