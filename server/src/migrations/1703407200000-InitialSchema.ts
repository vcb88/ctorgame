import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1703407200000 implements MigrationInterface {
    name = 'InitialSchema1703407200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Создаем таблицу games
        await queryRunner.query(`
            CREATE TABLE "games" (
                "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "gameCode" VARCHAR(10) UNIQUE NOT NULL,
                "currentState" JSONB NOT NULL,
                "winner" INTEGER,
                "isCompleted" BOOLEAN NOT NULL DEFAULT false,
                "players" JSONB NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "completedAt" TIMESTAMP
            )
        `);

        // Создаем таблицу moves
        await queryRunner.query(`
            CREATE TABLE "moves" (
                "id" SERIAL PRIMARY KEY,
                "gameId" UUID NOT NULL,
                "playerNumber" INTEGER NOT NULL,
                "moveData" JSONB NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_moves_game" FOREIGN KEY ("gameId") 
                    REFERENCES "games"("id") ON DELETE CASCADE
            )
        `);

        // Создаем индексы
        await queryRunner.query(`
            CREATE INDEX "idx_games_gameCode" ON "games"("gameCode");
            CREATE INDEX "idx_moves_gameId" ON "moves"("gameId");
            CREATE INDEX "idx_moves_createdAt" ON "moves"("createdAt");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем индексы
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_moves_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_moves_gameId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_games_gameCode"`);

        // Удаляем таблицы
        await queryRunner.query(`DROP TABLE IF EXISTS "moves"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "games"`);
    }
}