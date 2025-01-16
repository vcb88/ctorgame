import React from 'react';
import { Socket } from 'socket.io-client';
import type { 
    Position, 
    PlayerNumber, 
    GameState, 
    Scores,
    GameId,
    GameMove 
} from '@ctor-game/shared/src/types/core.js';
import { useReplay } from '../../hooks/useReplay';
import { useGameHistory } from '../../hooks/useGameHistory';
import { ReplayControls } from './ReplayControls';
import { MoveTimeline } from './MoveTimeline';
import { GameBoard } from '../GameBoard';
import { Alert } from '../ui/alert';

type ReplayViewProps = {
    gameCode: GameId;  // Using GameId type instead of string
    socket: Socket;
    onClose: () => void;
};

export function ReplayView({ gameCode, socket, onClose }: ReplayViewProps) {
    // Get replay state and control methods
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

    // Get move history
    const {
        moves,
        loading,
        error: historyError,
        formatMoveDescription
    } = useGameHistory({ socket, gameCode });

    // Handle replay close
    const handleClose = () => {
        stopReplay();
        onClose();
    };

    // Show errors if any
    if (replayError || historyError) {
        return (
            <Alert variant="destructive">
                {replayError || historyError}
            </Alert>
        );
    }

    // Show loading state
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
                {/* Game board */}
                <div className="flex flex-col gap-4">
                    {gameState && (
                        <GameBoard
                            board={gameState.board}
                            disabled={true} // Board is inactive in replay mode
                            lastMove={moves[currentMove - 1]?.move.position}  // Using position property from GameMove
                        />
                    )}

                    {/* Replay controls */}
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

                {/* Move history */}
                <MoveTimeline
                    moves={moves}
                    currentMove={currentMove}
                    onMoveSelect={goToMove}
                    formatMoveDescription={formatMoveDescription}
                />
            </div>

            {/* Current state info */}
            {gameState && (
                <div className="mt-4 p-4 bg-background rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold">Score</h3>
                            <p>Player 1: {gameState.scores[0]}</p>
                            <p>Player 2: {gameState.scores[1]}</p>
                        </div>
                        {gameState.phase === 'end' && (
                            <div>
                                <h3 className="font-semibold">Game Result</h3>
                                <p>
                                    {gameState.winner !== null
                                        ? `Player ${gameState.winner} won!`
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