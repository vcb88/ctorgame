# План упрощения системы типов

## Текущие проблемы с типами

1. Избыточное количество мелких типов и интерфейсов
2. Излишняя абстракция для простых значений
3. Сложная иерархия наследования
4. Дублирование типов с небольшими различиями

## Анализ и группировка типов по категориям

### Координаты и размеры
Текущие типы:
```typescript
interface IXCoordinate {
    x: number;
}

interface IYCoordinate {
    y: number;
}

interface IPosition extends IXCoordinate, IYCoordinate {}

interface IPositionBase {
    position: IPosition;
}

interface IWidth {
    width: number;
}

interface IHeight {
    height: number;
}

interface IBoardSize extends IWidth, IHeight {}

interface IBoardSizeBase {
    size: IBoardSize;
}
```

Упрощение:
```typescript
// Заменяем все эти интерфейсы на:
type Position = [number, number]; // [x, y]
type Size = [number, number];     // [width, height]
```

### Игроки и идентификаторы
Текущие типы:
```typescript
interface IPlayer {
    id: string;
    number: PlayerNumber;
}

interface IPlayerBase {
    player: IPlayer;
}

type PlayerNumber = 1 | 2;

interface IPlayerId {
    playerId: string;
}
```

Упрощение:
```typescript
type PlayerNumber = 1 | 2;
type Player = {
    id: string;
    num: PlayerNumber;
};
```

### Счет и статистика
Текущие типы:
```typescript
interface IScore {
    value: number;
}

interface IScoreBase {
    score: IScore;
}

interface IGameScores {
    player1: number;
    player2: number;
}
```

Упрощение:
```typescript
type Scores = [number, number]; // [player1Score, player2Score]
```

### Действия и ходы
Текущие типы:
```typescript
interface IGameMove {
    type: string;
    coordinates?: IPosition;
}

interface IGameMoveBase {
    move: IGameMove;
}

interface IActionType {
    type: string;
}
```

Упрощение:
```typescript
type GameMove = {
    type: 'place' | 'remove' | 'skip';
    pos?: Position;  // используем тип Position = [number, number]
};
```

## План замены

1. Базовые типы (срочные изменения):
```typescript
// shared/src/types/primitives.ts
export type Position = [number, number];
export type Size = [number, number];
export type PlayerNumber = 1 | 2;
export type Scores = [number, number];

export type Player = {
    id: string;
    num: PlayerNumber;
};

export type GameMove = {
    type: 'place' | 'remove' | 'skip';
    pos?: Position;
};

export type GameState = {
    board: number[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    winner?: PlayerNumber;
};
```

2. Обновление основных интерфейсов для использования новых типов:
```typescript
// Было
interface IGameState {
    board: IBoard;
    scores: IGameScores;
    currentPlayer: IPlayer;
    gameOver: boolean;
    winner: IPlayer | null;
}

// Станет
type GameState = {
    board: number[][];
    scores: Scores;
    currentPlayer: PlayerNumber;
    status: 'active' | 'finished';
    winner?: PlayerNumber;
};
```

## Порядок изменений

1. Создать новый файл с базовыми типами
2. Постепенно заменять старые типы на новые:
   - Начать с самых базовых (Position, Size)
   - Затем заменить типы игроков и счета
   - Наконец, обновить более сложные структуры

3. Порядок замены по модулям:
   - shared/types
   - server/types
   - client/types
   - тесты

## Преимущества упрощения

1. Упрощение кода:
   ```typescript
   // Было
   function makeMove(move: IGameMoveBase, player: IPlayerBase): void {
       const pos = move.move.coordinates;
       const playerNum = player.player.number;
   }

   // Станет
   function makeMove(move: GameMove, playerNum: PlayerNumber): void {
       const pos = move.pos;
   }
   ```

2. Улучшение производительности:
   - Меньше выделений памяти
   - Проще сериализация/десериализация
   - Меньше проверок типов

3. Упрощение разработки:
   - Понятнее структура данных
   - Меньше файлов для поддержки
   - Проще отладка

## Риски и их митигация

1. Риск: нарушение существующего кода
   - Митигация: поэтапная замена
   - Тщательное тестирование каждого изменения

2. Риск: потеря типобезопасности
   - Митигация: использование union types
   - Добавление runtime проверок где необходимо

3. Риск: нарушение обратной совместимости API
   - Митигация: временное сохранение старых интерфейсов
   - Постепенный переход на новые типы

## Последующие шаги

1. После замены типов:
   - Обновить документацию
   - Обновить тесты
   - Проверить производительность
   - Упростить валидацию

2. Рефакторинг кода:
   - Упростить функции, работающие с новыми типами
   - Удалить неиспользуемый код
   - Обновить обработку ошибок

## Метрики успеха

1. Количественные:
   - Уменьшение количества типов на 70%
   - Уменьшение размера типов на 50%
   - Уменьшение вложенности типов на 60%

2. Качественные:
   - Улучшение читаемости кода
   - Упрощение разработки новых функций
   - Ускорение компиляции