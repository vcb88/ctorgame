import { describe, it, expect, beforeEach } from '@jest/globals';
import { GameLogicService } from '../GameLogicService.new.js';
import type { GameState, GameMove, PlayerNumber, Position } from '@ctor-game/shared/dist/types/core.js';

describe('GameLogicService', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = GameLogicService.createInitialState();
  });

  describe('createInitialState', () => {
    it('should create initial game state with correct properties', () => {
      expect(initialState.currentPlayer).toBe(1);
      expect(initialState.gameOver).toBe(false);
      expect(initialState.winner).toBeNull();
      expect(initialState.isFirstTurn).toBe(true);
      expect(initialState.currentTurn.placeOperationsLeft).toBe(1);
      expect(initialState.currentTurn.moves).toHaveLength(0);
    });

    it('should create empty board of correct size', () => {
      expect(initialState.board.cells).toHaveLength(8);
      initialState.board.cells.forEach(row => {
        expect(row).toHaveLength(8);
        row.forEach(cell => expect(cell).toBeNull());
      });
    });
  });

  describe('isValidMove', () => {
    it('should validate first move placement', () => {
      const move: GameMove = {
        type: 'place',
        position: [0, 0],
        player: 1,
        timestamp: Date.now()
      };
      
      expect(GameLogicService.isValidMove(initialState, move, 1)).toBe(true);
    });

    it('should reject move when game is over', () => {
      const state: GameState = {
        ...initialState,
        gameOver: true
      };

      const move: GameMove = {
        type: 'place',
        position: [0, 0],
        player: 1,
        timestamp: Date.now()
      };

      expect(GameLogicService.isValidMove(state, move, 1)).toBe(false);
    });

    it('should reject invalid position', () => {
      const move: GameMove = {
        type: 'place',
        position: { x: -1, y: 0 },
        player: 1,
        timestamp: Date.now()
      };

      expect(GameLogicService.isValidMove(initialState, move, 1)).toBe(false);
    });
  });

  describe('applyMove', () => {
    it('should apply valid placement move', () => {
      const move: GameMove = {
        type: 'place',
        position: [0, 0],
        player: 1,
        timestamp: Date.now()
      };

      const newState = GameLogicService.applyMove(initialState, move, 1);
      expect(newState.board.cells[0][0]).toBe(1);
      expect(newState.currentTurn.placeOperationsLeft).toBe(0);
      expect(newState.currentTurn.moves).toHaveLength(1);
      expect(newState.currentPlayer).toBe(2); // Should switch to player 2
    });

    it('should update scores after move', () => {
      const move: GameMove = {
        type: 'place',
        position: [0, 0],
        player: 1,
        timestamp: Date.now()
      };

      const newState = GameLogicService.applyMove(initialState, move, 1);
      expect(newState.scores[1]).toBe(1);
      expect(newState.scores[2]).toBe(0);
    });

    it('should handle first turn correctly', () => {
      const move: GameMove = {
        type: 'place',
        position: [0, 0],
        player: 1,
        timestamp: Date.now()
      };

      const newState = GameLogicService.applyMove(initialState, move, 1);
      expect(newState.isFirstTurn).toBe(false);
      expect(newState.currentTurn.placeOperationsLeft).toBe(0);
    });
  });

  describe('validateReplace', () => {
    it('should validate replacement with enough adjacent pieces', () => {
      // Setup board with pieces
      const state: GameState = GameLogicService.createInitialState();
      state.board.cells[0][0] = 1;
      state.board.cells[0][1] = 1;
      state.board.cells[1][0] = 2; // Opponent piece to replace

      const position: Position = [1, 0];
      const validation = GameLogicService.validateReplace(state.board, position, 1);
      expect(validation.isValid).toBe(true);
    });

    it('should reject replacement without enough adjacent pieces', () => {
      // Setup board with only one adjacent piece
      const state: GameState = GameLogicService.createInitialState();
      state.board.cells[0][0] = 1;
      state.board.cells[1][0] = 2; // Opponent piece to replace

      const position: Position = [1, 0];
      const validation = GameLogicService.validateReplace(state.board, position, 1);
      expect(validation.isValid).toBe(false);
    });
  });

  describe('getAvailableReplaces', () => {
    it('should find all available replacements', () => {
      // Setup board with potential replacements
      const state: GameState = GameLogicService.createInitialState();
      state.board.cells[0][0] = 1;
      state.board.cells[0][1] = 1;
      state.board.cells[1][0] = 2; // Can be replaced

      const replaces = GameLogicService.getAvailableReplaces(state, 1);
      expect(replaces).toHaveLength(1);
      expect(replaces[0].position).toEqual([1, 0]);
    });

    it('should return empty array when no replacements available', () => {
      const replaces = GameLogicService.getAvailableReplaces(initialState, 1);
      expect(replaces).toHaveLength(0);
    });
  });
});