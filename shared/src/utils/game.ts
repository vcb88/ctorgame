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
    return { player1, player2 };
}

/**
 * Create initial game state
 */
export function createInitialState(size: Size): GameState {
    return {
        id: crypto.randomUUID(),
        board: Array(size.height).fill(null).map(() => Array(size.width).fill(null)),
        size,
        currentPlayer: 1,
        scores: createScores(0, 0),
        status: 'playing',
        timestamp: Date.now()
    };
}

/**
 * Type guards
 */
export const isValidScores = (scores: unknown): scores is GameScores => {
    if (!scores || typeof scores !== 'object') return false;
    const s = scores as Record<string, unknown>;
    return typeof s.player1 === 'number' && typeof s.player2 === 'number';
};

export const isValidGameStatus = (status: unknown): status is GameStatus =>
    typeof status === 'string' && ['waiting', 'playing', 'finished'].includes(status);

export const isValidPlayerNumber = (player: unknown): player is PlayerNumber =>
    typeof player === 'number' && (player === 1 || player === 2);

export const isValidUUID = (id: unknown): id is UUID =>
    typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

/**
 * Game state validation
 */
export const isValidGameState = (state: unknown): state is GameState => {
    if (!state || typeof state !== 'object') return false;
    
    const s = state as Partial<IGameState>;
    return !!(
        isValidUUID(s.id) &&
        Array.isArray(s.board) &&
        s.board.every((row: Array<PlayerNumber | null>) => Array.isArray(row)) &&
        s.size &&
        typeof s.size.width === 'number' &&
        typeof s.size.height === 'number' &&
        isValidPlayerNumber(s.currentPlayer) &&
        isValidScores(s.scores) &&
        isValidGameStatus(s.status) &&
        typeof s.timestamp === 'number'
    );
};

/**
 * Score calculation
 */
export function calculateScores(board: ReadonlyArray<ReadonlyArray<PlayerNumber | null>>): IScores {
    const scores = { player1: 0, player2: 0 };
    for (const row of board) {
        for (const cell of row) {
            if (cell === 1) scores.player1++;
            else if (cell === 2) scores.player2++;
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
export function determineWinner(scores: IScores): PlayerNumber | null {
    if (scores.player1 > scores.player2) return 1;
    if (scores.player2 > scores.player1) return 2;
    return null;
}