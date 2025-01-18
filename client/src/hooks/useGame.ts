import { useState, useEffect, useMemo } from 'react';
import { GameStateManager } from '../services/GameStateManager.js';
import { GameManagerState } from '../types/gameManager.js';

export interface UseGameReturn {
  state: GameManagerState;
  createGame: () => void;
  joinGame: (gameId: string) => void;
}

export function useGame(): UseGameReturn {
  const manager = useMemo(() => GameStateManager.getInstance(), []);
  const [state, setState] = useState<GameManagerState>(manager.getState());

  useEffect(() => {
    const unsubscribe = manager.subscribe(setState);
    return () => {
      unsubscribe();
    };
  }, [manager]);

  return {
    state,
    createGame: () => manager.createGame(),
    joinGame: (gameId: string) => manager.joinGame(gameId)
  };
}