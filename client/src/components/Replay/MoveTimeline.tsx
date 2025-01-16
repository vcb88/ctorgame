import React from 'react';
import type { 
    Position, 
    PlayerNumber, 
    MoveType, 
    Timestamp, 
    GameMove 
} from '@ctor-game/shared/src/types/core.js';
import { ScrollArea } from '../ui/scroll-area';

type HistoryEntry = {
    moveNumber: number;
    playerNumber: PlayerNumber;
    move: GameMove;  // Using core GameMove type
    timestamp: Timestamp;
};

type MoveTimelineProps = {
    moves: HistoryEntry[];
    currentMove: number;
    onMoveSelect: (index: number) => void;
    formatMoveDescription: (move: HistoryEntry) => string;
};

export function MoveTimeline({
    moves,
    currentMove,
    onMoveSelect,
    formatMoveDescription
}: MoveTimelineProps) {
    return (
        <div className="w-full max-w-md p-4 bg-background rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Move History</h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                    {/* Initial state */}
                    <div
                        className={`p-2 rounded cursor-pointer transition-colors ${
                            currentMove === 0
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent'
                        }`}
                        onClick={() => onMoveSelect(0)}
                    >
                        Initial state
                    </div>

                    {/* Move list */}
                    {moves.map((move, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded cursor-pointer transition-colors ${
                                currentMove === index + 1
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                            }`}
                            onClick={() => onMoveSelect(index + 1)}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                    {formatMoveDescription(move)}
                                </span>
                                <span className="text-xs opacity-70">
                                    {new Date(move.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}