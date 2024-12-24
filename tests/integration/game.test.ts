import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { io as Client } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { 
  CreateGameResponse,
  JoinGameResponse,
  GameMoveResponse,
  PlayerDisconnectedEvent
} from '@/types/socket'

describe('Game Integration Tests', () => {
  let player1: Socket
  let player2: Socket

  beforeEach(() => {
    player1 = Client('http://localhost:3000')
    player2 = Client('http://localhost:3000')
  })

  afterEach(() => {
    player1.close()
    player2.close()
  })

  it('should create a game room', (done) => {
    player1.emit('createGame', {}, (response: CreateGameResponse) => {
      expect(response).toHaveProperty('roomCode')
      expect(response.roomCode).toMatch(/^[A-Z0-9]{6}$/)
      done()
    })
  })

  it('should join an existing game room', (done) => {
    player1.emit('createGame', {}, (createResponse: CreateGameResponse) => {
      const { roomCode } = createResponse

      player2.emit('joinGame', { roomCode }, (joinResponse: JoinGameResponse) => {
        expect(joinResponse).toHaveProperty('success', true)
        done()
      })
    })
  })

  it('should handle invalid game moves', (done) => {
    player1.emit('createGame', {}, (createResponse: CreateGameResponse) => {
      const { roomCode } = createResponse

      player2.emit('joinGame', { roomCode }, () => {
        player1.emit('makeMove', { row: -1, col: 0 }, (moveResponse: GameMoveResponse) => {
          expect(moveResponse).toHaveProperty('error')
          done()
        })
      })
    })
  })

  it('should detect win condition', (done) => {
    player1.emit('createGame', {}, (createResponse: CreateGameResponse) => {
      const { roomCode } = createResponse

      player2.emit('joinGame', { roomCode }, () => {
        // Player 1's moves to win (diagonal)
        player1.emit('makeMove', { row: 0, col: 0 })
        player2.emit('makeMove', { row: 0, col: 1 })
        player1.emit('makeMove', { row: 1, col: 1 })
        player2.emit('makeMove', { row: 0, col: 2 })
        
        player1.emit('makeMove', { row: 2, col: 2 }, (moveResponse: GameMoveResponse) => {
          expect(moveResponse).toHaveProperty('gameOver', true)
          expect(moveResponse).toHaveProperty('winner', 0) // Player 1 wins
          done()
        })
      })
    })
  })

  it('should handle player disconnection', (done) => {
    player1.emit('createGame', {}, (createResponse: CreateGameResponse) => {
      const { roomCode } = createResponse

      player2.emit('joinGame', { roomCode }, () => {
        player2.on('playerDisconnected', (data: PlayerDisconnectedEvent) => {
          expect(data).toHaveProperty('player', 0) // Player 1 disconnected
          done()
        })

        player1.disconnect()
      })
    })
  })
})