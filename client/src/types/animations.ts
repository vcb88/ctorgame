import type { 
    Position, 
    PlayerNumber, 
    MoveType, 
    Timestamp 
} from '@ctor-game/shared/types/core.js';

/**
 * Animation types derived from game move types
 */
export type AnimationType = MoveType | 'capture';

/**
 * Core animation state type
 */
export type AnimationState = {
    type: AnimationType;
    startTime: Timestamp;
    duration: number;
    positions: Position[];
    data?: AnimationData;
};

/**
 * Animation metadata
 */
export type AnimationData = {
    previousValue?: PlayerNumber | null;
    newValue?: PlayerNumber | null;
    captureChain?: Position[];
};

/**
 * Cell-specific animation state
 */
export type CellAnimationState = {
    isAnimating: boolean;
    type?: AnimationType;
    startTime?: Timestamp;
    data?: AnimationData;
};