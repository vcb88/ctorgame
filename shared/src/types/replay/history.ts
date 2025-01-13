import { GameMetadata, GameDetails } from '../storage/metadata';
import { GameMove } from '../game/moves';

export interface GameHistory {
    metadata: GameMetadata;
    moves: GameMove[];
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