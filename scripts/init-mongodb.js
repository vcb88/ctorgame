// MongoDB initialization script

// Switch to game database
db = db.getSiblingDB('ctorgame');

// Create games collection with schema validation
db.createCollection('games', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['gameId', 'code', 'status', 'startTime', 'lastActivityAt', 'expiresAt'],
            properties: {
                gameId: {
                    bsonType: 'string',
                    description: 'Unique game identifier'
                },
                code: {
                    bsonType: 'string',
                    pattern: '^[0-9]{4}$',
                    description: '4-digit connection code'
                },
                status: {
                    enum: ['waiting', 'playing', 'finished'],
                    description: 'Current game status'
                },
                startTime: {
                    bsonType: 'string',
                    description: 'Game start time in ISO format'
                },
                endTime: {
                    bsonType: 'string',
                    description: 'Game end time in ISO format'
                },
                duration: {
                    bsonType: 'number',
                    description: 'Game duration in seconds'
                },
                lastActivityAt: {
                    bsonType: 'string',
                    description: 'Last activity timestamp in ISO format'
                },
                expiresAt: {
                    bsonType: 'string',
                    description: 'Expiration timestamp in ISO format'
                },
                players: {
                    bsonType: 'object',
                    properties: {
                        first: {
                            bsonType: ['string', 'null'],
                            description: 'First player ID'
                        },
                        second: {
                            bsonType: ['string', 'null'],
                            description: 'Second player ID'
                        }
                    }
                },
                winner: {
                    bsonType: ['int', 'null'],
                    enum: [null, 1, 2],
                    description: 'Winner player number'
                },
                finalScore: {
                    bsonType: 'object',
                    properties: {
                        '1': {
                            bsonType: 'int',
                            description: 'First player score'
                        },
                        '2': {
                            bsonType: 'int',
                            description: 'Second player score'
                        }
                    }
                },
                totalTurns: {
                    bsonType: 'int',
                    description: 'Total number of turns'
                },
                boardSize: {
                    bsonType: 'object',
                    required: ['width', 'height'],
                    properties: {
                        width: {
                            bsonType: 'int',
                            minimum: 1
                        },
                        height: {
                            bsonType: 'int',
                            minimum: 1
                        }
                    }
                }
            }
        }
    }
});

// Create metrics collection
db.createCollection('metrics');

// Create indexes for games collection
db.games.createIndex({ "gameId": 1 }, { unique: true });
db.games.createIndex({ "code": 1 }, { unique: true });
db.games.createIndex({ "status": 1 });
db.games.createIndex({ "lastActivityAt": 1 });
db.games.createIndex({ "expiresAt": 1 });
db.games.createIndex({ 
    "status": 1, 
    "lastActivityAt": 1 
});

// Create indexes for metrics collection
db.metrics.createIndex({ "gameId": 1 });
db.metrics.createIndex({ "timestamp": -1 });

// Create admin user if doesn't exist
if (!db.getUser("admin")) {
    db.createUser({
        user: "admin",
        pwd: "changeme",  // Change this in production!
        roles: [
            { role: "readWrite", db: "ctorgame" },
            { role: "dbAdmin", db: "ctorgame" }
        ]
    });
}

// Insert test game for verification
db.games.insertOne({
    gameId: "test-game-1",
    code: "1234",
    status: "waiting",
    startTime: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30*60*1000).toISOString(),
    players: {
        first: null,
        second: null
    },
    boardSize: {
        width: 10,
        height: 10
    },
    totalTurns: 0
});