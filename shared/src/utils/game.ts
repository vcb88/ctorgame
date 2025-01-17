import type { PlayerNumber, GameStatus, GameState, Size, Scores as GameScores } from '../types/core.js';

type UUID = string;

export type GameOutcome = 'win' | 'loss' | 'draw';

/**
 * Get game outcome for a player
 */
export function getGameOutcome(winner: PlayerNumber | null, playerNumber: PlayerNumber): GameOutcome {
    if (winner === null) return 'draw';
    return winner === playerNumber ? 'win' : 'loss';
}

/**
 * Get opponent's player number
 */
export function getOpponent(player: PlayerNumber): PlayerNumber {
    return player === 1 ? 2 : 1;
}

/**
 * Score utilities
 */
export function createScores(player1: number, player2: number): GameScores {
    return [player1, player2];
}

/**
 * Create initial game state
 */
export function createInitialState(size: Size): GameState {
    return {
        id: crypto.randomUUID(),
        board: Array(size[1]).fill(null).map(() => Array(size[0]).fill(null)),
        size,
        currentPlayer: 1,
        scores: createScores(0, 0),
        status: 'active',
        timestamp: Date.now()
    };
}

/**
 * Type guards
 */
export const isValidScores = (scores: unknown): scores is GameScores => {
    if (!Array.isArray(scores) || scores.length !== 2) return false;
    return typeof scores[0] === 'number' && typeof scores[1] === 'number';
};

export const isValidGameStatus = (status: unknown): status is GameStatus =>
    typeof status === 'string' && ['waiting', 'active', 'finished'].includes(status);

export const isValidPlayerNumber = (player: unknown): player is PlayerNumber =>
    typeof player === 'number' && (player === 1 || player === 2);

export const isValidUUID = (id: unknown): id is UUID =>
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

/**
 * Game state validation
 */
export const isValidGameState = (state: unknown): state is GameState => {
    if (!state || typeof state !== 'object') return false;
    
    const s = state as Partial<GameState>;
    return !!(
        isValidUUID(s.id) &&
        Array.isArray(s.board) &&
        s.board.every((row: Array<PlayerNumber | null>) => Array.isArray(row)) &&
        Array.isArray(s.size) &&
        s.size.length === 2 &&
        typeof s.size[0] === 'number' &&
        typeof s.size[1] === 'number' &&
        isValidPlayerNumber(s.currentPlayer) &&
        isValidScores(s.scores) &&
        isValidGameStatus(s.status) &&
        typeof s.timestamp === 'number'
    );
};

/**
 * Score calculation
 */
export function calculateScores(board: ReadonlyArray<ReadonlyArray<PlayerNumber | null>>): GameScores {
    const scores = [0, 0];
    for (const row of board) {
        for (const cell of row) {
            if (cell === 1) scores[0]++;
            else if (cell === 2) scores[1]++;
        }
    }
    return scores;
}

/**
 * Check for game over
 */
export function isGameOver(board: ReadonlyArray<ReadonlyArray<PlayerNumber | null>>): boolean {
    return board.every(row => row.every(cell => cell !== null));
}

/**
 * Determine winner from scores
 */
export function determineWinner(scores: GameScores): PlayerNumber | null {
    if (scores[0] > scores[1]) return 1;
    if (scores[1] > scores[0]) return 2;
    return null;
}