export enum GameEventType {
    MOVE = 'move',
    DISCONNECT = 'disconnect',
    RECONNECT = 'reconnect',
    END_TURN = 'end_turn'
}

export interface IGameEvent {
    type: GameEventType;
    gameId: string;
    playerId: string;
    data: Record<string, any>;
    timestamp: number;
}