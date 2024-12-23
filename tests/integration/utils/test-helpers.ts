import { Socket } from 'socket.io-client'

export function createGame(socket: Socket): Promise<string> {
  return new Promise((resolve) => {
    socket.emit('createGame', {}, (response: any) => {
      resolve(response.roomCode)
    })
  })
}

export function joinGame(socket: Socket, roomCode: string): Promise<boolean> {
  return new Promise((resolve) => {
    socket.emit('joinGame', { roomCode }, (response: any) => {
      resolve(response.success)
    })
  })
}

export function makeMove(socket: Socket, row: number, col: number): Promise<any> {
  return new Promise((resolve) => {
    socket.emit('makeMove', { row, col }, (response: any) => {
      resolve(response)
    })
  })
}

export function waitForEvent(socket: Socket, event: string): Promise<any> {
  return new Promise((resolve) => {
    socket.once(event, resolve)
  })
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function playFullGame(player1: Socket, player2: Socket): Promise<void> {
  const moves = [
    { player: player1, row: 0, col: 0 },
    { player: player2, row: 0, col: 1 },
    { player: player1, row: 1, col: 1 },
    { player: player2, row: 0, col: 2 },
    { player: player1, row: 2, col: 2 }
  ]

  for (const move of moves) {
    await makeMove(move.player, move.row, move.col)
    await delay(100) // Give time for state updates
  }
}

export function connectPlayers(): Promise<[Socket, Socket, string]> {
  return new Promise(async (resolve) => {
    const player1 = io('http://localhost:3000')
    const roomCode = await createGame(player1)
    
    const player2 = io('http://localhost:3000')
    await joinGame(player2, roomCode)
    
    resolve([player1, player2, roomCode])
  })
}