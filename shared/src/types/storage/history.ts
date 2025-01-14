import { GameMove } from '../game/moves.js';
import { GameMetadata } from './metadata.js';
import { GameDetails } from './metadata.js';

export interface GameHistory {
    metadata: GameMetadata;
    moves: GameMove[];
    details: GameDetails;
}