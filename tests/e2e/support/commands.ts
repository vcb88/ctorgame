import '@testing-library/cypress/add-commands'
import { GameState, CustomCommands } from './types'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Chainable extends CustomCommands {}
  }
}

// Создание новой игры
Cypress.Commands.add('createGame', () => {
  cy.visit('/')
  cy.getByTestId('create-game-btn').click()
  return cy.getByTestId('room-code')
    .invoke('text')
    .should('match', /^[A-Z0-9]{6}$/)
})

// Присоединение к игре
Cypress.Commands.add('joinGame', (code: string) => {
  cy.visit('/')
  cy.getByTestId('join-game-input').type(code)
  cy.getByTestId('join-game-btn').click()
  cy.getByTestId('game-board').should('be.visible')
})

// Выполнение хода
Cypress.Commands.add('makeMove', (row: number, col: number) => {
  cy.getByTestId(`cell-${row}-${col}`).click()
  // Проверяем, что ход обработан
  cy.getByTestId(`cell-${row}-${col}`).should('not.have.attr', 'data-empty')
  // Ждем обновления состояния
  cy.wait(100)
})

// Последовательность ходов для победы
Cypress.Commands.add('playWinningMoves', () => {
  const moves = [
    [0, 0], // Player 1
    [0, 1], // Player 2
    [1, 1], // Player 1
    [0, 2], // Player 2
    [2, 2], // Player 1 wins
  ]

  moves.forEach(([row, col]) => {
    cy.makeMove(row, col)
    cy.waitForTurn()
  })
})

// Проверка состояния игры
Cypress.Commands.add('checkGameState', (expectedState: GameState) => {
  if (expectedState.currentPlayer !== undefined) {
    cy.getByTestId('current-player')
      .should('contain', `Player ${expectedState.currentPlayer + 1}'s turn`)
  }

  if (expectedState.gameOver) {
    cy.getByTestId('game-status').should('contain', 'Game Over')
  }

  if (expectedState.winner !== undefined) {
    if (expectedState.winner === null) {
      cy.getByTestId('game-status').should('contain', 'Draw')
    } else {
      cy.getByTestId('game-status')
        .should('contain', `Player ${expectedState.winner + 1} wins!`)
    }
  }

  if (expectedState.board) {
    expectedState.board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null) {
          cy.getByTestId(`cell-${rowIndex}-${colIndex}`)
            .should('have.attr', 'data-empty')
        } else {
          cy.getByTestId(`cell-${rowIndex}-${colIndex}`)
            .should('contain', cell === 0 ? 'X' : 'O')
        }
      })
    })
  }
})

// Ожидание своего хода
Cypress.Commands.add('waitForTurn', () => {
  cy.getByTestId('current-player')
    .should('exist')
    .invoke('text')
    .then((text) => {
      if (text.includes('opponent')) {
        cy.getByTestId('current-player')
          .should('not.contain', 'opponent')
      }
    })
})

// Переподключение к игре
Cypress.Commands.add('reconnectToGame', (code: string) => {
  cy.window().then((win) => {
    win.location.reload()
  })
  cy.getByTestId('join-game-input').should('be.visible')
  cy.getByTestId('join-game-input').type(code)
  cy.getByTestId('join-game-btn').click()
  cy.getByTestId('game-board').should('be.visible')
})

// Симуляция отключения
Cypress.Commands.add('simulateDisconnect', () => {
  cy.window().then((win) => {
    win.dispatchEvent(new Event('offline'))
  })
  cy.getByTestId('connection-status')
    .should('contain', 'Disconnected')
})