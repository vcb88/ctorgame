import type { IGameState } from '../game/state';

/**
 * Current state of replay playback
 */
export interface IReplayState {
    readonly currentMoveIndex: number;
    readonly totalMoves: number;
    readonly isPlaying: boolean;
    readonly playbackSpeed: number;
    readonly gameCode: string;
}

/**
 * Replay control commands from client to server
 */
export interface IReplayClientEvents {
    /** Start replay for specified game */
    START_REPLAY: (data: { gameCode: string }) => void;
    /** Pause current replay */
    PAUSE_REPLAY: (data: { gameCode: string }) => void;
    /** Resume paused replay */
    RESUME_REPLAY: (data: { gameCode: string }) => void;
    /** Move to next game state */
    NEXT_MOVE: (data: { gameCode: string }) => void;
    /** Move to previous game state */
    PREV_MOVE: (data: { gameCode: string }) => void;
    /** Jump to specific move */
    GOTO_MOVE: (data: { gameCode: string; moveIndex: number }) => void;
    /** Change playback speed */
    SET_PLAYBACK_SPEED: (data: { gameCode: string; speed: number }) => void;
    /** Stop replay and cleanup */
    END_REPLAY: (data: { gameCode: string }) => void;
}

/**
 * Replay events sent from server to client
 */
export interface IReplayServerEvents {
    /** Current game state and replay progress */
    REPLAY_STATE_UPDATED: (data: {
        state: IGameState;
        moveIndex: number;
        totalMoves: number;
    }) => void;
    /** Replay was paused */
    REPLAY_PAUSED: (data: { moveIndex: number }) => void;
    /** Replay was resumed */
    REPLAY_RESUMED: (data: { moveIndex: number }) => void;
    /** Playback speed was changed */
    PLAYBACK_SPEED_UPDATED: (data: { speed: number }) => void;
    /** Replay has finished */
    REPLAY_COMPLETED: (data: { gameCode: string }) => void;
    /** Replay was stopped by user */
    REPLAY_ENDED: (data: { gameCode: string }) => void;
    /** Error occurred during replay */
    REPLAY_ERROR: (data: { message: string }) => void;
}