import { useState, useEffect, useMemo } from 'react';
import { GameStateManager } from '../services/GameStateManager.js';
import { ExtendedGameManagerState } from '../types/gameManager.js';

export interface UseGameReturn {
  state: ExtendedGameManagerState;
  createGame: () => void;
  joinGame: (gameId: string) => void;
}

export function useGame(): UseGameReturn {
  const manager = useMemo(() => GameStateManager.getInstance(), []);
  const [state, setState] = useState<ExtendedGameManagerState>(manager.getState());

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