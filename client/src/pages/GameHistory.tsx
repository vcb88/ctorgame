import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../services/socket';
import { ReplayView } from '../components/Replay/ReplayView';
import { CyberButton } from '@/components/ui/cyber-button';
import { NeonGridBackground } from '@/components/backgrounds/NeonGridBackground';
import { cn } from '@/lib/utils';

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
        const socket = getSocket();
        
        // Запрашиваем список сохраненных игр
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

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-cyan-400 font-mono text-lg animate-pulse">
                        LOADING NEURAL ARCHIVES...
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <div className="bg-red-900/30 text-red-400 p-6 rounded-lg mb-6 border border-red-700/50 backdrop-blur-sm">
                        <div className="text-lg font-mono mb-2">ERROR://</div>
                        {error}
                    </div>
                    <CyberButton
                        onClick={() => navigate('/')}
                        variant="ghost"
                        glowing
                    >
                        RETURN TO MAINFRAME
                    </CyberButton>
                </div>
            );
        }

        // Если выбрана игра для просмотра - показываем replay
        if (selectedGame) {
            return (
                <div className="min-h-screen bg-slate-900">
                    <ReplayView
                        gameCode={selectedGame}
                        socket={getSocket()}
                        onClose={() => setSelectedGame(null)}
                    />
                </div>
            );
        }
    };

    const content = renderContent();
    if (content) return content;

    return (
        <div className="relative min-h-screen text-cyan-50 overflow-hidden">
            <NeonGridBackground />
            
            {/* Основной контент */}
            <div className="relative z-10 container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Neural Archives
                    </h1>
                    <CyberButton
                        onClick={() => navigate('/')}
                        variant="ghost"
                        glowing
                    >
                        RETURN TO MAINFRAME
                    </CyberButton>
                </div>

                <div className="space-y-4">
                    {games.length === 0 ? (
                        <div className="text-center p-8 bg-black/30 backdrop-blur-sm border border-cyan-900/30 rounded-lg">
                            <div className="text-cyan-600 font-mono">
                                NO ARCHIVED GAMES FOUND IN DATABASE
                            </div>
                        </div>
                    ) : (
                        games.map((game) => (
                            <div
                                key={game.gameCode}
                                className={cn(
                                    "relative p-6 rounded-lg border transition-all duration-300",
                                    "bg-black/30 backdrop-blur-sm border-cyan-900/30",
                                    "hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-mono text-cyan-400">
                                            INSTANCE://{game.gameCode}
                                        </h3>
                                        <p className="text-sm text-cyan-600 font-mono">
                                            TIMESTAMP: {new Date(game.createdAt).toLocaleString()}
                                        </p>
                                        {game.completedAt && (
                                            <p className="text-sm font-mono">
                                                <span className="text-pink-500">STATUS: </span>
                                                {game.winner !== null
                                                    ? `VICTORY ACHIEVED - PLAYER ${game.winner + 1}`
                                                    : "STALEMATE DETECTED"}
                                            </p>
                                        )}
                                    </div>
                                    <CyberButton
                                        onClick={() => setSelectedGame(game.gameCode)}
                                        variant="secondary"
                                        glowing
                                    >
                                        ACCESS REPLAY
                                    </CyberButton>
                                </div>

                                {/* Декоративные элементы */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/30" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/30" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/30" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/30" />
                            </div>
                        ))
                    )}
                </div>

                {/* Декоративная информация */}
                <div className="absolute bottom-4 right-4 font-mono text-xs text-cyan-700">
                    <div>ARCHIVE://neural-cache/v1.0.1</div>
                    <div>STATUS://connection-stable</div>
                </div>
            </div>
        </div>
    );
}