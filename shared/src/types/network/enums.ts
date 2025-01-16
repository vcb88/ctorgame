/**
 * Network related enumerations
 */

export enum NetworkEventTypeEnum {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    MESSAGE = 'message',
    ERROR = 'error'
}

export enum NetworkStatusEnum {
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    ERROR = 'error'
}

export enum NetworkProtocolEnum {
    WS = 'ws',
    WSS = 'wss',
    HTTP = 'http',
    HTTPS = 'https'
}