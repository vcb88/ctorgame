import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { 
    IGameState, 
    ReplayEvent,
    IReplayStateUpdate,
    IReplayError 
} from '../shared';

interface UseReplayProps {
    socket: Socket;
    gameCode: string;
}

interface UseReplayReturn {
    // Состояние
    isPlaying: boolean;
    currentMove: number;
    totalMoves: number;
    playbackSpeed: number;
    gameState: IGameState | null;
    error: string | null;

    // Методы управления
    startReplay: () => void;
    pauseReplay: () => void;
    resumeReplay: () => void;
    nextMove: () => void;
    previousMove: () => void;
    goToMove: (moveIndex: number) => void;
    setSpeed: (speed: number) => void;
    stopReplay: () => void;
}

export function useReplay({ socket, gameCode }: UseReplayProps): UseReplayReturn {
    // Состояние воспроизведения
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentMove, setCurrentMove] = useState(0);
    const [totalMoves, setTotalMoves] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [gameState, setGameState] = useState<IGameState | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Обработчики событий от сервера
    useEffect(() => {
        // Обновление состояния игры
        const handleStateUpdate = (data: IReplayStateUpdate) => {
            setGameState(data.state);
            setCurrentMove(data.moveIndex);
            setTotalMoves(data.totalMoves);
        };

        // Обработка паузы
        const handlePaused = () => {
            setIsPlaying(false);
        };

        // Обработка возобновления
        const handleResumed = () => {
            setIsPlaying(true);
        };

        // Обработка завершения
        const handleCompleted = () => {
            setIsPlaying(false);
        };

        // Обработка ошибок
        const handleError = (data: IReplayError) => {
            setError(data.message);
            setIsPlaying(false);
        };

        // Обновление скорости
        const handleSpeedUpdate = ({ speed }: { speed: number }) => {
            setPlaybackSpeed(speed);
        };

        // Подписка на события
        socket.on(ReplayEvent.REPLAY_STATE_UPDATED, handleStateUpdate);
        socket.on(ReplayEvent.REPLAY_PAUSED, handlePaused);
        socket.on(ReplayEvent.REPLAY_RESUMED, handleResumed);
        socket.on(ReplayEvent.REPLAY_COMPLETED, handleCompleted);
        socket.on(ReplayEvent.REPLAY_ERROR, handleError);
        socket.on(ReplayEvent.PLAYBACK_SPEED_UPDATED, handleSpeedUpdate);

        // Отписка при размонтировании
        return () => {
            socket.off(ReplayEvent.REPLAY_STATE_UPDATED, handleStateUpdate);
            socket.off(ReplayEvent.REPLAY_PAUSED, handlePaused);
            socket.off(ReplayEvent.REPLAY_RESUMED, handleResumed);
            socket.off(ReplayEvent.REPLAY_COMPLETED, handleCompleted);
            socket.off(ReplayEvent.REPLAY_ERROR, handleError);
            socket.off(ReplayEvent.PLAYBACK_SPEED_UPDATED, handleSpeedUpdate);
        };
    }, [socket]);

    // Методы управления воспроизведением
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

    const setSpeed = useCallback((speed: number) => {
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