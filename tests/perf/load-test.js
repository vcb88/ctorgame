import { check } from 'k6'
import { io } from 'k6/ws'

export let options = {
  stages: [
    { duration: '30s', target: 50 },  // Рост до 50 пользователей за 30 секунд
    { duration: '1m', target: 50 },   // Поддержание 50 пользователей в течение 1 минуты
    { duration: '30s', target: 100 }, // Рост до 100 пользователей за 30 секунд
    { duration: '1m', target: 100 },  // Поддержание 100 пользователей в течение 1 минуты
    { duration: '30s', target: 0 },   // Плавное снижение до 0 за 30 секунд
  ],
  thresholds: {
    'ws_connecting_duration': ['p(95)<1000'], // 95% подключений должны происходить быстрее 1 секунды
    'ws_disconnects': ['count<10'],           // Меньше 10 разрывов соединения
    'ws_session_duration': ['p(95)>30000'],   // 95% сессий должны длиться более 30 секунд
  },
}

export default function () {
  const url = 'ws://localhost:3000'
  
  // Создаем игру
  const player1 = io(url)
  check(player1, {
    'connected player1': (socket) => socket !== null,
  })

  player1.emit('createGame', {}, (response) => {
    check(response, {
      'has roomCode': (r) => r.roomCode !== undefined,
      'roomCode format': (r) => /^[A-Z0-9]{6}$/.test(r.roomCode),
    })

    const roomCode = response.roomCode

    // Подключаем второго игрока
    const player2 = io(url)
    check(player2, {
      'connected player2': (socket) => socket !== null,
    })

    player2.emit('joinGame', { roomCode }, (response) => {
      check(response, {
        'join successful': (r) => r.success === true,
      })

      // Делаем несколько ходов
      player1.emit('makeMove', { row: 0, col: 0 })
      player2.emit('makeMove', { row: 0, col: 1 })
      player1.emit('makeMove', { row: 1, col: 1 })
      player2.emit('makeMove', { row: 0, col: 2 })
      player1.emit('makeMove', { row: 2, col: 2 })

      // Проверяем состояние игры
      check(player1, {
        'game completed': (socket) => socket.gameState.gameOver === true,
        'correct winner': (socket) => socket.gameState.winner === 0,
      })
    })
  })
}