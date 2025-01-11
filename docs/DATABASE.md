# Database Configuration Guide

## Overview

The project uses MongoDB for persistent data storage along with Redis for caching and real-time features. This guide focuses on the MongoDB configuration.

> **MVP Note**: For rapid development during the MVP phase, authentication is currently disabled in MongoDB. This will be re-enabled with proper security measures before production deployment.

## MongoDB Configuration

### Basic Setup

The application uses a simple and standard MongoDB configuration:

```yaml
# docker-compose.yml
mongodb:
  image: mongo:6-jammy
  ports:
    - "27017:27017"
  environment:
    - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER:-admin}
    - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD:-adminpassword}
  volumes:
    - mongodb_data:/data/db
    - ./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro
```

### Database Initialization

The database is automatically initialized using the `init-mongo.js` script:

```javascript
// Create application user
db.createUser({
    user: 'ctorgame',
    pwd: 'ctorgamepass',
    roles: [
        { role: 'readWrite', db: 'ctorgame' }
    ]
});

// Switch to application database
db = db.getSiblingDB('ctorgame');

// Create collections
db.createCollection('games');
db.createCollection('players');

// Create indexes
db.games.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });  // TTL index for cleanup
db.games.createIndex({ status: 1 });  // For status queries
db.players.createIndex({ lastActive: 1 }, { expireAfterSeconds: 3600 });  // TTL for inactive players
db.players.createIndex({ gameId: 1 });  // For player lookups by game
```

### Connection Details (MVP)

- **Database Name**: ctorgame
- **Host**: mongodb:27017 (in Docker network)
- **Authentication**: Disabled for MVP phase
- **Connection String**:
  ```
  mongodb://mongodb:27017/ctorgame
  ```

### Environment Variables

The following environment variables are used for MongoDB configuration:

```bash
# MongoDB configuration
MONGO_ROOT_USER=admin              # MongoDB root username
MONGO_ROOT_PASSWORD=adminpassword  # MongoDB root password
MONGO_APP_USER=ctorgame           # Application username
MONGO_APP_PASSWORD=ctorgamepass   # Application password
MONGODB_URL=mongodb://ctorgame:ctorgamepass@mongodb:27017/ctorgame?authSource=admin
```

### Data Model

#### Games Collection
```typescript
interface Game {
    _id: ObjectId;            // MongoDB's internal identifier
    gameId: string;          // Game identifier (shared between MongoDB and Redis)
    code: string;            // 4-digit connection code
    createdAt: Date;         // Game creation timestamp
    status: GameStatus;      // Current game status
    players: {
        first: string;       // First player's connection ID
        second?: string;     // Second player's connection ID (optional)
    };
    expiresAt: Date;        // Game expiration timestamp
    lastActivityAt: Date;    // Last activity timestamp
    boardSize: {
        width: number;
        height: number;
    };
    totalTurns: number;     // Total number of turns made
    winner?: Player;        // Winner (if game is finished)
    finalScore?: {
        [Player.First]: number;
        [Player.Second]: number;
    };
}

enum GameStatus {
    WAITING = 'waiting',    // Waiting for second player
    PLAYING = 'playing',    // Game in progress
    FINISHED = 'finished'   // Game completed
}
```

#### Players Collection
```typescript
interface Player {
    _id: ObjectId;           // Unique player identifier
    gameId: ObjectId;        // Reference to current game
    lastActive: Date;        // Last activity timestamp
    status: PlayerStatus;    // Current player status
}

enum PlayerStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    DISCONNECTED = 'disconnected'
}
```

### Data Cleanup

The database includes automatic cleanup mechanisms:
- Games are automatically deleted after 24 hours (TTL index)
- Player records are removed after 1 hour of inactivity (TTL index)
- Indexes ensure efficient queries and data access

### Health Monitoring

The application includes MongoDB health checks:
```yaml
healthcheck:
  test: mongosh --eval 'db.runCommand("ping").ok' localhost:27017/test --quiet
  interval: 5s
  timeout: 5s
  retries: 5
  start_period: 10s
```

## Troubleshooting

### Common Issues

1. Connection Refused
   ```
   MongoServerSelectionError: connect ECONNREFUSED
   ```
   Solution: Ensure MongoDB container is running and healthy:
   ```bash
   docker-compose ps
   docker-compose logs mongodb
   ```

2. Authentication Failed
   ```
   MongoServerError: Authentication failed
   ```
   Solution: Verify credentials in .env file match init-mongo.js

3. Database Not Initialized
   ```
   MongoServerError: not authorized on database
   ```
   Solution: Check init-mongo.js execution:
   ```bash
   docker-compose logs mongodb | grep "MongoDB initialization"
   ```

### Maintenance Commands

1. View MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

2. Connect to MongoDB shell:
   ```bash
   docker-compose exec mongodb mongosh -u admin -p adminpassword
   ```

3. Reset MongoDB data:
   ```bash
   docker-compose down -v  # Removes volumes
   docker-compose up -d   # Recreates containers and volumes
   ```