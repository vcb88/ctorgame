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
  validateGameMove,
  validateGameState,
  ConnectionState,
  GameError,
  GameErrorType,
  WebSocketErrorCode,
  ErrorResponse,
  ReconnectionData,
  Player,
  getOpponent
} from '../shared';

const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3000';

// Board size is now taken from game state

export const useMultiplayerGame = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.CONNECTING);
  const [error, setError] = useState<GameError | null>(null);
  
  // Game state
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.First);
  const [availableReplaces, setAvailableReplaces] = useState<IGameMove[]>([]);
  
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
    if (reconnectionAttempts.current >= maxReconnectionAttempts) {
      setConnectionState(ConnectionState.ERROR);
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Max reconnection attempts reached',
        details: { attempts: reconnectionAttempts.current }
      });
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

    // Create new socket connection with reconnection data
    const newSocket = io(SOCKET_SERVER_URL, {
      query: {
        reconnection: true,
        ...reconnectionData
      }
    });

    setSocket(newSocket);
  }, [gameId, playerNumber, handleError]);

  // Initialize socket connection
  useEffect(() => {
    logger.info('Initializing socket connection', { 
      component: 'useMultiplayerGame',
      data: { url: SOCKET_SERVER_URL }
    });

    const newSocket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: maxReconnectionAttempts,
      reconnectionDelay: reconnectionDelay,
      reconnectionDelayMax: reconnectionDelay * 2,
      timeout: defaultOperationTimeout
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      logger.info('Socket connected', { 
        component: 'useMultiplayerGame',
        data: { socketId: newSocket.id }
      });
      setConnectionState(ConnectionState.CONNECTED);
      reconnectionAttempts.current = 0;
      setError(null);

      // If we were in a game, attempt to rejoin
      if (gameId && playerNumber !== null) {
        newSocket.emit(WebSocketEvents.Reconnect, {
          gameId,
          playerNumber,
          lastEventId: lastEventId.current
        });
      }
    });

    newSocket.on('disconnect', (reason) => {
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

    newSocket.on('connect_error', (error) => {
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

    return () => {
      logger.info('Closing socket connection', { component: 'useMultiplayerGame' });
      // Очищаем все таймауты операций
      Object.keys(operationTimeouts.current).forEach(clearOperationTimeout);
      newSocket.close();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on(WebSocketEvents.GameCreated, ({ gameId, eventId }: { gameId: string, eventId: string }) => {
      logger.socketEvent(WebSocketEvents.GameCreated, { gameId, eventId }, 'in');
      setGameId(gameId);
      setPlayerNumber(Player.First);
      lastEventId.current = eventId;
      setError(null);
      clearOperationTimeout('createGame');
    });

    socket.on(WebSocketEvents.GameJoined, ({ gameId, eventId }: { gameId: string, eventId: string }) => {
      logger.socketEvent(WebSocketEvents.GameJoined, { gameId, eventId }, 'in');
      setGameId(gameId);
      setPlayerNumber(Player.Second);
      lastEventId.current = eventId;
      setError(null);
      clearOperationTimeout('joinGame');
    });

    socket.on(WebSocketEvents.GameStarted, ({ gameState, currentPlayer, eventId }: { gameState: IGameState; currentPlayer: Player, eventId: string }) => {
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
    });

    socket.on(WebSocketEvents.GameStateUpdated, ({ gameState, currentPlayer, eventId }: { gameState: IGameState; currentPlayer: Player, eventId: string }) => {
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
    });

    socket.on(WebSocketEvents.AvailableReplaces, ({ moves, eventId }: { moves: IGameMove[], eventId: string }) => {
      logger.socketEvent(WebSocketEvents.AvailableReplaces, { moves, eventId }, 'in');
      setAvailableReplaces(moves);
      lastEventId.current = eventId;
    });

    socket.on(WebSocketEvents.GameOver, ({ gameState, winner, eventId }: { gameState: IGameState; winner: Player | null, eventId: string }) => {
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
    });

    socket.on(WebSocketEvents.Error, (errorResponse: ErrorResponse) => {
      logger.socketEvent(WebSocketEvents.Error, { error: errorResponse }, 'in');
      handleError(errorResponse);
    });

    socket.on(WebSocketEvents.PlayerDisconnected, ({ player, eventId }: { player: Player, eventId: string }) => {
      logger.socketEvent(WebSocketEvents.PlayerDisconnected, { player, eventId }, 'in');
      lastEventId.current = eventId;
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: `Player ${player} disconnected`,
        recoverable: true,
        retryable: true,
        details: { player }
      });
    });

    return () => {
      socket.off(WebSocketEvents.GameCreated);
      socket.off(WebSocketEvents.GameJoined);
      socket.off(WebSocketEvents.GameStarted);
      socket.off(WebSocketEvents.GameStateUpdated);
      socket.off(WebSocketEvents.GameOver);
      socket.off(WebSocketEvents.Error);
      socket.off(WebSocketEvents.PlayerDisconnected);
    };
  }, [socket]);

  const createGame = useCallback(() => {
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

  const joinGame = useCallback((gameId: string) => {
    if (!socket) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot join game - socket not initialized',
        details: { connectionState }
      });
      return;
    }

    if (connectionState !== ConnectionState.CONNECTED) {
      handleError({
        code: WebSocketErrorCode.CONNECTION_ERROR,
        message: 'Cannot join game - not connected to server',
        details: { connectionState }
      });
      return;
    }

    logger.socketEvent(WebSocketEvents.JoinGame, { gameId }, 'out');
    socket.emit(WebSocketEvents.JoinGame, { gameId });
    setOperationTimeout('joinGame', () => {
      handleError({
        code: WebSocketErrorCode.TIMEOUT,
        message: 'Game joining timed out',
        details: { gameId }
      });
    });
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
    if (!isMyTurn) {
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
  }, [socket, gameId, gameState, connectionState, currentPlayer, playerNumber, isMyTurn, handleError, setOperationTimeout]);

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
    if (!isMyTurn) {
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
  }, [socket, gameId, connectionState, currentPlayer, playerNumber, isMyTurn, handleError, setOperationTimeout]);

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
  };
};