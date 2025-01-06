import { redisClient, REDIS_KEYS, acquireLock, releaseLock, withLock } from '../redis';
import Redis from 'ioredis';

// Мокаем Redis
jest.mock('ioredis');

describe('Redis Configuration', () => {
    let mockSet: jest.Mock;
    let mockDel: jest.Mock;

    beforeEach(() => {
        // Очищаем моки перед каждым тестом
        jest.clearAllMocks();
        
        // Настраиваем моки для методов Redis
        mockSet = jest.fn();
        mockDel = jest.fn();
        (Redis as jest.Mock).mockImplementation(() => ({
            set: mockSet,
            del: mockDel,
            on: jest.fn()
        }));
    });

    describe('Redis Keys', () => {
        it('should generate correct game state key', () => {
            const gameId = 'test-game';
            expect(REDIS_KEYS.GAME_STATE(gameId)).toBe('game:test-game:state');
        });

        it('should generate correct player session key', () => {
            const socketId = 'test-socket';
            expect(REDIS_KEYS.PLAYER_SESSION(socketId)).toBe('player:test-socket:session');
        });

        it('should generate correct game room key', () => {
            const gameId = 'test-game';
            expect(REDIS_KEYS.GAME_ROOM(gameId)).toBe('game:test-game:room');
        });
    });

    describe('Lock Mechanism', () => {
        it('should acquire lock successfully', async () => {
            mockSet.mockResolvedValueOnce('OK');
            
            const result = await acquireLock('test-game');
            
            expect(result).toBe(true);
            expect(mockSet).toHaveBeenCalledWith(
                'game:test-game:lock',
                expect.any(String),
                'NX',
                'PX',
                5000
            );
        });

        it('should fail to acquire lock when already locked', async () => {
            mockSet.mockResolvedValueOnce(null);
            
            const result = await acquireLock('test-game');
            
            expect(result).toBe(false);
        });

        it('should release lock', async () => {
            await releaseLock('test-game');
            
            expect(mockDel).toHaveBeenCalledWith('game:test-game:lock');
        });

        it('should execute operation with lock', async () => {
            mockSet.mockResolvedValueOnce('OK');
            const operation = jest.fn().mockResolvedValueOnce('result');
            
            const result = await withLock('test-game', operation);
            
            expect(result).toBe('result');
            expect(mockSet).toHaveBeenCalled();
            expect(mockDel).toHaveBeenCalled();
            expect(operation).toHaveBeenCalled();
        });

        it('should release lock even if operation fails', async () => {
            mockSet.mockResolvedValueOnce('OK');
            const operation = jest.fn().mockRejectedValueOnce(new Error('test error'));
            
            await expect(withLock('test-game', operation)).rejects.toThrow('test error');
            
            expect(mockDel).toHaveBeenCalled();
        });

        it('should throw if cannot acquire lock', async () => {
            mockSet.mockResolvedValueOnce(null);
            const operation = jest.fn();
            
            await expect(withLock('test-game', operation)).rejects.toThrow('Could not acquire lock');
            
            expect(operation).not.toHaveBeenCalled();
        });
    });
});