import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { 
    Position,
    PlayerNumber,
    MoveType,
    Timestamp,
    GameMoveBase,
    GameMove,
    ClientToServerEvents,
    ServerToClientEvents
} from '@ctor-game/shared/types/base/types';

type UseGameHistoryProps = {
    socket: Socket<ServerToClientEvents, ClientToServerEvents>;
    gameCode: string;
};

export type HistoryEntry = {
    moveNumber: number;
    playerNumber: PlayerNumber;
    move: GameMoveBase & {
        player: PlayerNumber;
        timestamp: number;
        moveNumber?: number;
    };
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
        socket.emit('list_game_history', { gameCode });

        // History handler
        const handleHistory = (data: { moves: GameMove[] }) => {
            const historyEntries = data.moves.map((move, index) => ({
                moveNumber: index + 1,
                playerNumber: move.player,
                move: move,
                timestamp: move.timestamp
            }));
            setMoves(historyEntries);
            setLoading(false);
        };

        // Error handler
        const handleError = (err: { message: string }) => {
            setError(err.message);
            setLoading(false);
        };

        // Subscribe to events
        socket.on('game_history', handleHistory);
        socket.on('error', handleError);
        socket.on('game_move', (data) => {
            // Convert game move to history entry
            if (data.move) {
                const entry: HistoryEntry = {
                    moveNumber: moves.length + 1,
                    playerNumber: data.move.player,
                    move: data.move,
                    timestamp: data.timestamp
                };
                setMoves(prevMoves => [...prevMoves, entry]);
            }
        });

        // Cleanup subscriptions
        return () => {
            socket.off('game_history', handleHistory);
            socket.off('error', handleError);
            socket.off('game_move');
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