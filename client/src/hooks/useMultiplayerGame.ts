import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '../utils/logger';
import { GameStateManager } from '../services/GameStateManager';
import { type GameSocket } from '../services/socket';

// Shared types
import type { 
    GameState, 
    GameMove, 
    PlayerNumber,
    GameStatus
} from '@ctor-game/shared/src/types/core.js';
import type { 
    WebSocketEvent, 
    UUID,
    ServerToClientEvents,
    ClientToServerEvents
} from '@ctor-game/shared/src/types/network/websocket.js';
import type { 
    NetworkError
} from '@ctor-game/shared/src/types/network/errors.js';
import type {
    Position
} from '@ctor-game/shared/src/types/core.js';

type ConnectionState = 'connected' | 'connecting' | 'reconnecting' | 'disconnected' | 'error';

type GameResponse = {
    readonly success: boolean;
    readonly error?: NetworkError;
    readonly eventId?: UUID;
    readonly timestamp: number;
};

type JoinGameResponse = GameResponse & {
    readonly gameId?: UUID;
    readonly playerNumber?: PlayerNumber;
};

type MultiplayerGameState = {
    readonly gameId: UUID | null;
    readonly playerNumber: PlayerNumber | null;
    readonly gameState: GameState | null;
    readonly currentPlayer: PlayerNumber;
    readonly connectionState: ConnectionState;
    readonly error: NetworkError | null;
    readonly availableReplaces: GameMove[];
    readonly timestamp: number;
};

export const useMultiplayerGame = () => {
    // Initialize GameStateManager singleton
    const gameManager = useRef<GameStateManager>(GameStateManager.getInstance());

    // Initialize state from GameStateManager
    const [state, setState] = useState<MultiplayerGameState>(() => {
        const managerState = gameManager.current.getState();
        return {
            gameId: managerState.gameId,
            playerNumber: managerState.playerNumber,
            gameState: managerState.gameState,
            currentPlayer: managerState.currentPlayer,
            connectionState: managerState.connectionState as ConnectionState,
            error: managerState.error,
            availableReplaces: managerState.availableReplaces,
            timestamp: managerState.timestamp
        };
    });

    // Subscribe to state changes
    useEffect(() => {
        return gameManager.current.subscribe((newState) => {
            setState({
                gameId: newState.gameId,
                playerNumber: newState.playerNumber,
                gameState: newState.gameState,
                currentPlayer: newState.currentPlayer,
                connectionState: newState.connectionState as ConnectionState,
                error: newState.error,
                availableReplaces: newState.availableReplaces,
                timestamp: newState.timestamp
            });
        });
    }, []);

    // Game actions
    const createGame = useCallback(async () => {
        try {
            logger.info('Creating new game', {
                component: 'useMultiplayerGame'
            });

            await gameManager.current.createGame();
            
            logger.debug('Game created successfully', { 
                component: 'useMultiplayerGame'
            });
        } catch (error) {
            const networkError = error as NetworkError;
            logger.error('Failed to create game', { 
                component: 'useMultiplayerGame',
                data: { error: networkError }
            });
            throw error;
        }
    }, []);

    const joinGame = useCallback(async (gameId: UUID): Promise<JoinGameResult> => {
        try {
            logger.info('Joining game', {
                component: 'useMultiplayerGame',
                data: { gameId }
            });

            const result = await gameManager.current.joinGame(gameId);
            
            logger.debug('Game joined successfully', { 
                component: 'useMultiplayerGame',
                data: { gameId, playerNumber: result.playerNumber }
            });
            
            return result;
        } catch (error) {
            const networkError = error as NetworkError;
            logger.error('Failed to join game', { 
                component: 'useMultiplayerGame',
                data: { error: networkError }
            });
            throw error;
        }
    }, []);

    const makeMove = useCallback(async (pos: Position) => {
        try {
            const move: GameMove = {
                position: pos,
                timestamp: Date.now()
            };

            await gameManager.current.makeMove(move);
            
            logger.debug('Move made successfully', { 
                component: 'useMultiplayerGame',
                data: { move }
            });
        } catch (error) {
            const networkError = error as NetworkError;
            logger.error('Failed to make move', { 
                component: 'useMultiplayerGame',
                data: { error: networkError }
            });
            throw error;
        }
    }, []);

    const endTurn = useCallback(async () => {
        try {
            logger.info('Ending turn', {
                component: 'useMultiplayerGame'
            });

            await gameManager.current.endTurn();
            
            logger.debug('Turn ended successfully', { 
                component: 'useMultiplayerGame'
            });
        } catch (error) {
            const networkError = error as NetworkError;
            logger.error('Failed to end turn', { 
                component: 'useMultiplayerGame',
                data: { error: networkError }
            });
            throw error;
        }
    }, []);

    return {
        // Game state
        gameId: state.gameId,
        playerNumber: state.playerNumber,
        gameState: state.gameState,
        currentPlayer: state.currentPlayer,
        isMyTurn: state.playerNumber === state.currentPlayer,
        availableReplaces: state.availableReplaces,
        
        // Connection state
        connectionState: state.connectionState,
        error: state.error,
        
        // Actions
        createGame,
        joinGame,
        makeMove,
        endTurn,
        
        // Computed
        isConnected: state.connectionState === 'connected',
        isConnecting: state.connectionState === 'connecting' || state.connectionState === 'reconnecting',
        isError: state.connectionState === 'error',
    };
};