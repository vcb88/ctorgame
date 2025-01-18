import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { 
    PlayerNumber, 
    GameHistorySummary, 
    GameError, 
    NetworkError,
    Timestamp 
} from '@ctor-game/shared/types/base/types.js';
import { 
    isGameStateError,
    createGameStateError 
} from '@ctor-game/shared/types/errors.js';
import { logger } from '@/utils/logger.js';
import { Socket } from 'socket.io-client';
import { getSocket } from '@/services/socket';
import { ReplayView } from '@/components/Replay/ReplayView';
import { CyberButton } from '@/components/ui/cyber-button.js';
import { NeonGridBackground } from '@/components/backgrounds/NeonGridBackground';
import { cn } from '@/lib/utils.js';
import type { ClientToServerEvents, ServerToClientEvents } from '@ctor-game/shared/types/base/types.js';

const ARCHIVE_VERSION = 'v1.0.1';
const COMPONENT_NAME = 'GameHistory';

export function GameHistory() {
    const [games, setGames] = useState<GameHistorySummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<GameError | NetworkError | null>(null);
    const [selectedGame, setSelectedGame] = useState<string | null>(null);
    const [loadingReplays, setLoadingReplays] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    useEffect(() => {
        const socket = getSocket() as Socket<ServerToClientEvents, ClientToServerEvents>;
        
        // Request saved games list
        socket.emit('list_saved_games');

        const handleGames = (data: { games: GameHistorySummary[] }) => {
            setGames(data.games);
            setLoading(false);
        };

        const handleError = (err: GameError | NetworkError) => {
            setError(err);
            setLoading(false);
            
            // Log error with appropriate context
            logger.error('Game history error occurred', {
                component: COMPONENT_NAME,
                error: err,
                context: { 
                    category: err.category,
                    code: err.code
                }
            });
        };

        socket.on('saved_games_list', handleGames);
        socket.on('error', handleError);

        return () => {
            socket.off('saved_games_list', handleGames);
            socket.off('error', handleError);
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
    const handleReplayRequest = async (game: GameHistorySummary) => {
        try {
            // Add game to loading state
            setLoadingReplays(prev => new Set(prev).add(game.code));
            
            // Request replay data through socket
            const socket = getSocket() as Socket<ServerToClientEvents, ClientToServerEvents>;
            socket.emit('load_game_replay', { gameCode: game.code });
            
            // After successful request, show replay view
            setSelectedGame(game.code);
        } catch (err) {
            // Handle error
            logger.error('Failed to load replay', {
                component: COMPONENT_NAME,
                error: err,
                context: { gameCode: game.code }
            });

            setError(createGameStateError(
                'GAME_NOT_FOUND',
                'Failed to load game replay',
                { gameId: game.code }
            ));
        } finally {
            // Remove game from loading state
            setLoadingReplays(prev => {
                const next = new Set(prev);
                next.delete(game.code);
                return next;
            });
        }
    };

    const formatGameStatus = (game: GameHistorySummary): string => {
        if (!game.endTime) return 'IN PROGRESS';
        return game.winner !== undefined
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
                                key={game.code}
                                className={cn(
                                    "relative p-6 rounded-lg border transition-all duration-300",
                                    "bg-black/30 backdrop-blur-sm border-cyan-900/30",
                                    "hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
                                )}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-mono text-cyan-400">
                                            INSTANCE://{game.code}
                                        </h3>
                                        <p className="text-sm text-cyan-600 font-mono">
                                            TIMESTAMP: {formatDate(game.startTime)}
                                        </p>
                                        <p className="text-sm text-cyan-600 font-mono">
                                            MOVES: {game.moves}
                                        </p>
                                        <p className="text-sm text-cyan-600 font-mono">
                                            PLAYERS: {game.players.join(', ')}
                                        </p>
                                        {game.endTime && (
                                            <p className="text-sm font-mono">
                                                <span className="text-pink-500">STATUS: </span>
                                                {formatGameStatus(game)}
                                            </p>
                                        )}
                                    </div>
                                    <CyberButton
                                        onClick={() => handleReplayRequest(game)}
                                        variant="secondary"
                                        glowing
                                        disabled={loadingReplays.has(game.code)}
                                    >
                                        {loadingReplays.has(game.code) ? (
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