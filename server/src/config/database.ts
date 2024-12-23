import { DataSource } from 'typeorm';
import { Game } from '../entities/Game';
import { Move } from '../entities/Move';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV === 'development', // Автоматическая синхронизация только в разработке
    logging: process.env.NODE_ENV === 'development',
    entities: [Game, Move],
    migrations: ['src/migrations/*.ts'],
    subscribers: [],
});