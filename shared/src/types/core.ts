// Basic numeric interfaces
export interface INumeric {
    readonly value: number;
}

// Basic coordinate interfaces
export interface IXCoordinate {
    readonly x: number;
}

export interface IYCoordinate {
    readonly y: number;
}

// Basic dimension interfaces
export interface IWidth {
    readonly width: number;
}

export interface IHeight {
    readonly height: number;
}

// Basic time interfaces
export interface ITimestamp {
    readonly timestamp: number;
}

export interface IExpiration {
    readonly expiresAt: number;
}

// Basic identification interfaces
export interface IIdentifiable {
    readonly id: string;
}

export interface IVersioned {
    readonly version: string;
}

// Basic state interfaces
export interface IValid {
    readonly valid: boolean;
}

export interface IActive {
    readonly active: boolean;
}

// Basic message interfaces
export interface IMessage {
    readonly message: string;
}

// Basic data interfaces
export interface IData<T> {
    readonly data: T;
}

// Basic collection interfaces
export interface ICollection<T> {
    readonly items: ReadonlyArray<T>;
}

// Basic player number interface
export interface IPlayerNumber {
    readonly playerNumber: number;
}

// Basic score interface
export interface IScore {
    readonly score: number;
}

// Basic operation interfaces
export interface IOperationType {
    readonly type: string;
}

export interface IOperationCount {
    readonly count: number;
}

// Basic cell interfaces
export interface ICell {
    readonly value: number | null;
}

// Basic error interfaces
export interface IErrorCode {
    readonly code: string;
}

export interface IErrorDetails {
    readonly details: Record<string, unknown>;
}

// Basic connection interfaces
export interface IConnectionStatus {
    readonly status: string;
}

// Basic phase interfaces
export interface IPhase {
    readonly phase: string;
}

// Basic game status interfaces
export interface IGameStatus {
    readonly status: string;
}

// Basic validation interfaces
export interface IValidationResult {
    readonly valid: boolean;
    readonly message?: string;
}
