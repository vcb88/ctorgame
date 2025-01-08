import { useEffect, useState, useCallback } from 'react';
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
  validateGameState 
} from '../shared';

const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3000';

// Board size is now taken from game state

export const useMultiplayerGame = () => {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [availableReplaces, setAvailableReplaces] = useState<IGameMove[]>([]);

  // Initialize socket connection
  useEffect(() => {
    logger.info('Initializing socket connection', { 
      component: 'useMultiplayerGame',
      data: { url: SOCKET_SERVER_URL }
    });

    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      logger.info('Socket connected', { 
        component: 'useMultiplayerGame',
        data: { socketId: newSocket.id }
      });
    });

    newSocket.on('disconnect', (reason) => {
      logger.warn('Socket disconnected', { 
        component: 'useMultiplayerGame',
        data: { reason }
      });
    });

    newSocket.on('connect_error', (error) => {
      logger.error('Socket connection error', { 
        component: 'useMultiplayerGame',
        data: { error: error.message }
      });
    });

    return () => {
      logger.info('Closing socket connection', { component: 'useMultiplayerGame' });
      newSocket.close();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on(WebSocketEvents.GameCreated, ({ gameId }: { gameId: string }) => {
      logger.socketEvent(WebSocketEvents.GameCreated, { gameId }, 'in');
      setGameId(gameId);
      setPlayerNumber(0);
      setError(null);
    });

    socket.on(WebSocketEvents.GameJoined, ({ gameId }: { gameId: string }) => {
      logger.socketEvent(WebSocketEvents.GameJoined, { gameId }, 'in');
      setGameId(gameId);
      setPlayerNumber(1);
      setError(null);
    });

    socket.on(WebSocketEvents.GameStarted, ({ gameState, currentPlayer }: { gameState: IGameState; currentPlayer: number }) => {
      logger.socketEvent(WebSocketEvents.GameStarted, { gameState, currentPlayer }, 'in');
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setError(null);
    });

    socket.on(WebSocketEvents.GameStateUpdated, ({ gameState, currentPlayer }: { gameState: IGameState; currentPlayer: number }) => {
      logger.socketEvent(WebSocketEvents.GameStateUpdated, { gameState, currentPlayer }, 'in');
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setError(null);
      setAvailableReplaces([]); // Сбрасываем доступные замены при обновлении состояния
    });

    socket.on(WebSocketEvents.AvailableReplaces, ({ moves }: { moves: IGameMove[] }) => {
      logger.socketEvent(WebSocketEvents.AvailableReplaces, { moves }, 'in');
      setAvailableReplaces(moves);
    });

    socket.on(WebSocketEvents.GameOver, ({ gameState, winner }: { gameState: IGameState; winner: number | null }) => {
      logger.socketEvent(WebSocketEvents.GameOver, { gameState, winner }, 'in');
      setGameState(gameState);
      setError(winner === null ? 'Game ended in a draw!' : `Player ${winner} won!`);
    });

    socket.on(WebSocketEvents.Error, ({ message }: { message: string }) => {
      logger.socketEvent(WebSocketEvents.Error, { message }, 'in');
      logger.error('Game error received', { 
        component: 'useMultiplayerGame',
        data: { message }
      });
      setError(message);
    });

    socket.on(WebSocketEvents.PlayerDisconnected, ({ player }: { player: number }) => {
      logger.socketEvent(WebSocketEvents.PlayerDisconnected, { player }, 'in');
      setError(`Player ${player} disconnected`);
      // Не сбрасываем состояние, чтобы можно было переподключиться
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
      logger.warn('Cannot create game - socket not initialized', { component: 'useMultiplayerGame' });
      return;
    }
    logger.socketEvent(WebSocketEvents.CreateGame, undefined, 'out');
    socket.emit(WebSocketEvents.CreateGame);
  }, [socket]);

  const joinGame = useCallback((gameId: string) => {
    if (!socket) {
      logger.warn('Cannot join game - socket not initialized', { component: 'useMultiplayerGame' });
      return;
    }
    logger.socketEvent(WebSocketEvents.JoinGame, { gameId }, 'out');
    socket.emit(WebSocketEvents.JoinGame, { gameId });
  }, [socket]);

  const makeMove = useCallback((x: number, y: number, type: OperationType = OperationType.PLACE) => {
    if (!socket) {
      logger.warn('Cannot make move - socket not initialized', { component: 'useMultiplayerGame' });
      return;
    }
    
    if (!gameId) {
      logger.warn('Cannot make move - no active game', { component: 'useMultiplayerGame' });
      return;
    }

    const move: IGameMove = {
      type,
      position: { x, y }
    };
    
    // Валидируем ход перед отправкой
    if (!gameState || !validateGameMove(move, gameState.board.size)) {
      logger.warn('Invalid move attempted', { 
        component: 'useMultiplayerGame',
        data: { move, boardSize: gameState?.board.size }
      });
      setError('Invalid move');
      return;
    }
    
    logger.socketEvent(WebSocketEvents.MakeMove, { gameId, move }, 'out');
    socket.emit(WebSocketEvents.MakeMove, { gameId, move });
  }, [socket, gameId, gameState]);

  const endTurn = useCallback(() => {
    if (!socket) {
      logger.warn('Cannot end turn - socket not initialized', { component: 'useMultiplayerGame' });
      return;
    }
    
    if (!gameId) {
      logger.warn('Cannot end turn - no active game', { component: 'useMultiplayerGame' });
      return;
    }

    logger.socketEvent(WebSocketEvents.EndTurn, { gameId }, 'out');
    socket.emit(WebSocketEvents.EndTurn, { gameId });
  }, [socket, gameId]);

  const isMyTurn = playerNumber === currentPlayer;

  return {
    gameId,
    playerNumber,
    gameState,
    currentPlayer,
    error,
    isMyTurn,
    availableReplaces,
    createGame,
    joinGame,
    makeMove,
    endTurn,
  };
};