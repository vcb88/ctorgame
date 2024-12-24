import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import { ReplayView } from '../components/Replay/ReplayView';
import { Button } from '../components/ui/button';

interface GameSummary {
    gameCode: string;
    createdAt: string;
    completedAt: string | null;
    winner: number | null;
    players: { id: string; number: number }[];
}

export function GameHistory() {
    const [games, setGames] = useState<GameSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Запрашиваем список сохраненных игр
        const socket = getSocket();
        socket.emit('GET_SAVED_GAMES');

        const handleGames = (data: { games: GameSummary[] }) => {
            setGames(data.games);
            setLoading(false);
        };

        const handleError = (data: { message: string }) => {
            setError(data.message);
            setLoading(false);
        };

        socket.on('SAVED_GAMES', handleGames);
        socket.on('ERROR', handleError);

        return () => {
            socket.off('SAVED_GAMES', handleGames);
            socket.off('ERROR', handleError);
        };
    }, []);

    if (loading) {
        return <div>Loading saved games...</div>;
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4">
                    {error}
                </div>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>
        );
    }

    // Если выбрана игра для просмотра - показываем replay
    if (selectedGame) {
        return (
            <ReplayView
                gameCode={selectedGame}
                socket={getSocket()}
                onClose={() => setSelectedGame(null)}
            />
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Game History</h1>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </div>

            <div className="grid gap-4">
                {games.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                        No saved games found
                    </div>
                ) : (
                    games.map((game) => (
                        <div
                            key={game.gameCode}
                            className="p-4 bg-background rounded-lg shadow-md"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold">
                                        Game #{game.gameCode}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Played on:{' '}
                                        {new Date(
                                            game.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                    {game.completedAt && (
                                        <p className="text-sm">
                                            {game.winner !== null
                                                ? `Winner: Player ${
                                                      game.winner + 1
                                                  }`
                                                : "Result: Draw"}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={() => setSelectedGame(game.gameCode)}
                                >
                                    Watch Replay
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}