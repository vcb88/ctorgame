export enum Player {
    None = 0,
    First = 1,
    Second = 2
}

// Re-export needed enums
export { GamePhase } from '../base.js';

// WebSocket error codes
export enum WebSocketErrorCode {
    // Client errors (4xxx)
    InvalidGameCode = 4000,
    GameNotFound = 4001,
    GameFull = 4002,
    InvalidMove = 4003,
    NotYourTurn = 4004,
    InvalidOperation = 4005,
    InvalidState = 4006,
    PlayerNotFound = 4007,

    // Server errors (5xxx)
    InternalError = 5000,
    DatabaseError = 5001,
    ValidationError = 5002,
    StateError = 5003,
    NetworkError = 5004,
    
    // Generic errors
    Unknown = 9999
