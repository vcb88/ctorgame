/**
 * Game domain types
 */

import type { Position, UUID, PlayerNumber, Timestamp, Scores, GameStatus, CellValue, MoveType } from '../base/primitives.js';
import type { Board } from '../core/board.js';

export type Player = {
    id: UUID;
    number: PlayerNumber;
    connected: boolean;
};

export type GameState = {
    id: UUID;
    status: GameStatus;
    board: Board;
    currentPlayer: PlayerNumber;
    players: Player[];
    scores: Scores;
    lastMoveTimestamp: Timestamp;
    lastAction?: GameAction;
    replacements?: Position[];
};

export type GameMove = {
    player: PlayerNumber;
    position: Position;
    timestamp: Timestamp;
};

export type GameAction = {
    type: MoveType;
    player: PlayerNumber;
    timestamp: Timestamp;
    position?: Position;
    replacements?: Position[];
};

export type GameRoom = {
    gameId: UUID;
    players: Player[];
    currentState: GameState;
    currentPlayer: PlayerNumber;
    lastUpdateTime: Timestamp;
};