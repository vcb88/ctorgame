import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService.js';
import type { 
    GameState,
    GameId 
} from '@ctor-game/shared/types/base/types.js';
// Importing ReplayState from base types
import type { 
    ReplayState 
} from '@ctor-game/shared/types/base/types.js';

// Temporary type definitions until we move them to shared
type ReplayClientEvents = {
    'START_REPLAY': (data: { gameCode: string }) => void;
    'PAUSE_REPLAY': (data: { gameCode: string }) => void;
    'RESUME_REPLAY': (data: { gameCode: string }) => void;
    'NEXT_MOVE': (data: { gameCode: string }) => void;
    'PREV_MOVE': (data: { gameCode: string }) => void;
    'GOTO_MOVE': (data: { gameCode: string, moveIndex: number }) => void;
    'SET_PLAYBACK_SPEED': (data: { gameCode: string, speed: number }) => void;
    'END_REPLAY': (data: { gameCode: string }) => void;
};

type ReplayServerEvents = {
    'REPLAY_STATE_UPDATED': (data: { state: GameState, moveIndex: number, totalMoves: number }) => void;
    'REPLAY_PAUSED': (data: { moveIndex: number }) => void;
    'REPLAY_RESUMED': (data: { moveIndex: number }) => void;
    'REPLAY_ERROR': (data: { message: string }) => void;
    'REPLAY_COMPLETED': (data: { gameCode: string }) => void;
    'REPLAY_ENDED': (data: { gameCode: string }) => void;
    'PLAYBACK_SPEED_UPDATED': (data: { speed: number }) => void;
};
// Basic validation functions (temporarily defined here)
function validateReplayState(state: ReplayState): void {
    if (state.currentMoveIndex < 0 || state.currentMoveIndex > state.totalMoves) {
        throw new Error('Invalid move index');
    }
    validatePlaybackSpeed(state.playbackSpeed);
}

function validateMoveIndex(index: number, totalMoves: number): void {
    if (index < 0 || index > totalMoves) {
        throw new Error('Invalid move index');
    }
}

function validatePlaybackSpeed(speed: number): void {
    if (speed <= 0 || speed > 5) {
        throw new Error('Invalid playback speed. Must be between 0 and 5');
    }
}

// Состояние replay для каждой игры
const replayStates = new Map<GameId, ReplayState>();

// Helper function to update replay state
function updateReplayState(gameCode: GameId, updates: Partial<ReplayState>): ReplayState {
    const currentState = replayStates.get(gameCode);
    if (!currentState) {
        throw new Error('Replay session not found');
    }
    
    const newState: ReplayState = {
        ...currentState,
        ...updates
    };
    
    replayStates.set(gameCode, newState);
    return newState;
}

export function registerReplayHandlers(
    socket: Socket<ReplayClientEvents, ReplayServerEvents>,
    gameService: GameService
) {
    // Начать воспроизведение
    socket.on('START_REPLAY', async ({ gameCode }: { gameCode: GameId }) => {
        try {
            // Получаем историю игры
            const history = await gameService.getGameHistory(gameCode);
            const totalMoves = history.moves.length;
            
            // Создаем состояние воспроизведения
            const replayState: ReplayState = {
                currentMoveIndex: 0,
                totalMoves,
                isPlaying: true,
                playbackSpeed: 1,
                gameCode
            };

            // Валидируем состояние реплея
            validateReplayState(replayState);
            
            replayStates.set(gameCode, replayState);
            
            // Отправляем начальное состояние
            const initialState = await gameService.getGameStateAtMove(gameCode, 0);
            if (!initialState) {
                throw new Error('Failed to get initial game state');
            }
            socket.emit('REPLAY_STATE_UPDATED', { 
                state: initialState, 
                moveIndex: 0,
                totalMoves
            });
            
            // Начинаем автоматическое воспроизведение
            playNextMove(socket, gameService, gameCode);
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            });
        }
    });

    // Приостановить воспроизведение
    socket.on('PAUSE_REPLAY', ({ gameCode }: { gameCode: GameId }) => {
        try {
            const newState = updateReplayState(gameCode, { isPlaying: false });
            socket.emit('REPLAY_PAUSED', { moveIndex: newState.currentMoveIndex });
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Failed to pause replay'
            });
        }
    });

    // Возобновить воспроизведение
    socket.on('RESUME_REPLAY', ({ gameCode }: { gameCode: GameId }) => {
        try {
            const newState = updateReplayState(gameCode, { isPlaying: true });
            socket.emit('REPLAY_RESUMED', { moveIndex: newState.currentMoveIndex });
            playNextMove(socket, gameService, gameCode);
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Failed to resume replay'
            });
        }
    });

    // Следующий ход
    socket.on('NEXT_MOVE', async ({ gameCode }: { gameCode: GameId }) => {
        try {
            const state = replayStates.get(gameCode);
            if (state && state.currentMoveIndex < state.totalMoves) {
                const newState = updateReplayState(gameCode, { 
                    currentMoveIndex: state.currentMoveIndex + 1 
                });
                
                const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
                if (!gameState) {
                    throw new Error('Failed to get game state for next move');
                }
                socket.emit('REPLAY_STATE_UPDATED', { 
                    state: gameState, 
                    moveIndex: newState.currentMoveIndex,
                    totalMoves: newState.totalMoves
                });
            }
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Failed to move to next state'
            });
        }
    });

    // Предыдущий ход
    socket.on('PREV_MOVE', async ({ gameCode }: { gameCode: GameId }) => {
        try {
            const state = replayStates.get(gameCode);
            if (state && state.currentMoveIndex > 0) {
                const newState = updateReplayState(gameCode, { 
                    currentMoveIndex: state.currentMoveIndex - 1 
                });
                
                const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
                if (!gameState) {
                    throw new Error('Failed to get game state for previous move');
                }
                socket.emit('REPLAY_STATE_UPDATED', { 
                    state: gameState, 
                    moveIndex: newState.currentMoveIndex,
                    totalMoves: newState.totalMoves
                });
            }
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Failed to move to previous state'
            });
        }
    });

    // Перейти к определенному ходу
    socket.on('GOTO_MOVE', async ({ gameCode, moveIndex }: { gameCode: GameId, moveIndex: number }) => {
        try {
            const state = replayStates.get(gameCode);
            if (!state) {
                throw new Error('Replay session not found');
            }

            // Validate move index
            validateMoveIndex(moveIndex, state.totalMoves);
            
            const newState = updateReplayState(gameCode, { currentMoveIndex: moveIndex });
            const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
            if (!gameState) {
                throw new Error('Failed to get game state for the specified move');
            }
            socket.emit('REPLAY_STATE_UPDATED', { 
                state: gameState, 
                moveIndex: newState.currentMoveIndex,
                totalMoves: newState.totalMoves
            });
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Invalid move request'
            });
        }
    });

    // Изменить скорость воспроизведения
    socket.on('SET_PLAYBACK_SPEED', ({ gameCode, speed }: { gameCode: GameId, speed: number }) => {
        try {
            const state = replayStates.get(gameCode);
            if (!state) {
                throw new Error('Replay session not found');
            }

            // Validate playback speed
            validatePlaybackSpeed(speed);
            
            const newState = updateReplayState(gameCode, { playbackSpeed: speed });
            socket.emit('PLAYBACK_SPEED_UPDATED', { speed: newState.playbackSpeed });
        } catch (error) {
            socket.emit('REPLAY_ERROR', { 
                message: error instanceof Error ? error.message : 'Invalid playback speed'
            });
        }
    });

    // Закончить воспроизведение
    socket.on('END_REPLAY', ({ gameCode }: { gameCode: GameId }) => {
        replayStates.delete(gameCode);
        socket.emit('REPLAY_ENDED', { gameCode });
    });
}

// Вспомогательная функция для автоматического воспроизведения следующего хода
async function playNextMove(
    socket: Socket<ReplayClientEvents, ReplayServerEvents>,
    gameService: GameService,
    gameCode: GameId
) {
    const state = replayStates.get(gameCode);
    if (!state || !state.isPlaying || state.currentMoveIndex >= state.totalMoves) {
        return;
    }

    // Получаем состояние для следующего хода
    const newState = updateReplayState(gameCode, { 
        currentMoveIndex: state.currentMoveIndex + 1 
    });
    const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
    if (!gameState) {
        throw new Error('Failed to get game state for automatic playback');
    }
    
    // Отправляем обновление состояния
    socket.emit('REPLAY_STATE_UPDATED', {
        state: gameState,
        moveIndex: newState.currentMoveIndex,
        totalMoves: newState.totalMoves
    });

    // Планируем следующий ход, если воспроизведение продолжается
    if (newState.currentMoveIndex < newState.totalMoves) {
        const delay = 1000 / newState.playbackSpeed; // Базовая задержка 1 секунда, модифицированная скоростью
        setTimeout(() => playNextMove(socket, gameService, gameCode), delay);
    } else {
        // Достигнут конец игры
        socket.emit('REPLAY_COMPLETED', { gameCode });
    }
}