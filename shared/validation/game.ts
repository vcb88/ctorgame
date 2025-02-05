import { IGameMove, IGameState, IPosition, IBoardSize } from '../types/index.js';

export function validatePosition(pos: IPosition, size: IBoardSize): boolean {
  return (
    typeof pos.x === 'number' &&
    typeof pos.y === 'number' &&
    pos.x >= 0 && pos.x < size.width &&
    pos.y >= 0 && pos.y < size.height
  );
}

export function validateGameMove(move: IGameMove, boardSize: IBoardSize): boolean {
  return (
    move &&
    typeof move.type === 'string' &&
    ['place', 'replace'].includes(move.type) &&
    move.position &&
    validatePosition(move.position, boardSize)
  );
}

export function validateGameState(state: IGameState): boolean {
  if (!state || !state.board || !state.board.cells || !state.board.size) {
    return false;
  }

  const { width, height } = state.board.size;
  const board = state.board.cells;

  return (
    Array.isArray(board) &&
    board.length === height &&
    board.every(row => 
      Array.isArray(row) && 
      row.length === width &&
      row.every(cell => typeof cell === 'number' && (cell === 0 || cell === 1 || cell === 2))
    ) &&
    typeof state.gameOver === 'boolean' &&
    (state.winner === null || typeof state.winner === 'number') &&
    state.currentTurn &&
    typeof state.currentTurn.placeOperationsLeft === 'number' &&
    Array.isArray(state.currentTurn.moves) &&
    typeof state.scores === 'object' &&
    typeof state.scores.player1 === 'number' &&
    typeof state.scores.player2 === 'number' &&
    typeof state.isFirstTurn === 'boolean'
  );
}