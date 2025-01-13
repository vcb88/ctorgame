import { Player } from './basic-types';
import { GamePhase, WebSocketErrorCode } from './base';
import { IGameState } from './state';
import { GameMove } from './moves';

// Basic payload types
export interface BasicPosition {
    x: number;
    y: number;
}

export interface BasicMove {
    type: 'place' | 'replace';
    position: BasicPosition;
}