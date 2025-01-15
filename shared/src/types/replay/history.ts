import { GameMetadata, GameDetails } from '../storage/metadata.js';
import type { IGameMove } from '../game/moves.js';

export interface GameHistory {
    metadata: GameMetadata;
    moves: IGameMove[];
    details: GameDetails;
}

// Additional history-related interfaces
export interface GameHistoryMetrics {
    averageMoveTime: number;
    totalGameTime: number;
    movesCount: number;
    territoryChanges: Array<{
        moveIndex: number;
        territoryDelta: number;
    }>;
}
