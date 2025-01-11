// Switch to admin database
db = db.getSiblingDB('admin');

// Create application user in admin database
db.createUser({
    user: 'ctorgame',
    pwd: 'ctorgamepass',
    roles: [
        { role: 'readWrite', db: 'ctorgame' },
        { role: 'userAdmin', db: 'ctorgame' }
    ]
});

// Switch to application database
db = db.getSiblingDB('ctorgame');

db.createCollection('games');
db.createCollection('players');

db.games.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
db.games.createIndex({ status: 1 });
db.players.createIndex({ lastActive: 1 }, { expireAfterSeconds: 3600 });
db.players.createIndex({ gameId: 1 });