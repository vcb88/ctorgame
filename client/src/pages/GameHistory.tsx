import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
    PlayerNumber,
    GameError
} from '@ctor-game/shared/src/types/core.js';
import type { IGameSummary } from '@ctor-game/shared/src/types/game.js';
import { getSocket } from '../services/socket';
import { ReplayView } from '../components/Replay/ReplayView';
import { CyberButton } from '@/components/ui/cyber-button';
import { NeonGridBackground } from '@/components/backgrounds/NeonGridBackground';
import { cn } from '@/lib/utils';

const ARCHIVE_VERSION = 'v1.0.1';

export function GameHistory() {
    const [games, setGames] = useState<IGameSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<GameError | null>(null);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const socket = getSocket();
        
        // Request saved games list
        socket.emit('GET_SAVED_GAMES');

        const handleGames = (data: { games: IGameSummary[] }) => {
            setGames(data.games);
            setLoading(false);
        };

        const handleError = (error: GameError) => {
            setError(error);
            setLoading(false);
        };

        socket.on('SAVED_GAMES', handleGames);
        socket.on('ERROR', handleError);

        return () => {
            socket.off('SAVED_GAMES', handleGames);
            socket.off('ERROR', handleError);
        };
    }, []);

    const formatDate = (timestamp: Timestamp): string => {
        return new Date(timestamp).toLocaleString();
    };

    const formatPlayerNumber = (num: PlayerNumber): string => 
        String(num);

    const formatGameStatus = (game: IGameSummary): string => {
        if (!game.completedAt) return 'IN PROGRESS';
        return game.winner !== null
            ? `VICTORY ACHIEVED - PLAYER ${formatPlayerNumber(game.winner)}`
            : "STALEMATE DETECTED";
    };

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
                        {error.message}
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

        // Show replay if game is selected
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
            
            {/* Main content */}
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
                                            TIMESTAMP: {formatDate(game.createdAt)}
                                        </p>
                                        {game.completedAt && (
                                            <p className="text-sm font-mono">
                                                <span className="text-pink-500">STATUS: </span>
                                                {formatGameStatus(game)}
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

                                {/* Decorative elements */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500/30" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500/30" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500/30" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500/30" />
                            </div>
                        ))
                    )}
                </div>

                {/* Decorative info */}
                <div className="absolute bottom-4 right-4 font-mono text-xs text-cyan-700">
                    <div>ARCHIVE://neural-cache/{ARCHIVE_VERSION}</div>
                    <div>STATUS://connection-stable</div>
                </div>
            </div>
        </div>
    );
}