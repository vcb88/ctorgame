print('Start MongoDB initialization...');

// Get authentication credentials from environment variables
const MONGO_ROOT_USER = process.env.MONGO_INITDB_ROOT_USERNAME || 'admin';
const MONGO_ROOT_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'adminpassword';
const MONGO_APP_USER = process.env.MONGO_APP_USER || 'ctorgame';
const MONGO_APP_PASSWORD = process.env.MONGO_APP_PASSWORD || 'ctorgamepass';

try {
    // Switch to admin database
    print('Switching to admin database...');
    db = db.getSiblingDB('admin');

    // Authenticate as root user
    print('Authenticating as root user...');
    db.auth(MONGO_ROOT_USER, MONGO_ROOT_PASSWORD);

    // Switch to application database
    print('Switching to application database...');
    db = db.getSiblingDB('ctorgame');

    // Drop existing user if exists
    print('Removing existing application user if any...');
    try {
        db.dropUser(MONGO_APP_USER);
    } catch (err) {
        print('No existing user found or error dropping user:', err.message);
    }

    // Create application user
    print('Creating application user...');
    db = db.getSiblingDB('admin');
    db.createUser({
        user: MONGO_APP_USER,
        pwd: MONGO_APP_PASSWORD,
        roles: [
            { role: 'readWrite', db: 'ctorgame' },
            { role: 'dbAdmin', db: 'ctorgame' },
            { role: 'userAdmin', db: 'ctorgame' }
        ]
    });
    
    db = db.getSiblingDB('ctorgame');

    // Create collections explicitly
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
            name: 'ttl_games_cleanup'
        }
    );

    db.games.createIndex(
        { status: 1 },
        {
            background: true,
            name: 'games_status_lookup'
        }
    );

    db.players.createIndex(
        { lastActive: 1 },
        {
            expireAfterSeconds: 3600,
            background: true,
            name: 'ttl_players_cleanup'
        }
    );

    db.players.createIndex(
        { gameId: 1 },
        {
            background: true,
            name: 'players_game_lookup'
        }
    );

    // Set feature compatibility version
    print('Setting feature compatibility version...');
    db.adminCommand({ setFeatureCompatibilityVersion: '6.0' });

    print('MongoDB initialization completed successfully.');
} catch (err) {
    print('Error during MongoDB initialization:');
    print(err);
    throw err;
}