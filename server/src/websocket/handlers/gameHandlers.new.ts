import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService.new.js';
import { EventService } from '../../services/EventService.js';
import { RedisService } from '../../services/RedisService.js';

// Import new types
import type { 
    IGameState,
    IGameMove,
    PlayerNumber 
} from '@ctor-game/shared/src/types/game/types.js';
import type { 
    WebSocketErrorCode 
} from '@ctor-game/shared/src/types/network/events.js';
import type { 
    IPlayer 
} from '@ctor-game/shared/src/types/game/players.js';

import { GameLogicService } from '../../services/GameLogicService.new.js';
import { logger } from '../../utils/logger.js';
import { generateId } from '../../utils/id.js';

const BOARD_SIZE = 10;

export interface GameHandlers {
    handleCreateGame: () => Promise<void>;
    handleJoinGame: (gameId: string) => Promise<void>;
    handleMakeMove: (gameId: string, move: IGameMove) => Promise<void>;
    handleEndTurn: (gameId: string) => Promise<void>;
}

export function createGameHandlers(
    socket: Socket,
    gameService: GameService,
    eventService: EventService,
    redisService: RedisService
): GameHandlers {
    async function handleCreateGame(): Promise<void> {
        try {
            const gameId = generateId();
            logger.info('Creating new game', {
                socketId: socket.id,
                gameId
            });

            // Create initial state
            const initialState = GameLogicService.createInitialState();

            // Create initial player
            const player: IPlayer = {
                id: socket.id,
                number: 1 as PlayerNumber,
                connected: true
            };

            // Create game and event
            const [game, event] = await Promise.all([
                gameService.createGame(gameId, player, initialState),
                eventService.createGameCreatedEvent(gameId, 'waiting')
            ]);

            // Join room and send response
            await socket.join(gameId);
            socket.emit('game_created', {
                gameId,
                eventId: event.id,
                status: event.data.status
            });

            logger.info('Game created successfully', {
                gameId,
                playerId: socket.id,
                eventId: event.id
            });
        } catch (error) {
            handleError(error as Error);
        }
    }

    async function handleJoinGame(gameId: string): Promise<void> {
        try {
            // Get game state
            const state = await redisService.getGameState(gameId);
            if (!state) {
                throw new Error('Game not found');
            }

            // Create player
            const player: IPlayer = {
                id: socket.id,
                number: 2 as PlayerNumber,
                connected: true
            };

            // Join game
            const [game, connectEvent] = await Promise.all([
                gameService.joinGame(gameId, player),
                eventService.createPlayerConnectedEvent(gameId, socket.id, player.number)
            ]);

            // Join room
            await socket.join(gameId);

            // Send join confirmation
            socket.emit('game_joined', {
                gameId,
                eventId: connectEvent.id,
                status: game.status
            });

            // If game is full, start it
            if (game.players.length === 2) {
                const startEvent = await eventService.createGameStartedEvent(gameId, game.currentState);
                socket.to(gameId).emit('game_started', {
                    gameId,
                    eventId: startEvent.id,
                    gameState: game.currentState,
                    currentPlayer: game.currentState.currentPlayer
                });
            }

            logger.info('Player joined game', {
                gameId,
                playerId: socket.id,
                eventId: connectEvent.id
            });
        } catch (error) {
            handleError(error as Error);
        }
    }

    async function handleMakeMove(gameId: string, move: IGameMove): Promise<void> {
        try {
            // Get game and player info
            const [game, player] = await Promise.all([
                redisService.getGame(gameId),
                redisService.getPlayerNumber(gameId, socket.id)
            ]);

            if (!game) {
                throw new Error('Game not found');
            }

            if (!player) {
                throw new Error('Player not found');
            }

            if (game.status === 'finished') {
                throw new Error('Game is already finished');
            }

            if (player !== game.currentState.currentPlayer) {
                throw new Error('Not your turn');
            }

            // Make move
            const newState = await gameService.makeMove(gameId, player, move);

            // Get and emit move event
            const moveEvent = await eventService.createGameMoveEvent(
                gameId,
                socket.id,
                move,
                newState
            );

            socket.to(gameId).emit('game_state_updated', {
                eventId: moveEvent.id,
                gameState: newState,
                currentPlayer: newState.currentPlayer
            });

            // Handle game over
            if (newState.status === 'finished') {
                const winner = newState.scores.player1 > newState.scores.player2 ? 1 : 2;
                const endEvent = await eventService.createGameEndedEvent(
                    gameId,
                    winner as PlayerNumber,
                    newState
                );

                socket.to(gameId).emit('game_over', {
                    eventId: endEvent.id,
                    gameState: newState,
                    winner
                });
            }

            logger.info('Move applied', {
                gameId,
                playerId: socket.id,
                move,
                eventId: moveEvent.id
            });
        } catch (error) {
            handleError(error as Error);
        }
    }

    async function handleEndTurn(gameId: string): Promise<void> {
        try {
            const [game, player] = await Promise.all([
                redisService.getGame(gameId),
                redisService.getPlayerNumber(gameId, socket.id)
            ]);

            if (!game) {
                throw new Error('Game not found');
            }

            if (!player) {
                throw new Error('Player not found');
            }

            if (player !== game.currentState.currentPlayer) {
                throw new Error('Not your turn');
            }

            // End turn
            const newState = await redisService.endTurn(gameId);

            // Create and emit event
            const moveEvent = await eventService.createGameMoveEvent(
                gameId,
                socket.id,
                { type: 'end_turn' },
                newState
            );

            socket.to(gameId).emit('turn_ended', {
                eventId: moveEvent.id,
                gameState: newState,
                nextPlayer: newState.currentPlayer
            });

            logger.info('Turn ended', {
                gameId,
                playerId: socket.id,
                eventId: moveEvent.id
            });
        } catch (error) {
            handleError(error as Error);
        }
    }

    function handleError(error: Error): void {
        logger.error('Game error', {
            socketId: socket.id,
            error
        });

        redisService.getPlayerSession(socket.id)
            .then(session => {
                if (session) {
                    eventService.createErrorEvent(
                        session.gameId,
                        {
                            code: 500 as WebSocketErrorCode,
                            message: error.message
                        },
                        socket.id
                    ).then(event => {
                        socket.emit('error', {
                            eventId: event.id,
                            code: 500,
                            message: error.message
                        });
                    });
                } else {
                    socket.emit('error', {
                        code: 500,
                        message: error.message
                    });
                }
            })
            .catch(err => {
                logger.error('Error handling failed', {
                    socketId: socket.id,
                    error: err
                });
                socket.emit('error', {
                    code: 500,
                    message: error.message
                });
            });
    }

    return {
        handleCreateGame,
        handleJoinGame,
        handleMakeMove,
        handleEndTurn
    };
}