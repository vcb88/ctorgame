/**
 * Service for handling game events
 */

import { RedisService } from './RedisService.js';
import type {
    GameEvent,
    GameEventType,
    GameCreatedPayload,
    GameStartedPayload,
    GameMovePayload,
    GameEndedPayload,
    PlayerConnectedPayload,
    PlayerDisconnectedPayload,
    GameErrorPayload
} from '@ctor-game/shared/types/network/websocket';
import type { GameState, GameMove, PlayerNumber } from '@ctor-game/shared/types/game/types';
import type { GameError } from '@ctor-game/shared/types/network/errors';
import { validateEvent } from '@ctor-game/shared/types/network/websocket';
import { generateId } from '../utils/id.js';
import { logger } from '../utils/logger.js';

export class EventService {
    private readonly redis: RedisService;
    private readonly eventPrefix = 'event:';
    private readonly gameEventsPrefix = 'game:events:';
    private readonly eventTTL = 3600; // 1 hour

    constructor(redisService: RedisService) {
        this.redis = redisService;
    }

    /**
     * Create and store a new event
     */
    private async createEvent<T extends GameEvent>(event: Omit<T, 'id' | 'timestamp'>): Promise<T> {
        const id = generateId();
        const timestamp = Date.now();
        const fullEvent = {
            ...event,
            id,
            timestamp,
        } as T;

        if (!validateEvent(fullEvent)) {
            throw new Error('Invalid event data');
        }

        try {
            // Store event in Redis
            await this.redis.setWithExpiry(
                `${this.eventPrefix}${id}`,
                JSON.stringify(fullEvent),
                this.eventTTL
            );

            // Add to game events list
            await this.redis.addToList(
                `${this.gameEventsPrefix}${event.gameId}`,
                JSON.stringify({ id, type: event.type, timestamp })
            );

            return fullEvent;
        } catch (error) {
            logger.error('Failed to store event', { error, event: fullEvent });
            throw new Error('Failed to store event');
        }
    }

    /**
     * Game events
     */
    async createGameCreatedEvent(gameId: string, status: 'waiting'): Promise<GameEvent & GameCreatedPayload> {
        return this.createEvent<GameEvent & GameCreatedPayload>({
            type: 'game_created' as GameEventType,
            gameId,
            data: {
                gameId,
                status,
                createdAt: Date.now(),
            },
        });
    }

    async createGameStartedEvent(gameId: string, state: GameState): Promise<GameEvent & GameStartedPayload> {
        return this.createEvent<GameEvent & GameStartedPayload>({
            type: 'game_started' as GameEventType,
            gameId,
            data: {
                gameState: state,
                currentPlayer: state.currentPlayer,
            },
        });
    }

    async createGameMoveEvent(
        gameId: string,
        playerId: string,
        move: GameMove,
        state: GameState
    ): Promise<GameEvent & GameMovePayload> {
        return this.createEvent<GameEvent & GameMovePayload>({
            type: 'game_state_updated' as GameEventType,
            gameId,
            playerId,
            data: {
                gameState: state,
                currentPlayer: state.currentPlayer,
            },
        });
    }

    async createGameEndedEvent(
        gameId: string,
        winner: PlayerNumber | null,
        finalState: GameState
    ): Promise<GameEvent & GameEndedPayload> {
        return this.createEvent<GameEvent & GameEndedPayload>({
            type: 'game_over' as GameEventType,
            gameId,
            data: {
                gameState: finalState,
                winner,
                finalScores: finalState.scores,
            },
        });
    }

    async createGameExpiredEvent(gameId: string): Promise<GameEvent> {
        return this.createEvent<GameEvent>({
            type: 'game_expired' as GameEventType,
            gameId,
            data: {
                expiredAt: Date.now(),
            },
        });
    }

    /**
     * Player events
     */
    async createPlayerConnectedEvent(
        gameId: string,
        playerId: string,
        playerNumber: PlayerNumber
    ): Promise<GameEvent & PlayerConnectedPayload> {
        return this.createEvent<GameEvent & PlayerConnectedPayload>({
            type: 'player_connected' as GameEventType,
            gameId,
            playerId,
            data: {
                playerId,
                playerNumber,
            },
        });
    }

    async createPlayerDisconnectedEvent(
        gameId: string,
        playerId: string,
        playerNumber: PlayerNumber
    ): Promise<GameEvent & PlayerDisconnectedPayload> {
        return this.createEvent<GameEvent & PlayerDisconnectedPayload>({
            type: 'player_disconnected' as GameEventType,
            gameId,
            playerId,
            data: {
                playerId,
                playerNumber,
            },
        });
    }

    async createErrorEvent(
        gameId: string,
        error: GameError,
        playerId?: string
    ): Promise<GameEvent & GameErrorPayload> {
        return this.createEvent<GameEvent & GameErrorPayload>({
            type: 'error' as GameEventType,
            gameId,
            playerId,
            data: error,
        });
    }

    /**
     * Event retrieval
     */
    async getEvent(eventId: string): Promise<GameEvent | null> {
        const eventData = await this.redis.get(`${this.eventPrefix}${eventId}`);
        if (!eventData) {
            return null;
        }

        const event = JSON.parse(eventData) as GameEvent;
        if (!validateEvent(event)) {
            logger.error('Invalid event data in storage', { eventId, event });
            return null;
        }

        return event;
    }

    async getGameEvents(gameId: string, afterTimestamp?: number): Promise<GameEvent[]> {
        const eventList = await this.redis.getList(`${this.gameEventsPrefix}${gameId}`);
        const events: GameEvent[] = [];

        for (const eventData of eventList) {
            const { id, timestamp } = JSON.parse(eventData);
            
            if (afterTimestamp && timestamp <= afterTimestamp) {
                continue;
            }

            const event = await this.getEvent(id);
            if (event) {
                events.push(event);
            }
        }

        return events;
    }

    /**
     * Clean up events for a game
     */
    async cleanupGameEvents(gameId: string): Promise<void> {
        const events = await this.getGameEvents(gameId);
        
        // Remove all events
        const promises = events.map(event => 
            this.redis.delete(`${this.eventPrefix}${event.id}`)
        );
        promises.push(this.redis.delete(`${this.gameEventsPrefix}${gameId}`));

        await Promise.all(promises);
    }
}