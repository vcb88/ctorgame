import { beforeAll, afterAll } from 'vitest'
import { createServer } from '../../server/src/server'
import { startDB, stopDB } from './utils/db'
import { startRedis, stopRedis } from './utils/redis'

let server: any

beforeAll(async () => {
  // Start dependencies
  await startDB()
  await startRedis()
  
  // Start server
  server = await createServer()
  await new Promise<void>((resolve) => {
    server.listen(3000, resolve)
  })
})

afterAll(async () => {
  // Stop server
  await new Promise<void>((resolve) => {
    server.close(resolve)
  })
  
  // Stop dependencies
  await stopDB()
  await stopRedis()
})