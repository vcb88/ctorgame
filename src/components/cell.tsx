import { P } from '@/types';

type CellProps = {
  x: number;
  y: number;
  v: number;
  s: number;
  sel?: { x: number; y: number } | null;
  map: boolean;
  onClick: () => void;
};

export const Cell = ({ x, y, v, s, sel, map, onClick }: CellProps) => (
<div
  className={`
    w-12 h-12 flex items-center justify-center
    cursor-pointer
    font-medium
    ${v === P.N ? 'bg-white' : v === P.A ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}
    ${sel?.x === x && sel?.y === y ? 'ring-1 ring-yellow-400' : ''}
    hover:opacity-90
    text-xs
    transition-colors duration-150
  `}
  onClick={onClick}
  style={{
    backgroundColor: v === P.N && map ? 
      `hsla(${(1-s)*240},100%,50%,${0.1+s*0.3})` : 
      undefined
  }}
>
  {v !== P.N ? 
    (v === P.A ? '1' : '2') : 
    (map ? s.toFixed(2) : '')}
</div>
);



