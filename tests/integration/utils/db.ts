import { createConnection, getConnection } from 'typeorm'

export async function startDB() {
  await createConnection({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'ctorgame_test',
    synchronize: true,
    dropSchema: true,
    entities: ['server/src/entities/*.ts'],
  })
}

export async function stopDB() {
  const connection = getConnection()
  if (connection.isConnected) {
    await connection.close()
  }
}