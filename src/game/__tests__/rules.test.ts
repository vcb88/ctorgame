import { createInitialState, validateMove, findCaptures, applyMove } from '../rules';
import { Player, GameState, Position } from '../../types/game';

describe('Game Rules', () => {
    let initialState: GameState;

    beforeEach(() => {
        initialState = createInitialState();
    });

    describe('validateMove', () => {
        it('should validate valid move', () => {
            const result = validateMove(initialState, Player.First, { x: 0, y: 0 });
            expect(result.isValid).toBe(true);
        });

        it('should reject move when not player turn', () => {
            const result = validateMove(initialState, Player.Second, { x: 0, y: 0 });
            expect(result.isValid).toBe(false);
            expect(result.reason).toBe('Not your turn');
        });

        it('should reject move to occupied cell', () => {
            const state = {
                ...initialState,
                board: initialState.board.map(row => [...row])
            };
            state.board[0][0] = Player.First;

            const result = validateMove(state, Player.First, { x: 0, y: 0 });
            expect(result.isValid).toBe(false);
            expect(result.reason).toBe('Cell is already occupied');
        });

        it('should handle torus board wrapping', () => {
            const result = validateMove(initialState, Player.First, { x: 10, y: 10 });
            expect(result.isValid).toBe(true);
        });
    });

    describe('findCaptures', () => {
        it('should find captures when 5 surrounding pieces exist', () => {
            const state = {
                ...initialState,
                board: initialState.board.map(row => [...row])
            };
            
            // Setup a capture scenario
            state.board[1][1] = Player.Second; // opponent piece to capture
            state.board[0][0] = Player.First;
            state.board[0][1] = Player.First;
            state.board[0][2] = Player.First;
            state.board[1][0] = Player.First;
            state.currentPlayer = Player.First;

            const captures = findCaptures(state, { x: 1, y: 2 }); // placing final piece
            expect(captures.length).toBe(1);
            expect(captures[0].positions[0]).toEqual({ x: 1, y: 1 });
        });

        it('should not capture with less than 5 surrounding pieces', () => {
            const state = {
                ...initialState,
                board: initialState.board.map(row => [...row])
            };
            
            // Setup a non-capture scenario
            state.board[1][1] = Player.Second;
            state.board[0][0] = Player.First;
            state.board[0][1] = Player.First;
            state.board[1][0] = Player.First;
            state.currentPlayer = Player.First;

            const captures = findCaptures(state, { x: 1, y: 2 });
            expect(captures.length).toBe(0);
        });
    });

    describe('applyMove', () => {
        it('should apply valid move and update state', () => {
            const result = applyMove(initialState, { x: 0, y: 0 });
            expect(result.isValid).toBe(true);
            expect(result.opsRemaining).toBe(1);
        });

        it('should switch players after two moves', () => {
            let state = { ...initialState };
            const firstMove = applyMove(state, { x: 0, y: 0 });
            expect(firstMove.nextPlayer).toBe(Player.First); // Still first player's turn
            
            state = {
                ...state,
                currentPlayer: firstMove.nextPlayer,
                opsRemaining: firstMove.opsRemaining
            };
            
            const secondMove = applyMove(state, { x: 0, y: 1 });
            expect(secondMove.nextPlayer).toBe(Player.Second); // Switch to second player
        });

        it('should detect game over when board is full', () => {
            const state = {
                ...initialState,
                board: initialState.board.map(row => row.map(() => Player.First))
            };
            state.board[9][9] = Player.None; // Leave one cell empty

            const result = applyMove(state, { x: 9, y: 9 });
            expect(result.isGameOver).toBe(true);
        });

        it('should determine winner based on piece count', () => {
            const state = {
                ...initialState,
                board: initialState.board.map(row => row.map(() => Player.First))
            };
            state.board[9][9] = Player.None; // Leave one cell empty
            state.currentPlayer = Player.First;

            const result = applyMove(state, { x: 9, y: 9 });
            expect(result.winner).toBe(Player.First);
        });
    });
});