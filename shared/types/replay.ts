import { IGameState } from '@/game';

/**
 * Состояние воспроизведения для конкретной игры
 */
export interface IReplayState {
    currentMoveIndex: number;  // Текущий номер хода
    totalMoves: number;        // Общее количество ходов
    isPlaying: boolean;        // Активно ли воспроизведение
    playbackSpeed: number;     // Скорость воспроизведения (1 = нормальная)
    gameCode: string;         // Код игры
}

/**
 * События WebSocket для replay функциональности
 */
export enum ReplayEvent {
    // Клиент -> Сервер
    START_REPLAY = 'START_REPLAY',
    PAUSE_REPLAY = 'PAUSE_REPLAY',
    RESUME_REPLAY = 'RESUME_REPLAY',
    NEXT_MOVE = 'NEXT_MOVE',
    PREV_MOVE = 'PREV_MOVE',
    GOTO_MOVE = 'GOTO_MOVE',
    SET_PLAYBACK_SPEED = 'SET_PLAYBACK_SPEED',
    END_REPLAY = 'END_REPLAY',

    // Сервер -> Клиент
    REPLAY_STATE_UPDATED = 'REPLAY_STATE_UPDATED',
    REPLAY_PAUSED = 'REPLAY_PAUSED',
    REPLAY_RESUMED = 'REPLAY_RESUMED',
    REPLAY_COMPLETED = 'REPLAY_COMPLETED',
    REPLAY_ERROR = 'REPLAY_ERROR',
    PLAYBACK_SPEED_UPDATED = 'PLAYBACK_SPEED_UPDATED'
}

/**
 * Payload для события REPLAY_STATE_UPDATED
 */
export interface IReplayStateUpdate {
    state: IGameState;
    moveIndex: number;
    totalMoves: number;
}

/**
 * Payload для события REPLAY_ERROR
 */
export interface IReplayError {
    message: string;
}

/**
 * Payload для изменения скорости воспроизведения
 */
export interface IPlaybackSpeedUpdate {
    speed: number;
}