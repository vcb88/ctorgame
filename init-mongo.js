// Создаем пользователя для приложения
db = db.getSiblingDB('admin');
db.auth(process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD);

db = db.getSiblingDB('ctorgame');

// Создаем пользователя приложения в базе ctorgame
db.createUser({
    user: process.env.MONGO_APP_USER || 'ctorgame',
    pwd: process.env.MONGO_APP_PASSWORD || 'ctorgamepass',
    roles: [
        {
            role: 'readWrite',
            db: 'ctorgame'
        },
        {
            role: 'dbAdmin',
            db: 'ctorgame'
        }
    ]
});

// Даем права на аутентификацию из базы ctorgame
db.grantRolesToUser(
    process.env.MONGO_APP_USER || 'ctorgame',
    [{ role: 'userAdmin', db: 'ctorgame' }]
);

// Создаем основные коллекции с индексами
db.games.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 }) // TTL index - удаляем игры старше 24 часов
db.games.createIndex({ status: 1 }) // Индекс для поиска по статусу
db.players.createIndex({ lastActive: 1 }, { expireAfterSeconds: 3600 }) // TTL index для неактивных игроков
db.players.createIndex({ gameId: 1 }) // Индекс для поиска игроков по игре

// Устанавливаем совместимость версий
db.adminCommand({ setFeatureCompatibilityVersion: '6.0' })