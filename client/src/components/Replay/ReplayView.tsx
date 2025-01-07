import React from 'react';
import { Socket } from 'socket.io-client';
import { useReplay } from '../../hooks/useReplay';
import { useGameHistory } from '../../hooks/useGameHistory';
import { ReplayControls } from './ReplayControls';
import { MoveTimeline } from './MoveTimeline';
import { GameBoard } from '../GameBoard';
import { Alert } from '../ui/alert';

interface ReplayViewProps {
    gameCode: string;
    socket: Socket;
    onClose: () => void;
}

export function ReplayView({ gameCode, socket, onClose }: ReplayViewProps) {
    // Получаем состояние replay и методы управления
    const {
        isPlaying,
        currentMove,
        totalMoves,
        playbackSpeed,
        gameState,
        error: replayError,
        startReplay,
        pauseReplay,
        resumeReplay,
        nextMove,
        previousMove,
        goToMove,
        setSpeed,
        stopReplay
    } = useReplay({ socket, gameCode });

    // Получаем историю ходов
    const {
        moves,
        loading,
        error: historyError,
        formatMoveDescription
    } = useGameHistory({ socket, gameCode });

    // Обработчик закрытия replay
    const handleClose = () => {
        stopReplay();
        onClose();
    };

    // Если есть ошибки - показываем их
    if (replayError || historyError) {
        return (
            <Alert variant="destructive">
                {replayError || historyError}
            </Alert>
        );
    }

    // Если загружаем историю - показываем загрузку
    if (loading) {
        return <div>Loading game history...</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Game Replay</h2>
                <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Close
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Игровая доска */}
                <div className="flex flex-col gap-4">
                    {gameState && (
                        <GameBoard
                            board={gameState.board.cells}
                            disabled={true} // В режиме replay доска неактивна
                            lastMove={moves[currentMove - 1]?.move.position}
                        />
                    )}

                    {/* Элементы управления */}
                    <ReplayControls
                        isPlaying={isPlaying}
                        currentMove={currentMove}
                        totalMoves={totalMoves}
                        playbackSpeed={playbackSpeed}
                        onStart={startReplay}
                        onPause={pauseReplay}
                        onResume={resumeReplay}
                        onNext={nextMove}
                        onPrevious={previousMove}
                        onStop={handleClose}
                        onSpeedChange={setSpeed}
                    />
                </div>

                {/* История ходов */}
                <MoveTimeline
                    moves={moves}
                    currentMove={currentMove}
                    onMoveSelect={goToMove}
                    formatMoveDescription={formatMoveDescription}
                />
            </div>

            {/* Информация о текущем состоянии */}
            {gameState && (
                <div className="mt-4 p-4 bg-background rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Score</h3>
                            <p>Player 1: {gameState.scores.player1}</p>
                            <p>Player 2: {gameState.scores.player2}</p>
                        </div>
                        {gameState.gameOver && (
                            <div>
                                <h3 className="font-semibold">Game Result</h3>
                                <p>
                                    {gameState.winner !== null
                                        ? `Player ${gameState.winner + 1} won!`
                                        : "It's a draw!"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}