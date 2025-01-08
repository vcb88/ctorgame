import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
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
} from '@ctor-game/shared';

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
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on(WebSocketEvents.GameCreated, ({ gameId }: { gameId: string }) => {
      setGameId(gameId);
      setPlayerNumber(0);
      setError(null);
    });

    socket.on(WebSocketEvents.GameStarted, ({ gameState, currentPlayer }: { gameState: IGameState; currentPlayer: number }) => {
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setError(null);
    });

    socket.on(WebSocketEvents.GameStateUpdated, ({ gameState, currentPlayer }: { gameState: IGameState; currentPlayer: number }) => {
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setError(null);
      setAvailableReplaces([]); // Сбрасываем доступные замены при обновлении состояния
    });

    socket.on(WebSocketEvents.AvailableReplaces, ({ moves }: { moves: IGameMove[] }) => {
      setAvailableReplaces(moves);
    });

    socket.on(WebSocketEvents.GameOver, ({ gameState, winner }: { gameState: IGameState; winner: number | null }) => {
      setGameState(gameState);
      setError(winner === null ? 'Game ended in a draw!' : `Player ${winner} won!`);
    });

    socket.on(WebSocketEvents.Error, ({ message }: { message: string }) => {
      setError(message);
    });

    socket.on(WebSocketEvents.PlayerDisconnected, ({ player }: { player: number }) => {
      setError(`Player ${player} disconnected`);
      // Не сбрасываем состояние, чтобы можно было переподключиться
    });

    return () => {
      socket.off(WebSocketEvents.GameCreated);
      socket.off(WebSocketEvents.GameStarted);
      socket.off(WebSocketEvents.GameStateUpdated);
      socket.off(WebSocketEvents.GameOver);
      socket.off(WebSocketEvents.Error);
      socket.off(WebSocketEvents.PlayerDisconnected);
    };
  }, [socket]);

  const createGame = useCallback(() => {
    if (!socket) return;
    socket.emit(WebSocketEvents.CreateGame);
  }, [socket]);

  const joinGame = useCallback((gameId: string) => {
    if (!socket) return;
    socket.emit(WebSocketEvents.JoinGame, { gameId });
  }, [socket]);

  const makeMove = useCallback((x: number, y: number, type: OperationType = OperationType.PLACE) => {
    if (!socket || !gameId) return;
    const move: IGameMove = {
      type,
      position: { x, y }
    };
    
    // Валидируем ход перед отправкой
    if (!gameState || !validateGameMove(move, gameState.board.size)) {
      setError('Invalid move');
      return;
    }
    
    socket.emit(WebSocketEvents.MakeMove, { gameId, move });
  }, [socket, gameId]);

  const endTurn = useCallback(() => {
    if (!socket || !gameId) return;
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