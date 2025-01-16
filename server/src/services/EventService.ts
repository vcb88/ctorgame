/**
 * Service for handling game events
 */

import { RedisService } from './RedisService.js';
import {
    GameEvent,
    GameEventType,
    IGameCreatedPayload,
    IGameStartedPayload,
    IGameMovePayload,
    IGameEndedPayload,
    IPlayerConnectedPayload,
    IPlayerDisconnectedPayload,
    IGameErrorPayload,
    IGameState,
    IGameMove,
    PlayerNumber,
    IGameError,
    validateGameEvent as validateEvent
} from '../types/shared.js';
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
    async createGameCreatedEvent(gameId: string, status: 'waiting'): Promise<GameEvent & IGameCreatedPayload> {
        return this.createEvent<GameEvent & IGameCreatedPayload>({
            type: 'game_created' as GameEventType,
            gameId,
            data: {
                gameId,
                status,
                createdAt: Date.now(),
            },
        });
    }

    async createGameStartedEvent(gameId: string, state: IGameState): Promise<IGameEvent & IGameStartedPayload> {
        return this.createEvent<IGameEvent & IGameStartedPayload>({
            type: 'game_started' as IGameEventType,
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
        move: IGameMove,
        state: IGameState
    ): Promise<IGameEvent & IGameMovePayload> {
        return this.createEvent<IGameEvent & IGameMovePayload>({
            type: 'game_state_updated' as IGameEventType,
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
        finalState: IGameState
    ): Promise<IGameEvent & IGameEndedPayload> {
        return this.createEvent<IGameEvent & IGameEndedPayload>({
            type: 'game_over' as IGameEventType,
            gameId,
            data: {
                gameState: finalState,
                winner,
                finalScores: finalState.scores,
            },
        });
    }

    async createGameExpiredEvent(gameId: string): Promise<IGameEvent> {
        return this.createEvent<IGameEvent>({
            type: 'game_expired' as IGameEventType,
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
    ): Promise<IGameEvent & IPlayerConnectedPayload> {
        return this.createEvent<IGameEvent & IPlayerConnectedPayload>({
            type: 'player_connected' as IGameEventType,
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
    ): Promise<IGameEvent & IPlayerDisconnectedPayload> {
        return this.createEvent<IGameEvent & IPlayerDisconnectedPayload>({
            type: 'player_disconnected' as IGameEventType,
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
        error: IGameError,
        playerId?: string
    ): Promise<IGameEvent & IGameErrorPayload> {
        return this.createEvent<IGameEvent & IGameErrorPayload>({
            type: 'error' as IGameEventType,
            gameId,
            playerId,
            data: error,
        });
    }

    /**
     * Event retrieval
     */
    async getEvent(eventId: string): Promise<IGameEvent | null> {
        const eventData = await this.redis.get(`${this.eventPrefix}${eventId}`);
        if (!eventData) {
            return null;
        }

        const event = JSON.parse(eventData) as IGameEvent;
        if (!validateEvent(event)) {
            logger.error('Invalid event data in storage', { eventId, event });
            return null;
        }

        return event;
    }

    async getGameEvents(gameId: string, afterTimestamp?: number): Promise<IGameEvent[]> {
        const eventList = await this.redis.getList(`${this.gameEventsPrefix}${gameId}`);
        const events: IGameEvent[] = [];

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