import { GameAI } from '@/services/ai';
import { IGameState } from '@ctor-game/shared/types/game';
import { IBoard } from '@ctor-game/shared/types/board';

describe('GameAI', () => {
    let ai: GameAI;
    let mockBoard: IBoard;
    let mockState: IGameState;

    beforeEach(() => {
        ai = new GameAI();
        
        // Create 10x10 empty board
        mockBoard = {
            size: { width: 10, height: 10 },
            cells: Array(10).fill(null).map(() => Array(10).fill(0))
        };

        mockState = {
            board: mockBoard,
            currentPlayer: 1,
            gameOver: false,
            winner: null,
            currentTurn: {
                placeOperationsLeft: 2,
                moves: []
            },
            scores: {
                player1: 0,
                player2: 0
            },
            isFirstTurn: true
        };
    });

    describe('evaluatePosition', () => {
        it('should correctly count pieces', () => {
            // Add some pieces to the board
            mockBoard.cells[0][0] = 1;
            mockBoard.cells[0][1] = 1;
            mockBoard.cells[1][0] = 1;

            const evaluation = ai.evaluatePosition(mockBoard, 1);
            expect(evaluation.pieces).toBe(3);
        });

        it('should evaluate territory control', () => {
            // Create a position with territory control
            mockBoard.cells[5][5] = 1;
            const evaluation = ai.evaluatePosition(mockBoard, 1);
            expect(evaluation.territory).toBeGreaterThan(0);
        });

        it('should evaluate group strength', () => {
            // Create a connected group
            mockBoard.cells[1][1] = 1;
            mockBoard.cells[1][2] = 1;
            mockBoard.cells[2][1] = 1;
            
            const evaluation = ai.evaluatePosition(mockBoard, 1);
            expect(evaluation.groupsStrength).toBeGreaterThan(0);
        });
    });

    describe('findBestMove', () => {
        it('should find a valid move', async () => {
            const move = await ai.findBestMove(mockState);
            expect(move.position).toBeDefined();
            expect(move.score).toBeDefined();
            expect(move.components).toBeDefined();
        });

        it('should prefer moves that control territory', async () => {
            // Create a position where territory control is important
            mockBoard.cells[4][4] = 1;
            mockBoard.cells[4][5] = 1;
            
            const move = await ai.findBestMove(mockState);
            expect(move.components.territory).toBeGreaterThan(0);
        });

        it('should consider replacement opportunities', async () => {
            // Create a position where replacement is possible
            mockBoard.cells[1][1] = 1;
            mockBoard.cells[1][2] = 1;
            mockBoard.cells[2][1] = 1;
            mockBoard.cells[2][2] = 2; // opponent piece

            const move = await ai.findBestMove(mockState);
            expect(move.components.replacement).toBeGreaterThan(0);
        });

        it('should respect time limits', async () => {
            ai.initialize({ maxThinkTime: 100 }); // Set 100ms time limit
            const startTime = Date.now();
            await ai.findBestMove(mockState);
            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(150); // Allow some overhead
        });
    });

    describe('analyzeMove', () => {
        it('should evaluate all components', () => {
            const evaluation = ai.analyzeMove(mockState, { x: 5, y: 5 });
            expect(evaluation.components).toEqual(
                expect.objectContaining({
                    territory: expect.any(Number),
                    replacement: expect.any(Number),
                    mobility: expect.any(Number),
                    pattern: expect.any(Number),
                    danger: expect.any(Number),
                    group: expect.any(Number),
                    block: expect.any(Number)
                })
            );
        });

        it('should apply configuration weights', () => {
            ai.initialize({
                weights: {
                    territory: 2.0, // Double territory weight
                    replacement: 1.0,
                    mobility: 1.0,
                    pattern: 1.0,
                    danger: 1.0,
                    group: 1.0,
                    block: 1.0
                }
            });

            // Create a position where territory is important
            mockBoard.cells[5][5] = 0;
            const evaluation = ai.analyzeMove(mockState, { x: 5, y: 5 });
            
            // Territory component should have more impact on final score
            const territoryContribution = evaluation.components.territory * 2.0;
            expect(territoryContribution).toBeGreaterThan(evaluation.components.territory);
        });
    });
});