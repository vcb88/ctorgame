print('Start MongoDB initialization script...');

// Constants for user creation
const APP_USER = 'ctorgame';
const APP_PASSWORD = 'ctorgamepass';
const APP_DB = 'ctorgame';

try {
    // Switch to admin database first
    print('Switching to admin database...');
    db = db.getSiblingDB('admin');

    // Create admin user if doesn't exist
    print('Creating admin users...');
    
    // Root admin user (full access)
    db.createUser({
        user: APP_USER,
        pwd: APP_PASSWORD,
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" },
            { role: "dbAdminAnyDatabase", db: "admin" }
        ]
    });

    // Create same user in admin db for fallback
    db.createUser({
        user: APP_USER + '_admin',
        pwd: APP_PASSWORD,
        roles: [
            { role: "userAdmin", db: "admin" },
            { role: "dbAdmin", db: "admin" },
            { role: "readWrite", db: "admin" }
        ]
    });

    // Switch to application database
    print('Switching to application database: ' + APP_DB);
    db = db.getSiblingDB(APP_DB);

    // Create application database user
    print('Creating application database user...');
    db.createUser({
        user: APP_USER,
        pwd: APP_PASSWORD,
        roles: [
            { role: "readWrite", db: APP_DB },
            { role: "dbAdmin", db: APP_DB }
        ]
    });

    // Initialize collections
    print('Creating collections...');
    db.createCollection('games');
    db.createCollection('players');

    // Create indexes
    print('Creating indexes...');
    db.games.createIndex(
        { createdAt: 1 },
        {
            expireAfterSeconds: 86400,
            background: true,
            name: "ttl_games_cleanup"
        }
    );
    
    db.games.createIndex(
        { status: 1 },
        {
            background: true,
            name: "games_status_lookup"
        }
    );
    
    db.players.createIndex(
        { lastActive: 1 },
        {
            expireAfterSeconds: 3600,
            background: true,
            name: "ttl_players_cleanup"
        }
    );
    
    db.players.createIndex(
        { gameId: 1 },
        {
            background: true,
            name: "players_game_lookup"
        }
    );

    // Verify setup
    print('Verifying database setup...');
    const collections = db.getCollectionNames();
    print('Collections created: ' + collections.join(', '));
    
    const indexes = {
        games: db.games.getIndexes(),
        players: db.players.getIndexes()
    };
    print('Indexes created for games: ' + indexes.games.length);
    print('Indexes created for players: ' + indexes.players.length);

    print('MongoDB initialization completed successfully!');

} catch (error) {
    print('Error during MongoDB initialization:');
    print(error);
    throw error;
}