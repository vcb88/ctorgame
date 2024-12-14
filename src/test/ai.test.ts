import { describe, it, expect } from 'vitest';
import { AI } from '@/ai';
import { P, Board } from '@/types';
import { GRID_WIDTH, GRID_HEIGHT } from '@/constants';

describe('AI', () => {
  // Создаем доску с учетом настроенных размеров
  const createTestBoard = (): Board => 
    Array(GRID_WIDTH).fill(null).map(() => Array(GRID_HEIGHT).fill(P.N));

  describe('evalDanger', () => {
    it('should detect danger when piece is surrounded by opponents', () => {
      const board = createTestBoard();
      board[1][1] = P.B;
      board[0][0] = P.A;
      board[0][1] = P.A;
      board[0][2] = P.A;
      board[1][0] = P.A;
      board[1][2] = P.A;
      
      const danger = AI.evalDanger(board, 1, 1, P.B);
      expect(danger).toBeGreaterThan(0);
    });

    it('should return 0 when piece is safe', () => {
      const board = createTestBoard();
      board[1][1] = P.B;
      board[0][1] = P.A;
      
      const danger = AI.evalDanger(board, 1, 1, P.B);
      expect(danger).toBe(0);
    });
  });

  describe('evalBlock', () => {
    it('should detect potential opponent replacements', () => {
      const board = createTestBoard();
      // Создаем ситуацию, где у противника 4 фишки вокруг нашей
      board[1][1] = P.B; // наша фишка
      board[0][0] = P.A;
      board[0][1] = P.A;
      board[0][2] = P.A;
      board[1][0] = P.A;
      board[1][2] = P.A;
      
      const blocking = AI.evalBlock(board, 1, 1, P.B);
      expect(blocking).toBeGreaterThan(0);
    });
  });

  describe('findMove', () => {
    it('should find best move when evaluating empty board', () => {
      const board = createTestBoard();
      // Добавляем несколько фишек для создания предпочтительной позиции
      board[1][1] = P.A;
      board[1][2] = P.A;
      
      const move = AI.findMove(board, P.B);
      expect(move).toBeDefined();
      if (move) {
        expect(typeof move.x).toBe('number');
        expect(typeof move.y).toBe('number');
        expect(move.x).toBeGreaterThanOrEqual(0);
        expect(move.x).toBeLessThan(GRID_WIDTH);
        expect(move.y).toBeGreaterThanOrEqual(0);
        expect(move.y).toBeLessThan(GRID_HEIGHT);
        expect(typeof move.score).toBe('number');
      }
    });

    it('should prefer defensive moves against potential replacements', () => {
      const board = createTestBoard();
      // Создаем ситуацию, где нужно защищаться от замены
      board[0][0] = P.A;
      board[0][1] = P.A;
      board[0][2] = P.A;
      board[1][0] = P.A;
      board[1][1] = P.N; // критическая позиция для защиты
      
      const move = AI.findMove(board, P.B);
      expect(move).toBeDefined();
      if (move) {
        // Ожидаем, что AI выберет защитную позицию
        expect(move.x).toBe(1);
        expect(move.y).toBe(1);
        // Проверяем, что оценка этого хода высокая
        expect(move.score).toBeGreaterThan(50);
      }
    });
  });
});