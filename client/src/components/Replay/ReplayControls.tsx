import React from 'react';
import { Button } from '@/components/ui/button.js';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    StopCircle,
    Rewind,
    FastForward
} from 'lucide-react';

type PlaybackSpeed = 0.5 | 1 | 2;

type ReplayControlsProps = {
    isPlaying: boolean;
    currentMove: number;
    totalMoves: number;
    playbackSpeed: PlaybackSpeed;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onStop: () => void;
    onSpeedChange: (speed: PlaybackSpeed) => void;
};

export function ReplayControls({
    isPlaying,
    currentMove,
    totalMoves,
    playbackSpeed,
    onStart,
    onPause,
    onResume,
    onNext,
    onPrevious,
    onStop,
    onSpeedChange
}: ReplayControlsProps) {
    // Computed states
    const isFirstMove = currentMove === 0;
    const isLastMove = currentMove === totalMoves;
    const hasStarted = currentMove > 0 || isPlaying;

    return (
        <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md">
            {/* Playback progress */}
            <div className="text-center text-sm text-muted-foreground">
                Move {currentMove} of {totalMoves}
            </div>

            {/* Main control buttons */}
            <div className="flex items-center justify-center gap-2">
                {/* Start/Stop button */}
                {!hasStarted ? (
                    <Button onClick={onStart} variant="default">
                        <Play className="w-4 h-4 mr-1" />
                        Start
                    </Button>
                ) : (
                    <Button onClick={onStop} variant="destructive">
                        <StopCircle className="w-4 h-4 mr-1" />
                        Stop
                    </Button>
                )}

                {/* Pause/Resume button */}
                {hasStarted && (
                    <Button
                        onClick={isPlaying ? onPause : onResume}
                        variant="outline"
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                    </Button>
                )}

                {/* Move navigation */}
                <Button
                    onClick={onPrevious}
                    disabled={isFirstMove}
                    variant="outline"
                    aria-label="Previous move"
                >
                    <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                    onClick={onNext}
                    disabled={isLastMove}
                    variant="outline"
                    aria-label="Next move"
                >
                    <SkipForward className="w-4 h-4" />
                </Button>
            </div>

            {/* Speed control */}
            <div className="flex items-center justify-center gap-2">
                <Button
                    onClick={() => onSpeedChange(0.5)}
                    variant={playbackSpeed === 0.5 ? "default" : "outline"}
                    size="sm"
                    aria-label="Slow down"
                >
                    <Rewind className="w-4 h-4" />
                </Button>

                <Button
                    onClick={() => onSpeedChange(1)}
                    variant={playbackSpeed === 1 ? "default" : "outline"}
                    size="sm"
                    aria-label="Normal speed"
                >
                    1x
                </Button>

                <Button
                    onClick={() => onSpeedChange(2)}
                    variant={playbackSpeed === 2 ? "default" : "outline"}
                    size="sm"
                    aria-label="Speed up"
                >
                    <FastForward className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}