import React from 'react';
import { Player } from '../types/game';

interface ScoreBoardProps {
    scores: {
        [Player.First]: number;
        [Player.Second]: number;
    };
    currentPlayer: Player;
    opsRemaining: number;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
    scores, 
    currentPlayer, 
    opsRemaining 
}) => {
    return (
        <div className="score-board" role="region" aria-label="Game scores">
            <div className="player-scores">
                <div className={`player-score ${currentPlayer === Player.First ? 'active' : ''}`}>
                    <span className="player-label">Player 1</span>
                    <span className="score-value" role="status" aria-label="Player 1 score">
                        {scores[Player.First]}
                    </span>
                </div>
                <div className={`player-score ${currentPlayer === Player.Second ? 'active' : ''}`}>
                    <span className="player-label">Player 2</span>
                    <span className="score-value" role="status" aria-label="Player 2 score">
                        {scores[Player.Second]}
                    </span>
                </div>
            </div>
            <div className="game-info">
                <div className="current-turn">
                    <span>Current Turn: Player {currentPlayer}</span>
                </div>
                <div className="ops-remaining" role="status" aria-label="Operations remaining">
                    <span>Operations: {opsRemaining}</span>
                </div>
            </div>
        </div>
    );
};