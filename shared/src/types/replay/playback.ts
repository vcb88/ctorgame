// Basic replay state interface
export interface IReplayState {
    currentMoveIndex: number;
    totalMoves: number;
    isPlaying: boolean;
    playbackSpeed: number;
    gameCode: string;
}

// Playback configuration interface
export interface IPlaybackConfig {
    initialSpeed: number;
    speedMultipliers: number[];
    autoPlay: boolean;
    loop: boolean;
}

// Playback control interface
export interface IPlaybackControls {
    play: () => void;
    pause: () => void;
    next: () => void;
    previous: () => void;
    setSpeed: (speed: number) => void;
    seekTo: (moveIndex: number) => void;
}
