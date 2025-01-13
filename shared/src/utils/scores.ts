import { Player } from '../types/base/enums.js';
import { IBasicScores, IScores } from '../types/game/state.js';

export function createEmptyScores(): IScores {
    return {
        [Player.First]: 0,
        [Player.Second]: 0,
        player1: 0,
        player2: 0
    };
}

export function createScores(player1Score: number, player2Score: number): IScores {
    return {
        [Player.First]: player1Score,
        [Player.Second]: player2Score,
        player1: player1Score,
        player2: player2Score
    };
}

export function updateScores(scores: IScores, currentPlayer: Player, points: number): IScores {
    const updatedScores = {...scores};
    if (currentPlayer === Player.First || currentPlayer === Player.Second) {
        updatedScores[currentPlayer] = points;
        updatedScores[currentPlayer === Player.First ? 'player1' : 'player2'] = points;
    }
    return updatedScores;
}

export function getTotalScore(scores: IBasicScores): number {
    return scores.player1 + scores.player2;
}

export function getWinnerFromScores(scores: IBasicScores): Player | null {
    if (scores.player1 > scores.player2) return Player.First;
    if (scores.player2 > scores.player1) return Player.Second;
    return null;
}
