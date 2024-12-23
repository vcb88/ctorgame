import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Move } from '../../../shared/types';

const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:3000';

export const useMultiplayerGame = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

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

    socket.on('gameCreated', ({ gameId }) => {
      setGameId(gameId);
      setPlayerNumber(0);
      setError(null);
    });

    socket.on('gameStarted', ({ gameState, currentPlayer }) => {
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setError(null);
    });

    socket.on('gameStateUpdated', ({ gameState, currentPlayer }) => {
      setGameState(gameState);
      setCurrentPlayer(currentPlayer);
      setError(null);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    socket.on('playerDisconnected', () => {
      setError('Opponent disconnected');
      setGameState(null);
      setGameId(null);
      setPlayerNumber(null);
    });

    return () => {
      socket.off('gameCreated');
      socket.off('gameStarted');
      socket.off('gameStateUpdated');
      socket.off('error');
      socket.off('playerDisconnected');
    };
  }, [socket]);

  const createGame = useCallback(() => {
    if (!socket) return;
    socket.emit('createGame');
  }, [socket]);

  const joinGame = useCallback((gameId: string) => {
    if (!socket) return;
    socket.emit('joinGame', { gameId });
  }, [socket]);

  const makeMove = useCallback((move: Move) => {
    if (!socket || !gameId) return;
    socket.emit('makeMove', { gameId, move });
  }, [socket, gameId]);

  const isMyTurn = playerNumber === currentPlayer;

  return {
    gameId,
    playerNumber,
    gameState,
    currentPlayer,
    error,
    isMyTurn,
    createGame,
    joinGame,
    makeMove,
  };
};