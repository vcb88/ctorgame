import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { IGameMove, OperationType, Player } from '../shared';

interface UseGameHistoryProps {
    socket: Socket;
    gameCode: string;
}

export interface HistoryEntry {
    moveNumber: number;
    playerNumber: Player;
    move: IGameMove;
    timestamp: Date;
}

interface UseGameHistoryReturn {
    moves: HistoryEntry[];
    loading: boolean;
    error: string | null;
    formatMoveDescription: (move: HistoryEntry) => string;
}

export function useGameHistory({ socket, gameCode }: UseGameHistoryProps): UseGameHistoryReturn {
    const [moves, setMoves] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Запрашиваем историю ходов при монтировании
        socket.emit('GET_GAME_HISTORY', { gameCode });

        // Обработчик получения истории
        const handleHistory = (data: { moves: HistoryEntry[] }) => {
            setMoves(data.moves);
            setLoading(false);
        };

        // Обработчик ошибок
        const handleError = (data: { message: string }) => {
            setError(data.message);
            setLoading(false);
        };

        // Обработчик нового хода (для живого обновления истории)
        const handleNewMove = (move: HistoryEntry) => {
            setMoves(prevMoves => [...prevMoves, move]);
        };

        // Подписываемся на события
        socket.on('GAME_HISTORY', handleHistory);
        socket.on('ERROR', handleError);
        socket.on('NEW_MOVE', handleNewMove);

        // Отписываемся при размонтировании
        return () => {
            socket.off('GAME_HISTORY', handleHistory);
            socket.off('ERROR', handleError);
            socket.off('NEW_MOVE', handleNewMove);
        };
    }, [socket, gameCode]);

    // Функция для форматирования описания хода
    const formatMoveDescription = (entry: HistoryEntry): string => {
        const { playerNumber, move } = entry;
        const playerName = `${playerNumber === Player.First ? 'First' : 'Second'} Player`;
        const position = `(${move.position.x + 1},${move.position.y + 1})`;
        const operation = move.type === OperationType.PLACE ? 'placed' : 'replaced';

        return `${playerName} ${operation} at ${position}`;
    };

    return {
        moves,
        loading,
        error,
        formatMoveDescription
    };
}