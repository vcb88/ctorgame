export * from './game';

export interface IPlayer {
  id: string;
  number: number;
}

export interface IGameRoom {
  gameId: string;
  players: IPlayer[];
  currentState: IGameState;
  currentPlayer: number;
}

// WebSocket события
export enum WebSocketEvents {
  // События от клиента к серверу
  CreateGame = 'createGame',
  JoinGame = 'joinGame',
  MakeMove = 'makeMove',
  EndTurn = 'endTurn',
  Disconnect = 'disconnect',

  // События от сервера к клиенту
  GameCreated = 'gameCreated',
  GameStarted = 'gameStarted',
  GameStateUpdated = 'gameStateUpdated',
  AvailableReplaces = 'availableReplaces',
  GameOver = 'gameOver',
  PlayerDisconnected = 'playerDisconnected',
  Error = 'error'
}

// Типы данных для событий
export interface WebSocketPayloads {
  // Запросы (клиент -> сервер)
  [WebSocketEvents.CreateGame]: void;
  [WebSocketEvents.JoinGame]: {
    gameId: string;
  };
  [WebSocketEvents.MakeMove]: {
    gameId: string;
    move: IGameMove;
  };
  [WebSocketEvents.EndTurn]: {
    gameId: string;
  };
  [WebSocketEvents.Disconnect]: void;

  // Ответы (сервер -> клиент)
  [WebSocketEvents.GameCreated]: {
    gameId: string;
  };
  [WebSocketEvents.GameStarted]: {
    gameState: IGameState;
    currentPlayer: number;
  };
  [WebSocketEvents.GameStateUpdated]: {
    gameState: IGameState;
    currentPlayer: number;
  };
  [WebSocketEvents.AvailableReplaces]: {
    moves: IGameMove[];
  };
  [WebSocketEvents.GameOver]: {
    gameState: IGameState;
    winner: number | null;
  };
  [WebSocketEvents.PlayerDisconnected]: {
    player: number;
  };
  [WebSocketEvents.Error]: {
    message: string;
  };
}

// Вспомогательные типы для типизации Socket.IO
export type ServerToClientEvents = {
  [K in WebSocketEvents as K extends keyof WebSocketPayloads ? K : never]: (
    payload: K extends keyof WebSocketPayloads ? WebSocketPayloads[K] : never
  ) => void;
};

export type ClientToServerEvents = {
  [K in WebSocketEvents as K extends keyof WebSocketPayloads ? K : never]: (
    payload: K extends keyof WebSocketPayloads ? WebSocketPayloads[K] : never
  ) => void;
};