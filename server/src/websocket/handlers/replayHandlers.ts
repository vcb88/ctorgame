import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService';
import type { IGameState } from '@ctor-game/shared/types/game/types';
import type { 
    IReplayState, 
    IReplayClientEvents, 
    IReplayServerEvents 
} from '@ctor-game/shared/types/network/replay';
import { 
    validateReplayState,
    validateMoveIndex,
    validatePlaybackSpeed
} from '@ctor-game/shared/utils/validation/replay';

// Состояние replay для каждой игры
const replayStates = new Map<string, IReplayState>();

// Helper function to update replay state
function updateReplayState(gameCode: string, updates: Partial<IReplayState>): IReplayState {
    const currentState = replayStates.get(gameCode);
    if (!currentState) {
        throw new Error('Replay session not found');
    }
    
    const newState: IReplayState = {
        ...currentState,
        ...updates
    };
    
    replayStates.set(gameCode, newState);
    return newState;
}

export function registerReplayHandlers(
    socket: Socket<IReplayClientEvents, IReplayServerEvents>,
    gameService: GameService
) {
    // Начать воспроизведение
    socket.on('START_REPLAY', async ({ gameCode }: { gameCode: string }) => {
        try {
            // Получаем количество ходов
            const totalMoves = await gameService.getGameHistory(gameCode);
            
            // Создаем состояние воспроизведения
            const replayState: IReplayState = {
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
    socket.on('PAUSE_REPLAY', ({ gameCode }: { gameCode: string }) => {
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
    socket.on('RESUME_REPLAY', ({ gameCode }: { gameCode: string }) => {
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
    socket.on('NEXT_MOVE', async ({ gameCode }: { gameCode: string }) => {
        try {
            const state = replayStates.get(gameCode);
            if (state && state.currentMoveIndex < state.totalMoves) {
                const newState = updateReplayState(gameCode, { 
                    currentMoveIndex: state.currentMoveIndex + 1 
                });
                
                const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
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
    socket.on('PREV_MOVE', async ({ gameCode }: { gameCode: string }) => {
        try {
            const state = replayStates.get(gameCode);
            if (state && state.currentMoveIndex > 0) {
                const newState = updateReplayState(gameCode, { 
                    currentMoveIndex: state.currentMoveIndex - 1 
                });
                
                const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
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
    socket.on('GOTO_MOVE', async ({ gameCode, moveIndex }: { gameCode: string, moveIndex: number }) => {
        try {
            const state = replayStates.get(gameCode);
            if (!state) {
                throw new Error('Replay session not found');
            }

            // Validate move index
            validateMoveIndex(moveIndex, state.totalMoves);
            
            const newState = updateReplayState(gameCode, { currentMoveIndex: moveIndex });
            const gameState = await gameService.getGameStateAtMove(gameCode, newState.currentMoveIndex);
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
    socket.on('SET_PLAYBACK_SPEED', ({ gameCode, speed }: { gameCode: string, speed: number }) => {
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
    socket.on('END_REPLAY', ({ gameCode }: { gameCode: string }) => {
        replayStates.delete(gameCode);
        socket.emit('REPLAY_ENDED', { gameCode });
    });
}

// Вспомогательная функция для автоматического воспроизведения следующего хода
async function playNextMove(
    socket: Socket<IReplayClientEvents, IReplayServerEvents>,
    gameService: GameService,
    gameCode: string
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