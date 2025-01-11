import { IGameMove, IGameState, IPosition, IBoardSize, Player, isLegacyScores, isEnumScores } from '../types/index.js';

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
      row.every(cell => typeof cell === 'number' && (cell === Player.None || cell === Player.First || cell === Player.Second))
    ) &&
    typeof state.gameOver === 'boolean' &&
    (state.winner === null || state.winner === Player.First || state.winner === Player.Second) &&
    state.currentTurn &&
    typeof state.currentTurn.placeOperationsLeft === 'number' &&
    Array.isArray(state.currentTurn.moves) &&
    typeof state.scores === 'object' &&
    (isLegacyScores(state.scores) || isEnumScores(state.scores)) &&
    typeof state.isFirstTurn === 'boolean'
  );
}