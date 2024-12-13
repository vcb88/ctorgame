import { Board, P, GRID_WIDTH, GRID_HEIGHT } from '@/types';
// import { n } from '@/utils/board';

export type PositionStrength = {
  pieces: number;
  territory: number;
  influence: number;
  groupsStrength: number;
  total: number;
};


export const analyzePosition = (board: Board, player: number): PositionStrength => {
  const pieces = board.flat().filter(c => c === player).length;
  let territory = 0;
  let influence = 0;
  let groupsStrength = 0;
  const influenceMap = Array(10).fill(0).map(() => Array(10).fill(0));
  
  // Вспомогательная функция для корректного обхода соседей на торе
  const forEachNeighbor = (x: number, y: number, radius: number, callback: (nx: number, ny: number, dist: number) => void) => {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const dist = Math.abs(dx) + Math.abs(dy);
        if (dist <= radius) {
          const nx = n(x + dx);
          const ny = n(y + dy);
          callback(nx, ny, dist);
        }
      }
    }
  };

  // Для каждой фишки на доске
  for (let x = 0; x < S; x++) {
    for (let y = 0; y < S; y++) {
      if (board[x][y] === player) {
        // Считаем прямой контроль (соседние клетки)
        forEachNeighbor(x, y, 1, (nx, ny) => {
          if (board[nx][ny] === P.N) {
            territory++;
          }
        });

        // Распространяем влияние
        forEachNeighbor(x, y, 2, (nx, ny, dist) => {
          const power = dist === 1 ? 2 : 1;
          influenceMap[nx][ny] += power;
        });

        // Оцениваем силу групп
        let groupSize = 0;
        let groupEmptyAround = 0;
        forEachNeighbor(x, y, 1, (nx, ny) => {
          if (board[nx][ny] === player) {
            groupSize++;
          } else if (board[nx][ny] === P.N) {
            groupEmptyAround++;
          }
        });

        if (groupSize > 0) {
          groupsStrength += groupSize * 10 + groupEmptyAround * 2;
        }
      }
    }
  }

  // Считаем влияние оппонента и вычитаем из нашего
  const opponent = player === P.A ? P.B : P.A;
  for (let x = 0; x < GRID_WIDTH; x++) {
    for (let y = 0; y < GRID_HEIGHT; y++) {
      if (board[x][y] === opponent) {
        forEachNeighbor(x, y, 2, (nx, ny, dist) => {
          const power = dist === 1 ? 2 : 1;
          influenceMap[nx][ny] -= power;
        });
      }
    }
  }

  // Подсчитываем общее положительное влияние
  influence = influenceMap.flat().reduce((sum, val) => sum + (val > 0 ? val : 0), 0);

  // Нормализация значений с учетом размера доски
  const maxTerritory = GRID_HEIGHT * GRID_WIDTH;
  const maxInfluence = GRID_HEIGHT * GRID_WIDTH * 4; // максимальное возможное влияние (4 - максимальный вес влияния)
  const normalizedTerritory = (territory / maxTerritory) * 100;
  const normalizedInfluence = (influence / maxInfluence) * 100;
  const normalizedGroupsStrength = groupsStrength / (pieces > 0 ? pieces : 1);

  const total = 
    pieces * 10 + 
    normalizedTerritory * 0.5 + 
    normalizedInfluence * 0.3 + 
    normalizedGroupsStrength * 0.2;

  return {
    pieces,
    territory: Math.round(normalizedTerritory),
    influence: Math.round(normalizedInfluence),
    groupsStrength: Math.round(normalizedGroupsStrength),
    total: Math.round(total)
  };
};
