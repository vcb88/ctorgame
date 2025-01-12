import { Player, GameOutcome } from '../../types/index.js';
import { IScores, GamePhase, GameManagerState } from '../../types/game.js';

// Game utility functions
export const getGameOutcome = (winner: Player | null, playerNumber: Player): GameOutcome => {
    if (winner === null) return GameOutcome.Draw;
    return winner === playerNumber ? GameOutcome.Win : GameOutcome.Loss;
};

export const getOpponent = (player: Player): Player => {
    switch (player) {
        case Player.First:
            return Player.Second;
        case Player.Second:
            return Player.First;
        default:
            return Player.Empty;
    }
};

// Score utilities
export const legacyToScores = (legacy: { [Player.First]: number; [Player.Second]: number }): IScores => ({
    player1: legacy[Player.First],
    player2: legacy[Player.Second],
    [Player.First]: legacy[Player.First],
    [Player.Second]: legacy[Player.Second]
});

export const createScores = (firstPlayer: number, secondPlayer: number): IScores => ({
    player1: firstPlayer,
    player2: secondPlayer,
    [Player.First]: firstPlayer,
    [Player.Second]: secondPlayer
});

// Validation utilities
export const isValidScores = (scores: unknown): scores is IScores => {
    if (!scores || typeof scores !== 'object') return false;
    
    const s = scores as Record<string | number, unknown>;
    return (
        (typeof s.player1 === 'number' && typeof s.player2 === 'number') ||
        (typeof s[Player.First] === 'number' && typeof s[Player.Second] === 'number')
    );
};

export const isValidGamePhase = (phase: unknown): phase is GamePhase => {
    return typeof phase === 'string' && 
           ['INITIAL', 'CONNECTING', 'WAITING', 'PLAYING', 'GAME_OVER'].includes(phase);
};

export const isValidGameManagerState = (state: unknown): state is GameManagerState => {
    if (!state || typeof state !== 'object') return false;
    
    const s = state as Partial<GameManagerState>;
    return (
        isValidGamePhase(s.phase) &&
        (s.gameId === null || typeof s.gameId === 'string') &&
        (s.playerNumber === null || typeof s.playerNumber === 'number') &&
        (s.error === null || (typeof s.error === 'object' && s.error !== null)) &&
        typeof s.connectionState === 'string'
    );
};