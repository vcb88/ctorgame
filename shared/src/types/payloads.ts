

// Basic payload types
export interface BasicPosition {
    x: number;
    y: number;
}

export interface BasicMove {
    type: 'place' | 'replace';
    position: BasicPosition;
}
