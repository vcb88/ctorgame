# REST API Documentation

## Overview

This document describes the REST API endpoints used in the CTORGame application for non-realtime operations.

## Base URL

```
Production: https://api.ctorgame.com
Development: http://localhost:3000
```

## API Versioning

All endpoints are prefixed with `/api/v1/`

## Authentication

The API uses Bearer token authentication for protected endpoints:

```bash
Authorization: Bearer <token>
```

## Endpoints

### Games

#### Create Game
```http
POST /api/v1/games

Response: 201 Created
{
  "gameId": "string",
  "gameCode": "string",
  "createdAt": "string"
}
```

#### Get Game
```http
GET /api/v1/games/{gameId}

Response: 200 OK
{
  "gameId": "string",
  "gameCode": "string",
  "state": {
    "board": number[][],
    "currentPlayer": 1 | 2,
    "opsRemaining": number,
    "status": "waiting" | "playing" | "finished",
    "lastMoveAt": number,
    "winner": 1 | 2 | null
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```

#### List Games
```http
GET /api/v1/games
Query Parameters:
  - status: "active" | "completed"
  - limit: number
  - offset: number

Response: 200 OK
{
  "games": [
    {
      "gameId": "string",
      "gameCode": "string",
      "status": "string",
      "createdAt": "string"
    }
  ],
  "total": number,
  "limit": number,
  "offset": number
}
```

#### Get Game History
```http
GET /api/v1/games/{gameId}/history

Response: 200 OK
{
  "moves": [
    {
      "player": number,
      "position": {
        "x": number,
        "y": number
      },
      "timestamp": "string"
    }
  ]
}
```

### Players

#### Get Player Stats
```http
GET /api/v1/players/{playerId}/stats

Response: 200 OK
{
  "playerId": "string",
  "gamesPlayed": number,
  "gamesWon": number,
  "gamesLost": number,
  "gamesDraw": number,
  "winRate": number
}
```

## Data Types

### Game State
```typescript
interface GameState {
  board: number[][];          // Game board state
  currentPlayer: 1 | 2;       // Current active player
  opsRemaining: number;       // Operations remaining in current turn
  status: GameStatus;         // Current game status
  lastMoveAt: number;         // Last activity timestamp
  winner?: 1 | 2 | null;      // Winner if game is finished
}

type GameStatus = 'waiting' | 'playing' | 'finished';
```

### Move History
```typescript
interface Move {
  player: 1 | 2;           // Player number
  position: {
    x: number;            // X coordinate (0-9)
    y: number;            // Y coordinate (0-9)
  };
  timestamp: number;       // Move timestamp in milliseconds
}
```

## Error Handling

### Error Response Format
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Example Error Response
```json
{
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game with ID 'ABC123' not found",
    "details": {
      "gameId": "ABC123"
    }
  }
}
```

## Rate Limiting

The API implements rate limiting based on IP address and/or API key:

```
Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Testing

### API Test Examples

```typescript
describe('Games API', () => {
  describe('POST /games', () => {
    it('creates a new game', async () => {
      const response = await request(app)
        .post('/api/v1/games')
        .expect(201);

      expect(response.body).toMatchObject({
        gameId: expect.any(String),
        gameCode: expect.any(String),
        createdAt: expect.any(String)
      });
    });
  });

  describe('GET /games/{gameId}', () => {
    it('retrieves game state', async () => {
      const response = await request(app)
        .get(`/api/v1/games/${gameId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        gameId: expect.any(String),
        state: {
          board: expect.any(Array),
          currentPlayer: expect.any(Number),
          opsRemaining: expect.any(Number),
          status: expect.stringMatching(/^(waiting|playing|finished)$/),
          lastMoveAt: expect.any(Number)
        }
      });
    });

    it('handles not found', async () => {
      await request(app)
        .get('/api/v1/games/nonexistent')
        .expect(404)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body.error.code).toBe('GAME_NOT_FOUND');
        });
    });
  });
});
```

## Integration with WebSocket

Some endpoints complement WebSocket functionality:

### Game State Sync
```typescript
// Client implementation
const syncGameState = async (gameId: string) => {
  try {
    const response = await fetch(`/api/v1/games/${gameId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const game = await response.json();
    
    if (game.state.lastMoveAt > currentState.lastMoveAt) {
      updateGameState(game.state);
    }
  } catch (error) {
    console.error('Failed to sync game state:', error);
    // Attempt WebSocket reconnection if HTTP sync fails
    socket.emit('reconnect', { gameId });
  }
};
```

### Reconnection Flow
```typescript
// Client implementation
const handleReconnect = async () => {
  try {
    // 1. Get current game state from REST API
    const gameState = await fetchGameState(gameId);
    
    // 2. Reconnect WebSocket
    socket.connect();
    
    // 3. Join game room
    socket.emit('joinGame', { gameId });
    
    // 4. Update UI with current state
    updateUI(gameState);
  } catch (error) {
    handleReconnectionError(error);
  }
};
```

## API Versioning Strategy

### Version Control
- Major versions in URL (/api/v1/, /api/v2/)
- Minor versions in Accept header
- Deprecation notices in response headers

### Backwards Compatibility
- Maintain support for previous version
- Deprecation period of 6 months
- Migration guides for breaking changes

## Security Considerations

### CORS Configuration
```typescript
// Server implementation
app.use(cors({
  origin: ['https://ctorgame.com', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
}));
```

### Input Validation
```typescript
// Validation middleware
const validateGameId = (req: Request, res: Response, next: NextFunction) => {
  const { gameId } = req.params;
  
  if (!/^[A-Z0-9]{6}$/.test(gameId)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_GAME_ID',
        message: 'Game ID must be 6 characters long'
      }
    });
  }
  
  next();
};
```

## Caching Strategy

### Cache Headers
```typescript
// Cache middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Public endpoints
  res.setHeader('Cache-Control', 'public, max-age=300');
  
  // Private endpoints
  if (req.path.startsWith('/api/v1/games')) {
    res.setHeader('Cache-Control', 'private, no-cache');
  }
  
  next();
});
```

## Performance Monitoring

### Response Times
```typescript
// Monitoring middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      path: req.path,
      method: req.method,
      duration,
      status: res.statusCode
    });
  });
  
  next();
});
```