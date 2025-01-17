import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PlayerNumber } from '@ctor-game/shared/types/core.js';
import type { IGameSummary } from '@ctor-game/shared/types/game.js';
import { 
    type IGameError, 
    isNetworkError,
    isDataError,
    isGameStateError,
    createGameError 
} from '@ctor-game/shared/types/errors.js';
import { getSocket } from '../services/socket';
import { ReplayView } from '../components/Replay/ReplayView';
import { CyberButton } from '@/components/ui/cyber-button';
import { NeonGridBackground } from '@/components/backgrounds/NeonGridBackground';
import { cn } from '@/lib/utils';

const ARCHIVE_VERSION = 'v1.0.1';

export function GameHistory() {
    const [games, setGames] = useState<IGameSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<IGameError | null>(null);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [loadingReplays, setLoadingReplays] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        const socket = getSocket();
        
        // Request saved games list
        socket.emit('GET_SAVED_GAMES');

        const handleGames = (data: { games: IGameSummary[] }) => {
            setGames(data.games);
            setLoading(false);
        };

        const handleError = (error: IGameError) => {
            setError(error);
            setLoading(false);
            
            // Log different types of errors appropriately
            if (isNetworkError(error)) {
                console.error('Network error:', error.details?.statusCode, error.message);
            } else if (isDataError(error)) {
                console.error('Data error:', error.details?.field, error.message);
            } else if (isGameStateError(error)) {
                console.error('Game state error:', error.details?.gameId, error.message);
            } else {
                console.error('Unknown error:', error.message);
            }
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

    /**
     * Start loading replay for specific game
     */
    const handleReplayRequest = async (gameCode: string) => {
        try {
            // Add game to loading state
            setLoadingReplays(prev => new Set(prev).add(gameCode));
            
            // Request replay data through socket
            const socket = getSocket();
            socket.emit('REQUEST_REPLAY', { gameCode });
            
            // After successful request, show replay view
            setSelectedGame(gameCode);
        } catch (err) {
            // Handle error
            const error = err instanceof Error ? err : new Error('Failed to load replay');
            handleError(createGameError.gameState(error.message, { gameId: gameCode }));
        } finally {
            // Remove game from loading state
            setLoadingReplays(prev => {
                const next = new Set(prev);
                next.delete(gameCode);
                return next;
            });
        }
    };

    const formatGameStatus = (game: IGameSummary): string => {
        if (!game.completedAt) return 'IN PROGRESS';
        return game.winner !== null
            ? `VICTORY ACHIEVED - PLAYER ${formatPlayerNumber(game.winner)}`
            : "STALEMATE DETECTED";
    };

    /**
     * Renders content based on current state (loading, error, selected game)
     * @returns JSX.Element | null - Returns either special states or null for default view
     */
    const renderContent = (): JSX.Element | null => {
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
                        <div className="text-lg font-mono mb-2">ERROR://{error.code}</div>
                        <div className="mb-2">{error.message}</div>
                        {error.details && (
                            <div className="text-sm opacity-80">
                                {Object.entries(error.details).map(([key, value]) => (
                                    <div key={key} className="font-mono">
                                        {key}: {String(value)}
                                    </div>
                                ))}
                            </div>
                        )}
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
                        onClose={() => {
                            setSelectedGame(null);
                            // Clear loading state for this game
                            setLoadingReplays(prev => {
                                const next = new Set(prev);
                                if (selectedGame) next.delete(selectedGame);
                                return next;
                            });
                        }}
                    />
                </div>
            );
        }

        // Return null for default view (showing games list)
        return null;
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
                                        onClick={() => handleReplayRequest(game.gameCode)}
                                        variant="secondary"
                                        glowing
                                        disabled={loadingReplays.has(game.gameCode)}
                                    >
                                        {loadingReplays.has(game.gameCode) ? (
                                            <span className="inline-flex items-center">
                                                <span className="w-4 h-4 mr-2 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin" />
                                                LOADING...
                                            </span>
                                        ) : (
                                            'ACCESS REPLAY'
                                        )}
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