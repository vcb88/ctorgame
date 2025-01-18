import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { 
    Position,
    PlayerNumber,
    MoveType,
    Timestamp
} from '@ctor-game/shared/types/core.js';

type UseGameHistoryProps = {
    socket: Socket;
    gameCode: string;
};

type GameHistoryMove = {
    type: MoveType;
    position: Position;
};

export type HistoryEntry = {
    moveNumber: number;
    playerNumber: PlayerNumber;
    move: GameHistoryMove;
    timestamp: Timestamp;
};

type UseGameHistoryReturn = {
    moves: HistoryEntry[];
    loading: boolean;
    error: string | null;
    formatMoveDescription: (move: HistoryEntry) => string;
};

export function useGameHistory({ socket, gameCode }: UseGameHistoryProps): UseGameHistoryReturn {
    const [moves, setMoves] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Request move history on mount
        socket.emit('GET_GAME_HISTORY', { gameCode });

        // History handler
        const handleHistory = (data: { moves: HistoryEntry[] }) => {
            setMoves(data.moves);
            setLoading(false);
        };

        // Error handler
        const handleError = (data: { message: string }) => {
            setError(data.message);
            setLoading(false);
        };

        // New move handler (for live history updates)
        const handleNewMove = (move: HistoryEntry) => {
            setMoves(prevMoves => [...prevMoves, move]);
        };

        // Subscribe to events
        socket.on('GAME_HISTORY', handleHistory);
        socket.on('ERROR', handleError);
        socket.on('NEW_MOVE', handleNewMove);

        // Cleanup subscriptions
        return () => {
            socket.off('GAME_HISTORY', handleHistory);
            socket.off('ERROR', handleError);
            socket.off('NEW_MOVE', handleNewMove);
        };
    }, [socket, gameCode]);

    // Format move description
    const formatMoveDescription = (entry: HistoryEntry): string => {
        const { playerNumber, move } = entry;
        const playerName = `${playerNumber === 1 ? 'First' : 'Second'} Player`;
        const [x, y] = move.position;
        const position = `(${x + 1},${y + 1})`;
        const operation = move.type === 'place' ? 'placed' : 'replaced';

        return `${playerName} ${operation} at ${position}`;
    };

    return {
        moves,
        loading,
        error,
        formatMoveDescription
    };
}