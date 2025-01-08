import { cn } from '@/lib/utils';
import { BOARD_SIZE } from '@ctor-game/shared';

interface GameCellProps {
  row: number;
  col: number;
  value: number | null;
  disabled: boolean;
  onClick?: () => void;
}

export const GameCell: React.FC<GameCellProps> = ({
  row,
  col,
  value,
  disabled,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-sm transition-colors",
        "hover:bg-gray-300 cursor-pointer relative",
        {
          "bg-blue-500 text-white": value === 0,
          "bg-red-500 text-white": value === 1,
          "bg-gray-100": value === null,
          "cursor-not-allowed hover:bg-gray-100": disabled
        }
      )}
    >
      {/* Визуализация тороидальных границ */}
      <div className={cn(
        "absolute inset-0 pointer-events-none",
        {
          "border-t-2 border-purple-500": row === 0,
          "border-b-2 border-purple-500": row === BOARD_SIZE - 1,
          "border-l-2 border-purple-500": col === 0,
          "border-r-2 border-purple-500": col === BOARD_SIZE - 1
        }
      )}></div>

      {/* Визуализация соединений для тороидальной поверхности */}
      {row === 0 && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
      )}
      {row === BOARD_SIZE - 1 && (
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
      )}
      {col === 0 && (
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
      )}
      {col === BOARD_SIZE - 1 && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full"></div>
      )}
    </div>
  );
};