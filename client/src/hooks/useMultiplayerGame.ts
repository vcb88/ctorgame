import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { logger } from '../utils/logger';
import {
  IGameState,
  IGameMove,
  OperationType,
  IPosition,
  WebSocketEvents,
  ClientToServerEvents,
  ServerToClientEvents,
  Player,
  getOpponent
} from '../shared';
import { validateGameMove, validateGameState } from '../shared';
import {
  ConnectionState,
  GameError,
  GameErrorType,
  WebSocketErrorCode,
  ErrorResponse,
  ReconnectionData
} from '../types/connection';

import { getSocket } from '../services/socket';

export const useMultiplayerGame = () => {
  // Log hook initialization
  logger.debug('useMultiplayerGame hook initialized', {
    component: 'useMultiplayerGame',
    data: {
      timestamp: Date.now(),
      existingSocket: !!getSocket()
    }
  });
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.CONNECTING);
  const [error, setError] = useState<GameError | null>(null);
  const socket = getSocket();
  
  // Game state
  // Initialize state from localStorage if available
  const [gameId, setGameId] = useState<string | null>(() => {
    const saved = localStorage.getItem('gameId');
    return saved ? saved : null;
  });
  
  const [playerNumber, setPlayerNumber] = useState<Player | null>(() => {
    const saved = localStorage.getItem('playerNumber');
    return saved ? Number(saved) as Player : null;
  });
  
  const [gameState, setGameState] = useState<IGameState | null>(() => {
    const saved = localStorage.getItem('gameState');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentPlayer, setCurrentPlayer] = useState<Player>(() => {
    const saved = localStorage.getItem('currentPlayer');
    return saved ? Number(saved) as Player : Player.First;
  });
  
  const [availableReplaces, setAvailableReplaces] = useState<IGameMove[]>([]);

  // Function to clear game state from localStorage
  const clearGameState = useCallback(() => {
    localStorage.removeItem('gameId');
    localStorage.removeItem('playerNumber');
    localStorage.removeItem('gameState');
    localStorage.removeItem('currentPlayer');
  }, []);
  
  // Reconnection state
  const reconnectionAttempts = useRef<number>(0);
  const maxReconnectionAttempts = 5;
  const reconnectionDelay = 3000; // 3 seconds
  const lastEventId = useRef<string | null>(null);

  // Operation timeouts
  const operationTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const defaultOperationTimeout = 10000; // 10 seconds

  // Helper functions
  const handleError = useCallback((errorResponse: ErrorResponse) => {
    let error: GameError;
    
    switch (errorResponse.code) {
      case WebSocketErrorCode.CONNECTION_ERROR:
        error = {
          type: GameErrorType.CONNECTION,
          message: errorResponse.message,
          recoverable: true,
          retryable: true,
          details: errorResponse.details
        };
        break;
      case WebSocketErrorCode.INVALID_MOVE:
      case WebSocketErrorCode.INVALID_GAME_ID:
      case WebSocketErrorCode.INVALID_STATE:
        error = {
          type: GameErrorType.VALIDATION,
          message: errorResponse.message,
          recoverable: false,
          retryable: false,
          details: errorResponse.details
        };
        break;
      case WebSocketErrorCode.TIMEOUT:
        error = {
          type: GameErrorType.TIMEOUT,
          message: errorResponse.message,
          recoverable: true,
          retryable: true,
          details: errorResponse.details
        };
        break;
      case WebSocketErrorCode.GAME_ENDED:
        error = {
          type: GameErrorType.GAME_STATE,
          message: errorResponse.message,
          recoverable: false,
          retryable: false,
          details: errorResponse.details
        };
        break;
      default:
        error = {
          type: GameErrorType.SERVER,
          message: errorResponse.message,
          recoverable: false,
          retryable: false,
          details: errorResponse.details
        };
    }

    setError(error);
    logger.error('Game error', { 
      component: 'useMultiplayerGame',
      data: { error, original: errorResponse }
    });
  }, []);

  const clearOperationTimeout = useCallback((operationId: string) => {
    if (operationTimeouts.current[operationId]) {
      clearTimeout(operationTimeouts.current[operationId]);
      delete operationTimeouts.current[operationId];
    }
  }, []);

  const setOperationTimeout = useCallback((operationId: string, callback: () => void) => {
    clearOperationTimeout(operationId);
    operationTimeouts.current[operationId] = setTimeout(() => {
      handleError({
        code: WebSocketErrorCode.TIMEOUT,
        message: `Operation ${operationId} timed out`,
        details: { operationId }
      });
      callback();
    }, defaultOperationTimeout);
  }, [handleError]);

  const attemptReconnection = useCallback(() => {
    if (!socket) return;

    if (reconnectionAttempts.current >= maxReconnectionAttempts) {
      setConnectionState(ConnectionState.ERROR);
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Max reconnection attempts reached',
        details: { attempts: reconnectionAttempts.current }
      });
      clearGameState();
      return;
    }

    setConnectionState(ConnectionState.RECONNECTING);
    reconnectionAttempts.current += 1;

    const reconnectionData: ReconnectionData = {
      gameId: gameId || '',
      playerNumber: playerNumber || Player.First,
      lastEventId: lastEventId.current || undefined,
      timestamp: Date.now()
    };

    logger.info('Attempting reconnection', { 
      component: 'useMultiplayerGame',
      data: { 
        attempt: reconnectionAttempts.current,
        reconnectionData
      }
    });

    // Try to reconnect using existing socket
    socket.io.opts.query = {
      reconnection: true,
      ...reconnectionData
    };
    socket.connect();
  }, [gameId, playerNumber, handleError]);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (gameId === null) {
      localStorage.removeItem('gameId');
    } else {
      localStorage.setItem('gameId', gameId);
    }
  }, [gameId]);

  useEffect(() => {
    if (playerNumber === null) {
      localStorage.removeItem('playerNumber');
    } else {
      localStorage.setItem('playerNumber', String(playerNumber));
    }
  }, [playerNumber]);

  useEffect(() => {
    if (gameState === null) {
      localStorage.removeItem('gameState');
    } else {
      localStorage.setItem('gameState', JSON.stringify(gameState));
    }
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('currentPlayer', String(currentPlayer));
  }, [currentPlayer]);

  // Initialize socket connection
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      logger.info('Socket connected', { 
        component: 'useMultiplayerGame',
        data: { 
          socketId: socket.id,
          transport: socket.io.engine.transport.name,
          protocol: socket.io.engine.protocol,
          connected: socket.connected,
          readyState: socket.io.engine.readyState,
          upgrading: socket.io.engine.upgrading,
          upgradeError: socket.io.engine.upgradeError,
        }
      });
      setConnectionState(ConnectionState.CONNECTED);
      reconnectionAttempts.current = 0;
      setError(null);

      // If we were in a game, attempt to rejoin
      if (gameId && playerNumber !== null) {
        socket.emit(WebSocketEvents.Reconnect, {
          gameId,
          playerNumber,
          lastEventId: lastEventId.current
        });
      }
    });

    socket.on('disconnect', (reason) => {
      logger.warn('Socket disconnected', { 
        component: 'useMultiplayerGame',
        data: { reason }
      });
      setConnectionState(ConnectionState.DISCONNECTED);

      if (reason === 'io server disconnect') {
        // Сервер разорвал соединение, не пытаемся переподключиться
        handleError({
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Server terminated the connection',
          details: { reason }
        });
      } else {
        // Автоматически пытаемся переподключиться через reconnectionDelay
        setTimeout(attemptReconnection, reconnectionDelay);
      }
    });

    socket.on('connect_error', (error) => {
      logger.error('Socket connection error', { 
        component: 'useMultiplayerGame',
        data: { error: error.message }
      });
      setConnectionState(ConnectionState.ERROR);
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Failed to connect to server',
        details: { error: error.message }
      });
    });

    // Check initial connection state
    if (socket.connected) {
      setConnectionState(ConnectionState.CONNECTED);
    }

    return () => {
      logger.info('Cleaning up socket listeners', { component: 'useMultiplayerGame' });
      // Очищаем все таймауты операций
      Object.keys(operationTimeouts.current).forEach(clearOperationTimeout);
      socket.removeAllListeners();
    };
  }, [socket, gameId, playerNumber]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handlers = {
      [WebSocketEvents.GameCreated]: ({ gameId, eventId }: { gameId: string, eventId: string }) => {
        logger.socketEvent(WebSocketEvents.GameCreated, { gameId, eventId }, 'in');
        setGameId(gameId);
        setPlayerNumber(Player.First);
        lastEventId.current = eventId;
        setError(null);
        clearOperationTimeout('createGame');
      },

      [WebSocketEvents.GameJoined]: ({ gameId, eventId }: { gameId: string, eventId: string }) => {
        logger.socketEvent(WebSocketEvents.GameJoined, { gameId, eventId }, 'in');
        setGameId(gameId);
        setPlayerNumber(Player.Second);
        lastEventId.current = eventId;
        setError(null);
        clearOperationTimeout('joinGame');
      },

      [WebSocketEvents.GameStarted]: ({ gameState, currentPlayer, eventId }: { gameState: IGameState; currentPlayer: Player, eventId: string }) => {
        logger.debug('[GameStarted] Handler called', {
          component: 'useMultiplayerGame',
          data: { 
            gameId,
            playerNumber,
            currentGameState: gameState,
            newCurrentPlayer: currentPlayer,
            eventId,
            socketId: socket?.id,
            listeners: socket.listeners(WebSocketEvents.GameStarted).length,
            handlerRegistrationTime: Date.now()
          }
        });
        logger.socketEvent(WebSocketEvents.GameStarted, { gameState, currentPlayer, eventId }, 'in');
        if (!validateGameState(gameState)) {
          handleError({
            code: WebSocketErrorCode.INVALID_STATE,
            message: 'Invalid game state received',
            details: { gameState }
          });
          return;
        }
        setGameState(gameState);
        setCurrentPlayer(currentPlayer);
        lastEventId.current = eventId;
        setError(null);
      },

      [WebSocketEvents.GameStateUpdated]: ({ gameState, currentPlayer, eventId }: { gameState: IGameState; currentPlayer: Player, eventId: string }) => {
        logger.socketEvent(WebSocketEvents.GameStateUpdated, { gameState, currentPlayer, eventId }, 'in');
        if (!validateGameState(gameState)) {
          handleError({
            code: WebSocketErrorCode.INVALID_STATE,
            message: 'Invalid game state received',
            details: { gameState }
          });
          return;
        }
        setGameState(gameState);
        setCurrentPlayer(currentPlayer);
        lastEventId.current = eventId;
        setError(null);
        setAvailableReplaces([]);
        clearOperationTimeout('makeMove');
      },

      [WebSocketEvents.AvailableReplaces]: ({ moves, eventId }: { moves: IGameMove[], eventId: string }) => {
        logger.socketEvent(WebSocketEvents.AvailableReplaces, { moves, eventId }, 'in');
        setAvailableReplaces(moves);
        lastEventId.current = eventId;
      },

      [WebSocketEvents.GameOver]: ({ gameState, winner, eventId }: { gameState: IGameState; winner: Player | null, eventId: string }) => {
        logger.socketEvent(WebSocketEvents.GameOver, { gameState, winner, eventId }, 'in');
        if (!validateGameState(gameState)) {
          handleError({
            code: WebSocketErrorCode.INVALID_STATE,
            message: 'Invalid game state received',
            details: { gameState }
          });
          return;
        }
        setGameState(gameState);
        lastEventId.current = eventId;
        handleError({
          code: WebSocketErrorCode.GAME_ENDED,
          message: winner === null ? 'Game ended in a draw!' : `${winner === Player.First ? 'First' : 'Second'} player won!`,
          recoverable: false,
          retryable: false,
          details: { winner }
        });
      },

      [WebSocketEvents.Error]: (errorResponse: ErrorResponse) => {
        logger.socketEvent(WebSocketEvents.Error, { error: errorResponse }, 'in');
        handleError(errorResponse);
        if (!errorResponse.retryable) {
          clearGameState();
        }
      },

      [WebSocketEvents.PlayerDisconnected]: ({ player, eventId }: { player: Player, eventId: string }) => {
        logger.socketEvent(WebSocketEvents.PlayerDisconnected, { player, eventId }, 'in');
        lastEventId.current = eventId;
        handleError({
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: `Player ${player} disconnected`,
          recoverable: true,
          retryable: true,
          details: { player }
        });
      }
    };

    // Set up socket event handlers once
    logger.debug('Current socket event listeners', {
      component: 'useMultiplayerGame',
      data: Object.keys(handlers).reduce((acc, event) => ({
        ...acc,
        [event]: socket.listeners(event).length
      }), {})
    });

    // Remove any existing handlers first
    Object.keys(handlers).forEach((event) => {
      socket.removeAllListeners(event);
    });

    // Add new handlers
      logger.debug('Setting up socket event handlers', {
        component: 'useMultiplayerGame',
        data: {
          currentHandlers: socket.listeners('GameCreated').length,
          events: Object.keys(handlers)
        }
      });
      
      Object.entries(handlers).forEach(([event, handler]) => {
        logger.debug(`Registering handler for ${event}`, {
          component: 'useMultiplayerGame',
          data: {
            event,
            existingHandlers: socket.listeners(event).length
          }
        });
        socket.on(event, handler);
      });
    }

    // Cleanup on unmount only
    return () => {
      logger.debug('Cleaning up socket event handlers', {
        component: 'useMultiplayerGame',
        data: {
          events: Object.keys(handlers),
          handlersBeforeCleanup: Object.keys(handlers).map(event => ({
            event,
            count: socket.listeners(event).length
          }))
        }
      });

      Object.keys(handlers).forEach((event) => {
        socket.off(event);
      });

      logger.debug('Socket event handlers after cleanup', {
        component: 'useMultiplayerGame',
        data: {
          handlersAfterCleanup: Object.keys(handlers).map(event => ({
            event,
            count: socket.listeners(event).length
          }))
        }
      });
    };
  }, [socket, handleError, validateGameState, clearOperationTimeout]);

  const createGame = useCallback(() => {
    logger.info('createGame called', {
      component: 'useMultiplayerGame',
      data: { 
        hasSocket: !!socket,
        socketId: socket?.id,
        connectionState,
        currentGameId: gameId
      }
    });

    if (!socket) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot create game - socket not initialized',
        details: { connectionState }
      });
      return;
    }

    if (connectionState !== ConnectionState.CONNECTED) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot create game - not connected to server',
        details: { connectionState }
      });
      return;
    }

    logger.info('Emitting CreateGame event', {
      component: 'useMultiplayerGame',
      data: {
        socketId: socket.id,
        socketConnected: socket.connected,
        transportType: socket.io.engine.transport.name
      }
    });

    logger.socketEvent(WebSocketEvents.CreateGame, undefined, 'out');
    socket.emit(WebSocketEvents.CreateGame);
    setOperationTimeout('createGame', () => {
      handleError({
        code: WebSocketErrorCode.TIMEOUT,
        message: 'Game creation timed out',
        details: {}
      });
    });
  }, [socket, connectionState, handleError, setOperationTimeout]);

  const joinGame = useCallback((gameId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!socket) {
        handleError({
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Cannot join game - socket not initialized',
          details: { connectionState }
        });
        resolve(false);
        return;
      }

      if (connectionState !== ConnectionState.CONNECTED) {
        handleError({
          code: WebSocketErrorCode.CONNECTION_ERROR,
          message: 'Cannot join game - not connected to server',
          details: { connectionState }
        });
        resolve(false);
        return;
      }

      // Set up one-time listener for success
      socket.once(WebSocketEvents.GameJoined, () => {
        logger.debug('[joinGame] GameJoined one-time handler called', {
          component: 'useMultiplayerGame'
        });
        resolve(true);
      });

      // Set up one-time listener for error
      socket.once(WebSocketEvents.Error, () => {
        logger.debug('[joinGame] Error one-time handler called', {
          component: 'useMultiplayerGame'
        });
        resolve(false);
      });

      logger.socketEvent(WebSocketEvents.JoinGame, { gameId }, 'out');
      socket.emit(WebSocketEvents.JoinGame, { gameId });
      setOperationTimeout('joinGame', () => {
        handleError({
          code: WebSocketErrorCode.TIMEOUT,
          message: 'Game joining timed out',
          details: { gameId }
        });
        resolve(false);
      });
    }); // close Promise
  }, [socket, connectionState, handleError, setOperationTimeout]);

  const makeMove = useCallback((x: number, y: number, type: OperationType = OperationType.PLACE) => {
    if (!socket || !gameId) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot make move - not in active game',
        details: { socket: !!socket, gameId }
      });
      return;
    }

    if (connectionState !== ConnectionState.CONNECTED) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot make move - not connected to server',
        details: { connectionState }
      });
      return;
    }

    const move: IGameMove = {
      type,
      position: { x, y }
    };
    
    // Валидируем ход перед отправкой
    if (!gameState || !validateGameMove(move, gameState.board.size)) {
      handleError({
        code: WebSocketErrorCode.INVALID_MOVE,
        message: 'Invalid move attempted',
        details: { move, boardSize: gameState?.board.size }
      });
      return;
    }

      // Проверяем, наш ли сейчас ход
    if (playerNumber !== currentPlayer) {
      handleError({
        code: WebSocketErrorCode.NOT_YOUR_TURN,
        message: 'Cannot make move - not your turn',
        details: { currentPlayer, playerNumber }
      });
      return;
    }
    
    logger.socketEvent(WebSocketEvents.MakeMove, { gameId, move }, 'out');
    socket.emit(WebSocketEvents.MakeMove, { gameId, move });
    setOperationTimeout('makeMove', () => {
      handleError({
        code: WebSocketErrorCode.TIMEOUT,
        message: 'Move operation timed out',
        details: { move }
      });
    });
  }, [socket, gameId, gameState, connectionState, currentPlayer, playerNumber, handleError, setOperationTimeout]);

  const endTurn = useCallback(() => {
    if (!socket || !gameId) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot end turn - not in active game',
        details: { socket: !!socket, gameId }
      });
      return;
    }

    if (connectionState !== ConnectionState.CONNECTED) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot end turn - not connected to server',
        details: { connectionState }
      });
      return;
    }

    // Проверяем, наш ли сейчас ход
    if (playerNumber !== currentPlayer) {
      handleError({
        code: WebSocketErrorCode.NOT_YOUR_TURN,
        message: 'Cannot end turn - not your turn',
        details: { currentPlayer, playerNumber }
      });
      return;
    }

    logger.socketEvent(WebSocketEvents.EndTurn, { gameId }, 'out');
    socket.emit(WebSocketEvents.EndTurn, { gameId });
    setOperationTimeout('endTurn', () => {
      handleError({
        code: WebSocketErrorCode.TIMEOUT,
        message: 'End turn operation timed out',
        details: {}
      });
    });
  }, [socket, gameId, connectionState, currentPlayer, playerNumber, handleError, setOperationTimeout]);

  const isMyTurn = playerNumber === currentPlayer;

  return {
    // Game state
    gameId,
    playerNumber,
    gameState,
    currentPlayer,
    isMyTurn,
    availableReplaces,
    
    // Connection state
    connectionState,
    error,
    
    // Actions
    createGame,
    joinGame,
    makeMove,
    endTurn,
    
    // Computed
    isConnected: connectionState === ConnectionState.CONNECTED,
    isConnecting: connectionState === ConnectionState.CONNECTING || connectionState === ConnectionState.RECONNECTING,
    isError: connectionState === ConnectionState.ERROR,
    canRetry: error?.retryable || false,
    canRecover: error?.recoverable || false
  }
}