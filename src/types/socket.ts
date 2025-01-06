// Types for Socket.IO events

export interface SocketResponse {
    type: string;
    code?: string;
    message?: string;
}

export interface GameCreatedResponse extends SocketResponse {
    gameId: string;
    code: string;
    status: string;
    playerNumber: number;
}

export interface GameJoinedResponse extends SocketResponse {
    gameId: string;
    status: string;
    playerNumber: number;
}

export interface GameState {
    currentPlayer: number;
    board: Array<Array<number | null>>;
    gameOver: boolean;
    winner: number | null;
    lastMove?: { row: number; col: number };
    opsRemaining?: number;
}

export interface GameStartedResponse extends SocketResponse {
    gameId: string;
    status: string;
    state: GameState;
}

export interface GameMove {
    x: number;
    y: number;
    player: number;
    timestamp: number;
}

export interface GameUpdatedResponse extends SocketResponse {
    gameId: string;
    move: GameMove;
    nextPlayer: number;
}

export interface GameReconnectedResponse extends SocketResponse {
    gameId: string;
    state: GameState;
}

export interface PlayerEvent extends SocketResponse {
    gameId: string;
    connectionId: string;
}

export interface GameEvents {
    connected: (response: SocketResponse) => void;
    error: (response: SocketResponse) => void;
    gameCreated: (response: GameCreatedResponse) => void;
    gameJoined: (response: GameJoinedResponse) => void;
    gameStarted: (response: GameStartedResponse) => void;
    gameUpdated: (response: GameUpdatedResponse) => void;
    gameLeft: (response: { gameId: string }) => void;
    playerLeft: (response: PlayerEvent) => void;
    playerDisconnected: (response: PlayerEvent) => void;
    playerReconnected: (response: PlayerEvent) => void;
    gameReconnected: (response: GameReconnectedResponse) => void;
}