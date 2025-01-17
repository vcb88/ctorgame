import type { GameMove } from '@ctor-game/shared/types/game/moves.js';
import type { GameState } from '@ctor-game/shared/types/game.js';
import type { Position, Size } from '@ctor-game/shared/types/base/primitives.js';

export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

export function validatePosition(pos: Position, size: Size): boolean {
  return (
    Array.isArray(pos) &&
    pos.length === 2 &&
    typeof pos[0] === 'number' &&
    typeof pos[1] === 'number' &&
    pos[0] >= 0 && pos[0] < size[0] &&
    pos[1] >= 0 && pos[1] < size[1]
  );
}

export function validateGameMove(move: GameMove, boardSize: Size): boolean {
  return (
    move &&
    typeof move.type === 'string' &&
    ['place', 'replace'].includes(move.type) &&
    move.position &&
    validatePosition(move.position, boardSize)
  );
}

export function validateGameState(state: GameState): boolean {
  if (!state || !state.board || !state.board.cells || !state.board.size) {
    return false;
  }

  const [width, height] = state.board.size;
  const board = state.board.cells;

  return (
    Array.isArray(board) &&
    board.length === height &&
    board.every(row => 
      Array.isArray(row) && 
      row.length === width &&
      row.every(cell => cell === null || (typeof cell === 'number' && (cell === Player.None || cell === Player.First || cell === Player.Second)))
    ) &&
    typeof state.gameOver === 'boolean' &&
    (state.winner === null || state.winner === Player.First || state.winner === Player.Second) &&
    state.currentTurn &&
    typeof state.currentTurn.placeOperationsLeft === 'number' &&
    Array.isArray(state.currentTurn.moves) &&
    typeof state.scores === 'object' &&
    typeof state.scores[Player.First] === 'number' &&
    typeof state.scores[Player.Second] === 'number' &&
    typeof state.isFirstTurn === 'boolean'
  );
}