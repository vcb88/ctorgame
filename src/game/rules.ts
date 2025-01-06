import { Player, Position, GameState, MoveValidation, CaptureResult, MoveResult } from '../types/game';

const BOARD_SIZE = 10; // 10x10 board

export function createInitialState(): GameState {
    return {
        board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(Player.None)),
        currentPlayer: Player.First,
        status: 'waiting',
        moves: [],
        score: {
            [Player.First]: 0,
            [Player.Second]: 0
        },
        winner: null,
        opsRemaining: 2
    };
}

export function validateMove(state: GameState, player: Player, pos: Position): MoveValidation {
    // Check if it's the player's turn
    if (player !== state.currentPlayer) {
        return { isValid: false, reason: "Not your turn" };
    }

    // Check if there are operations remaining
    if (state.opsRemaining <= 0) {
        return { isValid: false, reason: "No operations remaining" };
    }

    // Check if position is within bounds (considering torus)
    const x = ((pos.x % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
    const y = ((pos.y % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;

    // Check if cell is empty
    if (state.board[x][y] !== Player.None) {
        return { isValid: false, reason: "Cell is already occupied" };
    }

    return { isValid: true };
}

export function getAdjacentPositions(pos: Position): Position[] {
    const positions: Position[] = [];
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            positions.push({
                x: ((pos.x + dx + BOARD_SIZE) % BOARD_SIZE),
                y: ((pos.y + dy + BOARD_SIZE) % BOARD_SIZE)
            });
        }
    }
    return positions;
}

export function findCaptures(state: GameState, pos: Position): CaptureResult[] {
    const captures: CaptureResult[] = [];
    const player = state.currentPlayer;
    const opponent = player === Player.First ? Player.Second : Player.First;

    // Get all adjacent positions
    const adjacent = getAdjacentPositions(pos);
    const playerCells = adjacent.filter(p => state.board[p.x][p.y] === player);

    // Check each opponent's piece
    const opponentPositions = adjacent.filter(p => state.board[p.x][p.y] === opponent);
    for (const oppPos of opponentPositions) {
        // Count surrounding player's pieces
        const oppAdjacent = getAdjacentPositions(oppPos);
        const surroundingPlayer = oppAdjacent.filter(p => 
            state.board[p.x][p.y] === player || 
            (p.x === pos.x && p.y === pos.y)
        );

        // If 5 or more surrounding pieces, capture
        if (surroundingPlayer.length >= 5) {
            captures.push({
                positions: [oppPos],
                player
            });
        }
    }

    return captures;
}

export function applyMove(state: GameState, pos: Position): MoveResult {
    const validation = validateMove(state, state.currentPlayer, pos);
    if (!validation.isValid) {
        return {
            isValid: false,
            captures: [],
            nextPlayer: state.currentPlayer,
            opsRemaining: state.opsRemaining,
            isGameOver: false,
            winner: null
        };
    }

    // Make a copy of the board
    const newBoard = state.board.map(row => [...row]);
    
    // Apply move
    const x = ((pos.x % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
    const y = ((pos.y % BOARD_SIZE) + BOARD_SIZE) % BOARD_SIZE;
    newBoard[x][y] = state.currentPlayer;

    // Find and apply captures
    const captures = findCaptures({ ...state, board: newBoard }, pos);
    for (const capture of captures) {
        for (const capturePos of capture.positions) {
            newBoard[capturePos.x][capturePos.y] = capture.player;
        }
    }

    // Calculate new scores
    const flatBoard = newBoard.flat();
    const scores = {
        [Player.First]: flatBoard.filter(cell => cell === Player.First).length,
        [Player.Second]: flatBoard.filter(cell => cell === Player.Second).length
    };

    // Check if game is over
    const emptyCells = flatBoard.filter(cell => cell === Player.None).length;
    const isGameOver = emptyCells === 0 || state.opsRemaining <= 1;

    // Determine winner if game is over
    let winner = null;
    if (isGameOver) {
        if (scores[Player.First] > scores[Player.Second]) {
            winner = Player.First;
        } else if (scores[Player.Second] > scores[Player.First]) {
            winner = Player.Second;
        }
    }

    // Determine next player and remaining operations
    const opsRemaining = state.opsRemaining - 1;
    const nextPlayer = opsRemaining <= 0 ? 
        (state.currentPlayer === Player.First ? Player.Second : Player.First) : 
        state.currentPlayer;

    return {
        isValid: true,
        captures,
        nextPlayer,
        opsRemaining: opsRemaining <= 0 ? 2 : opsRemaining,
        isGameOver,
        winner
    };
}