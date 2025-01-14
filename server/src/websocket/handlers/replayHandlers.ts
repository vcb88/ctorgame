import { Socket } from 'socket.io';
import { GameService } from '../../services/GameService.js';
import type { IGameState } from '@ctor-game/shared/types/game/state';
import type { 
    IReplayState, 
    IReplayClientEvents, 
    IReplayServerEvents 
} from '@ctor-game/shared/types/network/replay';

// Состояние replay для каждой игры
const replayStates = new Map<string, IReplayState>();

export function registerReplayHandlers(
    socket: Socket<IReplayClientEvents, IReplayServerEvents>,
    gameService: GameService
) {
    // Начать воспроизведение
    socket.on('START_REPLAY', async ({ gameCode }) => {
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
    socket.on('PAUSE_REPLAY', ({ gameCode }) => {
        const state = replayStates.get(gameCode);
        if (state) {
            state.isPlaying = false;
            replayStates.set(gameCode, state);
            socket.emit('REPLAY_PAUSED', { moveIndex: state.currentMoveIndex });
        }
    });

    // Возобновить воспроизведение
    socket.on('RESUME_REPLAY', ({ gameCode }) => {
        const state = replayStates.get(gameCode);
        if (state) {
            state.isPlaying = true;
            replayStates.set(gameCode, state);
            socket.emit('REPLAY_RESUMED', { moveIndex: state.currentMoveIndex });
            playNextMove(socket, gameService, gameCode);
        }
    });

    // Следующий ход
    socket.on('NEXT_MOVE', async ({ gameCode }) => {
        const state = replayStates.get(gameCode);
        if (state && state.currentMoveIndex < state.totalMoves) {
            state.currentMoveIndex++;
            replayStates.set(gameCode, state);
            
            const gameState = await gameService.getGameStateAtMove(gameCode, state.currentMoveIndex);
            socket.emit('REPLAY_STATE_UPDATED', { 
                state: gameState, 
                moveIndex: state.currentMoveIndex,
                totalMoves: state.totalMoves
            });
        }
    });

    // Предыдущий ход
    socket.on('PREV_MOVE', async ({ gameCode }) => {
        const state = replayStates.get(gameCode);
        if (state && state.currentMoveIndex > 0) {
            state.currentMoveIndex--;
            replayStates.set(gameCode, state);
            
            const gameState = await gameService.getGameStateAtMove(gameCode, state.currentMoveIndex);
            socket.emit('REPLAY_STATE_UPDATED', { 
                state: gameState, 
                moveIndex: state.currentMoveIndex,
                totalMoves: state.totalMoves
            });
        }
    });

    // Перейти к определенному ходу
    socket.on('GOTO_MOVE', async ({ gameCode, moveIndex }) => {
        const state = replayStates.get(gameCode);
        if (state && moveIndex >= 0 && moveIndex <= state.totalMoves) {
            state.currentMoveIndex = moveIndex;
            replayStates.set(gameCode, state);
            
            const gameState = await gameService.getGameStateAtMove(gameCode, moveIndex);
            socket.emit('REPLAY_STATE_UPDATED', { 
                state: gameState, 
                moveIndex: state.currentMoveIndex,
                totalMoves: state.totalMoves
            });
        }
    });

    // Изменить скорость воспроизведения
    socket.on('SET_PLAYBACK_SPEED', ({ gameCode, speed }) => {
        const state = replayStates.get(gameCode);
        if (state) {
            state.playbackSpeed = speed;
            replayStates.set(gameCode, state);
            socket.emit('PLAYBACK_SPEED_UPDATED', { speed });
        }
    });

    // Закончить воспроизведение
    socket.on('END_REPLAY', ({ gameCode }) => {
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
    state.currentMoveIndex++;
    const gameState = await gameService.getGameStateAtMove(gameCode, state.currentMoveIndex);
    
    // Отправляем обновление состояния
    socket.emit('REPLAY_STATE_UPDATED', {
        state: gameState,
        moveIndex: state.currentMoveIndex,
        totalMoves: state.totalMoves
    });

    // Планируем следующий ход, если воспроизведение продолжается
    if (state.currentMoveIndex < state.totalMoves) {
        const delay = 1000 / state.playbackSpeed; // Базовая задержка 1 секунда, модифицированная скоростью
        setTimeout(() => playNextMove(socket, gameService, gameCode), delay);
    } else {
        // Достигнут конец игры
        socket.emit('REPLAY_COMPLETED', { gameCode });
    }
}