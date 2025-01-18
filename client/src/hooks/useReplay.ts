import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import type { 
    GameState, 
    PlaybackSpeed, 
    ClientToServerEvents, 
    ServerToClientEvents 
} from '@ctor-game/shared/types/base/types.js';

// Event types
export const ReplayEvent = {
    START_REPLAY: 'start_replay',
    PAUSE_REPLAY: 'pause_replay',
    RESUME_REPLAY: 'resume_replay',
    NEXT_MOVE: 'next_move',
    PREV_MOVE: 'prev_move',
    GOTO_MOVE: 'goto_move',
    SET_PLAYBACK_SPEED: 'set_playback_speed',
    END_REPLAY: 'end_replay',
    REPLAY_STATE_UPDATED: 'replay_state_updated',
    REPLAY_PAUSED: 'replay_paused',
    REPLAY_RESUMED: 'replay_resumed',
    REPLAY_COMPLETED: 'replay_completed',
    REPLAY_ERROR: 'replay_error',
    PLAYBACK_SPEED_UPDATED: 'playback_speed_updated'
} as const;

type UseReplayProps = {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    gameCode: string;
};

type ReplayStateUpdate = {
    state: GameState;
    moveIndex: number;
    totalMoves: number;
};

type ReplayError = {
    message: string;
    code?: string;
};

type UseReplayReturn = {
    // State
    isPlaying: boolean;
    currentMove: number;
    totalMoves: number;
    playbackSpeed: PlaybackSpeed;
    gameState: GameState | null;
    error: string | null;

    // Control methods
    startReplay: () => void;
    pauseReplay: () => void;
    resumeReplay: () => void;
    nextMove: () => void;
    previousMove: () => void;
    goToMove: (moveIndex: number) => void;
    setSpeed: (speed: PlaybackSpeed) => void;
    stopReplay: () => void;
};

export function useReplay({ socket, gameCode }: UseReplayProps): UseReplayReturn {
    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentMove, setCurrentMove] = useState(0);
    const [totalMoves, setTotalMoves] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Server event handlers
    useEffect(() => {
        // Game state update handler
        const handleStateUpdate = (data: ReplayStateUpdate) => {
            setGameState(data.state);
            setCurrentMove(data.moveIndex);
            setTotalMoves(data.totalMoves);
        };

        // Pause handler
        const handlePaused = () => {
            setIsPlaying(false);
        };

        // Resume handler
        const handleResumed = () => {
            setIsPlaying(true);
        };

        // Completion handler
        const handleCompleted = () => {
            setIsPlaying(false);
        };

        // Error handler
        const handleError = (data: ReplayError) => {
            setError(data.message);
            setIsPlaying(false);
        };

        // Speed update handler
        const handleSpeedUpdate = ({ speed }: { speed: PlaybackSpeed }) => {
            setPlaybackSpeed(speed);
        };

        // Subscribe to events
        socket.on(ReplayEvent.REPLAY_STATE_UPDATED, handleStateUpdate);
        socket.on(ReplayEvent.REPLAY_PAUSED, handlePaused);
        socket.on(ReplayEvent.REPLAY_RESUMED, handleResumed);
        socket.on(ReplayEvent.REPLAY_COMPLETED, handleCompleted);
        socket.on(ReplayEvent.REPLAY_ERROR, handleError);
        socket.on(ReplayEvent.PLAYBACK_SPEED_UPDATED, handleSpeedUpdate);

        // Cleanup subscriptions
        return () => {
            socket.off(ReplayEvent.REPLAY_STATE_UPDATED, handleStateUpdate);
            socket.off(ReplayEvent.REPLAY_PAUSED, handlePaused);
            socket.off(ReplayEvent.REPLAY_RESUMED, handleResumed);
            socket.off(ReplayEvent.REPLAY_COMPLETED, handleCompleted);
            socket.off(ReplayEvent.REPLAY_ERROR, handleError);
            socket.off(ReplayEvent.PLAYBACK_SPEED_UPDATED, handleSpeedUpdate);
        };
    }, [socket]);

    // Playback control methods
    const startReplay = useCallback(() => {
        setError(null);
        socket.emit(ReplayEvent.START_REPLAY, { gameCode });
    }, [socket, gameCode]);

    const pauseReplay = useCallback(() => {
        socket.emit(ReplayEvent.PAUSE_REPLAY, { gameCode });
    }, [socket, gameCode]);

    const resumeReplay = useCallback(() => {
        socket.emit(ReplayEvent.RESUME_REPLAY, { gameCode });
    }, [socket, gameCode]);

    const nextMove = useCallback(() => {
        socket.emit(ReplayEvent.NEXT_MOVE, { gameCode });
    }, [socket, gameCode]);

    const previousMove = useCallback(() => {
        socket.emit(ReplayEvent.PREV_MOVE, { gameCode });
    }, [socket, gameCode]);

    const goToMove = useCallback((moveIndex: number) => {
        socket.emit(ReplayEvent.GOTO_MOVE, { gameCode, moveIndex });
    }, [socket, gameCode]);

    const setSpeed = useCallback((speed: PlaybackSpeed) => {
        socket.emit(ReplayEvent.SET_PLAYBACK_SPEED, { gameCode, speed });
    }, [socket, gameCode]);

    const stopReplay = useCallback(() => {
        socket.emit(ReplayEvent.END_REPLAY, { gameCode });
        setGameState(null);
        setCurrentMove(0);
        setTotalMoves(0);
        setIsPlaying(false);
        setError(null);
    }, [socket, gameCode]);

    return {
        isPlaying,
        currentMove,
        totalMoves,
        playbackSpeed,
        gameState,
        error,
        startReplay,
        pauseReplay,
        resumeReplay,
        nextMove,
        previousMove,
        goToMove,
        setSpeed,
        stopReplay
    };
}