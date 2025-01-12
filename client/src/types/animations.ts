import { IPosition, Player } from '../shared';

export interface AnimationState {
  type: AnimationType;
  startTime: number;
  duration: number;
  positions: IPosition[];
  data?: AnimationData;
}

export enum AnimationType {
  CAPTURE = 'CAPTURE',
  PLACE = 'PLACE',
  REPLACE = 'REPLACE'
}

export interface AnimationData {
  previousValue?: Player | null;
  newValue?: Player | null;
  captureChain?: IPosition[];
}

export interface CellAnimationState {
  isAnimating: boolean;
  type?: AnimationType;
  startTime?: number;
  data?: AnimationData;
}