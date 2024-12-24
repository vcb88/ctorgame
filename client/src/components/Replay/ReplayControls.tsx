import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    StopCircle,
    Rewind,
    FastForward
} from 'lucide-react';

interface ReplayControlsProps {
    isPlaying: boolean;
    currentMove: number;
    totalMoves: number;
    playbackSpeed: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onNext: () => void;
    onPrevious: () => void;
    onStop: () => void;
    onSpeedChange: (speed: number) => void;
}

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
    // Вспомогательные функции
    const isFirstMove = currentMove === 0;
    const isLastMove = currentMove === totalMoves;
    const hasStarted = currentMove > 0 || isPlaying;

    return (
        <div className="flex flex-col gap-4 p-4 bg-background rounded-lg shadow-md">
            {/* Прогресс воспроизведения */}
            <div className="text-center text-sm text-muted-foreground">
                Move {currentMove} of {totalMoves}
            </div>

            {/* Основные кнопки управления */}
            <div className="flex items-center justify-center gap-2">
                {/* Кнопка старт/стоп */}
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

                {/* Кнопка пауза/продолжить */}
                {hasStarted && (
                    <Button
                        onClick={isPlaying ? onPause : onResume}
                        variant="outline"
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                    </Button>
                )}

                {/* Навигация по ходам */}
                <Button
                    onClick={onPrevious}
                    disabled={isFirstMove}
                    variant="outline"
                >
                    <SkipBack className="w-4 h-4" />
                </Button>

                <Button
                    onClick={onNext}
                    disabled={isLastMove}
                    variant="outline"
                >
                    <SkipForward className="w-4 h-4" />
                </Button>
            </div>

            {/* Управление скоростью */}
            <div className="flex items-center justify-center gap-2">
                <Button
                    onClick={() => onSpeedChange(0.5)}
                    variant={playbackSpeed === 0.5 ? "default" : "outline"}
                    size="sm"
                >
                    <Rewind className="w-4 h-4" />
                </Button>

                <Button
                    onClick={() => onSpeedChange(1)}
                    variant={playbackSpeed === 1 ? "default" : "outline"}
                    size="sm"
                >
                    1x
                </Button>

                <Button
                    onClick={() => onSpeedChange(2)}
                    variant={playbackSpeed === 2 ? "default" : "outline"}
                    size="sm"
                >
                    <FastForward className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}