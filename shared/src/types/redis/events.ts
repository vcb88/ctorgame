// Game events stored in Redis
export interface IRedisGameEvent {
    type: 'move' | 'disconnect' | 'reconnect' | 'end_turn';
    gameId: string;
    playerId: string;
    data: unknown;
    timestamp: number;
    eventId?: string;
    processed?: boolean;
}

// Event processing status
export interface IRedisEventStatus {
    eventId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    processedAt?: number;
}