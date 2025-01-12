import { describe, it, expect } from 'vitest';
import { Player } from '@/shared';
import {
  validateGameState,
  validateExtendedGameManagerState,
  validateStateTransition,
  validateStateUpdate,
  StateValidationError
} from '../stateValidation';

describe('State Validation', () => {
  describe('validateGameState', () => {
    it('should validate correct game state', () => {
      const validState = {
        board: {
          cells: [[0, 0], [0, 0]],
          size: { width: 2, height: 2 }
        },
        gameOver: false,
        winner: null,
        currentTurn: {
          placeOperationsLeft: 2,
          moves: []
        },
        currentPlayer: Player.First,
        scores: {
          player1: 0,
          player2: 0,
          [Player.First]: 0,
          [Player.Second]: 0
        },
        isFirstTurn: true
      };

      expect(() => validateGameState(validState)).not.toThrow();
    });

    it('should throw on invalid board', () => {
      const invalidState = {
        gameOver: false,
        winner: null,
        currentTurn: {
          placeOperationsLeft: 2,
          moves: []
        },
        scores: {
          player1: 0,
          player2: 0,
          [Player.First]: 0,
          [Player.Second]: 0
        }
      };

      expect(() => validateGameState(invalidState)).toThrow(StateValidationError);
    });
  });

  describe('validateStateTransition', () => {
    const baseState = {
      phase: 'INITIAL' as const,
      gameId: null,
      playerNumber: null,
      error: null,
      connectionState: 'disconnected' as const,
      gameState: null,
      currentPlayer: Player.First,
      availableReplaces: []
    };

    it('should allow valid transitions', () => {
      expect(() => validateStateTransition(
        { ...baseState, phase: 'INITIAL' },
        { phase: 'CONNECTING' }
      )).not.toThrow();

      expect(() => validateStateTransition(
        { ...baseState, phase: 'CONNECTING' },
        { phase: 'WAITING' }
      )).not.toThrow();
    });

    it('should throw on invalid transitions', () => {
      expect(() => validateStateTransition(
        { ...baseState, phase: 'INITIAL' },
        { phase: 'PLAYING' }
      )).toThrow(StateValidationError);

      expect(() => validateStateTransition(
        { ...baseState, phase: 'CONNECTING' },
        { phase: 'GAME_OVER' }
      )).toThrow(StateValidationError);
    });
  });

  describe('validateStateUpdate', () => {
    it('should validate correct update', () => {
      const validUpdate = {
        phase: 'WAITING' as const,
        gameId: '123',
        playerNumber: Player.First
      };

      expect(() => validateStateUpdate(validUpdate)).not.toThrow();
    });

    it('should throw on invalid phase', () => {
      const invalidUpdate = {
        phase: 'INVALID_PHASE',
        gameId: '123'
      };

      expect(() => validateStateUpdate(invalidUpdate)).toThrow(StateValidationError);
    });
  });

  describe('validateExtendedGameManagerState', () => {
    it('should validate correct extended state', () => {
      const validState = {
        phase: 'PLAYING' as const,
        gameId: '123',
        playerNumber: Player.First,
        error: null,
        connectionState: 'connected' as const,
        gameState: {
          board: {
            cells: [[0, 0], [0, 0]],
            size: { width: 2, height: 2 }
          },
          gameOver: false,
          winner: null,
          currentTurn: {
            placeOperationsLeft: 2,
            moves: []
          },
          currentPlayer: Player.First,
          scores: {
            player1: 0,
            player2: 0,
            [Player.First]: 0,
            [Player.Second]: 0
          },
          isFirstTurn: true
        },
        currentPlayer: Player.First,
        availableReplaces: []
      };

      expect(() => validateExtendedGameManagerState(validState)).not.toThrow();
    });

    it('should throw on invalid current player', () => {
      const invalidState = {
        phase: 'PLAYING' as const,
        gameId: '123',
        playerNumber: Player.First,
        error: null,
        connectionState: 'connected' as const,
        gameState: null,
        currentPlayer: 999, // Invalid player
        availableReplaces: []
      };

      expect(() => validateExtendedGameManagerState(invalidState)).toThrow(StateValidationError);
    });
  });
});