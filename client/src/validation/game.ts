import type { 
    GameMove, 
    GameState, 
    Position, 
    Size, 
    PlayerNumber 
} from '@ctor-game/shared/types/core.js';

const PLAYER_NONE = 0;
const PLAYER_FIRST = 1 as PlayerNumber;
const PLAYER_SECOND = 2 as PlayerNumber;

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
      row.every(cell => cell === null || (typeof cell === 'number' && (cell === PLAYER_NONE || cell === PLAYER_FIRST || cell === PLAYER_SECOND)))
    ) &&
    typeof state.gameOver === 'boolean' &&
    (state.winner === null || state.winner === PLAYER_FIRST || state.winner === PLAYER_SECOND) &&
    state.currentTurn &&
    typeof state.currentTurn.placeOperationsLeft === 'number' &&
    Array.isArray(state.currentTurn.moves) &&
    typeof state.scores === 'object' &&
    typeof state.scores[PLAYER_FIRST] === 'number' &&
    typeof state.scores[PLAYER_SECOND] === 'number' &&
    typeof state.isFirstTurn === 'boolean'
  );
}