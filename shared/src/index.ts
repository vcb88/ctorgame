// No re-exports needed here as we only want to export utilities
import { IPosition, IBoard, IBoardSize } from '../types/coordinates.js';
import { IScores } from '../types/game.js';

export interface ReplaceCandidate {
  /** Position of the cell to be replaced */
  position: IPosition;
  /** Whether the replacement is valid */
  isValid: boolean;
  /** Number of adjacent pieces that make this replacement possible */
  adjacentCount: number;
  /** List of positions that contribute to this replacement */
  adjacentPositions: IPosition[];
  /** Calculated priority for this replacement (higher means more important) */
  priority: number;
}