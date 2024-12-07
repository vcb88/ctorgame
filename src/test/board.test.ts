// src/test/board.test.ts

import { describe, it, expect } from 'vitest';
import { replace, createEmptyBoard } from '@/utils/board';
import { Board, P, S } from '@/types';

describe('board replacement rules', () => {
  it('should replace piece when surrounded by 5 opponent pieces', () => {
    const board = createEmptyBoard();
    // Setup: center piece surrounded by 5 opponents
    board[1][1] = P.A; // center piece
    board[0][0] = P.B; // opponents
    board[0][1] = P.B;
    board[0][2] = P.B;
    board[1][0] = P.B;
    board[1][2] = P.B;

    const result = replace(board);
    expect(result[1][1]).toBe(P.B);
  });

  it('should replace piece when surrounded by more than 5 opponent pieces', () => {
    const board = createEmptyBoard();
    board[1][1] = P.A; // center piece
    // Place 6 opponent pieces
    board[0][0] = P.B;
    board[0][1] = P.B;
    board[0][2] = P.B;
    board[1][0] = P.B;
    board[1][2] = P.B;
    board[2][1] = P.B;

    const result = replace(board);
    expect(result[1][1]).toBe(P.B);
  });

  it('should not replace piece when surrounded by less than 5 opponent pieces', () => {
    const board = createEmptyBoard();
    board[1][1] = P.A;
    // Place only 4 opponent pieces
    board[0][0] = P.B;
    board[0][1] = P.B;
    board[0][2] = P.B;
    board[1][0] = P.B;

    const result = replace(board);
    expect(result[1][1]).toBe(P.A);
  });

  it('should handle replacement at board edges correctly (wrap-around)', () => {
    const board = createEmptyBoard();
    // Place piece at edge
    board[0][0] = P.A;
    // Surround with opponents (including wrap-around positions)
    board[S-1][S-1] = P.B; // top-left (wrapping)
    board[S-1][0] = P.B;   // top
    board[S-1][1] = P.B;   // top-right
    board[0][S-1] = P.B;   // left
    board[0][1] = P.B;     // right

    const result = replace(board);
    expect(result[0][0]).toBe(P.B);
  });

  it('should handle chain reactions correctly', () => {
    const board = createEmptyBoard();
    
    // Create first piece that will be replaced
    board[1][1] = P.A;
    board[0][0] = P.B;
    board[0][1] = P.B;
    board[0][2] = P.B;
    board[1][0] = P.B;
    board[1][2] = P.B;

    // Create second piece that will be replaced after first replacement
    board[2][1] = P.A;
    board[1][0] = P.B;
    board[1][1] = P.A; // This will become P.B after first replacement
    board[1][2] = P.B;
    board[2][0] = P.B;
    board[2][2] = P.B;

    const result = replace(board);
    // Check both replacements occurred
    expect(result[1][1]).toBe(P.B);
    expect(result[2][1]).toBe(P.B);
  });

  it('should handle multiple iterations of replacements', () => {
    const board = createEmptyBoard();
    
    // Create a pattern that requires multiple iterations
    // First replacement:
    board[1][1] = P.A;
    board[0][0] = P.B;
    board[0][1] = P.B;
    board[0][2] = P.B;
    board[1][0] = P.B;
    board[1][2] = P.B;

    // Second replacement (will only happen after first piece becomes P.B):
    board[2][1] = P.A;
    board[1][0] = P.B;
    board[1][1] = P.A;  // Will become P.B
    board[1][2] = P.B;
    board[3][1] = P.B;
    board[2][2] = P.B;

    const result = replace(board);
    expect(result[1][1]).toBe(P.B);
    expect(result[2][1]).toBe(P.B);
  });
});