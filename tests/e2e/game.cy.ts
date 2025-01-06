describe('Game E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173')
  })

  it('should create a new game', () => {
    cy.get('[data-testid=create-game-btn]').click()
    cy.get('[data-testid=room-code]').should('be.visible')
    cy.get('[data-testid=room-code]').should('match', /^[A-Z0-9]{6}$/)
  })

  it('should join an existing game', () => {
    // Create a game in one tab
    cy.visit('http://localhost:5173')
    cy.get('[data-testid=create-game-btn]').click()
    cy.get('[data-testid=room-code]').then(($code) => {
      const roomCode = $code.text()

      // Join the game in another tab
      cy.visit('http://localhost:5173')
      cy.get('[data-testid=join-game-input]').type(roomCode)
      cy.get('[data-testid=join-game-btn]').click()
      cy.get('[data-testid=game-board]').should('be.visible')
    })
  })

  it('should play a complete game', () => {
    // Create game
    cy.get('[data-testid=create-game-btn]').click()
    cy.get('[data-testid=room-code]').then(($code) => {
      const roomCode = $code.text()

      // Join game in another tab
      cy.visit('http://localhost:5173')
      cy.get('[data-testid=join-game-input]').type(roomCode)
      cy.get('[data-testid=join-game-btn]').click()

      // Play moves
      cy.get('[data-testid=cell-0-0]').click() // Player 1
      cy.get('[data-testid=cell-0-1]').click() // Player 2
      cy.get('[data-testid=cell-1-1]').click() // Player 1
      cy.get('[data-testid=cell-0-2]').click() // Player 2
      cy.get('[data-testid=cell-2-2]').click() // Player 1 wins

      // Check win condition
      cy.get('[data-testid=game-status]').should('contain', 'Player 1 wins!')
    })
  })

  it('should handle invalid moves', () => {
    cy.get('[data-testid=create-game-btn]').click()
    cy.get('[data-testid=room-code]').then(($code) => {
      const roomCode = $code.text()

      cy.visit('http://localhost:5173')
      cy.get('[data-testid=join-game-input]').type(roomCode)
      cy.get('[data-testid=join-game-btn]').click()

      // Try to click an occupied cell
      cy.get('[data-testid=cell-0-0]').click()
      cy.get('[data-testid=cell-0-0]').click()
      cy.get('[data-testid=error-message]').should('be.visible')
    })
  })

  it('should handle disconnection and reconnection', () => {
    cy.get('[data-testid=create-game-btn]').click()
    cy.get('[data-testid=room-code]').then(($code) => {
      const roomCode = $code.text()

      // Simulate disconnection
      cy.window().then((win) => {
        win.location.reload()
      })

      // Reconnect with same room code
      cy.get('[data-testid=join-game-input]').type(roomCode)
      cy.get('[data-testid=join-game-btn]').click()
      cy.get('[data-testid=game-board]').should('be.visible')
      cy.get('[data-testid=game-status]').should('contain', 'Game resumed')
    })
  })
})