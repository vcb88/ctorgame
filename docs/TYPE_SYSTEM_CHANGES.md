# Изменения в системе типов

## Основные принципы

1. Простота
   - Использование простых типов вместо интерфейсов
   - Минимизация вложенности структур
   - Явное описание всех возможных значений

2. Типобезопасность
   - Использование union types для перечислений
   - Строгая типизация всех параметров
   - Явное указание опциональных полей

3. Удобство использования
   - Централизация констант
   - Интуитивно понятные имена
   - Группировка связанных типов

## Ключевые изменения

### Базовые типы

```typescript
// Было
interface IPosition {
    readonly x: number;
    readonly y: number;
}

interface IGameScores {
    readonly player1: number;
    readonly player2: number;
}

// Стало
type Position = [number, number];
type Scores = [number, number];
```

### Игровое состояние

```typescript
// Было
interface IGameState extends ITimestamped {
    readonly id: string;
    readonly board: ReadonlyArray<ReadonlyArray<number | null>>;
    readonly size: ISize;
    readonly currentPlayer: PlayerNumber;
    readonly status: GameStatus;
    readonly scores: IGameScores;
    readonly lastMove?: IGameMove;
}

// Стало
type GameState = {
    board: ReadonlyArray<ReadonlyArray<CellValue>>;
    currentPlayer: PlayerNumber;
    status: GameStatus;
    scores: Scores;
    lastMove?: GameMove;
    timestamp: number;
};
```

### События

```typescript
// Было
interface IGameMoveEvent extends IBaseEvent {
    readonly type: 'game_move';
    readonly data: {
        readonly move: IGameMove;
        readonly state: IGameState;
    };
}

// Стало
type GameMoveEvent = EventMeta & {
    type: 'game_move';
    data: {
        move: GameMove;
        state: GameState;
    };
};
```

### Метаданные игры

```typescript
// Единая структура метаданных игры
type GameMetadata = {
    gameId: UUID;
    code: string;
    status: GameStatus;
    startTime: string;
    lastActivityAt: string;
    expiresAt: string;
    players: Player[];
    boardSize: Size;
    totalTurns: number;
    endTime?: string;
    winner?: PlayerNumber;
    finalScore?: Scores;
    duration?: number;
    moves?: GameMove[];
    timing?: {
        moveTimes: number[];
        avgMoveTime: number;
    };
    territoryHistory?: Array<{ player1: number; player2: number }>;
};
```

## Преимущества новой системы

1. Упрощение кода:
   - Меньше файлов для поддержки
   - Проще отладка и тестирование
   - Лучше читаемость

2. Производительность:
   - Эффективнее сериализация
   - Меньше выделений памяти
   - Быстрее сравнение значений

3. Разработка:
   - Понятнее структура данных
   - Легче внесение изменений
   - Меньше ошибок типизации

## Совместимость

1. Серверная часть:
   - Все сервисы обновлены под новые типы
   - Сохранена обратная совместимость API
   - Поддерживаются старые форматы данных

2. Клиентская часть:
   - Требуется обновление типов
   - Необходимо обновить компоненты
   - Нужно адаптировать обработчики событий

## Дополнительная документация

- [Текущий статус рефакторинга](./CURRENT_REFACTORING_STATUS.md)
- [API документация](../API.md)
- [Примеры использования](../EXAMPLES.md)