# Текущая архитектура проекта

## Основные сервисы

### GameService
Основной сервис для управления игровой логикой
- Зависимости:
  - GameStorageService
  - EventService
  - RedisService
- Основные методы:
  - createGame()
  - joinGame()
  - makeMove()
  - finishGame()

### GameLogicService
Сервис для обработки игровой логики
- Статические методы:
  - createInitialState()
  - isValidMove()
  - applyMove()

### EventService
Сервис для работы с событиями
- Зависимости:
  - RedisService
- Методы для создания событий:
  - createGameCreatedEvent()
  - createGameStartedEvent()
  - createGameMoveEvent()
  - createGameEndedEvent()
  - createPlayerConnectedEvent()
  - createPlayerDisconnectedEvent()
  - createErrorEvent()
- Методы для работы с событиями:
  - getEvent()
  - getGameEvents()
  - cleanupGameEvents()

### RedisService
Сервис для работы с Redis
- Методы:
  - connect()
  - disconnect()
  - setGameState()
  - getGameState()
  - expireGameState()
  - deleteGameState()
  - setWithExpiry()
  - addToList()
  - getList()

### GameStorageService
Сервис для работы с постоянным хранилищем
- Методы:
  - connect()
  - disconnect()
  - createGame()
  - joinGame()
  - recordMove()
  - finishGame()
  - markGameExpired()
  - findGameByCode()
  - getSavedGames()
  - getGameHistory()

### TTLStrategy
Сервис для управления временем жизни данных
- Методы:
  - calculateTTL()

### ErrorHandlingService
Сервис для обработки ошибок
- Методы:
  - handleError()
  - logError()
  - createErrorResponse()

## Основные интерфейсы

### Игровые типы
```typescript
interface IGameState {
  board: Board;
  scores: IGameScores;
  gameOver: boolean;
  winner: PlayerNumber | null;
}

interface IGameScores {
  player1: number;
  player2: number;
}

interface IGameMove {
  type: string;
  coordinates?: Coordinates;
}

enum PlayerNumber {
  ONE = 1,
  TWO = 2
}
```

### Типы хранения
```typescript
interface GameMetadata {
  id: string;
  code: string;
  status: GameStatus;
  players: {
    first: string | null;
    second: string | null;
  };
}

interface IGameHistory {
  id: string;
  moves: IGameMove[];
  winner: PlayerNumber | null;
  scores: IGameScores;
}
```

### Типы событий
```typescript
interface GameEvent {
  id: string;
  type: string;
  gameId: string;
  timestamp: number;
}

interface IGameCreatedEvent extends GameEvent {
  type: 'game_created';
  data: {
    gameId: string;
    status: GameStatus;
    createdAt: number;
  };
}

// ... много других типов событий
```

## WebSocket взаимодействие

### GameServer
Основной класс для WebSocket коммуникации
- Зависимости:
  - GameService
- Методы:
  - handleConnection()
  - handleDisconnection()
  - handleMessage()

## Проблемы текущей архитектуры

1. Избыточная сложность:
   - Много маленьких сервисов
   - Сложные взаимосвязи
   - Дублирование функциональности

2. Сложная система типов:
   - Много пересекающихся интерфейсов
   - Избыточная детализация
   - Сложная иерархия

3. Сложное хранение данных:
   - Два хранилища (Redis и MongoDB)
   - Сложная система TTL
   - Избыточное кеширование

4. Сложная обработка ошибок:
   - Отдельный сервис для ошибок
   - Много обертываний
   - Дублирование логики

5. Сложная система событий:
   - Отдельный сервис
   - Хранение в Redis
   - Сложная типизация