// Типы для событий Socket.IO

export interface CreateGameResponse {
  roomCode: string
  success: boolean
}

export interface JoinGameResponse {
  success: boolean
  error?: string
}

export interface GameMoveResponse {
  success: boolean
  error?: string
  gameOver?: boolean
  winner?: number | null
  currentPlayer?: number
  board?: Array<Array<number | null>>
}

export interface PlayerDisconnectedEvent {
  player: number
  reason?: string
}

export interface GameState {
  currentPlayer: number
  board: Array<Array<number | null>>
  gameOver: boolean
  winner: number | null
  lastMove?: { row: number; col: number }
}

export interface GameMove {
  row: number
  col: number
}