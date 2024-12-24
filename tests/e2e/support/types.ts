export interface GameState {
  currentPlayer?: number
  gameOver?: boolean
  winner?: number | null
  board?: Array<Array<number | null>>
}

export interface CustomCommands {
  createGame(): Cypress.Chainable<string>
  joinGame(code: string): Cypress.Chainable<void>
  playWinningMoves(): Cypress.Chainable<void>
  makeMove(row: number, col: number): Cypress.Chainable<void>
  checkGameState(state: GameState): Cypress.Chainable<void>
  waitForTurn(): Cypress.Chainable<void>
  reconnectToGame(code: string): Cypress.Chainable<void>
  simulateDisconnect(): Cypress.Chainable<void>
}